# Snabb Taxi System - Backend API Documentation

## 📚 Overview
Complete REST API documentation for Snabb Taxi System with WebSocket support for real-time communication.

**Base URL:** `http://your-domain.com/api`

**Version:** 1.0.0

---

## 🔐 Authentication

### 1. Login (Mock OTP)
Send phone number to receive OTP code.

**Endpoint:** `POST /api/auth/login`

**Request Body:**
```json
{
  "phone": "09121234567",
  "role": "driver"  // or "passenger"
}
```

**Response:**
```json
{
  "success": true,
  "message": "کد تأیید: 1234",
  "user": null,
  "token": null
}
```

**Note:** For testing, the OTP is always `1234`

---

### 2. Verify OTP
Verify OTP code and get user data with authentication token.

**Endpoint:** `POST /api/auth/verify`

**Request Body:**
```json
{
  "phone": "09121234567",
  "otp": "1234"
}
```

**Response:**
```json
{
  "success": true,
  "message": "ورود موفقیت‌آمیز بود",
  "user": {
    "id": "uuid",
    "phone": "09121234567",
    "name": "کاربر 4567",
    "role": "driver",
    "is_active": true,
    "current_location": null,
    "car_model": null,
    "car_plate": null,
    "created_at": "2025-10-16T11:09:27.740400Z"
  },
  "token": "token_uuid_hash"
}
```

---

### 3. Admin Login
Admin login with email and password.

**Endpoint:** `POST /api/auth/admin/login?email=admin@snabb.ir&password=admin123`

**Default Credentials:**
- Email: `admin@snabb.ir`
- Password: `admin123`

**Response:**
```json
{
  "success": true,
  "message": "ورود مدیر موفقیت‌آمیز بود",
  "user": { /* admin user object */ },
  "token": "admin_token_uuid"
}
```

---

## 👨‍💼 Admin Endpoints

### 1. Get Dashboard Statistics
**Endpoint:** `GET /api/admin/stats`

**Response:**
```json
{
  "total_users": 150,
  "total_drivers": 50,
  "total_passengers": 100,
  "active_drivers": 30,
  "ongoing_trips": 5,
  "completed_trips_today": 45,
  "total_revenue_today": 2500000
}
```

---

### 2. Get All Users
**Endpoint:** `GET /api/admin/users?role=driver`

**Query Parameters:**
- `role` (optional): Filter by role (driver/passenger)

**Response:**
```json
[
  {
    "id": "uuid",
    "phone": "09121234567",
    "name": "علی محمدی",
    "role": "driver",
    "is_active": true,
    "car_model": "پژو 206",
    "car_plate": "12ج345-12",
    "current_location": {"lat": 35.6892, "lng": 51.3890}
  }
]
```

---

### 3. Create User
**Endpoint:** `POST /api/admin/users`

**Request Body:**
```json
{
  "phone": "09129876543",
  "name": "حسن رضایی",
  "role": "driver",
  "car_model": "پژو پارس",
  "car_plate": "23ب456-78"
}
```

---

### 4. Update User
**Endpoint:** `PUT /api/admin/users/{user_id}`

**Request Body:**
```json
{
  "name": "حسین احمدی",
  "is_active": false,
  "car_model": "سمند"
}
```

---

### 5. Delete User
**Endpoint:** `DELETE /api/admin/users/{user_id}`

**Response:**
```json
{
  "success": true,
  "message": "کاربر با موفقیت حذف شد"
}
```

---

### 6. Get All Trips
**Endpoint:** `GET /api/admin/trips?status=completed`

**Query Parameters:**
- `status` (optional): Filter by status (pending/accepted/in_progress/completed/cancelled)

**Response:**
```json
[
  {
    "id": "trip_uuid",
    "passenger_id": "uuid",
    "passenger_name": "محمد حسینی",
    "driver_id": "uuid",
    "driver_name": "علی محمدی",
    "driver_car_model": "پژو 206",
    "origin": {"lat": 35.6892, "lng": 51.3890, "address": "میدان آزادی"},
    "destination": {"lat": 35.7219, "lng": 51.4050, "address": "میدان ولیعصر"},
    "price": 45000,
    "distance_km": 8.5,
    "duration_minutes": 21,
    "status": "completed",
    "created_at": "2025-10-16T10:00:00Z",
    "completed_at": "2025-10-16T10:21:00Z"
  }
]
```

---

### 7. Get Active Drivers
**Endpoint:** `GET /api/admin/drivers/active`

