# ADR-006 — Versi paket ter-pin, gate paket tg-security, level PHPStan, pin image

> **Status:** accepted · **Tanggal:** 2026-11-24 · **Owner:** tg-architect
> **Keputusan inti PRD:** §0 **D7** (stack & pin) · **Rujukan:** PRD §9.2, §13 ("Rantai pasok"), §18.2, `AGENTS.md` aturan 8 & 10, `OWNERS.md`, temuan review tg-security T-001 **F1B-5**, T-008 AC · **FR:** lintas (FR-01 dst. memakai paket ini)
> **Ditetapkan oleh:** T-005 (`docs/board/tasks/T-005.yml`) · **Tugas lanjutan:** T-006 (kontrak), T-008 (CI)

## Konteks

PRD §9.2 menyerahkan penetapan versi kepada agent: "Versi **tidak** saya patok di dokumen ini. Agent
`tg-devops` wajib mengecek Packagist/npm saat scaffold, mem-pin versi, lalu mencatat di ADR." PRD §13
(rantai pasok) menuntut "Pin versi, `composer audit` dan `npm audit` di CI, paket baru butuh persetujuan
Security". `AGENTS.md` aturan 10: "Paket baru: ajukan ke tg-security via task card; jangan install sendiri."
Aturan 8: `pint`, `phpstan`, tes relevan wajib lulus dengan hasil terlampir.

Tiga hal yang harus ditutup ADR ini, sesuai AC T-005:

1. daftar paket + versi ter-pin hasil scaffold (T-001);
2. **level phpstan** yang disepakati — T-001 memakai level 5 sementara (`apps/api/phpstan.neon` memuat
   komentar "Level 5 sementara; konfirmasi level akhir menunggu ADR (T-005 / ADR-006)"); T-008 AC menuntut
   CI memakai level yang disepakati, bukan level lain;
3. digest/tag penuh image Docker (temuan tg-security **F1B-5**).

Verdict gate paket (approve/defer/reject per paket PRD §9.2) **sudah diputuskan tg-security** dan dicatat di
sini agar tidak diulang; ADR ini tidak memutuskan ulang, hanya mengikat hasilnya ke implementasi.

## Keputusan

### 1. Versi ter-pin saat ini (terpasang, terbaca dari lock file — bukan perkiraan)

Verifikasi: `jq -r '.packages[]|.name+"@"+.version' apps/api/composer.lock` (77 paket prod),
`jq -r '.["packages-dev"][]|...'` (38 paket dev), `cat apps/web/package.json apps/pos/package.json`,
`sed -n '1,100p' pnpm-lock.yaml`, `grep -n image: docker-compose.yml`.

**Backend Laravel (`apps/api/composer.lock`)**

| Paket | Versi ter-pin |
|---|---|
| `laravel/framework` | `v12.73.0` |
| `laravel/tinker` | `v2.11.1` |
| `laravel/prompts` | `v0.3.27` |
| `laravel/serializable-closure` | `v2.2.0` |
| `guzzlehttp/guzzle` | `7.17.0` |
| `monolog/monolog` | `3.13.0` |
| `nesbot/carbon` | `3.15.1` |
| `ramsey/uuid` | `4.10.0` |
| `brick/math` | `0.14.8` |
| `symfony/*` | `v7.4.x` (mis. `console`/`http-kernel`/`routing` `v7.4.23`) |
| `nikic/php-parser` | `v5.9.0` |
| `league/flysystem` (+`-local`) | `3.36.0` / `3.35.3` |
| `vlucas/phpdotenv` | `v5.8.1` |
| `larastan/larastan` (dev) | `v3.15.0` |
| `phpstan/phpstan` (dev) | `2.3.7` |
| `phpunit/phpunit` (dev) | `11.5.58` |
| `laravel/pint` (dev) | `v1.32.3` |
| `mockery/mockery` (dev) | `1.6.15` |
| `nunomaduro/collision` (dev) | `v8.9.6` |
| `fakerphp/faker` (dev) | `v1.24.1` |
| `laravel/pail` / `laravel/sail` (dev) | `v1.3.0` / `v1.71.0` |
| platform `php` (lock) | `^8.2` (plugin-api `2.6.0`) |

