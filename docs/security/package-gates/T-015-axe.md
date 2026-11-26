# T-015 — Gate paket: tooling aksesibilitas axe untuk T-011 (katalog komponen)

| | |
|---|---|
| Paket ter-pin | `@axe-core/playwright@4.14.1` (+ `axe-core@4.14.1`, sudah ada di lockfile) |
| Verdict | **approve** (dev-only) |
| Risk level | **low** |
| Pemilik gate | tg-security |
| Kartu | `docs/board/tasks/T-015.yml` |
| Seat pemakai | `tg-ux` (T-011), `tg-qa` (e2e) |
| Tanggal review | 2026-11-25 |

## 1. Ringkasan

T-011 acceptance butuh laporan "axe tanpa pelanggaran serius pada katalog" komponen internal
(`apps/web/app/(internal)/katalog/**`). Untuk menjalankan axe terhadap halaman yang dirender
dibutuhkan (a) driver browser dan (b) engine axe. Keluarga paket yang dinilai:

| Paket | Versi | Publisher | License | Kesimpulan |
|---|---|---|---|---|
| `@axe-core/playwright` | 4.14.1 | Deque Labs (`dequelabs`) | MPL-2.0 | **APPROVE** — wrapper Playwright, 48 KB, dev-only |
| `axe-core` | 4.14.1 | Deque Labs | MPL-2.0 | sudah ada di `pnpm-lock.yaml`; dipakai transitif oleh `@axe-core/playwright` |
| `jest-axe` | 11.0.0 | Nick Colley | MIT | **reject** — pin `axe-core@4.12.1` (versi LAMA → duplikat di lockfile) dan butuh Jest (repo tidak memakai Jest) |
| `vitest-axe` | 0.1.0 | chaance | MIT | **reject** — butuh Vitest (tidak dipakai), versi 0.1.0, jeda maintenance |

## 2. Pemeriksaan supply chain

### 2.1 Metadata registry (npm), diambil read-only via `registry.npmjs.org`

**`@axe-core/playwright@4.14.1`**
- license `MPL-2.0`; repo `github.com/dequelabs/axe-core-npm`; `engines.node >= 22.12.0`
- `dependencies`: `axe-core@~4.14.1` → **tidak menambah versi baru** (4.14.1 sudah di lockfile)
- `peerDependencies`: `playwright-core >= 1.0.0` (diisi oleh `@playwright/test` dari T-008)
- `unpackedSize` 48.901 byte (~48 KB)
- scripts: `test, build, prepare, test:ts, ...` — **tanpa `preinstall`/`install`/`postinstall`**.
  `prepare` hanya dijalankan npm/pnpm untuk dependensi git/lokal, BUKAN untuk dependensi registry
  → tidak ada eksekusi saat install. **Tidak ada telemetri.**

**`axe-core@4.14.1`** (sudah ter-resolve; lihat §3)
- license `MPL-2.0`; repo `github.com/dequelabs/axe-core`; `engines.node >= 4`
- tarball published `unpackedSize` 3.437.349 byte (~3,4 MB, isi `axe.js` + `axe.min.js` + `locales/`)
- scripts: hanya `build/test/fmt/*` — **tanpa `preinstall`/`install`/`postinstall`**; tanpa telemetri.

### 2.2 Transitive & bundle

- `@axe-core/playwright` → `axe-core@~4.14.1` → **tidak ada dependency** (lock entry `axe-core@4.14.1: {}`).
  Grafik transisi terbatas 1 lapis; tidak ada paket biner, tidak ada script install.
- Keduanya **dev-only**: dipakai oleh tes/e2e (`tests/e2e`, owner tg-qa) dan skrip lint a11y.
  Tidak boleh dideklarasikan di `dependencies` paket mana pun → tidak ikut `next build` client
  bundle maupun image produksi.
- Stack Playwright (`playwright@1.65.1`, `playwright-core@1.65.1`, `@playwright/test@1.65.1`):
  registry metadata **tanpa `install`/`postinstall`** → Chromium TIDAK diunduh otomatis saat
  `pnpm install`; unduhan hanya lewat `pnpm exec playwright install` eksplisit (CI `e2e` job sudah
  menjalankannya). Bukti saat gate: `~/.cache/ms-playwright` belum ada.

## 3. Status lockfile saat gate

- `axe-core@4.14.1` **sudah ada** di `pnpm-lock.yaml` (transitif via `eslint-config-next@16.4.6`
  → `eslint-plugin-jsx-a11y@6.10.2` → `axe-core@4.14.1`, lock entry resolusi
  `sha512-FHfa+lmNjQZfJz1q8wKqIDwC6DExcHt/pkjNQb09a3NPjCKg2rhu5qb2S4r76ASyFNNtuFooJpZe37OgudVGtQ==`).
  Menambah `@axe-core/playwright@4.14.1` **tidak** menduplikasi axe-core.
