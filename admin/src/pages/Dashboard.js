import React, { useState, useEffect } from 'react';
import { Users as UsersIcon, Car, DollarSign, TrendingUp, MapPin, AlertCircle } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import api from '../api';
import { formatCurrency } from '../utils';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [revenueData, setRevenueData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, revenueRes] = await Promise.all([
        api.get('/admin/dashboard/realtime-stats'),
        api.get('/admin/analytics/revenue?period=daily')
      ]);
      setStats(statsRes.data);
      setRevenueData(revenueRes.data.slice(-7)); // Last 7 days
      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setLoading(false);
    }
  };

  if (loading || !stats) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-snabb"></div>
          <p className="mt-4 text-gray-600">در حال بارگذاری...</p>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'کل کاربران',
      value: stats.total_users,
      icon: UsersIcon,
      color: 'bg-blue-500',
      change: '+12%'
    },
    {
      title: 'رانندگان فعال',
      value: `${stats.active_drivers}/${stats.total_drivers}`,
      icon: Car,
      color: 'bg-green-500',
      change: '+5%'
    },
    {
      title: 'سفرهای در حال انجام',
      value: stats.ongoing_trips,
      icon: MapPin,
      color: 'bg-purple-500',
      change: ''
    },
    {
      title: 'درآمد امروز',
      value: formatCurrency(stats.total_revenue_today),
      icon: DollarSign,
      color: 'bg-snabb',
      change: '+18%'
    }
  ];

  const tripStatusData = [
    { name: 'در انتظار', value: stats.trips_by_status.pending, color: '#FFA500' },
    { name: 'پذیرفته شده', value: stats.trips_by_status.accepted, color: '#3B82F6' },
    { name: 'در حال انجام', value: stats.trips_by_status.in_progress, color: '#8B5CF6' },
    { name: 'تکمیل شده', value: stats.trips_by_status.completed, color: '#10B981' },
    { name: 'لغو شده', value: stats.trips_by_status.cancelled, color: '#EF4444' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">دشبورد</h1>
        <button
          onClick={fetchDashboardData}
          className="px-4 py-2 bg-snabb text-white rounded-lg hover:bg-snabb-dark transition-colors"
        >
          به‌روزرسانی
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</p>
                  {stat.change && (
                    <p className="text-sm text-green-600 mt-2">{stat.change}</p>
                  )}
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className="h-8 w-8 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 mb-4">درآمد هفته گذشته</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip formatter={(value) => formatCurrency(value)} />
              <Line type="monotone" dataKey="revenue" stroke="#00B14F" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Trip Status Pie Chart */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 mb-4">وضعیت سفرها</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={tripStatusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry) => entry.name}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {tripStatusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">رانندگان</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">فعال</span>
              <span className="font-bold text-green-600">{stats.active_drivers}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">غیرفعال</span>
              <span className="font-bold text-gray-600">{stats.inactive_drivers}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">کل</span>
              <span className="font-bold text-gray-900">{stats.total_drivers}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">سفرهای امروز</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">تکمیل شده</span>
              <span className="font-bold text-green-600">{stats.completed_trips_today}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">در حال انجام</span>
              <span className="font-bold text-purple-600">{stats.ongoing_trips}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">درآمد</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">امروز</span>
              <span className="font-bold text-green-600">{formatCurrency(stats.total_revenue_today)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">این هفته</span>
              <span className="font-bold text-green-600">{formatCurrency(stats.total_revenue_week)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
