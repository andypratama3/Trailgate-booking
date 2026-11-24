# ADR-003 — Kuota: tabel `quota_slots` + transaksi atomik, Redis hanya pelengkap

> **Status:** accepted · **Tanggal:** 2026-11-24 · **Owner:** tg-architect
> **Keputusan inti PRD:** §0 **D5** · **Rujukan:** PRD §2.3, §6.4, §7.1, §8, §10.2, §10.3, §11 · **FR:** FR-05, FR-06, FR-07, FR-27
> **Ditetapkan oleh:** T-005 (`docs/board/tasks/T-005.yml`)

## Konteks

D5: "Engine kuota + penutupan jalur (closure) adalah jantung produk." Riset domain (§2.3) mencatat kuota
yang **tegas** (300/550/200 per hari), lonjakan pada saat pembukaan (mis. 08.00 WITA), dan penutupan jalur
sebagai kejadian normal — bukan edge case. PRD §8 menetapkan target keras: **0 overbooking**, tahan 300
permintaan booking/detik selama 10 menit [ASUMSI, kalibrasi pilot].

PRD §10.3 sudah menuliskan bentuk implementasinya, termasuk invarian
`reserved + sold <= effective_capacity`, dan menutup dengan: "Redis hanya untuk antrean/rate limit/lock
tambahan; **sumber kebenaran tetap MySQL**." `AGENTS.md` aturan 5 menegaskan semua tulis kuota lewat
service `ReserveSlot`. Data kuota ada di MySQL 8.4 (`docker-compose.yml`), Redis 7 untuk queue/cache/lock.

Saat ADR ini ditulis belum ada tabel atau kode kuota; ADR ini mengikat T-121/T-122 dkk. (§17 PRD).

## Keputusan

1. **Tabel `quota_slots` tenant-scoped** mengikuti ADR-001: `tenant_id` **NOT NULL** (FK →
   `tenants.id`) + indeks komposit **`(tenant_id, route_id, date)`**, plus kolom `route_id`, `date`,
   `capacity`, `reserved`, `sold`, `version` (PRD §10.2). **Keunikan tetap `UNIQUE(route_id, date)`**
   sesuai PRD §10.3 secara literal — **bukan** `UNIQUE(tenant_id, route_id, date)`. Ini tidak bocor dan
   tidak menciptakan kolisi: `routes.id` adalah kunci global (satu tabel `routes` melayani semua tenant,
   ADR-001), jadi dua tenant tidak mungkin berbagi `route_id`, dan keunikan yang lebih rendah tidak
   menyatukan baris milik tenant berbeda. Satu baris = satu jalur × satu tanggal, dalam zona waktu jalur
   (`routes.timezone`, PRD §8).
2. **Semua penambahan kuota lewat satu service `ReserveSlot`** (`AGENTS.md` aturan 5) yang menjalankan
   **conditional UPDATE di dalam transaksi**:

   ```sql
   UPDATE quota_slots
      SET reserved = reserved + :n, version = version + 1
    WHERE tenant_id = :t AND route_id = :r AND date = :d
      AND reserved + sold + :n <= :effective_capacity;   -- affected_rows = 1 atau gagal
   ```

   `affected_rows = 0` → **gagal transaksional** (bukan retry-forever, bukan overbooking). Invarian
   `reserved + sold <= effective_capacity` dijaga oleh predikat SQL, bukan oleh kode aplikasi.
3. **`effective_capacity` dihitung di service, bukan di klien**: `closure aktif ? 0 : capacity`
   (PRD §10.3). Nilai ini dihitung saat penulisan, dengan closure dibaca dalam transaksi yang sama agar
   penutupan jalur langsung menghentikan penjualan.
4. **Siklus hidup slot**:
   - Hold: `reserved += n` dengan TTL 15 menit (PRD §6.4); job terjadwal melepasnya (`reserved -= n`) dan
     memindahkan booking ke `Expired` (§7.1).
   - Pembayaran sukses: `reserved → sold` **dalam satu transaksi** (idempoten, ADR-002).
   - Edit kapasitas oleh admin tidak menimpa `reserved`/`sold` (FR-05 AC-05.1).
5. **Redis hanya pelengkap**: antrean waiting-room, rate limit, dan lock tambahan (FR-27). Redis **tidak
   pernah** menjadi penyimpan angka kuota, dan kehilangan Redis tidak boleh membuat kuota salah.
6. **Semua endpoint tulis menerima `Idempotency-Key`** (PRD §10.3), dan `bookings.idempotency_key` unik
   (§10.2) — retry jaringan dari klien tidak boleh mengurangi/menambah kuota dua kali.
7. **Tes konkurensi wajib**: 500 request paralel ke slot kapasitas 10 → **tepat 10 sukses**
   (PRD §10.3, FR-05 AC-05.3, `php artisan test --filter=QuotaConcurrency`). Tanpa tes ini, gate P1 (DoD
   §18.3 "Kuota/booking: tes konkurensi lulus; invarian dibuktikan") tidak boleh lulus.
8. `version` dipakai untuk deteksi perubahan optimistik pada konsol kuota; bukan pengganti predikat butir 2.

