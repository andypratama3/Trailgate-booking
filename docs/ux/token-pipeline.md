# Pipeline Token — Tailwind v4 CSS-first + budget CSS (T-010)

> **Pemilik:** tg-ux · **Co-owner:** tg-devops (job CI / Makefile) · **Status:** delivered (T-010, P0)
> **Dokumen terkait:** `docs/ux/design-tokens.md` (spesifikasi nilai), `docs/adr/ADR-006` (pin versi),
> `docs/adr/ADR-007` (deviasi P0), `packages/design-tokens/README.md` (ringkas).
> FR: FR-39 · AC: AC-39.1 (token → CSS vars → `@theme`, larangan hardcode, budget CSS di CI).

## 1. Arsitektur

Satu sumber nilai → satu build → dua berkas CSS → dipetakan ke utilitas Tailwind v4:

```
docs/ux/design-tokens.md §1–§6      (spesifikasi manusia; nilai hidup di sini DAN di tokens.json)
        │  parity dijaga scripts/check-doc-parity.mjs (CI)
        ▼
packages/design-tokens/tokens.json   (SUMBER TUNGGAL machine-readable: primitif + peran ×2 tema + pemetaan)
        │  pnpm -C packages/design-tokens build   (node build.mjs, tanpa dependensi)
        ▼
packages/design-tokens/css/tokens.css             (~6.3 KiB)  CSS variables
        │                                            :root (terang) + [data-theme="dark"] (gelap)
        ▼
packages/design-tokens/css/theme.css              (~4.0 KiB)  @theme inline → utilitas Tailwind v4
        │                                            + @utility duration-fast/slow + @keyframes pulse
        ▼
apps/web/app/globals.css  @import kedua berkas     →  bg-canvas, text-fg-muted, rounded-md, p-6, …
```

Prinsip (berlaku untuk semua tugas berikutnya):

1. **Komponen tidak boleh memuat nilai mentah.** Primitif (`--tg-gray-500`) dan nilai mentah (hex/px)
   hanya hidup di `docs/ux/design-tokens.md` + `tokens.json` + dua berkas `css/` **generated**. Komponen
   di `packages/ui` dan `apps/**` memakai peran semantik (`bg-surface`, `text-fg-muted`) saja — dicek
   `scripts/check-no-hardcode.mjs` (AC-39.1).
2. **Tema gelap dari sumber yang sama.** Nama peran identik (`§5`); bedanya hanya nilainya di
   `tokens.json` per tema, jadi kedua tema digenerate satu build.
3. **Tenant dapat menimpa** `--tg-brand`, `--tg-brand-fg`, `--tg-brand-subtle(-fg)` **saat runtime**
   lewat `style` pada `<html>` (FR-02 / AC-02.1), tanpa rebuild — `@theme inline` memakai `var()`
   sehingga utilitas mengikuti CSS variable runtime.
4. **Utilitas Tailwind = peta var, bukan nilai.** `--color-canvas: var(--tg-canvas, var(--tg-gray-50))`
   dst.; fallback selalu rujukan ke primitif tema terang (bukan hex baru); peran bernilai mentah
   (`overlay`) tidak diberi fallback — pengecualian tercatat di `docs/ux/design-tokens.md` §0.

### Mengapa `css/` di-commit, bukan `dist/`

`.gitignore` mengabaikan semua `dist/` (milik tg-devops, tidak diubah di sini; dan repo P0 belum punya
orchestrator build lintas-paket). Agar `pnpm -C apps/web build` tetap hijau di clone bersih tanpa langkah
build dulu, hasil build ditaruh di `css/*.css` yang ikut di-commit. Keseimbangan "sumber tunggal + artefak
commit" dijaga **gerbang drift**: `build --check` meregenerasi di memori dan gagal bila `css/` berbeda
(CI §7), sama seperti gerbang "generator idempotent" lain di repo ini (`packages/contracts`
`generate:check`).

## 2. Cara build & konsumsi

