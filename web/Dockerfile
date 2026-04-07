# -------------------------
# Base
# -------------------------
FROM node:20-bookworm-slim AS base
WORKDIR /app



# -------------------------
# Dependencies
# -------------------------
FROM base AS deps
COPY package.json package-lock.json* ./

RUN --mount=type=cache,id=npm-cache,target=/root/.npm npm ci --no-audit --no-fund --prefer-offline --progress=false

# -------------------------
# Build
# -------------------------
FROM base AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build


FROM node:20-bookworm-slim AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
ENV NODE_OPTIONS="--max-old-space-size=1024"

RUN groupadd -g 1001 nodejs \
  && useradd -u 1001 -g nodejs -m -s /usr/sbin/nologin nextjs

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]

