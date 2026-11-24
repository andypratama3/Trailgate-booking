# FR — Dekomposisi PRD §5 menjadi FR-ID, Acceptance Criteria, dan User Story

Sumber kebenaran: `docs/prd/PRD.md` v1.0 (24 November 2026). Dokumen ini **tidak** menambah,
mengurangi, atau mengubah maksud kebutuhan di PRD.

- Setiap entri: **id**, **judul** (sama dengan kolom §5), `prd_ref: §5 FR-xx`, prioritas MoSCoW,
  fase, ≥1 AC terukur (given/when/then atau perintah verifikasi), ≥1 user story yang merujuk
  persona §3 (Rani, Bayu, Pak Joko, Mas Dimas, Sari, Petugas BKSDA/SAR, Andy).
- Kolom `pendukung:` mencatat bagian PRD lain yang menjadi dasar AC — bukan kebutuhan baru.
- Label **[FAKTA]** / **[ASUMSI]** / **[VERIFIKASI]** / **[REKOMENDASI]** dipertahankan verbatim
  dari PRD. Label tidak pernah diubah menjadi klaim fakta.
- Prioritas ganda (mis. `M (peta) / S (elevasi)`) dan fase ganda (mis. `P1/P2`) ditulis apa adanya
  sesuai §5. Arti: komponen pertama wajib (Must) di fase pertama, komponen kedua (Should) di
  fase kedua — tetap satu FR, bukan FR baru.
- Penekanan Markdown pada judul §5 dipertahankan verbatim — FR-17 `deteksi **overdue**` dan
  FR-35 `**Official Link Mode**`; judul yang di §5 tidak diberi penekanan tetap tanpa markup.
- Tidak ada FR di luar FR-01..FR-41. Tidak ada kebutuhan baru di luar PRD.

---

## FR-01 — Organisasi/tenant, user, RBAC (super admin, tenant admin, kasir, petugas pos, guide, pendaki)

- `prd_ref: §5 FR-01`
- `pendukung: §0 D1, §13 (kebocoran antar tenant, MFA), §16.4, §17 T-101/T-102/T-103/T-191`
- MoSCoW: **M** · Fase: **P1**
- AC:
  - **AC-01.1** Given user terautentikasi pada tenant A, when mengakses resource tenant B
    (mis. `GET /v1/console/bookings/{code}` milik tenant B), then respons 404/403 dan tidak ada
    data tenant B yang bocor. Pengecekan: tes isolasi tenant di CI gagal bila ada model
    tenant-scoped tanpa global scope (§10.2, §13).
  - **AC-01.2** Given peran `kasir` pada tenant X, when mengakses endpoint milik tenant admin
    (`PUT /v1/console/rules/{id}` — daftar endpoint konsol di §11), then 403. Given peran
    `petugas pos`, when mengakses `POST /v1/pos/*` saja, then 200; selain itu 403. Pengecekan:
    matriks peran×endpoint diuji sebagai tes feature.
  - **AC-01.3** Given tenant admin belum mengaktifkan MFA, when login pertama, then dipaksa
    enroll MFA (§13).
- User story:
  - Sebagai **Andy** (owner SaaS / super admin, §3), saya ingin membuat dan mengelola tenant
    beserta pengguna dan perannya, supaya onboarding tenant terjadi tanpa sentuhan kode dan
    akses tiap peran terbatas pada tugasnya.
  - Sebagai **Pak Joko** (pengelola basecamp / tenant admin, §3), saya ingin mengundang kasir,
    petugas pos, dan guide dengan peran masing-masing, supaya staf saya tidak bisa mengubah
    pengaturan atau data di luar pekerjaannya.

## FR-02 — Branding tenant (logo, warna, subdomain)

- `prd_ref: §5 FR-02`
- `pendukung: §4.2, §9.4A (tema tenant runtime, validator kontras), §17 T-007/T-104/T-012`
- MoSCoW: **M** · Fase: **P1**
- AC:
  - **AC-02.1** Given tenant mengunggah logo dan memilih warna merek, when halaman publik
    dimuat ulang, then logo dan warna merek tampil tanpa deploy ulang (warna di-inject sebagai
    CSS variables saat runtime, §9.4A). Pengecekan: E2E memuat halaman jalur dan memverifikasi
    variabel CSS terisi.
  - **AC-02.2** Given warna merek tenant gagal memenuhi WCAG AA, when disimpan, then penyimpanan
    ditolak (422) dengan pesan berisi nilai kontras terukur — warna gagal tidak pernah tersimpan,
    penyesuaian otomatis tidak dilakukan. Pilihan "tolak, bukan sesuaikan" adalah **[REKOMENDASI]**:
    §9.4A mengizinkan "ditolak atau disesuaikan"; penyesuaian otomatis mengubah identitas merek
    tanpa persetujuan tenant. Pengecekan: tes validator dengan fixture warna gagal → 422.
  - **AC-02.3** Given tenant memiliki subdomain sendiri (mis. `tenant.trailgate.id`), when
    diakses, then halaman menampilkan data tenant itu saja; subdomain tenant lain tidak
    menampilkan datanya.
- User story:
  - Sebagai **Pak Joko** (tenant admin, §3), saya ingin logo dan warna basecamp saya tampil di
    setiap halaman, supaya pendaki mengenali halaman resmi basecamp saya dan tidak tertipu
    peniru.

## FR-03 — Katalog: gunung, jalur, gate/basecamp, pos/checkpoint, camp area

- `prd_ref: §5 FR-03`
- `pendukung: §10.1 ERD, §11 endpoint publik, §17 T-111/T-113/T-117`
- MoSCoW: **M** · Fase: **P1**
- AC:
  - **AC-03.1** Given tenant admin membuat gunung → jalur → gate → pos → camp area lewat konsol,
    when disimpan, then baris tersimpan bertingkat sesuai ERD (§10.1) dan muncul di
    `GET /v1/routes` untuk tenant itu saja.
  - **AC-03.2** Given Mountain Pack diimpor (lihat FR-37), when import selesai, then katalog
    terisi dengan slug jalur/gate/pos/camp dari pack.
  - **AC-03.3** Given katalog terisi, when halaman katalog dibuka, then daftar gunung/jalur
    tampil ter-render SSR dengan status dan kuota tersisa (§11, §17 T-113).
- User story:
  - Sebagai **Rani** (pendaki pemula, §3), saya ingin mencari gunung dan jalur lengkap dengan
    gate, pos, dan area camp, supaya saya tahu medan dan titik berhenti sebelum membayar.

## FR-04 — Peta rute (GeoJSON) + profil elevasi

- `prd_ref: §5 FR-04`
- `pendukung: §9.4C (visual), §17 T-112/T-113`
- MoSCoW: **M (peta) / S (elevasi)** · Fase: **P1**
- AC:
  - **AC-04.1** Given file GeoJSON yang tidak valid (struktur rusak), when diunggah lewat
    konsol, then respons 422 dengan rincian galat; given GeoJSON valid, when diunggah, then
    tersimpan pada jalur terkait. Pengecekan: dua kasus pada tes feature unggah.
  - **AC-04.2** (peta, M) Given jalur punya `geojson`, when halaman jalur dibuka, then peta
    MapLibre menampilkan garis rute; SSR/SEO tetap berfungsi (§9.4C).
  - **AC-04.3** (elevasi, S) Given jalur punya data elevasi, when halaman jalur dibuka, then
    profil elevasi tergambar; tidak ada data → komponen menampilkan empty state (§9.4A).
