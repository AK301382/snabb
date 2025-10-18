import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import { User, Phone, LogOut, Edit2, Save } from 'lucide-react';

const Profile = () => {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSaveProfile = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await api.put(`/passenger/${user.id}/profile`, { name });
      updateUser(response.data);
      setSuccess('پروفایل با موفقیت به‌روزرسانی شد');
      setEditing(false);
    } catch (err) {
      setError('خطا در به‌روزرسانی پروفایل');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    if (window.confirm('آیا مطمئن هستید که می‌خواهید خارج شوید؟')) {
      logout();
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <div className="bg-snabb text-white p-4 shadow-lg">
        <div className="max-w-4xl mx-auto flex items-center">
          <button onClick={() => navigate('/')} className="ml-4 text-white hover:text-green-100">
            ← بازگشت
          </button>
          <h1 className="text-xl font-bold">پروفایل</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
            {success}
          </div>
        )}

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-center mb-6">
            <div className="w-24 h-24 bg-snabb rounded-full flex items-center justify-center text-white text-4xl font-bold">
              {user?.name?.charAt(0) || 'U'}
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                نام و نام خانوادگی
              </label>
              {editing ? (
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-snabb focus:border-transparent"
                />
              ) : (
                <div className="flex items-center">
                  <User className="w-5 h-5 text-gray-600 ml-2" />
                  <span className="text-gray-900">{user?.name || 'نام ثبت نشده'}</span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                شماره موبایل
              </label>
              <div className="flex items-center">
                <Phone className="w-5 h-5 text-gray-600 ml-2" />
                <span className="text-gray-900">{user?.phone}</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">شماره موبایل قابل تغییر نیست</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                نقش
              </label>
              <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                مسافر
              </span>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            {editing ? (
              <>
                <button
                  onClick={handleSaveProfile}
                  disabled={loading || !name}
                  className="w-full bg-snabb hover:bg-green-600 text-white font-semibold py-3 rounded-lg transition duration-200 flex items-center justify-center disabled:opacity-50"
                >
                  <Save className="w-5 h-5 ml-2" />
                  {loading ? 'در حال ذخیره...' : 'ذخیره تغییرات'}
                </button>
                <button
                  onClick={() => {
                    setEditing(false);
                    setName(user?.name || '');
                    setError('');
                    setSuccess('');
                  }}
                  className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-3 rounded-lg transition duration-200"
                >
                  لغو
                </button>
              </>
            ) : (
              <button
                onClick={() => setEditing(true)}
                className="w-full bg-snabb hover:bg-green-600 text-white font-semibold py-3 rounded-lg transition duration-200 flex items-center justify-center"
              >
                <Edit2 className="w-5 h-5 ml-2" />
                ویرایش پروفایل
              </button>
            )}
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-3 rounded-lg transition duration-200 flex items-center justify-center"
        >
          <LogOut className="w-5 h-5 ml-2" />
          خروج از حساب
        </button>
      </div>
    </div>
  );
};

export default Profile;
