@echo off
chcp 65001 >nul
echo 🔄 Restore DUYDODEE to classic1990/duykan
echo ================================================

echo 1️⃣  Checking if we're in the right directory...
if not exist "server.js" (
    echo ❌ Please run this script in the project directory
    pause
    exit /b 1
)

echo 2️⃣  Creating backup...
set BACKUP_DIR=backup-%date:~0,4%%date:~5,2%%date:~8,2%-%time:~0,2%%time:~3,2%%time:~6,2%
set BACKUP_DIR=%BACKUP_DIR: =0%
mkdir "..\%BACKUP_DIR%" 2>nul
xcopy /E /I /H "..\%BACKUP_DIR%" . >nul
echo ✅ Backup created: ..\%BACKUP_DIR%

echo 3️⃣  Cleaning up old git...
if exist ".git" (
    echo 🗑️ Removing old git repository...
    rmdir /s /q .git
)

echo 4️⃣  Installing Git (if needed)...
where git >nul 2>&1
if %errorlevel% neq 0 (
    echo 📦 Git not found. Please install Git first:
    echo    1. Download from: https://git-scm.com/download/win
    echo    2. Install and restart this script
    pause
    exit /b 1
)

echo 5️⃣  Initializing new git repository...
git init
git branch -M main

echo 6️⃣  Adding files to git...
git add .
git commit -m "🚀 Restore DUYDODEE project for classic1990/duykan"

echo 7️⃣  Connecting to GitHub repository...
git remote add origin https://github.com/classic1990/duykan.git

echo 8️⃣  Pushing to GitHub...
echo 📤 This may ask for your GitHub credentials...
git push -u origin main --force

if %errorlevel% neq 0 (
    echo ❌ Failed to push to GitHub
    echo Please check:
    echo   1. GitHub repository exists: https://github.com/classic1990/duykan
    echo   2. You have permission to push
    echo   3. GitHub credentials are correct
    pause
    exit /b 1
)

echo 9️⃣  Installing dependencies...
npm install

echo 🔟  Testing server...
start /B npm start
timeout /t 5 /nobreak >nul

echo 🧪 Testing API...
curl -s http://localhost:3000/api/test >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Server test passed!
) else (
    echo ❌ Server test failed
)

echo.
echo 🎉 Restore completed successfully!
echo 🌐 Your project is now at: https://github.com/classic1990/duykan
echo 🚀 Ready to deploy to Vercel or other hosting
echo.
echo Next steps:
echo 1. Go to Vercel.com
echo 2. Connect GitHub  
echo 3. Select classic1990/duykan
echo 4. Deploy
echo.
pause
