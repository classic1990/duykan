# 🚀 คู่มือการนำเว็บ DUYDODEE ออนไลน์จริง

## ตัวเลือกการ Deploy ที่แนะนำ

### 1. **Vercel (ฟรี + ง่ายที่สุด)**
- ฟรีสำหรับโปรเจคส่วนตัว
- Deploy อัตโนมัติเมื่อ push code
- รองรับ Node.js ได้ดี
- SSL Certificate ฟรี

### 2. **Railway (ฟรี + ง่าย)**
- ฟรี 5$/เดือน (จำกัดการใช้งาน)
- รองรับ Database ได้
- Deploy จาก GitHub ง่ายๆ
- เหมาะกับ Node.js

### 3. **Render (ฟรี + มี Database)**
- ฟรีสำหรับ Static Site
- จ่ายเล็กน้อยสำหรับ Backend
- มี PostgreSQL ฟรี
- Deploy จาก GitHub

### 4. **DigitalOcean (จ่ายเงิน)**
- 5$/เดือนขึ้นไป
- เต็มรูปแบบ VPS
- ควบคุมได้เต็มที่
- เหมาะกับโปรเจคใหญ่

---

## 🎯 แนะนำ: Vercel (เริ่มฟรี)

### เตรียมโปรเจคสำหรับ Vercel

#### 1. สร้าง `vercel.json`
```json
{
  "version": 2,
  "builds": [
    {
      "src": "server.js",
      "use": "@vercel/node"
    },
    {
      "src": "public/**/*",
      "use": "@vercel/static"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/server.js"
    },
    {
      "src": "/(.*)",
      "dest": "/public/$1"
    }
  ]
}
```

#### 2. อัปเดต `package.json`
```json
{
  "name": "duydodee-streaming",
  "version": "2.0.0",
  "engines": {
    "node": ">=16.0.0"
  }
}
```

#### 3. สร้าง `.env.production`
```env
NODE_ENV=production
PORT=3000
ADMIN_EMAIL=duy.kan1234@gmail.com
```

---

## 📋 ขั้นตอนการ Deploy บน Vercel

### ขั้นตอนที่ 1: เตรียม GitHub
1. สร้าง GitHub repository ใหม่
2. Push code ขึ้น GitHub:
```bash
git init
git add .
git commit -m "Initial deploy"
git branch -M main
git remote add origin https://github.com/username/duydodee-streaming.git
git push -u origin main
```

### ขั้นตอนที่ 2: Deploy บน Vercel
1. ไปที่ [vercel.com](https://vercel.com)
2. ล็อกอินด้วย GitHub
3. คลิก "New Project"
4. เลือก repository ของคุณ
5. Vercel จะ detect ว่าเป็น Node.js project
6. ตั้งค่า Environment Variables:
   - `NODE_ENV=production`
   - `ADMIN_EMAIL=duy.kan1234@gmail.com`
7. คลิก "Deploy"

### ขั้นตอนที่ 3: รอ Deploy
- Vercel จะใช้เวลา 2-3 นาที
- จะได้ URL ประมาณ: `https://duydodee-streaming.vercel.app`

---

## 🚀 Railway Deployment (ตัวเลือกที่ 2)

### ขั้นตอน:
1. ไปที่ [railway.app](https://railway.app)
2. ล็อกอินด้วย GitHub
3. คลิก "New Project"
4. เลือก "Deploy from GitHub repo"
5. เลือก repository ของคุณ
6. ตั้งค่า Environment:
   - `NODE_ENV=production`
   - `PORT=3000`
7. คลิก "Deploy"

---

## 🔧 การตั้งค่า Production

### 1. อัปเดต server.js สำหรับ Production
```javascript
// เพิ่ม middleware สำหรับ production
if (process.env.NODE_ENV === 'production') {
    app.set('trust proxy', 1);
}
```

### 2. ตั้งค่า CORS สำหรับ Production
```javascript
const corsOptions = {
    origin: process.env.NODE_ENV === 'production' 
        ? ['https://your-domain.vercel.app'] 
        : ['http://localhost:3000'],
    credentials: true
};
app.use(cors(corsOptions));
```

### 3. เพิ่ม Health Check
```javascript
app.get('/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});
```

---

## 📊 ตรวจสอบหลัง Deploy

### 1. ทดสอบ API Endpoints:
```bash
curl https://your-domain.vercel.app/api/test
curl https://your-domain.vercel.app/api/movies
```

### 2. ตรวจสอบหน้าเว็บ:
- หน้าหลัก: `https://your-domain.vercel.app`
- หน้าแอดมิน: `https://your-domain.vercel.app/admin`

### 3. ตรวจสอบ Console Logs:
- ไปที่ Vercel Dashboard
- ดู Logs ใน Function tab

---

## 🛠️ การแก้ไขปัญหาที่พบบ่อย

### ปัญหา: "Function not found"
**วิธีแก้**: ตรวจสอบ `vercel.json` ให้ถูกต้อง

### ปัญหา: "Cannot find module"
**วิธีแก้**: ตรวจสอบ `package.json` และ dependencies

### ปัญหา: "Timeout"
**วิธีแก้**: ใช้ `vercel.json` เพื่อเพิ่ม timeout:
```json
{
  "functions": {
    "server.js": {
      "maxDuration": 30
    }
  }
}
```

---

## 💰 ต้นทุน

### Vercel (แนะนำสำหรับเริ่มต้น)
- **ฟรี**: 100GB bandwidth/month
- **Pro**: 20$/เดือน (เมื่อต้องการ custom domain)

### Railway
- **ฟรี**: 5$/เดือนเครดิต
- **Hobby**: 5$/เดือนหลังหมดเครดิต

---

## 🎯 แนะนำสำหรับคุณ

**เริ่มต้น**: ใช้ Vercel (ฟรี + ง่าย)
**เมื่อโต**: ย้ายไป Railway (มี Database)
**เมื่อใหญ่**: ใช้ DigitalOcean (ควบคุมเต็มที่)

---

## 📞 ถ้ามีปัญหา

1. ตรวจสอบ Vercel Logs
2. ตรวจสอบ Environment Variables
3. ทดสอบใน local ก่อน deploy
4. ตรวจสอบ CORS settings

**หมายเหตุ**: โปรเจคนี้ใช้ mock data ถ้าต้องการ database จริง ต้องเพิ่ม MongoDB หรือ PostgreSQL
