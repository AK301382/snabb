import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState(1); // 1: phone, 2: OTP
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
        setStep(2);
      }
    } catch (err) {
      setError(err.message || 'خطا در ارسال کد');
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
    <div className="min-h-screen bg-gradient-to-br from-snabb to-snabbDark flex items-center justify-center p-4">
      {/* Hidden reCAPTCHA container */}
      <div id="recaptcha-container"></div>
      
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">ورود راننده</h1>
          <p className="text-gray-600">سیستم تاکسی اسنپ</p>
        </div>

        {step === 1 ? (
          <form onSubmit={handleSendOTP} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                شماره موبایل خود را وارد کنید
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0798567909"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-snabb focus:border-transparent"
                required
                dir="ltr"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-snabb text-white py-3 rounded-lg font-semibold hover:bg-snabbDark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'در حال ارسال...' : 'دریافت کد تأیید'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOTP} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                کد تأیید (6 رقمی)
              </label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="123456"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-snabb focus:border-transparent text-center text-2xl tracking-widest"
                required
                maxLength="6"
                pattern="[0-9]{6}"
                dir="ltr"
              />
            </div>

            <div className="text-sm text-gray-600 text-center">
              کد به شماره <span className="font-semibold" dir="ltr">{phone}</span> ارسال شد
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-snabb text-white py-3 rounded-lg font-semibold hover:bg-snabbDark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'در حال تأیید...' : 'تأیید و ورود'}
            </button>

            <button
              type="button"
              onClick={() => { setStep(1); setOtp(''); setError(''); }}
              className="w-full text-gray-600 py-2 text-sm hover:text-gray-800 transition-colors"
            >
              تغییر شماره تلفن
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Login;
