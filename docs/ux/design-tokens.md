# Token Desain TrailGate — spesifikasi token (kontribusi untuk FR-39 / T-010; kartu T-007: FR-02, FR-09, FR-15, FR-16)

Dokumen ini adalah **spesifikasi token**, bukan kode. Implementasi nyata ada di `packages/design-tokens`
(T-010). Semua nilai mentah (hex/px) **hanya** boleh hidup di file ini dan di paket token; komponen
`packages/ui` dan `apps/**` dilarang memuat warna/ukuran hardcode (PRD §9.4A, AC-39.1).

Aturan yang mengikat:

1. Token = satu sumber. Komponen hanya merujuk **peran semantik** (`bg-surface`, `text-fg-muted`),
   tidak pernah primitif (`gray-500`).
2. Terang + gelap sejak awal (PRD §9.4A, §8 "Mode gelap"). Nama peran sama; nilainya berbeda per tema.
3. Tema tenant (logo + warna merek, FR-02) di-inject **saat runtime** sebagai CSS variables, tanpa
   deploy ulang (AC-02.1). Variabel yang boleh di-override tenant dibatasi (lihat §7).
4. Pemetaan ke Tailwind v4 memakai `@theme inline` + CSS variables, sehingga utilitas Tailwind
   (`bg-brand`, `text-fg`) mengikuti tema runtime.

## 0. Konvensi penamaan, sumber mentah, & pemetaan ke Tailwind v4

**Sumber mentah.** Tabel §1.1 adalah *spesifikasi referensi*. File token mentah (JSON) yang di-build
menjadi CSS variables adalah **artefak T-010** di `packages/design-tokens` dan **tidak disimpan di
`docs/ux`** — dua sumber machine-readable akan drift, sedangkan AC-39.1 menuntut satu sumber. T-010
wajib menyalin nilai §1.1 apa adanya (tanpa mengarang nilai) dan CI membandingkannya.

Dua lapis:

- **Primitif** `--tg-<keluarga>-<langkah>` (mis. `--tg-gray-500`, `--tg-green-700`) — hanya dipakai
  di dalam file token ini. Kategori: warna, tipografi, spasi, radius, bayangan, motion.
- **Semantik** `--tg-<peran>` (mis. `--tg-canvas`, `--tg-fg-muted`) — satu-satunya yang dipakai
  komponen. Nilai semantik = `var(--tg-<primitif>)` pada salah satu tema.

**Fallback (satu konvensi untuk semua peran).** Di mapping `@theme inline`, setiap peran dipetakan
`var(--tg-<peran>, var(--tg-<primitif-default>))` — fallback selalu **rujukan ke primitif**, tidak
pernah hex baru; `:root` tetap mengisi semua peran, sehingga fallback hanya aktif bila variabel kosong/
tidak sah (mis. override tenant tidak valid, yang ditolak T-012).

Pemetaan ke utilitas Tailwind v4 (namespace `@theme`):

```css
@import "tailwindcss";

/* 1. Nilai runtime: tema terang default, gelap via [data-theme="dark"], tenant via inline style */
:root { --tg-canvas: var(--tg-gray-50); /* ... seluruh peran terang ... */ }
[data-theme="dark"] { --tg-canvas: var(--tg-gray-950); /* ... peran gelap ... */ }

/* 2. @theme inline: var runtime -> utilitas Tailwind (fallback = primitif, bukan hex) */
@theme inline {
  --color-canvas: var(--tg-canvas, var(--tg-gray-50));
  --color-fg:     var(--tg-fg, var(--tg-gray-900));
  --font-sans:    var(--tg-font-sans);
  --font-mono:    var(--tg-font-mono);
  --spacing:      var(--tg-space);   /* Tailwind v4 menurunkan semua utilitas spasi dari --spacing */
  --text-base:    var(--tg-text-base);
  --text-base--line-height: var(--tg-text-base-lh);
  --radius-md:    var(--tg-radius-md);
  --shadow-md:    var(--tg-shadow-md);
  --ease-standard: var(--tg-ease-standard);
  --default-transition-duration: var(--tg-duration-base);
}

/* 3. Durasi khusus: Tailwind v4 (4.3.5) TIDAK punya namespace --duration-*, jadi dipasang
      lewat @utility resmi, bukan token @theme. */
@utility duration-fast { transition-duration: var(--tg-duration-fast); }
@utility duration-slow { transition-duration: var(--tg-duration-slow); }
```

