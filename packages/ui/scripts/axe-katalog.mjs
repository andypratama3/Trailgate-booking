#!/usr/bin/env node
// Audit axe terhadap katalog komponen (apps/web/app/(internal)/katalog/**).
//
// Daftar halaman diturunkan dari direktori katalog (bukan daftar hardcode), sehingga
// halaman baru otomatis ikut teraudit dan halaman yang hilang tidak pernah "lulus palsu".
//
// Ketergantungan: @axe-core/playwright + @playwright/test (gate T-015, dev-only, root).
// Skrip ini TIDAK menginstall apa pun (AGENTS.md #10). Browser dipilih berurutan:
//   1. --executable <path> / env AXE_CHROMIUM_PATH (eksplisit, untuk browser sistem)
//   2. browser bawaan Playwright (chromium.executablePath()), bila sudah diunduh
//   3. kandidat browser sistem (google-chrome/chromium), diuji dengan percobaan launch
// Bila tidak ada yang bisa diluncurkan → exit 2 dengan status GATE_PENDING_BROWSER.
//
// Pemakaian:
//   node axe-katalog.mjs [--base URL] [--axe <module-spec>] [--executable <path>]
//
// Exit: 0 lulus, 1 ada pelanggaran serious/critical atau halaman gagal dimuat,
//       2 prasyarat gate belum siap, 3 direktori katalog tidak ditemukan.
import process from "node:process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const args = process.argv.slice(2);
const opt = (name, fallback) => {
  const i = args.indexOf(name);
  return i === -1 ? fallback : args[i + 1];
};

const BASE = opt("--base", "http://localhost:3000");
const AXE_SPEC = opt("--axe", "@axe-core/playwright");
const EXPLICIT_BROWSER = opt("--executable", process.env.AXE_CHROMIUM_PATH ?? "");

// Kandidat browser sistem (host tanpa unduhan Playwright). Diuji dengan launch nyata.
const SYSTEM_BROWSERS = [
  "/opt/google/chrome/google-chrome",
  "/usr/bin/google-chrome-stable",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
  "/usr/bin/chromium-browser",
];

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
const katalogDir = path.join(repoRoot, "apps/web/app/(internal)/katalog");

if (!fs.existsSync(katalogDir)) {
  console.error(`axe-katalog GAGAL: direktori katalog tidak ada: ${katalogDir}`);
  process.exit(3);
}

// Rute = /katalog + setiap subdirektori (kecuali privat `_`) yang berisi page.tsx.
const routes = [
  "/katalog",
  ...fs
    .readdirSync(katalogDir, { withFileTypes: true })
    .filter(
      (entry) =>
        entry.isDirectory() &&
        !entry.name.startsWith("_") &&
        fs.existsSync(path.join(katalogDir, entry.name, "page.tsx")),
    )
    .map((entry) => `/katalog/${entry.name}`)
    .sort(),
].map((route) => BASE + route);

console.log(
  `Rute katalog (${routes.length}): ${routes.map((route) => new URL(route).pathname).join(", ")}`,
);

const instructions = [
  "",
  "Prasyarat gate belum siap — jangan install/pasang sendiri (AGENTS.md #10).",
  "",
  "Status: T-015 APPROVED @axe-core/playwright@4.14.1 (dev-only) + axe-core@4.14.1.",
  "Urutan: install bersama Playwright dari T-008 (termasuk browser chromium).",
  "",
  "Setelah siap:",
  `  1. pnpm -C apps/web start   (atau dev; base ${BASE})`,
  "  2. pnpm exec playwright install chromium   (pemilik gate/T-008)",
  "  3. node packages/ui/scripts/axe-katalog.mjs",
  "     (alternatif tanpa unduhan: --executable /path/ke/chrome)",
  "  4. Skrip membuka tiap rute katalog, menjalankan axe.run, dan exit 1",
  "     bila ada pelanggaran impact serious/critical.",
].join("\n");

async function loadFirst(specs) {
  for (const spec of specs) {
    try {
      return { mod: await import(spec), spec };
    } catch {
      // coba berikutnya
    }
  }
  return null;
}

