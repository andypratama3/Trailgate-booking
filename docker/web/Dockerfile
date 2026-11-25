# Image lokal untuk apps/web + apps/pos (Next.js, dijalankan lewat pnpm workspace).
FROM node:22-bookworm-slim@sha256:d20a7b8b4184bf74fe77499b5460a3d69e582bc733d50287e40c3fe791764851
RUN npm install --global pnpm@10.33.2

WORKDIR /app
EXPOSE 3000

CMD ["pnpm", "--filter", "@trailgate/web", "dev"]
