# ADR-005 — Enkripsi field identitas & dokumen (NIK/paspor, disk privat)

> **Status:** accepted · **Tanggal:** 2026-11-24 · **Owner:** tg-architect
> **Keputusan inti PRD:** §0 **D1** (isolasi + kontrol data) dan **D7** · **Rujukan:** PRD §8, §10.2, §11, §13, §16.11, §18.3, catatan O-7 (`docs/board/STATUS.md`) · **FR:** FR-36, FR-10, FR-09, FR-13
> **Ditetapkan oleh:** T-005 (`docs/board/tasks/T-005.yml`)

## Konteks

PRD §13 (baris "Data identitas (NIK, paspor, surat sehat)") menetapkan kontrol: **enkripsi field (cast
terenkripsi)**, disk privat, signed URL, retensi (hapus dokumen N hari setelah pendakian, konfigurasi),
akses dicatat. PRD §10.2 menulis `booking_members` dengan "NIK/paspor **terenkripsi**", `tenants` dengan
"`midtrans_*` (terenkripsi)" (ADR-002), dan `checkpoint_events`/`documents` sebagai turunan
`booking_members`. FR-36 AC-36.1 mengubahnya menjadi tes: "given NIK/paspor disimpan, when basis data
dibaca langsung (dump), then nilai terenkripsi — dekripsi hanya lewat lapisan aplikasi berwenang".
FR-10 menuntut dokumen (surat sehat, izin ortu, consent, bukti asuransi) di penyimpanan privat.