const axe = await loadFirst([AXE_SPEC, "@axe-core/playwright", "axe-core"]);
if (!axe) {
  console.log("GATE_PENDING_AXE");
  console.log(instructions);
  process.exit(2);
}

const playwright = await loadFirst(["playwright", "@playwright/test"]);
if (!playwright?.mod.chromium) {
  console.log("GATE_PENDING_PLAYWRIGHT");
  console.log(instructions);
  process.exit(2);
}

const { AxeBuilder } = axe.mod;
const { chromium } = playwright.mod;

if (!AxeBuilder) {
  console.log("GATE_PENDING_AXE_API");
  console.log("Module axe terimport tapi tanpa AxeBuilder — versi tidak didukung skrip ini.");
  console.log(instructions);
  process.exit(2);
}

// Kandidat browser: eksplisit → bawaan Playwright → browser sistem.
const candidates = [];
if (EXPLICIT_BROWSER) candidates.push(EXPLICIT_BROWSER);
try {
  const bundled = chromium.executablePath();
  if (bundled) candidates.push(bundled);
} catch {
  // tidak ada browser bawaan
}
candidates.push(...SYSTEM_BROWSERS);

const tried = [];
let browserPath = null;
let lastLaunchError = null;
for (const candidate of candidates) {
  if (tried.includes(candidate)) continue;
  tried.push(candidate);
  if (!candidate || !fs.existsSync(candidate)) continue;
  const probe = await chromium.launch({ executablePath: candidate, chromiumSandbox: false });
  try {
    await probe.close();
    browserPath = candidate;
    break;
  } catch (err) {
    lastLaunchError = err;
    await probe.close().catch(() => {});
  }
}

if (!browserPath) {
  console.log("GATE_PENDING_BROWSER");
  console.log("Tidak ada browser yang bisa diluncurkan.");
  console.log(`Kandidat dicoba: ${tried.join(", ") || "(tidak ada)"}`);
  if (lastLaunchError) console.log(`Error terakhir: ${String(lastLaunchError).split("\n")[0]}`);
  console.log(instructions);
  process.exit(2);
}

console.log(`Browser: ${browserPath}`);

let failedPages = 0;
let totalSerious = 0;
let totalAll = 0;

for (const url of routes) {
  const browser = await chromium.launch({ executablePath: browserPath, chromiumSandbox: false });
  try {
    // @axe-core/playwright 4.14.1 menolak page dari browser.newPage() — wajib context eksplisit.
    const context = await browser.newContext();
    const page = await context.newPage();
    let status = 0;
    try {
      const response = await page.goto(url, { waitUntil: "networkidle" });
      status = response?.status() ?? 0;
    } catch (err) {
      failedPages++;
      console.error(`\n[LOAD FAIL] ${url}: ${String(err).split("\n")[0]}`);
      continue;
    }
    if (status >= 400 || status === 0) {
      failedPages++;
      console.error(`\n[LOAD FAIL] ${url}: HTTP ${status || "(tanpa respons)"}`);
      continue;
    }

    const results = await new AxeBuilder({ page }).analyze();
    const serious = (results.violations ?? []).filter(
      (v) => v.impact === "serious" || v.impact === "critical",
    );
    totalSerious += serious.length;
    totalAll += results.violations?.length ?? 0;

    if (serious.length > 0) {
      failedPages++;
      console.error(`\n[AXE FAIL] ${url}: ${serious.length} serious/critical`);
      for (const v of serious) {
        console.error(`  - ${v.id} (${v.impact}): ${v.help}`);
        for (const node of (v.nodes ?? []).slice(0, 3)) {
          console.error(`      ${node.any?.[0]?.message ?? node.html}`);
        }
      }
    } else {
      console.log(`[AXE OK]   ${url} (${results.violations?.length ?? 0} violations total)`);
    }
  } finally {
    await browser.close();
  }
}

console.log(
  `axe-katalog: ${routes.length} halaman, ${totalAll} violations, ` +
    `${totalSerious} serious/critical, ${failedPages} halaman gagal`,
);

if (failedPages > 0) {
  console.error(`axe-katalog GAGAL: ${failedPages} halaman bermasalah`);
  process.exit(1);
}

console.log("axe-katalog OK — semua halaman katalog tanpa pelanggaran serious/critical");
