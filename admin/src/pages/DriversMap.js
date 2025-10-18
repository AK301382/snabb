import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import api from '../api';

// Fix Leaflet default icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const DriversMap = () => {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mapReady, setMapReady] = useState(false);
  const mapRef = useRef(null);

  useEffect(() => {
    fetchActiveDrivers();
    const interval = setInterval(fetchActiveDrivers, 10000); // Refresh every 10s
    return () => clearInterval(interval);
  }, []);

  const fetchActiveDrivers = async () => {
    try {
      const response = await api.get('/admin/drivers/active');
      const driversWithLocation = response.data.filter(d => d.current_location);
      setDrivers(driversWithLocation);
      setLoading(false);
      if (!mapReady) setMapReady(true);
    } catch (error) {
      console.error('Error fetching drivers:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12">در حال بارگذاری...</div>;
  }

  const center = drivers.length > 0
    ? [drivers[0].current_location.lat, drivers[0].current_location.lng]
    : [35.6892, 51.3890]; // Tehran default

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">نقشه رانندگان فعال</h1>
        <div className="text-sm text-gray-600">
          {drivers.length} راننده فعال
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200" style={{ height: '600px', direction: 'ltr' }}>
        {mapReady && (
          <MapContainer
            key="drivers-map"
            ref={mapRef}
            center={center}
            zoom={12}
            style={{ height: '100%', width: '100%', borderRadius: '8px' }}
            scrollWheelZoom={true}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {drivers.map((driver) => (
              <Marker
                key={driver.id}
                position={[driver.current_location.lat, driver.current_location.lng]}
              >
                <Popup>
                  <div style={{ direction: 'rtl', textAlign: 'right' }}>
                    <strong>{driver.name}</strong><br />
                    {driver.phone}<br />
                    {driver.car_model && `ماشین: ${driver.car_model}`}
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        )}
      </div>
    </div>
  );
};

export default DriversMap;