Utilitas yang dihasilkan: `bg-canvas`, `bg-surface`, `bg-surface-raised`, `text-fg`, `text-fg-muted`,
`text-fg-subtle`, `border-border`, `border-border-strong`, `bg-brand`, `text-brand-fg`,
`bg-success-subtle`, `text-danger`, `ring-focus`, `rounded-md`, `shadow-md`, `ease-standard`, dsb.
**Tidak ada** kelas `bg-[#...]` atau `text-[13px]` di komponen (dicek CI, AC-39.1).

> Catatan `@theme inline`: dipakai (bukan `@theme` biasa) karena nilainya merujuk CSS variable lain
> sehingga bisa berubah per tema/tenant tanpa rebuild. Detail pipeline di `docs/ux/token-pipeline.md` (T-010).
> Primitif terkait: `--tg-font-sans`/`--tg-font-mono` (§2), `--tg-text-*`/`--tg-text-*-lh` (§2),
> `--tg-space` (§3), `--tg-radius-*` (§4), `--tg-shadow-*` (§5), `--tg-ease-*`/`--tg-duration-*` (§6).

---

## 1. Warna

### 1.1 Primitif (ramp) — hex hidup di sini saja

| Ramp | 50 | 100 | 200 | 300 | 400 | 450 | 500 | 600 | 700 | 800 | 900 | 950 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `--tg-gray-*` | `#FAFAF9` | `#F5F5F4` | `#E7E5E4` | `#D6D3D1` | `#A8A29E` | `#969089` | `#78716C` | `#57534E` | `#44403C` | `#292524` | `#1C1917` | `#0C0A09` |
| `--tg-green-*` | `#F0FDF4` | `#DCFCE7` | `#BBF7D0` | `#86EFAC` | `#4ADE80` | — | `#22C55E` | `#16A34A` | `#15803D` | `#166534` | `#14532D` | `#052E16` |
| `--tg-amber-*` | `#FFFBEB` | `#FEF3C7` | `#FDE68A` | `#FCD34D` | `#FBBF24` | — | `#F59E0B` | `#D97706` | `#B45309` | `#92400E` | `#78350F` | `#451A03` |
| `--tg-red-*` | `#FEF2F2` | `#FEE2E2` | `#FECACA` | `#FCA5A5` | `#F87171` | — | `#EF4444` | `#DC2626` | `#B91C1C` | `#991B1B` | `#7F1D1D` | `#450A0A` |
| `--tg-blue-*` | `#EFF6FF` | `#DBEAFE` | `#BFDBFE` | `#93C5FD` | `#60A5FA` | — | `#3B82F6` | `#2563EB` | `#1D4ED8` | `#1E40AF` | `#1E3A8A` | `#172554` |
| `--tg-teal-*` | `#F0FDFA` | `#CCFBF1` | `#99F6E4` | `#5EEAD4` | `#2DD4BF` | — | `#14B8A6` | `#0D9488` | `#0F766E` | `#115E59` | `#134E4A` | `#042F2E` |
| `--tg-emerald-*` (brand default) | `#ECFDF5` | `#D1FAE5` | `#A7F3D0` | `#6EE7B7` | `#34D399` | — | `#10B981` | `#059669` | `#047857` | `#065F46` | `#064E3B` | `#022C22` |

Primitif tunggal (bukan bagian ramp): `--tg-white` = `#FFFFFF` (latar `surface` terang,
`brand-fg`/`primary-fg`).

