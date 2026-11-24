# ADR-002 — Pembayaran BYO Midtrans per tenant (platform tidak memegang dana)

> **Status:** accepted · **Tanggal:** 2026-11-24 · **Owner:** tg-architect
> **Keputusan inti PRD:** §0 **D4** · **Rujukan:** PRD §4.3, §9.2, §10.2, §11, §12, §13, §14, §18.3 · **FR:** FR-13, FR-14, FR-15
> **Ditetapkan oleh:** T-005 (`docs/board/tasks/T-005.yml`)

## Konteks

D4: "Pembayaran: tiap tenant memakai akun Midtrans sendiri (**BYO merchant**) di MVP. Platform tidak
memegang dana." Alasannya risiko hukum menampung dana pihak ketiga ([VERIFIKASI] ke konsultan, PRD §20.2 #5).

Konsekuensi yang sudah dinyatakan PRD:

- §10.2: `tenants` menyimpan `midtrans_*` **terenkripsi**.
- §11: endpoint webhook per tenant — `POST /v1/webhooks/midtrans/{tenant}` (verifikasi signature, idempoten).
- §12: Snap, VA, QRIS; webhook; sandbox dulu; simpan kunci terenkripsi; verifikasi signature;
  rekonsiliasi harian.
- §13: webhook palsu ditangkal dengan verifikasi signature + cek status ke API Midtrans + idempotensi.
- §14: "Fee transaksi memakai akun Midtrans tenant (BYO), sehingga penagihan fee platform dilakukan
  **terpisah (invoice bulanan)**".
- §18.3: tes sandbox wajib — sukses, gagal, kedaluwarsa, duplikat, out-of-order.
- §4.3 menaruh "pembayaran multi-merchant otomatis dengan split dana" **di luar lingkup MVP**.

Prasyarat paket: `midtrans/midtrans-php` verdict **wajib** (PRD §9.2) dan **approve** oleh tg-security
(ADR-006). Belum terpasang di `apps/api/composer.lock` saat ADR ini ditulis.

## Keputusan

1. **Kredensial Midtrans milik tenant, per tenant.** Kolom `tenants.midtrans_*` (server key, client key,
   merchant id) disimpan **terenkripsi** (ADR-005) dan hanya dibaca oleh lapisan integrasi.
2. **Semua transaksi tenant dibuat dengan akun tenant sendiri** (Snap/VA/QRIS). Tidak ada akun merchant
   platform yang menampung dana tenant; platform tidak pernah menjadi pemilik aliran dana (D4).
3. **Webhook per tenant**: `POST /v1/webhooks/midtrans/{tenant}`; alur wajib:
   (a) resolusi tenant dari path, (b) verifikasi signature dengan server key tenant itu,
   (c) verifikasi ulang status ke API Midtrans, (d) pemrosesan idempoten.
   Semua endpoint tulis menerima `Idempotency-Key` (PRD §10.3) dan settlement diproses tepat sekali.
4. **`payments.provider_ref` unik + `ledger_entries` append-only**: settlement sukses memindahkan
   `reserved → sold` dalam satu transaksi (ADR-003); duplikat/out-of-order tidak menambah entri buku besar.
5. **Rekonsiliasi harian per tenant** terhadap laporan Midtrans; selisih tampil + alert (FR-13 AC-13.4,
   PRD §8 observabilitas).
6. **Fee platform ditagih terpisah** sebagai invoice bulanan (PRD §14), bukan potongan/split dari
   transaksi tenant. `ledger_entries` mencatat fee sebagai entri platform, bukan mutasi dana tenant.
7. **Tenant tanpa kredensial tidak dapat bertransaksi.** Sistem menolak `POST /v1/bookings/{code}/pay`
   dengan error terstandar dan menandai tenant "belum siap bayar"; tenant bertipe `official_link` tidak
   punya transaksi sama sekali (FR-35 AC-35.2).
8. Midtrans **sandbox** dipakai untuk semua tes otomatis (§18.3); kredensial produksi hanya di secret
   manager (PRD §13 "Rahasia").
9. **Uang = integer rupiah, tidak pernah float** (`AGENTS.md` aturan 6): `bookings.total_amount`, semua
   jumlah di `ledger_entries` (termasuk entri fee platform), `payments`, dan `refunds` memakai kolom
   integer NOT NULL (rupiah; MVP tidak multi-currency). Tipe `float`/`double`/`decimal` untuk uang
   **dilarang**; `brick/money` (verdict approve, ADR-006) hanya pembungkus nilai — aritmetika uang tetap
   integer rupiah.