- `playwright` / `@playwright/test` **belum ada** di lockfile saat keputusan dibuat; satunya jejak
  waktu itu `peerDependenciesMeta.@playwright/test.optional: true` pada `next@16.4.6`. CI `e2e` job
  (`.github/workflows/ci.yml`, tg-devops/T-008) sudah memanggil `pnpm exec playwright install chromium
  --with-deps` dan `pnpm exec playwright test --config=tests/e2e/playwright.config.ts`.
- **Update 2026-11-25 (setelah T-008/T-011):** root `devDependencies` memuat
  `@axe-core/playwright: 4.14.1` + `@playwright/test: ^1.51.1` (resolved `1.65.1`), dan lockfile
  memuat `@axe-core/playwright@4.14.1`, `@playwright/test@1.65.1`, `playwright@1.65.1`,
  `playwright-core@1.65.1`. `axe-core@4.14.1` tetap **satu salinan** di store
  (`node_modules/.pnpm/axe-core@4.14.1`). Prasyarat urutan (§4) terpenuhi.

## 4. Rekomendasi urutan (jawaban eksplisit kartu)

**Install `@axe-core/playwright` BERSAMA Playwright dari T-008, bukan lebih dulu.**

Alasan:
1. `@axe-core/playwright` butuh `playwright-core` sebagai peer; tanpa Playwright harus menarik
   browser Chromium (~150 MB) terpisah hanya untuk T-011 — duplikat usaha dan unduhan.
2. T-011 `depends_on: [T-010]`, bukan T-008, sehingga ada window di mana T-011 selesai sebelum
   Playwright ada. Dalam window itu, jalur axe yang executable hanya (a) `axe-core` + jsdom — tidak
   lengkap (rule layout/`color-contrast` no-op tanpa browser nyata) atau (b) DevTools manual — lemah
   dan tidak reproducible. Keduanya **tidak cukup** untuk acceptance "axe tanpa pelanggaran serius".
3. Sebaliknya bila laporan axe T-011 ditunda sampai Playwright sudah di lockfile, biaya tambahan
   hanya 48 KB wrapper + import `AxeBuilder` di satu spec — paling murah.

Konsekuensi: AC T-011 "axe tanpa pelanggaran serius pada katalog" diverifikasi setelah lockfile memuat
`@playwright/test` (T-008). Bila T-008 meleset lebih lama dari T-011, pilihannya: (a) naikkan prioritas
T-008 bila a11y jadi kritis, atau (b) nego ulang AC — **bukan** diakali dengan jsdom/manual
untuk memenuhi acceptance.

## 5. Kondisi operasional (wajib)

1. **dev-dependency saja** — dideklarasikan di root `package.json` (owner `tg-devops`, tempat CI
   menjalankan `pnpm exec playwright`) atau di `tests/e2e/package.json` bila tg-qa membuatnya.
   DILARANG di `dependencies` paket mana pun; DILARANG masuk image produksi.
2. **Pin eksak**: `"@axe-core/playwright": "4.14.1"` (tidak memakai `^`/`~`). `axe-core` dibiarkan
   resolusi lockfile (4.14.1) — jangan pin manual versi lain agar tidak duplikat.
   `@playwright/test` juga **pin eksak** (`1.65.1`, bukan `^1.51.1`): konvensi workspace memakai pin
   eksak, dan paket ini yang mengunduh binary browser — variasi versi minor bisa mengubah hash
   binary. Perubahan specifier = milik `tg-devops`/T-008 (root `package.json`).
3. **Verifikasi non-bundle** (AC T-015): setelah `next build`, `apps/web/.next/static/**` dan
   `apps/pos/.next/static/**` tidak boleh memuat **signature engine** axe
   (`axe.run`, `function axe`, `axs`, `axe-core@`, `window.axe`) — BUKAN substring `axe` mentah,
   karena halaman katalog internal memuat teks pemberitahuan "packages/ui/scripts/axe-katalog.mjs"
   (substring mentah akan false-positive). Verifikasi pertama 2026-11-25: grep signature = 0 hit.
4. **Urutan install**: `@playwright/test` + `@axe-core/playwright` masuk **bersama** di root
   `devDependencies` (perubahan T-008/T-015); jangan install browser stack terpisah untuk T-011.