Kepatuhan UU PDP No. 27/2022 masih **[VERIFIKASI]** ke konsultan (PRD §8/§13, §20.2 #5) — jadi kontrol di
ADR ini adalah batas bawah yang sudah cukup aman untuk dinaikkan, bukan "sesuai hukum" final.

Fakta repo saat ADR ini ditulis:

- `apps/api` adalah Laravel 12.73.0 (`apps/api/composer.lock`) → tersedia cast terenkripsi bawaan
  (`encrypted`, `encrypted:array`, dst.) berbasis `APP_KEY`.
- `docs/board/STATUS.md` O-7: kunci uji di `apps/api/.env.testing` sudah diperbaiki (kunci acak per proses
  lewat `bootstrap/phpunit-testing.php`); tidak ada rahasia nyata di repo (PRD §13 "Rahasia").
- Belum ada model/tabel `booking_members`, `documents`, atau disk privat selain disk default Laravel; belum
  ada `tenants.midtrans_*` (ADR-002 belum diimplementasikan).

## Keputusan

1. **Daftar field terenkripsi (allowlist, ditutup):**
   - `booking_members.nik` (WNI) dan `booking_members.passport_no` (WNA), serta nomor identitas anggota
     rombongan lain yang setara;
   - `tenants.midtrans_server_key`, `tenants.midtrans_client_key`, `tenants.midtrans_merchant_id`
     (ADR-002);
   - kredensial integrasi lain yang bersifat rahasia (mis. token WhatsApp Cloud API per tenant, bila
     ditambahkan kelak) masuk daftar ini **wajib** lewat amendemen ADR.
   Kolom di luar daftar ini **tidak** boleh disimpan terenkripsi, agar tidak ada satu pun kolom yang
   "terenkripsi tapi lupa didaftarkan" atau sebaliknya.
2. **Mekanisme: Eloquent encrypted cast** bawaan Laravel (`encrypted`), bukan cipher buatan sendiri dan
   bukan enkripsi di level klien. Kunci aplikasi (`APP_KEY`) dari secret manager/`.env` — tidak pernah di
   repo, tidak pernah di log (PRD §13; `AGENTS.md` aturan 11).
3. **Nilai terenkripsi tidak dapat di-query.** Pencarian/penyamaran identitas dilakukan lewat
   `booking.code` / `booking_members.id` (PRD §10.2); **tidak ada** pencarian `WHERE nik = ...` di SQL.
   Bila kelak perlu pencarian identitas, tambahkan kolom indeks **turunan (HMAC)**, bukan mengembalikan
   plaintext — lewat ADR baru.
4. **Dokumen (surat sehat, izin ortu, consent, bukti asuransi): hanya BYTE file yang ada di object
   storage privat** (S3-compatible, PRD §9.1/§12) — tidak ada BLOB dokumen di MySQL. Metadata disimpan di
   tabel `documents` (entitas DOCUMENT pada ERD PRD §10.1) yang tenant-scoped mengikuti ADR-001:
   `tenant_id` NOT NULL (FK → `tenants.id`), `booking_member_id` (FK), `object_key` (path storage),
   `deleted_at` (penanda soft delete yang dipakai job retensi butir 5). Akses byte hanya lewat **signed
   URL berumur pendek** (PRD §12 "Disk privat + signed URL berumur pendek") dan hanya oleh peran berwenang.
   Object storage privat **dan tujuan backup (`spatie/laravel-backup`) WAJIB mengaktifkan enkripsi
   at-rest** (SSE-S3/SSE-KMS; kunci dikelola di secret manager sesuai butir 2), diverifikasi saat setup
   infra oleh tg-devops dan ditegakkan oleh cek konfigurasi/tes. Bila penyedia tidak menyediakan SSE,
   wajib SSE-C atau disk terenkripsi pada host; menjalankannya tanpa enkripsi at-rest hanya boleh sebagai
   **risiko yang diterima eksplisit** dan dicatat sebagai addendum ADR ini — bukan default diam.
5. **Retensi**: dokumen dihapus otomatis **N hari setelah tanggal pendakian** (nilai N konfigurasi per
   tenant/platform, PRD §13) oleh job terjadwal: baris `documents` ditandai `deleted_at`, byte dihapus
   dari object storage, dan hasilnya dicatat. Data identitas terenkripsi mengikuti kebijakan retensi yang
   sama (PRD FR-36 AC-36.2).
6. **Akses dicatat**: setiap pembacaan identitas penuh atau unduhan dokumen menulis entri `audit_logs`
   (siapa/apa/kapan), memakai `spatie/laravel-activitylog` (verdict approve, ADR-006) — FR-20/FR-36.
7. **`APP_KEY` = kunci data produksi.** Konsekuensinya dinyatakan sadar: kehilangan kunci berarti data
   identitas tidak dapat didekripsi; rotasi kunci adalah operasi terjadwal dengan job re-enkripsi, bukan
   `APP_KEY` diubah bebas (lihat Konsekuensi).
8. **Dump/backup tidak boleh cukup untuk membaca identitas.** Tes AC-36.1 wajib membuktikan dump
   menunjukkan ciphertext; backup (PRD §8, `spatie/laravel-backup`) mengikuti aturan yang sama dan file
   backup diperlakukan sebagai data sensitif.
9. **Log dan fixture**: tidak ada NIK/paspor nyata di log, fixture, seeder, atau screenshot (`AGENTS.md`
   aturan 11). Data uji memakai nilai sintetis.

## Alternatif yang ditolak

1. **TDE / enkripsi level database (mis. tablespace terenkripsi).** Ditolak: MySQL Community 8.4 (image
   `mysql:8.4`, `docker-compose.yml`) tidak menyediakan TDE tanpa edisi enterprise/plugin; dan TDE tetap
   membuka data bagi siapa pun yang bisa membaca tabel lewat koneksi aplikasi — tidak memenuhi AC-36.1
   ("dump DB harus terenkripsi") bila dump diambil lewat alat dengan kredensial aplikasi.
2. **Hash NIK (SHA-256) sebagai pengganti enkripsi.** Ditolak: NIK/paspor harus dapat **ditampilkan dan
   dicetak** (manifest, e-tiket, verifikasi identitas pos). Hash tidak bisa didekripsi; menuntut pencocokan
   hash per kombinasi input = pencarian identitas menjadi tidak praktis.
3. **Cipher/format sendiri (AES manual + base64) di kolom.** Ditolak: roll-your-own crypto; cast Laravel
   sudah menghandle IV/tag, key rotation story, dan serialisasi tipe. Tidak ada kebutuhan yang tidak
   tercakup.
4. **Dokumen disimpan sebagai BLOB di MySQL.** Ditolak: membengkakkan dump/backup (RPO ≤ 15 menit,
   PRD §8), memperlambat restore, dan menghapus pemisahan disk privat. Signed URL hanya bermakna dengan
   object storage.
5. **Signed URL berumur panjang (atau URL publik "unguessable").** Ditolak: PRD §12 menuntut umur pendek;
   URL yang bocor lewat chat harus kedaluwarsa cepat.
6. **Enkripsi di sisi klien sebelum unggah (plaintext tidak pernah sampai server).** Ditolak: server harus
   membaca isi dokumen untuk manifest, verifikasi dokumen (FR-10), dan ekspor/hapus (FR-36 AC-36.2);
   kunci di perangkat pendaki tidak dapat dipulihkan.
7. **Menyimpan seluruh baris `booking_members` terenkripsi (termasuk `birth_date`/`is_foreign`).**
   Ditolak: merusak query yang dibutuhkan rule engine (usia, WNI/WNA — FR-08) tanpa manfaat keamanan
   sepadan untuk data non-identitas.
8. **Menunda sampai kepatuhan UU PDP selesai [VERIFIKASI].** Ditolak: menunda = migrasi data identitas
   plaintext di kemudian hari; biaya dan risiko jauh lebih besar.

## Konsekuensi

- **Kunci = titik kegagalan tunggal.** `APP_KEY` harus ada di secret manager dengan prosedur pemulihan dan
  akses terbatas; kehilangan kunci = kehilangan data identitas (dinyatakan sebagai risiko yang diterima).
- **Rotasi kunci butuh job, bukan sunting `.env`.** Mengganti `APP_KEY` tanpa re-enkripsi akan membuat data
  lama tidak terbaca; prosedur rotasi (dekripsi dengan kunci lama → enkripsi kunci baru) harus ada sebelum
  rotasi pertama dilakukan.
- **Kolom terenkripsi tidak bisa diindeks/di-`ORDER BY`** dan berukuran lebih besar dari plaintext (IV +
  tag + base64); migrasi & laporan yang mengasumsikan pencarian identitas mustahil perlu penyesuaian.
- **Penyamaran di UI** (mis. `3201••••••••1234`) menjadi tanggung jawab app; nilai penuh hanya dikirim ke
  peran berwenang dan dicatat ke `audit_logs`.
- **Uji AC-36.1** wajib: dump langsung (tanpa lapisan aplikasi) harus gagal membaca NIK/paspor; plus uji
  job retensi (hapus dokumen N hari) dan uji akses tercatat.
- **Data yang salah enkripsi tidak bisa dibatalkan cepat**: karena daftar kolom ditutup (butir 1),
  kesalahan penambahan kolom terenkripsi harus dirollback lewat migrasi + job dekripsi, bukan diabaikan.
- Backfill: bila ada data identitas plaintext dari pilot, migrasi re-enkripsi wajib dijalankan dan
  diverifikasi sebelum gate P1 ditutup.
- **Kredensial tenant terenkripsi (ADR-002)**: rotasi kredensial Midtrans mengubah baris `tenants`, dan
  cache kredensial harus diinvalidasi pada saat yang sama.

## Pemetaan keputusan inti PRD §0

| Keputusan | Relasi |
|---|---|
| **D1** | **Implementasi kontrol data**: isolasi antar tenant (ADR-001) ditambah enkripsi field supaya dump DB bersama tidak membocorkan identitas tenant mana pun. |
| **D7** | Menegaskan mekanisme teknis pada stack D7: cast terenkripsi Laravel + object storage S3-compatible privat. |
| D4 | Terkait: kredensial Midtrans per tenant (`tenants.midtrans_*`) masuk daftar kolom terenkripsi (ADR-002). |
| D5 | Tidak terkait langsung: kuota tidak menyimpan identitas; hanya `booking_members` yang melakukannya. |

## Status

**accepted** — berlaku sejak 2026-11-24; batas bawah keamanan data identitas. Turunan wajib:

- `apps/api/database/migrations/**` + model (tg-data/tg-backend): cast `encrypted` pada daftar butir 1,
  tabel metadata `documents` (`tenant_id`, `booking_member_id`, `object_key`, `deleted_at`), disk privat,
  job retensi.
- `apps/api/app/**` (tg-backend): signed URL berumur pendek, penyamaran UI, `audit_logs` untuk akses.
- tg-devops (`infra/**`, `docker/**`): enkripsi at-rest (SSE) untuk bucket dokumen privat + tujuan backup,
  diverifikasi saat setup dan ditegakkan oleh cek konfigurasi/tes (butir 4).
- Tes wajib: dump-terenkripsi (AC-36.1), retensi (AC-36.2), akses tercatat.
- Menambah/mengurangi kolom pada daftar butir 1 memerlukan amendemen ADR ini (bukan suntingan diam-diam).