## Alternatif yang ditolak

1. **Counter di Redis sebagai sumber kebenaran** (`DECR`/`INCR` + script Lua).
   Ditolak: tidak tahan proses restart/eviksi, tidak mendukung RPO ≤ 15 menit (PRD §8) tanpa dual-write,
   dan melanggar §10.3 ("sumber kebenaran tetap MySQL"). Dual-write MySQL+Redis justru menciptakan kelas
   bug baru (divergensi dua toko).
2. **Read-check-write di aplikasi** (`select` sisa slot → `if (sisa >= n) update`).
   Ditolak: race klasik → overbooking persis pada lonjakan pembukaan kuota yang menjadi target beban uji.
3. **`SELECT ... FOR UPDATE` pada baris slot lalu hitung di PHP, tanpa predikat kapasitas di `WHERE`.**
   Ditolak sebagai bentuk utama: benar secara locking, tetapi menambah lock-wait pada jalur paling panas
   dan memindahkan invarian dari DB ke kode. Predikat pada `UPDATE` memberi jaminan yang sama dengan
   jejak lock lebih pendek.
4. **Satu baris `settings` JSON per jalur berisi peta tanggal→kapasitas.**
   Ditolak: tidak ada baris yang bisa di-update secara atomik per tanggal, dan tidak mendukung
   `UNIQUE(route_id, date)` yang diminta §10.2.
5. **Antrean serialisasi (single worker / advisory lock global) untuk semua penulisan kuota.**
   Ditolak sebagai mekanisme kebenaran: throughput 300 booking/detik (PRD §8) tidak boleh bergantung pada
   satu jalur serial; antrean tetap dipakai tetapi hanya sebagai **perlindungan lonjakan** (FR-27), bukan
   sebagai penjamin invarian.
6. **Memisahkan closure ke jalur sendiri yang tidak atomik dengan penulisan kuota.**
   Ditolak: closure yang diset bersamaan dengan hold dapat menjual slot yang seharusnya 0; `effective_capacity`
   wajib dibaca dalam transaksi tulis.
7. **Tanpa `Idempotency-Key` (mengandalkan kode booking unik saja).**
   Ditolak: retry setelah timeout akan menahan dua kali; §10.3 mewajibkan idempotency key.

## Konsekuensi

- Tabel kuota adalah jalur paling panas aplikasi: index unik `(route_id, date)` menjadi anchor konkurensi,
  dan setiap perubahan skema tabel ini memerlukan perhatian khusus (migrasi boleh naik-turun, PRD §18.2).
- Semua konsumen (booking, reschedule, closure, konsol, laporan) **wajib** lewat `ReserveSlot`; query
  langsung `UPDATE quota_slots` dari tempat lain adalah temuan P0 (aturan 5 `AGENTS.md`).
- Closure menuntut pembacaan closure + penulisan kuota dalam satu transaksi → service closure, quota, dan
  booking berbagi transaksi; ini mengikat bentuk modul `app/Domain/**` (tg-backend).
- Beban uji: tes konkurensi butuh database nyata (MySQL), bukan SQLite in-memory.
- Lock-wait/deadlock tetap mungkin saat dua jalur berbeda disentuh dalam satu transaksi (mis. booking
  multi-jalur); urutan lock harus konsisten (route_id, date menaik) — dicatat sebagai aturan implementasi.
- Operasi admin kuota (edit `capacity`) harus menolak nilai di bawah `reserved + sold` yang sedang berjalan
  atau memberi jalur koreksi eksplisit; menurunkannya diam-diam akan melanggar invarian.
- Redis boleh dimatikan tanpa kehilangan kebenaran (antrean/rate limit turun ke mode aman), sesuai D7.

## Pemetaan keputusan inti PRD §0

| Keputusan | Relasi |
|---|---|
| **D5** | **Implementasi utama**: engine kuota sebagai inti produk; invarian keras dijaga di MySQL, closure memengaruhi `effective_capacity`. |
| D1 | Prasyarat: `quota_slots` tenant-scoped lewat `tenant_id` + global scope; kuota tidak boleh melintasi tenant (ADR-001). |
| D4 | Terkait: pemindahan `reserved → sold` hanya pada settlement webhook tenant (ADR-002), satu transaksi + idempoten. |
| D7 | Menegaskan pembagian peran MySQL 8 (kebenaran) vs Redis 7 (antrean/rate limit/lock) dari stack D7. |

## Status

**accepted** — berlaku sejak 2026-11-24. Turunan wajib:

- `apps/api/database/migrations/**` (tg-data): `quota_slots` + `tenant_id` NOT NULL (FK `tenants.id`) +
  indeks komposit `(tenant_id, route_id, date)` + `UNIQUE(route_id, date)` + kolom versi.
- `apps/api/app/Domain/**` (tg-backend): service `ReserveSlot`, pelepasan hold terjadwal, transisi
  `reserved → sold`.
- `apps/api/tests/**` (tg-backend): `QuotaConcurrency` (500 → 10) + tes pelepasan hold dengan jam beku.
- Perubahan invarian, atau pemindahan sumber kebenaran ke Redis, memerlukan ADR pengganti.
