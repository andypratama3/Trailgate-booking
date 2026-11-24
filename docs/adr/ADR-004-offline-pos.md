# ADR-004 — POS offline: app Next terpisah + antrean IndexedDB, first-scan-wins

> **Status:** accepted · **Tanggal:** 2026-11-24 · **Owner:** tg-architect
> **Keputusan inti PRD:** §0 **D7** (dan §0 **D5** untuk jalur closure/overdue) · **Rujukan:** PRD §8, §9.1, §10.2, §10.4, §11, §18.3, temuan review tg-architect T-001 **F1A-5** · **FR:** FR-16, FR-17, FR-07
> **Ditetapkan oleh:** T-005 (`docs/board/tasks/T-005.yml`)

## Konteks

PRD §8 menetapkan PWA pos "jalan penuh tanpa sinyal **≥ 24 jam**; sinkron saat online", dengan aturan
konflik "*first scan wins* + log". PRD §18.3 menuntut DoD "Uji mode pesawat 24 jam + sinkron + scan
ganda". FR-16 AC-16.1/AC-16.2 memindahkan ini ke kontrak konkret:

- event check-in/out mengantre di **IndexedDB** saat offline, dikirim sebagai batch `POST /v1/pos/sync`
  dengan `client_event_id` unik; pengiriman ulang tidak menggandakan event (§10.2, §11);
- setelah offline ≥ 24 jam, seluruh event tercatat tanpa kehilangan; konflik scan → **first scan wins**,
  konflik tercatat di log.

PRD §9.1 memetakan monorepo dengan `apps/pos` sebagai **PWA**, dan secara eksplisit mengizinkan dua
bentuk: "`apps/pos` (PWA; **boleh satu app Next dengan route group terpisah**)" — jadi topologi adalah
pilihan, bukan ketetapan PRD. Review tg-architect pada T-001 (**temuan F1A-5**) menuntut pilihan ini
dinyatakan sebagai konsekuensi arsitektur, bukan tersirat dari struktur direktori.

Fakta repo saat ADR ini ditulis:

- `apps/pos/package.json` ada dengan nama paket `@trailgate/pos` dan skrip `next dev -p 3001`
  (port 3001, berbeda dari `apps/web` yang 3000 lewat `docker-compose.yml`).
- Akar `package.json` sudah menyediakan `dev:pos` dan `build:pos` (`pnpm --filter @trailgate/pos ...`),
  sedangkan `dev`/`build` menunjuk `@trailgate/web`.
- `pnpm-workspace.yaml` memetakan `apps/*` dan `packages/*` — dua app Next adalah dua paket workspace.
- `docker/web/Dockerfile` menyatakan dirinya untuk "`apps/web` + `apps/pos`" (satu image Node, dua app);
  tetapi `docker-compose.yml` saat ini hanya punya satu service `web` yang menjalankan `@trailgate/web` —
  service/origin POS belum ada.
- Versi Next identik di kedua app: `next 16.4.6`, `react 19.3.1` (`apps/web/package.json`,
  `apps/pos/package.json`, dikunci di `pnpm-lock.yaml`).

## Keputusan

1. **`apps/pos` adalah aplikasi Next.js terpisah** (paket `@trailgate/pos`), bukan route group di dalam
   `apps/web`. Konsekuensi yang diterima sadar:
   - **dua app Next** dalam satu monorepo, masing-masing dengan konfigurasi, build, dan deploy sendiri;
   - **IndexedDB (dan seluruh Web Storage) bersifat per-origin**, sehingga antrean scan, cache manifest, dan
     kunci publik QR tiket milik POS **tidak** dibagi dengan `apps/web` dan tidak dapat dibaca app lain;
   - **service worker dan manifest PWA milik POS sendiri**, dengan scope POS, sehingga pemasangan PWA
     "aplikasi pos" tidak bergantung pada cache/strategi `apps/web`.
2. **Antrean offline-first di POS**: setiap scan check-in/out ditulis ke IndexedDB dengan
   **`client_event_id` yang dibuat perangkat (UUID) dan unik secara global** (§10.2
   `checkpoint_events.client_event_id UNIQUE`). Sinkronisasi mengirim batch `POST /v1/pos/sync`; pengiriman
   ulang idempoten di server — duplikat dibuang, **tidak** menghasilkan event kedua.
   **Antrean adalah penyimpanan referensi, bukan PII.** Yang boleh ada di IndexedDB: `booking_id`/
   `booking.code`, `client_event_id`, `ticket_id`, `checkpoint_id`, `scanned_at`, `type` (in/out),
   `device_id`, dan — bila perlu untuk tampilan petugas — **nama pendaki**. **DILARANG** menyimpan NIK,
   nomor paspor, surat sehat, izin ortu/consent, bukti asuransi, atau payload dokumen apa pun; payload
   semacam itu yang terkirim dari server **dibuang di sisi klien** (tidak dipersist di IndexedDB, tidak
   di-cache service worker, tidak ditulis ke log klien). Bila tampilan identitas penuh benar-benar
   dibutuhkan saat check-in, itu memerlukan **ADR terpisah** yang menyatakan proteksi sisi perangkat
   (tanpa PII plaintext di disk).
