# infra/

# Catatan prefix API: kontrak OpenAPI (`packages/contracts/openapi.yaml`) memakai `/v1/...` sebagai
# prefix kanonik (PRD §11). Semua referensi di repo (README, env, compose, nginx) selaras ke `/v1/...`.

Definisi infrastruktur **produksi** (owner: tg-devops). `docker-compose.yml` di root hanya untuk
pengembangan lokal; produksi di `docker-compose.prod.yml` + `infra/`.

## Isi

| Path | Isi |
|---|---|
| `infra/nginx/` | Image Nginx produksi NON-ROOT (worker non-root default), reverse proxy API `apps/api` (PHP-FPM via unix socket) + `apps/web`, anti-dotfile. Digabung Cloudflare (WAF, cache, rate limit) PRD §9.1 |
| `infra/php-fpm/` | Image PHP-FPM produksi NON-ROOT (`www-data`), OPcache aktif, pool `php-fpm`, extension sama dengan `docker/api/Dockerfile` + `redis` |
| `infra/web/` | Image Next.js produksi NON-ROOT (`node`), build standalone, pnpm 10.33.2 |
| `infra/deploy/` | Rilis: `build.sh` (build+push digest-pinned + sha tag), `deploy.sh` (migrate one-shot + rolling restart) |
| `infra/storage/` | (terencana) Object storage S3-compatible privat + kebijakan signed URL — menyusul |

Stack produksi: `docker-compose.prod.yml` (nginx, api, worker, web, mysql, redis).

## Prinsip

- Dev boleh root; **produksi semua image NON-ROOT** (www-data / node / nginx — temuan tg-security
  T-001 **F1B-4**).
- **Base image + composer dipin DIGEST** (`@sha256:...`) — ADR-006 §3 (F1B-5): update digest via
  `docker manifest inspect`. Tag di komentar tetap dipertahankan sebagai keterbacaan.
- `pecl install redis` dipin versi `redis-6.3.0`; pnpm dipin `10.33.2`.
- Semua rahasia dari environment/secret manager, tidak pernah dari file ter-commit (`AGENTS.md` #11).
  Kredensial MySQL produksi datang dari deploy env (`MYSQL_PASSWORD`, dst.) — compose gagal bila kosong
  (fail-safe).
- Prefix API kanonik `/v1/...` (kontrak OpenAPI `packages/contracts/openapi.yaml`, PRD §11);
  semua referensi (README, env, compose, nginx `location /v1/`) selaras ke sana.
- CI Pipeline lengkap: `.github/workflows/ci.yml` (pint, phpstan level 5, PHPUnit, tsc, eslint,
  composer/npm audit, secret-scan gitleaks, security-scan fail-safe, Playwright smoke, tenant-isolation
  T-101). Lokal: `make ci` (lihat `Makefile`).

## Scheduler & Horizon

`php artisan schedule:work` / Horizon belum dijalankan di dev; jadwal produksi menyusul task berikutnya.
