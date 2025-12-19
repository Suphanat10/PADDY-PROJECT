FROM node:22

WORKDIR /usr/src/app

# รับค่าจาก Build Argument
ARG NEXT_PUBLIC_API_BASE
# ตั้งค่าเป็น Environment Variable ภายในเครื่องตอน Build
ENV NEXT_PUBLIC_API_BASE=$NEXT_PUBLIC_API_BASE

COPY package*.json ./
RUN npm install
COPY . .

# ตอนรันคำสั่งนี้ Next.js จะดึงค่าจาก ENV ด้านบนไปฝังในไฟล์ JS
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]