Dipakai dengan PHP **8.3.6** (`php -r 'echo PHP_VERSION;'`). Lock file adalah sumber kebenaran versi;
`composer.json` tetap memakai constraint caret (`laravel/framework: ^12.0`), jadi **`composer.lock` wajib
di-commit dan dipakai `--no-update`/`install`** — bukan `composer update` di lingkungan bersama.

**Frontend (`apps/web/package.json`, `apps/pos/package.json`, `pnpm-lock.yaml` — identik di kedua app)**

| Paket | Versi ter-pin |
|---|---|
| `next` | `16.4.6` |
| `react` / `react-dom` | `19.3.1` |
| `typescript` | `5.9.3` |
| `tailwindcss` / `@tailwindcss/postcss` | `4.3.5` |
| `@types/node` | `26.6.6` |
| `@types/react` / `@types/react-dom` | `19.3.0` |

Build deps `apps/api` (dari `pnpm-lock.yaml`, importer `apps/api`): `vite 7.3.8`, `axios 1.21.1`,
`concurrently 9.2.5`, `laravel-vite-plugin 2.1.0`, `@tailwindcss/vite 4.3.5`, `tailwindcss 4.3.5`.
Manajer paket: **pnpm 10.33.2** (`package.json` `packageManager`), lock `lockfileVersion: '9.0'`,
`engines.node >=20.9.0` (runtime terpasang Node v22.23.5). Versi Next/React **wajib sama** di `apps/web` dan
`apps/pos` (ADR-004).

**Runtime & tooling**

| Komponen | Pin |
|---|---|
| Image MySQL | `mysql:8.4` (`docker-compose.yml:83`) |
| Image Redis | `redis:7-alpine` (`docker-compose.yml:101`) |
| Image PHP dev | `php:8.3-cli-bookworm` (`docker/api/Dockerfile:3`) |
| Image Node | `node:22-bookworm-slim` (`docker/web/Dockerfile:2`) |
| Composer di image | `composer:2.7.9` (`docker/api/Dockerfile:15`, `COPY --from` tag penuh) |
| Ekstensi Redis | `pecl install redis-6.3.0` (`docker/api/Dockerfile:10`, versi dipin) |
| Composer lokal (bukan bagian build) | `2.7.1` |

### 1a. Dev-dependency `packages/contracts` — amendemen 2026-11-25 (T-006)

Dev-dep kontrak (lint OpenAPI + generator tipe + validator contoh) terpasang di `packages/contracts`
saja (bukan `apps/*`), constraint eksak di `packages/contracts/package.json`, dan tercatat di
`pnpm-lock.yaml` (importer `packages/contracts`). Alasan: kontrak OpenAPI adalah sumber kebenaran
(PRD §11, kartu T-006), sehingga validator/lint, generator tipe TypeScript, dan validator contoh
payload hidup di paket kontrak, bukan di salah satu app. Paket ini pre-approved orchestrator
(T-006, izin tertulis "dev-dep baru di packages/contracts saja sudah di-pre-approve").

Verifikasi: `pnpm -C packages/contracts validate` (0 error, 0 warning), `pnpm -C packages/contracts
test` (18/18), `pnpm -C packages/contracts generate:check` (exit 0), `pnpm -C packages/contracts
typecheck` (exit 0).

| Paket (dev, `packages/contracts`) | Versi ter-pin | Peran |
|---|---|---|
| `@redocly/cli` | `2.83.0` | Validator + lint OpenAPI 3.1 (`pnpm validate`): struktur, `$ref`, contoh media-type. |
| `openapi-typescript` | `7.13.0` | Generator tipe TS deterministik (`pnpm generate`, `generate:check`); output `src/generated/openapi.d.ts` di-commit. |
| `ajv` | `8.20.0` | Validator JSON Schema 2020-12 untuk contoh payload valid/invalid di tes kontrak (`tests/`). |
| `ajv-formats` | `3.0.1` | Format `date-time`/`date`/`uri`/`email`/`uuid` pada validasi contoh. |
| `yaml` | `2.9.1` | Parse `openapi.yaml` untuk tes kontrak. |
| `typescript` | `5.9.3` | `tsc --noEmit` atas tipe ter-generate; sudah terpin ADR-006 untuk `apps/web` & `apps/pos` — dipakai ulang agar tidak ada dua versi TS di monorepo. |