Ramp netral memakai skala **stone**; ramp warna memakai langkah **Tailwind CSS v4** (label = langkah
Tailwind, dicocokkan satu per satu; `gray-450` adalah langkah tambahan milik TrailGate). Brand default
emerald, dapat diganti tenant (FR-02).

### 1.2 Peran semantik — TEMA TERANG

| Peran (CSS var `--tg-...`) | Nilai | Fungsi |
|---|---|---|
| `canvas` | `gray-50` | latar halaman |
| `surface` | `white` | kartu, panel |
| `surface-raised` | `gray-100` | elevasi ringan, header sticky |
| `fg` | `gray-900` | teks utama |
| `fg-muted` | `gray-700` | teks sekunder |
| `fg-subtle` | `gray-600` | teks meta, caption |
| `border` | `gray-200` | garis dekoratif/pemisah |
| `border-strong` | `gray-500` | batas komponen interaktif (input, tombol outline) |
| `brand` | `emerald-700` | warna merek tenant (dapat di-override) |
| `brand-fg` | `white` (default); diturunkan §1.5 | teks di atas `brand` |
| `brand-subtle` / `brand-subtle-fg` | `emerald-50` / `emerald-800` | latar merek tipis |
| `primary` | `teal-700` | aksi utama platform |
| `primary-fg` | `white` | teks di atas `primary` |
| `success` | `green-700` | status positif (jalur buka, lunas) |
| `success-subtle` / `success-subtle-fg` | `green-50` / `green-800` | badge/toast |
| `warning` | `amber-700` | peringatan (kuota hampir habis) |
| `warning-subtle` / `warning-subtle-fg` | `amber-50` / `amber-800` | badge/toast |
| `danger` | `red-700` | error, jalur tutup, tolak |
| `danger-subtle` / `danger-subtle-fg` | `red-50` / `red-700` | badge/toast |
| `info` | `blue-700` | informasi netral |
| `info-subtle` / `info-subtle-fg` | `blue-50` / `blue-700` | badge/toast |
| `focus` | `teal-700` | ring fokus (outline 2px + offset) |
| `overlay` | `rgb(28 25 23 / 0.6)` (= `gray-900` @ 60%) | scrim dialog/sheet |

### 1.3 Peran semantik — TEMA GELAP

| Peran | Nilai | Catatan |
|---|---|---|
| `canvas` | `gray-950` | |
| `surface` | `gray-900` | |
| `surface-raised` | `gray-800` | |
| `fg` | `gray-50` | |
| `fg-muted` | `gray-400` | |
| `fg-subtle` | `gray-450` | ≥ 4,5:1 di `canvas` dan `surface-raised` (§1.4) |
| `border` | `gray-800` | dekoratif |
| `border-strong` | `gray-500` | batas komponen interaktif |
| `brand` | `emerald-400` | merek versi terang |
| `brand-fg` | diturunkan §1.5 | teks di atas `brand` |
| `brand-subtle` / `brand-subtle-fg` | `emerald-950` / `emerald-200` | latar merek tipis |
| `primary` | `teal-300` | |
| `primary-fg` | `gray-950` | |
| `success` | `green-400` | |
| `success-subtle` / `success-subtle-fg` | `green-950` / `green-200` | |
| `warning` | `amber-400` | |
| `warning-subtle` / `warning-subtle-fg` | `amber-950` / `amber-200` | |
| `danger` | `red-400` | |
| `danger-subtle` / `danger-subtle-fg` | `red-950` / `red-200` | |
| `info` | `blue-400` | |
| `info-subtle` / `info-subtle-fg` | `blue-950` / `blue-200` | |
| `focus` | `teal-300` | |
| `overlay` | `rgb(12 10 9 / 0.7)` (= `gray-950` @ 70%) | scrim dialog/sheet |

### 1.4 Rasio kontras terverifikasi (dihitung, bukan diklaim)

Dihitung dengan rumus WCAG 2.x relative luminance. Ambang: **≥ 4,5:1** teks normal, **≥ 3:1** teks
besar/komponen non-teks (SC 1.4.3 & 1.4.11).

