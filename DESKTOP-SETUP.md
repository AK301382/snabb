# 🖥️ راهنمای نصب روی دسکتاپ - Snabb Taxi System

## 📥 مرحله 1: دانلود و استخراج پروژه

### اگر پروژه را از GitHub دارید:
```bash
git clone <repository-url>
cd snabb
```

### اگر فایل ZIP دارید:
1. فایل `snabb.zip` را استخراج کنید
2. پوشه را به یک مکان دلخواه منتقل کنید (مثلاً: `C:\Projects\snabb`)
3. از مسیرهای فارسی یا دارای فاصله خودداری کنید

---

## 🔧 مرحله 2: نصب پیش‌نیازها

قبل از هر چیز این نرم‌افزارها را نصب کنید:

### 1️⃣ Python 3.11 یا بالاتر

**دانلود:**
- 🔗 https://www.python.org/downloads/

**نصب:**
1. فایل نصب را دانلود کنید
2. حتماً گزینه **"Add Python to PATH"** را تیک بزنید ✅
3. Install Now را کلیک کنید

**بررسی نصب:**
```bash
python --version
# باید چیزی شبیه: Python 3.11.x نشان دهد
```

---

### 2️⃣ Node.js 18 یا بالاتر

**دانلود:**
- 🔗 https://nodejs.org/
- نسخه **LTS** (Long Term Support) را انتخاب کنید

**نصب:**
1. فایل نصب را دانلود کنید
2. Next, Next, Install
3. صبر کنید تا نصب کامل شود

**بررسی نصب:**
```bash
node --version
# باید چیزی شبیه: v18.x.x نشان دهد

npm --version
# باید نسخه npm را نشان دهد
```

---

### 3️⃣ MongoDB Community Edition

**دانلود:**
- 🔗 https://www.mongodb.com/try/download/community
- یا MongoDB Compass (رابط گرافیکی): https://www.mongodb.com/try/download/compass

**نصب:**
1. فایل نصب را دانلود کنید
2. نوع نصب: **Complete**
3. حتماً گزینه **"Install MongoDB as a Service"** را تیک بزنید ✅
4. MongoDB Compass را هم می‌توانید نصب کنید (اختیاری)

**بررسی نصب:**
```bash
mongod --version
# باید نسخه MongoDB را نشان دهد
```

**اجرای MongoDB:**
```bash
# روش 1: از Services ویندوز
- Win + R → services.msc
- پیدا کردن MongoDB Server
- کلیک راست → Start

# روش 2: از CMD (اگر service نصب نکردید)
mongod --dbpath C:\data\db
```

---

### 4️⃣ Yarn (مدیریت بسته‌های JavaScript)

**نصب:**
```bash
npm install -g yarn
```

**بررسی نصب:**
```bash
yarn --version
# باید نسخه yarn را نشان دهد
```

---

## ⚡ مرحله 3: نصب خودکار با SETUP.bat

حالا که همه پیش‌نیازها نصب شدند، از اسکریپت خودکار استفاده کنید:

### روش 1: اجرای ساده (توصیه می‌شود)
```bash
# کلیک دوبار روی فایل:
SETUP.bat
```

### روش 2: از CMD
```bash
cd C:\Projects\snabb
SETUP.bat
```

### این اسکریپت چه کار می‌کند؟
1. ✅ بررسی می‌کند Python نصب است یا نه
2. ✅ بررسی می‌کند Node.js نصب است یا نه
3. ✅ بررسی می‌کند MongoDB نصب است یا نه
4. ✅ Yarn را نصب می‌کند (اگر نصب نباشد)
5. ✅ تمام وابستگی‌های Backend را نصب می‌کند
6. ✅ تمام وابستگی‌های Frontend را نصب می‌کند
7. ✅ تمام وابستگی‌های Admin را نصب می‌کند
8. ✅ تمام وابستگی‌های Driver را نصب می‌کند
9. ✅ فایل `.env` را ایجاد می‌کند

**⏱️ زمان تقریبی: 5-10 دقیقه** (بسته به سرعت اینترنت)

---

## 🚀 مرحله 4: اجرا

### قبل از اجرا:
```bash
# مطمئن شوید MongoDB در حال اجراست:
# روش 1: بررسی از Services
services.msc → MongoDB Server → Started

# روش 2: بررسی از CMD
sc query MongoDB

# روش 3: اجرای دستی (اگر service نصب نکردید)
mongod
```

