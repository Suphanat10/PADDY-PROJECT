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


FROM node:22

WORKDIR /usr/src/app

# รับค่าจาก Build Argument
ARG NEXT_PUBLIC_API_BASE
ENV NEXT_PUBLIC_API_BASE=$NEXT_PUBLIC_API_BASE

# ปิด ESLint ตอน build (สำคัญมาก)
ENV NEXT_DISABLE_ESLINT=true

COPY package*.json ./
RUN npm install

COPY . .

# Build Next.js
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]

