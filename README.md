# DUYDODEE Streaming Platform

โปรเจคนี้คือแพลตฟอร์มสตรีมมิ่งซีรีส์ออนไลน์ฟรีสำหรับดูซีรีส์และหนัง

## เริ่มต้นใช้งาน

### การติดตั้ง
```bash
npm install
```

### การรันเซิร์ฟเวอร์
```bash
npm start
```
หรือใช้โหมด development
```bash
npm run dev
```

### เข้าถึงเว็บไซต์
- **หน้าหลัก**: http://localhost:3000
- **หน้าแอดมิน**: http://localhost:3000/admin

## โครงสร้างโปรเจค

```
duykan/Dev/
├── server.js           # เซิร์ฟเวอร์หลัก
├── package.json        # การจัดการ dependencies
├── .env                # ตัวแปรสภาพแวดล้อม
├── public/             # ไฟล์หน้าเว็บ (HTML, CSS, JS)
│   ├── index.html      # หน้าหลัก
│   ├── admin.html      # หน้าแอดมิน
│   └── ...
└── README.md           # ไฟล์นี้
```

## API Endpoints

### หนังและซีรีส์
- `GET /api/movies` - ดูรายการซีรีส์ทั้งหมด
- `GET /api/movies?id={id}` - ดูรายละเอียดซีรีส์ตาม ID

### การยืนยันตัวตน
- `POST /api/auth/google` - ล็อกอินด้วย Google (Mock)

### ความคิดเห็น
- `GET /api/comments?movieId={id}` - ดูความคิดเห็นของซีรีส์

### ประกาศ
- `GET /api/announcement` - ดูประกาศล่าสุด

## Features

- ✅ ดูซีรีส์ออนไลน์ฟรี
- ✅ ระบบแอดมินสำหรับจัดการเนื้อหา
- ✅ ค้นหาและกรองซีรีส์
- ✅ ระบบความคิดเห็น
- ✅ รองรับมือถือและคอมพิวเตอร์

## Environment Variables

แก้ไขไฟล์ `.env` เพื่อตั้งค่า:

```env
NODE_ENV=development
PORT=3000
ADMIN_EMAIL=duy.kan1234@gmail.com
```

## License

MIT License
