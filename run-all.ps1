# ====================================
# Snabb Taxi System - PowerShell Script
# این اسکریپت پیشرفته همه بخش‌های سیستم را اجرا می‌کند
# ====================================

# تنظیم رنگ‌ها
$Host.UI.RawUI.BackgroundColor = "Black"
$Host.UI.RawUI.ForegroundColor = "Green"
Clear-Host

# نمایش هدر
Write-Host ""
Write-Host "===================================="  -ForegroundColor Cyan
Write-Host "  Snabb Taxi System - اجرای کامل"  -ForegroundColor Yellow
Write-Host "===================================="  -ForegroundColor Cyan
Write-Host ""

# تابع نمایش پیام موفقیت
function Write-Success {
    param([string]$Message)
    Write-Host "✓ $Message" -ForegroundColor Green
}

# تابع نمایش پیام خطا
function Write-Error-Custom {
    param([string]$Message)
    Write-Host "✗ $Message" -ForegroundColor Red
}

# تابع نمایش پیام اطلاع
function Write-Info {
    param([string]$Message)
    Write-Host "ℹ $Message" -ForegroundColor Yellow
}

# پیدا کردن مسیر پروژه
$ProjectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path

# بررسی MongoDB
Write-Host "[1/5] بررسی MongoDB..." -ForegroundColor Cyan
$mongoProcess = Get-Process -Name "mongod" -ErrorAction SilentlyContinue

if ($mongoProcess) {
    Write-Success "MongoDB در حال اجرا است (PID: $($mongoProcess.Id))"
} else {
    Write-Error-Custom "MongoDB در حال اجرا نیست!"
    Write-Info "لطفا MongoDB را ابتدا اجرا کنید: mongod"
    Write-Host ""
    Read-Host "Enter را فشار دهید تا خارج شوید"
    exit 1
}

Write-Host ""

# بررسی وجود دایرکتوری‌ها
$requiredDirs = @(
    "$ProjectRoot\backend",
    "$ProjectRoot\frontend",
    "$ProjectRoot\admin",
    "$ProjectRoot\driver"
)

foreach ($dir in $requiredDirs) {
    if (-not (Test-Path $dir)) {
        Write-Error-Custom "دایرکتوری یافت نشد: $dir"
        exit 1
    }
}

# راه‌اندازی Backend
Write-Host "[2/5] در حال راه‌اندازی Backend (پورت 8001)..." -ForegroundColor Cyan
$backendPath = Join-Path $ProjectRoot "backend"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$backendPath'; Write-Host 'Backend Server Started' -ForegroundColor Green; uvicorn server:socket_app --host 0.0.0.0 --port 8001 --reload" -WindowStyle Normal
Write-Success "Backend راه‌اندازی شد"
Start-Sleep -Seconds 3

Write-Host ""

# راه‌اندازی Frontend (Passenger)
Write-Host "[3/5] در حال راه‌اندازی Passenger App (پورت 3000)..." -ForegroundColor Cyan
$frontendPath = Join-Path $ProjectRoot "frontend"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$frontendPath'; Write-Host 'Passenger App Started' -ForegroundColor Green; yarn start" -WindowStyle Normal
Write-Success "Passenger App راه‌اندازی شد"
Start-Sleep -Seconds 2

Write-Host ""

# راه‌اندازی Admin Panel
Write-Host "[4/5] در حال راه‌اندازی Admin Panel (پورت 3001)..." -ForegroundColor Cyan
$adminPath = Join-Path $ProjectRoot "admin"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$adminPath'; `$env:PORT='3001'; Write-Host 'Admin Panel Started' -ForegroundColor Green; yarn start" -WindowStyle Normal
Write-Success "Admin Panel راه‌اندازی شد"
Start-Sleep -Seconds 2

Write-Host ""

# راه‌اندازی Driver App
Write-Host "[5/5] در حال راه‌اندازی Driver App (پورت 3002)..." -ForegroundColor Cyan
$driverPath = Join-Path $ProjectRoot "driver"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$driverPath'; `$env:PORT='3002'; Write-Host 'Driver App Started' -ForegroundColor Green; yarn start" -WindowStyle Normal
Write-Success "Driver App راه‌اندازی شد"

Write-Host ""
Write-Host "===================================="  -ForegroundColor Cyan
Write-Host "  ✓ همه سرویس‌ها راه‌اندازی شدند!"  -ForegroundColor Green
Write-Host "===================================="  -ForegroundColor Cyan
Write-Host ""

# نمایش اطلاعات دسترسی
Write-Host "📱 آدرس‌های دسترسی:" -ForegroundColor Yellow
Write-Host ""
Write-Host "  Backend API:     " -NoNewline -ForegroundColor White
Write-Host "http://localhost:8001" -ForegroundColor Cyan
Write-Host "  API Docs:        " -NoNewline -ForegroundColor White
Write-Host "http://localhost:8001/docs" -ForegroundColor Cyan
Write-Host "  Passenger App:   " -NoNewline -ForegroundColor White
Write-Host "http://localhost:3000" -ForegroundColor Cyan
Write-Host "  Admin Panel:     " -NoNewline -ForegroundColor White
Write-Host "http://localhost:3001" -ForegroundColor Cyan
Write-Host "  Driver App:      " -NoNewline -ForegroundColor White
Write-Host "http://localhost:3002" -ForegroundColor Cyan
Write-Host ""

# نمایش اطلاعات ورود
Write-Host "🔐 اطلاعات ورود مدیر:" -ForegroundColor Yellow
Write-Host "  Email:    " -NoNewline -ForegroundColor White
Write-Host "admin@snabb.ir" -ForegroundColor Cyan
Write-Host "  Password: " -NoNewline -ForegroundColor White
Write-Host "admin123" -ForegroundColor Cyan
Write-Host ""

Write-Host "📝 کد OTP تستی: " -NoNewline -ForegroundColor Yellow
Write-Host "1234" -ForegroundColor Cyan

Write-Host "📞 شماره تستی Driver: " -NoNewline -ForegroundColor Yellow
Write-Host "+93799123456" -NoNewline -ForegroundColor Cyan
Write-Host " (OTP: " -NoNewline -ForegroundColor White
Write-Host "123456" -NoNewline -ForegroundColor Cyan
Write-Host ")" -ForegroundColor White

Write-Host ""
Write-Info "برای بستن این پنجره، Enter را فشار دهید."
Write-Info "(سرویس‌ها در پنجره‌های جداگانه اجرا می‌شوند)"
Write-Host ""

Read-Host "Press Enter to exit"