- User story:
  - Sebagai **Rani** (pendaki pemula, §3), saya ingin melihat peta rute dan profil elevasi
    jalur yang saya pilih, supaya saya menilai kesulitan trek dan tidak salah pilih jalur.

## FR-05 — Kuota per jalur per tanggal, jendela pembukaan booking, cutoff H-n

- `prd_ref: §5 FR-05`
- `pendukung: §2.3, §6.2 (booking_window_days, booking_cutoff_hours, quota_open_schedule),
  §8 (0 overbooking, zona waktu WIB/WITA/WIT), §10.3, §17 T-121/T-182`
- MoSCoW: **M** · Fase: **P1**
- AC:
  - **AC-05.1** Given admin menetapkan kapasitas per jalur per tanggal, when disimpan, then
    `quota_slots` punya `UNIQUE(route_id, date)` dan nilai `capacity` (§10.2); edit kapasitas
    tidak menimpa `reserved`/`sold`.
  - **AC-05.2** Given aturan `booking_window_days`/`booking_cutoff_hours` pada jalur, when
    pemesanan jatuh di luar jendela (mis. cutoff H-2, §2.1 Semeru), then ditolak dengan kode
    error terstandar; given `quota_open_schedule` aktif (mis. pembukaan 08.00 WITA per jalur,
    §8), when diakses sebelum jadwal, then booking ditolak. Pengecekan: tes tabel keputusan.
  - **AC-05.3** Given 500 request paralel pada slot kapasitas 10, when dijalankan bersamaan,
    then tepat 10 sukses dan 0 overbooking (§10.3, §8). Pengecekan:
    `php artisan test --filter=QuotaConcurrency`.
- User story:
  - Sebagai **Pak Joko** (pengelola basecamp, §3), saya ingin kuota per tanggal dan jendela
    booking yang bisa saya atur, supaya jumlah pendaki per hari sesuai daya dukung dan tidak
    ada kelebihan jual.
  - Sebagai **Sari** (pemilik TO / open trip, §3), saya ingin cutoff dan jadwal pembukaan
    terlihat saat saya memilih tanggal trip, supaya rombongan saya tidak salah memesan di
    hari yang sudah ditutup.

## FR-06 — Reservasi sementara (hold) dengan TTL, anti-overbooking

- `prd_ref: §5 FR-06`
- `pendukung: §6.4 (hold 15 menit, pembayaran dalam masa hold + grace 5 menit), §7.1, §10.3,
  §17 T-121/T-122/T-145`
- MoSCoW: **M** · Fase: **P1**
- AC:
  - **AC-06.1** Given pendaki melakukan hold pada pukul T, when mencapai T+15 menit tanpa
    pembayaran, then job terjadwal melepas slot (`reserved -= n`) dan booking masuk `Expired`
    (§6.4, §7.1). Pengecekan: tes job dengan jam beku.
  - **AC-06.2** Given slot tersisa 0, when reservasi baru masuk, then transaksi atomik gagal
    (`affected_rows = 0`, §10.3) dan tidak ada baris `quota_slots` dengan
    `reserved + sold > effective_capacity`.
  - **AC-06.3** Given pembayaran sukses, when webhook diterima, then `reserved → sold` terjadi
    dalam satu transaksi dan pengulangan webhook tidak mengubah angka dua kali (idempoten,
    §10.3). Pengecekan: tes webhook duplikat.
- User story:
  - Sebagai **Rani** (pendaki pemula, §3), saya ingin slot ditahan sementara saat saya mengisi
    data dan membayar, supaya kuota tidak lepas di tengah transaksi dan saya tidak kehilangan
    jadwal.

## FR-07 — Closure (penuh/sebagian jalur/sebagian hari) + Disruption Case (notifikasi, reschedule, refund)

- `prd_ref: §5 FR-07`
- `pendukung: §0 D5, §2.3, §6.4, §7.3, §17 T-123/T-124/T-125/T-174/T-210`
- MoSCoW: **M** · Fase: **P1**
- AC:
  - **AC-07.1** Given admin mengusulkan penutupan (jalur, rentang tanggal, mode, alasan,
    nomor/tautan surat resmi), when dikonfirmasi manusia dengan `source_url` dan `source_ref`,
    then closure aktif dan `effective_capacity` jalur terdampak menjadi 0 pada rentang itu
    (§7.3, §10.3). Pengecekan: tes konfirmasi + perhitungan kapasitas.
  - **AC-07.2** Given closure mode `block_new_bookings`, when booking baru diajukan, then
    ditolak; booking yang sudah dibayar tetap sah (§6.4). Given mode `cancel_existing`, when
    closure aktif, then dibuat satu Disruption Case per booking terdampak dengan pilihan
    reschedule gratis atau refund penuh (§6.4, §7.3).
  - **AC-07.3** Given kasus dibuat, when proses berjalan, then seluruh peserta terdampak dan
    pelanggan alert jalur menerima broadcast WA/email (§7.3), dan dashboard menampilkan
    progres penyelesaian kasus (§7.3, §9.4B). Pengecekan: E2E closure dari konfirmasi sampai
    kasus selesai.
- User story:
  - Sebagai **Pak Joko** (pengelola basecamp, §3), saya ingin menutup jalur beserta alasannya
    dan surat rujukan, supaya pendaki langsung tahu tanpa saya telepon satu-satu.
  - Sebagai **Rani** (pendaki pemula, §3), saya ingin memilih reschedule atau refund sendiri
    lewat tautan saat jalur saya ditutup, supaya uang atau jadwal saya tertangani tanpa
    negosiasi manual.
  - Sebagai **Bayu** (ketua rombongan, §3), saya ingin semua anggota rombongan saya menerima
    pemberitahuan penutupan, supaya tidak ada anggota yang datang ke gunung dengan informasi
    lama.

## FR-08 — Rule engine persyaratan per jalur (umur, surat sehat, consent, rasio guide, ukuran grup, dokumen)

- `prd_ref: §5 FR-08`
- `pendukung: §0 D6, §6.1–§6.3 (§6.2: katalog 17 tipe aturan), §17 T-131/T-132/T-133`
- MoSCoW: **M** · Fase: **P1**
- AC:
  - **AC-08.1** Given aturan terpasang pada cakupan `tenant|mountain|route`, when evaluator
    dijalankan atas sebuah booking, then hasil berupa daftar `{severity: block|warn, code,
    message_id, message_en, member_ref}` (§6.1); `block` mencegah konfirmasi, `warn` tidak
    (§7.1 `Paid → NeedsAction`).
  - **AC-08.2** Given aturan tanpa `source_url` atau `verified_at` lebih dari 90 hari, when
    seeder dijalankan di CI, then CI gagal; pada runtime, aturan itu menampilkan badge
    "perlu verifikasi" (§6.1). Pengecekan: `php artisan db:seed` dengan fixture tanpa
    `source_url` harus exit non-zero.
  - **AC-08.3** Given pack referensi **DEMO** (Rinjani: umur <17 wajib izin ortu, surat sehat
    24 jam, rasio guide 4, porter 2 WNA/3 WNI — §6.3, contoh ilustrasi non-final/bukan data
    final [VERIFIKASI ke SOP resmi terbaru]), when tes tabel keputusan dijalankan, then setiap
    baris kasus menghasilkan keputusan yang benar.
  - **AC-08.4** Given seluruh 17 tipe aturan §6.2 (`min_age_unaccompanied`,
    `minor_requires_guardian_consent`, `beginner_requires_guide`, `health_cert_max_age_hours`,
    `informed_consent_required`, `insurance_info_required`, `guide_ratio`, `porter_ratio`,
    `max_group_size`, `min_group_size`, `booking_window_days`, `booking_cutoff_hours`,
    `max_stay_nights`, `required_documents[]`, `reschedule_policy`, `refund_policy`,
    `quota_open_schedule`), when seeder memasang satu aturan per tipe — masing-masing dengan
    `source_url` dan `verified_at` valid — lalu evaluator dijalankan, then setiap tipe dievaluasi
    sebagai data tanpa perubahan kode dan menghasilkan `block` atau `warn` (§6.1, §6.2).
    Pengecekan: tes data-driven dengan satu baris tabel keputusan per tipe — jumlah baris uji
    = 17 (`--filter=RuleTypeCoverage`).
