# Image produksi apps/web (+ apps/pos) — Next.js, NON-ROOT (node).
# Dev: docker/web/Dockerfile (node:22-bookworm-slim) bebas root — image ini untuk rilis.
#
# Pin (ADR-006 §3, F1B-5): base image dipin ke DIGEST, bukan tag bergerak.
# Update digest: docker manifest inspect

FROM node:22-bookworm-slim@sha256:d20a7b8b4184bf74fe77499b5460a3d69e582bc733d50287e40c3fe791764851

# pnpm dipin eksak (ADR-006 §1: versi Node/pnpm selaras dengan package.json).
RUN corepack enable && corepack prepare pnpm@10.33.2 --activate

WORKDIR /app

# Dependency layer dulu — cache build supaya source change tidak reinstall.
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/web/package.json apps/web/package.json
COPY apps/pos/package.json apps/pos/package.json
RUN pnpm install --frozen-lockfile

# Build
COPY apps/web apps/web
COPY apps/pos apps/pos
RUN pnpm run build && pnpm run build:pos

# Runtime: user node (non-root, F1B-4) — image node sudah menyediakan user node (uid 1000).
USER node:node

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

EXPOSE 3000

CMD ["pnpm", "--filter", "@trailgate/web", "start"]
