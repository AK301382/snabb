import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { getDriverFinances, getEarningSummary, getNearbyRequests } from '../api';
import { Wallet, TrendingUp, AlertCircle, Car, Lock } from 'lucide-react';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [finances, setFinances] = useState(null);
  const [todayEarnings, setTodayEarnings] = useState(null);
  const [nearbyTrips, setNearbyTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
    // Refresh data every 30 seconds
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, [user]);

  const loadData = async () => {
    if (!user?.id) return;

    try {
      const [financeRes, earningsRes, tripsRes] = await Promise.all([
        getDriverFinances(user.id),
        getEarningSummary(user.id, 'today'),
        getNearbyRequests(user.id)
      ]);

      setFinances(financeRes.data);
      setTodayEarnings(earningsRes.data);
      setNearbyTrips(tripsRes.data);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-snabb"></div>
      </div>
    );
  }

  // Check if account is locked
  if (finances?.account_locked) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="mb-6">
            <Lock className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">حساب شما قفل شده است</h2>
            <p className="text-gray-600">به دلیل کمیسیون پرداخت نشده، حساب شما قفل شده است.</p>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-red-800 mb-2">کمیسیون معوق:</p>
            <p className="text-3xl font-bold text-red-600">{finances.commission_pending.toLocaleString()} AFN</p>
          </div>

          <div className="space-y-3">
            <p className="text-sm text-gray-600">
              برای باز کردن حساب، لطفاً کمیسیون معوق را پرداخت کرده و با پشتیبانی تماس بگیرید.
            </p>
            <button
              onClick={logout}
              className="w-full bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
            >
              خروج از حساب
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-snabb text-white p-6 shadow-lg">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">خوش آمدید، {user?.name}</h1>
            <p className="text-green-100 text-sm mt-1">داشبورد راننده</p>
          </div>
          <button
            onClick={logout}
            className="bg-white text-snabb px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            خروج
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6">
        {/* Financial Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* Today's Earnings */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-600 font-semibold">درآمد امروز</h3>
              <Wallet className="w-6 h-6 text-snabb" />
            </div>
            <p className="text-3xl font-bold text-gray-800">{todayEarnings?.total_earned?.toLocaleString() || 0}</p>
            <p className="text-sm text-gray-500 mt-2">AFN</p>
            <p className="text-xs text-gray-400 mt-1">{todayEarnings?.trip_count || 0} سفر</p>
          </div>

          {/* Net Earnings Today */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-600 font-semibold">درآمد خالص امروز</h3>
              <TrendingUp className="w-6 h-6 text-green-500" />
            </div>
            <p className="text-3xl font-bold text-gray-800">{todayEarnings?.net_earnings?.toLocaleString() || 0}</p>
            <p className="text-sm text-gray-500 mt-2">AFN</p>
            <p className="text-xs text-gray-400 mt-1">بعد از کسر کمیسیون (20%)</p>
          </div>

          {/* Pending Commission */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-600 font-semibold">کمیسیون معوق</h3>
              <AlertCircle className="w-6 h-6 text-orange-500" />
            </div>
            <p className="text-3xl font-bold text-gray-800">{finances?.commission_pending?.toLocaleString() || 0}</p>
            <p className="text-sm text-gray-500 mt-2">AFN</p>
            {finances?.commission_pending >= 800 && (
              <p className="text-xs text-orange-500 mt-1">⚠️ نزدیک به حد مجاز</p>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <button
            onClick={() => navigate('/trips')}
            className="bg-white rounded-xl shadow-md p-6 text-center hover:shadow-lg transition-shadow"
          >
            <Car className="w-8 h-8 text-snabb mx-auto mb-2" />
            <h3 className="font-semibold text-gray-800">درخواست‌های جدید</h3>
            <p className="text-2xl font-bold text-snabb mt-2">{nearbyTrips.length}</p>
          </button>

          <button
            onClick={() => navigate('/earnings')}
            className="bg-white rounded-xl shadow-md p-6 text-center hover:shadow-lg transition-shadow"
          >
            <Wallet className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <h3 className="font-semibold text-gray-800">درآمد و کمیسیون</h3>
            <p className="text-sm text-gray-500 mt-2">مشاهده جزئیات</p>
          </button>

          <button
            onClick={() => navigate('/history')}
            className="bg-white rounded-xl shadow-md p-6 text-center hover:shadow-lg transition-shadow"
          >
            <TrendingUp className="w-8 h-8 text-blue-500 mx-auto mb-2" />
            <h3 className="font-semibold text-gray-800">تاریخچه سفرها</h3>
            <p className="text-sm text-gray-500 mt-2">مشاهده سوابق</p>
          </button>

          <button
            onClick={() => navigate('/profile')}
            className="bg-white rounded-xl shadow-md p-6 text-center hover:shadow-lg transition-shadow"
          >
            <div className="w-8 h-8 bg-gray-200 rounded-full mx-auto mb-2 flex items-center justify-center">
              <span className="text-gray-600 font-bold">{user?.name?.charAt(0)}</span>
            </div>
            <h3 className="font-semibold text-gray-800">پروفایل من</h3>
            <p className="text-sm text-gray-500 mt-2">مدیریت حساب</p>
          </button>
        </div>

        {/* Overall Financial Summary */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">خلاصه مالی کلی</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-600">کل درآمد</p>
              <p className="text-2xl font-bold text-gray-800">{finances?.total_earnings?.toLocaleString() || 0}</p>
              <p className="text-xs text-gray-500">AFN</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">کل کمیسیون</p>
              <p className="text-2xl font-bold text-orange-600">{finances?.commission_owed?.toLocaleString() || 0}</p>
              <p className="text-xs text-gray-500">AFN</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">کمیسیون پرداخت شده</p>
              <p className="text-2xl font-bold text-green-600">{finances?.commission_paid?.toLocaleString() || 0}</p>
              <p className="text-xs text-gray-500">AFN</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">درآمد خالص</p>
              <p className="text-2xl font-bold text-snabb">{finances?.net_earnings?.toLocaleString() || 0}</p>
              <p className="text-xs text-gray-500">AFN</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