- User story:
  - Sebagai **Sari** (pemilik TO / guide, §3), saya ingin syarat tiap jalur berupa data yang
    bertanggal dan bersumber, supaya saya tidak bertanggung jawab atas aturan yang salah
    terbaca.
  - Sebagai **Rani** (pendaki pemula, §3), saya ingin aturan seperti surat sehat dan pendampingan
    pemula ditampilkan lengkap dengan tanggal verifikasinya, supaya saya menyiapkan dokumen
    sebelum berangkat dan tidak ditolak di pos.

## FR-09 — Booking grup: ketua + anggota + kontak darurat; link pengisian untuk anggota

- `prd_ref: §5 FR-09`
- `pendukung: §7.2 langkah 3, §11 endpoint booking, §17 T-007/T-141/T-142`
- MoSCoW: **M** · Fase: **P1**
- AC:
  - **AC-09.1** Given ketua rombongan membuat booking, when mengisi data ketua, jumlah anggota,
    dan kontak darurat, then booking `Held` terbentuk dengan anggota terdaftar (§7.1, §7.2).
  - **AC-09.2** Given link pengisian dibagikan, when anggota membuka link, then anggota dapat
    mengisi datanya dan mengunggah dokumennya sendiri (§7.2 langkah 3); ketua melihat status
    kelengkapan tiap anggota.
  - **AC-09.3** Given wizard terisi sebagian, when pengguna keluar dan kembali, then progres
    tersimpan dan dipulihkan (§17 T-142). Pengecekan: E2E isi → reload → data masih ada.
- User story:
  - Sebagai **Bayu** (ketua rombongan, §3), saya ingin mengisi data 8 orang sekali lalu
    membagikan link pengisian ke anggota, supaya saya tidak menginput ulang data mereka dan
    dokumen tidak tercecer.
  - Sebagai **Rani** (pendaki pemula, §3), saya ingin mengisi data dan mengunggah dokumen
    lewat link dari ketua, supaya saya tidak perlu menunggu ketua memasukkan data saya.

## FR-10 — Dokumen: surat sehat, izin ortu, consent, bukti asuransi (penyimpanan privat)

- `prd_ref: §5 FR-10`
- `pendukung: §11 (signed upload), §12 (disk privat + signed URL), §13, §17 T-143`
- MoSCoW: **M** · Fase: **P1**
- AC:
  - **AC-10.1** Given anggota mengunggah surat sehat, when disimpan, then objek berada di disk
    privat dan hanya bisa diunduh via signed URL berumur pendek; akses langsung ke lokasi
    penyimpanan menghasilkan 403 (§12).
  - **AC-10.2** Given file dengan tipe/ukuran di luar kebijakan, when diunggah, then ditolak
    dengan pesan validasi (§17 T-143).
  - **AC-10.3** Given dokumen diunduh, when akses terjadi, then akses tercatat (§13) dan tidak
    ada isi dokumen/NIK yang masuk log aplikasi (§16.11 butir 11).
- User story:
  - Sebagai **Bayu** (ketua rombongan, §3), saya ingin dokumen anggota (surat sehat, izin ortu,
    consent, bukti asuransi) tersimpan rapi dan terlindungi, supaya data medis dan identitas
    rombongan saya tidak bocor.
  - Sebagai **Rani** (pendaki pemula, §3), saya ingin mengunggah dokumen saya dengan aman,
    supaya identitas saya tidak tersebar.

## FR-11 — Pricing engine: WNI/WNA, weekday/weekend/libur, promo, item tambahan

- `prd_ref: §5 FR-11`
- `pendukung: §6.2 (dipakai policy), §10.2 (integer rupiah), §17 T-144`
- MoSCoW: **M** · Fase: **P1**
- AC:
  - **AC-11.1** Given tarif berbeda untuk WNI/WNA, weekday/weekend/libur, and promo aktif, when
    harga dihitung untuk kombinasi yang sama dua kali, then hasil identik dan berupa integer
    rupiah — tidak pernah float (§10.2, AGENTS.md butir 6).
  - **AC-11.2** Given booking memiliki item tambahan (bila tersedia, lihat FR-12), when total
    dihitung, then `total_amount` = jumlah seluruh baris; promo diterapkan tepat satu kali.
    Pengecekan: tes pricing dengan kasus WNI/WNA × weekday/libur × promo.
- User story:
  - Sebagai **Rani** (pendaki pemula, §3), saya ingin harga final terlihat jelas sebelum bayar,
    termasuk perbedaan WNI/WNA dan hari libur, supaya saya tidak kena biaya tak terduga.
  - Sebagai **Sari** (pemilik TO, §3), saya ingin tarif berbeda per hari dan per kategori
    peserta, supaya pendapatan trip saya sesuai aturan yang saya tetapkan.

## FR-12 — Item tambahan: guide, porter, sewa alat, transport, homestay, asuransi

- `prd_ref: §5 FR-12`
- `pendukung: §17 T-207`
- MoSCoW: **S** · Fase: **P2**
- AC:
  - **AC-12.1** Given tenant mengaktifkan item tambahan, when pendaki memilih guide/porter/
    sewa alat/transport/homestay/asuransi pada booking, then item masuk `booking_items` dan
    total dihitung ulang sebagai integer rupiah; penghapusan item menghitung ulang kembali.
    Pengecekan: tes pricing + booking.
- User story:
  - Sebagai **Rani** (pendaki pemula, §3), saya ingin menambahkan guide, porter, dan sewa alat
    dalam satu pembayaran, supaya saya tidak mencari layanan terpisah di basecamp.
  - Sebagai **Sari** (pemilik TO, §3), saya ingin menjual guide, porter, transport, dan
    homestay sebagai item booking, supaya pendapatan tambahan tercatat rapi dan tidak lewat
    transfer manual.

## FR-13 — Pembayaran Midtrans (Snap, VA, QRIS), webhook idempoten, rekonsiliasi

- `prd_ref: §5 FR-13`
- `pendukung: §0 D4 (BYO merchant [VERIFIKASI ke konsultan hukum]), §12, §13, §17 T-151/T-152/T-153`
- MoSCoW: **M** · Fase: **P1**
- AC:
  - **AC-13.1** Given tenant memiliki akun Midtrans sendiri, when transaksi dibuat, then
    Snap/VA/QRIS tersedia dan kunci API tenant tersimpan terenkripsi (§10.2 `tenants.midtrans_*`).
  - **AC-13.2** Given webhook tanpa signature valid, when diterima, then ditolak dan dicatat;
    webhook dengan signature valid tetap diverifikasi ulang ke API Midtrans (§13).
  - **AC-13.3** Given webhook settlement yang sama dikirim ulang atau datang out-of-order, when
    diproses, then pembayaran di-settle tepat satu kali dan `ledger_entries` berisi satu entri —
    bukan dua (§10.2, §12). Pengecekan: tes duplikat/out-of-order (§18.3).
  - **AC-13.4** Given rekonsiliasi harian dijalankan, when terdapat selisih dengan laporan
    Midtrans, then selisih ditampilkan dan alert dikirim (§12, §8 observabilitas).
