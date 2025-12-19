# ใช้ Node.js Base Image (Alpine เพื่อความเบา)
FROM node:20-alpine

# ตั้ง Working Directory
WORKDIR /app

# Copy ไฟล์ Package มาลงก่อน (เพื่อให้ Docker Cache layer นี้ไว้)
COPY package*.json ./

# ติดตั้ง Dependencies
RUN npm install --legacy-peer-deps

# Copy โค้ดทั้งหมด
COPY . .

# สร้าง Build สำหรับ Production
RUN npm run build

# เปิด Port 3000
EXPOSE 3000

# คำสั่งรันเมื่อ Container เริ่มทำงาน
CMD ["npm", "start"]