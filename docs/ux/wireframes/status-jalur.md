# Wireframe low-fi — Halaman Status Jalur (publik) (untuk FR-35 & FR-21; cakupan spec milik tugas lain — T-007 hanya menyediakan wireframe)

Halaman status jalur per gunung, diakses tanpa login. Untuk jalur dengan sistem resmi, mode
**Official Link Mode**: info + status + alert + deep-link ke booking resmi (tanpa transaksi).
Cuaca dari BMKG wajib mencantumkan sumber (PRD §2.2). Warna = token `docs/ux/design-tokens.md`.

Legenda: `[ ]` tombol, ( ) input, ▢ gambar, ▸ status, ≡ daftar.

**Label `[DEMO]`** menandai angka contoh (bukan klaim bersumber). Aturan/syarat selalu menampilkan
`source_url` + `verified_at` (FR-37).

---

## Normal

```
┌────────────────────────────────────────────┐
│ ← Kembali   Jalur A — Gunung X              │
├────────────────────────────────────────────┤
│ Status   ▸ BUKA   24 Nov 2026 · sumber      │
│          + tautan surat · terverifikasi     │
│ Kuota    ▓▓▓▓▓▓░░░░ 120 / 300 tersisa [DEMO] │
│ Cuaca    Cuaca besok: hujan ringan — BMKG   │
│ Syarat   Surat sehat ≤ 24 jam · umur ≥ 17   │
│          Sumber: source_url · verif. 20 Nov 2026 │
│ Rute     ▢ profil elevasi (interaktif)       │
├────────────────────────────────────────────┤
│    [ Pesan tiket ]   [ Beri tahu saya jika jalur dibuka ] │
│    Pesan lewat situs resmi → (buka resmi)    │
└────────────────────────────────────────────┘
```

Official Link Mode (tenant `official_link`): tombol `Pesan tiket` **tidak ada**; penggantinya:

```
[ Buka situs resmi ]   [ Beri tahu saya jika jalur dibuka ]
▸ Tidak ada transaksi di TrailGate. Tiket resmi dikelola pengelola.
```

---

## Loading (skeleton + aria-busy)

```
┌────────────────────────────────────────────┐
│ ▓▓▓▓▓▓▓▓▓▓  ▓▓▓▓▓▓░░░░  ▓▓▓▓▓▓            │
│ ▓▓▓▓▓▓▓▓▓▓  ▓▓▓▓▓▓  ▓▓▓▓▓▓  ▓▓▓▓          │
│ ▓▓▓▓▓▓▓▓▓▓  ▓▓▓▓▓▓  ▓▓▓▓▓▓  ▓▓▓▓          │
└────────────────────────────────────────────┘
Status: "Memuat status jalur…"
```

## Empty

```
┌────────────────────────────────────────────┐
│ ▢  Belum ada jalur yang dikelola.           │
│    Daftar akan tampil setelah diisi.        │
│    [ Kembali ke daftar gunung ]             │
└────────────────────────────────────────────┘
```

## Error

```
┌────────────────────────────────────────────┐
│ ▢  Status jalur tidak bisa dimuat.          │
│    Cek koneksi. Jangan andalkan status ini   │
│    tanpa memeriksa sumber resmi.            │
│    [ Coba lagi ]      [ Lihat sumber resmi ]│
└────────────────────────────────────────────┘
```

---

## State tambahan

### Penutupan (jalur tutup)
```
│ Status  ▸ TUTUP · sumber + tanggal · alasan  │
│         (Cuaca ekstrem — surat tertulis)      │
│ Booking baru tidak diterima.                  │
│ [ Lihat detail penutupan ] [ Beri tahu saya ]  │
```
> Booking yang sudah dibayar tetap sah (PRD §2.3 butir 2).

### Alert pendaftaran
```
┌────────────────────────────────────────────┐
│ Beri tahu saya jika jalur dibuka            │
│ ( 0812… )   [ Aktifkan notifikasi ]          │
│ ▸ Kamu akan diingatkan saat status berubah.  │
└────────────────────────────────────────────┘
```
> Alert membutuhkan opt-in (FR-18) dan tidak dikirim bila opt-in belum diberikan.