- User story:
  - Sebagai **Rani** (pendaki pemula, §3), saya ingin membayar lewat VA atau QRIS dan menerima
    konfirmasi yang benar walau koneksi saya putus di tengah, supaya uang saya tidak hilang
    tanpa tiket.
  - Sebagai **Pak Joko** (pengelola basecamp, §3), saya ingin uang masuk terekonsiliasi otomatis
    tiap hari, supaya saya tidak mencocokkan transfer manual dari WhatsApp.

## FR-14 — Policy engine refund/reschedule per tenant dan per kejadian

- `prd_ref: §5 FR-14`
- `pendukung: §6.4 (reschedule: anggota tidak berubah, batas kelompok/hari, satu kali gratis
  [ASUMSI]; refund ditentukan tenant; closure otoritas selalu refund penuh atau reschedule),
  §10.2 (ledger append-only), §17 T-154/T-146/T-124`
- MoSCoW: **M** · Fase: **P1**
- AC:
  - **AC-14.1** Given aturan reschedule tenant, when pendaki mencoba reschedule yang mengganti
    salah satu anggota, then ditolak (§6.4); when melewati batas kelompok per hari, then
    ditolak. Pengecekan: tes policy engine, bukan cabang if-else (§2.3 butir 5).
  - **AC-14.2** Given penutupan oleh otoritas, when refund dieksekusi, then selalu refund penuh
    atau reschedule (§6.4); given penutupan biasa tenant, when refund dihitung, then sesuai
    kebijakan tenant. Pengecekan: tabel keputusan policy.
  - **AC-14.3** Given refund/fee dicatat, when transaksi berjalan, then masuk `ledger_entries`
    append-only (§10.2); uang selalu integer rupiah. Given no-show lewat jam batas check-in,
    then tiket hangus dan slot dilepas (§6.4).
- User story:
  - Sebagai **Bayu** (ketua rombongan, §3), saya ingin mengubah jadwal rombongan tanpa kehilangan
    anggota yang sudah terdaftar, supaya aturan resmi jalur tetap terpenuhi.
  - Sebagai **Rani** (pendaki pemula, §3), saya ingin refund atau reschedule berjalan sesuai
    kebijakan yang sudah saya baca saat memesan, supaya saya tahu hak saya saat batal.

## FR-15 — E-tiket QR bertanda tangan + PDF

- `prd_ref: §5 FR-15`
- `pendukung: §10.4, §13 (QR palsu), §17 T-007/T-161`
- MoSCoW: **M** · Fase: **P1**
- AC:
  - **AC-15.1** Given tiket diterbitkan, when QR dipindai di pos yang sedang offline, then
    token bertanda tangan (Ed25519 atau HMAC) diverifikasi menggunakan kunci publik dan daftar
    revoke yang tersimpan di perangkat (§10.4). Pengecekan: tes verifikasi offline.
  - **AC-15.2** Given tiket sudah dipindai sebelumnya, when dipindai lagi, then ditampilkan
    peringatan — bukan crash (§10.4). Given token masuk daftar revoke, when dipindai, then
    ditolak.
  - **AC-15.3** Given pembayaran lunas, when tiket diminta, then PDF berisi kode booking dan
    QR dapat diunduh, dan tiket terkirim via WA + email (§7.2 langkah 6).
- User story:
  - Sebagai **Rani** (pendaki pemula, §3), saya ingin e-tiket QR berupa PDF yang bisa saya
    simpan offline, supaya saya tetap bisa check-in walau sinyal hilang di basecamp.
  - Sebagai **Mas Dimas** (petugas pos, §3), saya ingin pemindaian QR cepat dan tahan tiket
    ganda, supaya antrean di pos tidak menumpuk.

## FR-16 — PWA petugas pos: check-in/out, offline, sinkron

- `prd_ref: §5 FR-16`
- `pendukung: §0 D7, §8 (offline ≥ 24 jam, first scan wins + log), §10.2 (client_event_id
  UNIQUE), §18.3, §17 T-007/T-162/T-163`
- MoSCoW: **M** · Fase: **P1**
- AC:
  - **AC-16.1** Given perangkat dalam mode pesawat, when petugas melakukan check-in/out, then
    event antre di IndexedDB dan saat online dikirim sebagai batch `POST /v1/pos/sync` dengan
    `client_event_id` unik; pengiriman ulang tidak menggandakan event (§10.2, §11).
  - **AC-16.2** Given perangkat offline ≥ 24 jam lalu tersambung, when sinkron berjalan, then
    seluruh event tercatat tanpa kehilangan; bila terjadi konflik scan, then *first scan wins*
    dan konflik tercatat di log (§8). Pengecekan: uji mode pesawat 24 jam + scan ganda
    (§18.3).
- User story:
  - Sebagai **Mas Dimas** (petugas pos, §3), saya ingin tetap bisa check-in dan check-out
    walau sinyal hilang, supaya pendaki tidak terjebak hanya karena jaringan pos mati.

## FR-17 — Manifest + headcount real-time; deteksi **overdue**

- `prd_ref: §5 FR-17`
- `pendukung: §2.3 butir 6, §7.1 (CheckedIn → Overdue), §14 (metrik: deteksi overdue → alert
  < 15 menit), §17 T-162/T-164/T-202/T-210`
- MoSCoW: **M (manifest) / S (overdue)** · Fase: **P1/P2**
- AC:
  - **AC-17.1** Given N anggota sudah check-in dan belum check-out, when `GET /v1/pos/manifest`
    dan manifest konsol diambil, then "orang di gunung sekarang" = N dan berubah mengikuti
    scan terakhir (§9.4B widget, §11).
  - **AC-17.2** (overdue, S) Given anggota melewati batas tinggal/check-in tanpa kabar, when
    deteksi berjalan, then status menjadi `Overdue` (§7.1) dan alert terkirim dalam < 15 menit
    (§14). Pengecekan: tes dengan jam beku.
- User story:
  - Sebagai **Petugas BKSDA/SAR** (pengamat, §3), saya ingin daftar orang yang ada di gunung
    sekarang secara real-time, supaya saya tahu jumlah orang saat evaluasi keamanan.
  - Sebagai **Pak Joko** (pengelola basecamp, §3), saya ingin tahu rombongan yang belum turun,
    supaya saya bisa menindaklanjuti sebelum dinyatakan hilang.

## FR-18 — Notifikasi WhatsApp Cloud API + email (template, opt-in)

- `prd_ref: §5 FR-18`
- `pendukung: §12 (template tiket, pengingat H-1, closure, overdue; opt-in wajib; template
  disetujui Meta), §8 (alert webhook gagal), §17 T-171/T-172/T-173/T-174`
- MoSCoW: **M** · Fase: **P1**
- AC:
  - **AC-18.1** Given pengguna belum memberi opt-in WhatsApp, when notifikasi WA dijadwalkan,
    then tidak terkirim; given opt-in diberikan, when event terjadi (tiket, pengingat H-1,
    closure, overdue), then pesan terkirim memakai template terdaftar dan statusnya tercatat
    (§12).
  - **AC-18.2** Given pengiriman WA/email gagal berulang, when ambang tercapai, then alert
    webhook/pengiriman gagal dikirim ke operator (§8 observabilitas). Pengecekan: tes simulasi
    kegagalan provider.