5. **Node engine**: `@axe-core/playwright` butuh `>=22.12.0`. Saat gate: workspace root
   `package.json` deklarasikan `>=20.9.0` (owner tg-devops) dan CI memakai `node-version: '22'`.
   Status per 2026-11-25: T-008 sudah menaikkan `engines.node` root menjadi `>= 22.12.0`
   (selaras dengan persyaratan paket; CI node 22 memenuhi). Sisa `packages/*` (`contracts`,
   `design-tokens`) masih `>=20.9.0` — tidak menjalankan axe, tidak memblok; selaraskan bila
   konsisten secara menyeluruh.
6. **Reject** `jest-axe` dan `vitest-axe` (tidak cocok stack; duplikat/versi lama). Bila kelak
   repositori memakai Vitest untuk komponen, gate ulang pilihan `vitest-axe` — saat ini YAGNI.
7. **Re-gate** bila versi/publisher berubah atau ada advisory supply-chain pada `axe-core` /
   `@axe-core/playwright`. `npm audit` di CI (AC T-008) sudah mencakup keduanya.
8. `@axe-core/playwright` tidak mengekspos telemetri; tidak boleh ada konfigurasi yang mengirim
   data keluar. Standar default aman.

## 6. Repro (untuk auditor)

```bash
# metadata + dependensi transitif (read-only)
curl -s https://registry.npmjs.org/@axe-core%2Fplaywright | jq '{license,engines,dependencies,peerDependencies,dist:.versions[.dist-tags.latest].dist}'
curl -s https://registry.npmjs.org/axe-core | jq '{license,engines,dependencies,dist:.versions[.dist-tags.latest].dist}'
# axe-core: satu salinan di store (tidak duplikat)
grep -n "axe-core@4.14.1" pnpm-lock.yaml
ls -d node_modules/.pnpm/axe-core@*
# Playwright + axe di root devDependencies (terisi setelah T-008)
grep -n -E "@axe-core/playwright|@playwright/test" pnpm-lock.yaml | head
# signature engine axe di bundle produksi (harus 0 hit)
grep -roE "axe\.run|function axe|axs|axe-core@|window\.axe" apps/web/.next/static apps/pos/.next/static
sed -n "/e2e:/,/tenant-isolation:/p" .github/workflows/ci.yml
```

Catatan: pemeriksaan dijalankan read-only; file repo yang diubah hanya artefak ini.

## 7. Status implementasi (per 2026-11-25)

- **Gate: SELESAI** — approve `@axe-core/playwright@4.14.1` dev-only + `axe-core@4.14.1`.
- **Install: DIPENUHI.** Root `devDependencies` = `@axe-core/playwright: 4.14.1` +
  `@playwright/test: 1.65.1` (pin eksak, diperbaiki T-008); lockfile memuat
  `@axe-core/playwright@4.14.1`, `@playwright/test@1.65.1`, `playwright@1.65.1`,
  `playwright-core@1.65.1`. `axe-core@4.14.1` satu salinan di store (tidak duplikat).
- **Browser chromium: TERPASANG.** `/root/.cache/ms-playwright/chromium-1255/chrome-linux64/chrome`
  hadir (`chromium.executablePath()` → `exists: true`). Diagnostik awal: dir belum ada saat
  pemeriksaan pertama karena unduhan T-008 masih berjalan di background — bukan kegagalan gate.
  Stack Playwright 1.65.1 tanpa `postinstall`, unduhan eksplisit via
  `pnpm exec playwright install chromium` (CI `e2e` job sudah memanggilnya). Runner T-011
  fail-closed terkonfirmasi: `packages/ui/scripts/axe-katalog.mjs` exit 2 (`GATE_PENDING_BROWSER`)
  bila browser belum ada — tidak memberi lulus palsu.
- **Verifikasi end-to-end (2026-11-25, host dev):** server produksi
  `pnpm -C apps/web start` (Next.js 16.4.6, port 3000) + `node packages/ui/scripts/axe-katalog.mjs`
  → **13/13 halaman katalog, 0 violations, 0 serious/critical, 0 halaman gagal, exit 0**
  (rute: /katalog, button, calendar, dialog, input, quota-meter, select, sheet, status-badge,
  stepper, table, tabs, toast). AC T-011 "axe tanpa pelanggaran serius pada katalog" TERPENUHI.
  Catatan: ini laporan pemakaian gate, bukan penetapan lulus formal T-011 (verifikasi AC tetap
  milik verifier/Orchestrator).
- **Verifikasi non-bundle: 0 hit** signature engine (`axe.run`, `function axe`, `axs`, `axe-core@`,
  `window.axe`) pada `apps/web/.next/static` dan `apps/pos/.next/static`. Satu-satunya substring
  "axe" di bundle = teks UI katalog internal ("packages/ui/scripts/axe-katalog.mjs") — bukan engine.
