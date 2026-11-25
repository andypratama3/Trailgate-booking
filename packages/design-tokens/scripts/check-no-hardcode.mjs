#!/usr/bin/env node
// Lint AC-39.1: tidak ada warna/ukuran hardcode di komponen (apps/**, packages/ui/**).
// Komponen hanya memakai peran semantik (`bg-canvas`, `text-fg-muted`, `rounded-md`, `p-4`, ...);
// nilai mentah (hex, px) hidup di tokens.json / docs/ux/design-tokens.md §1-§6 saja.
//   node scripts/check-no-hardcode.mjs [dir ...]   (default: apps/web/app apps/pos/app packages/ui)
// Pelarian: komentar `tg-token-lint:allow` pada baris yang sama (dilaporkan, tidak menggagalkan).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const repo = path.resolve(here, '../../..');
const roots = process.argv.slice(2).length
  ? process.argv.slice(2)
  : ['apps/web/app', 'apps/pos/app', 'packages/ui'];
const EXT = /\.(tsx|jsx|ts|js|css|vue|html)$/;
const SKIP = /(^|\/)(node_modules|\.next|dist|build|coverage)(\/|$)/;

const RULES = [
  ['hex', /#[0-9a-fA-F]{6}(?![0-9a-zA-Z])|#[0-9a-fA-F]{3}(?![0-9a-zA-Z])/],
  [
    'utilitas primitif Tailwind',
    /\b(?:bg|text|border|ring|outline|divide|decoration|fill|stroke|from|via|to|accent|caret|placeholder|shadow)-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|white|black)(?:-\d{2,3})?\b/,
  ],
  [
    'nilai arbitrer berwarna/besar',
    /\b(?:bg|text|border|ring|shadow|fill|stroke)-\[[^\]]*(?:#[0-9a-fA-F]{3,8}|\d+(?:\.\d+)?(?:px|rem))[^\]]*\]/,
  ],
];

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const abs = path.join(dir, entry.name);
    if (entry.isDirectory()) { if (!SKIP.test(abs)) walk(abs, out); }
    else if (EXT.test(entry.name)) out.push(abs);
  }
  return out;
}

let hits = 0;
let skips = 0;
for (const root of roots) {
  const abs = path.join(repo, root);
  if (!fs.existsSync(abs)) { console.log(`lewati ${root} (tidak ada)`); continue; }
  for (const file of walk(abs).sort()) {
    fs.readFileSync(file, 'utf8').split('\n').forEach((line, i) => {
      if (line.includes('tg-token-lint:allow')) {
        skips++;
        console.log(`dilewati (allow): ${path.relative(repo, file)}:${i + 1}`);
        return;
      }
      for (const [rule, re] of RULES) {
        const m = line.match(re);
        if (m) {
          hits++;
          console.error(`${path.relative(repo, file)}:${i + 1} [${rule}] ${m[0]}`);
        }
      }
    });
  }
}

if (hits) { console.error(`check-no-hardcode GAGAL: ${hits} hardcode`); process.exit(1); }
console.log(
  `check-no-hardcode OK (${roots.length} akar: ${roots.join(', ')})${skips ? ` — ${skips} baris dilewati (allow)` : ''}`,
);
