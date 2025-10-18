import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import { MapPin, Clock, History, User as UserIcon, LogOut } from 'lucide-react';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTrip, setActiveTrip] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActiveTrip();
  }, [user]);

  const fetchActiveTrip = async () => {
    if (!user) return;
    
    try {
      const response = await api.get(`/passenger/${user.id}/active-trip`);
      setActiveTrip(response.data);
    } catch (error) {
      console.error('Error fetching active trip:', error);
      setActiveTrip(null);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-snabb mx-auto mb-4"></div>
          <p className="text-gray-600">در حال بارگذاری...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100" dir="rtl">
      {/* Header */}
      <div className="bg-gradient-to-r from-snabb via-green-500 to-green-600 text-white p-6 shadow-xl">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-3">
            <div className="animate-fadeIn">
              <h1 className="text-2xl md:text-3xl font-bold">سلام، {user?.name || 'کاربر'}!</h1>
              <p className="text-green-100 mt-1">به اسنپ تاکسی خوش آمدید</p>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-all btn-click"
              title="خروج"
            >
              <LogOut className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 space-y-4 -mt-6">
        {/* Active Trip Card */}
        {activeTrip ? (
          <div className="bg-white rounded-2xl shadow-lg p-6 border-r-4 border-snabb card-hover animate-slideUp">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">سفر فعال شما</h2>
              <span className="px-4 py-2 bg-gradient-to-r from-green-100 to-green-50 text-snabb rounded-full text-sm font-bold shadow-sm animate-pulse">
                {activeTrip.status === 'pending' && 'در انتظار راننده'}
                {activeTrip.status === 'accepted' && 'راننده یافت شد'}
                {activeTrip.status === 'in_progress' && 'در حال انجام'}
              </span>
            </div>

            <div className="space-y-3">
              <div className="flex items-start animate-fadeIn">
                <MapPin className="w-5 h-5 text-snabb ml-3 mt-1 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm text-gray-600">مبدا</p>
                  <p className="font-medium text-gray-900">{activeTrip.origin}</p>
                </div>
              </div>

              <div className="flex items-start animate-fadeIn" style={{animationDelay: '0.1s'}}>
                <MapPin className="w-5 h-5 text-red-500 ml-3 mt-1 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm text-gray-600">مقصد</p>
                  <p className="font-medium text-gray-900">{activeTrip.destination}</p>
                </div>
              </div>

              {activeTrip.driver_name && (
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 rounded-xl mt-4 animate-fadeIn" style={{animationDelay: '0.2s'}}>
                  <p className="text-sm text-gray-600 mb-2">اطلاعات راننده</p>
                  <p className="font-bold text-lg text-gray-900">{activeTrip.driver_name}</p>
                  <p className="text-sm text-gray-600 mt-1">{activeTrip.car_model}</p>
                </div>
              )}

              <div className="flex justify-between items-center pt-4 border-t border-gray-200 animate-fadeIn" style={{animationDelay: '0.3s'}}>
                <span className="text-gray-600 font-medium">مبلغ</span>
                <span className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-snabb to-green-600 bg-clip-text text-transparent">
                  {activeTrip.price.toLocaleString()} افغانی
                </span>
              </div>
            </div>

            <button
              onClick={() => navigate('/active-trip')}
              className="w-full mt-4 bg-gradient-to-r from-snabb to-green-600 hover:from-green-600 hover:to-snabb text-white font-semibold py-3 rounded-xl transition duration-300 shadow-lg btn-click transform hover:scale-[1.02]"
            >
              مشاهده جزئیات سفر
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center card-hover animate-slideUp">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-green-100 to-green-50 rounded-full mb-4 animate-pulse">
              <MapPin className="w-12 h-12 text-snabb" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">آماده سفر هستید؟</h2>
            <p className="text-gray-600 mb-6">سفر خود را با اسنپ راحت و سریع رزرو کنید</p>
            <button
              onClick={() => navigate('/request-ride')}
              className="bg-gradient-to-r from-snabb to-green-600 hover:from-green-600 hover:to-snabb text-white font-bold px-8 py-4 rounded-xl transition duration-300 shadow-lg btn-click transform hover:scale-105 inline-flex items-center"
            >
              <MapPin className="w-5 h-5 ml-2" />
              درخواست سفر
            </button>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4 animate-fadeIn" style={{animationDelay: '0.2s'}}>
          <button
            onClick={() => navigate('/history')}
            className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 text-right card-hover btn-click"
          >
            <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-50 rounded-xl mb-3">
              <History className="w-6 h-6 text-blue-600" />
            </div>
            <p className="font-bold text-gray-900 text-lg">تاریخچه سفرها</p>
            <p className="text-sm text-gray-600 mt-1">مشاهده سفرهای قبلی</p>
          </button>

          <button
            onClick={() => navigate('/profile')}
            className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 text-right card-hover btn-click"
          >
            <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-purple-100 to-purple-50 rounded-xl mb-3">
              <UserIcon className="w-6 h-6 text-purple-600" />
            </div>
            <p className="font-bold text-gray-900 text-lg">پروفایل</p>
            <p className="text-sm text-gray-600 mt-1">ویرایش اطلاعات</p>
          </button>
        </div>

        {/* Info Card */}
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-2xl p-4 animate-fadeIn" style={{animationDelay: '0.3s'}}>
          <div className="flex items-center">
            <Clock className="w-5 h-5 text-blue-600 ml-2 flex-shrink-0" />
            <p className="text-sm text-blue-900">
              خدمات اسنپ تاکسی به صورت شبانه روزی در دسترس شما است
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