```sh
pnpm -C packages/design-tokens build          # tulis css/tokens.css + css/theme.css
pnpm -C packages/design-tokens check         # drift + parity dokumen↔tokens.json (§1.1–§1.3 + §2–§6)
pnpm -C packages/design-tokens test          # drift + parity + lint hardcode + budget (app CSS opsional)
pnpm -C packages/design-tokens check-no-hardcode  # lint AC-39.1: apps/web/app, apps/pos/app, packages/ui
pnpm -C apps/web build                       # butuh css/ sudah ada (repo commit menyediakannya)
node docs/ux/compare-tailwind-v4.mjs         # bukti provenance rampa §4 (informatif + assert angka)
```

Berkas yang dikonsumsi `apps/web` (wiring `apps/web/app/globals.css`):

```css
@import "tailwindcss";
@import "../../../packages/design-tokens/css/tokens.css";
@import "../../../packages/design-tokens/css/theme.css";

:root { color-scheme: light; }
[data-theme="dark"] { color-scheme: dark; }
```

Pola yang sama untuk `apps/pos` bila perlu (tg-console). Tidak ada dependensi baru: `tokens.json` +
skrip murni Node stdlib; paket tidak punya `dependencies`, sehingga `pnpm-lock.yaml` tidak berubah
akibat T-010 (importer `packages/design-tokens: {}` sudah ada di lock).

## 3. Determinisme

`build.mjs` menulis ulang seluruh berkas dari `tokens.json` (urutan kunci JSON = urutan output; tanpa
timestamp/path acak). Terverifikasi 2026-11-25:

```
$ pnpm -C packages/design-tokens build    (×2, sha256 diff)
da05f5a4…  packages/design-tokens/css/tokens.css   (6452 B)
fc7633a7…  packages/design-tokens/css/theme.css   (4167 B)
IDENTIK: build 2x menghasilkan sha256 sama (ulangi di rework r1 2026-11-25)
```

Gerbang drift CI: jalankan `build` lalu `git diff --exit-code packages/design-tokens/css` (atau
`build --check`).

## 4. Keputusan sumber nilai ramp (temuan N-1 rereview tg-web)

**Temuan:** `docs/ux/design-tokens.md` §1.1 menyatakan ramp = "langkah Tailwind CSS v4", tetapi nilai
hex-nya setara palet Tailwind v3; `tailwindcss` ter-pin 4.3.5 menyimpan nilai `oklch` yang saat
dibuild ke layar memberi hex berbeda.

**Keputusan: opsi (b) — reword §1.1.** Nilai ramp **tetap palet sRGB Tailwind v3** (netral = stone;
green/amber/red/blue/teal/emerald), yang sudah terverifikasi WCAG AA; hanya *penamaan langkah* yang
mengikuti konvensi Tailwind. Primitif milik TrailGate hanya dua: `gray-450` (tidak ada di palet
Tailwind) dan `--tg-black` (Tailwind memakai `#000`/`--color-black: #000`; kita memakai `#000000` agar
satu format `#RRGGBB`). §1.1 kini menyatakan ini + atribusi versi; `tokens.json` menyalin nilai itu
apa adanya; parity dijaga CI (`check-doc-parity.mjs`).

**Alasan (bukti dapat direproduksi, bukan klaim):** mengadopsi nilai `oklch`→sRGB Tailwind v4 untuk 7
ramp (`theme.css` tailwindcss 4.3.5, konversi CSS Color 4):

- **62 dari 78 langkah ramp berbeda nilainya**; `gray-450` tidak punya padanan di `theme.css` v4 sama
  sekali, jadi opsi (a) **memaksa mengarang nilai** untuk peran gelap `fg-subtle`.
- **23 dari 35 baris kontras terverifikasi §1.4 bergeser >0,01** bila v4 diadopsi (contoh:
  `primary`/`primary-fg` terang 5,47 → 5,36; `primary`/`canvas` gelap 13,35 → 13,38;
  `danger`/`canvas` gelap 7,14 → 6,84); tabel `docs/ux/design-tokens.md` §1.4 dan
  `docs/ux/contrast-check.mjs` (35 baris, 0 selisih) harus direvisi ulang seluruhnya.

