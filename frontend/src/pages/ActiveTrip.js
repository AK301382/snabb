import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import api from '../api';
import { MapPin, Phone, Car, Clock, X, CheckCircle } from 'lucide-react';

// Fix Leaflet default icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const ActiveTrip = () => {
  const { user } = useAuth();
  const { socket } = useSocket();
  const navigate = useNavigate();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [driverLocation, setDriverLocation] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    fetchActiveTrip();
  }, [user]);

  useEffect(() => {
    if (!socket || !user) return;

    // Listen for trip updates
    socket.on(`trip_accepted_${user.id}`, (data) => {
      console.log('Trip accepted:', data);
      fetchActiveTrip();
    });

    socket.on(`trip_status_${user.id}`, (data) => {
      console.log('Trip status update:', data);
      setTrip(prev => ({ ...prev, status: data.status }));
    });

    socket.on(`driver_location_${user.id}`, (data) => {
      console.log('Driver location update:', data);
      setDriverLocation(data.location);
    });

    return () => {
      socket.off(`trip_accepted_${user.id}`);
      socket.off(`trip_status_${user.id}`);
      socket.off(`driver_location_${user.id}`);
    };
  }, [socket, user]);

  const fetchActiveTrip = async () => {
    if (!user) return;
    
    try {
      const response = await api.get(`/passenger/${user.id}/active-trip`);
      if (response.data) {
        setTrip(response.data);
        if (response.data.status === 'completed') {
          // Trip completed, redirect after showing message
          setTimeout(() => {
            navigate('/history');
          }, 3000);
        }
      } else {
        navigate('/');
      }
    } catch (error) {
      console.error('Error fetching active trip:', error);
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelTrip = async () => {
    if (!window.confirm('آیا مطمئن هستید که می‌خواهید سفر را لغو کنید؟')) return;

    setCancelling(true);
    try {
      await api.delete(`/passenger/${user.id}/trip/${trip.id}`);
      navigate('/');
    } catch (error) {
      alert('خطا در لغو سفر. لطفا دوباره تلاش کنید.');
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-snabb"></div>
      </div>
    );
  }

  if (!trip) {
    return null;
  }

  const getStatusColor = () => {
    switch (trip.status) {
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'accepted': return 'bg-blue-100 text-blue-700';
      case 'in_progress': return 'bg-green-100 text-green-700';
      case 'completed': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusText = () => {
    switch (trip.status) {
      case 'pending': return 'در حال جستجوی راننده...';
      case 'accepted': return 'راننده در راه است';
      case 'in_progress': return 'در حال انجام';
      case 'completed': return 'سفر با موفقیت انجام شد!';
      default: return trip.status;
    }
  };

  const mapCenter = trip.origin_location ? 
    [trip.origin_location.lat, trip.origin_location.lng] : 
    [35.6892, 51.3890];

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Header */}
      <div className="bg-snabb text-white p-4 shadow-lg">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <h1 className="text-xl font-bold">سفر فعال</h1>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor()}`}>
            {getStatusText()}
          </span>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 space-y-4">
        {/* Map */}
        {trip.status !== 'completed' && (
          <div className="bg-white rounded-xl shadow-md overflow-hidden" style={{ height: '300px' }}>
            <MapContainer
              center={mapCenter}
              zoom={13}
              style={{ height: '100%', width: '100%' }}
              scrollWheelZoom={false}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {trip.origin_location && (
                <Marker position={[trip.origin_location.lat, trip.origin_location.lng]} />
              )}
              {trip.destination_location && (
                <Marker position={[trip.destination_location.lat, trip.destination_location.lng]} />
              )}
              {driverLocation && (
                <Marker position={[driverLocation.lat, driverLocation.lng]} />
              )}
            </MapContainer>
          </div>
        )}

        {/* Trip Completed Message */}
        {trip.status === 'completed' && (
          <div className="bg-white rounded-xl shadow-md p-8 text-center">
            <CheckCircle className="w-16 h-16 text-snabb mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">سفر با موفقیت انجام شد!</h2>
            <p className="text-gray-600 mb-4">از انتخاب اسنپ متشکریم</p>
            <div className="text-3xl font-bold text-snabb mb-6">{trip.price.toLocaleString()} افغانی</div>
            <button
              onClick={() => navigate('/history')}
              className="bg-snabb hover:bg-green-600 text-white font-semibold px-8 py-3 rounded-lg transition duration-200"
            >
              مشاهده تاریخچه سفرها
            </button>
          </div>
        )}

        {/* Trip Details */}
        {trip.status !== 'completed' && (
          <>
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-bold mb-4">جزئیات سفر</h3>
              
              <div className="space-y-3">
                <div className="flex items-start">
                  <MapPin className="w-5 h-5 text-snabb ml-3 mt-1" />
                  <div>
                    <p className="text-sm text-gray-600">مبدا</p>
                    <p className="font-medium">{trip.origin}</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <MapPin className="w-5 h-5 text-red-500 ml-3 mt-1" />
                  <div>
                    <p className="text-sm text-gray-600">مقصد</p>
                    <p className="font-medium">{trip.destination}</p>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-4 border-t">
                  <span className="text-gray-600">مبلغ</span>
                  <span className="text-2xl font-bold text-snabb">{trip.price.toLocaleString()} افغانی</span>
                </div>
              </div>
            </div>

            {/* Driver Info */}
            {trip.driver_name && (
              <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="text-lg font-bold mb-4">اطلاعات راننده</h3>
                
                <div className="space-y-3">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-snabb rounded-full flex items-center justify-center text-white font-bold text-xl ml-3">
                      {trip.driver_name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-lg">{trip.driver_name}</p>
                      <p className="text-sm text-gray-600 flex items-center">
                        <Phone className="w-4 h-4 ml-1" />
                        {trip.driver_phone}
                      </p>
                    </div>
                  </div>

                  {trip.car_model && (
                    <div className="flex items-center pt-3 border-t">
                      <Car className="w-5 h-5 text-gray-600 ml-2" />
                      <span className="text-gray-700">{trip.car_model}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Waiting State */}
            {trip.status === 'pending' && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-snabb mx-auto mb-4"></div>
                <p className="text-gray-700 font-medium">در حال یافتن راننده مناسب برای شما...</p>
              </div>
            )}

            {/* Cancel Button */}
            {trip.status === 'pending' && (
              <button
                onClick={handleCancelTrip}
                disabled={cancelling}
                className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-3 rounded-lg transition duration-200 flex items-center justify-center disabled:opacity-50"
              >
                <X className="w-5 h-5 ml-2" />
                {cancelling ? 'در حال لغو...' : 'لغو سفر'}
              </button>
            )}

            {/* Back to Home */}
            {trip.status !== 'pending' && (
              <button
                onClick={() => navigate('/')}
                className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-3 rounded-lg transition duration-200"
              >
                بازگشت به خانه
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ActiveTrip;
