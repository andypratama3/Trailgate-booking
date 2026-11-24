# TrailGate

Monorepo TrailGate — booking jalur pendakian berbasis kuota.

Sumber kebenaran produk: [`docs/prd/PRD.md`](docs/prd/PRD.md). Peta kepemilikan path: [`OWNERS.md`](OWNERS.md).
Aturan kerja agent: [`AGENTS.md`](AGENTS.md). Papan status: [`docs/board/STATUS.md`](docs/board/STATUS.md).

## Struktur

| Path | Isi | Pemilik (OWNERS.md) |
|---|---|---|
| `apps/api` | Laravel 12 REST API `/api/v1`, queue worker, scheduler | tg-backend / tg-data / tg-domain / tg-integrations |
| `apps/web` | Next.js App Router + TypeScript — web publik + konsol | tg-web / tg-console |
| `apps/pos` | PWA petugas pos (app Next.js terpisah) | tg-console |
| `packages/contracts` | OpenAPI + tipe TS hasil generate (placeholder) | tg-architect |
| `packages/design-tokens` | Token desain → CSS variables (placeholder) | tg-ux |
| `packages/ui` | Komponen UI milik sendiri (placeholder) | tg-ux |
| `docker/`, `docker-compose.yml` | Dev stack: api, worker, web, MySQL 8, Redis | tg-devops |
| `docs/`, `infra/`, `tests/` | Dokumen, infra produksi, e2e/load/security | per OWNERS.md |

## Versi ter-pin

Versi TIDAK dipatok di PRD; angka di bawah adalah versi nyata hasil cek registry saat scaffold.
Pin ini dicatat sebagai **ADR-006** (penomoran T-005: ADR-001 = tenancy, ADR-006 = versi paket).

| Komponen | Versi | Sumber pin |
|---|---|---|
| Laravel Framework | 12.73.0 (`laravel/framework ^12.0`) | `apps/api/composer.json` + `composer.lock` (ter-commit) |
| PHP | `^8.2` (dev: 8.3.6) | `apps/api/composer.json` |
| Next.js | 16.4.6 | `apps/web/package.json`, `apps/pos/package.json` |
| React / React DOM | 19.3.1 | idem |
| TypeScript | 5.9.3 | idem |
| Tailwind CSS + `@tailwindcss/postcss` | 4.3.5 (v4, CSS-first) | `apps/web`, `apps/pos`, `apps/api` (asset Vite) |
| Node.js | `>=20.9.0` (dev: 22.23.5) | `package.json` engines, `docker/web/Dockerfile` |
| pnpm | 10.33.2 | `packageManager` + `pnpm-lock.yaml` (ter-commit) |
| MySQL | image `mysql:8.4` | `docker-compose.yml` |
| Redis | image `redis:7-alpine` | `docker-compose.yml` |
| Larastan / PHPStan | `larastan/larastan ^3.15` (v3.15.0), level **5** | `apps/api/composer.json` + `apps/api/phpstan.neon` |
| Extension PECL `redis` | 6.3.0 | `docker/api/Dockerfile` |
| Image dasar `php:8.3-cli-bookworm`, `composer:2.7.9`, `node:22-bookworm-slim` | tag saja (belum digest) | `docker/*/Dockerfile` — digest wajib dipin sebelum rilis produksi (ADR-006) |

Catatan: `typescript` dipin ke **5.9.3**, bukan `7.0.2` (rilis terbaru saat scaffold, port native).
5.9.x adalah jalur stabil yang didukung tooling Next 16; upgrade TS dievaluasi lewat ADR-006.

## Keputusan: `apps/pos` sebagai app Next.js terpisah

Dua opsi dari PRD §9.1: (a) route group di `apps/web`, atau (b) app terpisah. **Dipilih (b)**.

Alasan: `OWNERS.md` memetakan `apps/pos/**` → **tg-console**, sedangkan route group di bawah
`apps/web/app/**` jatuh ke **tg-web**; memisahkan app menjaga batas kepemilikan tetap satu owner per
path, memisahkan service worker/manifest PWA dari bundle web publik, dan memberi target deploy
sendiri. Konsekuensi: dua app Next, dependensi di-dedupe oleh satu `pnpm-lock.yaml`.

PRD §9.1 memang mengizinkan POS sebagai route group **atau** app terpisah. Konsekuensi topologi ini
(dua app Next, satu `pnpm-lock.yaml`, service worker terpisah) ditangkap di **ADR-004** (POS offline) milik tg-architect.

## Menjalankan dev

### Docker (api + worker + web + MySQL + Redis)

```bash
cp .env.example .env          # nilai di dalamnya placeholder lokal, bukan rahasia
docker compose up --build
```

- API: <http://localhost:8000> — service `api` menyalin `apps/api/.env.example` → `.env`,
  generate `APP_KEY`, dan `composer install` saat pertama kali jalan.
- Web: <http://localhost:3000>
- MySQL: `localhost:3306`, Redis: `localhost:6379` (port bisa diubah lewat `.env`).
- Worker: `php artisan queue:work` memproses queue Redis. Scheduler belum dijalankan di dev; jadwal menyusul di T-008.
- Port api/web/MySQL/Redis hanya di-bind ke `127.0.0.1` (tidak terekspos ke jaringan).
- `api` menjalankan `php artisan serve --no-reload`. Tanpa flag itu `ServeCommand` membuang
  `DB_HOST`/`REDIS_HOST` dari environment proses `php -S`, jadi aplikasi memakai `127.0.0.1`
  dari `.env` dan koneksi ke service `mysql`/`redis` gagal.

### Lokal (PHP & Node di host, MySQL+Redis dari Docker)

```bash
docker compose up -d mysql redis

cd apps/api
composer install
cp .env.example .env
php artisan key:generate
php artisan serve              # http://localhost:8000

cd ../..
pnpm install
pnpm dev                       # web  -> http://localhost:3000
pnpm dev:pos                   # pos  -> http://localhost:3001
```

`pnpm-lock.yaml` dan `apps/api/composer.lock` ikut di-commit; jangan hapus agar build reproducible.

## Verifikasi

```bash
cd apps/api && php artisan --version
cd ../.. && pnpm -C apps/web build
pnpm -C apps/pos build
docker compose config
pnpm --version
cd apps/api && vendor/bin/pint --test && vendor/bin/phpstan analyse && composer test
```
Catatan tes: `APP_KEY` untuk testing dibuat acak per proses oleh `apps/api/bootstrap/phpunit-testing.php`,
jadi `apps/api/.env.testing` tetap `APP_KEY=` kosong dan tidak ada rahasia ter-commit (AGENTS.md #11).
Di sesi root: `COMPOSER_ALLOW_SUPERUSER=1 composer test`.

## Belum ada di scaffold T-001

- CI (`.github/workflows`): pint, phpstan, tes, tsc/lint, Playwright smoke, audit, secret scan —
  di luar acceptance T-001, menyusul sebagai task tg-devops berikutnya.
- ESLint/Prettier: ditunda sampai ada source produk (`next build` tidak memerlukan lint).
- `infra/` masih berupa `infra/README.md` (cakupan Nginx/PHP-FPM, storage S3-compatible, deploy); implementasinya menyusul.
