# ── Stage 1: build ────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /build

# Install openssl for Prisma compatibility
RUN apk add --no-cache openssl

# Install dependencies (incl. devDeps needed for tsc + prisma generate)
COPY package.json package-lock.json ./
RUN npm ci

# Copy source and compile
COPY tsconfig.json ./
COPY prisma ./prisma
COPY src ./src
RUN npx prisma generate
RUN npm run build

# ── Stage 2: production ───────────────────────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app

# Install yt-dlp, yt-dlp-ejs (EJS challenge solver), deno, ffmpeg, openssl
RUN apk add --no-cache python3 py3-pip ffmpeg openssl deno && \
    pip3 install --break-system-packages --upgrade yt-dlp yt-dlp-ejs "yt-dlp[default]"

# Production-only npm deps
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Copy compiled output, prisma schema, and generated client from builder
COPY --from=builder /build/dist ./dist
COPY --from=builder /build/prisma ./prisma
COPY --from=builder /build/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /build/node_modules/.prisma ./node_modules/.prisma

# Non-root user with write permissions to app and downloads directories
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
RUN mkdir -p /downloads && chown -R appuser:appgroup /downloads /app
USER appuser

ENV NODE_ENV=production \
    PORT=4000 \
    DOWNLOAD_DIR=/downloads \
    DIRECT_WORKER=true \
    STORAGE_PROVIDER=local

EXPOSE 4000

# Push schema then start server
CMD ["sh", "-c", "npx prisma db push --skip-generate && node dist/index.js"]