Setiap baris dihitung dari pasangan primitif §1.1; verifikasi ulang otomatis:
`node docs/ux/contrast-check.mjs` (35 baris, 0 selisih).

| Pasangan (peran) | Primitif | Rasio | Lulus |
|---|---|---|---|
| terang `fg` / `canvas` | `gray-900` / `gray-50` | 16,74:1 | AA |
| terang `fg-muted` / `canvas` | `gray-700` / `gray-50` | 9,84:1 | AA |
| terang `fg-subtle` / `canvas` | `gray-600` / `gray-50` | 7,30:1 | AA |
| terang `fg-subtle` / `surface-raised` | `gray-600` / `gray-100` | 6,99:1 | AA |
| terang `fg-subtle` / `surface` | `gray-600` / `white` | 7,63:1 | AA |
| terang `fg` / `surface-raised` | `gray-900` / `gray-100` | 16,03:1 | AA |
| terang `brand` / `brand-fg` | `emerald-700` / `white` | 5,48:1 | AA |
| terang `brand-subtle-fg` / `brand-subtle` | `emerald-800` / `emerald-50` | 7,29:1 | AA |
| terang `primary` / `primary-fg` | `teal-700` / `white` | 5,47:1 | AA |
| terang `success` / `surface` | `green-700` / `white` | 5,02:1 | AA |
| terang `warning` / `surface` | `amber-700` / `white` | 5,02:1 | AA |
| terang `danger` / `surface` | `red-700` / `white` | 6,47:1 | AA |
| terang `info` / `surface` | `blue-700` / `white` | 6,70:1 | AA |
| terang badge sukses | `green-800` / `green-50` | 6,81:1 | AA |
| terang badge peringatan | `amber-800` / `amber-50` | 6,84:1 | AA |
| terang badge bahaya | `red-700` / `red-50` | 5,91:1 | AA |
| terang badge info | `blue-700` / `blue-50` | 6,16:1 | AA |
| terang `border-strong` / `canvas` | `gray-500` / `gray-50` | 4,59:1 | ≥3 (komponen) |
| gelap `fg` / `canvas` | `gray-50` / `gray-950` | 18,92:1 | AA |
| gelap `fg-muted` / `canvas` | `gray-400` / `gray-950` | 7,83:1 | AA |
| gelap `fg-muted` / `surface-raised` | `gray-400` / `gray-800` | 6,01:1 | AA |
| gelap `fg-subtle` / `canvas` | `gray-450` / `gray-950` | 6,25:1 | AA |
| gelap `fg-subtle` / `surface-raised` | `gray-450` / `gray-800` | 4,80:1 | AA |
| gelap `brand` / `canvas` | `emerald-400` / `gray-950` | 10,28:1 | AA |
| gelap `brand-subtle-fg` / `brand-subtle` | `emerald-200` / `emerald-950` | 11,81:1 | AA |
| gelap `primary` / `canvas` | `teal-300` / `gray-950` | 13,35:1 | AA |
| gelap `success` / `canvas` | `green-400` / `gray-950` | 11,34:1 | AA |
| gelap `warning` / `canvas` | `amber-400` / `gray-950` | 11,83:1 | AA |
| gelap `danger` / `canvas` | `red-400` / `gray-950` | 7,14:1 | AA |
| gelap `info` / `canvas` | `blue-400` / `gray-950` | 7,77:1 | AA |
| gelap badge sukses | `green-200` / `green-950` | 12,30:1 | AA |
| gelap badge peringatan | `amber-200` / `amber-950` | 12,03:1 | AA |
| gelap badge bahaya | `red-200` / `red-950` | 11,16:1 | AA |
| gelap badge info | `blue-200` / `blue-950` | 10,34:1 | AA |
| gelap `border-strong` / `surface` | `gray-500` / `gray-900` | 3,65:1 | ≥3 (komponen) |

`border` (dekoratif) sengaja di bawah 3:1; **batas komponen interaktif wajib memakai `border-strong`**
(SC 1.4.11). Ring fokus `focus` ≥ 3:1 terhadap latar yang berdekatan.

