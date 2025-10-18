# راهنمای تست Firebase Phone Authentication

## ✅ پیاده‌سازی کامل شده است

سیستم ورود با شماره موبایل و OTP از طریق Firebase Authentication به صورت کامل پیاده‌سازی شده است.

## 🔧 کانفیگ Firebase

کانفیگ Firebase در فایل `/app/driver/src/firebase.js` ثبت شده است:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyBqWEmIIngkoEjiAUKAcT3rvQGtsvCj3qc",
  authDomain: "snabb-82415.firebaseapp.com",
  projectId: "snabb-82415",
  storageBucket: "snabb-82415.firebasestorage.app",
  messagingSenderId: "1006448447805",
  appId: "1:1006448447805:web:c58b45899bcd67aa5d7554",
  measurementId: "G-V2JM77CH43"
};
```

## 📱 شماره‌های تستی Firebase

| شماره موبایل        | کد تأیید (OTP) |
|---------------------|----------------|
| +93 79 912 3456     | 123456         |
| +93 79 910 1112     | 123456         |
| +93 79 856 7909     | 123456         |

## 🚀 نحوه اجرا و تست

### 1. راه‌اندازی سرور Development

```bash
cd /app/driver
yarn start
```

سرور روی پورت 3002 اجرا می‌شود: `http://localhost:3002`

### 2. ورود به صفحه Login

مرورگر خود را باز کنید و به آدرس زیر بروید:

```
http://localhost:3002/login
```

### 3. مراحل تست ورود با OTP

#### مرحله 1: وارد کردن شماره تلفن

1. یکی از شماره‌های تستی را وارد کنید (مثلاً: `+93799123456`)
2. می‌توانید بدون `+93` هم وارد کنید (مثلاً: `0799123456`)
3. روی دکمه "دریافت کد تأیید" کلیک کنید

#### مرحله 2: تکمیل reCAPTCHA

- اگر reCAPTCHA به صورت invisible کار کند، OTP به صورت خودکار ارسال می‌شود
- اگر reCAPTCHA ظاهر شود، تیک "I'm not a robot" را بزنید

#### مرحله 3: وارد کردن کد OTP

1. بعد از ارسال موفق، فیلد 6 رقمی برای کد تأیید ظاهر می‌شود
2. کد `123456` را وارد کنید
3. روی دکمه "تأیید و ورود" کلیک کنید

#### مرحله 4: ورود موفق

- بعد از تأیید OTP، به صفحه اصلی Dashboard منتقل می‌شوید
- اطلاعات کاربر در localStorage ذخیره می‌شود
- Firebase Authentication session فعال می‌شود

## 🔍 بررسی وضعیت در Developer Console

برای دیدن لاگ‌های Firebase و debug:

1. کلیک راست → Inspect → Console
2. مشاهده پیام‌های Firebase:
   - "reCAPTCHA solved" - reCAPTCHA با موفقیت حل شد
   - "Error sending OTP" - خطا در ارسال OTP
   - "Error verifying OTP" - خطا در تأیید OTP

## 📂 فایل‌های پیاده‌سازی شده

### 1. `/app/driver/src/firebase.js`
- کانفیگ Firebase
- Initialize Firebase App
- Export Firebase Auth

### 2. `/app/driver/src/context/AuthContext.js`
- پیاده‌سازی کامل Firebase Phone Authentication
- `sendOTP()` - ارسال OTP
- `verifyOTP()` - تأیید OTP
- `logout()` - خروج از سیستم
- مدیریت state کاربر با `onAuthStateChanged`

### 3. `/app/driver/src/pages/Login.js`
- UI صفحه ورود
- دو مرحله: ورود شماره تلفن و تأیید OTP
- `<div id="recaptcha-container">` برای reCAPTCHA
- مدیریت خطاها و loading states

## ⚙️ ویژگی‌های پیاده‌سازی شده

✅ Firebase Phone Authentication با SDK جدید  
✅ Invisible reCAPTCHA  
✅ فرمت خودکار شماره تلفن (اضافه کردن +93)  
✅ مدیریت خطاها و نمایش پیام‌های فارسی  
✅ ذخیره session در localStorage  
✅ Auto-login بعد از refresh صفحه  
✅ پشتیبانی از شماره‌های تستی Firebase  
✅ تأیید کد 6 رقمی OTP  

## 🐛 رفع مشکلات احتمالی

### مشکل 1: reCAPTCHA مسدود می‌شود

**علت**: Firebase reCAPTCHA در محیط localhost گاهی مسدود می‌شود

**راه حل**:
- مطمئن شوید که دامنه `localhost` در Firebase Console ثبت شده است
- یا از دامنه‌های مجاز Firebase استفاده کنید: `snabb-82415.web.app`

### مشکل 2: OTP ارسال نمی‌شود

**علت**: مشکل در کانفیگ Firebase یا محدودیت نرخ

**راه حل**:
- بررسی کنید که API Key صحیح است
- مطمئن شوید که Firebase project فعال است
- از شماره‌های تستی Firebase استفاده کنید

### مشکل 3: کد OTP نادرست است

**علت**: کد وارد شده با کد Firebase مطابقت ندارد

**راه حل**:
- برای شماره‌های تستی Firebase، حتماً `123456` را وارد کنید
- برای شماره‌های واقعی، کد دریافتی از SMS را وارد کنید

## 📱 استفاده در Production

برای استفاده در محیط production:

1. **اضافه کردن دامنه به Firebase Console**:
   - Settings → Authorized domains
   - اضافه کردن دامنه production

2. **غیرفعال کردن شماره‌های تستی**:
   - Authentication → Phone → Test phone numbers
   - حذف یا غیرفعال کردن شماره‌های تست

3. **تنظیم rate limiting**:
   - بررسی quota و rate limits در Firebase Console

## 📊 وضعیت کنونی

✅ پیاده‌سازی Firebase Auth: **کامل**  
✅ صفحه Login: **کامل**  
✅ Context Provider: **کامل**  
✅ reCAPTCHA Integration: **کامل**  
✅ آماده برای تست دستی: **بله**  

## 🎯 مرحله بعد

بعد از تأیید موفقیت‌آمیز ورود با Firebase در نسخه وب Driver App:
- می‌توان همین منطق را در اپلیکیشن موبایل (React Native) پیاده‌سازی کرد
- می‌توان همین سیستم را برای اپلیکیشن Passenger نیز استفاده کرد
