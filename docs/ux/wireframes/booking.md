# Wireframe low-fi — Alur Booking (FR-09, AC-09.1/09.2/09.3)

Alur §7.2: cari jalur → hold kuota → isi data (ketua + anggota) → bayar → tiket QR (FR-15).
Wireframe = struktur & state, bukan visual final. Warna mengacu token (`docs/ux/design-tokens.md`),
tanpa nilai hex di file ini.

Legenda: `[ ]` tombol, `( )` input, `▢` gambar/QR, `▸` teks status, `≡` daftar.

**Stepper wizard** (dasar `aria-current="step"`, `accessibility.md` §4): pencarian adalah pra-wizard;
wizard punya **4 langkah** — `1 Tanggal & kuota` (hold), `2 Data rombongan`, `3 Bayar`, `4 Tiket`.
Nomor bagian di bawah (1–5) mencakup pencarian dan bukan nomor wizard.
**Label `[DEMO]`** menandai angka contoh (bukan klaim bersumber; PRD §9.4C, FR-37).

---

## Langkah 1 — Cari jalur & lihat kuota

### Normal
```
┌────────────────────────────────────────────┐
│ TrailGate · <nama tenant>  [Tema gelap]     │
├────────────────────────────────────────────┤
│ (Cari gunung atau jalur…)        [ Cari ]   │
├────────────────────────────────────────────┤
│ ▸ 3 jalur cocok                             │
│ ≡ Gunung X · Jalur A          ▸ Buka        │
│   Kuota hari ini ▓▓▓▓▓▓░░░░ 120/300 tersisa │
│   Mulai Rp150.000 [DEMO]  [ Pilih tanggal ] │
│ ──────────────────────────────────────────  │
│ ≡ Gunung Y · Jalur B          ▸ Tutup       │
│   Alasan penutupan: cuaca (lihat detail)     │
│   [ Beri tahu saya jika jalur dibuka ]      │
└────────────────────────────────────────────┘
```

### Loading (skeleton)
```
▸ (skeleton) ▓▓▓▓▓▓░░░░  ▓▓▓▓▓▓  ▓▓▓▓
▸ (skeleton) ▓▓▓▓▓▓░░░░  ▓▓▓▓▓▓  ▓▓▓▓
(Aria-busy="true"; skeleton memakai token `surface-raised` + `animate-pulse`)
```

### Empty (tidak ada hasil)
```
┌────────────────────────────────────────────┐
│ ▢  Tidak ada jalur yang cocok               │
│    Coba kata kunci lain, atau ubah tanggal.  │
│    [ Hapus filter ]   [ Lihat semua jalur ]  │
└────────────────────────────────────────────┘
```

### Error (gagal memuat)
```
┌────────────────────────────────────────────┐
│ ▢  Gagal memuat daftar jalur                │
│    Periksa koneksi lalu coba lagi.          │
│    [ Coba lagi ]              [ ← Kembali ] │
└────────────────────────────────────────────┘
```

---

## Langkah 2 — Pilih tanggal & hold kuota

### Normal
```
┌────────────────────────────────────────────┐
│ ← Jalur A                                   │
│ Tanggal: ( 24 Nov ▾ )   Jumlah: ( 8 )       │
│ Kuota tersisa ▓▓▓▓▓▓░░░░ 120                │
│ ▸ Reservasi sementara ditahan 15 menit      │
│   setelah kamu lanjut.                      │
│              [ Lanjut isi data ]            │
└────────────────────────────────────────────┘
```

### Loading (menahan kuota)
```
[ Lanjut isi data ] → [ ◐ Menahan kuota… ]
▸ Jangan tutup halaman ini (aria-live polite)
```

### Empty (tanggal tidak tersedia / kuota habis)
```
┌────────────────────────────────────────────┐
│ Tanggal 24 Nov tidak ada kuota.             │
│ Pilih tanggal lain atau masuk daftar tunggu.│
│ [ Pilih tanggal lain ]  [ Kabari saya ]     │
└────────────────────────────────────────────┘
```

