import React, { useState } from 'react';
import api from '../api';

const Login = ({ setIsAuthenticated }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await api.post(`/auth/admin/login?email=${email}&password=${password}`);
      
      if (response.data.success) {
        localStorage.setItem('admin_token', response.data.access_token);
        localStorage.setItem('admin_data', JSON.stringify(response.data.admin));
        setIsAuthenticated(true);
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'خطا در ورود. لطفاً دوباره تلاش کنید.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-snabb to-snabb-dark p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <div className="bg-snabb text-white w-20 h-20 rounded-full flex items-center justify-center font-bold text-4xl mx-auto mb-4">
              S
            </div>
            <h1 className="text-3xl font-bold text-gray-900">پنل مدیریت Snabb</h1>
            <p className="text-gray-600 mt-2">ورود به سیستم مدیریت</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ایمیل
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-snabb focus:border-transparent"
                placeholder="admin@snabb.ir"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                رمز عبور
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-snabb focus:border-transparent"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-snabb hover:bg-snabb-dark text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'در حال ورود...' : 'ورود'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-600">
            <p>اطلاعات پیش‌فرض:</p>
            <p className="mt-1">
              <span className="font-mono bg-gray-100 px-2 py-1 rounded">admin@snabb.ir</span>
              {' / '}
              <span className="font-mono bg-gray-100 px-2 py-1 rounded">admin123</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