- User story:
  - Sebagai **Rani** (pendaki pemula, §3), saya ingin menerima tiket, pengingat H-1, dan
    pemberitahuan penutupan lewat WhatsApp, supaya saya tidak ketinggalan informasi jalur.
  - Sebagai **Pak Joko** (pengelola basecamp, §3), saya ingin broadcast penutupan terkirim ke
    semua peserta terdampak, supaya tidak ada pendaki yang datang ke jalur yang tutup.

## FR-19 — Konsol admin: dashboard, kelola booking, laporan Excel/PDF

- `prd_ref: §5 FR-19`
- `pendukung: §9.4B (widget wajib, halaman), §17 T-181/T-182/T-183/T-125`
- MoSCoW: **M** · Fase: **P1**
- AC:
  - **AC-19.1** Given data operasional ada, when dashboard dibuka, then widget tampil: okupansi
    kuota 7/30 hari, pendapatan, booking menunggu bayar/dokumen, Kasus Penutupan terbuka,
    orang di gunung sekarang, overdue, cuaca jalur, anomali webhook (§9.4B).
  - **AC-19.2** Given filter laporan (harian, per jalur, rekonsiliasi) dipilih, when ekspor
    dijalankan, then berkas Excel dan PDF valid berisi baris sesuai filter (§17 T-183).
  - **AC-19.3** Given Closure Desk dibuka, when admin membuat/mengonfirmasi closure dengan
    sumber, then progres kasus terlihat (§7.3, §9.4B halaman).
- User story:
  - Sebagai **Pak Joko** (pengelola basecamp, §3), saya ingin dashboard yang menampilkan uang
    masuk dan booking yang tertunda, supaya saya tidak merekap WhatsApp setiap hari.
  - Sebagai **Sari** (pemilik TO, §3), saya ingin laporan Excel/PDF per trip, supaya saya bisa
    menyerahkan rekap ke klien dan pembukuan saya.

## FR-20 — Audit log semua aksi sensitif

- `prd_ref: §5 FR-20`
- `pendukung: §9.4B (aksi sensitif → konfirmasi + audit log), §10.2 (audit_logs: siapa, apa,
  kapan, sebelum/sesudah), §17 T-184`
- MoSCoW: **M** · Fase: **P1**
- AC:
  - **AC-20.1** Given aksi sensitif dilakukan (buat/konfirmasi closure, ubah aturan, refund,
    ubah pengaturan merek, ekspor manifest SAR), when disimpan, then terjadi baris audit
    berisi pelaku, aksi, waktu, dan nilai sebelum/sesudah (§10.2). Pengecekan: tes feature
    memicu aksi lalu membaca baris audit.
  - **AC-20.2** Given audit log terisi, when penampil audit dibuka, then dapat menyaring
    berdasarkan pelaku, aksi, dan rentang tanggal (§17 T-184).
- User story:
  - Sebagai **Andy** (super admin, §3), saya ingin setiap aksi sensitif tercatat dengan
    pelaku dan perubahannya, supaya perubahan mencurigakan bisa ditelusuri.
  - Sebagai **Pak Joko** (tenant admin, §3), saya ingin melihat siapa yang mengubah aturan
    atau menutup jalur, supaya tanggung jawab staf jelas.

## FR-21 — Cuaca BMKG per jalur dengan atribusi

- `prd_ref: §5 FR-21`
- `pendukung: §2.2 (BMKG Open Data, wajib mencantumkan BMKG sebagai sumber), §12 (cache +
  fallback), §17 T-201`
- MoSCoW: **S** · Fase: **P2**
- AC:
  - **AC-21.1** Given jalur punya kode `adm4`, when cuaca diminta, then prakiraan 3 hari per
    jalur tampil bersama atribusi BMKG dan tautan sumber (§2.2, §12) — atribusi tidak boleh
    dihapus.
  - **AC-21.2** Given API BMKG gagal, when halaman dibuka, then data cache terakhir
    (dengan waktu pengambilan) atau pesan fallback tampil, bukan kegagalan halaman (§12).
- User story:
  - Sebagai **Rani** (pendaki pemula, §3), saya ingin melihat prakiraan cuaca jalur saya dari
    BMKG lengkap dengan sumbernya, supaya saya memutuskan berangkat berdasarkan data resmi.
  - Sebagai **Mas Dimas** (petugas pos, §3), saya ingin tahu cuaca 3 hari ke depan saat pos
    bertugas, supaya saya siap menghadapi perubahan cuaca.

## FR-22 — SOS/kontak darurat, ekspor manifest untuk SAR

- `prd_ref: §5 FR-22`
- `pendukung: §9 (kontak darurat pada booking, FR-09), §17 T-202/T-203/T-210`
- MoSCoW: **S** · Fase: **P2**
- AC:
  - **AC-22.1** Given booking memiliki kontak darurat, when SOS dipicu dari pos/perangkat,
    then WA terkirim ke kontak darurat dan ke petugas, dan kejadian tercatat (§17 T-202).
    Pengecekan: tes eskalasi.
  - **AC-22.2** Given petugas meminta manifest untuk SAR, when diunduh, then akses hanya untuk
    peran berwenang dan ekspor tercatat di audit log (§17 T-203, FR-20).
- User story:
  - Sebagai **Petugas BKSDA/SAR** (pengamat, §3), saya ingin manifest yang bisa diekspor
    saat insiden, supaya saya punya daftar orang di gunung untuk operasi pencarian.
  - Sebagai **Mas Dimas** (petugas pos, §3), saya ingin tombol SOS yang langsung menghubungi
    kontak darurat, supaya bantuan cepat terhubung tanpa mencari nomor manual.

## FR-23 — Briefing keselamatan digital + kuis singkat

- `prd_ref: §5 FR-23`
- `pendukung: §7.2 langkah 6 (briefing keselamatan), §17 T-204`
- MoSCoW: **S** · Fase: **P2**
- AC:
  - **AC-23.1** Given briefing ditampilkan kepada pendaki, when kuis singkat dijawab dan belum
    lulus, then tiket belum aktif; when lulus, then tiket aktif dan hasil kuis tercatat pada
    booking (§17 T-204: "syarat lulus sebelum tiket aktif").
- User story:
  - Sebagai **Rani** (pendaki pemula, §3), saya ingin membaca briefing keselamatan dan uji
    pemahaman singkat sebelum berangkat, supaya saya tahu prosedur darurat di jalur itu.

## FR-24 — Profil guide/porter, sertifikasi, ketersediaan

- `prd_ref: §5 FR-24`
- `pendukung: §10.1 (GUIDE_PROFILE → ASSIGNMENT), §17 T-205`
- MoSCoW: **S** · Fase: **P2**
- AC:
  - **AC-24.1** Given profil guide/porter dibuat dengan nomor sertifikasi dan masa berlaku,
    when masa berlaku habis, then penugasan pada booking ditolak (§17 T-205).
  - **AC-24.2** Given guide sudah ditugaskan pada tanggal tertentu, when ketersediaan dilihat,
    then tanggal itu tidak tersedia untuk penugasan lain.
- User story:
  - Sebagai **Sari** (pemilik TO / guide, §3), saya ingin profil guide dan porter lengkap
    dengan sertifikasi dan ketersediaan, supaya penugasan saya terdokumentasi dan tidak
    bentrok jadwal.

