#!/usr/bin/env node
// Build pipeline token TrailGate (T-010).
//   input : tokens.json (sumber tunggal)
//   output: css/tokens.css  — CSS variables: primitif + peran semantik (terang di :root,
//                             gelap di [data-theme="dark"]) dari sumber yang sama
//           css/theme.css   — @theme inline: var runtime -> utilitas Tailwind v4 (+ @utility durasi)
// Deterministik: urutan mengikuti urutan kunci tokens.json; tanpa timestamp/acak.
//   pnpm -C packages/design-tokens build            (tulis css/)
//   pnpm -C packages/design-tokens build --check    (regenerasi di memori, gagal bila css/ tidak identik)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const src = JSON.parse(fs.readFileSync(path.join(here, 'tokens.json'), 'utf8'));

const HEADER = [
  '/*',
  ' * GENERATED — JANGAN edit manual. Sumber: packages/design-tokens/tokens.json.',
  ' * Build: pnpm -C packages/design-tokens build',
  ' */',
  '',
];

const value = (v) => (v.ref !== undefined ? `var(--tg-${v.ref})` : v.raw);

function tokensCss() {
  const p = src.primitive;
  const lines = [...HEADER, ':root {'];

  lines.push('  /* --- primitif: warna rampa & tunggal (dari docs/ux/design-tokens.md §1.1) --- */');
  for (const [family, steps] of Object.entries(p.color)) {
    if (typeof steps === 'string') {
      lines.push(`  --tg-${family}: ${steps};`);
      continue;
    }
    for (const [step, hex] of Object.entries(steps)) lines.push(`  --tg-${family}-${step}: ${hex};`);
  }

  lines.push('', '  /* --- primitif: tipografi (§2) --- */');
  for (const [name, stack] of Object.entries(p.font)) lines.push(`  --tg-font-${name}: ${stack};`);
  for (const [step, t] of Object.entries(p.text)) {
    lines.push(`  --tg-text-${step}: ${t.size};`);
    lines.push(`  --tg-text-${step}-lh: ${t.lineHeight};`);
  }
  for (const [name, w] of Object.entries(p.weight)) lines.push(`  --tg-weight-${name}: ${w};`);
  for (const [name, lh] of Object.entries(p.leading)) lines.push(`  --tg-leading-${name}: ${lh};`);

  lines.push('', '  /* --- primitif: spasi (§3), radius (§4), bayangan (§5), motion (§6) --- */');
  for (const [name, v] of Object.entries(p.space)) {
    lines.push(name === 'base' ? `  --tg-space: ${v};` : `  --tg-space-${name}: ${v};`);
  }
  for (const [name, v] of Object.entries(p.radius)) lines.push(`  --tg-radius-${name}: ${v};`);
  for (const [name, v] of Object.entries(p.shadow)) lines.push(`  --tg-shadow-${name}: ${v};`);
  for (const [name, v] of Object.entries(p.duration)) lines.push(`  --tg-duration-${name}: ${v};`);
  for (const [name, v] of Object.entries(p.ease)) lines.push(`  --tg-ease-${name}: ${v};`);
  for (const [name, v] of Object.entries(p.animate)) lines.push(`  --tg-animate-${name}: ${v};`);

  lines.push('', '  /* --- peran semantik: TEMA TERANG (default) — dirujuk komponen --- */');
  for (const [role, themes] of Object.entries(src.semantic)) {
    lines.push(`  --tg-${role}: ${value(themes.light)};`);
  }
  lines.push('}', '', '[data-theme="dark"] {');
  lines.push('  /* --- peran semantik: TEMA GELAP (nama peran identik, nilai dari ramp yang sama) --- */');
  for (const [role, themes] of Object.entries(src.semantic)) {
    lines.push(`  --tg-${role}: ${value(themes.dark)};`);
  }
  lines.push('}', '');
  return lines.join('\n');
}

