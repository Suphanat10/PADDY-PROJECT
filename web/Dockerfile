# -------------------------
# Base
# -------------------------
FROM node:20-alpine AS base
WORKDIR /app



# -------------------------
# Dependencies
# -------------------------
FROM base AS deps
RUN apk add --no-cache libc6-compat

COPY package.json package-lock.json* ./

RUN npm ci   # จะลง devDependencies ด้วย

# -------------------------
# Build
# -------------------------
FROM base AS builder
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build


FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
ENV NODE_OPTIONS="--max-old-space-size=1024"

RUN addgroup -S nodejs -g 1001 \
  && adduser -S nextjs -u 1001 -G nodejs

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]

