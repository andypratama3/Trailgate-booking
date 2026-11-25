#!/usr/bin/env node
// Verifikasi ulang bukti keputusan N-1 (docs/ux/token-pipeline.md §4) tentang sumber nilai ramp:
// nilai ramp tokens.json = palet sRGB Tailwind v3, BUKAN nilai oklch Tailwind v4 (tailwindcss 4.3.5).
//   node docs/ux/compare-tailwind-v4.mjs   → mencetak perbandingan, exit 1 bila angka menyimpang
//
// Fixture palet v4: docs/ux/tailwind-v4-palette.json (oklch, disalin verbatim dari
// apps/web/node_modules/tailwindcss/theme.css versi 4.3.5 — lihat field source di fixture).
// Regenerasi fixture: jalankan satu baris (dari akar repo) —
//   node -e "const fs=require('fs'),t=fs.readFileSync('apps/web/node_modules/tailwindcss/theme.css','utf8'),f='docs/ux/tailwind-v4-palette.json',d=JSON.parse(fs.readFileSync(f,'utf8'));for(const[g,s]of Object.entries(d.oklch))for(const k of Object.keys(s)){const m=t.match(new RegExp('--color-'+g+'-'+k+':\\\\s*(oklch\\\\([^;]+\\\\))\\\\s*;'));if(m)s[k]=m[1].trim()}d.source.captured=''+new Date().toISOString().slice(0,10);fs.writeFileSync(f,JSON.stringify(d,null,2)+'\\n')"
//
// Konversi oklch → sRGB mengikuti CSS Color 4 (matriks oklab→LMS→linearRGB→sRGB gamma), sama seperti
// implementasi referensi browsers; hasil dikuantisasi ke 8 bit/kanal.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const repo = path.resolve(here, '../..');
const tokens = JSON.parse(fs.readFileSync(path.join(repo, 'packages/design-tokens/tokens.json'), 'utf8'));
const fixture = JSON.parse(fs.readFileSync(path.join(here, 'tailwind-v4-palette.json'), 'utf8'));
const doc = fs.readFileSync(path.join(here, 'design-tokens.md'), 'utf8');

if (fixture.source.package !== 'tailwindcss' || fixture.source.version !== '4.3.5') {
  console.error('fixture bukan tailwindcss 4.3.5 — regenerasi fixture dulu');
  process.exit(1);
}
const v4oklch = fixture.oklch;

const oklchToHex = (str) => {
  const m = str.match(/oklch\(([\d.]+)%\s+([\d.]+)\s+([\d.]+)\)/);
  if (!m) throw new Error(`format oklch tak dikenal: ${str}`);
  const [L, C, h] = [Number(m[1]) / 100, Number(m[2]), Number(m[3])];
  const hr = (h * Math.PI) / 180;
  const a = C * Math.cos(hr);
  const b = C * Math.sin(hr);
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m_ = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s_ = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  const lin = [
    4.0767416621 * l - 3.3077115913 * m_ + 0.2309699292 * s_,
    -1.2684380046 * l + 2.6097574011 * m_ - 0.3413193965 * s_,
    -0.0041960863 * l - 0.7034186147 * m_ + 1.707614701 * s_,
  ];
  const enc = (c) => {
    c = Math.min(1, Math.max(0, c));
    c = c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055;
    return Math.round(c * 255).toString(16).padStart(2, '0').toUpperCase();
  };
  return '#' + lin.map(enc).join('');
};

const FAM = { gray: 'stone' }; // ramp netral kita memakai skala stone
const v4For = (name) => {
  if (name === 'white') return '#FFFFFF';
  const [f, s] = name.split('-');
  const hex = v4oklch[FAM[f] ?? f]?.[s];
  return hex ? oklchToHex(hex) : undefined;
};

const chan = (c) => { c /= 255; return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
const lum = (h) => { const n = parseInt(h.slice(1), 16); return 0.2126 * chan((n >> 16) & 255) + 0.7152 * chan((n >> 8) & 255) + 0.0722 * chan(n & 255); };
const ratio = (x, y) => { const [hi, lo] = [lum(x), lum(y)].sort((p, q) => q - p); return (hi + 0.05) / (lo + 0.05); };

let total = 0, differ = 0, noV4 = 0;
const diffs = [];
for (const [family, steps] of Object.entries(tokens.primitive.color)) {
  if (typeof steps === 'string') continue;
  for (const [step, hex] of Object.entries(steps)) {
    total++;
    const v4h = v4For(`${family}-${step}`);
    if (!v4h) { noV4++; diffs.push(`${family}-${step}: TIDAK ada di theme.css v4`); continue; }
    if (v4h !== hex) { differ++; diffs.push(`${family}-${step}: v3 ${hex} ≠ v4(sRGB) ${v4h}`); }
  }
}

let rows = 0, changed = 0, noBasis = 0;
const hexOf = (name) => { const [f, s] = name.split('-'); return f === 'white' ? '#FFFFFF' : tokens.primitive.color[f][s]; };
for (const line of doc.split('\n')) {
  const m = line.match(/^\| (terang|gelap) [^|]+ \| `([^`]+)` \/ `([^`]+)` \| ([0-9]+),([0-9]+):1 \|/);
  if (!m) continue;
  rows++;
  const [A, B] = [m[2], m[3]];
  const a4 = v4For(A), b4 = v4For(B);
  if (!a4 || !b4) { noBasis++; continue; }
  if (Math.abs(ratio(a4, b4) - ratio(hexOf(A), hexOf(B))) > 0.01) changed++;
}

console.log(`langkah ramp: ${total}; berbeda dari v4: ${differ}; tanpa padanan v4: ${noV4}`);
console.log(`baris kontras §1.4: ${rows}; bergeser >0.01 bila v4 diadopsi: ${changed}; tanpa padanan v4: ${noBasis}`);
for (const d of diffs.slice(0, 8)) console.log('  ', d);

// Angka rekaman §4 (variabel tetap di sini — mengubahnya = mengubah kesimpulan, bukan kode).
const EXPECTED = { differ: 62, noV4: 1, changed: 23, noBasis: 2 };
let bad = 0;
for (const [k, v] of Object.entries(EXPECTED)) {
  const actual = { differ, noV4, changed, noBasis }[k];
  if (actual !== v) { bad++; console.error(`MENYIMPANG: ${k}: terukur ${actual}, direkam ${v}`); }
}
console.log(bad ? `compare-tailwind-v4 GAGAL: ${bad} angka menyimpang dari rekaman §4` : 'compare-tailwind-v4 OK: angka sesuai rekaman docs/ux/token-pipeline.md §4');
process.exit(bad ? 1 : 0);
