# Google OAuth Setup Guide for DUYDODEE

## วิธีแก้ไขปัญหา `redirect_uri_mismatch`

### 1. สร้าง Google OAuth Application

1. ไปที่ [Google Cloud Console](https://console.cloud.google.com/)
2. เลือกโปรเจคของคุณ หรือสร้างโปรเจคใหม่
3. ไปที่ **APIs & Services** → **Credentials**
4. คลิก **+ CREATE CREDENTIALS** → **OAuth 2.0 Client ID**
5. เลือก **Web application**
6. ตั้งชื่อ: `DUYDODEE Streaming Platform`

### 2. ตั้งค่า Redirect URIs

ในส่วน **Authorized redirect URIs** ให้เพิ่ม:

```
http://localhost:3000/auth/google/callback
```

**สำคัญ:** ต้องใส่ URL ให้ตรงกับที่อยู่ในไฟล์ `.env`

### 3. ตั้งค่า Environment Variables

แก้ไขไฟล์ `.env` ให้มีข้อมูลจาก Google:

```env
# Google OAuth Configuration
GOOGLE_CLIENT_ID=your-google-client-id-here
GOOGLE_CLIENT_SECRET=your-google-client-secret-here
GOOGLE_REDIRECT_URI=http://localhost:3000/auth/google/callback
```

### 4. เปิดใช้งาน Google APIs

1. ไปที่ **APIs & Services** → **Library**
2. ค้นหาและเปิดใช้งาน:
   - **Google+ API** (ถ้ายังมี)
   - **Google OAuth2 API**
   - **People API** (สำหรับข้อมูลผู้ใช้)

### 5. ทดสอบการทำงาน

1. รีสตาร์ท server: `npm start`
2. ไปที่: `http://localhost:3000/auth/google`
3. ควร redirect ไปที่ Google login
4. หลังจาก login ควรกลับมาที่: `http://localhost:3000/auth/google/callback`

### 6. สำหรับ Production

สำหรับ production ให้เพิ่ม redirect URI ดังนี้:

```
https://yourdomain.com/auth/google/callback
```

และอัปเดต `.env`:

```env
GOOGLE_REDIRECT_URI=https://yourdomain.com/auth/google/callback
```

### 7. ตรวจสอบการตั้งค่า

ตรวจสอบว่า:
- ✅ Client ID และ Client Secret ถูกต้อง
- ✅ Redirect URI ตรงกับที่ตั้งค่าไว้ใน Google Console
- ✅ API ที่จำเป็นถูกเปิดใช้งานแล้ว
- ✅ Environment variables ถูกตั้งค่าอย่างถูกต้อง

### 8. ปัญหาที่พบบ่อย

**Error: redirect_uri_mismatch**
- ตรวจสอบว่า redirect URI ใน Google Console ตรงกับ `.env`
- ตรวจสอบว่าไม่มี `/` ต่อท้ายที่ไม่จำเป็น

**Error: invalid_client**
- ตรวจสอบว่า Client ID ถูกต้อง
- ตรวจสอบว่า application type เป็น Web application

**Error: access_denied**
- ตรวจสอบว่า user อนุญาตการเข้าถึง
- ตรวจสอบว่า scopes ถูกต้อง

### 9. การใช้งาน

หลังจาก setup เสร็จ:

1. **Login**: `GET /auth/google`
2. **Callback**: `GET /auth/google/callback`
3. **Get User**: `GET /auth/google/user` (ต้องมี token)
4. **Logout**: `POST /auth/google/logout`

### 10. Security Tips

- เก็บ Client Secret ไว้ใน `.env` อย่างเดียว
- ใช้ HTTPS ใน production
- ตรวจสอบ state parameter สำหรับ CSRF protection
- จำกัดการใช้งาน tokens ให้เหมาะสมกับความต้องการ