Angka di atas direproduksi oleh **`docs/ux/compare-tailwind-v4.mjs`** dengan fixture
**`docs/ux/tailwind-v4-palette.json`** (nilai `oklch` disalin verbatim dari `theme.css` paket ter-pin
4.3.5; akhir skrip ber-assert angka tetap 62/1 dan 23/2 — mengubahnya berarti mengubah kesimpulan,
bukan kode). Jalankan: `node docs/ux/compare-tailwind-v4.mjs`.

Karena (1) ramp hanya dipakai lewat peran semantik (komponen tidak menyentuh primitif), dan (2) nilai
pada `:root`/`[data-theme]` adalah sRGB yang bisa dibaca langsung — nilai ter-pin yang sudah diuji
kontrasnya dipertahankan; dokumen dikoreksi **provenancenya**, bukan nilainya. Padanan v4 (opsi a) bisa
dikejar belakangan sebagai amendemen ADR bila tim ingin palet identik bit-per-bit dengan Tailwind v4 —
utang yang disengaja, bukan diam-diam. Kecocokan byte-per-byte dengan palet v3 (atribusi §1.1)
diverifikasi pada review T-010 (temuan tg-web F-2); tidak direproduksi di repo ini karena `tailwindcss`
v3 tidak terpasang.

## 5. Cara token gelap dihasilkan

`tokens.json` menyimpan **satu pasang nilai per peran**: `semantic.<role>.light` dan
`semantic.<role>.dark`. `build.mjs` menulis `:root` dari `.light` dan `[data-theme="dark"]` dari
`.dark`, keduanya `var(--tg-<primitif>)` — jadi gelap bukan tema terpisah, melainkan pemetaan ulang ke
primitif yang sama. Peran `overlay` bernilai mentah (`rgb(...)` + alpha) di kedua tema, satu-satunya
pengecualian.

- `brand-fg` gelap = `--tg-black` (`#000000`): diturunkan dari aturan §1.5 (hanya `#FFFFFF`/`#000000`,
  dipilih yang rasio tertinggi terhadap `--tg-brand` gelap = `emerald-400`, ≈ 11:1). Penurunan runtime
  untuk **tema tenant** adalah milik validator T-012 (AC-02.2); di sini disediakan nilai default tema
  bawaan yang sudah lulus AA.
- Keyframes `pulse` dideklarasikan ulang di `theme.css`: Tailwind v4 **membuang @keyframes bawaan**
  ketika `--animate-*` dioverride lewat `@theme inline` (terverifikasi: default → `pulse` ada,
  setelah override → hilang).
- Motion (§6 spesifikasi): tiap transisi animasi wajib dibungkus `prefers-reduced-motion`
  (T-011, `docs/ux/accessibility.md` §3); pipeline hanya menyediakan token durasi/ease dan keyframes.

## 6. Budget ukuran CSS

**Skrip:** `packages/design-tokens/scripts/css-budget.mjs` (Node stdlib, `gzipSync` untuk laporan saja).
**Batas:** `packages/design-tokens/budget.json` → `limitsBytes.tokensCss = 12288`, `appCss = 40960`
(raw, tanpa kompresi — deterministik dan tidak bergantung implementasi kompresi).

| Kelompok | Batas | Terukur (2026-11-25, `next build`) | Selisih |
|---|---|---|---|
| token CSS (`css/*.css`) | 12288 B (12 KiB) | 10619 B (6452 + 4167) — gzip 3,0 KiB | +1.6 KiB |
| app CSS (`apps/web/.next/static/**/*.css`) | 40960 B (40 KiB) | 10322 B — gzip 3,1 KiB | +29.9 KiB |

Alasan angka: token CSS naik ~1,5× dari sekarang bila ramp/tipe ditambah (guard nyata tanpa trip sesaat);
app CSS 40 KiB = muat halaman landing + konsol P1 dengan headroom ~4× sebelum lintas penuh
`@shadcn`/pustaka UI — alarm prematur mengalahkan alarm telat; angka bisa dinaikkan hanya lewat
amendemen dokumen ini + `budget.json` (jangan diam-diam).