### اجرای خودکار همه سرویس‌ها:
```bash
# کلیک دوبار روی:
run-all.bat
```

یا اجرای PowerShell (پیشرفته‌تر):
```powershell
powershell -ExecutionPolicy Bypass -File .\run-all.ps1
```

### اجرای دستی (در 4 پنجره CMD جداگانه):

**پنجره 1 - Backend:**
```bash
cd C:\Projects\snabb\backend
uvicorn server:socket_app --host 0.0.0.0 --port 8001 --reload
```

**پنجره 2 - Frontend (Passenger):**
```bash
cd C:\Projects\snabb\frontend
yarn start
```

**پنجره 3 - Admin Panel:**
```bash
cd C:\Projects\snabb\admin
set PORT=3001
yarn start
```

**پنجره 4 - Driver App:**
```bash
cd C:\Projects\snabb\driver
set PORT=3002
yarn start
```

---

## 🌐 مرحله 5: باز کردن مرورگر

بعد از اینکه همه سرویس‌ها بالا آمدند (1-2 دقیقه صبر کنید):

### آدرس‌های دسترسی:

1. **Backend API Documentation:**
   - 🔗 http://localhost:8001/docs
   - مستندات کامل API

2. **Passenger App (مسافر):**
   - 🔗 http://localhost:3000
   - ثبت‌نام با شماره تلفن
   - کد OTP تستی: **1234**

3. **Admin Panel (مدیریت):**
   - 🔗 http://localhost:3001
   - **Email:** admin@snabb.ir
   - **Password:** admin123

4. **Driver App (راننده):**
   - 🔗 http://localhost:3002
   - شماره تستی: **+93799123456**
   - کد OTP: **123456**

---

## 🧪 مرحله 6: تست سیستم

### تست Backend:
```bash
# Health Check
curl http://localhost:8001/api/health

# یا در مرورگر:
http://localhost:8001/api/health
# باید: {"status": "healthy", "database": "connected"}
```

### تست Frontend:
1. باز کردن http://localhost:3000
2. ثبت‌نام با شماره تلفن (مثلاً: 09121234567)
3. وارد کردن OTP: **1234**
4. درخواست سفر

### تست Admin:
1. باز کردن http://localhost:3001
2. ورود با: admin@snabb.ir / admin123
3. مشاهده داشبورد و آمار

### تست Driver:
1. باز کردن http://localhost:3002
2. ورود با: +93799123456
3. وارد کردن OTP: **123456**
4. مشاهده درخواست‌های سفر

---

## 🛑 توقف سرویس‌ها

### روش 1: با اسکریپت
```bash
# کلیک دوبار روی:
stop-all.bat
```

### روش 2: دستی
- بستن پنجره‌های CMD
- یا زدن `Ctrl + C` در هر پنجره

---

## 🐛 رفع مشکلات رایج

### مشکل 1: "Python is not recognized"
**علت:** Python به PATH اضافه نشده

**راه حل:**
1. Python را دوباره نصب کنید
2. حتماً "Add Python to PATH" را تیک بزنید
3. یا دستی به PATH اضافه کنید:
   - Win + R → sysdm.cpl
   - Advanced → Environment Variables
   - Path → Edit → New → C:\Python311\

---

### مشکل 2: "MongoDB connection failed"
**علت:** MongoDB در حال اجرا نیست

**راه حل:**
```bash
# بررسی وضعیت:
sc query MongoDB

# اجرا:
net start MongoDB

# یا از Services:
services.msc → MongoDB → Start
```

---

### مشکل 3: "Port 8001 is already in use"
**علت:** پورت قبلاً استفاده شده

**راه حل:**
```bash
# پیدا کردن process:
netstat -ano | findstr :8001

# Kill کردن:
taskkill /PID <شماره> /F

# یا از stop-all.bat استفاده کنید
```

---

### مشکل 4: "yarn install" خطا می‌دهد
**علت:** مشکل در اتصال اینترنت یا cache

**راه حل:**
```bash
# پاک کردن cache:
yarn cache clean

# حذف node_modules:
rmdir /s /q node_modules

# نصب دوباره:
yarn install
```

---

### مشکل 5: Frontend باز نمی‌شود
**علت:** Backend اجرا نشده یا CORS مشکل دارد

**راه حل:**
1. مطمئن شوید Backend در حال اجراست
2. بررسی کنید http://localhost:8001/api/health کار می‌کند
3. Console مرورگر را چک کنید (F12)

