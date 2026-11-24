# Skrip Wawancara Trekking Organizer (3 responden)

**Tugas:** T-009 · **FR terkait:** FR-35 (Official Link Mode) + pendukung FR-09, FR-24/25, FR-07, FR-13
**prd_ref:** §3 (persona), §14 (monetisasi), §15 (Gate G0), §20.2 (pertanyaan terbuka), §20.3 (asumsi P0)
**Jumlah responden:** 3 slot — `TO-01` … `TO-03` (**semua placeholder, kosong**)
**Durasi:** ±60 menit per responden
**Pewawancara:** manusia (agent hanya menyiapkan kit; hasil wawancara = kerja manusia)

## 0. Aturan pencatatan (wajib dibacakan di pembuka)

1. **Tidak ada data pribadi nyata di repo.** Jangan menulis nama, nomor HP, NIK, email, atau identitas peserta trip ke berkas ini. Isi kolom identitas hanya dengan kode (`TO-01`) dan, bila perlu, nama pendek rekayasa (`Dewi (fiktif)`).
2. Kontak responden dicatat di kanal terpisah di luar repo.
3. Rasio guide/porter, dokumen, dan data peserta disebut sebagai **angka agregat** saja.
4. Label `[ASUMSI]`, `[VERIFIKASI]`, `[FAKTA]` dari PRD dipertahankan — jangan ubah jadi fakta. Jawaban responden = **data lapangan**, bukan fakta PRD.
5. **Definisi ID asumsi:** ID `A-1` ... `A-5` diperkenalkan kit T-009 mengikuti urutan kalimat PRD §20.3; ID ini **bukan** milik PRD.

## 1. Pembuka (±3 menit)

> "Terima kasih waktunya. Saya ingin memahami cara TO/open trip mengelola trip, peserta, dokumen, dan pembayaran hari ini — bukan menjual produk. Wawancara ±60 menit. Nama dan nomor Anda **tidak akan saya catat di dokumen mana pun**; hanya kode jawaban. Boleh berhenti kapan saja. Boleh saya mulai?"

- Izin tercatat: `SETUJU / TIDAK`.
- Peran responden: `pemilik TO / manajer trip / guide kepala / lainnya`.
- Cerita pembuka: "Ceritakan satu open trip terakhir dari promo sampai peserta pulang — apa saja yang Anda kerjakan sendiri?"

## 2. Pertanyaan inti

### 2.1 Kondisi operasional hari ini (persona: **Sari, pemilik TO / open trip** — *"Kelola trip, penugasan guide/porter, validasi rasio"*; rasa sakit: *rasio guide dicek manual, dokumen peserta tercecer* — §3)

| ID | Pertanyaan | Probe lanjutan | prd_ref |
|---|---|---|---|
| T01 | Satu trip dibuka dan terisi dalam berapa hari? Di mana peserta terdaftar sekarang (spreadsheet, form, chat)? | Berapa file/sheet berbeda? Siapa yang input ulang? | §3 Sari |
| T02 | Rasio guide:porter:peserta diperiksa bagaimana hari ini? | Pernah terlewat? Konsekuensinya apa? Berapa lama per trip? | §3 Sari, FR-08 |
| T03 | Dokumen peserta (surat sehat, identitas, consent) dikumpulkan lewat apa? | Paling sering tercecer atau telat kapan? Berapa peserta telat kirim? | §3 Sari, FR-10 |
| T04 | Saat trip batal / jalur ditutup / peserta mundur — bagaimana penanganan uang dan komunikasi hari ini? | Berapa peserta yang harus dihubungi manual? Dalam berapa jam? | §7.3, FR-07/FR-14 |

### 2.2 Asumsi A-2: *TO bersedia input peserta lewat link* (persona: **Bayu, ketua rombongan** — *"isi data 8 orang sekali, bagikan link pengisian ke anggota"*; rasa sakit: *input data berulang, anggota telat kirim dokumen* — §3)