## FR-25 — Penugasan guide/porter + validasi rasio otomatis

- `prd_ref: §5 FR-25`
- `pendukung: §2.1 (rasio Rinjani), §6.2 (guide_ratio, porter_ratio), §17 T-206`
- MoSCoW: **S** · Fase: **P2**
- AC:
  - **AC-25.1** Given aturan `guide_ratio` aktif (mis. maksimal 4 pendaki per guide — §6.3
    [VERIFIKASI ke SOP resmi terbaru]), when penugasan melebihi rasio, then evaluator
    mengembalikan hasil `block` dan penugasan tidak bisa disimpan; bila `severity: warn`,
    then penugasan tersimpan dengan peringatan. Pengecekan: tes rule engine (FR-08).
- User story:
  - Sebagai **Sari** (pemilik TO, §3), saya ingin rasio guide dan porter divalidasi otomatis
    saat saya menugaskan tim, supaya saya tidak melanggar aturan jalur tanpa sadar.

## FR-26 — i18n ID/EN, alur WNA (paspor)

- `prd_ref: §5 FR-26`
- `pendukung: §8 (lokalisasi: ID penuh, EN untuk WNA, zona waktu WIB/WITA/WIT per jalur),
  §10.2 (`routes.timezone`), §17 T-142/T-194/T-208`
- MoSCoW: **M (ID) / S (EN)** · Fase: **P1/P2**
- AC:
  - **AC-26.1** (ID, M) Given lokasi `id` sebagai default, when seluruh alur booking dijelajahi,
    then antarmuka berbahasa Indonesia tanpa teks mentah kode (semua string lewat i18n).
    Pengecekan: tes locale + pemeriksaan string.
  - **AC-26.2** (EN, S) Given locale `en` dipilih, when alur WNA dijalankan, then teks berbahasa
    Inggris dan pengisian identitas memakai paspor, bukan NIK (§8, §10.2 `booking_members.is_foreign`).
  - **AC-26.3** Given alur booking diaudit aksesibilitas, when axe dijalankan, then tidak ada
    pelanggaran serius (WCAG 2.2 AA, §8; §17 T-194).
  - **AC-26.4** Given jalur punya `routes.timezone` (mis. `Asia/Makassar` untuk jalur Rinjani
    yang dibuka pukul 08.00 WITA, §8), when jadwal pembukaan/penutupan kuota dan cutoff
    ditampilkan serta dievaluasi pada alur booking, then seluruh waktu dirender dan dibandingkan
    dalam zona waktu jalur itu, bukan zona server. Pengecekan: tes locale/timezone pada jendela
    booking — booking diterima/ditolak sesuai WITA walau server berjalan UTC.
- User story:
  - Sebagai **Rani** (pendaki pemula, §3), saya ingin seluruh alur berbahasa Indonesia yang
    jelas, supaya saya memahami setiap langkah tanpa istilah asing.
  - Sebagai **Sari** (pemilik TO, §3), saya ingin wisatawan asing memesan lewat paspor dan
    tampilan Inggris, supaya rombongan WNA tidak tersendat di formulir.

## FR-27 — Perlindungan lonjakan: rate limit, antrean (waiting room), idempotency key

- `prd_ref: §5 FR-27`
- `pendukung: §8 (300 permintaan booking/detik 10 menit [ASUMSI, kalibrasi dari pilot]),
  §11 (rate limit per IP/akun/tenant, Idempotency-Key), §13 (bot/scalper), §17 T-147/T-193`
- MoSCoW: **M** · Fase: **P1**
- AC:
  - **AC-27.1** Given klien melewati batas rate limit per IP/akun/tenant, when request dikirim,
    then menerima 429 dengan kode error terstandar (§11, §13).
  - **AC-27.2** Given pembukaan kuota berlangsung dengan lonjakan, when load test berjalan,
    then tidak ada request booking yang gagal karena error 5xx (hanya 200, atau antrean waiting
    room/429) dan p95 waktu tunggu di waiting room < 60 detik. Ambang 60 detik adalah
    **[REKOMENDASI]** — kalibrasi ulang setelah pilot; PRD hanya menetapkan beban 300 permintaan
    booking/detik selama 10 menit [ASUMSI, kalibrasi dari pilot] (§8, §17 T-193).
  - **AC-27.3** Given request tulis dengan `Idempotency-Key` yang sama dikirim ulang, when
    diproses, then hanya satu resource/charge yang dibuat (§11, §10.3).
- User story:
  - Sebagai **Pak Joko** (pengelola basecamp, §3), saya ingin sistem tetap melayani saat
    pembukaan kuota ramai, supaya pendaki saya tidak melihat situs mati di jam pembukaan.
  - Sebagai **Andy** (owner SaaS, §3), saya ingin perlindungan lonjakan bawaan platform,
    supaya tenant kecil aman dari bot tanpa konfigurasi mereka.

## FR-28 — Billing langganan SaaS + metering

- `prd_ref: §5 FR-28`
- `pendukung: §4.2, §14 (paket, fee transaksi [VERIFIKASI mekanisme]), §17 T-301`
- MoSCoW: **M** · Fase: **P3**
- AC:
  - **AC-28.1** Given tenant berlangganan paket dan memiliki transaksi pada periode berjalan,
    when invoice dibuat, then tagihan = langganan bulanan + fee transaksi dihitung dari
    metering, seluruhnya integer rupiah (§14, §10.2).
  - **AC-28.2** Given tagihan jatuh tempo tidak dibayar, when batas tercapai, then tenant
    disuspend; when pembayaran diterima, then diaktifkan kembali (§17 T-301). Pengecekan: tes
    status langganan.
- User story:
  - Sebagai **Andy** (owner SaaS, §3), saya ingin penagihan langganan dan fee transaksi
    dihitung otomatis per tenant, supaya pendapatan platform tercatat tanpa rekap manual.

## FR-29 — Domain kustom per tenant

- `prd_ref: §5 FR-29`
- `pendukung: §4.2 (domain kustom), §17 T-302`
- MoSCoW: **S** · Fase: **P3**
- AC:
  - **AC-29.1** Given tenant menghubungkan domain sendiri, when domain diakses, then sertifikat
    TLS valid terpasang otomatis dan halaman menampilkan data + branding tenant itu (§17 T-302).
    Given host tidak dikenal, then ditolak.
- User story:
  - Sebagai **Pak Joko** (pengelola basecamp, §3), saya ingin halaman booking berada di domain
    basecamp saya sendiri, supaya pelanggan saya percaya pada alamat resmi saya.

## FR-30 — Open trip (gabung trip, patungan biaya)

- `prd_ref: §5 FR-30`
- `pendukung: §4.1 (tipe tenant trek_operator), §14`
- MoSCoW: **C** · Fase: **P3**
- AC:
  - **AC-30.1** Given open trip dipublikasikan, when peserta bergabung, then slot peserta
    terisi dan biaya terbagi rata/patungan dihitung sebagai integer rupiah yang dijumlahkan
    persis sama dengan total trip — tanpa sisa pembulatan (§10.2).
- User story:
  - Sebagai **Sari** (pemilik TO / open trip, §3), saya ingin peserta bisa bergabung dan
    patungan biaya terhitung otomatis, supaya saya tidak membagi biaya lewat kalkulator dan
    transfer manual.

## FR-31 — Sewa alat dan homestay (inventori)

