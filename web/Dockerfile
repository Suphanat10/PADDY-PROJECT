FROM node:22

WORKDIR /usr/src/app

# 1. ประกาศรับ Argument จาก docker-compose
ARG NEXT_PUBLIC_API_BASE
ARG NEXT_PUBLIC_LIFF_ID
ARG NEXT_PUBLIC_API_URL

# 2. ตั้งค่าเป็น ENV เพื่อให้ Next.js ดึงไปใช้ตอน Build โค้ด
ENV NEXT_PUBLIC_API_BASE=$NEXT_PUBLIC_API_BASE
ENV NEXT_PUBLIC_LIFF_ID=$NEXT_PUBLIC_LIFF_ID
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

COPY package*.json ./
RUN npm install
COPY . .

# 3. ขั้นตอนนี้ Next.js จะนำค่า ENV ด้านบนไปใส่ในไฟล์ JavaScript
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]