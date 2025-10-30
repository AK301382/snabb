# 🚀 راهنمای کامل راه‌اندازی پروژه Snabb Taxi System

## 📋 فهرست مطالب
1. [معرفی پروژه](#معرفی-پروژه)
2. [پیش‌نیازها](#پیش‌نیازها)
3. [نصب وابستگی‌ها](#نصب-وابستگیها)
4. [تنظیمات پایگاه داده](#تنظیمات-پایگاه-داده)
5. [راه‌اندازی Backend](#راهاندازی-backend)
6. [راه‌اندازی Frontend (مسافر)](#راهاندازی-frontend-مسافر)
7. [راه‌اندازی Admin Panel](#راهاندازی-admin-panel)
8. [راه‌اندازی Driver App](#راهاندازی-driver-app)
9. [اجرای خودکار با اسکریپت](#اجرای-خودکار-با-اسکریپت)
10. [تست سیستم](#تست-سیستم)
11. [رفع مشکلات](#رفع-مشکلات)

---

## 🎯 معرفی پروژه

**Snabb Taxi System** یک سیستم کامل تاکسی‌یابی آنلاین است که شامل:

### 📦 اجزای سیستم:

1. **Backend (FastAPI + Python)**
   - پورت: `8001`
   - API سرور با WebSocket
   - MongoDB برای ذخیره‌سازی
   
2. **Frontend (اپلیکیشن مسافر - React)**
   - پورت: `3000`
   - رابط کاربری مسافران
   
3. **Admin Panel (پنل مدیریت - React)**
   - پورت: `3001`
   - مدیریت کاربران، سفرها و آمار
   
4. **Driver App (اپلیکیشن راننده - React)**
   - پورت: `3002`
   - رابط کاربری رانندگان

---

## ✅ پیش‌نیازها

### نرم‌افزارهای مورد نیاز:

✔️ **Python 3.11+** - برای Backend  
✔️ **Node.js 18+** - برای Frontend ها  
✔️ **MongoDB 7.0+** - برای پایگاه داده  
✔️ **Yarn** - مدیریت بسته‌های JavaScript  

### بررسی نصب:

```bash
# بررسی Python
python --version
# خروجی باید: Python 3.11.x یا بالاتر

# بررسی Node.js
node --version
# خروجی باید: v18.x.x یا بالاتر

# بررسی MongoDB
mongod --version
# خروجی باید: db version v7.0.x

# بررسی Yarn
yarn --version
# اگر نصب نیست، نصب کنید:
npm install -g yarn
```

---

## 📦 نصب وابستگی‌ها

### 1️⃣ نصب وابستگی‌های Backend (Python)

```bash
cd snabb/backend
pip install -r requirements.txt
```

**نکته:** اگر خطا گرفتید، از virtual environment استفاده کنید:

```bash
# ایجاد virtual environment
python -m venv venv

# فعال کردن (Windows)
venv\Scripts\activate

# نصب وابستگی‌ها
pip install -r requirements.txt
```

### 2️⃣ نصب وابستگی‌های Frontend (مسافر)

```bash
cd snabb/frontend
yarn install
```

### 3️⃣ نصب وابستگی‌های Admin Panel

```bash
cd snabb/admin
yarn install
```

### 4️⃣ نصب وابستگی‌های Driver App

```bash
cd snabb/driver
yarn install
```

---

## 🗄️ تنظیمات پایگاه داده

### راه‌اندازی MongoDB

1. **اطمینان از اجرای MongoDB:**

```bash
# در Windows: باز کردن Services و بررسی MongoDB Service
# یا اجرای دستی:
mongod
```

2. **ایجاد دیتابیس (اختیاری):**

MongoDB به صورت خودکار دیتابیس را ایجاد می‌کند، اما می‌توانید دستی هم ایجاد کنید:

```bash
# اتصال به MongoDB
mongosh

# ایجاد دیتابیس
use snabb_taxi

# بررسی دیتابیس
show dbs
```

### تنظیمات Backend Environment

**فایل:** `snabb/backend/.env`

اگر فایل `.env` وجود ندارد، ایجاد کنید:

```env
MONGO_URL=mongodb://localhost:27017
DB_NAME=snabb_taxi
CORS_ORIGINS=http://localhost:3000,http://localhost:3001,http://localhost:3002
SECRET_KEY=snabb_secret_key_2025_secure_random_string
```

---

## 🔧 راه‌اندازی Backend

### روش 1: اجرای دستی

```bash
cd snabb/backend
uvicorn server:socket_app --host 0.0.0.0 --port 8001 --reload
```

### بررسی عملکرد:

باز کردن مرورگر و رفتن به:
- **API Docs:** http://localhost:8001/docs
- **Health Check:** http://localhost:8001/api/health

خروجی باید باشد:
```json
{"status": "healthy", "database": "connected"}
```

### اطلاعات مدیر پیش‌فرض:
- **ایمیل:** admin@snabb.ir
- **رمز عبور:** admin123

---

## 🎨 راه‌اندازی Frontend (مسافر)

### اجرا:

```bash
cd snabb/frontend
yarn start
```

**آدرس:** http://localhost:3000

### ویژگی‌ها:
- ثبت‌نام و ورود مسافر
- درخواست سفر
- نمایش راننده روی نقشه
- تاریخچه سفرها

---

## 👨‍💼 راه‌اندازی Admin Panel

### اجرا:

```bash
cd snabb/admin
yarn start
```

**آدرس:** http://localhost:3001

### ورود به پنل:
- **ایمیل:** admin@snabb.ir
- **رمز عبور:** admin123

### امکانات:
- مدیریت کاربران (رانندگان و مسافران)
- مشاهده و مدیریت سفرها
- آمار و گزارشات
- مدیریت مالی
- تنظیمات قیمت‌گذاری

---

## 🚗 راه‌اندازی Driver App

### اجرا:

```bash
cd snabb/driver
yarn start
```

**آدرس:** http://localhost:3002

### ورود راننده:

سیستم از **Firebase Phone Authentication** استفاده می‌کند.

#### شماره‌های تستی:

| شماره موبایل | کد تأیید (OTP) |
|--------------|----------------|
| +93 799 123 456 | 123456 |
| +93 799 101 112 | 123456 |
| +93 798 567 909 | 123456 |

**مراحل ورود:**
1. وارد کردن شماره تلفن
2. رد کردن reCAPTCHA (اگر نمایش داده شد)
3. وارد کردن کد OTP: `123456`
4. ورود موفق

### امکانات:
- مشاهده درخواست‌های سفر
- پذیرش یا رد سفر
- به‌روزرسانی موقعیت مکانی
- مدیریت سفرهای فعال
- تاریخچه سفرها
- مشاهده درآمد و کمیسیون

---

## ⚡ اجرای خودکار با اسکریپت

### روش 1: استفاده از اسکریپت Batch (ساده‌تر)

فایل `run-all.bat` را اجرا کنید:

```bash
# کلیک دوبار روی فایل run-all.bat
# یا از CMD:
run-all.bat
```

### روش 2: استفاده از PowerShell (پیشرفته‌تر)

```powershell
# اجرای اسکریپت PowerShell:
powershell -ExecutionPolicy Bypass -File .\run-all.ps1
```

### توضیح اسکریپت‌ها:

**Batch Script (run-all.bat):**
- اسکریپت ساده برای ویندوز
- 4 پنجره CMD جداگانه باز می‌کند
- هر پنجره یک سرویس را اجرا می‌کند

**PowerShell Script (run-all.ps1):**
- قابلیت‌های بیشتر
- رنگی و زیباتر
- بررسی پیش‌نیازها
- لاگ‌گیری بهتر

---

## 🧪 تست سیستم

### 1️⃣ تست Backend

```bash
# Health Check
curl http://localhost:8001/api/health

# Admin Stats
curl http://localhost:8001/api/admin/stats

# Test Login (OTP همیشه 1234 است)
curl -X POST http://localhost:8001/api/auth/login -H "Content-Type: application/json" -d "{\"phone\": \"09121234567\", \"role\": \"passenger\"}"
```

### 2️⃣ تست Frontend

1. باز کردن http://localhost:3000
2. ثبت‌نام با شماره تلفن (کد OTP: `1234`)
3. درخواست سفر
4. مشاهده نقشه

### 3️⃣ تست Admin Panel

1. باز کردن http://localhost:3001
2. ورود با:
   - ایمیل: `admin@snabb.ir`
   - رمز: `admin123`
3. مشاهده داشبورد
4. مدیریت کاربران

### 4️⃣ تست Driver App

1. باز کردن http://localhost:3002
2. ورود با شماره تستی: `+93799123456`
3. وارد کردن OTP: `123456`
4. مشاهده درخواست‌های سفر

---

## 🔥 سناریوی تست کامل

### مرحله 1: راه‌اندازی همه سرویس‌ها

```bash
# اجرای اسکریپت
run-all.bat
```

### مرحله 2: ورود راننده

1. http://localhost:3002 → ورود با `+93799123456` → OTP: `123456`
2. راننده وارد Dashboard می‌شود

### مرحله 3: ورود مسافر و درخواست سفر

1. http://localhost:3000 → ثبت‌نام با `09121234567` → OTP: `1234`
2. انتخاب مبدا و مقصد روی نقشه
3. درخواست سفر

### مرحله 4: راننده سفر را می‌پذیرد

1. راننده درخواست سفر را در Driver App مشاهده می‌کند
2. روی "قبول سفر" کلیک می‌کند
3. مسافر اطلاعات راننده را می‌بیند

### مرحله 5: شروع و اتمام سفر

1. راننده روی "شروع سفر" کلیک می‌کند
2. راننده روی "پایان سفر" کلیک می‌کند
3. سفر تکمیل شده و در تاریخچه ذخیره می‌شود

### مرحله 6: بررسی در Admin Panel

1. http://localhost:3001 → ورود مدیر
2. مشاهده آمار سفرها
3. مشاهده تاریخچه کامل

---

## 🐛 رفع مشکلات

### مشکل 1: MongoDB اجرا نمی‌شود

**علت:** سرویس MongoDB متوقف است

**راه حل:**

```bash
# Windows: باز کردن Services
# جستجوی MongoDB
# کلیک راست → Start

# یا اجرای دستی:
mongod --dbpath C:\data\db
```

---

### مشکل 2: پورت اشغال است

**علت:** پورت قبلاً استفاده می‌شود

**راه حل:**

```bash
# بررسی پروسه روی پورت 8001:
netstat -ano | findstr :8001

# kill کردن پروسه:
taskkill /PID <PID> /F
```

---

### مشکل 3: Backend خطای import می‌دهد

**علت:** وابستگی‌ها نصب نشده‌اند

**راه حل:**

```bash
cd snabb/backend
pip install -r requirements.txt
```

---

### مشکل 4: Frontend build نمی‌شود

**علت:** node_modules ناقص است

**راه حل:**

```bash
cd snabb/frontend
rm -rf node_modules yarn.lock
yarn install
```

---

### مشکل 5: Firebase Authentication کار نمی‌کند

**علت:** reCAPTCHA مسدود شده یا کانفیگ نادرست

**راه حل:**

1. بررسی اتصال اینترنت
2. استفاده از شماره‌های تستی Firebase
3. بررسی کانفیگ Firebase در `driver/src/firebase.js`

---

### مشکل 6: WebSocket متصل نمی‌شود

**علت:** Backend با `app` به جای `socket_app` اجرا شده

**راه حل:**

```bash
# استفاده از socket_app:
uvicorn server:socket_app --host 0.0.0.0 --port 8001
```

---

## 📊 پورت‌های استفاده شده

| سرویس | پورت | آدرس |
|--------|------|------|
| Backend | 8001 | http://localhost:8001 |
| Frontend (Passenger) | 3000 | http://localhost:3000 |
| Admin Panel | 3001 | http://localhost:3001 |
| Driver App | 3002 | http://localhost:3002 |
| MongoDB | 27017 | mongodb://localhost:27017 |

---

## 📚 مستندات اضافی

- **Backend API:** [backend/API_DOCUMENTATION.md](backend/API_DOCUMENTATION.md)
- **Firebase Auth:** [FIREBASE_AUTH_TESTING.md](FIREBASE_AUTH_TESTING.md)
- **Backend README:** [backend/README.md](backend/README.md)

---

## 🎯 نکات مهم

1. ✅ همیشه MongoDB را قبل از Backend اجرا کنید
2. ✅ Backend را قبل از Frontend ها اجرا کنید
3. ✅ کد OTP برای تست همیشه `1234` است
4. ✅ شماره‌های تستی Firebase در [FIREBASE_AUTH_TESTING.md](FIREBASE_AUTH_TESTING.md)
5. ✅ اطلاعات ورود مدیر: `admin@snabb.ir` / `admin123`

---

## 🚀 شروع سریع (Quick Start)

```bash
# 1. اجرای MongoDB (بررسی کنید که در حال اجراست)
mongod

# 2. اجرای همه سرویس‌ها با یک کلیک
run-all.bat

# 3. باز کردن مرورگرها:
# - Passenger: http://localhost:3000
# - Admin: http://localhost:3001
# - Driver: http://localhost:3002
# - API Docs: http://localhost:8001/docs
```

---

## 📞 پشتیبانی

اگر مشکلی داشتید:
1. لاگ‌های Backend را بررسی کنید
2. Console مرورگر را چک کنید (F12)
3. MongoDB را بررسی کنید
4. پورت‌ها را چک کنید که اشغال نباشند

---

## 🎉 موفق باشید!

حالا شما یک سیستم تاکسی‌یابی کامل دارید که روی سیستم لوکال شما اجرا می‌شود!

**لذت ببرید! 🚀🚕**
