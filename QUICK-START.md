# ⚡ راهنمای سریع - Snabb Taxi System

## 🚀 شروع سریع (5 دقیقه)

### پیش‌نیاز: بررسی نصب

```bash
# 1. بررسی Python
python --version
# باید: Python 3.11+ باشد

# 2. بررسی Node.js
node --version
# باید: v18+ باشد

# 3. بررسی Yarn
yarn --version
# اگر نیست: npm install -g yarn

# 4. بررسی MongoDB
mongod --version
# باید نصب باشد
```

---

## 📦 نصب سریع (یکبار اجرا)

### در CMD یا PowerShell:

```bash
# 1. Backend
cd snabb/backend
pip install -r requirements.txt

# 2. Frontend
cd ../frontend
yarn install

# 3. Admin
cd ../admin
yarn install

# 4. Driver
cd ../driver
yarn install
```

---

## ⚡ اجرای سریع

### روش 1: با اسکریپت (توصیه می‌شود)

```bash
# فقط کلیک دوبار روی:
run-all.bat

# یا از CMD:
cd snabb
run-all.bat
```

### روش 2: دستی (در 4 پنجره CMD جداگانه)

**پنجره 1 - Backend:**
```bash
cd snabb/backend
uvicorn server:socket_app --host 0.0.0.0 --port 8001 --reload
```

**پنجره 2 - Passenger:**
```bash
cd snabb/frontend
yarn start
```

**پنجره 3 - Admin:**
```bash
cd snabb/admin
set PORT=3001
yarn start
```

**پنجره 4 - Driver:**
```bash
cd snabb/driver
set PORT=3002
yarn start
```

---

## 🌐 باز کردن مرورگر

بعد از اجرا، این آدرس‌ها را باز کنید:

```
✅ Backend API:    http://localhost:8001/docs
✅ Passenger App:  http://localhost:3000
✅ Admin Panel:    http://localhost:3001
✅ Driver App:     http://localhost:3002
```

---

## 🔐 اطلاعات ورود

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

## 🧪 تست سریع

### 1. تست Backend:
```bash
curl http://localhost:8001/api/health
# باید: {"status": "healthy"}
```

### 2. تست Frontend:
- باز کردن http://localhost:3000
- ورود با شماره
- درخواست سفر

### 3. تست Admin:
- باز کردن http://localhost:3001
- ورود با admin@snabb.ir / admin123
- مشاهده داشبورد

### 4. تست Driver:
- باز کردن http://localhost:3002
- ورود با +93799123456
- مشاهده درخواست‌ها

---

## 🛑 توقف سریع

### با اسکریپت:
```bash
stop-all.bat
```

### دستی:
- بستن پنجره‌های CMD
- یا: Ctrl+C در هر پنجره

---

## ⚠️ مشکلات متداول

### MongoDB نیست:
```bash
# اجرای MongoDB:
mongod

# یا بررسی سرویس در Windows:
services.msc → MongoDB
```

### پورت اشغال است:
```bash
# پیدا کردن و kill کردن:
netstat -ano | findstr :8001
taskkill /PID <شماره> /F
```

### خطای import در Python:
```bash
cd snabb/backend
pip install -r requirements.txt
```

---

## 📚 اطلاعات بیشتر

برای راهنمای کامل:
- [START.md](START.md) - راهنمای کامل و جزئی
- [backend/API_DOCUMENTATION.md](backend/API_DOCUMENTATION.md) - مستندات API
- [FIREBASE_AUTH_TESTING.md](FIREBASE_AUTH_TESTING.md) - راهنمای Firebase

---

## ✅ چک‌لیست شروع

- [ ] MongoDB نصب و در حال اجرا است
- [ ] Python 3.11+ نصب است
- [ ] Node.js 18+ نصب است
- [ ] Yarn نصب است
- [ ] وابستگی‌های Backend نصب شد
- [ ] وابستگی‌های Frontend نصب شد
- [ ] وابستگی‌های Admin نصب شد
- [ ] وابستگی‌های Driver نصب شد
- [ ] `run-all.bat` اجرا شد
- [ ] همه آدرس‌ها در مرورگر باز شد

---

## 🎉 شروع کنید!

```bash
# فقط این را اجرا کنید:
run-all.bat

# و بعد مرورگرها را باز کنید!
```

**موفق باشید! 🚀**