**Catatan pemelihara (temuan operasional T-006):** `@redocly/cli` 2.83.0 menghasilkan
**false-positive** pada rule `no-invalid-schema-examples` terhadap skema yang memakai `if`/`then`
(“must NOT have unevaluated properties …”, “must match 'then' schema”) untuk **semua** contoh di
skema itu, walau contoh valid menurut JSON Schema 2020-12. Karena itu kontrak memakai **diskriminator
`oneOf`** (bukan `if/then`) untuk kendala kondisional (`RouteStatus.source=official_letter`,
`RequirementRule`/`RuleCreateRequest.scope=route`, `BookingLeader.is_foreign`); `oneOf` tervalidasi
benar oleh redocly dan oleh ajv 2020-12 (tes kontrak). Jangan menambahkan skema ber-`if`/`then` ke
kontrak tanpa memverifikasi `pnpm validate` bebas peringatan.

### 2. Level PHPStan: **dikonfirmasi level 5**

- `apps/api/phpstan.neon` memuat `level: 5` dengan `includes: vendor/larastan/larastan/extension.neon`,
  `paths: app, routes` (`apps/api/pint.json` hanya memuat `exclude: bootstrap/cache` untuk file cache hasil generate; preset tetap default).
- Dijalankan nyata: `cd apps/api && vendor/bin/phpstan analyse --no-progress --memory-limit=1G`
  → `[OK] No errors`, exit `0`, wall time 3,24 s.
- **Level 5 adalah level yang disepakati** untuk P0/P1. T-008 harus memasang CI pada level 5; menaikkan
  atau menurunkan level = amendemen ADR ini (bukan setelan lokal).
- Tindak lanjut kecil (pemilik `tg-devops`, path `apps/api/*.neon`): hapus komentar "Level 5 sementara;
  konfirmasi level akhir menunggu ADR (T-005 / ADR-006)" dan ganti dengan rujukan ke ADR ini. Bukan
  perubahan perilaku; hanya menghilangkan tanda "menunggu keputusan".
- Kenaikan level (mis. 6/8) direncanakan setelah P1 stabil dan dicatat sebagai ADR pengganti; `paths`
  wajib diperluas ke `tests` saat itu.

### 3. Pin image Docker: **digest = item TERBUKA** (temuan tg-security F1B-5)

Sudah selesai: `composer:2.7.9` (tag penuh, bukan `composer:2`), `redis-6.3.0` (versi PECL dipin),
`php:8.3-cli-bookworm`/`node:22-bookworm-slim` (tag minor penuh).

Belum selesai (**open**): `mysql:8.4` dan `redis:7-alpine` adalah tag yang bisa bergerak, dan **tidak ada
satu pun image yang dipin digest** (`@sha256:...`). Keputusan: **digest pinning wajib sebelum rilis
produksi dan harus sudah ada di T-008 (CI)** — owner `tg-devops` (`docker/**`, `infra/**`, `docker-compose.yml`),
bukti berupa diff yang menambahkan `@sha256:` pada setiap `FROM`/`image:` beserta perintah pembaruannya.
Sampai itu terjadi, build bersifat "tag-pinned, not digest-pinned" dan risiko supply-chain (retag berbahaya
pada tag bergerak) tetap terbuka — dicatat sebagai utang, bukan dianggap selesai.

### 4. Verdict gate paket tg-security untuk PRD §9.2 (jangan diputuskan ulang)