### 1.5 Aturan validator kontras WCAG AA (normatif)

Menyesuaikan **AC-02.2** (`docs/requirements/FR.md`): perilaku **"tolak, bukan sesuaikan"** bersifat
normatif. Pilihan **menolak** (bukan menyesuaikan) atas PRD §9.4A yang juga mengizinkan penyesuaian
adalah **[REKOMENDASI]** — alasan AC-02.2: penyesuaian otomatis mengubah identitas merek tanpa
persetujuan tenant.

> **Given** warna merek tenant gagal memenuhi WCAG AA,
> **when** disimpan,
> **then** penyimpanan **ditolak (HTTP 422)** dengan pesan berisi **nilai kontras terukur** —
> warna gagal **tidak pernah tersimpan**, dan **penyesuaian otomatis tidak dilakukan**.
> **Pengecekan:** tes validator dengan fixture warna gagal → 422.

Aturan teknis validator (perilaku):

- Input: pasangan `(warna_merek, warna_teks_di_atasnya)`. Platform **menurunkan `brand-fg` lebih dulu**
  (hanya `#FFFFFF` atau `#000000`, mana yang memberi rasio tertinggi) — ini pemilihan warna teks oleh
  platform, **bukan** penyesuaian warna merek tenant. Validasi dijalankan atas pasangan
  `(merek, brand-fg turunan)`.
- Ambang: teks normal **≥ 4,5:1**; teks besar (≥ 24px atau ≥ 18,66px bold) **≥ 3:1**; komponen
  non-teks (border tombol merek, ikon status) **≥ 3:1** (SC 1.4.11).