Perintah CI yang disarankan (lihat serahan §7): build token → drift gate → `next build` →
`pnpm -C packages/design-tokens budget:require-app`.

## 7. Serahan ke tg-devops (co-owner) — job CI / Makefile

`.github/**` dan `Makefile` (root) milik tg-devops; **tidak disentuh konflik di T-010**. Spesifikasi
job yang diminta dipasang oleh tg-devops (T-008 / T-011 katalog):

1. **Build token + drift gate:** `pnpm -C packages/design-tokens build` lalu
   `git diff --exit-code packages/design-tokens/css` (gagal = artefak commit tidak sinkron dengan
   `tokens.json`).
2. **Parity dokumen↔token:** `pnpm -C packages/design-tokens check` (parity
   `docs/ux/design-tokens.md` §1.1–§1.3 + §2–§6 ↔ `tokens.json`; ini wajib “CI membandingkan nilai
   §1.1” dari `docs/ux/design-tokens.md` §0) — atau langsung `node packages/design-tokens/scripts/check-doc-parity.mjs`.
3. **Lint hardcode (AC-39.1):** `pnpm -C packages/design-tokens check-no-hardcode` (=
   `node packages/design-tokens/scripts/check-no-hardcode.mjs`) — pindai
   `apps/web/app apps/pos/app packages/ui`. Gagal bila ada hex, utilitas primitif Tailwind
   (`bg-gray-500`), atau nilai arbitrer berwarna/besar (`bg-[#...]`, `text-[13px]`).
4. **Budget CSS:** setelah `next build`, `pnpm -C packages/design-tokens budget:require-app` (gagal
   bila lewat batas **atau** build app belum ada — mencegah skip diam-diam).
5. **Kontras WCAG:** `node docs/ux/contrast-check.mjs` (35 baris, tetap 0 selisih).

Urutan dalam CI: `1 → 2 → 3 → build web → 4 → 5`. Target Makefile yang bisa ditambahkan:
`tokens` (`pnpm -C packages/design-tokens build`), `tokens:check`
(`pnpm -C packages/design-tokens check && node packages/design-tokens/scripts/check-no-hardcode.mjs`),
dan tambahkan ke `ci:`.

## 8. Temuan sisa (bukan T-010, wajib dijawab pemilik)

- **`apps/pos/app/manifest.ts` (owner: tg-console) — SELESAI (T-014)**: pengecualian tertulis
  (T-014 opsi b; §8 lama menamainya opsi a). Nilai warna manifest PWA dibaca OS/browser
  sebelum stylesheet dimuat, sehingga CSS variable tidak bisa dipakai; baris
  `background_color` dan `theme_color` diberi penanda `tg-token-lint:allow` + komentar
  alasan di `manifest.ts`. Nilai tetap: `#ffffff` (permukaan terang) dan `#0f766e` =
  `--tg-primary` (teal-700). Kontrak: W3C Web App Manifest §theme_color/§background_color
  (https://www.w3.org/TR/appmanifest/). Lint `check-no-hardcode.mjs` melewati baris yang
  memuat penanda itu, jadi tidak muncul sebagai temuan.
  Nilai sengaja tidak diturunkan dari `tokens.json` saat build: menambah generator +
  gerbang drift untuk 2 nilai statis yang juga dikonsumsi OS tanpa CSS.
- (Dilaporkan di BuildReport; bukan block T-010.)

## 9. Status AC

| AC | Status | Bukti |
|---|---|---|
| AC-39.1 token→CSS vars→`@theme`, larangan hardcode, budget CI | terpenuhi (T-010) + CI menunggu serahan §7 | pipeline §1–§2, lint §7 butir 3, budget §6 |
| AC-39.2 validator kontras | T-012 | — (tidak dicakup T-010) |
| AC-39.3 state/motion/a11y komponen | T-011 | — (tidak dicakup T-010) |
| AC-02.1 injeksi merek runtime | T-012 | pipeline menyediakan pin runtime `--tg-brand*` (§1 butir 3) |
