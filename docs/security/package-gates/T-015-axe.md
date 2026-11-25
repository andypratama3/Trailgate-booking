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

## 3. Status lockfile saat gate

- `axe-core@4.14.1` **sudah ada** di `pnpm-lock.yaml` (transitif via `eslint-config-next@16.4.6`
  → `eslint-plugin-jsx-a11y@6.10.2` → `axe-core@4.14.1`, lock entry resolusi
  `sha512-FHfa+lmNjQZfJz1q8wKqIDwC6DExcHt/pkjNQb09a3NPjCKg2rhu5qb2S4r76ASyFNNtuFooJpZe37OgudVGtQ==`).
  Menambah `@axe-core/playwright@4.14.1` **tidak** menduplikasi axe-core.
- `playwright` / `@playwright/test` **belum ada** di lockfile. Satunya jejak adalah
  `peerDependenciesMeta.@playwright/test.optional: true` pada `next@16.4.6`.
  CI `e2e` job (`.github/workflows/ci.yml`, ditulis tg-devops/T-008) sudah memanggil
  `pnpm exec playwright install chromium --with-deps` dan `pnpm exec playwright test \
  --config=tests/e2e/playwright.config.ts` — Playwright sedang diland di T-008.

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
3. **Verifikasi non-bundle** (AC T-015): setelah `next build`, pastikan `apps/web/.next/static/**`
   dan `apps/pos/.next/static/**` tidak memuat `axe`. Dev-only → tidak akan ada; bila muncul,
   itu regression dan harus gagalkan T-011.
4. **Urutan install**: hanya saat `@playwright/test` sudah ada di lockfile (T-008). Jangan install
   browser stack terpisah untuk T-011.
5. **Node engine**: `@axe-core/playwright` butuh `>=22.12.0`; workspace deklarasikan `>=20.9.0`
   (root `package.json`, owner tg-devops) dan CI memakai `node-version: '22'`. Berfungsi hari ini,
   tapi rentang engines masih longgar → selaraskan (naikkan `engines.node` root, atau catat EBADENGINE
   sebagai trade-off). Temuan P3 / koordinasi tg-devops.
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
# axe-core sudah di lockfile (transitif eslint-config-next -> eslint-plugin-jsx-a11y)
grep -n "axe-core@4.14.1" pnpm-lock.yaml
# Playwright BELUM di lockfile; CI e2e baru placeholder
grep -n "playwright" pnpm-lock.yaml
sed -n "/e2e:/,/tenant-isolation:/p" .github/workflows/ci.yml
```

Catatan: pemeriksaan di atas dijalankan read-only; tidak ada file repo yang diubah selain artefak ini.
Verdict artefak ini: **approve** `@axe-core/playwright@4.14.1` dev-only, dengan urutan install
menunggu Playwright T-008.