**Approve (boleh diinstall):** `larastan/larastan`, `laravel/pint`, `phpunit/phpunit`,
`laravel/sanctum`, `spatie/laravel-permission`, `spatie/laravel-activitylog`, `spatie/laravel-data`,
`spatie/laravel-query-builder`, `spatie/laravel-medialibrary`, `spatie/laravel-backup`,
`spatie/laravel-health`, `laravel/horizon`, `midtrans/midtrans-php`, `endroid/qr-code`,
`barryvdh/laravel-dompdf`, `maatwebsite/excel`, `brick/money`; frontend: `next`, `react`, `typescript`,
`tailwindcss`, `shadcn`, `@tanstack/react-query`, `react-hook-form`, `zod`, `next-intl`, `maplibre-gl`,
`react-map-gl`, `dexie`, `@playwright/test`, `vitest`, `@testing-library`, `@axe-core/playwright`.

**Defer (jangan diinstall dulu; tinjau ulang di P2 atau bila ada kebutuhan terukur):**
`spatie/laravel-settings`, `laravel/pulse`, `sentry/sentry-laravel`, `dedoc/scramble`, `stancl/tenancy`,
`@serwist/next`, `recharts`.

**Reject (tidak boleh dipakai):** `spatie/laravel-pdf` — PRD §9.2 "Pilih satu"; yang dipilih
`barryvdh/laravel-dompdf`.

