# Skrip Wawancara Basecamp (5 responden)

**Tugas:** T-009 · **FR terkait:** FR-35 (Official Link Mode) + pendukung FR-05/07/09/13/16
**prd_ref:** §3 (persona), §14 (monetisasi), §15 (Gate G0), §20.2 (pertanyaan terbuka), §20.3 (asumsi P0)
**Jumlah responden:** 5 slot — `BASECAMP-01` … `BASECAMP-05` (**semua placeholder, kosong**)
**Durasi:** ±45 menit per responden
**Pewawancara:** manusia (agent hanya menyiapkan kit; hasil wawancara = kerja manusia)

## 0. Aturan pencatatan (wajib dibacakan di pembuka)

1. **Tidak ada data pribadi nyata di repo.** Jangan menulis nama, nomor HP, NIK, email, atau nama gunung+jadwal operasional spesifik ke berkas ini. Isi kolom identitas hanya dengan kode (`BASECAMP-01`) dan, bila perlu, nama pendek inisial rekayasa (`Pak Budi (fiktif)`).
2. Kontak responden dicatat di kanal terpisah di luar repo.
3. Kutipan jawaban boleh diparafrase; jangan simpan daftar peserta/dokumen pendaki.
4. Label `[ASUMSI]`, `[VERIFIKASI]`, `[FAKTA]` dari PRD dipertahankan — jangan ubah jadi fakta. Temuan wawancara dicatat sebagai **data lapangan**, bukan fakta PRD.

## 1. Pembuka (±3 menit)

> "Terima kasih waktu Bapak/Ibu. Saya ingin memahami cara basecamp mengelola kuota, pendaftaran, dan pembayaran hari ini — bukan menjual produk. Wawancara ±45 menit. Nama dan nomor Bapak/Ibu **tidak akan saya catat di dokumen mana pun**; hanya kode jawaban. Boleh berhenti kapan saja. Boleh saya mulai?"

- Pastikan izin tercatat: `SETUJU / TIDAK`.
- Peran responden: `admin basecamp / pemilik / petugas lapangan / lainnya`.
- Cerita pembuka: "Ceritakan, dalam bahasa sehari-hari, bagaimana basecamp menerima pendaftaran pendaki minggu lalu."

## 2. Pertanyaan inti

Setiap pertanyaan punya ID untuk pelacakan. Kolom `Menguji` menunjuk asumsi §20.3 (A-1…A-5) dan/atau hipotesis §14.

**Definisi ID asumsi:** ID `A-1` ... `A-5` diperkenalkan kit T-009 mengikuti urutan kalimat PRD §20.3; ID ini **bukan** milik PRD.

### 2.1 Kondisi operasional hari ini (persona: **Pak Joko, pengelola basecamp** — *"Kuota rapi, uang masuk jelas, laporan, tidak ribet"*; rasa sakit: *buku tamu, transfer manual, rekap WhatsApp* — §3)

| ID | Pertanyaan | Probe lanjutan | prd_ref |
|---|---|---|---|
| B01 | Ceritakan alur pendaftaran hari ini dari pendaki datang sampai dilepas ke jalur. | Mencatat di mana (buku tamu)? Berapa langkah manual? Di mana paling sering salah? | §3 Pak Joko |
| B02 | Puncaknya berapa pendaki per hari/minggu? Bagaimana Anda tahu kuota tersisa? | Pernah lebih dari kapasitas? Apa yang terjadi? | §3, FR-05 |
| B03 | Uang masuk: bagaimana rekapnya? Transfer manual ke rekening siapa? | Perlu berapa jam rekap per minggu? Pernah selisih? | §3 Pak Joko |
| B04 | Saat jalur ditutup mendadak (cuaca, surat resmi, event), apa yang Anda lakukan ke pendaki yang sudah daftar? | Berapa orang dihubungi satu-satu? Berapa lama selesai? Kanal apa (WA/telpon)? | §7.3, FR-07 |
| B05 | Pendaki bertanya "buka atau tutup?" lewat kanal apa? Siapa yang menjawab? | Berapa kali pertanyaan sama terulang per hari? | FR-35, §7.4 |

### 2.2 Asumsi A-1: *Basecamp mau memakai sistem digital berbayar*

| ID | Pertanyaan | Probe | prd_ref |
|---|---|---|---|
| B06 | "Basecamp ini mau memakai sistem digital berbayar" — **setuju, ragu, atau tidak setuju?** | Setuju: sistem apa yang sudah dicoba dan hasilnya? Ragu: apa yang ditunggu? Tidak setuju: syarat agar berubah pikiran? | §20.3 A-1 |
| B07 | Hambatan terbesar adopsi sistem digital berbayar menurut Bapak/Ibu? | Biaya, koneksi, literasi staf, kepercayaan pada pihak lapa, aturan pengelola gunung? | §20.3 A-1 |
| B08 | Siapa yang harus menyetujui pemakaian sistem berbayar di basecamp ini? | Pengurus, kelompok pendaki, pengelola kawasan? Berapa lama prosesnya? | §20.3 A-1 |
| B09 | Kalau sistem digital gratis dulu 3 bulan, apa yang membuat Bapak/Ibu **tetap** memakainya setelahnya? | Kebiasaan baru, laporan, atau hal lain? | §14 Pilot, §20.3 A-1 |

