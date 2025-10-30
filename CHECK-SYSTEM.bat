@echo off
REM ====================================
REM Snabb - System Check Script
REM بررسی وضعیت سیستم و پیش‌نیازها
REM ====================================

color 0B
echo.
echo ====================================
echo   Snabb - بررسی سیستم
echo ====================================
echo.

set ERRORS=0

REM بررسی Python
echo [1/6] بررسی Python...
python --version >nul 2>&1
if errorlevel 1 (
    echo   ✗ Python نصب نیست
    set /a ERRORS+=1
) else (
    echo   ✓ Python نصب است
    python --version
)

REM بررسی Node.js
echo.
echo [2/6] بررسی Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo   ✗ Node.js نصب نیست
    set /a ERRORS+=1
) else (
    echo   ✓ Node.js نصب است
    node --version
)

REM بررسی NPM
echo.
echo [3/6] بررسی NPM...
npm --version >nul 2>&1
if errorlevel 1 (
    echo   ✗ NPM نصب نیست
    set /a ERRORS+=1
) else (
    echo   ✓ NPM نصب است
    npm --version
)

REM بررسی Yarn
echo.
echo [4/6] بررسی Yarn...
yarn --version >nul 2>&1
if errorlevel 1 (
    echo   ✗ Yarn نصب نیست
    echo   می‌توانید با این دستور نصب کنید: npm install -g yarn
    set /a ERRORS+=1
) else (
    echo   ✓ Yarn نصب است
    yarn --version
)

REM بررسی MongoDB
echo.
echo [5/6] بررسی MongoDB...
mongod --version >nul 2>&1
if errorlevel 1 (
    echo   ✗ MongoDB نصب نیست
    set /a ERRORS+=1
) else (
    echo   ✓ MongoDB نصب است
    mongod --version | findstr "db version"
)

REM بررسی MongoDB در حال اجراست یا نه
echo.
echo [6/6] بررسی وضعیت MongoDB...
tasklist /FI "IMAGENAME eq mongod.exe" 2>NUL | find /I /N "mongod.exe">NUL
if "%ERRORLEVEL%"=="0" (
    echo   ✓ MongoDB در حال اجرا است
) else (
    echo   ✗ MongoDB در حال اجرا نیست
    echo   برای اجرا: net start MongoDB
    set /a ERRORS+=1
)

REM بررسی پورت‌ها
echo.
echo ====================================
echo   بررسی پورت‌ها
echo ====================================
echo.

echo بررسی پورت 8001 (Backend)...
netstat -ano | findstr :8001 | findstr LISTENING >nul 2>&1
if errorlevel 1 (
    echo   ✓ پورت 8001 آزاد است
) else (
    echo   ✗ پورت 8001 اشغال است
    set /a ERRORS+=1
)

echo بررسی پورت 3000 (Frontend)...
netstat -ano | findstr :3000 | findstr LISTENING >nul 2>&1
if errorlevel 1 (
    echo   ✓ پورت 3000 آزاد است
) else (
    echo   ✗ پورت 3000 اشغال است
    set /a ERRORS+=1
)

echo بررسی پورت 3001 (Admin)...
netstat -ano | findstr :3001 | findstr LISTENING >nul 2>&1
if errorlevel 1 (
    echo   ✓ پورت 3001 آزاد است
) else (
    echo   ✗ پورت 3001 اشغال است
    set /a ERRORS+=1
)

echo بررسی پورت 3002 (Driver)...
netstat -ano | findstr :3002 | findstr LISTENING >nul 2>&1
if errorlevel 1 (
    echo   ✓ پورت 3002 آزاد است
) else (
    echo   ✗ پورت 3002 اشغال است
    set /a ERRORS+=1
)

REM بررسی فایل‌های پروژه
echo.
echo ====================================
echo   بررسی فایل‌های پروژه
echo ====================================
echo.

if exist "%~dp0backend\requirements.txt" (
    echo   ✓ backend/requirements.txt
) else (
    echo   ✗ backend/requirements.txt یافت نشد
    set /a ERRORS+=1
)

if exist "%~dp0frontend\package.json" (
    echo   ✓ frontend/package.json
) else (
    echo   ✗ frontend/package.json یافت نشد
    set /a ERRORS+=1
)

if exist "%~dp0admin\package.json" (
    echo   ✓ admin/package.json
) else (
    echo   ✗ admin/package.json یافت نشد
    set /a ERRORS+=1
)

if exist "%~dp0driver\package.json" (
    echo   ✓ driver/package.json
) else (
    echo   ✗ driver/package.json یافت نشد
    set /a ERRORS+=1
)

REM نتیجه نهایی
echo.
echo ====================================
if %ERRORS%==0 (
    echo   ✓ همه چیز آماده است!
    echo ====================================
    echo.
    echo می‌توانید پروژه را اجرا کنید:
    echo   1. اگر وابستگی‌ها نصب نشده: SETUP.bat
    echo   2. برای اجرا: run-all.bat
) else (
    echo   ✗ تعداد خطاها: %ERRORS%
    echo ====================================
    echo.
    echo لطفاً ابتدا مشکلات را برطرف کنید:
    echo   1. نصب نرم‌افزارهای مورد نیاز
    echo   2. اجرای MongoDB
    echo   3. آزاد کردن پورت‌های اشغال شده
)
echo.
pause