Catatan status nyata: sampai ADR ini ditulis, `apps/api/composer.lock` **hanya** memuat kerangka Laravel +
tooling (`larastan`, `pint`, `phpunit`, dst.). Seluruh paket "approve" di atas yang belum tercantum (sanctum,
spatie/*, horizon, midtrans-php, dompdf, excel, endroid/qr-code, brick/money) **belum terpasang**: versinya
di-pin **saat instalasi** oleh `tg-devops` (constraint eksak, bukan caret) dan **dicatat di sini sebagai
amendemen** — bukan ditebak sekarang.

### 5. Aturan rantai pasok (mengikat semua agent)

1. Paket baru (termasuk paket "approve" di atas maupun turunannya) **tidak boleh diinstall tanpa**
   persetujuan tg-security lewat task card (`AGENTS.md` aturan 10). "Approval PRD §9.2" ≠ izin install bebas
   varian/paket pengganti.
2. Setiap penambahan dependensi langsung memakai **constraint eksak** (tanpa caret/`latest`) dan
   `pnpm-lock.yaml`/`composer.lock` ikut di-commit.
3. `composer audit` dan `npm audit` dijalankan di CI (T-008, PRD §13); kegagalan severity tinggi memblokir
   merge.
4. Paket "defer" hanya boleh dipakai setelah verdict berubah (amendemen ADR ini) dengan alasan tertulis.
5. Paket "reject" tidak boleh muncul di manifest mana pun.

## Alternatif yang ditolak

1. **Tidak mem-pin versi (caret/`latest` di manifest).** Ditolak: PRD §13 menuntut pin versi; tanpa lock
   yang dipakai, build tidak reprodusibel dan `audit` tidak bermakna.
2. **Mem-pin versi di ADR ini untuk paket yang belum terpasang (menebak nomor versi).** Ditolak: task card
   T-005 notes melarang menebak ("jangan menebak nomor versi"); nomor versi palsu lebih berbahaya daripada
   tabel kosong dengan status jelas.
3. **Menetapkan level PHPStan lebih tinggi (6–8) sekarang.** Ditolak: belum ada kode domain; `paths: app`
   masih kerangka, sehingga level tinggi tidak menguji apa pun tetapi menahan pekerjaan P1 dan memaksa
   baseline yang bisa berubah. Level 5 disepakati, kenaikan = amendemen.
4. **Menetapkan level PHPStan lebih rendah (0–4).** Ditolak: kehilangan manfaat larastan pada tipe
   relasi/kolom, dan T-001 sudah lulus di level 5 — tidak ada alasan menurunkan.
5. **Image hanya dipin tag (tanpa digest) dan dianggap cukup untuk produksi.** Ditolak sebagai posisi
   akhir: tag tidak reprodusibel (temuan F1B-5). Diterima hanya sebagai keadaan sementara dengan deadline
   T-008 (butir 3).
6. **Mengulang/menegosiasi verdict paket tg-security di ADR ini.** Ditolak: keputusan gate adalah milik
   tg-security (pemisahan peran, PRD §16.2/§18.1); ADR ini mengikat, bukan mengadili.
7. **Memakai `pestphp/pest` (opsional di PRD §9.2) di samping phpunit.** Ditolak untuk sekarang:
   PRD menandai Pest opsional, `composer.json` sudah mengizinkan plugin-nya tetapi suite berdiri di PHPUnit
   11.5.58; menambah runner kedua tanpa kebutuhan = beban CI dan dua gaya tes.

## Konsekuensi

- `composer.lock`/`pnpm-lock.yaml` menjadi artefak wajib commit; PR yang mengubah dependensi tanpa lock
  adalah temuan P1 bagi reviewer.
- Paket "approve" yang belum dipasang harus melewati jalur instalasi normal (tg-devops + verdict) dan
  **memperbarui ADR ini**; ADR ini adalah tempat pertama yang dibaca auditor untuk menjawab "versi apa yang
  boleh dipakai".
- Level PHPStan 5 mengikat T-008 dan semua PR backend; larangan "jangan pakai level yang tidak disepakati"
  di T-008 AC terpenuhi oleh butir 2.
- **Utang terbuka yang tidak boleh hilang**: digest pinning image (butir 3) dan komentar "menunggu ADR" di
  `apps/api/phpstan.neon`. Keduanya beralamat jelas (tg-devops) dan punya pemilik gate (T-008).
- Paket "defer" menciptakan batasan desain nyata: tanpa `@serwist/next`, service worker POS harus memakai SW
  kustom sampai verdict berubah (ADR-004); tanpa `spatie/laravel-settings`, setting tenant disimpan di kolom
  JSON `tenants.settings` (PRD §10.2) sampai ada kebutuhan tipe yang kuat.
- `stancl/tenancy` berada di "defer" dan sekaligus ditolak oleh ADR-001 → konsisten; kemunculannya di
  manifest adalah pelanggaran dua keputusan.
- `composer audit`/`npm audit` dapat gagal kapan saja karena CVE baru pada dependensi transitif; itu adalah
  alarm yang diinginkan, bukan alasan menonaktifkan CI.
- Versi Node lokal (v22.23.5) vs `engines >=20.9.0` vs image `node:22-bookworm-slim`: tiga angka ini harus
  dipertahankan agar selaras; menaikkan salah satu tanpa yang lain menimbulkan build lokal ≠ CI.

## Pemetaan keputusan inti PRD §0

| Keputusan | Relasi |
|---|---|
| **D7** | **Implementasi utama**: stack Laravel 12 + Next 16 + MySQL 8.4 + Redis 7 dengan versi ter-pin dan gate paket yang mengikatnya. |
| D1 | Terkait: `spatie/laravel-permission` (approve) harus dijalankan team-scoped per tenant (ADR-001); `stancl/tenancy` (DB-per-tenant) di-defer dan ditolak. |
| D4 | Terkait: `midtrans/midtrans-php` approve (ADR-002); kredensial tenant disimpan terenkripsi (ADR-005). |
| D5 | Terkait tidak langsung: kuota tidak bergantung paket tambahan (MySQL + Redis); `horizon` (approve) memonitor queue. |

## Status

**accepted** — berlaku sejak 2026-11-24. Amendemen wajib (dan hanya amendemen, bukan ADR baru) ketika:
(a) paket "approve" dipasang → catat versi eksak; (b) verdict paket berubah (defer → approve/reject);
(c) level PHPStan naik; (d) digest image dipin; (e) dev-dep paket kontrak ditambah → lihat §1a
(amendemen 2026-11-25). Perubahan keputusan (mis. memilih `spatie/laravel-pdf`, mengadopsi
DB-per-tenant, atau menurunkan level PHPStan) memerlukan ADR baru yang menggantikan.
