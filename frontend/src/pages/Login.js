import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
// import api from '../api'; // Removed - using Firebase auth

const Login = () => {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState(1); // 1: phone, 2: otp
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { sendOTP, verifyOTP } = useAuth();
  const navigate = useNavigate();

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Format phone number for Firebase
      // Since Firebase is configured for Afghanistan region, 
      // just send the number without leading zero
      let formattedPhone = phone.trim().replace(/^0+/, ''); // Remove leading zeros
      
      console.log('Original phone:', phone);
      console.log('Formatted phone (no zero):', formattedPhone);

      const response = await sendOTP(formattedPhone);
      if (response.success) {
        // Continue to step 2
      } else {
        return; // Don't proceed if sendOTP failed
      }
      setStep(2);
    } catch (err) {
      setError(err.message || 'خطا در ارسال کد. لطفا دوباره تلاش کنید.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await verifyOTP(otp);
      navigate('/');
    } catch (err) {
      setError(err.message || 'کد تأیید نادرست است');
    } finally {
      setLoading(false);
    }
    
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-snabb via-green-500 to-green-600 flex items-center justify-center p-4 relative overflow-hidden" dir="rtl">
      {/* Animated Background Circles */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-white opacity-10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-white opacity-10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
      
      {/* Hidden reCAPTCHA container for Firebase */}
      <div id="recaptcha-container"></div>
      
      <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md relative z-10 animate-slideUp">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-snabb to-green-600 rounded-full mb-4 shadow-lg transform transition-all hover:scale-110">
            <span className="text-white text-3xl font-bold">S</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">اسنپ تاکسی</h1>
          <p className="text-gray-600">خوش آمدید</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4 text-sm animate-fadeIn">
            {error}
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handleSendOTP} className="space-y-4 animate-fadeIn">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                شماره موبایل خود را وارد کنید
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0798567909"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-snabb focus:border-transparent transition-all"
                required
                disabled={loading}
                dir="ltr"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-snabb to-green-600 hover:from-green-600 hover:to-snabb text-white font-semibold py-3 rounded-xl transition duration-300 disabled:opacity-50 shadow-lg btn-click transform hover:scale-[1.02]"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin h-5 w-5 ml-2" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  در حال ارسال...
                </span>
              ) : 'ارسال کد تایید'}
            </button>

            <p className="text-xs text-gray-500 text-center mt-4">
              با ورود به اسنپ، شما شرایط و قوانین استفاده از خدمات را می‌پذیرید.
            </p>
          </form>
        ) : (
          <form onSubmit={handleVerifyOTP} className="space-y-4 animate-fadeIn">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                کد تایید (6 رقمی)
              </label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="123456"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-snabb focus:border-transparent text-center text-2xl tracking-widest transition-all"
                required
                maxLength="6"
                pattern="[0-9]{6}"
                disabled={loading}
                autoFocus
                dir="ltr"
              />
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
              <p className="text-sm text-gray-700 text-center">
                کد تایید به شماره <span className="font-bold text-snabb" dir="ltr">{phone}</span> ارسال شد
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-snabb to-green-600 hover:from-green-600 hover:to-snabb text-white font-semibold py-3 rounded-xl transition duration-300 disabled:opacity-50 shadow-lg btn-click transform hover:scale-[1.02]"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin h-5 w-5 ml-2" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  در حال تایید...
                </span>
              ) : 'تایید و ورود'}
            </button>

            <button
              type="button"
              onClick={() => { setStep(1); setOtp(''); setError(''); }}
              className="w-full text-snabb hover:text-green-600 font-medium py-2 transition duration-200 hover:bg-green-50 rounded-xl"
            >
              تغییر شماره موبایل
            </button>

          </form>
        )}
      </div>
    </div>
  );
};

export default Login;
