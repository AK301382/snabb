import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import { MapPin, Clock, DollarSign, Calendar } from 'lucide-react';

const TripHistory = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchTripHistory();
  }, [user]);

  const fetchTripHistory = async () => {
    if (!user) return;
    
    try {
      const response = await api.get(`/passenger/${user.id}/trips`);
      setTrips(response.data);
    } catch (error) {
      console.error('Error fetching trip history:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      completed: 'bg-green-100 text-green-700',
      cancelled: 'bg-red-100 text-red-700',
      pending: 'bg-yellow-100 text-yellow-700',
      accepted: 'bg-blue-100 text-blue-700',
      in_progress: 'bg-blue-100 text-blue-700',
    };

    const labels = {
      completed: 'انجام شده',
      cancelled: 'لغو شده',
      pending: 'در انتظار',
      accepted: 'پذیرفته شده',
      in_progress: 'در حال انجام',
    };

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${styles[status] || 'bg-gray-100 text-gray-700'}`}>
        {labels[status] || status}
      </span>
    );
  };

  const filteredTrips = trips.filter(trip => {
    if (filter === 'all') return true;
    return trip.status === filter;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-snabb"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <div className="bg-snabb text-white p-4 shadow-lg">
        <div className="max-w-4xl mx-auto flex items-center">
          <button onClick={() => navigate('/')} className="ml-4 text-white hover:text-green-100">
            ← بازگشت
          </button>
          <h1 className="text-xl font-bold">تاریخچه سفرها</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4">
        <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
          <button onClick={() => setFilter('all')} className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition duration-200 ${filter === 'all' ? 'bg-snabb text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}>
            همه ({trips.length})
          </button>
          <button onClick={() => setFilter('completed')} className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition duration-200 ${filter === 'completed' ? 'bg-snabb text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}>
            انجام شده ({trips.filter(t => t.status === 'completed').length})
          </button>
          <button onClick={() => setFilter('cancelled')} className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition duration-200 ${filter === 'cancelled' ? 'bg-snabb text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}>
            لغو شده ({trips.filter(t => t.status === 'cancelled').length})
          </button>
        </div>

        {filteredTrips.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-8 text-center">
            <p className="text-gray-600">هیچ سفری یافت نشد</p>
            <button onClick={() => navigate('/request-ride')} className="mt-4 bg-snabb hover:bg-green-600 text-white font-semibold px-6 py-2 rounded-lg transition duration-200">
              درخواست سفر جدید
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredTrips.map((trip) => (
              <div key={trip.id} className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition duration-200">
                <div className="flex items-center justify-between mb-4">
                  {getStatusBadge(trip.status)}
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-start">
                    <MapPin className="w-5 h-5 text-snabb ml-2 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-gray-900">{trip.origin}</p>
                  </div>

                  <div className="flex items-start">
                    <MapPin className="w-5 h-5 text-red-500 ml-2 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-gray-900">{trip.destination}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="flex items-center text-gray-600">
                    <Clock className="w-4 h-4 ml-1" />
                    <span className="text-sm">{trip.duration_minutes} دقیقه</span>
                    <span className="mx-2">•</span>
                    <span className="text-sm">{trip.distance_km.toFixed(1)} کیلومتر</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-lg font-bold text-snabb">{trip.price.toLocaleString()} افغانی</span>
                  </div>
                </div>

                {trip.driver_name && (
                  <div className="mt-3 pt-3 border-t">
                    <p className="text-sm text-gray-600">راننده: <span className="font-medium text-gray-900">{trip.driver_name}</span></p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TripHistory;