**Response:** Array of active driver objects with current locations.

---

### 8. Send Notification
**Endpoint:** `POST /api/admin/notifications`

**Request Body:**
```json
{
  "user_id": "uuid",  // null for broadcast
  "role": "driver",   // null for all roles
  "message": "پیام مهم سیستمی"
}
```

---

## 🚗 Driver Endpoints

### 1. Get Driver Profile
**Endpoint:** `GET /api/driver/{driver_id}/profile`

**Response:** User object with driver details.

---

### 2. Update Driver Profile
**Endpoint:** `PUT /api/driver/{driver_id}/profile`

**Request Body:**
```json
{
  "name": "علی احمدی",
  "car_model": "پژو پارس",
  "car_plate": "12ج345-67",
  "is_active": true
}
```

---

### 3. Update Driver Location
**Endpoint:** `PUT /api/driver/{driver_id}/location`

**Request Body:**
```json
{
  "user_id": "driver_uuid",
  "lat": 35.6892,
  "lng": 51.3890
}
```

**Response:**
```json
{
  "success": true,
  "message": "موقعیت به‌روزرسانی شد"
}
```

---

### 4. Get Nearby Ride Requests
**Endpoint:** `GET /api/driver/{driver_id}/nearby-requests`

**Response:** Array of pending trip requests near driver location.

---

### 5. Accept Trip
**Endpoint:** `POST /api/driver/{driver_id}/accept-trip/{trip_id}`

**Response:**
```json
{
  "success": true,
  "message": "سفر با موفقیت پذیرفته شد",
  "trip": { /* trip object */ }
}
```

---

### 6. Reject Trip
**Endpoint:** `POST /api/driver/{driver_id}/reject-trip/{trip_id}`

**Response:**
```json
{
  "success": true,
  "message": "سفر رد شد"
}
```

---

### 7. Update Trip Status
**Endpoint:** `PUT /api/driver/{driver_id}/trip/{trip_id}/status?status=in_progress`

**Query Parameters:**
- `status`: New status (in_progress, completed)

**Response:**
```json
{
  "success": true,
  "message": "وضعیت سفر به‌روزرسانی شد",
  "trip": { /* updated trip object */ }
}
```

---

### 8. Get Driver Trip History
**Endpoint:** `GET /api/driver/{driver_id}/trips?status=completed`

**Query Parameters:**
- `status` (optional): Filter by status

**Response:** Array of driver's trips.

---

## 🚕 Passenger Endpoints

### 1. Get Passenger Profile
**Endpoint:** `GET /api/passenger/{passenger_id}/profile`

**Response:** User object with passenger details.

---

### 2. Update Passenger Profile
**Endpoint:** `PUT /api/passenger/{passenger_id}/profile`

**Request Body:**
```json
{
  "name": "محمد رضایی"
}
```

---

### 3. Request Ride
**Endpoint:** `POST /api/passenger/{passenger_id}/request-ride`

**Request Body:**
```json
{
  "passenger_id": "uuid",
  "origin": {
    "lat": 35.6892,
    "lng": 51.3890,
    "address": "میدان آزادی، تهران"
  },
  "destination": {
    "lat": 35.7219,
    "lng": 51.4050,
    "address": "میدان ولیعصر، تهران"
  }
}
```

**Response:** Trip object with calculated price and distance.

---

### 4. Get Active Trip
**Endpoint:** `GET /api/passenger/{passenger_id}/active-trip`

**Response:** Current active trip object or `null` if no active trip.

---

### 5. Get Trip History
**Endpoint:** `GET /api/passenger/{passenger_id}/trips`

**Response:** Array of passenger's trip history.

---

### 6. Cancel Trip
**Endpoint:** `DELETE /api/passenger/{passenger_id}/trip/{trip_id}`

**Response:**
```json
{
  "success": true,
  "message": "سفر لغو شد"
}
```

---

## 🔔 Notification Endpoints

### Get User Notifications
**Endpoint:** `GET /api/notifications/{user_id}`

**Response:** Array of notifications for the user.

---

## 🌐 WebSocket Events

### Connection
Connect to WebSocket server at: `ws://your-domain.com/socket.io/`

### Events

**1. connect**
Triggered when client connects to server.

**2. disconnect**
Triggered when client disconnects.

**3. join_room**
Join a specific room for targeted updates.
```javascript
socket.emit('join_room', { room: 'driver_uuid' });
```

