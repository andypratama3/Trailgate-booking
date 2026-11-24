# infra/

Definisi infrastruktur **produksi** (owner: tg-devops). `docker-compose.yml` di root hanya untuk
pengembangan lokal; jangan menambah layanan produksi di sana.

## Cakupan yang direncanakan

| Path | Isi |
|---|---|
| `infra/nginx/` | Reverse proxy + terminasi TLS untuk `apps/api` (PHP-FPM) dan `apps/web`; digabung Cloudflare (WAF, cache, rate limit) sesuai PRD §9.1 |
| `infra/php-fpm/` | Image PHP-FPM produksi (bukan `artisan serve`): OPcache, pool `php-fpm`, extension sama dengan `docker/api/Dockerfile` |
| `infra/storage/` | Object storage S3-compatible privat (dokumen & gambar) + kebijakan signed URL |
| `infra/deploy/` | Rilis: build image, `php artisan migrate --force`, restart queue worker & scheduler, rollback |

## Prinsip

- Dev: `docker-compose.yml` (api, worker, web, mysql, redis). Produksi: image terpisah.
- Semua rahasia dari environment/secret manager, tidak pernah dari file ter-commit
  (`AGENTS.md` #11).
- Scheduler (`php artisan schedule:work`) dan Horizon belum dijalankan di dev; jadwal produksi
  masuk T-008.
- Pin image ke digest sebelum rilis produksi (lihat catatan ADR-006 di `README.md`).

Belum ada file lain di direktori ini; targetnya ditambahkan oleh task tg-devops berikutnya.
