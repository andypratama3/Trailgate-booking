#!/usr/bin/env bash
# infra/deploy/build.sh — bangun image produksi (digest-pinned, non-root) + push.
# Dipakai CI rilis (Akses: tg-devops). Jalankan dari root repo.
set -euo pipefail

REPO="${1:?usage: build.sh <registry>/trailgate}"

# Base image + composer + pnpm sudah dipin digest di Dockerfile (ADR-006 §3).
# Tag image = commit sha agar rilis reprodusibel.
SHA="$(git rev-parse --short HEAD)"

docker build -f infra/nginx/Dockerfile   -t "${REPO}/nginx:${SHA}"   .
docker build -f infra/php-fpm/Dockerfile -t "${REPO}/api:${SHA}"    .
docker build -f infra/web/Dockerfile     -t "${REPO}/web:${SHA}"    .

docker push "${REPO}/nginx:${SHA}"
docker push "${REPO}/api:${SHA}"
docker push "${REPO}/web:${SHA}"

echo "Built+push: ${REPO}/*:${SHA}"
echo "Update docker-compose.prod.yml untuk memakai image ${REPO}/*:${SHA}"