3. **Verifikasi tiket tanpa sinyal**: POS menyimpan kunci publik verifikasi + daftar revoke (PRD §10.4) dan
   memverifikasi tanda tangan QR **secara lokal**; verifikasi tidak boleh memerlukan jaringan.
4. **Konflik = *first scan wins*** (PRD §8): bila dua perangkat memindai anggota yang sama, event dengan
   waktu scan pertama menang; event yang kalah **tidak** membatalkan event pertama tetapi dicatat di log
   konflik (dan tampil sebagai peringatan di konsol/manifest). Tiket yang dipindai dua kali menampilkan
   peringatan, **bukan** crash (PRD §10.4).
5. **Manifest read-only cache**: POS memuat `GET /v1/pos/manifest` dan `GET /v1/pos/revocations` saat
   online, lalu melayani permintaan offline dari cache lokal; tidak ada penulisan data booking dari POS.
   Cache manifest/revocation hanya memuat **referensi + nama** (`booking_member_id`, `ticket_id`, status
   in/out) dengan aturan PII butir 2 dan tunduk pada **kebijakan purge**: entri antrean dihapus setelah
   sinkron sukses terverifikasi, cache manifest lama dibuang saat versi baru diterima, dan storage POS
   boleh dibersihkan tanpa kehilangan data (karena tidak ada PII yang hanya ada di perangkat).
6. **Uji wajib (DoD §18.3)**: mode pesawat 24 jam → sinkron → seluruh event utuh, ditambah uji scan ganda
   (dua perangkat, event sama, ekspektasi first-scan-wins + baris log konflik). Bagian AC uji offline
   FR-16 juga mencakup **audit isi penyimpanan klien**: setelah sinkron, tidak ada NIK/paspor/surat
   sehat/consent di antrean maupun cache manifest, dan antrean ter-purge setelah sinkron sukses. Uji ini
   dijalankan di origin POS, bukan di `apps/web`.
7. **Operasional**: POS mendapat origin/port sendiri (dev `3001`, produksi origin terpisah) dan aturan
   Cloudflare/rate limit sendiri (PRD §9.1). Deploy POS dipisahkan dari deploy web publik; tanpa itu,
   perubahan halaman pemasaran berisiko memaksa pemasangan ulang PWA POS.

## Alternatif yang ditolak

1. **Satu app Next (`apps/web`) dengan route group terpisah (mis. `apps/web/app/(pos)/**`).**
   Diizinkan PRD §9.1, ditolak dengan alasan konkret:
   - **IndexedDB terbagi per origin.** Antrean scan offline akan hidup di origin yang sama dengan web
     publik/konsol. Setiap perubahan cache di web menyentuh basis data yang menyimpan event lapangan yang
     belum tersinkron — risiko kehilangan data absen/check-in yang tidak dapat direkonstruksi.
   - **Service worker dan manifest berbagi scope.** Satu SW untuk web publik (SSR/SEO, halaman pemasaran,
     konsol) dan POS (app-shell offline agresif) memaksa strategi cache kompromi: cache agresif untuk
     halaman publik (SEO/LCP gagal, PRD §8), atau cache lemah untuk POS (syarat "≥ 24 jam offline" gagal).
   - **Anggaran bundel bercampur.** POS menargetkan Android murah/jaringan lambat (PRD §8), sementara
     web publik membawa peta MapLibre dan halaman pemasaran; satu grafik build membuat kedua target saling
     mengunci.
   - **Blast radius satu build.** Rush halaman pemasaran dapat memaksa rilis ulang PWA POS (dan sebaliknya),
     memperbesar risiko regresi pada jalur keselamatan (manifest/overdue).
   - **Kontrak API berbeda kelas**: POS memakai `Idempotency-Key`/batch sync dan perangkat tersimpan,
     web publik anonim + cache CDN; memisahkan app memisahkan kebijakan cache, rate limit, dan auth.
2. **Aplikasi native (Android) untuk petugas pos.** Ditolak: di luar lingkup MVP (PRD §4.3) dan menambah
   jalur rilis toko aplikasi.
3. **POS berbasis Service Worker murni tanpa IndexedDB (antrean di memori/LocalStorage).**
   Ditolak: LocalStorage sinkron dan berukuran kecil; kehilangan daya/tab tertutup akan menghilangkan event
   yang belum tersinkron. IndexedDB satu-satunya penyimpanan klien yang cocok untuk ≥ 24 jam event
   (PRD §8).