| ID | Pertanyaan | Probe | prd_ref |
|---|---|---|---|
| T05 | Kalau Anda membuat **satu link pengisian**, lalu tiap anggota mengisi data + mengunggah dokumennya sendiri — Anda mau memakainya? **Setuju / ragu / tidak**, kenapa? | Yang membuat ragu: anggap ribet, sinyal, literasi anggota? | §20.3 A-2, FR-09 |
| T06 | Saat ini anggota rombongan mengirim data lewat apa? Berapa lama sampai semua lengkap? | Pernah trip gagal/geser karena data belum lengkap? | §3 Bayu, §20.3 A-2 |
| T07 | Siapa yang biasanya mengisi data untuk 8 orang — ketua semua, atau dibagi ke anggota? | Kalau dibagi, siapa yang menagih anggota telat? | §20.3 A-2, FR-09 |
| T08 | Setelah semua anggota isi lewat link, Anda masih perlu memeriksa ulang? Apa yang bikin tidak percaya otomatis? | Syarat apa yang harus terlihat agar Anda terima hasilnya? | §20.3 A-2, FR-08/FR-10 |

### 2.3 Asumsi A-4: *Pembayaran online diterima pendaki* (persona: **Rani, pendaki pemula** — *"bayar mudah, takut tiket hangus"* — §3)

| ID | Pertanyaan | Probe | prd_ref |
|---|---|---|---|
| T09 | Peserta open trip yang sudah bayar online: kira-kira berapa persen dari total? | Metode dominan: transfer manual, QRIS, VA? | §20.3 A-4, FR-13 |
| T10 | Kalau pembayaran wajib online di muka dan e-tiket QR terkirim otomatis — **apakah ada peserta yang keberatan? Kalau ada, kira-kira berapa persen?** (opsi eksplisit: **tidak ada**) | Peserta segmen mana yang keberatan? Apa alternatif yang tetap Anda buka? | §20.3 A-4 |
| T11 | Dana peserta untuk trip batal/closure: ditahan, dikembalikan, atau digeser? Bagaimana peserta melihat statusnya? | Pernah ada sengketa? Berapa lama uang kembali? | §7.3, FR-14 |

### 2.4 Asumsi A-3: *Petugas pos bisa memakai PWA* — relevan bila TO mengirim guide sendiri ke pos

| ID | Pertanyaan | Probe | prd_ref |
|---|---|---|---|
| T12 | Guide/pemandu Anda turut mencatat kehadiran di pos? Perangkat dan sinyalnya bagaimana? | Android murah? Sinyal hilang di jalur mana? | §20.3 A-3, FR-16 |
| T13 | Kalau guide bisa check-in **tanpa sinyal lalu sinkron** nanti — dipakai atau tidak? Kekhawatirannya apa? | Latihan singkat cukup? | §20.3 A-3, §8 Offline |

### 2.5 Willingness-to-pay — hipotesis harga §14 (menguji §20.3 A-5)

Bacakan paket apa adanya, **jangan menawar**:

> "Paket **Pro/TO**: **Rp 899.000/bulan + 1% fee transaksi** (multi-jalur, guide/porter, laporan lanjut, WA). Paket **Basecamp**: **Rp 299.000/bulan + 1%** (1 gunung, 3 jalur, 5 staf). **Lisensi Template**: **Rp 15–40 juta sekali bayar** `[ASUMSI]` (single-tenant, kode sumber, docs, 90 hari support). Fee memakai akun Midtrans milik tenant (BYO), penagihan fee platform lewat invoice terpisah `[VERIFIKASI mekanisme]`."

| ID | Pertanyaan | Probe | prd_ref |
|---|---|---|---|
| T14 | Untuk paket **Pro/TO Rp 899.000/bln + 1%**: **terlalu mahal / pas / terlalu murah**? | Bandingkan dengan biaya admin, spreadsheet, dan tagihan manual per bulan. | §14, §20.3 A-5 |
| T15 | Angka **maksimum** per bulannya yang masih Anda bayarkan? | Isi minimum agar harga itu terasa layak (multi-trip? rasio guide? laporan? WA?). | §14, §20.3 A-5 |
| T16 | Bagaimana perasaan soal **fee 1%** dari tiap transaksi, ditagih via invoice bulanan terpisah? | Lebih suka flat? Berapa fee maksimum yang wajar? | §14, §20.3 A-5 |
| T17 | Setelah pilot gratis 3 bulan Anda harus **memilih: (a) bayar Rp 899.000/bln + 1%, (b) downgrade ke Basecamp Rp 299.000/bln + 1%, (c) lanjut sebagai Official Link Mode tanpa transaksi, atau (d) berhenti** — pilih mana? Kenapa? | Apa syarat minimal agar memilih bayar? | §14, §15 exit G0, §20.3 A-5 |
| T18 | Untuk TO/komunitas yang **ingin sistem sendiri tanpa langganan**: tertarik **lisensi template Rp 15–40 juta sekali bayar** `[ASUMSI]`? | Angka yang masuk akal: 15jt, 25jt, 40jt? Sekali bayar atau langganan update? | §4.2, §14, §20.2 #7 |
| T18a | Berapa **volume transaksi per bulan** (jumlah trip/booking + nilainya dalam Rp) dan **harga tiket rata-rata per peserta**? | Bulan tersibuk vs tersepi? Berapa % pendapatan yang Anda hitung sebagai biaya admin hari ini? | §20.3 A-5, §14 |

