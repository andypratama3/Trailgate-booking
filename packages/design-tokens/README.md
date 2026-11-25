# `@trailgate/design-tokens` (tg-ux)

Sumber tunggal token desain TrailGate (FR-39 / T-010): warna, tipografi, spasi, radius, bayangan,
motion. Spesifikasi nilainya ada di [`docs/ux/design-tokens.md`](../../docs/ux/design-tokens.md) §1–§6;
arsitektur pipeline + budget ada di [`docs/ux/token-pipeline.md`](../../docs/ux/token-pipeline.md).

```
tokens.json ──build.mjs──▶ css/tokens.css   (CSS variables: primitif + peran terang :root + gelap [data-theme="dark"])
                        └▶ css/theme.css    (@theme inline → utilitas Tailwind v4 + @utility durasi + keyframes)
```

`css/*.css` **digenerate dan ikut di-commit** (bukan `dist/` yang di-gitignore di repo ini), supaya
`pnpm -C apps/web build` jalan di clone bersih tanpa langkah build lintas-paket dulu. Kesegarannya
dijaga gerbang drift `build --check` + CI (lihat `docs/ux/token-pipeline.md` §7).

## Perintah

| Perintah | Arti |
|---|---|
| `pnpm -C packages/design-tokens build` | Regenerasi `css/tokens.css` + `css/theme.css` dari `tokens.json` (deterministik) |
| `pnpm -C packages/design-tokens build --check` | Regenerasi di memori, gagal bila `css/` di disk berbeda (gerbang drift) |
| `pnpm -C packages/design-tokens check` | `build --check` + parity `docs/ux/design-tokens.md` §1.1–§1.3 + §2–§6 ↔ `tokens.json` |
| `pnpm -C packages/design-tokens check-no-hardcode` | Lint AC-39.1: hex / utilitas primitif Tailwind / nilai arbitrer berwarna-besar di komponen |
| `pnpm -C packages/design-tokens budget` | Ukur ukuran CSS vs `budget.json` (gagal bila lewat) |
| `pnpm -C packages/design-tokens budget:require-app` | Sama, tetapi app CSS wajib ada (dipakai CI setelah `next build`) |
| `pnpm -C packages/design-tokens test` | `build --check` + parity + lint hardcode + budget |

## Konsumsi di aplikasi

```css
/* apps/web/app/globals.css */
@import "tailwindcss";
@import "../../../packages/design-tokens/css/tokens.css";
@import "../../../packages/design-tokens/css/theme.css";
```

Utilitas yang dihasilkan memakai token (tanpa hex di komponen): `bg-canvas`, `text-fg-muted`,
`border-border-strong`, `bg-brand`, `text-brand-fg`, `ring-focus`, `rounded-md`, `shadow-md`,
`ease-standard`, `duration-fast`, `animate-pulse`, `p-6`/`gap-4` (turun dari `--spacing`), dsb.

## Budget ukuran CSS

Batas di `budget.json`; alasan + selisih nyata di `docs/ux/token-pipeline.md` §6.

| Kelompok | Batas (raw) | Terukur (2026-11-25) |
|---|---|---|
| token CSS (`css/*.css`) | 12 KiB (12288 B) | 10619 B (10.4 KiB; gzip 3.0 KiB) |
| app CSS (`apps/web/.next/static/**/*.css`) | 40 KiB (40960 B) | 10322 B (10.1 KiB; gzip 3.1 KiB) |

## Aturan yang ditegakkan

- Lint hardcode (AC-39.1) lewat `scripts/check-no-hardcode.mjs`: dilarang hex, utilitas primitif
  Tailwind (`bg-gray-500`), dan nilai arbitrer berwarna/besar (`bg-[#...]`, `text-[13px]`) di
  `apps/**` dan `packages/ui/**`. Pelarian per baris: `tg-token-lint:allow`.
- Parity dokumen↔token lewat `scripts/check-doc-parity.mjs`: `docs/ux/design-tokens.md`
  §1.1–§1.3 + §2–§6 harus identik dengan `tokens.json` (dokumen = spesifikasi, JSON = sumber
  machine-readable; §1.4 rasio kontras punya gerbang sendiri `docs/ux/contrast-check.mjs`).
