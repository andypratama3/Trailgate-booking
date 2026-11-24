# Copy Bahasa Indonesia — CTA & label kunci (T-007)

Aturan copy (PRD §9.4C):

- **Bahasa Indonesia natural**, spesifik ke kasus nyata (penutupan jalur, rasio guide, surat sehat).
- **Tidak ada klaim tanpa sumber.** Setiap angka, kuota, harga, jam buka, atau aturan pendakian
  wajib punya `source_url` + `verified_at` (Mountain Pack / FR-37). Contoh angka di bawah ini ditandai
  `[DEMO]` — hanya placeholder tampilan, bukan klaim.
- Satu CTA utama per layar; pilihan alternatif bersifat sekunder.
- Klarifikasi status: jangan pakai istilah teknis untuk pendaki ("hold", "webhook", "TTL").

## Alur booking (`booking.md`)

| Konteks | Copy | Catatan |
|---|---|---|
| CTA utama cari | **Pilih tanggal** | satu CTA utama; "Cari" untuk input |
| Tahan kuota | **Reservasi sementara ditahan 15 menit** | angka `[DEMO]`, dapat dikonfigurasi tenant (§6.4) |
| Isi data | **Isi data rombongan** | istilah "rombongan", bukan "booking grup" |
| Bagikan tautan | **Bagikan link pengisian ke anggota** | |
| Anggota tunggu | **Menunggu tautan** | jangan "pending" |
| Bayar | **Bayar sekarang** | total dalam rupiah tanpa desimal |
| Tiket | **Unduh tiket PDF** / **Bagikan tiket** | |
| Tiket belum lunas | **Menunggu konfirmasi pembayaran** | |
| Error pembayaran | **Pembayaran belum terkonfirmasi — periksa status** | jangan "gagal permanen" |
| Kosong | **Tidak ada jalur yang cocok — coba kata kunci lain** | |

## Status jalur (`status-jalur.md`)

| Konteks | Copy | Catatan |
|---|---|---|
| Status | **Buka** / **Tutup** | status + sumber + tanggal |
| Kuota | **120 / 300 tersisa** | `[DEMO]` |
| Penutupan | **Jalur ditutup — booking baru tidak diterima** | booking lunas tetap sah |
| Sumber resmi | **Sumber: …, diverifikasi 20 Nov 2026** | wajib `source_url` + `verified_at` |
| Cuaca | **Cuaca besok: hujan ringan — BMKG** | atribusi wajib (PRD §2.2) |
| Official Link Mode | **Tidak ada transaksi di TrailGate. Tiket resmi dikelola pengelola.** | jangan sembunyikan |
| Alert | **Beri tahu saya jika jalur dibuka** | butuh opt-in (FR-18) |

## Closure Desk (`closure-desk.md`) — konsol

| Konteks | Copy |
|---|---|
| Judul halaman | **Closure Desk** |
| Tombol | **Buat penutupan** |
| Konfirmasi | **84 booking akan terdampak. Booking lunas tetap sah.** `[DEMO]` |
| Progress | **Terdampak 84 · Reschedule 51 · Refund 22 · Menunggu 11** `[DEMO]` |
| Kosong | **Belum ada penutupan jalur.** |
| Broadcast gagal | **Pengiriman WA/email gagal untuk 12 peserta — kirim ulang** |

## POS (`pos-checkin.md`)

| Konteks | Copy |
|---|---|
| Kamera | **Arahkan QR tiket ke kamera** |
| Check-in | **Check-in berhasil · 12:04 · TG-2026-0001** |
| Check-out | **Check-out berhasil · 15:20 · TG-2026-0001** |
| Offline | **Tidak ada sinyal. Scan tetap tersimpan dan dikirim otomatis.** |
| Scan ganda | **Tiket ini sudah check-in 12:04 — scan tidak dihitung ulang.** |
| Check-out ganda | **Tiket ini sudah check-out 15:20 — scan tidak dihitung ulang.** |
| Check-out tanpa check-in | **Belum ada check-in untuk tiket ini.** |
| Konflik sinkron | **Baris log konflik: TG-2026-0007 — first scan wins (scan 12:04 menang).** |
| Dicabut | **Token sudah dicabut — check-in ditolak.** |
| Kosong | **Belum ada scan hari ini.** |

## Hal yang dilarang

- Klaim tanpa sumber: "resmi", "100% aman", "kuota dijamin", "buka 24 jam", "paling akurat".
- Kode internal pada UI pendaki: `hold`, `webhook`, `TTL`, `block_new_bookings`, `422`.
- Menakut-nakuti: "siksa", "bahaya besar" — pakai faktual ("jalur ditutup karena cuaca ekstrem").
- Emoji sebagai satu-satunya penyampaian status.
