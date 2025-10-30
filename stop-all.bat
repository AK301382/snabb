@echo off
REM ====================================
REM Snabb Taxi System - Stop All Services
REM این اسکریپت همه سرویس‌های در حال اجرا را متوقف می‌کند
REM ====================================

echo.
echo ====================================
echo   Snabb - توقف همه سرویس‌ها
echo ====================================
echo.

echo [1/4] در حال توقف Backend (پورت 8001)...
for /f "tokens=5" %%a in ('netstat -aon ^| find ":8001" ^| find "LISTENING"') do taskkill /F /PID %%a 2>nul
echo ✓ Backend متوقف شد

echo.
echo [2/4] در حال توقف Frontend (پورت 3000)...
for /f "tokens=5" %%a in ('netstat -aon ^| find ":3000" ^| find "LISTENING"') do taskkill /F /PID %%a 2>nul
echo ✓ Frontend متوقف شد

echo.
echo [3/4] در حال توقف Admin (پورت 3001)...
for /f "tokens=5" %%a in ('netstat -aon ^| find ":3001" ^| find "LISTENING"') do taskkill /F /PID %%a 2>nul
echo ✓ Admin Panel متوقف شد

echo.
echo [4/4] در حال توقف Driver App (پورت 3002)...
for /f "tokens=5" %%a in ('netstat -aon ^| find ":3002" ^| find "LISTENING"') do taskkill /F /PID %%a 2>nul
echo ✓ Driver App متوقف شد

echo.
echo ====================================
echo   ✓ همه سرویس‌ها متوقف شدند
echo ====================================
echo.
pause
