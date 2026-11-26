# apps/web — Tema tenant (T-012)

Runtime injeksi warna merek tenant: `lib/tenant-theme.mjs` (+ tes `lib/tenant-theme.test.mjs`,
demo `/katalog/tenant-theme`, data contoh `lib/tenant-demo.mjs`).

Aturan warna tenant:

- **Format diterima**: `#RRGGBB`, `#RRGGBBAA` (alpha diabaikan — merek selalu opak),
  `rgb()`, `rgba()`, `hsl()`, `hsla()`. Semua ternormalisasi ke `#RRGGBB` huruf besar.
  Nama warna CSS (`red`, `blue`) **tidak** diterima.
- **Ambang WCAG 2.x AA**: teks `4.5:1` (`AA_TEXT`), non-teks/lapisan `3:1` (`AA_NON_TEXT`),
  diukur terhadap latar platform (`--tg-canvas`, `--tg-surface`) via `resolveColorVar`.
- **Tolak, bukan sesuaikan**: nilai yang gagal AA menghasilkan
  `{ ok: false, status: 422, errors, details: { contrast_ratio, required, pair } }`.
  Tidak ada auto-adjust warna dan tidak ada apa pun yang ditulis ke DOM.
- **`--tg-brand-fg` selalu turunan platform**: tenant boleh mengirim nilai (wajib format
  warna sah), tetapi nilainya **selalu diabaikan** — platform menggantinya dengan
  `#FFFFFF` atau `#000000`, mana pun yang rasio kontrasnya lebih tinggi terhadap brand
  (`deriveBrandFg`). Nilai yang dikirim tenant tidak pernah menjadi keluaran.
- **Mode gelap**: `buildTenantThemeCss(light, dark, { lightBg, darkBg })` menghasilkan CSS ber-scope
  `:root{…}[data-theme="dark"]{…}` — tenant tidak pernah menimpa atribut `data-theme`.
- **Keamanan injeksi**: hanya `document.createElement("style")` + `textContent`
  (`data-tg-tenant-theme`); dilarang `innerHTML` dan inline style pada `<html>`.
  Input tidak lolos allowlist (`;{}<>\`, `url(`, `expression(`, `javascript:`, newline,
  NUL, >64 karakter) → ditolak.

Jalankan tes: `pnpm -C apps/web test` (node --test builtin, tanpa dependensi baru).
Aturan sumber: `docs/ux/design-tokens.md` §1.5 dan §7.
