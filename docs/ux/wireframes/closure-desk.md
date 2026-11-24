# Wireframe low-fi — Closure Desk (konsol tenant) (untuk FR-07; cakupan spec milik tugas lain — T-007 hanya menyediakan wireframe)

Alur §7.3: admin membuat closure → sistem menghitung booking terdampak → Disruption Case →
broadcast WA/email → pendaki memilih reschedule/refund → progres di dashboard.
Warna = token `docs/ux/design-tokens.md`. Aksi sensitif wajib konfirmasi + audit log (PRD §9.4B).

Legenda: `[ ]` tombol, ( ) input, ▸ status, ≡ daftar, ▓▓ progress.

---

## Normal — daftar kasus & closure aktif

```
┌──────────────────────────────────────────────┐
│ Closure Desk                        [+ Buat penutupan] │
├──────────────────────────────────────────────┤
│ Filter: ( Semua jalur ▾ )  ( Status ▾ )       │
│ ≡ Kasus Penutupan terbuka          3           │
│   ▸ Rinjani Senaru — 1–7 Sep   Kasus terbuka │
│   Booking terdampak: 84 [DEMO]  Progres ▓▓▓░░│
│   [ Lihat ]  [ Kirim pengingat ]              │
│   ▸ Bromo Tengger — 12 Nov     Selesai      │
│   Booking terdampak: 0 [DEMO]   (tidak ada) │
├──────────────────────────────────────────────┤
│ Progress ringkas                              │
│  Terdampak 84 [DEMO]  Terpilih reschedule 51 │
│  Refund 22 [DEMO]   Menunggu 11             │
│  [ Lihat laporan ]  [ Ekspor ]                │
└──────────────────────────────────────────────┘
```

▸ Sumber status: data `closures` + `disruption_cases` (§7.3). Istilah status kasus
("Kasus terbuka"/"Selesai") sengaja dibedakan dari status jalur ("Buka"/"Tutup").
Angka `[DEMO]` = contoh tampilan, bukan klaim bersumber.

## Buat penutupan (form)

```
┌──────────────────────────────────────────────┐
│ Jalur       ( Rinjani Senaru ▾ )              │
│ Rentang     ( 1 Sep ) → ( 7 Sep )             │
│ Mode        ( ) Hanya blokir booking baru     │
│             ( ) Batalkan booking yang ada     │
│ Alasan      ( Cuaca ekstrem … )               │
│ Surat resmi ( nomor/tautan … )   wajib         │
│            [ Batal ]  [ Pratinjau terdampak ] │
└──────────────────────────────────────────────┘
```

### Konfirmasi (wajib sebelum aktif)
```
┌──────────────────────────────────────────────┐
│ ▸ 84 booking akan terdampak. [DEMO]         │
│   Booking lunas tetap sah — peserta akan      │
│   diminta reschedule atau refund penuh.       │
│   [ Konfirmasi buat penutupan ]  [ Kembali ]  │
└──────────────────────────────────────────────┘
```

## Loading
```
▸ Menghitung booking terdampak… ◐
▸ Menyimpan closure… ◐
```
Saat `Membuat Disruption Case`, progress menampilkan jumlah kasus yang dibuat.

## Empty
```
┌──────────────────────────────────────────────┐
│ ▢  Belum ada penutupan jalur.                 │
│    Buat penutupan saat jalur ditutup, agar    │
│    peserta terdampak otomatis dikabari.       │
│    [ + Buat penutupan ]                       │
└──────────────────────────────────────────────┘
```

## Error
```
┌──────────────────────────────────────────────┐
│ ▢  Penutupan gagal disimpan.                  │
│    Booking belum diubah. Coba lagi.           │
│    [ Coba lagi ]          [ Kembali ]         │
└──────────────────────────────────────────────┘
```

### Error pengiriman broadcast
```
⚠ Pengiriman WA/email gagal untuk 12 peserta.
  [ Kirim ulang ]  [ Lihat detail ]
```
> Gagal kirim berulang memicu alert operator (AC-18.2) — bukan diam.
