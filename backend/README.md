# Snabb Taxi System - Backend

## 🚀 Overview
FastAPI backend for Snabb Taxi System with real-time WebSocket support, MongoDB database, and comprehensive REST API.

## 📦 Tech Stack
- **Framework:** FastAPI 0.110.1
- **Database:** MongoDB (Motor async driver)
- **WebSocket:** python-socketio 5.14.2
- **Authentication:** Mock OTP system (for testing)
- **Language:** Python 3.11+

## 🏗️ Architecture

### Collections
1. **users** - Stores admin, driver, and passenger data
2. **trips** - Stores all trip information and history
3. **notifications** - Stores system notifications

### Key Features
- ✅ Mock OTP authentication system
- ✅ Real-time location tracking via WebSocket
- ✅ Trip lifecycle management (pending → accepted → in_progress → completed)
- ✅ Admin dashboard with statistics
- ✅ Driver trip management
- ✅ Passenger ride requests
- ✅ Notification system
- ✅ Persian (Farsi) API responses

## 📚 API Documentation
See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for complete API reference.

## 🔧 Setup & Installation

### Install Dependencies
```bash
cd /app/backend
pip install -r requirements.txt
```

### Environment Variables
Create `.env` file:
```env
MONGO_URL=mongodb://localhost:27017
DB_NAME=snabb_taxi
CORS_ORIGINS=*
```

### Run Server
```bash
# Development
uvicorn server:app --reload --host 0.0.0.0 --port 8001

# Production (with WebSocket)
uvicorn server:socket_app --host 0.0.0.0 --port 8001
```

## 🧪 Testing

### Health Check
```bash
curl http://localhost:8001/api/health
```

### Test Authentication
```bash
# Step 1: Login (get OTP)
curl -X POST http://localhost:8001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"phone": "09121234567", "role": "driver"}'

# Response: {"success": true, "message": "کد تأیید: 1234"}

# Step 2: Verify OTP
curl -X POST http://localhost:8001/api/auth/verify \
  -H "Content-Type: application/json" \
  -d '{"phone": "09121234567", "otp": "1234"}'

# Response: User object with token
```

### Test Admin Login
```bash
curl -X POST "http://localhost:8001/api/auth/admin/login?email=admin@snabb.ir&password=admin123"
```

**Default Admin Credentials:**
- Email: `admin@snabb.ir`
- Password: `admin123`

### Test Admin Stats
```bash
curl http://localhost:8001/api/admin/stats
```

## 🔐 Authentication System

### Mock OTP Flow
1. User sends phone number + role to `/api/auth/login`
2. System returns OTP code: `1234` (fixed for testing)
3. User sends phone + OTP to `/api/auth/verify`
4. System returns user object + authentication token

**Note:** In production, integrate real SMS service like Kavenegar.

## 🌐 WebSocket Events

### Connect to WebSocket
```javascript
import io from 'socket.io-client';

const socket = io('http://localhost:8001');

socket.on('connect', () => {
  console.log('Connected to WebSocket');
});
```

### Driver Location Updates
```javascript
// Send location
socket.emit('location_update', {
  driver_id: 'uuid',
  lat: 35.6892,
  lng: 51.3890
});

// Receive location updates
socket.on('driver_location_uuid', (location) => {
  console.log('Driver location:', location);
});
```

### Trip Notifications
```javascript
// Driver: Listen for new trip requests
socket.on('new_trip_request', (trip) => {
  console.log('New trip request:', trip);
});

// Passenger: Listen for trip acceptance
socket.on('trip_accepted_passenger_uuid', (data) => {
  console.log('Trip accepted by:', data.driver);
});

// Passenger: Listen for trip status updates
socket.on('trip_status_passenger_uuid', (data) => {
  console.log('Trip status:', data.status);
});
```

## 💰 Pricing Logic
```python
base_fare = 20  # افغانی - کرایه پایه
per_km = 10     # افغانی - هر کیلومتر
total_price = base_fare + (distance_km * per_km)
# مثال: برای 5 کیلومتر = 20 + (5 * 10) = 70 افغانی
```

## 📊 Database Schema

### Users Collection
```json
{
  "id": "uuid",
  "phone": "09121234567",
  "name": "علی محمدی",
  "role": "driver",
  "is_active": true,
  "current_location": {"lat": 35.6892, "lng": 51.3890},
  "car_model": "پژو 206",
  "car_plate": "12ج345-67",
  "created_at": "ISO timestamp"
}
```