### Error (hold gagal / TTL habis)
```
┌────────────────────────────────────────────┐
│ Kuota baru saja penuh sebelum kamu lanjut.  │
│ Sisa kuota tidak cukup untuk 8 orang.       │
│ [ Coba jumlah lain ]   [ Pilih tanggal lain]│
└────────────────────────────────────────────┘
```

---

## Langkah 3 — Data ketua + anggota (wizard)

### Normal
```
┌────────────────────────────────────────────┐
│ Data rombongan — langkah 2 dari 4            │
│ 1 Tanggal & kuota  ▸2 Data  3 Bayar  4 Tiket│
│ Ketua:  (Nama) (HP) (Email)                 │
│ Kontak darurat: (Nama) (HP) (Hubungan)      │
│ Anggota (8):                                │
│ ≡ 1. ▸ Terisi       2. ▸ Menunggu tautan    │
│   3. ▸ Menunggu tautan …                    │
│ [ Bagikan link pengisian ke anggota ]       │
│              [ Simpan & lanjut ]            │
└────────────────────────────────────────────┘
```

### Loading (menyimpan progres)
```
[ Simpan & lanjut ] → [ ◐ Menyimpan… ]
Progres tersimpan otomatis; kalau keluar, isian dipulihkan (AC-09.3).
```

### Empty (belum ada anggota ditambahkan)
```
┌────────────────────────────────────────────┐
│ Belum ada anggota. Tambahkan minimal 1 orang│
│ atau isi sendiri jika solo.                 │
│ [ + Tambah anggota ]                        │
└────────────────────────────────────────────┘
```

### Error (validasi / gagal simpan)
```
┌────────────────────────────────────────────┐
│ ⚠ Periksa isian berikut:                    │
│  · HP ketua belum diisi                     │
│  · Surat sehat anggota 3 belum diunggah     │
│ Progres tidak hilang. [ Perbaiki ]          │
└────────────────────────────────────────────┘
```
> Anggota membuka tautan → form sendiri → unggah dokumen (AC-09.2). Ketua melihat status kelengkapan.

---

## Langkah 4 — Pembayaran

### Normal
```
┌────────────────────────────────────────────┐
│ Ringkasan  Jalur A · 24 Nov · 8 orang       │
│ Total: Rp1.200.000 [DEMO]                   │
│ Bayar sebelum reservasi selesai.            │
│ ( ) VA   ( ) QRIS   ( ) Kartu               │
│              [ Bayar sekarang ]             │
└────────────────────────────────────────────┘
```

### Loading (membuat transaksi)
```
[ Bayar sekarang ] → Menyiapkan pembayaran… ◐
```

### Empty (belum ada pilihan metode — paket tenant tanpa pembayaran online)
```
┌────────────────────────────────────────────┐
│ Pembayaran online belum aktif untuk tenant  │
│ ini. Hubungi pengelola: 08xx…               │
│ [ Hubungi pengelola ]                       │
└────────────────────────────────────────────┘
```

### Error (webhook gagal / kedaluwarsa)
```
┌────────────────────────────────────────────┐
│ Pembayaran belum terkonfirmasi.             │
│ Reservasi kedaluwarsa setelah batas waktu.  │
│ Status: menunggu konfirmasi pembayaran.     │
│ [ Cek status ]   [ Bayar ulang ]            │
└────────────────────────────────────────────┘
```

---

## Langkah 5 — E-tiket QR (FR-15)

### Normal
```
┌────────────────────────────────────────────┐
│ ▸ Pembayaran lunas — booking TG-2026-0001   │
│   ▢ (QR bertanda tangan)                    │
│   Simpan PDF, tiket dikirim via WA + email. │
│   [ Unduh tiket PDF ]  [ Bagikan tiket ]    │
│   Kode booking: TG-2026-0001                │
└────────────────────────────────────────────┘
```

### Loading
```
Menyiapkan tiket… ◐   (aria-live polite)
```

### Empty
```
Tiket belum tersedia — menunggu pembayaran terkonfirmasi.
[ Lihat status pembayaran ]
```

### Error
```
Tiket gagal dibuat. Pembayaranmu aman.
[ Coba lagi ]   [ Hubungi pengelola ]   Kode booking: TG-2026-0001
```
> PDF dapat disimpan offline sehingga check-in tetap bisa walau sinyal hilang (AC-15.3).
