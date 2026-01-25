# FROM node:22

# WORKDIR /usr/src/app

# # รับค่าจาก Build Argument
# ARG NEXT_PUBLIC_API_BASE
# ENV NEXT_PUBLIC_API_BASE=$NEXT_PUBLIC_API_BASE

# # ปิด ESLint ตอน build (สำคัญมาก)
# ENV NEXT_DISABLE_ESLINT=true

# COPY package*.json ./
# RUN npm install

# COPY . .

# # Build Next.js
# RUN npm run build

# EXPOSE 3000
# CMD ["npm", "start"]


# ---------- Build ----------
FROM node:22-alpine AS builder
WORKDIR /app

ARG NEXT_PUBLIC_API_BASE
ENV NEXT_PUBLIC_API_BASE=$NEXT_PUBLIC_API_BASE
ENV NEXT_DISABLE_ESLINT=true

COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# ---------- Runtime ----------
FROM node:22-alpine
WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 3000
CMD ["npm", "start"]