### 2.3 Asumsi A-3: *Petugas pos bisa memakai PWA* (persona: **Mas Dimas, petugas pos** — *"Scan QR cepat, tetap jalan tanpa sinyal"*; rasa sakit: *sinyal hilang, data ganda* — §3)

| ID | Pertanyaan | Probe | prd_ref |
|---|---|---|---|
| B10 | Perangkat apa yang dipakai petugas pos hari ini? Spesifikasi seadanya (Android murah, layar kecil)? | Umur perangkat? OS versi berapa? | §8 Perangkat |
| B11 | Bagaimana kondisi sinyal di pos? Berapa lama sinyal hilang dalam satu hari/semalam? | Pos mana yang paling parah? | §3 Mas Dimas, §8 Offline |
| B12 | Kalau ada aplikasi web yang **jalan tanpa sinyal ≥24 jam** lalu sinkron saat kembali daring — petugas pos bisa memakainya? | Siapa yang perlu dilatih? Berapa lama? Kekhawatiran apa (data ganda, salah scan)? | §20.3 A-3, FR-16, §8 Offline |
| B13 | Saat sinyal hilang hari ini, bagaimana data pendaki dicatat di pos? Apa masalahnya (tertunda, hilang, ganda)? | Contoh kasus tanpa menyebut nama peserta. | §3 Mas Dimas |

### 2.4 Asumsi A-4: *Pembayaran online diterima pendaki di basecamp target* (persona: **Rani, pendaki pemula** — *"Aturan tersebar, takut tiket hangus"*, *"bayar mudah"* — §3)

| ID | Pertanyaan | Probe | prd_ref |
|---|---|---|---|
| B14 | Dari pendaki yang mendaftar, kira-kira berapa persen sudah bayar online hari ini (transfer/QRIS)? | Metode pembayaran apa saja yang dipakai hari ini? | §20.3 A-4 |
| B15 | Kalau pendaftaran wajib bayar online dulu (VA/QRIS) dan e-tiket QR dikirim otomatis — **apakah ada pendaki yang keberatan? Kalau ada, kira-kira berapa persen?** (opsi eksplisit: **tidak ada**) | Siapa yang keberatan (usia, wilayah, alat)? Alternatif apa yang tetap Anda sediakan? | §20.3 A-4, FR-13 |
| B16 | Keluhan apa yang paling sering soal "uang sudah transfer tapi nama belum tercatat"? | Berapa kasus per bulan? Diselesaikan berapa lama? | §3, FR-13 |
| B17 | Kalau pendaki menuntut uang kembali saat jalur ditutup mendadak — bagaimana prosesnya sekarang? | Berapa lama uang kembali? Siapa yang menanggung? | §7.3, FR-07/FR-14 |

### 2.5 Willingness-to-pay — hipotesis harga §14 (menguji §20.3 A-5: *fee 1% + langganan cukup untuk unit economics*)

Bacakan paket apa adanya, **jangan menawar**:

> "Paket **Basecamp**: **Rp 299.000/bulan + 1% fee transaksi**, isi: 1 gunung, 3 jalur, 5 staf. Paket **Pro/TO**: **Rp 899.000/bulan + 1%**. **Lisensi Template**: **Rp 15–40 juta sekali bayar** `[ASUMSI]` (single-tenant, kode sumber, docs, 90 hari support). Fee pakai akun Midtrans milik tenant, penagihan fee platform lewat invoice terpisah `[VERIFIKASI mekanisme]`."

