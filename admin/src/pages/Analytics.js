import React, { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import api from '../api';
import { formatCurrency } from '../utils';

const Analytics = () => {
  const [revenueData, setRevenueData] = useState([]);
  const [driverPerformance, setDriverPerformance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('daily');

  useEffect(() => {
    fetchAnalytics();
  }, [period]);

  const fetchAnalytics = async () => {
    try {
      const [revenueRes, driversRes] = await Promise.all([
        api.get(`/admin/analytics/revenue?period=${period}`),
        api.get('/admin/analytics/drivers')
      ]);
      setRevenueData(revenueRes.data);
      setDriverPerformance(driversRes.data.slice(0, 10)); // Top 10 drivers
      setLoading(false);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12">در حال بارگذاری...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">گزارشات و تحلیل</h1>
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-snabb"
        >
          <option value="daily">روزانه</option>
          <option value="weekly">هفتگی</option>
          <option value="monthly">ماهانه</option>
        </select>
      </div>

      {/* Revenue Chart */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <h3 className="text-lg font-bold text-gray-900 mb-4">نمودار درآمد</h3>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={revenueData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip formatter={(value) => formatCurrency(value)} />
            <Legend />
            <Line type="monotone" dataKey="revenue" name="درآمد" stroke="#00B14F" strokeWidth={2} />
            <Line type="monotone" dataKey="trip_count" name="تعداد سفر" stroke="#3B82F6" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Driver Performance */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <h3 className="text-lg font-bold text-gray-900 mb-4">عملکرد برتر رانندگان</h3>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={driverPerformance}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="driver_name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="completed_trips" name="سفرهای تکمیل شده" fill="#00B14F" />
            <Bar dataKey="cancelled_trips" name="سفرهای لغو شده" fill="#EF4444" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Analytics;
