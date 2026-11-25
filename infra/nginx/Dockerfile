# Nginx produksi — reverse proxy + terminasi TLS untuk apps/api (FPM) dan apps/web.
# NON-ROOT (F1B-4): master + worker nginx jalan sebagai user nginx (uid 101), bukan root.

FROM nginx:1.27-bookworm@sha256:fafd5f55296511cd0f1c991efa0cb85f323449bf643f3b6d760c6542f020d6e5

# Config produksi (PRD §9.1: digabung Cloudflare untuk WAF/cache/rate limit di depan).
COPY infra/nginx/default.conf /etc/nginx/conf.d/default.conf

# NON-ROOT (F1B-4): worker nginx berjalan sebagai user nginx (uid 101) — bukan root.
# Direktori yang ditulis nginx (cache, log, pid) diserahkan ke user nginx.
RUN chown -R nginx:nginx /var/cache/nginx /var/log/nginx /var/run \
    && mkdir -p /var/cache/nginx/client_temp \
    && chmod 700 /var/cache/nginx

USER nginx

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