function themeCss() {
  const t = src.theme;
  const lines = [...HEADER, '@theme inline {'];

  lines.push('  /* warna peran -> bg-*, text-*, border-*, ring-*, ... (fallback = primitif tema terang) */');
  for (const [role, themes] of Object.entries(src.semantic)) {
    // Peran bernilai mentah (mis. overlay: rgb() + alpha) bukan turunan primitif dan bukan bagian
    // yang boleh di-override tenant, jadi tidak diberi fallback (docs/ux/design-tokens.md §0).
    lines.push(
      themes.light.ref !== undefined
        ? `  --color-${role}: var(--tg-${role}, var(--tg-${themes.light.ref}));`
        : `  --color-${role}: var(--tg-${role});`,
    );
  }

  lines.push('', '  /* tipografi (§2) */');
  for (const name of t.font) lines.push(`  --font-${name}: var(--tg-font-${name});`);
  for (const [primitive, utility] of Object.entries(t.weight)) {
    lines.push(`  --font-weight-${utility}: var(--tg-weight-${primitive});`);
  }
  for (const name of t.leading) lines.push(`  --leading-${name}: var(--tg-leading-${name});`);
  for (const step of t.text) {
    lines.push(`  --text-${step}: var(--tg-text-${step});`);
    lines.push(`  --text-${step}--line-height: var(--tg-text-${step}-lh);`);
  }

  lines.push('', '  /* spasi (§3), radius (§4), bayangan (§5), motion (§6) */');
  lines.push(`  --spacing: var(--tg-space);`);
  for (const name of t.radius) lines.push(`  --radius-${name}: var(--tg-radius-${name});`);
  for (const name of t.shadow) lines.push(`  --shadow-${name}: var(--tg-shadow-${name});`);
  for (const name of t.ease) lines.push(`  --ease-${name}: var(--tg-ease-${name});`);
  for (const name of t.animate) lines.push(`  --animate-${name}: var(--tg-animate-${name});`);
  lines.push(`  --default-transition-duration: var(--tg-duration-${t.defaultTransitionDuration});`);
  lines.push('}', '');

  lines.push(
    '/* Tailwind v4 tidak punya namespace --duration-*: durasi khusus lewat @utility resmi',
    '   (docs/ux/design-tokens.md §0 butir 3). */',
    '@utility duration-fast { transition-duration: var(--tg-duration-fast); }',
    '@utility duration-slow { transition-duration: var(--tg-duration-slow); }',
    '',
  );
  lines.push(
    '/* Tailwind v4 membuang @keyframes default ketika --animate-* dioverride lewat @theme inline;',
    '   keyframes yang dirujuk token motion §6 dideklarasikan eksplisit di sini (~60 B, selalu ikut',
    '   bundle — diterima; budget CSS §6 punya headroom ~1,7 KiB). */',
    '@keyframes pulse {',
    '  50% { opacity: 0.5; }',
    '}',
    '',
  );
  return lines.join('\n');
}

// Validasi struktur: setiap `ref` pada `semantic.<role>.<tema>` harus menunjuk primitif yang ada.
// Tanpa gerbang ini, salah ketik menulis `var(--tg-gray-501)` yang menggantung tanpa gagal.
function validateRefs() {
  const names = new Set();
  for (const [family, steps] of Object.entries(src.primitive.color)) {
    if (typeof steps === 'string') names.add(family);
    else for (const step of Object.keys(steps)) names.add(`${family}-${step}`);
  }
  for (const name of Object.keys(src.primitive.font)) names.add(name);
  for (const step of Object.keys(src.primitive.text)) {
    names.add(`text-${step}`);
    names.add(`text-${step}-lh`);
  }
  for (const name of Object.keys(src.primitive.weight)) names.add(`weight-${name}`);
  for (const name of Object.keys(src.primitive.leading)) names.add(`leading-${name}`);
  for (const name of Object.keys(src.primitive.space)) names.add(name === 'base' ? 'space' : `space-${name}`);
  for (const name of Object.keys(src.primitive.radius)) names.add(`radius-${name}`);
  for (const name of Object.keys(src.primitive.shadow)) names.add(`shadow-${name}`);
  for (const name of Object.keys(src.primitive.duration)) names.add(`duration-${name}`);
  for (const name of Object.keys(src.primitive.ease)) names.add(`ease-${name}`);
  for (const name of Object.keys(src.primitive.animate)) names.add(`animate-${name}`);

  const bad = [];
  for (const [role, themes] of Object.entries(src.semantic)) {
    for (const theme of ['light', 'dark']) {
      const v = themes[theme];
      if (!v || (v.ref === undefined) === (v.raw === undefined)) {
        bad.push(`${role}.${theme}: bentuk tidak sah ${JSON.stringify(v)}`);
      } else if (v.ref !== undefined && !names.has(v.ref)) {
        bad.push(`${role}.${theme} → --tg-${v.ref} tidak ada di primitive`);
      }
    }
  }
  if (bad.length) {
    for (const b of bad) console.error(`ref tidak valid: ${b}`);
    console.error(`build GAGAL: ${bad.length} ref menunjuk primitif yang tidak ada`);
    process.exit(1);
  }
}

validateRefs();
const outputs = { 'css/tokens.css': tokensCss(), 'css/theme.css': themeCss() };
const check = process.argv.includes('--check');
let drift = 0;

for (const [rel, content] of Object.entries(outputs)) {
  const abs = path.join(here, rel);
  if (check) {
    const current = fs.existsSync(abs) ? fs.readFileSync(abs, 'utf8') : null;
    if (current !== content) {
      drift++;
      console.error(`DRIFT: ${rel}${current === null ? ' (hilang)' : ''} — jalankan build ulang`);
    }
    continue;
  }
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  fs.writeFileSync(abs, content);
  console.log(`build: ${rel} (${Buffer.byteLength(content)} B)`);
}

if (check) {
  console.log(
    drift
      ? `check GAGAL: ${drift} file berbeda dari hasil build`
      : 'check OK: css/ di disk identik dengan hasil build tokens.json',
  );
  process.exit(drift ? 1 : 0);
}
