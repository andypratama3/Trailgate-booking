# Wireframe low-fi — POS Check-in / Check-out (PWA petugas pos) (FR-16, FR-15, AC-16.1/16.2, AC-15.1/15.2)

PWA petugas pos: scan QR, tetap jalan tanpa sinyal ≥ 24 jam, sinkron saat online; konflik
*first scan wins* + log (PRD §8, §10.2). Token QR diverifikasi offline via kunci publik (AC-15.1).
Warna = token `docs/ux/design-tokens.md`. Sasaran sentuh ≥ 44×44px (petugas pakai sarung tangan/siang hari).

Rujukan kontrak: **ADR-004 §keputusan 1–5** — antrean IndexedDB dengan `client_event_id` **UUID**
(idempoten saat kirim ulang), verifikasi tanda tangan QR offline memakai kunci publik + **daftar revoke
yang tersimpan di perangkat**, dan konflik *first scan wins* dicatat di **baris log konflik**.

Legenda: `[ ]` tombol, ▢ kamera QR, ▸ status, ≡ daftar, ● offline indicator.

---

## Normal — kamera + hasil scan

```
┌────────────────────────────────────┐
│ POS · Pos Ranu Pani     ● Online    │
├────────────────────────────────────┤
│         ▢ (kamera QR)              │
│   Arahkan QR tiket ke kamera       │
│────────────────────────────────────│
│ ▸ TERVERIFIKASI                     │
│   TG-2026-0001 · Bayu (8 orang)    │
│   Jalur A · 24 Nov · Belum masuk   │
│        [ Check-in ]  [ Batal ]     │
└────────────────────────────────────┘
```

Setelah aksi → konfirmasi + entri log lokal:
```
▸ Check-in berhasil · 12:04 · TG-2026-0001
[ Scan berikutnya ]
```

### Sudah di gunung → Check-out
```
┌────────────────────────────────────┐
│ ▸ TERVERIFIKASI                     │
│   TG-2026-0001 · Bayu (8 orang)    │
│   Jalur A · 24 Nov · Sudah di gunung│
│        [ Check-out ]  [ Batal ]     │
└────────────────────────────────────┘
▸ Check-out berhasil · 15:20 · TG-2026-0001
[ Scan berikutnya ]
```

## Antrean sinkron / offline

```
┌────────────────────────────────────┐
│ POS · Pos Ranu Pani     ● Offline   │
├────────────────────────────────────┤
│ ⚠ Tidak ada sinyal. Scan tetap      │
│   tersimpan dan dikirim otomatis.   │
│   Antrean: 37 event [DEMO] (tertua 6 jam) │
│   [ Sinkron sekarang ]  [ Manifest ]│
├────────────────────────────────────┤
│         ▢ (kamera tetap aktif)     │
└────────────────────────────────────┘
```
Saat online kembali:
```
▸ Menyinkronkan 37 event [DEMO] (in & out)… ▓▓▓▓▓░░░░
▸ Selesai. 0 hilang, 1 konflik.
▸ Baris log konflik: TG-2026-0007 — first scan wins (scan 12:04 menang).
```

## Loading

```
Scan QR… ◐          (verifikasi token di perangkat)
Menyimpan event… ◐  (tulis ke IndexedDB)
Menyinkron… ◐       (batch POST /v1/pos/sync)
```

## Empty

```
┌────────────────────────────────────┐
│ ▢  Belum ada scan hari ini.         │
│    Antrean sinkron kosong.          │
│    Mulai dengan mengarahkan QR.     │
└────────────────────────────────────┘
```
Manifest kosong:
```
▸ Tidak ada pendaki di gunung sekarang.
```

## Error

### QR tidak dikenali / palsu
```
┌────────────────────────────────────┐
│ ⚠ QR tidak dikenali.                │
│   Minta tiket resmi (PDF/WA).       │
│   [ Scan ulang ]                    │
└────────────────────────────────────┘
```

### Token dicabut (revoked)
```
╳ Token sudah dicabut — check-in DITOLAK.
  Catat kejadian: [ Laporkan ]   [ Scan ulang ]
```

### Scan ganda (sudah pernah check-in)
```
⚠ Tiket ini sudah check-in 12:04.
  First scan wins — scan ini TIDAK dihitung ulang.
  [ Lihat riwayat scan ]   [ Scan berikutnya ]
```

### Check-out ganda (sudah check-out)
```
⚠ Tiket ini sudah check-out 15:20.
  Scan ini TIDAK dihitung ulang (first scan wins).
  [ Lihat riwayat scan ]   [ Scan berikutnya ]
```

### Check-out tanpa check-in
```
╳ Belum ada check-in untuk tiket ini.
  Check-in lebih dulu, atau pakai input kode manual.
  [ Check-in sekarang ]   [ Scan ulang ]
```

### Gagal sinkron
```
╳ Sinkron gagal (server/jaringan). 37 event [DEMO] tetap aman
  di perangkat dan dicoba lagi otomatis.
  [ Coba lagi sekarang ]   [ Lihat antrean ]
```

### Kamera gagal
```
╳ Kamera tidak bisa dibuka. Gunakan input kode manual:
  ( TG-2026-______ )   [ Verifikasi kode ]
```
