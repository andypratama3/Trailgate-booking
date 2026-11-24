// Memverifikasi tabel §1.4 `docs/ux/design-tokens.md` terhadap ramp primitif §1.1.
// Tanpa dependensi. Jalankan: `node docs/ux/contrast-check.mjs` (exit 1 bila ada selisih).
import fs from 'node:fs';

const doc = fs.readFileSync(new URL('./design-tokens.md', import.meta.url), 'utf8');

const STEPS = [50, 100, 200, 300, 400, 450, 500, 600, 700, 800, 900, 950];
const hex = {};
for (const line of doc.split('\n')) {
  const family = line.match(/^\| `--tg-([a-z]+)-\*`/);
  if (family) {
    line.split('|').slice(2, 2 + STEPS.length)
      .map((c) => c.trim().replace(/`/g, ''))
      .forEach((c, i) => { if (/^#[0-9A-Fa-f]{6}$/.test(c)) hex[`${family[1]}-${STEPS[i]}`] = c; });
  }
  const single = line.match(/`--tg-white` = `(#[0-9A-Fa-f]{6})`/);
  if (single) hex.white = single[1];
}

const chan = (c) => { c /= 255; return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
const lum = (h) => { const n = parseInt(h.slice(1), 16); return 0.2126 * chan((n >> 16) & 255) + 0.7152 * chan((n >> 8) & 255) + 0.0722 * chan(n & 255); };
const ratio = (a, b) => { const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x); return (hi + 0.05) / (lo + 0.05); };

let rows = 0, bad = 0, unresolved = 0;
for (const line of doc.split('\n')) {
  const m = line.match(/^\| (terang|gelap) [^|]+ \| `([^`]+)` \/ `([^`]+)` \| ([0-9]+),([0-9]+):1 \|/);
  if (!m) continue;
  rows++;
  if (!hex[m[2]] || !hex[m[3]]) { unresolved++; console.log(`UNRESOLVED ${m[2]}/${m[3]}`); continue; }
  const declared = Number(`${m[4]}.${m[5]}`);
  const actual = ratio(hex[m[2]], hex[m[3]]);
  if (Math.abs(actual - declared) >= 0.01) {
    bad++;
    console.log(`MISMATCH ${m[1]} ${m[2]}/${m[3]}: declared ${declared}, computed ${actual.toFixed(2)}`);
  }
}
console.log(`rows=${rows} mismatches=${bad} unresolved=${unresolved}`);
process.exit(bad + unresolved ? 1 : 0);
