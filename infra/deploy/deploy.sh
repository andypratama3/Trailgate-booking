#!/usr/bin/env bash
# infra/deploy/deploy.sh — rolling restart stack produksi.
# Migrasi + scheduler dijalankan one-shot; queue worker rolling. Jalankan dari root repo.
set -euo pipefail

# Rahasia mysql + app wajib ada (secret manager / deploy env), bukan file ter-commit.
: "${MYSQL_PASSWORD?:required}"

echo "==> migrate (one-shot, non-root)"
docker compose -f docker-compose.prod.yml run --rm api php artisan migrate --force

echo "==> restart stack"
docker compose -f docker-compose.prod.yml up -d --build nginx api worker web

echo "==> konfigurasi scheduler (di host/systemd atau container once)"
# catatan: scheduler (`php artisan schedule:work`) dijadwalkan job terpisah yang sama
# dengan worker pada T-008 berikutnya; status: pekerjaan produksi menyusul.

echo "Deploy selesai."
