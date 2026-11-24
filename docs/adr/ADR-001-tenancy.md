# ADR-001 — Tenancy: satu database bersama, `tenant_id` + global scope

> **Status:** accepted · **Tanggal:** 2026-11-24 · **Owner:** tg-architect
> **Keputusan inti PRD:** §0 **D1** · **Rujukan:** PRD §4.1, §4.2, §9.1, §10.2, §13, §16.2, §18.1 · **FR:** FR-01, FR-33 (dimanfaatkan lintas FR)
> **Ditetapkan oleh:** T-005 (`docs/board/tasks/T-005.yml`)

## Konteks

TrailGate punya dua model jual dari **satu codebase** (PRD §4.2): SaaS multi-tenant (`tenant.trailgate.id`
atau domain kustom) dan paket template single-tenant yang dipasang pelanggan sendiri. D1 mengunci arah:
SaaS-first dengan **satu database**, isolasi lewat kolom `tenant_id` + global scope; mode template adalah
**build yang sama** dengan `TENANT_MODE=single` — bukan varian kode. FR-33 (AC-33.1) menuntut paket
template terpasang di server bersih dengan build identik.

Fakta repo saat ADR ini ditulis:

- Model produk sudah memuat `tenants` (`type`, `slug`, `status`, `settings` JSON, `midtrans_*`
  terenkripsi) — PRD §10.2.
- PRD §10.2 menutup dengan: "Semua tabel tenant-scoped memiliki `tenant_id` + index komposit;
  **global scope** + tes yang gagal bila ada model tenant-scoped tanpa scope."
- PRD §13 menetapkan kontrol "Global scope, policy per tenant, tes isolasi otomatis (CI gagal bila ada
  query tanpa scope)".
- `AGENTS.md` aturan 7: setiap query model tenant-scoped wajib lewat global scope; `withoutGlobalScopes`
  tanpa ADR dilarang.
- `apps/api` sudah ada sebagai Laravel 12.73.0 (`apps/api/composer.lock`), MySQL 8.4 dan Redis 7 ada di
  `docker-compose.yml` — stack D7 terkunci.
- Belum ada model tenant-scoped, scope, atau `TENANT_MODE` di kode: keputusan ini mengikat pekerjaan
  P1 (FR-01 dst.), bukan meratifikasi kode yang sudah ada.

## Keputusan

1. **Satu database fisik bersama** untuk semua tenant SaaS. Tidak ada database/schema per tenant.
2. Setiap tabel tenant-scoped punya kolom **`tenant_id` (NOT NULL, FK ke `tenants.id`)** dan **index
   komposit yang selalu diawali `tenant_id`** (mis. `(tenant_id, route_id, date)`).
3. Setiap model tenant-scoped memakai **global scope tenant** yang menyuntikkan
   `where tenant_id = <tenant aktif>`; resolusi tenant aktif (subdomain/domain kustom/jalur super admin)
   terjadi di middleware, sekali per request. Policy per tenant berlapis di atasnya (PRD §13).
4. **Dua tes ber-gate CI wajib** (PRD §10.2/§13), keduanya bagian kriteria lulus gate, bukan opsional:
   - **tes scope**: CI gagal bila ada model tenant-scoped yang tidak memakai global scope;
   - **tes skema**: iterasi daftar tabel tenant-scoped dan gagalkan CI bila ada tabel tanpa
     `tenant_id` NOT NULL + FK ke `tenants.id` + minimal satu indeks yang berkolom pertama `tenant_id`.
     Aturan butir 2 dengan demikian diuji di level skema (migrasi), bukan hanya di level model.
5. `withoutGlobalScopes` hanya boleh dipakai bila tercatat di ADR; pemakaian wajib disertai alasan dan
   cakupan data (super admin lintas-tenant, job latar, seed).
6. `TENANT_MODE` hanya **saklar konfigurasi** (`saas` | `single`) pada artefak yang sama:
   - `saas` — resolusi tenant per request seperti butir 3.
   - `single` — tepat satu baris `tenants`; resolusi tenant di-short-circuit ke tenant itu; scope, kolom,
     dan migrasi **tetap ada dan tetap dipakai** sehingga skema tidak bercabang.
   Tidak ada `if (TENANT_MODE === ...)` di jalur tulis data, tidak ada build/tag Docker berbeda, tidak ada
   fork kode untuk template.
7. Migrasi tetap satu set tabel untuk semua tenant (satu `php artisan migrate`), sehingga biaya operasi
   sebanding jumlah tenant tetapi skema tetap tunggal. Migrasi yang menambah `tenant_id`/FK/indeks wajib
   **reversible** — `down()` menghapus indeks, lalu FK, lalu kolom — dan rollback diverifikasi, sesuai
   PRD §18.2 ("migrasi bisa naik-turun"). Migrasi yang tidak dapat dibalik (mis. backfill merusak data)
   harus menyatakan alasannya di file migrasinya.

## Alternatif yang ditolak

