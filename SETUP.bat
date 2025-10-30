@echo off
REM ====================================
REM Snabb Taxi System - Setup Script
REM این اسکریپت پروژه را برای اجرا آماده می‌کند
REM ====================================

color 0A
echo.
echo ====================================
echo   Snabb Taxi - نصب و راه‌اندازی
echo ====================================
echo.
echo این اسکریپت پروژه را برای اجرا آماده می‌کند...
echo.
pause

REM بررسی Python
echo.
echo [1/7] بررسی Python...
python --version >nul 2>&1
if errorlevel 1 (
    echo ✗ Python نصب نیست!
    echo لطفاً Python 3.11+ را از https://www.python.org/downloads/ نصب کنید
    pause
    exit /b 1
) else (
    echo ✓ Python نصب است
    python --version
)

REM بررسی Node.js
echo.
echo [2/7] بررسی Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo ✗ Node.js نصب نیست!
    echo لطفاً Node.js 18+ را از https://nodejs.org/ نصب کنید
    pause
    exit /b 1
) else (
    echo ✓ Node.js نصب است
    node --version
)

REM بررسی MongoDB
echo.
echo [3/7] بررسی MongoDB...
mongod --version >nul 2>&1
if errorlevel 1 (
    echo ✗ MongoDB نصب نیست!
    echo لطفاً MongoDB را از https://www.mongodb.com/try/download/community نصب کنید
    echo.
    echo یا می‌توانید از MongoDB Compass استفاده کنید
    pause
) else (
    echo ✓ MongoDB نصب است
    mongod --version | findstr "db version"
)

REM بررسی و نصب Yarn
echo.
echo [4/7] بررسی Yarn...
yarn --version >nul 2>&1
if errorlevel 1 (
    echo ✗ Yarn نصب نیست، در حال نصب...
    npm install -g yarn
    echo ✓ Yarn نصب شد
) else (
    echo ✓ Yarn نصب است
    yarn --version
)

REM نصب وابستگی‌های Backend
echo.
echo [5/7] نصب وابستگی‌های Backend...
cd /d "%~dp0backend"
if not exist requirements.txt (
    echo ✗ فایل requirements.txt یافت نشد!
    pause
    exit /b 1
)
echo در حال نصب Python packages...
pip install -r requirements.txt
if errorlevel 1 (
    echo ✗ خطا در نصب Python packages
    pause
    exit /b 1
)
echo ✓ Backend packages نصب شدند

REM نصب وابستگی‌های Frontend
echo.
echo [6/7] نصب وابستگی‌های Frontend (ممکن است چند دقیقه طول بکشد)...
cd /d "%~dp0frontend"
if not exist package.json (
    echo ✗ فایل package.json یافت نشد!
    pause
    exit /b 1
)
echo در حال نصب Frontend packages...
yarn install
if errorlevel 1 (
    echo ✗ خطا در نصب Frontend packages
    pause
    exit /b 1
)
echo ✓ Frontend packages نصب شدند

REM نصب وابستگی‌های Admin
echo.
cd /d "%~dp0admin"
if exist package.json (
    echo در حال نصب Admin packages...
    yarn install
    if errorlevel 1 (
        echo ✗ خطا در نصب Admin packages
    ) else (
        echo ✓ Admin packages نصب شدند
    )
)

REM نصب وابستگی‌های Driver
echo.
cd /d "%~dp0driver"
if exist package.json (
    echo در حال نصب Driver packages...
    yarn install
    if errorlevel 1 (
        echo ✗ خطا در نصب Driver packages
    ) else (
        echo ✓ Driver packages نصب شدند
    )
)

REM ایجاد فایل .env برای Backend
echo.
echo [7/7] ایجاد فایل‌های تنظیمات...
cd /d "%~dp0backend"
if not exist .env (
    echo ایجاد فایل .env برای Backend...
    (
        echo MONGO_URL=mongodb://localhost:27017
        echo DB_NAME=snabb_taxi
        echo CORS_ORIGINS=http://localhost:3000,http://localhost:3001,http://localhost:3002
        echo SECRET_KEY=snabb_secret_key_2025_secure_random_string
    ) > .env
    echo ✓ فایل .env ایجاد شد
) else (
    echo ✓ فایل .env از قبل وجود دارد
)

cd /d "%~dp0"

echo.
echo ====================================
echo   ✓ نصب با موفقیت تکمیل شد!
echo ====================================
echo.
echo 📋 مراحل بعدی:
echo.
echo 1. MongoDB را اجرا کنید:
echo    - از Services ویندوز: MongoDB
    - یا دستی: mongod
echo.
echo 2. سپس فایل run-all.bat را اجرا کنید
echo.
echo 3. یا دستی هر سرویس را جداگانه اجرا کنید:
echo    - Backend:  cd backend ^&^& uvicorn server:socket_app --reload
    - Frontend: cd frontend ^&^& yarn start
echo    - Admin:    cd admin ^&^& set PORT=3001 ^&^& yarn start
    - Driver:   cd driver ^&^& set PORT=3002 ^&^& yarn start
echo.
echo 🌐 آدرس‌های دسترسی:
echo    - Backend:  http://localhost:8001
    - Frontend: http://localhost:3000
echo    - Admin:    http://localhost:3001
    - Driver:   http://localhost:3002
echo.
echo برای مشاهده راهنمای کامل: START.md
echo.
pause