---

## 📁 ساختار پروژه

```
snabb/
├── backend/              # Backend (FastAPI + Python)
│   ├── server.py         # سرور اصلی
│   ├── requirements.txt  # وابستگی‌های Python
│   └── .env              # تنظیمات محیطی
│
├── frontend/             # Frontend مسافر (React)
│   ├── src/
│   ├── public/
│   └── package.json
│
├── admin/                # پنل مدیریت (React)
│   ├── src/
│   └── package.json
│
├── driver/               # اپلیکیشن راننده (React)
│   ├── src/
│   └── package.json
│
├── SETUP.bat             # اسکریپت نصب خودکار ✨
├── run-all.bat           # اجرای همه سرویس‌ها
├── run-all.ps1           # اجرای PowerShell
├── stop-all.bat          # توقف همه سرویس‌ها
├── START.md              # راهنمای کامل
├── QUICK-START.md        # راهنمای سریع
└── DESKTOP-SETUP.md      # این فایل
```

---

## 📚 منابع اضافی

- **راهنمای کامل:** [START.md](START.md)
- **راهنمای سریع:** [QUICK-START.md](QUICK-START.md)
- **توضیح اسکریپت‌ها:** [README-SCRIPTS.md](README-SCRIPTS.md)
- **مستندات API:** [backend/API_DOCUMENTATION.md](backend/API_DOCUMENTATION.md)
- **تست Firebase:** [FIREBASE_AUTH_TESTING.md](FIREBASE_AUTH_TESTING.md)

---

## ✅ چک‌لیست نصب کامل

- [ ] Python 3.11+ نصب شد
- [ ] Node.js 18+ نصب شد
- [ ] MongoDB نصب و اجرا شد
- [ ] Yarn نصب شد
- [ ] SETUP.bat اجرا شد بدون خطا
- [ ] فایل .env در backend ایجاد شد
- [ ] run-all.bat اجرا شد
- [ ] Backend روی http://localhost:8001 بالا آمد
- [ ] Frontend روی http://localhost:3000 بالا آمد
- [ ] Admin روی http://localhost:3001 بالا آمد
- [ ] Driver روی http://localhost:3002 بالا آمد
- [ ] تست ورود Admin موفق بود
- [ ] تست ورود Passenger موفق بود
- [ ] تست ورود Driver موفق بود

---

## 🎯 مراحل کامل به صورت خلاصه:

```bash
# 1. نصب پیش‌نیازها:
- Python 3.11+
- Node.js 18+
- MongoDB
- Yarn (npm install -g yarn)

# 2. استخراج پروژه:
- باز کردن snabb.zip
- انتقال به C:\Projects\snabb

# 3. نصب وابستگی‌ها:
- کلیک دوبار روی SETUP.bat
- صبر کنید تا تکمیل شود (5-10 دقیقه)

# 4. اجرای MongoDB:
- services.msc → MongoDB → Start
- یا: mongod

# 5. اجرای پروژه:
- کلیک دوبار روی run-all.bat
- منتظر بمانید تا همه سرویس‌ها بالا بیایند

# 6. باز کردن مرورگر:
- http://localhost:3000 (Passenger)
- http://localhost:3001 (Admin)
- http://localhost:3002 (Driver)
- http://localhost:8001/docs (API)

# 7. لذت ببرید! 🎉
```

---

## 💡 نکات مهم

1. ✅ همیشه MongoDB را ابتدا اجرا کنید
2. ✅ از مسیرهای انگلیسی استفاده کنید
3. ✅ اتصال اینترنت برای نصب وابستگی‌ها لازم است
4. ✅ پورت‌های 8001, 3000, 3001, 3002 باید آزاد باشند
5. ✅ برای اولین اجرا صبور باشید (ممکن است کمی طول بکشد)

---

## 🆘 نیاز به کمک؟

اگر مشکلی داشتید:
1. 📖 [START.md](START.md) را بخوانید
2. 🐛 بخش "رفع مشکلات" را چک کنید
3. 💻 لاگ‌های Console را بررسی کنید
4. 🔍 پیام خطا را در Google جستجو کنید

---

## 🎉 موفق باشید!

حالا شما یک سیستم تاکسی‌یابی کامل روی دسکتاپ خودتون دارید! 🚀🚕

**لذت ببرید!** 💚