### 2.6 Kesediaan pilot + Official Link Mode (FR-35)

| ID | Pertanyaan | Probe | prd_ref |
|---|---|---|---|
| T19 | Bersedia menjadi **pilot gratis 3 bulan** (syarat dan ekspektasi di `pilot-validation-sheet.md`)? | Syarat apa yang harus dipenuhi agar Anda mau? | §14 Pilot, §15 G0 |
| T20 | Halaman info jalur (status + tanggal sumber, aturan, cuaca, tombol **"Booking di situs resmi"**, dan **"Beri tahu saya jika dibuka"**) — dipakai sekarang? | Dipakai untuk pantau jalur mana? Untuk meyakinkan peserta? | FR-35, §7.4 |

### 2.7 Kirim ke pertanyaan terbuka Andy (§20.2)

| ID | Pertanyaan | prd_ref |
|---|---|---|
| T21 | Menurut Anda, basecamp atau TO/open trip yang **lebih siap bayar lebih dulu**? | §20.2 #2 |
| T22 | Trip/gunung mana yang paling butuh sistem ini sekarang? (catat sebagai **usulan**, bukan keputusan) | §20.2 #1 |
| T23 | Model harga mana yang Anda pilih untuk diri sendiri: **lisensi sekali bayar** atau **langganan update**? | §20.2 #7 |

## 3. Penutup (±5 menit)

> "Terima kasih. Saya rangkum: [2–3 temuan utama dengan kata-kata responden]. Apa yang saya lewatkan? — Kalau ada uji coba gratis 3 bulan, maukah Anda dihubungi? Kontaknya saya catat **di luar dokumen ini**. Selesai."

- Minta koreksi atas rangkuman: `responden koreksi / tidak`.
- Serahkan `pilot-validation-sheet.md` bila T19 = ya; isi kolom bersama, tetap **tanpa data pribadi nyata**.

## 4. Tabel pelacakan: asumsi §20.3 → pertanyaan (acceptance T-009)

| Asumsi §20.3 | ID pertanyaan di skrip ini | Status jawaban (diisi pewawancara) |
|---|---|---|
| A-1 Basecamp mau memakai sistem digital berbayar | *dievaluasi di `basecamp-guide.md` (B06–B09); TO bukan subjeknya, tetapi T14–T17 menguji kesiapan bayar TO* | `___` |
| A-2 TO bersedia input peserta lewat link | T05, T06, T07, T08 | `___` |
| A-3 Petugas pos bisa memakai PWA | T12, T13 | `___` |
| A-4 Pembayaran online diterima pendaki di basecamp target | T09, T10, T11 | `___` |
| A-5 Fee 1% + langganan cukup untuk unit economics | T14, T15, T16, T17, T18, T18a | `___` |

## 5. Isian hasil (placeholder)

| Kode responden | Izin | A-2 | A-3 | A-4 | A-5 (angka toleran) | Pilot (T19) | Tanggal |
|---|---|---|---|---|---|---|---|
| `TO-01` | `___` | `___` | `___` | `___` | `___` | `___` | `___` |
| `TO-02` | `___` | `___` | `___` | `___` | `___` | `___` | `___` |
| `TO-03` | `___` | `___` | `___` | `___` | `___` | `___` | `___` |

**Catatan gate:** Reviewer R2 = **Andy (manusia)** — sign-off manusia adalah item **gate G0**; agent tidak dapat memenuhinya (T-009 notes, §15, §16.8). Kit ini hanya bahan untuk G0, bukan penggantinya.
