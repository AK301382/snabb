@echo off
REM ====================================
REM Snabb Taxi System - Windows Batch Script
REM این اسکریپت همه بخش‌های سیستم را به صورت همزمان اجرا می‌کند
REM ====================================

echo.
echo ====================================
echo   Snabb Taxi System - اجرای کامل
echo ====================================
echo.

REM بررسی MongoDB
echo [1/5] بررسی MongoDB...
tasklist /FI "IMAGENAME eq mongod.exe" 2>NUL | find /I /N "mongod.exe">NUL
if "%ERRORLEVEL%"=="0" (
    echo ✓ MongoDB در حال اجرا است
) else (
    echo ✗ MongoDB در حال اجرا نیست!
    echo لطفا MongoDB را ابتدا اجرا کنید:
    echo   mongod
    echo.
    pause
    exit /b 1
)

echo.
echo [2/5] در حال راه‌اندازی Backend (پورت 8001)...
start "Snabb Backend" cmd /k "cd /d %~dp0backend && uvicorn server:socket_app --host 0.0.0.0 --port 8001 --reload"

REM منتظر بمانیم تا Backend آماده شود
timeout /t 3 /nobreak > nul

echo.
echo [3/5] در حال راه‌اندازی Frontend - Passenger (پورت 3000)...
start "Snabb Passenger App" cmd /k "cd /d %~dp0frontend && yarn start"

timeout /t 2 /nobreak > nul

echo.
echo [4/5] در حال راه‌اندازی Admin Panel (پورت 3001)...
start "Snabb Admin Panel" cmd /k "cd /d %~dp0admin && set PORT=3001 && yarn start"

timeout /t 2 /nobreak > nul

echo.
echo [5/5] در حال راه‌اندازی Driver App (پورت 3002)...
start "Snabb Driver App" cmd /k "cd /d %~dp0driver && set PORT=3002 && yarn start"

echo.
echo ====================================
echo   ✓ همه سرویس‌ها راه‌اندازی شدند!
echo ====================================
echo.
echo 📱 آدرس‌های دسترسی:
echo.
echo   Backend API:     http://localhost:8001
echo   API Docs:        http://localhost:8001/docs
echo   Passenger App:   http://localhost:3000
echo   Admin Panel:     http://localhost:3001
echo   Driver App:      http://localhost:3002
echo.
echo 🔐 اطلاعات ورود مدیر:
echo   Email:    admin@snabb.ir
echo   Password: admin123
echo.
echo 📝 کد OTP تستی: 1234
echo 📞 شماره تستی Driver: +93799123456 (OTP: 123456)
echo.
echo برای بستن این پنجره، Enter را فشار دهید.
echo (سرویس‌ها در پنجره‌های جداگانه اجرا می‌شوند)
echo.
pause
