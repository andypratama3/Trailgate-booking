#!/usr/bin/env node
// Budget ukuran CSS (T-010 / AC-39.1). Batas: packages/design-tokens/budget.json.
//   node scripts/css-budget.mjs             — token CSS wajib; app CSS bila hasil build ada
//   node scripts/css-budget.mjs --require-app — app CSS wajib ada (dipakai CI setelah next build)
// Exit 1 bila ada kelompok melewati batas, atau bila --require-app dipakai dan build app absen.
// Laporan gzip hanya informatif (ukuran transfer), bukan kriteria lulus.
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const pkgDir = path.resolve(here, '..');
const repo = path.resolve(pkgDir, '../..');
const limits = JSON.parse(fs.readFileSync(path.join(pkgDir, 'budget.json'), 'utf8')).limitsBytes;
const requireApp = process.argv.includes('--require-app');

function walk(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
    const abs = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(abs, out);
    else if (entry.name.endsWith('.css')) out.push(abs);
  }
  return out;
}

const size = (files) => files.reduce((n, f) => n + fs.statSync(f).size, 0);
const gzip = (files) => files.reduce((n, f) => n + zlib.gzipSync(fs.readFileSync(f)).length, 0);

const groups = [
  {
    key: 'tokensCss',
    label: 'token CSS (css/*.css)',
    files: walk(path.join(pkgDir, 'css')),
  },
  {
    key: 'appCss',
    label: 'app CSS (apps/web/.next/static/**/*.css)',
    files: walk(path.join(repo, 'apps/web/.next/static')),
  },
];

const kiB = (n) => `${(n / 1024).toFixed(1)} KiB`;
let failed = 0;

console.log('Budget ukuran CSS — batas dari budget.json\n');
for (const g of groups) {
  if (g.files.length === 0) {
    const hard = requireApp || g.key === 'tokensCss';
    if (hard) {
      failed++;
      console.error(`GAGAL ${g.label}: tidak ada file (batas ${kiB(limits[g.key])})`);
    } else {
      console.log(`LEWAT ${g.label}: tidak ada (belum ada hasil build; jalankan: pnpm -C apps/web build)`);
    }
    continue;
  }
  const bytes = size(g.files);
  const ok = bytes <= limits[g.key];
  if (!ok) failed++;
  console.log(
    `${ok ? 'OK   ' : 'GAGAL'} ${g.label}\n       ${g.files.length} file | ${kiB(bytes)} (gzip ${kiB(gzip(g.files))}) | batas ${kiB(limits[g.key])} | selisih ${kiB(limits[g.key] - bytes)}`,
  );
  for (const f of g.files) console.log(`       - ${path.relative(repo, f)} ${kiB(fs.statSync(f).size)}`);
}

console.log(failed ? `\n${failed} kelompok melewati batas.` : '\nSemua kelompok dalam batas.');
process.exit(failed ? 1 : 0);
