#!/bin/bash

# 🔄 Restore DUYDODEE to classic1990/duykan
echo "🔄 Restoring DUYDODEE project to classic1990/duykan"
echo "================================================="

# 1. ตรวจสอบว่าอยู่ในโฟลเดอร์ที่ถูกต้อง
if [ ! -f "server.js" ]; then
    echo "❌ Please run this script in the project directory"
    exit 1
fi

# 2. สร้าง backup ของสิ่งที่มีอยู่
echo "📦 Creating backup of current state..."
BACKUP_DIR="backup-$(date +%Y%m%d-%H%M%S)"
mkdir -p "../$BACKUP_DIR"
cp -r . "../$BACKUP_DIR/"
echo "✅ Backup created: ../$BACKUP_DIR"

# 3. ถ้ามี git repo เก่า ลบทิ้ง
if [ -d ".git" ]; then
    echo "🗑️ Removing old git repository..."
    rm -rf .git
fi

# 4. Initialize git ใหม่
echo "🔧 Initializing new git repository..."
git init
git branch -M main

# 5. Add ไฟล์ทั้งหมด (ตาม .gitignore)
echo "📝 Adding files to git..."
git add .
git commit -m "🚀 Restore DUYDODEE project for classic1990/duykan"

# 6. Connect กับ GitHub repo
echo "🔗 Connecting to GitHub repository..."
git remote add origin https://github.com/classic1990/duykan.git

# 7. Push ขึ้น GitHub
echo "📤 Pushing to GitHub..."
git push -u origin main --force

# 8. ติดตั้ง dependencies
echo "📦 Installing dependencies..."
npm install

# 9. Test server
echo "🧪 Testing server..."
npm start &
SERVER_PID=$!
sleep 5

# Test API
if curl -s http://localhost:3000/api/test > /dev/null; then
    echo "✅ Server test passed!"
else
    echo "❌ Server test failed"
fi

# Stop test server
kill $SERVER_PID 2>/dev/null

echo ""
echo "🎉 Restore completed successfully!"
echo "🌐 Your project is now at: https://github.com/classic1990/duykan"
echo "🚀 Ready to deploy to Vercel or other hosting"
echo ""
echo "Next steps:"
echo "1. Go to Vercel.com"
echo "2. Connect GitHub"
echo "3. Select classic1990/duykan"
echo "4. Deploy"
