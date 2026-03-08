#!/bin/bash

# DUYDODEE Deployment Script
# สำหรับ Deploy ไปยัง Production

echo "🚀 Starting DUYDODEE Deployment..."

# 1. ตรวจสอบว่าอยู่ใน branch main
if [ "$(git branch --show-current)" != "main" ]; then
    echo "❌ Please switch to main branch first"
    exit 1
fi

# 2. ตรวจสอบว่าไม่มีการเปลี่ยนแปลงที่ยังไม่ได้ commit
if [ -n "$(git status --porcelain)" ]; then
    echo "❌ Please commit all changes first"
    exit 1
fi

# 3. ติดตั้ง dependencies ใหม่
echo "📦 Installing dependencies..."
npm install --production

# 4. ทดสอบใน local
echo "🧪 Running local tests..."
npm start &
PID=$!
sleep 5
curl -s http://localhost:3000/api/test > /dev/null
if [ $? -eq 0 ]; then
    echo "✅ Local test passed"
else
    echo "❌ Local test failed"
    kill $PID
    exit 1
fi
kill $PID

# 5. Push ไป GitHub
echo "📤 Pushing to GitHub..."
git add .
git commit -m "Deploy: $(date)"
git push origin main

# 6. แจ้งผล
echo "✅ Deployment completed!"
echo "🌐 Your website will be available at: https://duydodee-streaming.vercel.app"
echo "⏱️  Please wait 2-3 minutes for deployment to complete"
