@echo off
echo 🚀 DUYDODEE Easy Deployment
echo ============================

echo 1️⃣  Installing Vercel CLI...
npm install -g vercel

echo 2️⃣  Logging in to Vercel...
vercel login

echo 3️⃣  Deploying your website...
vercel --prod

echo ✅ Deployment completed!
echo 🌐 Your website is now online!
echo 📋 Check the URL above to visit your site
pause
