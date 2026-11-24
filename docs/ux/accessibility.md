# Catatan Aksesibilitas (WCAG 2.2 AA) — T-007

Target: **WCAG 2.2 level AA** untuk seluruh alur booking (PRD §8 "Aksesibilitas"), dan
`axe` **tanpa pelanggaran serius** di katalog komponen + halaman kunci (PRD §9.4A, §18.3 DoD UI).
Warna dirujuk lewat token (`docs/ux/design-tokens.md`); tidak ada nilai hex di file ini.

## 1. Target WCAG 2.2 AA yang mengikat

| SC | Target | Cara dipenuhi TrailGate |
|---|---|---|
| 1.3.1 Info & Relationships | struktur semantik | landmark (`header/nav/main`), heading berurutan, `label` terkait input, tabel data dengan header. |
| 1.3.4 Orientation | tidak mengunci orientasi | layout responsif potret/lanskap (POS dipakai potret). |
| 1.4.3 Contrast (Minimum) | ≥ 4,5:1 teks normal | pasangan token terverifikasi `design-tokens.md` §1.4; validator kontras menolak warna merek yang gagal (AC-02.2). |
| 1.4.4 Resize Text | 200% tanpa kehilangan | layout berbasis `rem`; tangkapan luas pada 320px. |
| 1.4.11 Non-text Contrast | ≥ 3:1 komponen/status | `border-strong` untuk batas kontrol; ikon status memakai peran `success/warning/danger/info`. |
| 1.4.12 Text Spacing | spasi teks dapat diubah | tidak ada tinggi/lebar tetap yang memotong teks. |
| 1.4.13 Content on Hover/Focus | dapat diberhentikan/di-hover | tooltip/tooltip kaya keyboard; tidak menutup konten lain. |
| 2.1.1 Keyboard | semua fungsi via keyboard | termasuk pemilih tanggal kuota, dialog, sheet. |
| 2.1.2 No Keyboard Trap | fokus bisa keluar | fokus dikembalikan ke pemicu saat dialog/sheet ditutup. |
| 2.2.1 Timing Adjustable | batas waktu dapat diperpanjang | TTL hold 15 menit ditampilkan; tombol perpanjang bila masih tersedia. |
| 2.4.3 Focus Order | urutan fokus logis | DOM order = visual order di wizard booking. |
| 2.4.7 Focus Visible | indikator fokus jelas | ring `focus` 2px + offset; bukan `outline:none`. |
| 2.4.11 Focus Not Obscured (Min) | fokus tak tertutup | sticky header tidak menutup elemen terfokus (scroll-padding). |
| 2.5.8 Target Size (Min) | ≥ 24×24px (internal: ≥ 44px) | tombol/ikon sentuh ≥ 44×44px (POS, konsol mobile). |
| 3.3.1 Error Identification | error dijelaskan teks | pesan error per-field + ringkasan (lihat wireframe booking langkah 3). |
| 3.3.2 Labels or Instructions | label jelas | label tetap terlihat (bukan placeholder-only). |
| 3.3.7 Redundant Entry | tidak minta data yang sama | data ketua otomatis dipakai; anggota isi sendiri via tautan. |
| 3.3.8 Accessible Authentication | tidak ada uji kognitif | tidak ada CAPTCHA puzzle; jika perlu, alternatif aksesibel. |
| 4.1.2 Name, Role, Value | kontrol bernama | komponen `packages/ui` (Button, Dialog, Tabs, Toast) memakai atribut ARIA yang benar. |
| 4.1.3 Status Messages | status diumumkan | toast & sinkron POS / progres "menahan kuota" memakai `aria-live="polite"`. |

**Verifikasi:** `@axe-core/playwright` di E2E halaman kunci (booking, status jalur, Closure Desk,
POS) → nol pelanggaran serius; dilengkapi Storybook/`docs/ux/katalog` untuk komponen.

## 2. Layar kecil & perangkat rendah (PRD §8 "Perangkat": Android murah, layar kecil, jaringan lambat)

- Breakpoint minimum **320px**; uji di 360×640 (target utama Pak Joko & Mas Dimas).
- Teks isi ≥ 16px; padding halaman ≥ 16px; target sentuh ≥ 44px.
- Tabel data (Closure Desk, manifest) berubah jadi **kartu bertumpuk** di < 640px, bukan scroll
  horizontal dua arah.
- Bundle ringan: gambar responsif (AVIF/WebP, lazy), tanpa font eksternal berat; CSS dibatasi budget CI
  (PRD §9.4A). Uji profil **4G** dengan LCP < 2,5s (publik) / < 2,0s (landing, AC-41.1).
- POS: tetap berfungsi **penuh offline ≥ 24 jam**; indikator ● Offline selalu terlihat; aksi
  check-in tidak diblokir saat jaringan mati (AC-16.1).
- Tema gelap wajib (petugas bekerja malam/luar ruang); bukan pilihan opsional (PRD §9.4A).

## 3. `prefers-reduced-motion`

Aturan normatif:

1. Semua transisi/animasi token (`--tg-animate-*`, durasi) **wajib** dibungkus:

   ```css
   @media (prefers-reduced-motion: reduce) {
     *, ::before, ::after {
       animation-duration: 0.01ms !important;
       animation-iteration-count: 1 !important;
       transition-duration: 0.01ms !important;
       scroll-behavior: auto !important;
     }
   }
   ```

2. Tidak ada gerakan yang menjadi **pembawa makna tunggal** (SC 2.3.3); status juga disampaikan lewat
   teks/ikon (mis. "◐ Menyimpan…" bukan hanya spinner).
3. Skeleton loading tidak mem-pulse saat reduced-motion → ganti dengan latar statis `surface-raised`.
4. Tidak ada animasi otomatis yang berjalan > 5 detik tanpa kontrol (SC 2.2.2).
5. Motion tetap "halus" pada tema default (PRD §9.4C) — dibatasi durasi pendek (100–300ms), hanya
   transform/opacity (bukan `width`/`top`) agar tidak memicu reflow di perangkat murah.

## 4. Checklist per komponen `packages/ui` (dipakai T-011)

Setiap komponen wajib: state **loading / empty / error**, lulus axe, dapat dioperasikan keyboard,
punya indikator fokus terlihat, dan memakai token (tanpa hardcode). Khusus:

- **StatusBadge jalur / QuotaMeter**: jangan andalkan warna saja — sertakan teks/label (SC 1.4.1).
- **Stepper booking**: `aria-current="step"`, label langkah.
- **Toast**: `role="status"`/`aria-live="polite"`, dapat ditutup via keyboard.
- **Calendar kuota**: navigasi keyboard penuh, tanggal dinonaktifkan punya alasan terteks.
