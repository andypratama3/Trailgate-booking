# Image lokal untuk apps/web + apps/pos (Next.js, dijalankan lewat pnpm workspace).
FROM node:22-bookworm-slim

RUN npm install --global pnpm@10.33.2

WORKDIR /app
EXPOSE 3000

CMD ["pnpm", "--filter", "@trailgate/web", "dev"]