4. **Idempotensi di sisi klien saja (flag "terkirim" lokal).** Ditolak: tidak melindungi dari retry
   jaringan di tengah batch; keunikan `client_event_id` harus ditegakkan di DB (`UNIQUE`, §10.2).
5. **"Last scan wins"** untuk konflik. Ditolak: PRD §8 menetapkan *first scan wins*; arah lain membuka
   celah check-out yang membalikkan check-in pertama tanpa jejak.
6. **Menaruh auth petugas di domain web publik.** Ditolak: POS diakses di perangkat lapangan bersama;
   origin terpisah memisahkan cookie/sesi dan audit per perangkat (PRD §13, sesi pendek).

## Konsekuensi

- **Dua app Next harus dirawat**: kenaikan versi Next/React menyentuh `apps/web` **dan** `apps/pos`
  secara bersamaan; `pnpm-lock.yaml` menegakkannya. Versi dipin sama (ADR-006).
- **Tanpa berbagi IndexedDB**: data hasil scan yang belum tersinkron hanya ada di origin POS. Upgrade/
  ganti app POS harus menyertakan migrasi skema IndexedDB dan larangan membersihkan storage tanpa
  menyelesaikan antrean.
- **Manifest/kunci publik QR di POS adalah salinan**: revoke list dapat basi saat offline — karena itu
  keputusan "first scan wins + log" dipasangkan dengan kewajiban mengirim daftar revoke terbaru saat
  sinkron, dan konsol menandai manifest POS sebagai *stale* bila sinkron terakhir terlalu lama.
- `docker-compose.yml` saat ini hanya menjalankan `@trailgate/web`; **service/origin POS belum ada** →
  pekerjaan tg-devops (compose + `docker/web/Dockerfile`) sebelum uji mode pesawat dapat dijalankan
  end-to-end. Ini konsekuensi topologi yang harus ditutup, bukan asumsi bahwa itu sudah beres.
- Domain khusus POS ditambahkan pada penyiapan produksi (Cloudflare, PRD §9.1): dua origin = dua set aturan
  cache/WAF/rate limit yang harus dijaga konsisten.
- Uji E2E Playwright harus dijalankan per origin (`apps/web` 3000, `apps/pos` 3001), termasuk uji offline
  (route abort/offline context) — pekerjaan tg-qa (T-007/T-162 dkk. per §17).
- Paket pendukung POS mengikuti verdict ADR-006: **Dexie** (IndexedDB) disetujui; **`@serwist/next`**
  **defer** — artinya service worker POS harus direncanakan tanpa bergantung pada Serwist sampai verdict
  berubah (SW kustom atau keputusan baru tercatat).
- `apps/pos/**` dimiliki `tg-console` (`OWNERS.md`), tetapi konsekuensi topologi di atas mengikat
  tg-devops (deploy/compose) dan tg-qa (uji) — bukan hanya pemilik app.

## Pemetaan keputusan inti PRD §0

| Keputusan | Relasi |
|---|---|
| **D7** | **Implementasi utama**: PWA offline untuk petugas pos adalah bagian stack D7 ("PWA untuk petugas pos"), dan ADR ini menetapkan bentuknya (app Next terpisah). |
| D5 | Terkait: POS melayani check-in/out dan manifest/overdue yang menjadi masukan penanganan closure (FR-07/FR-17); kehilangan event offline berarti kehilangan kebenaran lapangan. |
| D1 | Terkait: POS mengakses data tenant yang sama lewat API; antrean offline tidak boleh melintasi tenant dan harus membawa identitas tenant perangkat. |
| D4 | Tidak terkait langsung: POS tidak memegang kredensial atau melakukan transaksi pembayaran (ADR-002). |

## Status

**accepted** — berlaku sejak 2026-11-24, sebagai jawaban tertulis atas temuan review **T-001 F1A-5**
(topologi POS dulu tersirat dari direktori). Turunan wajib:

- `apps/pos/**` (tg-console): antrean IndexedDB, `client_event_id`, SW + manifest sendiri, verifikasi QR
  offline, UI konflik/peringatan scan ganda.
- `apps/api/app/Domain/**` + `routes/**`: `POST /v1/pos/sync` idempoten, `GET /v1/pos/manifest`,
  `GET /v1/pos/revocations`, log konflik.
- tg-devops: service/origin POS di compose + image; tg-qa: uji mode pesawat 24 jam + scan ganda per origin.
- Uji offline FR-16 wajib memuat audit PII sisi klien (butir 2, 5, 6); `apps/pos/**` menegakkan pembuangan
  payload PII di sisi klien.
- Menggabungkan POS ke dalam `apps/web` (atau sebaliknya) memerlukan ADR pengganti, karena mengubah
  konsekuensi per-origin di atas.