- `prd_ref: §5 FR-31`
- `pendukung: §12 (item tambahan), §17 T-305`
- MoSCoW: **C** · Fase: **P3**
- AC:
  - **AC-31.1** Given inventori alat/homestay punya stok per tanggal, when booking menempati
    unit pada tanggal itu, then ketersediaan berkurang; when booking dibatalkan, then
    ketersediaan pulih; pemesanan unit yang sudah penuh pada tanggal sama ditolak.
    Pengecekan: tes inventori.
- User story:
  - Sebagai **Sari** (pemilik TO, §3), saya ingin stok sewa alat dan homestay terpantau per
    tanggal, supaya saya tidak meminjamkan alat yang sama dua kali.
  - Sebagai **Rani** (pendaki pemula, §3), saya ingin menyewa alat bersama tiket, supaya saya
    tidak membawa perlengkapan penuh dari rumah.

## FR-32 — API publik + widget embed

- `prd_ref: §5 FR-32`
- `pendukung: §11 (rate limit, versi di URL), §17 T-303`
- MoSCoW: **S** · Fase: **P3**
- AC:
  - **AC-32.1** Given API key diterbitkan per tenant, when API publik dipanggil, then key
    divalidasi, dibatasi rate limit-nya (§11), dan tidak pernah mengembalikan data tenant
    lain. Given widget disematkan di situs pihak ketiga, then status jalur/kuota tampil
    terbaru (§17 T-303).
- User story:
  - Sebagai **Pak Joko** (pengelola basecamp, §3), saya ingin menempelkan widget status jalur
    di situs komunitas saya, supaya anggota komunitas melihat kuota tanpa membuka aplikasi.

## FR-33 — Paket template single-tenant (installer, docs, lisensi)

- `prd_ref: §5 FR-33`
- `pendukung: §0 D1 (TENANT_MODE=single), §4.2 (template), §15 exit criteria P3, §17 T-307`
- MoSCoW: **M** · Fase: **P3**
- AC:
  - **AC-33.1** Given server bersih, when installer paket template dijalankan dengan
    `TENANT_MODE=single`, then build identik SaaS terpasang lengkap dengan seed, dokumentasi,
    dan lisensi dalam < 30 menit (§15 exit criteria P3). Pengecekan: instalasi tercatat waktu.
- User story:
  - Sebagai **Andy** (owner SaaS, §3), saya ingin paket template yang terpasang sendiri di
    server pelanggan, supaya saya punya jalur pendapatan lisensi selain langganan.

## FR-34 — Laporan kondisi jalur + ulasan

- `prd_ref: §5 FR-34`
- `pendukung: §17 T-306 (moderasi)`
- MoSCoW: **C** · Fase: **P3**
- AC:
  - **AC-34.1** Given pendaki mengirim ulasan kondisi jalur, when belum dimoderasi, then belum
    tampil publik; when disetujui moderasi, then tampil pada halaman jalur beserta tanggal
    kunjungannya (§17 T-306).
- User story:
  - Sebagai **Rani** (pendaki pemula, §3), saya ingin membaca ulasan kondisi jalur terbaru
    dari pendaki lain, supaya saya tahu kondisi riil sebelum berangkat.

## FR-35 — **Official Link Mode** (info + alert + deep-link)

- `prd_ref: §5 FR-35`
- `pendukung: §0 D2, §4.1 (tipe official_link, tanpa transaksi), §7.4, §4.3 (integrasi langsung
  sistem resmi di luar MVP, keberadaan API publik [VERIFIKASI]), §17 T-009/T-103/T-115`
- MoSCoW: **M** · Fase: **P1**
- AC:
  - **AC-35.1** Given tenant bertipe `official_link`, when halaman jalur dibuka, then tampil:
    status buka/tutup beserta sumber dan tanggal, ringkasan aturan dengan tanggal verifikasi,
    cuaca, tombol "Booking di situs resmi" sebagai deep-link, dan langganan "Beri tahu saya
    jika dibuka" (§7.4).
  - **AC-35.2** Given tenant bertipe `official_link`, when permintaan hold/bayar dikirim, then
    tidak ada transaksi yang bisa dibuat (§4.1: "Tidak ada transaksi"). Pengecekan: endpoint
    booking menolak tipe tenant ini.
  - **AC-35.3** Given pendaki berlangganan alert, when status jalur berubah menjadi buka, then
    notifikasi terkirim (§7.4, FR-18).
- User story:
  - Sebagai **Rani** (pendaki pemula, §3), saya ingin satu halaman yang menampilkan status
    resmi, aturan, dan tautan booking resmi, supaya saya tidak tersesat ke penjual tiket
    palsu.
  - Sebagai **Sari** (pemilik TO, §3), saya ingin tahu segera saat jalur resmi dibuka, supaya
    saya bisa segera menyiapkan keberangkatan trip.

## FR-36 — Privasi: consent, retensi, ekspor/hapus data, enkripsi field sensitif

- `prd_ref: §5 FR-36`
- `pendukung: §8 (UU PDP No. 27/2022 [VERIFIKASI ke konsultan]; NIK dan dokumen terenkripsi),
  §13, §10.2 (booking_members NIK/paspor terenkripsi), §17 T-143/T-192`
- MoSCoW: **M** · Fase: **P1**
- AC:
  - **AC-36.1** Given NIK/paspor disimpan, when basis data dibaca langsung (dump), then nilai
    terenkripsi — dekripsi hanya lewat lapisan aplikasi berwenang (§10.2, §8).
  - **AC-36.2** Given kebijakan retensi N hari setelah pendakian dikonfigurasi, when jadwal
    berjalan, then dokumen terkait dihapus; akses dokumen tetap tercatat (§13).
  - **AC-36.3** Given subjek data meminta ekspor atau penghapusan, when diproses, then berkas
    ekspor diserahkan dan data yang wajib dihapus dihapus (§5 FR-36; kepatuhan UU PDP
    [VERIFIKASI ke konsultan] §8/§13). Pengecekan: tes alur ekspor/hapus.
- User story:
  - Sebagai **Rani** (pendaki pemula, §3), saya ingin data identitas saya dienkripsi dan bisa
    saya minta dihapus setelah pendakian, supaya data saya aman dan sesuai hak saya.
  - Sebagai **Andy** (owner SaaS, §3), saya ingin kontrol privasi bawaan platform, supaya
    setiap tenant mematuhi kewajiban tanpa membangun sendiri.

## FR-37 — Import Mountain Pack dengan validator sumber (`source_url`, `verified_at`)

- `prd_ref: §5 FR-37`
- `pendukung: §0 D9, §6.1 (CI gagal / badge perlu verifikasi), §17 T-004/T-114/T-132`
- MoSCoW: **M** · Fase: **P1**
- AC:
  - **AC-37.1** Given pack tanpa `source_url` atau `verified_at` pada aturannya, when import/
    seeder dijalankan, then impor ditolak dengan rincian galat — aturan tanpa sumber tidak
    pernah masuk (§6.1). Pengecekan: `php artisan db:seed` exit non-zero.
  - **AC-37.2** Given aturan dengan `verified_at` lebih dari 90 hari, when ditampilkan, then
    badge "perlu verifikasi" muncul (§6.1); pack yang belum diverifikasi tenant berlabel
    "DEMO" (§17 T-004).
  - **AC-37.3** Given pack berisi gunung/jalur/aturan, when impor selesai, then seluruh aturan
    menyimpan cakupan (`tenant|mountain|route`), masa berlaku, sumber, dan tanggal verifikasi
    (§6.1) dan siap dipakai FR-03/FR-08.
