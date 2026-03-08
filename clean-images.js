const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, 'public');
// นามสกุลไฟล์รูปภาพที่ต้องการลบ
const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.svg', '.webp', '.bmp', '.tiff', '.ico'];
// ไฟล์ที่ต้องการเก็บไว้ (ห้ามลบ)
const whitelist = ['favicon.ico', 'logo.png'];

function cleanImages(dir) {
    if (!fs.existsSync(dir)) {
        console.log(`ไม่พบโฟลเดอร์: ${dir}`);
        return;
    }

    const files = fs.readdirSync(dir);

    for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
            // เข้าไปลบในโฟลเดอร์ย่อย (Recursive)
            cleanImages(filePath);
            
            // ลบโฟลเดอร์เปล่าทิ้งด้วย
            if (fs.readdirSync(filePath).length === 0) {
                fs.rmdirSync(filePath);
                console.log(`🗑️  ลบโฟลเดอร์เปล่า: ${filePath}`);
            }
        } else {
            const ext = path.extname(file).toLowerCase();
            // ถ้าเป็นไฟล์รูปและไม่อยู่ใน whitelist ให้ลบ
            if (imageExtensions.includes(ext) && !whitelist.includes(file)) {
                fs.unlinkSync(filePath);
                console.log(`❌ ลบไฟล์รูปที่ไม่ได้ใช้: ${filePath}`);
            }
        }
    }
}

console.log('--- 🧹 เริ่มต้นทำความสะอาดไฟล์รูปภาพ ---');
cleanImages(publicDir);
console.log('--- ✨ เสร็จสิ้น ---');