### Trips Collection
```json
{
  "id": "uuid",
  "passenger_id": "uuid",
  "passenger_name": "محمد حسینی",
  "driver_id": "uuid",
  "driver_name": "علی محمدی",
  "driver_car_model": "پژو 206",
  "origin": {"lat": 35.6892, "lng": 51.3890, "address": "..."},
  "destination": {"lat": 35.7219, "lng": 51.4050, "address": "..."},
  "price": 45000,
  "status": "pending",
  "distance_km": 8.5,
  "duration_minutes": 21,
  "created_at": "ISO timestamp"
}
```

### Notifications Collection
```json
{
  "id": "uuid",
  "user_id": "uuid",
  "role": "driver",
  "message": "پیام اطلاع‌رسانی",
  "created_at": "ISO timestamp",
  "is_read": false
}
```

## 🛣️ API Endpoints Summary

### Authentication
- `POST /api/auth/login` - Send phone and get OTP
- `POST /api/auth/verify` - Verify OTP and login
- `POST /api/auth/admin/login` - Admin login

### Admin
- `GET /api/admin/stats` - Dashboard statistics
- `GET /api/admin/users` - Get all users
- `POST /api/admin/users` - Create user
- `PUT /api/admin/users/{id}` - Update user
- `DELETE /api/admin/users/{id}` - Delete user
- `GET /api/admin/trips` - Get all trips
- `GET /api/admin/drivers/active` - Get active drivers
- `POST /api/admin/notifications` - Send notification

### Driver
- `GET /api/driver/{id}/profile` - Get profile
- `PUT /api/driver/{id}/profile` - Update profile
- `PUT /api/driver/{id}/location` - Update location
- `GET /api/driver/{id}/nearby-requests` - Get nearby requests
- `POST /api/driver/{id}/accept-trip/{trip_id}` - Accept trip
- `POST /api/driver/{id}/reject-trip/{trip_id}` - Reject trip
- `PUT /api/driver/{id}/trip/{trip_id}/status` - Update trip status
- `GET /api/driver/{id}/trips` - Get trip history

### Passenger
- `GET /api/passenger/{id}/profile` - Get profile
- `PUT /api/passenger/{id}/profile` - Update profile
- `POST /api/passenger/{id}/request-ride` - Request ride
- `GET /api/passenger/{id}/active-trip` - Get active trip
- `GET /api/passenger/{id}/trips` - Get trip history
- `DELETE /api/passenger/{id}/trip/{trip_id}` - Cancel trip

### Notifications
- `GET /api/notifications/{user_id}` - Get user notifications

## 🔒 Security Considerations

### For Production
1. **Replace Mock OTP** with real SMS service (Kavenegar)
2. **Implement JWT** token validation
3. **Add Rate Limiting** to prevent abuse
4. **Restrict CORS** origins
5. **Use HTTPS** only
6. **Add Input Validation** and sanitization
7. **Implement Proper Error Handling**
8. **Add Logging and Monitoring**

## 📝 Code Structure
```
/app/backend/
├── server.py              # Main FastAPI application
├── requirements.txt       # Python dependencies
├── .env                   # Environment variables
├── API_DOCUMENTATION.md   # Complete API docs
└── README.md             # This file
```

## 🚀 Production Deployment

### Using Supervisor (Current Setup)
The backend runs via supervisor on port 8001:
```bash
sudo supervisorctl restart backend
sudo supervisorctl status backend
```

### Logs
```bash
# View logs
tail -f /var/log/supervisor/backend.*.log

# Error logs
tail -f /var/log/supervisor/backend.err.log

# Output logs
tail -f /var/log/supervisor/backend.out.log
```

## 🐛 Troubleshooting

### Server Not Starting
```bash
# Check logs
tail -n 100 /var/log/supervisor/backend.err.log

# Check MongoDB connection
curl http://localhost:8001/api/health
```

### WebSocket Issues
Make sure to use `socket_app` instead of `app`:
```python
# In supervisor config or uvicorn command
uvicorn server:socket_app --host 0.0.0.0 --port 8001
```

### Database Connection
Verify MongoDB is running and MONGO_URL is correct in `.env`:
```bash
# Check MongoDB
curl http://localhost:8001/api/health
```

## 📞 Support
For issues or questions, check:
1. [API Documentation](./API_DOCUMENTATION.md)
2. Backend logs: `/var/log/supervisor/backend.*.log`
3. MongoDB connection status: `GET /api/health`

---

## ✅ Phase 1 Complete
Backend foundation is ready with:
- ✅ All API endpoints implemented
- ✅ WebSocket real-time communication
- ✅ Mock OTP authentication
- ✅ MongoDB integration
- ✅ Persian (Farsi) responses
- ✅ Complete documentation

**Ready for Phase 2: Admin Panel Development** 🚀
