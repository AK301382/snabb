import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import api from '../api';
import { MapPin, Navigation, DollarSign } from 'lucide-react';

// Fix Leaflet default icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

function LocationMarker({ position, setPosition, label }) {
  useMapEvents({
    click(e) {
      setPosition(e.latlng);
    },
  });

  return position === null ? null : (
    <Marker position={position}>
    </Marker>
  );
}

const RequestRide = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: origin, 2: destination, 3: confirm
  const [origin, setOrigin] = useState(null);
  const [destination, setDestination] = useState(null);
  const [originAddress, setOriginAddress] = useState('');
  const [destinationAddress, setDestinationAddress] = useState('');
  const [estimatedPrice, setEstimatedPrice] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const tehranCenter = [35.6892, 51.3890];

  const calculateDistance = (origin, destination) => {
    if (!origin || !destination) return 0;
    
    const R = 6371; // Earth radius in km
    const dLat = (destination.lat - origin.lat) * Math.PI / 180;
    const dLon = (destination.lng - origin.lng) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(origin.lat * Math.PI / 180) * Math.cos(destination.lat * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    
    return distance;
  };

  const fetchPriceEstimate = async (distance_km) => {
    try {
      const response = await api.post('/estimate-price', { distance_km });
      return response.data.estimated_price;
    } catch (error) {
      console.error('Error fetching price estimate:', error);
      // Fallback calculation if API fails
      return Math.round(20 + (distance_km * 10));
    }
  };

  const handleNextStep = async () => {
    if (step === 1 && origin && originAddress) {
      setStep(2);
    } else if (step === 2 && destination && destinationAddress) {
      setLoading(true);
      const distance = calculateDistance(origin, destination);
      const price = await fetchPriceEstimate(distance);
      setEstimatedPrice(price);
      setLoading(false);
      setStep(3);
    }
  };

  const handleConfirmRide = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await api.post(`/passenger/${user.id}/request-ride`, {
        origin: originAddress,
        destination: destinationAddress,
        origin_location: origin,
        destination_location: destination,
      });

      navigate('/active-trip');
    } catch (err) {
      setError('خطا در ثبت درخواست. لطفا دوباره تلاش کنید.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Header */}
      <div className="bg-snabb text-white p-4 shadow-lg">
        <div className="max-w-4xl mx-auto flex items-center">
          <button
            onClick={() => step > 1 ? setStep(step - 1) : navigate('/')}
            className="ml-4 text-white hover:text-green-100"
          >
            ← بازگشت
          </button>
          <h1 className="text-xl font-bold">درخواست سفر</h1>
        </div>
      </div>

      {error && (
        <div className="max-w-4xl mx-auto mt-4 px-4">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        </div>
      )}

      {/* Step Indicator */}
      <div className="max-w-4xl mx-auto p-4">
        <div className="flex items-center justify-between mb-6">
          <div className={`flex items-center ${step >= 1 ? 'text-snabb' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-snabb text-white' : 'bg-gray-200'}`}>
              1
            </div>
            <span className="mr-2 font-medium">مبدا</span>
          </div>
          <div className="flex-1 h-1 bg-gray-200 mx-2">
            <div className={`h-full ${step >= 2 ? 'bg-snabb' : 'bg-gray-200'}`} style={{width: step >= 2 ? '100%' : '0%', transition: 'width 0.3s'}}></div>
          </div>
          <div className={`flex items-center ${step >= 2 ? 'text-snabb' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-snabb text-white' : 'bg-gray-200'}`}>
              2
            </div>
            <span className="mr-2 font-medium">مقصد</span>
          </div>
          <div className="flex-1 h-1 bg-gray-200 mx-2">
            <div className={`h-full ${step >= 3 ? 'bg-snabb' : 'bg-gray-200'}`} style={{width: step >= 3 ? '100%' : '0%', transition: 'width 0.3s'}}></div>
          </div>
          <div className={`flex items-center ${step >= 3 ? 'text-snabb' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 3 ? 'bg-snabb text-white' : 'bg-gray-200'}`}>
              3
            </div>
            <span className="mr-2 font-medium">تایید</span>
          </div>
        </div>

        {/* Map */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden mb-4" style={{ height: '400px' }}>
          <MapContainer
            center={tehranCenter}
            zoom={12}
            style={{ height: '100%', width: '100%' }}
            scrollWheelZoom={true}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {step === 1 && <LocationMarker position={origin} setPosition={setOrigin} label="مبدا" />}
            {step === 2 && origin && <Marker position={origin} />}
            {step === 2 && <LocationMarker position={destination} setPosition={setDestination} label="مقصد" />}
            {step === 3 && origin && <Marker position={origin} />}
            {step === 3 && destination && <Marker position={destination} />}
          </MapContainer>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg mb-4">
          {step === 1 && 'روی نقشه کلیک کنید تا مبدا را انتخاب کنید'}
          {step === 2 && 'روی نقشه کلیک کنید تا مقصد را انتخاب کنید'}
          {step === 3 && 'جزئیات سفر را بررسی و تایید کنید'}
        </div>

        {/* Address Input */}
        {step === 1 && (
          <div className="bg-white rounded-xl shadow-md p-4 mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              آدرس مبدا
            </label>
            <input
              type="text"
              value={originAddress}
              onChange={(e) => setOriginAddress(e.target.value)}
              placeholder="مثل: میدان آزادی"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-snabb focus:border-transparent"
            />
          </div>
        )}

        {step === 2 && (
          <div className="bg-white rounded-xl shadow-md p-4 mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              آدرس مقصد
            </label>
            <input
              type="text"
              value={destinationAddress}
              onChange={(e) => setDestinationAddress(e.target.value)}
              placeholder="مثل: میدان ولیعصر"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-snabb focus:border-transparent"
            />
          </div>
        )}

        {/* Confirmation Card */}
        {step === 3 && (
          <div className="bg-white rounded-xl shadow-md p-6 mb-4">
            <h3 className="text-lg font-bold mb-4">جزئیات سفر</h3>
            
            <div className="space-y-3">
              <div className="flex items-start">
                <MapPin className="w-5 h-5 text-snabb ml-3 mt-1" />
                <div>
                  <p className="text-sm text-gray-600">مبدا</p>
                  <p className="font-medium">{originAddress}</p>
                </div>
              </div>

              <div className="flex items-start">
                <MapPin className="w-5 h-5 text-red-500 ml-3 mt-1" />
                <div>
                  <p className="text-sm text-gray-600">مقصد</p>
                  <p className="font-medium">{destinationAddress}</p>
                </div>
              </div>

              <div className="flex justify-between items-center pt-4 border-t">
                <span className="text-gray-600">مبلغ تخمینی</span>
                <span className="text-2xl font-bold text-snabb">{estimatedPrice?.toLocaleString()} افغانی</span>
              </div>
            </div>
          </div>
        )}

        {/* Action Button */}
        <button
          onClick={step === 3 ? handleConfirmRide : handleNextStep}
          disabled={(step === 1 && (!origin || !originAddress)) || 
                   (step === 2 && (!destination || !destinationAddress)) ||
                   loading}
          className="w-full bg-snabb hover:bg-green-600 text-white font-semibold py-4 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'در حال ثبت درخواست...' : 
           step === 3 ? 'تایید و درخواست سفر' : 'مرحله بعد'}
        </button>
      </div>
    </div>
  );
};

export default RequestRide;
