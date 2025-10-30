# 🚕 Snabb Taxi System

سیستم کامل تاکسی‌یابی آنلاین با React و FastAPI

---

## 📖 راهنماهای موجود

این پروژه شامل چندین راهنمای جامع است:

### برای نصب روی دسکتاپ (توصیه می‌شود):
1. **[DESKTOP-SETUP.md](DESKTOP-SETUP.md)** 📱
   - راهنمای کامل نصب روی ویندوز
   - شامل نصب تمام پیش‌نیازها
   - مراحل گام‌به‌گام
   - **برای اولین بار حتماً این را بخوانید!**

2. **[SETUP.bat](SETUP.bat)** ⚙️
   - اسکریپت نصب خودکار
   - نصب تمام وابستگی‌ها با یک کلیک
   - **اجرا کنید و منتظر بمانید!**

### برای اجرا:
3. **[run-all.bat](run-all.bat)** 🚀
   - اجرای خودکار همه سرویس‌ها
   - **فقط کلیک دوبار!**

4. **[QUICK-START.md](QUICK-START.md)** ⚡
   - راهنمای سریع (5 دقیقه)
   - برای کسانی که عجله دارند

### راهنمای کامل:
5. **[START.md](START.md)** 📚
   - راهنمای جامع با تمام جزئیات
   - توضیحات کامل هر بخش
   - رفع مشکلات

### اطلاعات اضافی:
6. **[README-SCRIPTS.md](README-SCRIPTS.md)** 📝
   - توضیح تمام اسکریپت‌ها
   - تفاوت Batch, PowerShell, Bash

---

## 🎯 شروع سریع (3 مرحله)

```bash
# 1. نصب وابستگی‌ها (یکبار):
SETUP.bat

# 2. اجرای MongoDB:
mongod
# یا از Services ویندوز: MongoDB Server → Start

# 3. اجرای پروژه:
run-all.bat
```

بعد از اجرا، این آدرس‌ها را در مرورگر باز کنید:
- 🎨 **Passenger:** http://localhost:3000
- 👨‍💼 **Admin:** http://localhost:3001 (admin@snabb.ir / admin123)
- 🚗 **Driver:** http://localhost:3002 (+93799123456 / OTP: 123456)
- 🔧 **API Docs:** http://localhost:8001/docs

---

## 📦 ساختار پروژه

```
snabb/
├── backend/              # FastAPI + Python
├── frontend/             # React (Passenger App)
├── admin/                # React (Admin Panel)
├── driver/               # React (Driver App)
│
├── SETUP.bat             # نصب خودکار ⭐
├── run-all.bat           # اجرای خودکار ⭐
├── stop-all.bat          # توقف همه سرویس‌ها
├── CHECK-SYSTEM.bat      # بررسی سیستم
│
├── DESKTOP-SETUP.md      # راهنمای نصب روی دسکتاپ ⭐
├── START.md              # راهنمای کامل
├── QUICK-START.md        # شروع سریع
└── README-SCRIPTS.md     # توضیح اسکریپت‌ها
```

---

## 🔧 پیش‌نیازها

- ✅ Python 3.11+
- ✅ Node.js 18+
- ✅ MongoDB 7.0+
- ✅ Yarn

**نصب خودکار:** همه چیز با `SETUP.bat` نصب می‌شود!

---

## ⚙️ ویژگی‌های سیستم

### 🎨 Frontend (Passenger)
- ثبت‌نام و ورود با OTP
- درخواست سفر
- ردیابی راننده روی نقشه
- تاریخچه سفرها

### 👨‍💼 Admin Panel
- مدیریت کاربران
- مدیریت سفرها
- آمار و گزارشات
- تنظیمات قیمت‌گذاری

### 🚗 Driver App
- ورود با Firebase Phone Auth
- مشاهده درخواست‌های سفر
- پذیرش/رد سفر
- مدیریت سفرهای فعال
- مشاهده درآمد و کمیسیون

### 🔧 Backend
- FastAPI + Python
- MongoDB
- WebSocket (Real-time)
- RESTful API

---

## 🛑 توقف سرویس‌ها

```bash
# کلیک دوبار روی:
stop-all.bat

# یا بستن پنجره‌های CMD
```

---

## 📚 مستندات

- **API Documentation:** [backend/API_DOCUMENTATION.md](backend/API_DOCUMENTATION.md)
- **Firebase Auth:** [FIREBASE_AUTH_TESTING.md](FIREBASE_AUTH_TESTING.md)
- **Backend README:** [backend/README.md](backend/README.md)

---

## 🐛 رفع مشکلات

اگر مشکلی پیش آمد:

1. **بررسی سیستم:**
   ```bash
   CHECK-SYSTEM.bat
   ```

2. **بررسی لاگ‌ها:**
   - Console مرورگر (F12)
   - پنجره‌های CMD

3. **مشکلات رایج:**
   - MongoDB اجرا نشده → `mongod` یا `net start MongoDB`
   - پورت اشغال → `stop-all.bat`
   - خطای import → `SETUP.bat`

4. **راهنمای کامل:**
   - [START.md](START.md) - بخش "رفع مشکلات"
   - [DESKTOP-SETUP.md](DESKTOP-SETUP.md) - بخش "رفع مشکلات رایج"

---

## 💡 نکات مهم

1. ✅ همیشه MongoDB را ابتدا اجرا کنید
2. ✅ از مسیرهای انگلیسی بدون فاصله استفاده کنید
3. ✅ برای اولین اجرا صبور باشید (ممکن است چند دقیقه طول بکشد)
4. ✅ اتصال اینترنت برای نصب وابستگی‌ها لازم است

---

## 🎓 اطلاعات ورود تستی

### Admin Panel:
- **Email:** admin@snabb.ir
- **Password:** admin123

### Passenger App:
- **Phone:** هر شماره‌ای (مثلاً: 09121234567)
- **OTP:** 1234

### Driver App:
- **Phone:** +93799123456
- **OTP:** 123456

---

## 📞 پشتیبانی

برای سوال یا مشکل:
1. راهنماهای موجود را مطالعه کنید
2. بخش رفع مشکلات را چک کنید
3. لاگ‌ها را بررسی کنید

---

## 🚀 شروع کنید!

```bash
# همین الان شروع کنید:
1. SETUP.bat       # نصب
2. mongod          # MongoDB
3. run-all.bat     # اجرا
4. 🎉 لذت ببرید!
```

**موفق باشید! 💚**
