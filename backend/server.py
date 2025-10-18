"""
Snabb Taxi System - Backend API
FastAPI backend with WebSocket support for real-time location tracking
"""

from fastapi import FastAPI, APIRouter, HTTPException, WebSocket, WebSocketDisconnect, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Dict, Any
from datetime import datetime, timezone, timedelta
from dotenv import load_dotenv
from pathlib import Path
from jose import JWTError, jwt
from passlib.context import CryptContext
import socketio
import logging
import os
import uuid
import random

# ===================== Configuration =====================
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# FastAPI app
app = FastAPI(title="Snabb Taxi System API", version="1.0.0")
api_router = APIRouter(prefix="/api")

# Socket.IO for WebSocket
sio = socketio.AsyncServer(
    async_mode='asgi',
    cors_allowed_origins='*',
    logger=True,
    engineio_logger=True
)
socket_app = socketio.ASGIApp(sio, app)

# Store active WebSocket connections
active_connections: Dict[str, WebSocket] = {}
driver_locations: Dict[str, Dict] = {}  # driver_id: {lat, lng, timestamp}

# JWT Configuration
SECRET_KEY = os.environ.get("SECRET_KEY", "snabb_secret_key_2025_secure_random_string")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 7 days

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()

# ===================== Models =====================

# ----------- User Models -----------
class UserRole:
    ADMIN = "admin"
    DRIVER = "driver"
    PASSENGER = "passenger"

class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    phone: str
    name: str
    role: str  # admin, driver, passenger
    is_active: bool = True
    current_location: Optional[Dict[str, float]] = None  # {lat, lng}
    car_model: Optional[str] = None  # For drivers
    car_plate: Optional[str] = None  # For drivers
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    
class UserCreate(BaseModel):
    phone: str
    name: str
    role: str
    car_model: Optional[str] = None
    car_plate: Optional[str] = None

class UserUpdate(BaseModel):
    name: Optional[str] = None
    is_active: Optional[bool] = None
    car_model: Optional[str] = None
    car_plate: Optional[str] = None
    current_location: Optional[Dict[str, float]] = None

# ----------- Authentication Models -----------
class LoginRequest(BaseModel):
    phone: str
    role: str  # driver or passenger

class OTPVerifyRequest(BaseModel):
    phone: str
    otp: str

class AuthResponse(BaseModel):
    success: bool
    message: str
    user: Optional[User] = None
    token: Optional[str] = None

# ----------- Trip Models -----------
class TripStatus:
    PENDING = "pending"
    ACCEPTED = "accepted"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CANCELLED = "cancelled"

