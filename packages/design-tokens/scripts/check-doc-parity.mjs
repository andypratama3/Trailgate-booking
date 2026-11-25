#!/usr/bin/env node
// Parity dokumen ↔ token (T-010): docs/ux/design-tokens.md HARUS identik dengan
// packages/design-tokens/tokens.json untuk:
//   §1.1 primitif rampa + tunggal, §1.2 peran terang, §1.3 peran gelap,
//   §2 tipografi, §3 spasi, §4 radius, §5 bayangan, §6 motion.
// §1.4 (rasio kontras) punya gerbang sendiri: docs/ux/contrast-check.mjs; §1.5/§7 prosa normatif.
// Dokumen adalah spesifikasi; tokens.json adalah sumber machine-readable. Dua sumber ini hanya boleh
// berbeda bila keduanya diubah bersama — CI menegakkannya di sini (AC-39.1).
//   node scripts/check-doc-parity.mjs   → exit 1 bila ada selisih
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const repo = path.resolve(here, '../../..');
const doc = fs.readFileSync(path.join(repo, 'docs/ux/design-tokens.md'), 'utf8');
const tokens = JSON.parse(fs.readFileSync(path.join(here, '../tokens.json'), 'utf8'));
const p = tokens.primitive;

const problems = [];
const fail = (msg) => problems.push(msg);
const section = (start, end) => {
  const a = doc.indexOf(start);
  const b = end ? doc.indexOf(end) : doc.length;
  if (a < 0 || b < 0 || b <= a) throw new Error(`section tidak ditemukan: ${start} .. ${end}`);
  return doc.slice(a, b);
};
// Normalisasi nilai: koma desimal → titik, ruang saling merapat, hapus catatan "(...)" yang
// bukan bagian nilai (mis. "(12/16)" setelah line-height di §2) dan tanda kutip backtick.
const norm = (raw) => {
  const stripped = raw.replace(/\([^)]*\)/g, '').replace(/`/g, '').trim();
  return stripped.replace(/,/g, '.').replace(/\s+/g, ' ').trim();
};
const cellValue = (raw) => {
  const bt = raw.match(/`([^`]+)`/);
  return norm(bt ? bt[1] : raw);
};
const collect = (block, re) => {
  const out = {};
  for (const line of block.split('\n')) {
    const m = line.match(re);
    if (m) out[m[1]] = cellValue(m[2]);
  }
  return out;
};
const check = (scope, docMap, jsonMap) => {
  for (const [name, raw] of Object.entries(docMap)) {
    if (!(name in jsonMap)) fail(`${scope} --tg-${name}: ada di dokumen, tidak ada di tokens.json`);
    else if (norm(raw) !== norm(jsonMap[name])) {
      fail(`${scope} --tg-${name}: dokumen "${norm(raw)}" ≠ tokens.json "${jsonMap[name]}"`);
    }
  }
  for (const name of Object.keys(jsonMap)) {
    if (!(name in docMap)) fail(`${scope} --tg-${name}: ada di tokens.json, tidak ada di dokumen`);
  }
};

// --- §1.1 primitif rampa + tunggal ---
const steps = ['50', '100', '200', '300', '400', '450', '500', '600', '700', '800', '900', '950'];
const rampDoc = {}; // family -> { step: hex }
const singleDoc = {};
for (const line of section('### 1.1', '### 1.2').split('\n')) {
  const ramp = line.match(/^\| `--tg-([a-z]+)-\*`/);
  if (ramp) {
    const cells = line.split('|').slice(2, 2 + steps.length).map((c) => c.trim().replace(/`/g, ''));
    rampDoc[ramp[1]] = Object.fromEntries(steps.map((s, i) => [s, /^#[0-9A-Fa-f]{6}$/.test(cells[i]) ? cells[i] : null]));
  }
  for (const m of line.matchAll(/`--tg-([a-z]+)` = `(#[0-9A-Fa-f]{6})`/g)) singleDoc[m[1]] = m[2];
}

for (const [family, stepsJson] of Object.entries(p.color)) {
  if (typeof stepsJson === 'string') {
    if (singleDoc[family] !== stepsJson) fail(`§1.1 --tg-${family}: dokumen ${singleDoc[family] ?? '(tidak ada)'} ≠ tokens.json ${stepsJson}`);
    continue;
  }
  const docSteps = rampDoc[family];
  if (!docSteps) { fail(`§1.1 ramp --tg-${family}-*: tidak ada di dokumen`); continue; }
  for (const [step, hex] of Object.entries(stepsJson)) {
    if (docSteps[step] !== hex) fail(`§1.1 --tg-${family}-${step}: dokumen ${docSteps[step] ?? '(tidak ada)'} ≠ tokens.json ${hex}`);
  }
  for (const [step, hex] of Object.entries(docSteps)) {
    if (hex && !(step in stepsJson)) fail(`§1.1 --tg-${family}-${step}: dokumen ${hex} tetapi tidak ada di tokens.json`);
  }
}
for (const name of Object.keys(singleDoc)) {
  if (!(name in p.color)) fail(`§1.1 --tg-${name}: ada di dokumen, tidak ada di tokens.json`);
}

// --- §1.2 / §1.3 peran semantik ---
const roleNames = /^[a-z][a-z0-9-]*$/;
const parseRoles = (block) => {
  const out = {};
  for (const line of block.split('\n')) {
    if (!line.startsWith('|') || line.includes('---')) continue;
    const cells = line.split('|').map((c) => c.trim());
    if (cells.length < 4 || cells[1].replace(/`/g, '').startsWith('Peran')) continue;
    const roles = [...cells[1].matchAll(/`([^`]+)`/g)].map((m) => m[1]).filter((n) => roleNames.test(n));
    const values = [...cells[2].matchAll(/`([^`]+)`/g)].map((m) => m[1]);
    const numeric = values.filter((v) => /^#[0-9A-Fa-f]{6}$/.test(v) || /^(rgb\(|oklch\(|color-mix\()/.test(v) || /^[a-z]+(-[0-9]{2,3})?$/.test(v));
    const derived = numeric.length ? null : 'derived';
    roles.forEach((role, i) => {
      if (!(role in out)) out[role] = derived ?? numeric[i];
    });
  }
  return out;
};

const light = parseRoles(section('### 1.2', '### 1.4'));
const dark = parseRoles(section('### 1.3', '### 1.4'));
const json = Object.keys(tokens.semantic);

for (const [theme, docMap] of [['light', light], ['dark', dark]]) {
  const name = theme === 'light' ? '§1.2 terang' : '§1.3 gelap';
  for (const role of json) if (!(role in docMap)) fail(`${name}: peran --tg-${role} tidak ada di dokumen`);
  for (const role of Object.keys(docMap)) if (!(role in tokens.semantic)) fail(`${name}: peran --tg-${role} ada di dokumen, tidak ada di tokens.json`);
  for (const role of json) {
    const declared = docMap[role];
    const actual = tokens.semantic[role][theme];
    if (declared === undefined) continue;
    if (declared === 'derived') {
      if (!actual.ref || !['white', 'black'].includes(actual.ref)) {
        fail(`${name} --tg-${role}: dokumen menandai "diturunkan §1.5" (hanya #FFFFFF/#000000) tetapi tokens.json = ${JSON.stringify(actual)}`);
      }
      continue;
    }
    const expected = /^#[0-9A-Fa-f]{6}$/.test(declared) || declared.startsWith('rgb(') ? { raw: declared } : { ref: declared };
    if (JSON.stringify(expected) !== JSON.stringify(actual)) {
      fail(`${name} --tg-${role}: dokumen ${JSON.stringify(expected)} ≠ tokens.json ${JSON.stringify(actual)}`);
    }
  }
}

// --- §2–§6 primitif non-warna ---
const typo = section('## 2. Tipografi', '## 3. Spasi');
const textDoc = {};
for (const line of typo.split('\n')) {
  const m = line.match(/^\| `--tg-text-([a-z0-9]+)` \| ([^|]+) \|/);
  if (!m) continue;
  const sizeAndLh = m[2].split('/');
  const size = cellValue(sizeAndLh[0]);
  const lh = cellValue((sizeAndLh[1] ?? '').split('(')[0]);
  textDoc[m[1]] = size;
  textDoc[`${m[1]}-lh`] = lh;
}
check('§2', textDoc, Object.fromEntries(Object.entries(p.text).flatMap(([s, v]) => [[s, v.size], [`${s}-lh`, v.lineHeight]])));
check('§2', collect(typo, /^\| `--tg-weight-([a-z]+)` \| ([^|]+) \|/), p.weight);
check('§2', collect(typo, /^\| `--tg-leading-([a-z]+)` \| ([^|]+) \|/), p.leading);
for (const name of Object.keys(p.font)) {
  if (!typo.includes(`--tg-font-${name}`)) fail(`§2 --tg-font-${name}: tidak disebut di dokumen (font §2 adalah prosa, bukan tabel)`);
}

const spasi = section('## 3. Spasi', '## 4. Radius');
check('§3', collect(spasi, /^\| `--tg-space-(\d+)` \| ([^|]+) \|/), Object.fromEntries(Object.entries(p.space).filter(([k]) => k !== 'base')));
const baseRow = spasi.match(/`--tg-space: ([^`]+)`/);
if (!baseRow) fail('§3 --tg-space (unit dasar): tidak ada di dokumen');
else check('§3', { base: baseRow[1] }, { base: p.space.base });

check('§4', collect(section('## 4. Radius', '## 5. Bayangan'), /^\| `--tg-radius-([a-z]+)` \| ([^|]+) \|/), p.radius);
check('§5', collect(section('## 5. Bayangan', '## 6. Motion'), /^\| `--tg-shadow-([a-z]+)` \| ([^|]+) \|/), p.shadow);

const motion = section('## 6. Motion', '## 7. Kontrak');
check('§6', collect(motion, /^\| `--tg-duration-([a-z]+)` \| ([^|]+) \|/), p.duration);
check('§6', collect(motion, /^\| `--tg-ease-([a-z]+)` \| ([^|]+) \|/), p.ease);
check('§6', collect(motion, /^\| `--tg-animate-([a-z]+)` \| ([^|]+) \|/), p.animate);

console.log(
  `parity: ${Object.keys(p.color).length} primitif warna, ${json.length} peran × 2 tema, ` +
    `${Object.keys(p.text).length + Object.keys(p.font).length + Object.keys(p.weight).length + Object.keys(p.leading).length + Object.keys(p.space).length + Object.keys(p.radius).length + Object.keys(p.shadow).length + Object.keys(p.duration).length + Object.keys(p.ease).length + Object.keys(p.animate).length} primitif §2–§6`,
);
if (problems.length) {
  for (const pr of problems) console.error(`SELISIH ${pr}`);
  console.error(`check-doc-parity GAGAL: ${problems.length} selisih`);
  process.exit(1);
}
console.log('check-doc-parity OK: docs/ux/design-tokens.md §1.1–§1.3 + §2–§6 identik dengan tokens.json');