## Alternatif yang ditolak

1. **Platform memegang dana (satu merchant platform, dana diteruskan ke tenant).**
   Ditolak: risiko hukum menampung dana pihak ketiga (D4) dan [VERIFIKASI] konsultan belum selesai;
   juga menuntut proses payout, KYC tenant, dan pembukuan platform yang tidak ada di MVP.
2. **Satu akun merchant platform + split payment otomatis.**
   Ditolak: secara eksplisit **di luar lingkup MVP** (PRD §4.3) dan tetap berarti platform menjadi pihak
   dalam aliran dana.
3. **Midtrans sub-account / Iris (payout) per tenant dari merchant platform.**
   Ditolak untuk MVP: menambah ketergantungan fitur berbayar dan proses onboarding bank per tenant,
   sementara tujuan D4 justru menghindari platform menyentuh dana.
4. **Transfer manual + unggah bukti (rekonsiliasi manusia).**
   Ditolak: FR-13 menuntut Snap/VA/QRIS dan webhook idempoten; ini sumber masalah yang produk ini
   selesaikan (PRD §3, "Pak Joko: transfer manual, rekap WhatsApp").
5. **Membangun gateway pembayaran sendiri.**
   Ditolak: keluar dari D7 (stack) dan menambah permukaan kepatuhan (PCI) tanpa manfaat.
6. **Menyimpan kredensial Midtrans sebagai plaintext atau hash.**
   Ditolak: kredensial harus dapat dipakai ulang (bukan hash) dan tidak boleh bocor lewat dump DB —
   karena itu wajib cast terenkripsi (ADR-005, PRD §13).

## Konsekuensi

- **Onboarding tenant bertambah satu langkah operasional**: tenant harus punya akun Midtrans sendiri dan
  memasukkan kredensialnya; kelalaian di sini memblokir fitur "tenant bisa menjual tiket" dan wajib
  terlihat di konsol, bukan gagal diam.
- Webhook menjadi multi-tenant: log webhook harus memuat tenant, dan verifikasi signature memakai kunci
  tenant yang benar (bukan kunci global).
- Rotasi kredensial per tenant harus didukung tanpa restart (kredensial dibaca dari DB, bukan cache
  proses) — ini membebani jalur baca kredensial: gunakan cache pendek + invalidasi saat update.
- Fee platform bergantung pada metering transaksi platform (`ledger_entries`), bukan pada mutasi di akun
  Midtrans tenant; invoice bulanan adalah pekerjaan P3 (FR-28) dan **tidak** menghambat P1.
- Tes pembayaran wajib multi-tenant: dua tenant dengan sandbox berbeda, satu webhook salah tenant harus
  ditolak (isolasi tenant, ADR-001).
- Biaya/kebijakan Midtrans (MDR, batas VA/QRIS) menjadi tanggung jawab tenant; dukungan pelanggan harus
  membedakan masalah platform vs masalah akun Midtrans tenant.
- Status hukum tetap **[VERIFIKASI]** (PRD §20.2 #5). Bila hasil konsultasi mengharuskan platform
  memegang dana, ADR ini harus digantikan (superseded) — bukan diubah diam-diam.

## Pemetaan keputusan inti PRD §0

| Keputusan | Relasi |
|---|---|
| **D4** | **Implementasi utama**: BYO merchant per tenant; platform tidak memegang dana; fee ditagih terpisah (§14). |
| D1 | Prasyarat: kredensial per tenant disimpan di baris tenant, terenkripsi, dan terisolasi lewat global scope (ADR-001). |
| D5 | Terkait: closure `cancel_existing` memicu refund/reschedule (FR-07/FR-14) yang bergantung pada state pembayaran tenant yang akurat. |
| D7 | Menegaskan integrasi Midtrans ada di `apps/api` (Laravel) dengan `midtrans/midtrans-php`; PWA/POS tidak memegang kredensial. |

## Status

**accepted** — berlaku sejak 2026-11-24, dengan satu item terbuka yang tidak mengubah keputusan:
status hukum D4 masih **[VERIFIKASI]** (PRD §20.2 #5). Turunan wajib:

- `apps/api/app/Integrations/**` (tg-integrations): klien Midtrans per tenant, verifikasi signature,
  rekonsiliasi.
- `apps/api/routes/**` (tg-backend): `POST /v1/webhooks/midtrans/{tenant}`, idempotensi, error terstandar.
- ADR-005: daftar kolom terenkripsi memuat `tenants.midtrans_*`.