class Trip(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    passenger_id: str
    passenger_name: str
    passenger_phone: str
    driver_id: Optional[str] = None
    driver_name: Optional[str] = None
    driver_phone: Optional[str] = None
    driver_car_model: Optional[str] = None
    origin: Dict[str, Any]  # {lat, lng, address}
    destination: Dict[str, Any]  # {lat, lng, address}
    price: float
    status: str = TripStatus.PENDING
    distance_km: Optional[float] = None
    duration_minutes: Optional[int] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    accepted_at: Optional[datetime] = None
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None

class TripCreate(BaseModel):
    passenger_id: str
    origin: Dict[str, Any]
    destination: Dict[str, Any]

class TripUpdate(BaseModel):
    status: Optional[str] = None
    driver_id: Optional[str] = None

# ----------- Notification Models -----------
class Notification(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: Optional[str] = None  # None means broadcast to all
    role: Optional[str] = None  # None means all roles
    message: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    is_read: bool = False

class NotificationCreate(BaseModel):
    user_id: Optional[str] = None
    role: Optional[str] = None
    message: str

# ----------- Admin Role Models -----------
class AdminRole:
    SUPER_ADMIN = "super_admin"
    SUPPORT_ADMIN = "support_admin"

class Admin(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: str
    password_hash: str
    name: str
    admin_role: str = AdminRole.SUPPORT_ADMIN
    is_active: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# ----------- Activity Log Models -----------
class ActivityLog(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    admin_id: str
    admin_name: str
    action: str  # "create_user", "delete_user", "update_trip", etc.
    target_type: str  # "user", "trip", "notification"
    target_id: Optional[str] = None
    details: Optional[Dict[str, Any]] = None
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ActivityLogCreate(BaseModel):
    admin_id: str
    admin_name: str
    action: str
    target_type: str
    target_id: Optional[str] = None
    details: Optional[Dict[str, Any]] = None

# ----------- System Configuration Models -----------
class PricingConfig(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: "pricing_config")
    base_fare: float = 20  # افغانی - کرایه پایه
    per_km: float = 10     # افغانی per km - هر کیلومتر
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_by: Optional[str] = None

class PricingUpdate(BaseModel):
    base_fare: float
    per_km: float

# ----------- Fare Range Models (جدول نرخ کرایه پویا) -----------
class FareRange(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    min_km: float  # حداقل کیلومتر (شامل)
    max_km: float  # حداکثر کیلومتر (شامل)
    rate_per_km: float  # نرخ هر کیلومتر (افغانی)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class FareRangeCreate(BaseModel):
    min_km: float
    max_km: float
    rate_per_km: float

class FareRangeUpdate(BaseModel):
    min_km: Optional[float] = None
    max_km: Optional[float] = None
    rate_per_km: Optional[float] = None
# ----------- Financial Models -----------
class DriverFinance(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    driver_id: str
    driver_name: str
    driver_phone: str
    total_earnings: float = 0.0  # Total from all completed trips (100%)
    commission_rate: float = 20.0  # Percentage (20%)
    commission_owed: float = 0.0  # Total commission that should be paid
    commission_paid: float = 0.0  # Amount already paid to admin
    commission_pending: float = 0.0  # commission_owed - commission_paid
    net_earnings: float = 0.0  # 80% of total_earnings
    account_locked: bool = False
    debt_limit: float = 1000.0  # AFN
    currency: str = "AFN"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class CommissionPayment(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    driver_id: str
    driver_name: str
    amount: float  # Amount paid in AFN
    payment_method: str = "cash"
    recorded_by: str  # Admin ID
    recorded_by_name: str  # Admin name
    notes: Optional[str] = None
    payment_date: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class CommissionPaymentRequest(BaseModel):
    driver_id: str
    amount: float
    notes: Optional[str] = None

class FinancialSummary(BaseModel):
    total_earnings: float
    commission_owed: float
    commission_paid: float
    commission_pending: float
    net_earnings: float
    account_locked: bool
    currency: str = "AFN"
# ----------- Analytics Models -----------
class AnalyticsRequest(BaseModel):
    period: str  # "daily", "weekly", "monthly"
    start_date: Optional[str] = None
    end_date: Optional[str] = None

class RevenueAnalytics(BaseModel):
    date: str
    revenue: float
    trip_count: int

class DriverPerformance(BaseModel):
    driver_id: str
    driver_name: str
    total_trips: int
    completed_trips: int
    cancelled_trips: int
    total_revenue: float
    completion_rate: float
    avg_rating: Optional[float] = None


# ----------- Response Models -----------
class StatsResponse(BaseModel):
    total_users: int
    total_drivers: int
    total_passengers: int
    active_drivers: int
    ongoing_trips: int
    completed_trips_today: int
    total_revenue_today: float

class LocationUpdate(BaseModel):
    user_id: str
    lat: float
    lng: float


# ===================== JWT & Security Functions =====================

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """Create JWT access token"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_token(token: str) -> Dict[str, Any]:
    """Verify JWT token and return payload"""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        raise HTTPException(status_code=401, detail="توکن نامعتبر است")

async def get_current_admin(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Dependency to get current authenticated admin"""
    token = credentials.credentials
    payload = verify_token(token)
    admin_id = payload.get("sub")
    if not admin_id:
        raise HTTPException(status_code=401, detail="توکن نامعتبر است")
    
    # Get admin from database
    admin = await db.admins.find_one({"id": admin_id}, {"_id": 0})
    if not admin or not admin.get("is_active"):
        raise HTTPException(status_code=401, detail="دسترسی غیرمجاز")
    
    return admin

async def log_admin_activity(admin_id: str, admin_name: str, action: str, target_type: str, target_id: Optional[str] = None, details: Optional[Dict] = None):
    """Log admin activity to database"""
    log = ActivityLog(
        admin_id=admin_id,
        admin_name=admin_name,
        action=action,
        target_type=target_type,
        target_id=target_id,
        details=details
    )
    doc = log.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()
    await db.activity_logs.insert_one(doc)

# ===================== Helper Functions =====================

def serialize_datetime(obj):
    """Convert datetime to ISO string for MongoDB"""
    if isinstance(obj, datetime):
        return obj.isoformat()
    return obj

def deserialize_doc(doc):
    """Convert MongoDB doc with ISO strings back to datetime"""
    if doc and 'created_at' in doc and isinstance(doc['created_at'], str):
        doc['created_at'] = datetime.fromisoformat(doc['created_at'])
    if doc and 'accepted_at' in doc and isinstance(doc['accepted_at'], str):
        doc['accepted_at'] = datetime.fromisoformat(doc['accepted_at'])
    if doc and 'started_at' in doc and isinstance(doc['started_at'], str):
        doc['started_at'] = datetime.fromisoformat(doc['started_at'])
    if doc and 'completed_at' in doc and isinstance(doc['completed_at'], str):
        doc['completed_at'] = datetime.fromisoformat(doc['completed_at'])
    return doc

async def calculate_trip_price(distance_km: float) -> float:
    """
    Calculate trip price based on dynamic fare range table
    محاسبه قیمت سفر بر اساس جدول نرخ کرایه پویا
    """
    # First check if fare ranges exist
    fare_ranges = await db.fare_ranges.find({}, {"_id": 0}).sort("min_km", 1).to_list(100)
    
    if fare_ranges:
        # Use fare range table
        for fare_range in fare_ranges:
            if fare_range['min_km'] <= distance_km <= fare_range['max_km']:
                return distance_km * fare_range['rate_per_km']
        
        # If distance exceeds all ranges, use the last range's rate
        if fare_ranges and distance_km > fare_ranges[-1]['max_km']:
            return distance_km * fare_ranges[-1]['rate_per_km']
    
    # Fallback to old pricing config if no fare ranges exist
    config = await db.pricing_config.find_one({"id": "pricing_config"}, {"_id": 0})
    if not config:
        # Create default config
        default_config = PricingConfig()
        doc = default_config.model_dump()
        doc['updated_at'] = doc['updated_at'].isoformat()
        await db.pricing_config.insert_one(doc)
        base_fare = default_config.base_fare
        per_km = default_config.per_km
    else:
        base_fare = config.get('base_fare', 20)
        per_km = config.get('per_km', 10)
    
    return base_fare + (distance_km * per_km)

async def get_or_create_driver_finance(driver_id: str) -> Dict:
    """Get driver's financial record or create if doesn't exist"""
    finance = await db.driver_finances.find_one({"driver_id": driver_id}, {"_id": 0})
    
    if not finance:
        # Get driver info
        driver = await db.users.find_one({"id": driver_id, "role": UserRole.DRIVER}, {"_id": 0})
        if not driver:
            raise HTTPException(status_code=404, detail="راننده یافت نشد")
        
        # Create new finance record
        new_finance = DriverFinance(
            driver_id=driver_id,
            driver_name=driver.get('name'),
            driver_phone=driver.get('phone')
        )
        doc = new_finance.model_dump()
        doc['created_at'] = doc['created_at'].isoformat()
        doc['updated_at'] = doc['updated_at'].isoformat()
        await db.driver_finances.insert_one(doc)
        finance = doc
    
    return finance

async def update_driver_finances_on_trip_completion(driver_id: str, trip_price: float):
    """Update driver's finances when a trip is completed"""
    # Get or create finance record
    finance = await get_or_create_driver_finance(driver_id)
    
    # Calculate commission (20% of trip price)
    commission_rate = finance.get('commission_rate', 20.0)
    commission_amount = (trip_price * commission_rate) / 100
    net_earning = trip_price - commission_amount
    
    # Update totals
    new_total_earnings = finance.get('total_earnings', 0) + trip_price
    new_commission_owed = finance.get('commission_owed', 0) + commission_amount
    new_commission_pending = new_commission_owed - finance.get('commission_paid', 0)
    new_net_earnings = finance.get('net_earnings', 0) + net_earning
    
    # Check if account should be locked
    debt_limit = finance.get('debt_limit', 1000.0)
    account_locked = new_commission_pending >= debt_limit
    
    # Update database
    await db.driver_finances.update_one(
        {"driver_id": driver_id},
        {
            "$set": {
                "total_earnings": new_total_earnings,
                "commission_owed": new_commission_owed,
                "commission_pending": new_commission_pending,
                "net_earnings": new_net_earnings,
                "account_locked": account_locked,
                "updated_at": datetime.now(timezone.utc).isoformat()
            }
        }
    )
    
    # If account is locked, also lock the user account
    if account_locked:
        await db.users.update_one(
            {"id": driver_id},
            {"$set": {"is_active": False}}
        )
    
    return {
        "commission_amount": commission_amount,
        "net_earning": net_earning,
        "account_locked": account_locked
    }

# ===================== Authentication Routes =====================

@api_router.post("/auth/login", response_model=AuthResponse)
async def login(request: LoginRequest):
    """
    Mock OTP Login - accepts any phone number
    Returns OTP code in response (for testing)
    """
    # Check if user exists
    user_doc = await db.users.find_one({"phone": request.phone, "role": request.role}, {"_id": 0})
    
    if not user_doc:
        # Create new user
        new_user = User(
            phone=request.phone,
            name=f"کاربر {request.phone[-4:]}",
            role=request.role
        )
        doc = new_user.model_dump()
        doc['created_at'] = doc['created_at'].isoformat()
        await db.users.insert_one(doc)
        user_doc = doc
    
    # Generate mock OTP
    mock_otp = "1234"  # Always use 1234 for testing
    
    return AuthResponse(
        success=True,
        message=f"کد تأیید: {mock_otp}",
        user=None,
        token=None
    )

@api_router.post("/auth/verify", response_model=AuthResponse)
async def verify_otp(request: OTPVerifyRequest):
    """
    Verify OTP and return user data with token
    """
    # Mock OTP verification - accept "1234" for any phone
    if request.otp != "1234":
        raise HTTPException(status_code=400, detail="کد تأیید نادرست است")
    
    # Get user
    user_doc = await db.users.find_one({"phone": request.phone}, {"_id": 0})
    if not user_doc:
        raise HTTPException(status_code=404, detail="کاربر یافت نشد")
    
    user_doc = deserialize_doc(user_doc)
    user = User(**user_doc)
    
    # Generate mock token
    token = f"token_{user.id}_{uuid.uuid4().hex[:8]}"
    
    return AuthResponse(
        success=True,
        message="ورود موفقیت‌آمیز بود",
        user=user,
        token=token
    )

@api_router.post("/auth/admin/login")
async def admin_login(email: str, password: str):
    """
    Admin login with email and password (JWT-based)
    """
    # Check if admin exists in admins collection
    admin_doc = await db.admins.find_one({"email": email}, {"_id": 0})
    
    if not admin_doc:
        # Create default super admin if none exists
        if email == "admin@snabb.ir" and password == "admin123":
            password_hash = pwd_context.hash(password)
            admin = Admin(
                email=email,
                password_hash=password_hash,
                name="مدیر ارشد سیستم",
                admin_role=AdminRole.SUPER_ADMIN
            )
            doc = admin.model_dump()
            doc['created_at'] = doc['created_at'].isoformat()
            await db.admins.insert_one(doc)
            admin_doc = doc
        else:
            raise HTTPException(status_code=401, detail="ایمیل یا رمز عبور نادرست است")
    
    # Verify password
    if not pwd_context.verify(password, admin_doc.get('password_hash', '')):
        raise HTTPException(status_code=401, detail="ایمیل یا رمز عبور نادرست است")
    
    # Check if admin is active
    if not admin_doc.get('is_active', True):
        raise HTTPException(status_code=401, detail="حساب کاربری غیرفعال است")
    
    # Create JWT token
    access_token = create_access_token(
        data={"sub": admin_doc['id'], "email": admin_doc['email'], "role": admin_doc['admin_role']}
    )
    
    # Log activity
    await log_admin_activity(
        admin_id=admin_doc['id'],
        admin_name=admin_doc['name'],
        action="login",
        target_type="admin",
        target_id=admin_doc['id']
    )
    
    return {
        "success": True,
        "message": "ورود مدیر موفقیت‌آمیز بود",
        "admin": {
            "id": admin_doc['id'],
            "email": admin_doc['email'],
            "name": admin_doc['name'],
            "admin_role": admin_doc['admin_role']
        },
        "access_token": access_token,
        "token_type": "bearer"
    }

# ===================== Admin Routes =====================

@api_router.get("/admin/stats", response_model=StatsResponse)
async def get_admin_stats():
    """
    Get dashboard statistics for admin panel
    """
    total_users = await db.users.count_documents({})
    total_drivers = await db.users.count_documents({"role": UserRole.DRIVER})
    total_passengers = await db.users.count_documents({"role": UserRole.PASSENGER})
    active_drivers = await db.users.count_documents({"role": UserRole.DRIVER, "is_active": True})
    ongoing_trips = await db.trips.count_documents({"status": {"$in": [TripStatus.PENDING, TripStatus.ACCEPTED, TripStatus.IN_PROGRESS]}})
    
    # Today's completed trips
    today_start = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
    completed_trips_today = await db.trips.count_documents({
        "status": TripStatus.COMPLETED,
        "completed_at": {"$gte": today_start.isoformat()}
    })
    
    # Today's revenue
    completed_trips = await db.trips.find({
        "status": TripStatus.COMPLETED,
        "completed_at": {"$gte": today_start.isoformat()}
    }, {"_id": 0, "price": 1}).to_list(1000)
    
    total_revenue_today = sum(trip.get('price', 0) for trip in completed_trips)
    
    return StatsResponse(
        total_users=total_users,
        total_drivers=total_drivers,
        total_passengers=total_passengers,
        active_drivers=active_drivers,
        ongoing_trips=ongoing_trips,
        completed_trips_today=completed_trips_today,
        total_revenue_today=total_revenue_today
    )

@api_router.get("/admin/users", response_model=List[User])
async def get_all_users(role: Optional[str] = None):
    """
    Get all users, optionally filtered by role
    """
    query = {}
    if role:
        query["role"] = role
    
    users = await db.users.find(query, {"_id": 0}).to_list(1000)
    return [User(**deserialize_doc(u)) for u in users]

@api_router.post("/admin/users", response_model=User)
async def create_user(user: UserCreate):
    """
    Create a new user (driver or passenger)
    """
    new_user = User(**user.model_dump())
    doc = new_user.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.users.insert_one(doc)
    return new_user

@api_router.put("/admin/users/{user_id}", response_model=User)
async def update_user(user_id: str, update: UserUpdate):
    """
    Update user information
    """
    update_data = {k: v for k, v in update.model_dump().items() if v is not None}
    
    if not update_data:
        raise HTTPException(status_code=400, detail="هیچ داده‌ای برای به‌روزرسانی ارسال نشده")
    
    result = await db.users.update_one({"id": user_id}, {"$set": update_data})
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="کاربر یافت نشد")
    
    user_doc = await db.users.find_one({"id": user_id}, {"_id": 0})
    return User(**deserialize_doc(user_doc))

@api_router.delete("/admin/users/{user_id}")
async def delete_user(user_id: str):
    """
    Delete a user
    """
    result = await db.users.delete_one({"id": user_id})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="کاربر یافت نشد")
    
    return {"success": True, "message": "کاربر با موفقیت حذف شد"}

@api_router.get("/admin/trips", response_model=List[Trip])
async def get_all_trips(status: Optional[str] = None):
    """
    Get all trips, optionally filtered by status
    """
    query = {}
    if status:
        query["status"] = status
    
    trips = await db.trips.find(query, {"_id": 0}).sort("created_at", -1).to_list(1000)
    return [Trip(**deserialize_doc(t)) for t in trips]

@api_router.get("/admin/drivers/active")
async def get_active_drivers():
    """
    Get all active drivers with their current locations
    """
    drivers = await db.users.find(
        {"role": UserRole.DRIVER, "is_active": True},
        {"_id": 0}
    ).to_list(1000)
    
    return [deserialize_doc(d) for d in drivers]

@api_router.post("/admin/notifications", response_model=Notification)
async def send_notification(notification: NotificationCreate):
    """
    Send notification to specific user, role, or broadcast to all
    """
    new_notification = Notification(**notification.model_dump())
    doc = new_notification.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.notifications.insert_one(doc)
    
    # Emit via WebSocket
    await sio.emit('notification', {
        'message': notification.message,
        'timestamp': new_notification.created_at.isoformat()
    })
    
    return new_notification


# ===================== Advanced Admin Routes =====================

@api_router.get("/admin/analytics/revenue")
async def get_revenue_analytics(period: str = "daily", admin: dict = Depends(get_current_admin)):
    """
    Get revenue analytics by period (daily, weekly, monthly)
    """
    now = datetime.now(timezone.utc)
    
    if period == "daily":
        # Last 30 days
        start_date = now - timedelta(days=30)
        date_format = "%Y-%m-%d"
    elif period == "weekly":
        # Last 12 weeks
        start_date = now - timedelta(weeks=12)
        date_format = "%Y-W%W"
    else:  # monthly
        # Last 12 months
        start_date = now - timedelta(days=365)
        date_format = "%Y-%m"
    
    # Get completed trips
    completed_trips = await db.trips.find(
        {
            "status": TripStatus.COMPLETED,
            "completed_at": {"$gte": start_date.isoformat()}
        },
        {"_id": 0, "price": 1, "completed_at": 1}
    ).to_list(10000)
    
    # Aggregate by period
    revenue_by_date = {}
    for trip in completed_trips:
        if trip.get('completed_at'):
            trip_date = datetime.fromisoformat(trip['completed_at'])
            date_key = trip_date.strftime(date_format)
            if date_key not in revenue_by_date:
                revenue_by_date[date_key] = {"revenue": 0, "count": 0}
            revenue_by_date[date_key]["revenue"] += trip.get('price', 0)
            revenue_by_date[date_key]["count"] += 1
    
    # Format response
    analytics = [
        {"date": date, "revenue": data["revenue"], "trip_count": data["count"]}
        for date, data in sorted(revenue_by_date.items())
    ]
    
    return analytics

@api_router.get("/admin/analytics/drivers")
async def get_driver_performance(admin: dict = Depends(get_current_admin)):
    """
    Get driver performance metrics
    """
    drivers = await db.users.find({"role": UserRole.DRIVER}, {"_id": 0}).to_list(1000)
    performance_data = []
    
    for driver in drivers:
        driver_id = driver['id']
        
        # Get all trips
        all_trips = await db.trips.find({"driver_id": driver_id}, {"_id": 0}).to_list(1000)
        completed_trips = [t for t in all_trips if t.get('status') == TripStatus.COMPLETED]
        cancelled_trips = [t for t in all_trips if t.get('status') == TripStatus.CANCELLED]
        
        total_revenue = sum(t.get('price', 0) for t in completed_trips)
        completion_rate = (len(completed_trips) / len(all_trips) * 100) if all_trips else 0
        
        performance_data.append({
            "driver_id": driver_id,
            "driver_name": driver.get('name'),
            "total_trips": len(all_trips),
            "completed_trips": len(completed_trips),
            "cancelled_trips": len(cancelled_trips),
            "total_revenue": total_revenue,
            "completion_rate": round(completion_rate, 2),
            "avg_rating": None  # Can be added later
        })
    
    return performance_data

@api_router.get("/admin/trips/advanced")
async def get_trips_advanced(
    status: Optional[str] = None,
    driver_id: Optional[str] = None,
    passenger_id: Optional[str] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    admin: dict = Depends(get_current_admin)
):
    """
    Advanced trip filtering
    """
    query = {}
    
    if status:
        query["status"] = status
    if driver_id:
        query["driver_id"] = driver_id
    if passenger_id:
        query["passenger_id"] = passenger_id
    if start_date:
        query["created_at"] = {"$gte": start_date}
    if end_date:
        if "created_at" not in query:
            query["created_at"] = {}
        query["created_at"]["$lte"] = end_date
    if min_price is not None:
        query["price"] = {"$gte": min_price}
    if max_price is not None:
        if "price" not in query:
            query["price"] = {}
        query["price"]["$lte"] = max_price
    
    trips = await db.trips.find(query, {"_id": 0}).sort("created_at", -1).to_list(1000)
    return [Trip(**deserialize_doc(t)) for t in trips]

@api_router.get("/admin/activity-logs")
async def get_activity_logs(limit: int = 100, admin: dict = Depends(get_current_admin)):
    """
    Get admin activity logs
    """
    logs = await db.activity_logs.find({}, {"_id": 0}).sort("timestamp", -1).limit(limit).to_list(limit)
    return logs

@api_router.get("/admin/pricing-config")
async def get_pricing_config(admin: dict = Depends(get_current_admin)):
    """
    Get current pricing configuration
    """
    config = await db.pricing_config.find_one({"id": "pricing_config"}, {"_id": 0})
    if not config:
        default_config = PricingConfig()
        return default_config.model_dump()
    return config

@api_router.put("/admin/pricing-config")
async def update_pricing_config(pricing: PricingUpdate, admin: dict = Depends(get_current_admin)):
    """
    Update pricing configuration
    """
    update_data = {
        "base_fare": pricing.base_fare,
        "per_km": pricing.per_km,
        "updated_at": datetime.now(timezone.utc).isoformat(),
        "updated_by": admin['id']
    }
    
    await db.pricing_config.update_one(
        {"id": "pricing_config"},
        {"$set": update_data},
        upsert=True
    )
    
    # Log activity
    await log_admin_activity(
        admin_id=admin['id'],
        admin_name=admin['name'],
        action="update_pricing",
        target_type="config",
        target_id="pricing_config",
        details=update_data
    )
    
    return {"success": True, "message": "تنظیمات قیمت‌گذاری به‌روزرسانی شد", "config": update_data}

# ===================== Fare Range Management APIs (جدول نرخ کرایه) =====================

@api_router.get("/admin/fare-ranges", response_model=List[FareRange])
async def get_fare_ranges(admin: dict = Depends(get_current_admin)):
    """
    Get all fare ranges sorted by min_km
    دریافت تمام بازه‌های نرخ کرایه
    """
    fare_ranges = await db.fare_ranges.find({}, {"_id": 0}).sort("min_km", 1).to_list(100)
    return [FareRange(**deserialize_doc(fr)) for fr in fare_ranges]

@api_router.post("/admin/fare-ranges", response_model=FareRange)
async def create_fare_range(fare_range: FareRangeCreate, admin: dict = Depends(get_current_admin)):
    """
    Create a new fare range
    ایجاد بازه نرخ جدید
    """
    # Validate: min_km should be less than max_km
    if fare_range.min_km >= fare_range.max_km:
        raise HTTPException(status_code=400, detail="حداقل کیلومتر باید کمتر از حداکثر باشد")
    
    # Check for overlapping ranges
    existing_ranges = await db.fare_ranges.find({}, {"_id": 0}).to_list(100)
    for existing in existing_ranges:
        # Check if new range overlaps with existing
        if not (fare_range.max_km < existing['min_km'] or fare_range.min_km > existing['max_km']):
            raise HTTPException(
                status_code=400, 
                detail=f"این بازه با بازه موجود ({existing['min_km']}-{existing['max_km']} km) تداخل دارد"
            )
    
    # Create new fare range
    new_range = FareRange(**fare_range.model_dump())
    doc = new_range.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    doc['updated_at'] = doc['updated_at'].isoformat()
    
    await db.fare_ranges.insert_one(doc)
    
    # Log activity
    await log_admin_activity(
        admin_id=admin['id'],
        admin_name=admin['name'],
        action="create_fare_range",
        target_type="fare_range",
        target_id=new_range.id,
        details=fare_range.model_dump()
    )
    
    return new_range

@api_router.put("/admin/fare-ranges/{range_id}", response_model=FareRange)
async def update_fare_range(range_id: str, fare_range: FareRangeUpdate, admin: dict = Depends(get_current_admin)):
    """
    Update an existing fare range
    به‌روزرسانی بازه نرخ
    """
    existing = await db.fare_ranges.find_one({"id": range_id}, {"_id": 0})
    if not existing:
        raise HTTPException(status_code=404, detail="بازه نرخ یافت نشد")
    
    # Prepare update data
    update_data = {}
    if fare_range.min_km is not None:
        update_data['min_km'] = fare_range.min_km
    if fare_range.max_km is not None:
        update_data['max_km'] = fare_range.max_km
    if fare_range.rate_per_km is not None:
        update_data['rate_per_km'] = fare_range.rate_per_km
    
    # Validate updated range
    updated_min = update_data.get('min_km', existing['min_km'])
    updated_max = update_data.get('max_km', existing['max_km'])
    
    if updated_min >= updated_max:
        raise HTTPException(status_code=400, detail="حداقل کیلومتر باید کمتر از حداکثر باشد")
    
    # Check for overlapping with other ranges (excluding current range)
    other_ranges = await db.fare_ranges.find({"id": {"$ne": range_id}}, {"_id": 0}).to_list(100)
    for other in other_ranges:
        if not (updated_max < other['min_km'] or updated_min > other['max_km']):
            raise HTTPException(
                status_code=400,
                detail=f"این بازه با بازه موجود ({other['min_km']}-{other['max_km']} km) تداخل دارد"
            )
    
    update_data['updated_at'] = datetime.now(timezone.utc).isoformat()
    
    await db.fare_ranges.update_one(
        {"id": range_id},
        {"$set": update_data}
    )
    
    # Log activity
    await log_admin_activity(
        admin_id=admin['id'],
        admin_name=admin['name'],
        action="update_fare_range",
        target_type="fare_range",
        target_id=range_id,
        details=update_data
    )
    
    # Get updated document
    updated_doc = await db.fare_ranges.find_one({"id": range_id}, {"_id": 0})
    return FareRange(**deserialize_doc(updated_doc))

@api_router.delete("/admin/fare-ranges/{range_id}")
async def delete_fare_range(range_id: str, admin: dict = Depends(get_current_admin)):
    """
    Delete a fare range
    حذف بازه نرخ
    """
    result = await db.fare_ranges.delete_one({"id": range_id})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="بازه نرخ یافت نشد")
    
    # Log activity
    await log_admin_activity(
        admin_id=admin['id'],
        admin_name=admin['name'],
        action="delete_fare_range",
        target_type="fare_range",
        target_id=range_id
    )
    
    return {"success": True, "message": "بازه نرخ با موفقیت حذف شد"}


@api_router.get("/admin/search/users")
async def search_users(q: str, role: Optional[str] = None, admin: dict = Depends(get_current_admin)):
    """
    Search users by name or phone
    """
    query = {
        "$or": [
            {"name": {"$regex": q, "$options": "i"}},
            {"phone": {"$regex": q}}
        ]
    }
    if role:
        query["role"] = role
    
    users = await db.users.find(query, {"_id": 0}).limit(50).to_list(50)
    return [User(**deserialize_doc(u)) for u in users]

@api_router.put("/admin/trips/{trip_id}/update-status")
async def admin_update_trip_status(trip_id: str, status: str, admin: dict = Depends(get_current_admin)):
    """
    Manually update trip status (emergency override)
    """
    result = await db.trips.update_one(
        {"id": trip_id},
        {"$set": {"status": status}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="سفر یافت نشد")
    
    # Log activity
    await log_admin_activity(
        admin_id=admin['id'],
        admin_name=admin['name'],
        action="update_trip_status",
        target_type="trip",
        target_id=trip_id,
        details={"new_status": status}
    )
    
    trip = await db.trips.find_one({"id": trip_id}, {"_id": 0})
    return {"success": True, "message": "وضعیت سفر به‌روزرسانی شد", "trip": Trip(**deserialize_doc(trip))}

@api_router.get("/admin/dashboard/realtime-stats")
async def get_realtime_stats(admin: dict = Depends(get_current_admin)):
    """
    Get real-time dashboard statistics with detailed breakdowns
    """
    # User stats
    total_users = await db.users.count_documents({})
    total_drivers = await db.users.count_documents({"role": UserRole.DRIVER})
    total_passengers = await db.users.count_documents({"role": UserRole.PASSENGER})
    active_drivers = await db.users.count_documents({"role": UserRole.DRIVER, "is_active": True})
    inactive_drivers = total_drivers - active_drivers
    
    # Trip stats by status
    pending_trips = await db.trips.count_documents({"status": TripStatus.PENDING})
    accepted_trips = await db.trips.count_documents({"status": TripStatus.ACCEPTED})
    inprogress_trips = await db.trips.count_documents({"status": TripStatus.IN_PROGRESS})
    completed_trips_all = await db.trips.count_documents({"status": TripStatus.COMPLETED})
    cancelled_trips = await db.trips.count_documents({"status": TripStatus.CANCELLED})
    
    # Today's stats
    today_start = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
    completed_trips_today = await db.trips.count_documents({
        "status": TripStatus.COMPLETED,
        "completed_at": {"$gte": today_start.isoformat()}
    })
    
    # Revenue stats
    completed_trips = await db.trips.find({
        "status": TripStatus.COMPLETED,
        "completed_at": {"$gte": today_start.isoformat()}
    }, {"_id": 0, "price": 1}).to_list(1000)
    
    today_revenue = sum(trip.get('price', 0) for trip in completed_trips)
    
    # This week
    week_start = today_start - timedelta(days=7)
    week_completed = await db.trips.find({
        "status": TripStatus.COMPLETED,
        "completed_at": {"$gte": week_start.isoformat()}
    }, {"_id": 0, "price": 1}).to_list(5000)
    week_revenue = sum(trip.get('price', 0) for trip in week_completed)
    
    return {
        "total_users": total_users,
        "total_drivers": total_drivers,
        "total_passengers": total_passengers,
        "active_drivers": active_drivers,
        "inactive_drivers": inactive_drivers,
        "trips_by_status": {
            "pending": pending_trips,
            "accepted": accepted_trips,
            "in_progress": inprogress_trips,
            "completed": completed_trips_all,
            "cancelled": cancelled_trips
        },
        "ongoing_trips": pending_trips + accepted_trips + inprogress_trips,
        "completed_trips_today": completed_trips_today,
        "total_revenue_today": today_revenue,
        "total_revenue_week": week_revenue
    }

# ===================== Driver Routes =====================

@api_router.get("/driver/{driver_id}/profile", response_model=User)
async def get_driver_profile(driver_id: str):
    """
    Get driver profile information
    """
    driver = await db.users.find_one({"id": driver_id, "role": UserRole.DRIVER}, {"_id": 0})
    if not driver:
        raise HTTPException(status_code=404, detail="راننده یافت نشد")
    
    return User(**deserialize_doc(driver))

@api_router.put("/driver/{driver_id}/profile", response_model=User)
async def update_driver_profile(driver_id: str, update: UserUpdate):
    """
    Update driver profile
    """
    update_data = {k: v for k, v in update.model_dump().items() if v is not None}
    
    result = await db.users.update_one(
        {"id": driver_id, "role": UserRole.DRIVER},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="راننده یافت نشد")
    
    driver = await db.users.find_one({"id": driver_id}, {"_id": 0})
    return User(**deserialize_doc(driver))

@api_router.put("/driver/{driver_id}/location")
async def update_driver_location(driver_id: str, location: LocationUpdate):
    """
    Update driver's current location
    """
    location_data = {"lat": location.lat, "lng": location.lng}
    
    await db.users.update_one(
        {"id": driver_id, "role": UserRole.DRIVER},
        {"$set": {"current_location": location_data}}
    )
    
    # Store in memory for real-time tracking
    driver_locations[driver_id] = {
        "lat": location.lat,
        "lng": location.lng,
        "timestamp": datetime.now(timezone.utc).isoformat()
    }
    
    # Emit location update via WebSocket
    await sio.emit(f'driver_location_{driver_id}', location_data)
    
    return {"success": True, "message": "موقعیت به‌روزرسانی شد"}

@api_router.get("/driver/{driver_id}/nearby-requests")
async def get_nearby_requests(driver_id: str):
    """
    Get pending trip requests near driver's location
    """
    # Get driver location
    driver = await db.users.find_one({"id": driver_id}, {"_id": 0})
    if not driver or not driver.get('current_location'):
        return []
    
    # Get all pending trips (in real app, filter by distance)
    pending_trips = await db.trips.find(
        {"status": TripStatus.PENDING},
        {"_id": 0}
    ).to_list(100)
    
    return [Trip(**deserialize_doc(t)) for t in pending_trips]

@api_router.post("/driver/{driver_id}/accept-trip/{trip_id}")
async def accept_trip(driver_id: str, trip_id: str):
    """
    Driver accepts a trip request
    """
    # Get driver info
    driver = await db.users.find_one({"id": driver_id, "role": UserRole.DRIVER}, {"_id": 0})
    if not driver:
        raise HTTPException(status_code=404, detail="راننده یافت نشد")
    
    # Check if driver account is locked due to unpaid commission
    finance = await db.driver_finances.find_one({"driver_id": driver_id}, {"_id": 0})
    if finance and finance.get('account_locked', False):
        raise HTTPException(
            status_code=403, 
            detail="حساب شما به دلیل کمیسیون پرداخت نشده قفل شده است. لطفاً با مدیر سیستم تماس بگیرید."
        )
    
    # Check if driver is active
    if not driver.get('is_active', True):
        raise HTTPException(status_code=403, detail="حساب شما غیرفعال است")
    
    # Update trip
    result = await db.trips.update_one(
        {"id": trip_id, "status": TripStatus.PENDING},
        {"$set": {
            "driver_id": driver_id,
            "driver_name": driver.get('name'),
            "driver_phone": driver.get('phone'),
            "driver_car_model": driver.get('car_model'),
            "status": TripStatus.ACCEPTED,
            "accepted_at": datetime.now(timezone.utc).isoformat()
        }}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=400, detail="سفر یافت نشد یا قبلاً پذیرفته شده")
    
    # Get updated trip
    trip = await db.trips.find_one({"id": trip_id}, {"_id": 0})
    
    # Notify passenger via WebSocket
    await sio.emit(f'trip_accepted_{trip["passenger_id"]}', {
        "trip_id": trip_id,
        "driver": {
            "name": driver.get('name'),
            "phone": driver.get('phone'),
            "car_model": driver.get('car_model')
        }
    })
    
    return {"success": True, "message": "سفر با موفقیت پذیرفته شد", "trip": Trip(**deserialize_doc(trip))}

@api_router.post("/driver/{driver_id}/reject-trip/{trip_id}")
async def reject_trip(driver_id: str, trip_id: str):
    """
    Driver rejects a trip request
    """
    return {"success": True, "message": "سفر رد شد"}

@api_router.put("/driver/{driver_id}/trip/{trip_id}/status")
async def update_trip_status(driver_id: str, trip_id: str, status: str):
    """
    Update trip status (in_progress, completed)
    """
    update_data = {"status": status}
    
    if status == TripStatus.IN_PROGRESS:
        update_data["started_at"] = datetime.now(timezone.utc).isoformat()
    elif status == TripStatus.COMPLETED:
        update_data["completed_at"] = datetime.now(timezone.utc).isoformat()
    
    result = await db.trips.update_one(
        {"id": trip_id, "driver_id": driver_id},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="سفر یافت نشد")
    
    trip = await db.trips.find_one({"id": trip_id}, {"_id": 0})
    
    # If trip is completed, update driver finances
    financial_update = None
    if status == TripStatus.COMPLETED and trip:
        trip_price = trip.get('price', 0)
        financial_update = await update_driver_finances_on_trip_completion(driver_id, trip_price)
    
    # Notify passenger
    await sio.emit(f'trip_status_{trip["passenger_id"]}', {
        "trip_id": trip_id,
        "status": status
    })
    
    response = {
        "success": True,
        "message": "وضعیت سفر به‌روزرسانی شد",
        "trip": Trip(**deserialize_doc(trip))
    }
    
    if financial_update:
        response["financial_update"] = financial_update
    
    return response

@api_router.get("/driver/{driver_id}/trips")
async def get_driver_trips(driver_id: str, status: Optional[str] = None):
    """
    Get driver's trip history
    """
    query = {"driver_id": driver_id}
    if status:
        query["status"] = status
    
    trips = await db.trips.find(query, {"_id": 0}).sort("created_at", -1).to_list(1000)
    return [Trip(**deserialize_doc(t)) for t in trips]

# ===================== Driver Financial Routes =====================

@api_router.get("/driver/{driver_id}/finances")
async def get_driver_finances(driver_id: str):
    """
    Get driver's financial information
    """
    finance = await get_or_create_driver_finance(driver_id)
    return DriverFinance(**finance)

@api_router.get("/driver/{driver_id}/earnings-summary")
async def get_driver_earnings_summary(driver_id: str, period: str = "today"):
    """
    Get driver's earnings summary for a specific period
    period: today, week, month, all
    """
    now = datetime.now(timezone.utc)
    
    # Define time range based on period
    if period == "today":
        start_date = now.replace(hour=0, minute=0, second=0, microsecond=0)
    elif period == "week":
        start_date = now - timedelta(days=7)
    elif period == "month":
        start_date = now - timedelta(days=30)
    else:  # all
        start_date = datetime.min.replace(tzinfo=timezone.utc)
    
    # Get completed trips for the period
    trips = await db.trips.find({
        "driver_id": driver_id,
        "status": TripStatus.COMPLETED,
        "completed_at": {"$gte": start_date.isoformat()}
    }, {"_id": 0}).to_list(10000)
    
    # Calculate earnings
    total_earned = sum(trip.get('price', 0) for trip in trips)
    trip_count = len(trips)
    commission_rate = 20.0
    commission_amount = (total_earned * commission_rate) / 100
    net_earnings = total_earned - commission_amount
    
    # Get overall finances
    finance = await get_or_create_driver_finance(driver_id)
    
    return {
        "period": period,
        "trip_count": trip_count,
        "total_earned": total_earned,
        "commission_amount": commission_amount,
        "net_earnings": net_earnings,
        "overall_finances": {
            "total_earnings": finance.get('total_earnings', 0),
            "commission_pending": finance.get('commission_pending', 0),
            "account_locked": finance.get('account_locked', False)
        }
    }

@api_router.get("/driver/{driver_id}/commission-history")
async def get_driver_commission_history(driver_id: str):
    """
    Get driver's commission payment history
    """
    payments = await db.commission_payments.find(
        {"driver_id": driver_id},
        {"_id": 0}
    ).sort("payment_date", -1).to_list(100)
    
    return [CommissionPayment(**deserialize_doc(p)) for p in payments]

# ===================== Passenger Routes =====================

@api_router.get("/passenger/{passenger_id}/profile", response_model=User)
async def get_passenger_profile(passenger_id: str):
    """
    Get passenger profile information
    """
    passenger = await db.users.find_one({"id": passenger_id, "role": UserRole.PASSENGER}, {"_id": 0})
    if not passenger:
        raise HTTPException(status_code=404, detail="مسافر یافت نشد")
    
    return User(**deserialize_doc(passenger))

@api_router.put("/passenger/{passenger_id}/profile", response_model=User)
async def update_passenger_profile(passenger_id: str, update: UserUpdate):
    """
    Update passenger profile
    """
    update_data = {k: v for k, v in update.model_dump().items() if v is not None}
    
    result = await db.users.update_one(
        {"id": passenger_id, "role": UserRole.PASSENGER},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="مسافر یافت نشد")
    
    passenger = await db.users.find_one({"id": passenger_id}, {"_id": 0})
    return User(**deserialize_doc(passenger))


# ===================== Price Estimation API =====================

class PriceEstimateRequest(BaseModel):
    distance_km: float

@api_router.post("/estimate-price")
async def estimate_trip_price(request: PriceEstimateRequest):
    """
    Estimate trip price based on distance
    تخمین قیمت سفر بر اساس مسافت
    """
    if request.distance_km <= 0:
        raise HTTPException(status_code=400, detail="مسافت باید بیشتر از صفر باشد")
    
    price = await calculate_trip_price(request.distance_km)
    
    return {
        "distance_km": request.distance_km,
        "estimated_price": round(price, 2),
        "currency": "AFN"
    }

# ===================== Passenger APIs =====================

@api_router.post("/passenger/{passenger_id}/request-ride", response_model=Trip)
async def request_ride(passenger_id: str, trip_data: TripCreate):
    """
    Passenger requests a new ride
    """
    # Get passenger info
    passenger = await db.users.find_one({"id": passenger_id, "role": UserRole.PASSENGER}, {"_id": 0})
    if not passenger:
        raise HTTPException(status_code=404, detail="مسافر یافت نشد")
    
    # Calculate distance (mock calculation)
    distance_km = random.uniform(2, 15)  # Random distance for demo
    
    # Calculate price
    price = await calculate_trip_price(distance_km)
    
    # Create trip
    new_trip = Trip(
        passenger_id=passenger_id,
        passenger_name=passenger.get('name'),
        passenger_phone=passenger.get('phone'),
        origin=trip_data.origin,
        destination=trip_data.destination,
        price=price,
        distance_km=distance_km,
        duration_minutes=int(distance_km * 2.5)  # Mock duration
    )
    
    doc = new_trip.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.trips.insert_one(doc)
    
    # Notify nearby drivers via WebSocket
    await sio.emit('new_trip_request', {
        "trip_id": new_trip.id,
        "passenger_name": new_trip.passenger_name,
        "origin": new_trip.origin,
        "destination": new_trip.destination,
        "price": new_trip.price
    })
    
    return new_trip

@api_router.get("/passenger/{passenger_id}/active-trip")
async def get_active_trip(passenger_id: str):
    """
    Get passenger's current active trip
    """
    trip = await db.trips.find_one(
        {
            "passenger_id": passenger_id,
            "status": {"$in": [TripStatus.PENDING, TripStatus.ACCEPTED, TripStatus.IN_PROGRESS]}
        },
        {"_id": 0}
    )
    
    if not trip:
        return None
    
    return Trip(**deserialize_doc(trip))

@api_router.get("/passenger/{passenger_id}/trips")
async def get_passenger_trips(passenger_id: str):
    """
    Get passenger's trip history
    """
    trips = await db.trips.find(
        {"passenger_id": passenger_id},
        {"_id": 0}
    ).sort("created_at", -1).to_list(1000)
    
    return [Trip(**deserialize_doc(t)) for t in trips]

@api_router.delete("/passenger/{passenger_id}/trip/{trip_id}")
async def cancel_trip(passenger_id: str, trip_id: str):
    """
    Cancel a pending trip
    """
    result = await db.trips.update_one(
        {"id": trip_id, "passenger_id": passenger_id, "status": TripStatus.PENDING},
        {"$set": {"status": TripStatus.CANCELLED}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=400, detail="سفر یافت نشد یا قابل لغو نیست")
    
    return {"success": True, "message": "سفر لغو شد"}

# ===================== Notifications =====================

@api_router.get("/notifications/{user_id}")
async def get_user_notifications(user_id: str):
    """
    Get notifications for a specific user
    """
    notifications = await db.notifications.find(
        {"$or": [{"user_id": user_id}, {"user_id": None}]},
        {"_id": 0}
    ).sort("created_at", -1).to_list(100)
    
    return [Notification(**deserialize_doc(n)) for n in notifications]

# ===================== Admin Financial Management Routes =====================

@api_router.get("/admin/finances/drivers")
async def get_all_drivers_finances(admin: dict = Depends(get_current_admin)):
    """
    Get financial information for all drivers
    """
    finances = await db.driver_finances.find({}, {"_id": 0}).sort("commission_pending", -1).to_list(1000)
    return [DriverFinance(**f) for f in finances]

@api_router.get("/admin/finances/driver/{driver_id}")
async def get_driver_finance_details(driver_id: str, admin: dict = Depends(get_current_admin)):
    """
    Get detailed financial information for a specific driver
    """
    finance = await get_or_create_driver_finance(driver_id)
    
    # Get payment history
    payments = await db.commission_payments.find(
        {"driver_id": driver_id},
        {"_id": 0}
    ).sort("payment_date", -1).to_list(100)
    
    # Get trip statistics
    completed_trips = await db.trips.count_documents({
        "driver_id": driver_id,
        "status": TripStatus.COMPLETED
    })
    
    return {
        "finance": DriverFinance(**finance),
        "payment_history": [CommissionPayment(**deserialize_doc(p)) for p in payments],
        "completed_trips": completed_trips
    }

@api_router.post("/admin/finances/record-payment")
async def record_commission_payment(payment: CommissionPaymentRequest, admin: dict = Depends(get_current_admin)):
    """
    Record a commission payment from driver
    """
    driver_id = payment.driver_id
    amount = payment.amount
    
    # Get driver finance record
    finance = await get_or_create_driver_finance(driver_id)
    
    # Get driver info
    driver = await db.users.find_one({"id": driver_id}, {"_id": 0})
    if not driver:
        raise HTTPException(status_code=404, detail="راننده یافت نشد")
    
    # Create payment record
    commission_payment = CommissionPayment(
        driver_id=driver_id,
        driver_name=driver.get('name'),
        amount=amount,
        recorded_by=admin['id'],
        recorded_by_name=admin['name'],
        notes=payment.notes
    )
    
    doc = commission_payment.model_dump()
    doc['payment_date'] = doc['payment_date'].isoformat()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.commission_payments.insert_one(doc)
    
    # Update driver finances
    new_commission_paid = finance.get('commission_paid', 0) + amount
    new_commission_pending = finance.get('commission_owed', 0) - new_commission_paid
    
    await db.driver_finances.update_one(
        {"driver_id": driver_id},
        {
            "$set": {
                "commission_paid": new_commission_paid,
                "commission_pending": new_commission_pending,
                "updated_at": datetime.now(timezone.utc).isoformat()
            }
        }
    )
    
    # Log admin activity
    await log_admin_activity(
        admin_id=admin['id'],
        admin_name=admin['name'],
        action="record_commission_payment",
        target_type="driver_finance",
        target_id=driver_id,
        details={"amount": amount, "notes": payment.notes}
    )
    
    return {
        "success": True,
        "message": "پرداخت کمیسیون با موفقیت ثبت شد",
        "payment": commission_payment,
        "new_pending": new_commission_pending
    }

@api_router.put("/admin/finances/unlock-account/{driver_id}")
async def unlock_driver_account(driver_id: str, admin: dict = Depends(get_current_admin)):
    """
    Unlock a locked driver account (only after commission is paid)
    """
    # Get driver finance
    finance = await db.driver_finances.find_one({"driver_id": driver_id}, {"_id": 0})
    if not finance:
        raise HTTPException(status_code=404, detail="اطلاعات مالی راننده یافت نشد")
    
    # Check if there's still pending commission
    commission_pending = finance.get('commission_pending', 0)
    if commission_pending >= finance.get('debt_limit', 1000):
        raise HTTPException(
            status_code=400, 
            detail=f"نمی‌توان حساب را باز کرد. کمیسیون معوق: {commission_pending} AFN"
        )
    
    # Unlock account
    await db.driver_finances.update_one(
        {"driver_id": driver_id},
        {
            "$set": {
                "account_locked": False,
                "updated_at": datetime.now(timezone.utc).isoformat()
            }
        }
    )
    
    # Unlock user account
    await db.users.update_one(
        {"id": driver_id},
        {"$set": {"is_active": True}}
    )
    
    # Log admin activity
    await log_admin_activity(
        admin_id=admin['id'],
        admin_name=admin['name'],
        action="unlock_driver_account",
        target_type="driver_finance",
        target_id=driver_id,
        details={"commission_pending": commission_pending}
    )
    
    return {
        "success": True,
        "message": "حساب راننده با موفقیت باز شد"
    }

@api_router.get("/admin/finances/summary")
async def get_financial_summary(admin: dict = Depends(get_current_admin)):
    """
    Get overall financial summary for the system
    """
    # Get all driver finances
    all_finances = await db.driver_finances.find({}, {"_id": 0}).to_list(1000)
    
    total_earnings = sum(f.get('total_earnings', 0) for f in all_finances)
    total_commission_owed = sum(f.get('commission_owed', 0) for f in all_finances)
    total_commission_paid = sum(f.get('commission_paid', 0) for f in all_finances)
    total_commission_pending = sum(f.get('commission_pending', 0) for f in all_finances)
    locked_accounts = sum(1 for f in all_finances if f.get('account_locked', False))
    
    return {
        "total_drivers": len(all_finances),
        "total_earnings": total_earnings,
        "total_commission_owed": total_commission_owed,
        "total_commission_paid": total_commission_paid,
        "total_commission_pending": total_commission_pending,
        "locked_accounts": locked_accounts,
        "currency": "AFN"
    }

# ===================== WebSocket Events =====================

@sio.event
async def connect(sid, environ):
    """Handle WebSocket connection"""
    logger.info(f"Client connected: {sid}")

@sio.event
async def disconnect(sid):
    """Handle WebSocket disconnection"""
    logger.info(f"Client disconnected: {sid}")

@sio.event
async def join_room(sid, data):
    """Join a specific room (for targeted updates)"""
    room = data.get('room')
    await sio.enter_room(sid, room)
    logger.info(f"Client {sid} joined room: {room}")

@sio.event
async def location_update(sid, data):
    """Handle real-time location updates from drivers"""
    driver_id = data.get('driver_id')
    lat = data.get('lat')
    lng = data.get('lng')
    
    if driver_id and lat and lng:
        driver_locations[driver_id] = {
            "lat": lat,
            "lng": lng,
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
        
        # Broadcast to subscribers
        await sio.emit(f'driver_location_{driver_id}', {
            "lat": lat,
            "lng": lng
        })

# ===================== Root & Health Check =====================

@api_router.get("/")
async def root():
    return {
        "message": "سیستم تاکسی اسنپ - API فعال است",
        "version": "1.0.0",
        "status": "operational"
    }

@api_router.get("/health")
async def health_check():
    """Health check endpoint"""
    try:
        # Check MongoDB connection
        await db.command('ping')
        return {"status": "healthy", "database": "connected"}
    except Exception as e:
        return {"status": "unhealthy", "error": str(e)}

# ===================== Include Router & Middleware =====================

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
    logger.info("Database connection closed")

# Export socket app for supervisor
# In production, use: uvicorn server:socket_app
