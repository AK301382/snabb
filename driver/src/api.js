import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Auth APIs
export const login = (phone) => api.post('/auth/login', { phone, role: 'driver' });
export const verifyOTP = (phone, otp) => api.post('/auth/verify', { phone, otp });

// Driver Profile APIs
export const getDriverProfile = (driverId) => api.get(`/driver/${driverId}/profile`);
export const updateDriverProfile = (driverId, data) => api.put(`/driver/${driverId}/profile`, data);
export const updateDriverLocation = (driverId, lat, lng) => 
  api.put(`/driver/${driverId}/location`, { user_id: driverId, lat, lng });

// Trip APIs
export const getNearbyRequests = (driverId) => api.get(`/driver/${driverId}/nearby-requests`);
export const acceptTrip = (driverId, tripId) => api.post(`/driver/${driverId}/accept-trip/${tripId}`);
export const rejectTrip = (driverId, tripId) => api.post(`/driver/${driverId}/reject-trip/${tripId}`);
export const updateTripStatus = (driverId, tripId, status) => 
  api.put(`/driver/${driverId}/trip/${tripId}/status`, null, { params: { status } });
export const getDriverTrips = (driverId, status = null) => 
  api.get(`/driver/${driverId}/trips`, { params: { status } });

// Financial APIs
export const getDriverFinances = (driverId) => api.get(`/driver/${driverId}/finances`);
export const getEarningSummary = (driverId, period = 'today') => 
  api.get(`/driver/${driverId}/earnings-summary`, { params: { period } });
export const getCommissionHistory = (driverId) => api.get(`/driver/${driverId}/commission-history`);

export default api;