- User story:
  - Sebagai **Pak Joko** (pengelola basecamp, §3), saya ingin aturan jalur saya diimpor
    lengkap dengan sumber dan tanggal verifikasinya, supaya saya tahu aturan itu masih berlaku.
  - Sebagai **Andy** (owner SaaS, §3), saya ingin validator sumber menolak data tanpa sumber,
    supaya klaim aturan pendakian tidak pernah masuk tanpa bukti.

## FR-38 — Deklarasi logistik/sampah + deposit sampah opsional

- `prd_ref: §5 FR-38`
- `pendukung: §17 T-209`
- MoSCoW: **S** · Fase: **P2**
- AC:
  - **AC-38.1** Given tenant mengaktifkan deklarasi logistik/sampah, when booking dibuat, then
    deklarasi barang bawaan/ekspektasi sampah tercatat pada booking; deposit hanya dikenakan
    bila tenant mengaktifkannya, berupa integer rupiah, tampil di ringkasan bayar, dan masuk
    `ledger_entries` (§10.2). Pengecekan: tes booking dengan dan tanpa deposit.
- User story:
  - Sebagai **Pak Joko** (pengelola basecamp, §3), saya ingin pendaki mendeklarasikan barang
    bawaan dan (opsional) menaruh deposit sampah, supaya jalur tetap bersih dan jejak mereka
    terlacak.

## FR-39 — Design system sendiri: token, Tailwind v4, `packages/ui`, tema tenant dengan validator kontras

- `prd_ref: §5 FR-39`
- `pendukung: §9.4A, §17 T-010/T-011/T-012`
- MoSCoW: **M** · Fase: **P1**
- AC:
  - **AC-39.1** Given token di `packages/design-tokens`, when build berjalan, then token
    dihasilkan menjadi CSS variables dan dipetakan ke `@theme` Tailwind v4; pemeriksaan CI
    gagal bila ada warna/ukuran hardcode di komponen `packages/ui` (§9.4A).
  - **AC-39.2** Given warna merek tenant diuji validator kontras, when gagal WCAG AA, then
    warna ditolak atau disesuaikan (§9.4A). Pengecekan: tes validator.
  - **AC-39.3** Given komponen `packages/ui` (Button, Input, Select, Dialog, Sheet, Tabs,
    Toast, DataTable, Calendar kuota, StatusBadge jalur, QuotaMeter, Stepper booking), when
    diuji, then lulus axe, punya state loading/empty/error, dan tersedia di katalog; ukuran CSS
    hasil build dalam budget CI (§9.4A).
- User story:
  - Sebagai **Andy** (owner SaaS, §3), saya ingin design system milik sendiri yang bisa
    di-white-label dan ikut terjual dalam paket template, supaya saya tidak tergantung lisensi
    tema pihak ketiga.

## FR-40 — Dashboard konsol buatan sendiri: shell, RBAC nav, tabel data, widget operasional, mobile-usable

- `prd_ref: §5 FR-40`
- `pendukung: §9.4B, §17 T-185/T-186/T-187/T-188`
- MoSCoW: **M** · Fase: **P1**
- AC:
  - **AC-40.1** Given user dengan peran berbeda login, when konsol dibuka, then navigasi
    sidebar/topbar hanya menampilkan menu yang berwenang (nav berbasis RBAC); command palette
    (Ctrl+K), breadcrumb, dan notifikasi berfungsi (§9.4B).
  - **AC-40.2** Given tabel data pada halaman booking/kuota/aturan, when filter, sort, dan
    paginasi diterapkan, then permintaan dilakukan server-side, ekspor dan aksi massal
    tersedia, dan kolom bisa diatur (§9.4B, §17 T-186).
  - **AC-40.3** Given dashboard dibuka pada layar ponsel kecil, when digunakan, then seluruh
    widget operasional (okupansi, pendapatan, kasus closure terbuka, di gunung sekarang,
    anomali webhook) tetap terbaca dan dapat dioperasikan (§9.4B "Mobile").
- User story:
  - Sebagai **Pak Joko** (pengelola basecamp, §3), saya ingin dashboard yang berfungsi di
    ponsel saya, supaya saya bisa memantau kuota dan uang masuk saat berada di lapangan.
  - Sebagai **Sari** (pemilik TO, §3), saya ingin tabel booking yang bisa saya saring dan
    ekspor, supaya saya cepat menyiapkan data keberangkatan trip.

## FR-41 — Landing pemasaran + landing tenant berbasis blok, target Lighthouse §9.4

- `prd_ref: §5 FR-41`
- `pendukung: §9.4C, §17 T-116/T-117`
- MoSCoW: **M** · Fase: **P1**
- AC:
  - **AC-41.1** Given halaman landing diuji di CI pada profil mobile 4G, when Lighthouse
    berjalan, then Performance ≥ 95, Accessibility 100, Best Practices ≥ 95, SEO ≥ 95,
    LCP < 2,0 s, CLS < 0,05 (§9.4C). Pengecekan: target ambang di job CI.
  - **AC-41.2** Given landing pemasaran, when halaman dibuka, then hero menampilkan status
    jalur dan kuota hidup (contoh data DEMO) dengan satu CTA utama; seluruh elemen struktur
    §9.4C tersedia (bukti kepercayaan → masalah → cara kerja 3 langkah → fitur per persona
    pendaki/basecamp/TO → papan status gunung → harga → FAQ → CTA akhir). Pengecekan checklist
    per elemen: setiap blok copy yang menyebut angka, kuota, harga, atau aturan pendakian wajib
    membawa atribut tautan sumber (`source_url`) pada struktur halaman, dan pemeriksaan CI
    gagal bila ada blok klaim tanpa atribut sumber; hero wajib memuat label "DEMO"
    (§9.4C Copy, Visual, Struktur).
  - **AC-41.3** Given tenant mengatur blok landing-nya, when urutan/isi diubah dari konsol,
    then halaman tenant berubah tanpa perubahan kode (§9.4C "Blok tenant").
- User story:
  - Sebagai **Andy** (owner SaaS, §3), saya ingin landing pemasaran yang cepat dan menjelaskan
    masalah penutupan jalur secara spesifik, supaya pengunjung mengerti produk lalu mencoba
    demo.
  - Sebagai **Pak Joko** (pengelola basecamp, §3), saya ingin landing bertema basecamp saya
    yang bisa saya atur bloknya sendiri, supaya calon pendaki saya mendapat halaman resmi yang
    siap pakai.

---

## Catatan kepatuhan

- Jumlah entri: 41 (FR-01..FR-41), sama persis dengan tabel §5. Tidak ada FR tambahan.
- Setiap FR memiliki ≥1 AC terukur dan ≥1 user story yang menyebut persona §3.
- Label dari PRD dipertahankan verbatim: [ASUMSI] (mis. satu kali gratis §6.4, 300 req/detik
  §8, estimasi roadmap §15, harga lisensi §14), [VERIFIKASI] (mis. rasio SOP Rinjani §6.3,
  mekanisme fee §14, UU PDP §8, API pemerintah §4.3), [REKOMENDASI] (§9.4A — keputusan tidak
  memakai template admin), [FAKTA] (klaim bersumber di §2.1–§2.2, dirujuk sebagai konteks, tidak
  dijadikan klaim produk baru).
- AC hanya memakai angka/p perilaku yang tertulis di PRD; angka yang berupa target atau asumsi
  tetap ditandai dengan label aslinya.