1. **Database-per-tenant (`stancl/tenancy` atau setara).** Ditolak: PRD §9.2 memberi verdict "Hindari di
   awal (kompleksitas)"; biaya operasi berlipat (migrasi × N, backup/restore × N, koneksi × N, alert × N)
   untuk basecamp berukuran 1–3 jalur (D10). tg-security juga menaruh `stancl/tenancy` pada verdict
   **defer** (ADR-006).
2. **Schema-per-tenant (satu DB, banyak schema MySQL).** Ditolak: kebutuhan koneksi/permission per schema,
   tooling migrasi dan observabilitas tidak umum di ekosistem Laravel, dan tetap tidak memberi isolasi
   sekuat database terpisah — jadi menanggung kompleksitas tanpa manfaat penuh.
3. **Isolasi hanya lewat filter query di repository tanpa global scope.**
   Ditolak: melanggar `AGENTS.md` aturan 7 dan PRD §10.2/§13; satu query yang lupa memfilter = kebocoran
   antar tenant, dan tidak ada mekanisme otomatis yang mendeteksinya.
4. **Isolasi berdasarkan origin/subdomain saja, tanpa `tenant_id` di baris.**
   Ditolak: perubahan domain atau pemakaian jalur super-admin akan membuka data tenant lain; isolasi
   harus ada di data, bukan hanya di routing.
5. **Kode terpisah untuk template single-tenant (fork).**
   Ditolak: dua basis kode = dua jalur bug dan dua jalur rilis; melanggar D1 ("build yang sama") dan
   AC-33.1.

## Konsekuensi

- Setiap tabel baru yang tenant-scoped wajib membawa `tenant_id` + index komposit sejak migrasi pertama;
  migrasi yang lupa akan tertangkap tes isolasi butir 4.
- Query lintas-tenant (dashboard super admin, job terjadwal, seed, ekspor platform) harus menyatakan
  maksudnya secara eksplisit dan tercatat di ADR — ini utang desain yang disengaja untuk ditutup dengan
  allowlist, bukan dengan scope implisit.
- **Namespace wajib `tenant_id`** untuk setiap cache key, payload job queue, lock, dan path object storage
  yang membawa data tenant (mis. `tenant:{id}:quota:{route}:{date}`, `tenants/{id}/documents/{key}`). Job
  yang memproses data tenant **dilarang** berjalan tanpa konteks tenant eksplisit; pembacaan lintas tenant
  oleh super admin mengikuti aturan bypass yang sama dengan Keputusan 5 (harus tercatat di ADR).
  Penegakan berupa tes/audit adalah pekerjaan T-191 (§17 PRD, "uji isolasi tenant lanjutan — IDOR,
  kebocoran lewat cache/queue/storage").
- `spatie/laravel-permission` (disetujui di ADR-006) harus dijalankan **team-scoped per tenant**
  (`teams: true` + `team_id = tenant_id`); kalau tidak, RBAC bocor antar tenant.
- `TENANT_MODE=single` berarti jalur kode SaaS tetap diuji; matriks tes wajib menjalankan suite inti pada
  kedua mode sebelum rilis (AC-33.1).
- Skala: satu DB bersama cukup sampai target 10+ tenant (PRD §8 ketersediaan 99,9%); pindah ke
  DB-per-tenant kelak adalah **ADR baru**, bukan perubahan diam-diam.
- Dump/backup berisi data semua tenant; karena itu enkripsi field (ADR-005) dan pemisahan disk dokumen
  menjadi kontrol wajib, bukan tambahan.
- Operasi restore/RPO (PRD §8) mengembalikan semua tenant sekaligus; tidak ada restore per tenant.

## Pemetaan keputusan inti PRD §0

| Keputusan | Relasi |
|---|---|
| **D1** | **Implementasi utama**: satu DB, `tenant_id` + global scope, template = build sama dengan `TENANT_MODE=single`. |
| D4 | Terkait tidak langsung: kredensial Midtrans per tenant disimpan di kolom terenkripsi `tenants.midtrans_*` — pola `tenant_id` yang sama (ADR-002). |
| D5 | Prasyarat: `quota_slots` dan closure tenant-scoped; engine kuota tidak boleh melintasi tenant (ADR-003). |
| D7 | Menegaskan stack MySQL 8 dari D7 sebagai satu-satunya sumber kebenaran data (Redis bukan penyimpan kuota). |

## Status

**accepted** — berlaku sejak 2026-11-24. Turunan wajib:

- `apps/api` (tg-backend/tg-data): concern `BelongsToTenant`, global scope, migrasi `tenant_id` + index
  komposit, tes isolasi tenant (CI gagal bila model tenant-scoped tanpa scope).
- `apps/api/config/**` (tg-devops): kunci konfigurasi `TENANT_MODE` (`saas`|`single`).
- Penyimpangan dari butir 3/5/6 memerlukan ADR baru yang menggantikan (superseded) ADR ini.