| ID | Pertanyaan | Probe | prd_ref |
|---|---|---|---|
| B18 | Untuk paket Basecamp **Rp 299.000/bln + 1%**: termasuk **terlalu mahal / pas / terlalu murah**? | Kenapa? Bandingkan dengan biaya buku tamu + rekap manual + admin WhatsApp hari ini. | §14, §20.3 A-5 |
| B19 | Angka **maksimum** per bulenya yang masih Anda bayarkan? | Sampai berapa Rp? Apa isi yang wajib ada agar harga itu terasa layak? | §14, §20.3 A-5 |
| B20 | Bagaimana perasaan soal **fee 1%** dari tiap transaksi, ditagih lewat invoice bulanan terpisah di luar langganan (akun Midtrans tetap milik basecamp)? | Lebih suka flat tanpa fee? Bagaimana kalau fee naik? | §14, §20.3 A-5 |
| B21 | Setelah pilot berakhir Anda **memilih: (a) bayar Rp 299.000/bln + 1%, (b) pindah ke Pro/TO Rp 899.000/bln + 1%, (c) lanjut sebagai Official Link Mode tanpa transaksi, atau (d) berhenti** — pilih mana? Kenapa? | Apa syarat minimal agar memilih bayar? | §14, §15 exit G0, §20.3 A-5 |
| B22 | Untuk pengelola lain yang **ingin punya sistem sendiri (tanpa langganan)**, tertarik tidak dengan **lisensi template Rp 15–40 juta sekali bayar** `[ASUMSI]`? | Angka mana yang masuk akal: 15jt, 25jt, 40jt? Lebih suka langganan update atau sekali bayar? | §4.2, §14, §20.2 #7 |
| B22a | Berapa **volume transaksi per bulan** (jumlah booking + nilainya dalam Rp) dan **harga tiket rata-rata**? | Bulan tersibuk vs tersepi? Berapa % pendapatan yang Anda hitung sebagai biaya admin hari ini? | §20.3 A-5, §14 |

### 2.6 Kesediaan pilot + Official Link Mode (FR-35)

| ID | Pertanyaan | Probe | prd_ref |
|---|---|---|---|
| B23 | Bersedia menjadi **pilot gratis 3 bulan** (syarat dan ekspektasi ada di `pilot-validation-sheet.md`)? | Syarat apa yang harus dipenuhi agar Anda mau? | §14 Pilot, §15 G0 |
| B24 | Halaman info jalur (status sumber + tanggal, ringkasan aturan, cuaca, tombol "Booking di situs resmi", tombol **"Beri tahu saya jika dibuka"**) — hal seperti ini dipakai sekarang? | Siapa yang pantau status resmi? Berapa kali sehari? | FR-35, §7.4 |

### 2.7 Kirim ke pertanyaan terbuka Andy (§20.2) bila responden memenuhi syaratnya

| ID | Pertanyaan | prd_ref |
|---|---|---|
| B25 | Menurut Bapak/Ibu, basecamp atau TO/open trip yang **lebih siap bayar lebih dulu**? | §20.2 #2 |
| B26 | Gunung/jalur mana yang menurut Anda paling butuh sistem ini sekarang? (catat sebagai **usulan**, bukan keputusan) | §20.2 #1 |

## 3. Penutup (±5 menit)

> "Terima kasih. Saya rangkum: [sebut 2–3 temuan utama dengan kata-kata responden]. Apa yang saya lewatkan? — Kalau ada wawancara lanjutan atau uji coba gratis 3 bulan, maukah Bapak/Ibu dihubungi? Kontaknya saya catat **di luar dokumen ini**, ya. Selesai."

- Minta koreksi atas rangkuman: `responden koreksi / tidak`.
- Serahkan `pilot-validation-sheet.md` bila B23 = ya; isi kolom bersama, tetap **tanpa data pribadi nyata**.

## 4. Tabel pelacakan: asumsi §20.3 → pertanyaan (acceptance T-009)

| Asumsi §20.3 | ID pertanyaan di skrip ini | Status jawaban (diisi pewawancara) |
|---|---|---|
| A-1 Basecamp mau memakai sistem digital berbayar | B06, B07, B08, B09 | `___` |
| A-2 TO bersedia input peserta lewat link | *dievaluasi di `to-guide.md` (T05–T08); basecamp tidak relevan* | `___` |
| A-3 Petugas pos bisa memakai PWA | B10, B11, B12, B13 | `___` |
| A-4 Pembayaran online diterima pendaki di basecamp target | B14, B15, B16, B17 | `___` |
| A-5 Fee 1% + langganan cukup untuk unit economics | B18, B19, B20, B21, B22, B22a | `___` |

## 5. Isian hasil (placeholder)

| Kode responden | Izin | A-1 | A-3 | A-4 | A-5 (angka toleran) | Pilot (B23) | Tanggal |
|---|---|---|---|---|---|---|---|
| `BASECAMP-01` | `___` | `___` | `___` | `___` | `___` | `___` | `___` |
| `BASECAMP-02` | `___` | `___` | `___` | `___` | `___` | `___` | `___` |
| `BASECAMP-03` | `___` | `___` | `___` | `___` | `___` | `___` | `___` |
| `BASECAMP-04` | `___` | `___` | `___` | `___` | `___` | `___` | `___` |
| `BASECAMP-05` | `___` | `___` | `___` | `___` | `___` | `___` | `___` |

**Catatan gate:** Reviewer R2 = **Andy (manusia)** — sign-off manusia adalah item **gate G0**; agent tidak dapat memenuhinya (T-009 notes, §15, §16.8). Kit ini hanya bahan untuk G0, bukan penggantinya.