- Gagal → **422** + pesan bahasa Indonesia yang menyertakan **rasio terukur** (mis. "Kontras warna
  merek 2,9:1 — minimal 4,5:1") + field rasio terukur. Bentuk body JSON konkret
  (`{contrast_ratio, required, pair}`) hanya **usulan ke `tg-architect`** (kontrak di
  `packages/contracts`), bukan ditetapkan di sini.
- Tidak ada jalur kode yang menuliskan warna gagal; warna merek tenant **tidak pernah**
  di-lighten/di-darken otomatis.
- Nilai default (tanpa override tenant) pada §1.4 sudah lulus, sehingga tema bawaan aman.

---

## 2. Tipografi

Font: **Inter** (var, subset latin) sebagai `--tg-font-sans` dengan fallback sistem; `--tg-font-mono`
untuk kode booking/QR. **Tanpa font eksternal berat** (PRD §9.4A); font di-self-host.

| Token | Ukuran / line-height | Tailwind | Fungsi |
|---|---|---|---|
| `--tg-text-xs` | 0,75rem / 1rem (12/16) | `text-xs` | caption, meta |
| `--tg-text-sm` | 0,875rem / 1,25rem (14/20) | `text-sm` | label, teks bantu |
| `--tg-text-base` | 1rem / 1,5rem (16/24) | `text-base` | teks isi (minimum di ponsel) |
| `--tg-text-lg` | 1,125rem / 1,75rem (18/28) | `text-lg` | lead, judul kartu |
| `--tg-text-xl` | 1,25rem / 1,75rem (20/28) | `text-xl` | judul seksi |
| `--tg-text-2xl` | 1,5rem / 2rem (24/32) | `text-2xl` | judul halaman |
| `--tg-text-3xl` | 1,875rem / 2,25rem (30/36) | `text-3xl` | hero (ponsel) |
| `--tg-text-4xl` | 2,25rem / 2,5rem (36/40) | `text-4xl` | hero (desktop) |
| `--tg-weight-regular` | 400 | `font-normal` | isi |
| `--tg-weight-medium` | 500 | `font-medium` | label |
| `--tg-weight-semibold` | 600 | `font-semibold` | judul, tombol |
| `--tg-leading-tight` | 1,25 | `leading-tight` | judul |
| `--tg-leading-normal` | 1,5 | `leading-normal` | isi |

Line-height per langkah dideklarasikan sebagai `--tg-text-<step>-lh` (nilai = kolom line-height di atas)
dan dipetakan di `@theme` sebagai `--text-<step>` + `--text-<step>--line-height` (lihat §0).

Skala responsif: ukuran langkah ≥ `text-lg` memakai `clamp()` pada breakpoint (ponsel ≤ 360px turun
satu langkah). Teks isi **tidak pernah < 16px** di ponsel (hindari zoom iOS + keterbacaan luar ruang).

## 3. Spasi

Unit dasar `--tg-space: 0,25rem` (=4px); Tailwind v4 menurunkan semua utilitas spasi dari
`--spacing`. Skala terpakai:

| Token | Nilai | Tailwind |
|---|---|---|
| `--tg-space-1` | 0,25rem | `p-1`/`gap-1` |
| `--tg-space-2` | 0,5rem | `p-2` |
| `--tg-space-3` | 0,75rem | `p-3` |
| `--tg-space-4` | 1rem | `p-4` |
| `--tg-space-6` | 1,5rem | `p-6` |
| `--tg-space-8` | 2rem | `p-8` |
| `--tg-space-12` | 3rem | `p-12` |
| `--tg-space-16` | 4rem | `p-16` |

Padding halaman minimum 16px di ponsel; area sasaran sentuh (target tap) **≥ 44×44px** (SC 2.5.8 /
rekomendasi §9.4B mobile).

## 4. Radius

| Token | Nilai | Tailwind | Fungsi |
|---|---|---|---|
| `--tg-radius-sm` | 0,25rem | `rounded-sm` | chip kecil |
| `--tg-radius-md` | 0,5rem | `rounded-md` | tombol, input |
| `--tg-radius-lg` | 0,75rem | `rounded-lg` | kartu |
| `--tg-radius-xl` | 1rem | `rounded-xl` | modal/sheet |
| `--tg-radius-full` | 9999px | `rounded-full` | avatar, pill badge |

## 5. Bayangan

| Token | Nilai | Tailwind |
|---|---|---|
| `--tg-shadow-sm` | `0 1px 2px 0 rgb(0 0 0 / 0.05)` | `shadow-sm` |
| `--tg-shadow-md` | `0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)` | `shadow-md` |
| `--tg-shadow-lg` | `0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)` | `shadow-lg` |

Bayangan memakai `rgb(0 0 0 / α)` berbasis fungsi warna (bukan hex) dan **bukan sumber makna tunggal**:
setiap elevasi juga dibedakan lewat `surface-raised` + `border` agar terbaca di tema gelap dan oleh
pengguna dengan persepsi kontras rendah.

## 6. Motion

| Token | Nilai | Tailwind | Fungsi |
|---|---|---|---|
| `--tg-duration-fast` | 100ms | `duration-fast` (`@utility`, §0) | hover, fokus |
| `--tg-duration-base` | 200ms | `--default-transition-duration` (§0) | transisi default (kontrol, dropdown) |
| `--tg-duration-slow` | 300ms | `duration-slow` (`@utility`, §0) | sheet, dialog |
| `--tg-ease-standard` | `cubic-bezier(0.2, 0, 0, 1)` | `ease-standard` | masuk/keluar standar |
| `--tg-ease-decelerate` | `cubic-bezier(0, 0, 0, 1)` | `ease-decelerate` | elemen masuk |
| `--tg-animate-pulse` | `pulse 1.5s ease-in-out infinite` | `animate-pulse` | skeleton loading |

Setiap animasi transisi **wajib** dibungkus media query `prefers-reduced-motion` (lihat
`docs/ux/accessibility.md` §3); motion bukan pembawa makna tunggal (SC 2.3.3).

---

## 7. Kontrak injeksi tema tenant (FR-02 / AC-02.1)

Variabel yang boleh di-override tenant lewat `style` pada `<html>` saat runtime:

```
--tg-brand, --tg-brand-fg, --tg-brand-subtle
```

Aturan:

1. Tenant HANYA boleh mengubah `--tg-brand`, `--tg-brand-fg`, `--tg-brand-subtle`,
   `--tg-brand-subtle-fg`; sisanya tetap milik platform. Nilai bukan format warna ditolak (T-012).
2. `--tg-brand-fg` **diturunkan platform** (hanya `#FFFFFF`/`#000000`) sebelum validasi; validator
   menguji pasangan `(brand, brand-fg turunan)`. Bila gagal → **422**, merek **tidak disimpan**, dan
   **warna merek tidak diubah** (tidak ada auto-adjust) — §1.5.
3. Injeksi tidak memerlukan deploy ulang (AC-02.1): server merender `<html style="--tg-brand: ...">`.
4. Tema gelap tetap menang atas merek untuk peran non-brand; merek versi gelap diturunkan dari
   primitif ramp yang sama dan divalidasi ulang untuk pasangan gelap.

---

## Cakupan AC (lih. `docs/requirements/FR.md`)

**Spesifikasi dipenuhi di sini; verifikasi implementasi di tugas yang disebut.** Tabel ini memetakan
di mana setiap AC *dijabarkan* oleh T-007 — bukan bukti perilaku runtime sudah lulus.

| AC | Status di T-007 | Verifikasi implementasi |
|---|---|---|
| **AC-02.1** | spesifikasi injeksi merek runtime — §0 + §7 | E2E memuat halaman & cek variabel CSS (T-012) |
| **AC-02.2** | spesifikasi validator tolak-422 — §1.5 | tes validator kontras → 422 (T-012) |
| **AC-09.1** | wireframe langkah 2–3 (`wireframes/booking.md`) | E2E booking (T-141/T-142) |
| **AC-09.2** | wireframe langkah 3: tautan pengisian anggota | E2E (T-142) |
| **AC-09.3** | wireframe langkah 3 (state loading): progres dipulihkan | E2E isi → reload (T-142) |
| **AC-15.1** | wireframe POS normal/offline (`wireframes/pos-checkin.md`) | ADR-004 + `apps/pos` (tg-console) |
| **AC-15.2** | wireframe POS state error (scan ganda, token dicabut) | ADR-004 §3–4 + `apps/pos` |
| **AC-15.3** | wireframe tiket (`wireframes/booking.md` langkah 5) | E2E tiket/PDF (T-161) |
| **AC-16.1** | wireframe POS offline + antrean sinkron | ADR-004 + `apps/pos` (tg-console) |
| **AC-16.2** | wireframe sinkron + log konflik | ADR-004 §2/§4 + `apps/pos` |
| **AC-39.1** | spesifikasi token → CSS variables → `@theme`, larangan hardcode (§0) | **T-010** (build/CI) |
| **AC-39.2** | spesifikasi validator kontras (§1.5) | **T-012** (validator + tes) |
| **AC-39.3** | spesifikasi state/motion/a11y (`accessibility.md` §4) | **T-011** (komponen, axe, state) |

### Tidak dicakup di T-007

T-007 hanya spesifikasi `docs/ux/**`; hal berikut diverifikasi/diimplementasi di tugas lain:

| Hal | Pemilik |
|---|---|
| AC-02.1 injeksi runtime nyata (E2E) | T-012 (`apps/web`) |
| AC-02.2 tes validator kontras (fixture → 422) | T-012 |
| AC-39.1 pipeline token + budget CSS di CI | T-010 (`packages/design-tokens`, CI) |
| AC-39.3 komponen `packages/ui`, axe, state | T-011 (`packages/ui`) |
| AC-41.2 hero landing + copy bersumber (`copy-id.md` hanya pedoman CTA, bukan landing) | T-116/T-117 (`apps/web`) |
| Detail implementasi POS AC-15.1/16.1 (IndexedDB, kunci publik, daftar revoke) | ADR-004 + `apps/pos` (tg-console) |

Aksesibilitas: `accessibility.md` (WCAG 2.2 AA, layar kecil/rendah, `prefers-reduced-motion`).