**4. location_update**
Send driver location updates in real-time.
```javascript
socket.emit('location_update', {
  driver_id: 'uuid',
  lat: 35.6892,
  lng: 51.3890
});
```

**5. new_trip_request**
Receive new trip requests (drivers listen to this).
```javascript
socket.on('new_trip_request', (data) => {
  console.log('New trip:', data);
});
```

**6. trip_accepted_{passenger_id}**
Passenger receives notification when trip is accepted.
```javascript
socket.on('trip_accepted_uuid', (data) => {
  console.log('Driver accepted:', data.driver);
});
```

**7. trip_status_{passenger_id}**
Passenger receives trip status updates.
```javascript
socket.on('trip_status_uuid', (data) => {
  console.log('Trip status:', data.status);
});
```

**8. driver_location_{driver_id}**
Receive real-time driver location updates.
```javascript
socket.on('driver_location_uuid', (location) => {
  console.log('Driver at:', location.lat, location.lng);
});
```

**9. notification**
Receive broadcast notifications.
```javascript
socket.on('notification', (data) => {
  console.log('Notification:', data.message);
});
```

---

## 📊 Data Models

### User Model
```json
{
  "id": "uuid",
  "phone": "09121234567",
  "name": "علی محمدی",
  "role": "driver | passenger | admin",
  "is_active": true,
  "current_location": {"lat": 35.6892, "lng": 51.3890},
  "car_model": "پژو 206",
  "car_plate": "12ج345-67",
  "created_at": "2025-10-16T10:00:00Z"
}
```

### Trip Model
```json
{
  "id": "uuid",
  "passenger_id": "uuid",
  "passenger_name": "محمد حسینی",
  "passenger_phone": "09129876543",
  "driver_id": "uuid",
  "driver_name": "علی محمدی",
  "driver_phone": "09121234567",
  "driver_car_model": "پژو 206",
  "origin": {"lat": 35.6892, "lng": 51.3890, "address": "..."},
  "destination": {"lat": 35.7219, "lng": 51.4050, "address": "..."},
  "price": 45000,
  "status": "pending | accepted | in_progress | completed | cancelled",
  "distance_km": 8.5,
  "duration_minutes": 21,
  "created_at": "2025-10-16T10:00:00Z",
  "accepted_at": "2025-10-16T10:02:00Z",
  "started_at": "2025-10-16T10:05:00Z",
  "completed_at": "2025-10-16T10:26:00Z"
}
```

### Notification Model
```json
{
  "id": "uuid",
  "user_id": "uuid",
  "role": "driver | passenger",
  "message": "پیام اطلاع‌رسانی",
  "created_at": "2025-10-16T10:00:00Z",
  "is_read": false
}
```

---

## 💰 Pricing Logic
- **Base Fare:** 20 افغانی (کرایه پایه)
- **Per Kilometer:** 10 افغانی (هر کیلومتر)
- **Formula:** `price = 20 + (distance_km * 10)`
- **مثال:** برای 5 کیلومتر = 20 + (5 × 10) = 70 افغانی

---

## 🧪 Testing

### Test Authentication
```bash
# Login
curl -X POST http://localhost:8001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"phone": "09121234567", "role": "driver"}'

# Verify OTP
curl -X POST http://localhost:8001/api/auth/verify \
  -H "Content-Type: application/json" \
  -d '{"phone": "09121234567", "otp": "1234"}'
```

### Test Admin Stats
```bash
curl http://localhost:8001/api/admin/stats
```

### Test Health Check
```bash
curl http://localhost:8001/api/health
```

---

## 🔒 Security Notes
1. **Mock OTP:** Current implementation uses fixed OTP "1234" for testing
2. **Token Authentication:** Implement proper JWT validation in production
3. **CORS:** Currently allows all origins (`*`) - restrict in production
4. **Rate Limiting:** Add rate limiting to prevent abuse
5. **HTTPS:** Always use HTTPS in production

---

## 📝 Notes
- All API responses are in Persian (Farsi) for user-facing messages
- MongoDB collections are in English for consistency
- WebSocket uses Socket.IO protocol
- All timestamps are in ISO 8601 format (UTC)
- UUIDs are used instead of MongoDB ObjectIDs for JSON serialization

---

## 🚀 Next Steps
After backend completion:
1. **Phase 2:** Build Admin Panel frontend
2. **Phase 3:** Build Driver App frontend
3. **Phase 4:** Build Passenger App frontend
4. **Phase 5:** Integration testing with all three apps
