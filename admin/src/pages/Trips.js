import React, { useState, useEffect } from 'react';
import { Search, Filter } from 'lucide-react';
import api from '../api';
import { formatDate, formatCurrency, getTripStatusLabel, getTripStatusColor } from '../utils';

const Trips = () => {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchTrips();
  }, [statusFilter]);

  const fetchTrips = async () => {
    try {
      const url = statusFilter === 'all' ? '/admin/trips' : `/admin/trips?status=${statusFilter}`;
      const response = await api.get(url);
      setTrips(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching trips:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12">در حال بارگذاری...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">مدیریت سفرها</h1>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-snabb"
          >
            <option value="all">همه وضعیت‌ها</option>
            <option value="pending">در انتظار</option>
            <option value="accepted">پذیرفته شده</option>
            <option value="in_progress">در حال انجام</option>
            <option value="completed">تکمیل شده</option>
            <option value="cancelled">لغو شده</option>
          </select>
          <div className="col-span-3 text-sm text-gray-600 flex items-center">
            مجموع: {trips.length} سفر
          </div>
        </div>
      </div>

      {/* Trips List */}
      <div className="space-y-4">
        {trips.map((trip) => (
          <div key={trip.id} className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-600">مسافر</p>
                <p className="font-semibold text-gray-900">{trip.passenger_name}</p>
                <p className="text-xs text-gray-500">{trip.passenger_phone}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">راننده</p>
                <p className="font-semibold text-gray-900">{trip.driver_name || 'بدون راننده'}</p>
                {trip.driver_phone && <p className="text-xs text-gray-500">{trip.driver_phone}</p>}
              </div>
              <div>
                <p className="text-sm text-gray-600">مبدأ - مقصد</p>
                <p className="text-xs text-gray-700 truncate">{trip.origin.address}</p>
                <p className="text-xs text-gray-700 truncate">↓ {trip.destination.address}</p>
              </div>
              <div className="flex flex-col items-end justify-between">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getTripStatusColor(trip.status)}`}>
                  {getTripStatusLabel(trip.status)}
                </span>
                <div className="text-left">
                  <p className="text-sm font-bold text-snabb">{formatCurrency(trip.price)}</p>
                  <p className="text-xs text-gray-500">{formatDate(trip.created_at)}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Trips;
