"""
Seed test data for Snabb Taxi System
Creates sample drivers with locations and trips for testing
"""

import asyncio
import random
from datetime import datetime, timezone, timedelta
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv

load_dotenv()

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Tehran coordinates (approximate center)
TEHRAN_CENTER = {"lat": 35.6892, "lng": 51.3890}

# Sample Persian names for drivers
DRIVER_NAMES = [
    "علی محمدی",
    "حسین رضایی",
    "محمد احمدی",
    "رضا کریمی",
    "مهدی حسینی",
    "سعید نوری",
    "امیر صادقی",
    "حمید باقری",
    "مسعود مرادی",
    "فرهاد یوسفی"
]

# Sample passenger names
PASSENGER_NAMES = [
    "فاطمه حسینی",
    "زهرا احمدی",
    "مریم رضایی",
    "سارا کریمی",
    "نرگس محمدی",
    "لیلا صادقی",
    "مینا نوری",
    "پریسا باقری"
]

# Sample car models
CAR_MODELS = [
    "پژو 206",
    "پژو 207",
    "سمند",
    "پراید",
    "تیبا",
    "دنا",
    "رانا"
]

# Sample addresses in Tehran
TEHRAN_ADDRESSES = [
    "میدان ولیعصر، تهران",
    "میدان تجریش، تهران",
    "میدان آزادی، تهران",
    "میدان انقلاب، تهران",
    "خیابان ستارخان، تهران",
    "خیابان کارگر، تهران",
    "خیابان انقلاب، تهران",
    "خیابان ولیعصر، تهران",
    "خیابان نیاوران، تهران",
    "خیابان فرمانیه، تهران",
    "میدان شهدا، تهران",
    "میدان رسالت، تهران",
    "میدان قدس، تهران",
    "خیابان پاسداران، تهران",
    "خیابان جمهوری، تهران"
]

def generate_random_location_near_tehran():
    """Generate random coordinates near Tehran center"""
    # Generate random offset within ~10km radius
    lat_offset = random.uniform(-0.09, 0.09)  # ~10km
    lng_offset = random.uniform(-0.09, 0.09)
    
    return {
        "lat": round(TEHRAN_CENTER["lat"] + lat_offset, 6),
        "lng": round(TEHRAN_CENTER["lng"] + lng_offset, 6)
    }

def generate_random_phone():
    """Generate random Afghan mobile number"""
    # Afghan mobile prefixes: 070, 072, 075, 077, 078, 079
    prefixes = ['070', '072', '075', '077', '078', '079']
    prefix = random.choice(prefixes)
    return f"{prefix}{random.randint(1000000, 9999999)}"

def generate_random_plate():
    """Generate random Iranian car plate"""
    return f"{random.randint(10, 99)}{chr(random.randint(1575, 1610))}{random.randint(100, 999)}-{random.randint(10, 99)}"

async def seed_drivers(count=15):
    """Create sample drivers with current locations"""
    print(f"\n🚗 Creating {count} sample drivers...")
    
    drivers = []
    for i in range(count):
        driver = {
            "id": f"driver_{i+1}_{random.randint(1000, 9999)}",
            "phone": generate_random_phone(),
            "name": DRIVER_NAMES[i % len(DRIVER_NAMES)],
            "role": "driver",
            "is_active": random.choice([True, True, True, False]),  # 75% active
            "current_location": generate_random_location_near_tehran(),
            "car_model": random.choice(CAR_MODELS),
            "car_plate": generate_random_plate(),
            "created_at": (datetime.now(timezone.utc) - timedelta(days=random.randint(1, 90))).isoformat()
        }
        drivers.append(driver)
    
    # Insert drivers
    result = await db.users.insert_many(drivers)
    print(f"✅ Created {len(result.inserted_ids)} drivers")
    return drivers

async def seed_passengers(count=10):
    """Create sample passengers"""
    print(f"\n👥 Creating {count} sample passengers...")
    
    passengers = []
    for i in range(count):
        passenger = {
            "id": f"passenger_{i+1}_{random.randint(1000, 9999)}",
            "phone": generate_random_phone(),
            "name": PASSENGER_NAMES[i % len(PASSENGER_NAMES)],
            "role": "passenger",
            "is_active": True,
            "created_at": (datetime.now(timezone.utc) - timedelta(days=random.randint(1, 60))).isoformat()
        }
        passengers.append(passenger)
    
    # Insert passengers
    result = await db.users.insert_many(passengers)
    print(f"✅ Created {len(result.inserted_ids)} passengers")
    return passengers

async def seed_trips(drivers, passengers, count=30):
    """Create sample trips with various statuses"""
    print(f"\n🚕 Creating {count} sample trips...")
    
    trips = []
    statuses = ["completed", "completed", "completed", "in_progress", "accepted", "pending", "cancelled"]
    
    for i in range(count):
        driver = random.choice(drivers) if random.random() > 0.2 else None
        passenger = random.choice(passengers)
        status = random.choice(statuses)
        
        # Generate trip dates
        days_ago = random.randint(0, 30)
        created_at = datetime.now(timezone.utc) - timedelta(days=days_ago, hours=random.randint(0, 23))
        
        origin = generate_random_location_near_tehran()
        destination = generate_random_location_near_tehran()
        distance_km = random.uniform(2, 20)
        
        # Calculate price based on default config (Afghan pricing)
        base_fare = 20  # افغانی
        per_km = 10     # افغانی per km
        price = base_fare + (distance_km * per_km)
        
        trip = {
            "id": f"trip_{i+1}_{random.randint(1000, 9999)}",
            "passenger_id": passenger["id"],
            "passenger_name": passenger["name"],
            "passenger_phone": passenger["phone"],
            "origin": {
                "lat": origin["lat"],
                "lng": origin["lng"],
                "address": random.choice(TEHRAN_ADDRESSES)
            },
            "destination": {
                "lat": destination["lat"],
                "lng": destination["lng"],
                "address": random.choice(TEHRAN_ADDRESSES)
            },
            "price": round(price, 0),
            "status": status,
            "distance_km": round(distance_km, 2),
            "duration_minutes": int(distance_km * 2.5),
            "created_at": created_at.isoformat()
        }
        
        # Add driver info if trip is not pending
        if driver and status != "pending":
            trip["driver_id"] = driver["id"]
            trip["driver_name"] = driver["name"]
            trip["driver_phone"] = driver["phone"]
            trip["driver_car_model"] = driver["car_model"]
        
        # Add timestamps based on status
        if status in ["accepted", "in_progress", "completed", "cancelled"]:
            trip["accepted_at"] = (created_at + timedelta(minutes=random.randint(1, 5))).isoformat()
        
        if status in ["in_progress", "completed"]:
            trip["started_at"] = (created_at + timedelta(minutes=random.randint(5, 15))).isoformat()
        
        if status == "completed":
            trip["completed_at"] = (created_at + timedelta(minutes=random.randint(15, 60))).isoformat()
        
        trips.append(trip)
    
    # Insert trips
    result = await db.trips.insert_many(trips)
    print(f"✅ Created {len(result.inserted_ids)} trips")
    
    # Show trip status breakdown
    status_counts = {}
    for trip in trips:
        status = trip["status"]
        status_counts[status] = status_counts.get(status, 0) + 1
    
    print("\n📊 Trip status breakdown:")
    for status, count in status_counts.items():
        print(f"  - {status}: {count}")
    
    return trips

async def seed_notifications(count=10):
    """Create sample notifications"""
    print(f"\n📢 Creating {count} sample notifications...")
    
    notifications = []
    messages = [
        "به سیستم اسنپ خوش آمدید",
        "تغییرات جدید در نرخ کرایه اعمال شد",
        "یک درخواست سفر جدید در نزدیکی شما",
        "سفر شما با موفقیت تکمیل شد",
        "راننده در مسیر است",
        "لطفاً اطلاعات خود را به‌روزرسانی کنید",
        "پاداش جدید برای شما فعال شد",
        "تخفیف ویژه برای سفر بعدی شما"
    ]
    
    for i in range(count):
        notification = {
            "id": f"notif_{i+1}_{random.randint(1000, 9999)}",
            "user_id": None,  # Broadcast
            "role": random.choice(["driver", "passenger", None]),
            "message": random.choice(messages),
            "created_at": (datetime.now(timezone.utc) - timedelta(days=random.randint(0, 7))).isoformat(),
            "is_read": random.choice([True, False])
        }
        notifications.append(notification)
    
    # Insert notifications
    result = await db.notifications.insert_many(notifications)
    print(f"✅ Created {len(result.inserted_ids)} notifications")
    return notifications

async def main():
    """Main seeding function"""
    print("=" * 60)
    print("🌱 Starting database seeding for Snabb Taxi System")
    print("=" * 60)
    
    try:
        # Clear existing data (optional - comment out if you want to keep existing data)
        print("\n🗑️  Clearing existing test data...")
        await db.users.delete_many({"id": {"$regex": "^(driver_|passenger_)"}})
        await db.trips.delete_many({"id": {"$regex": "^trip_"}})
        await db.notifications.delete_many({"id": {"$regex": "^notif_"}})
        print("✅ Cleared existing test data")
        
        # Seed data
        drivers = await seed_drivers(15)
        passengers = await seed_passengers(10)
        trips = await seed_trips(drivers, passengers, 30)
        notifications = await seed_notifications(10)
        
        # Show final stats
        print("\n" + "=" * 60)
        print("✅ Database seeding completed successfully!")
        print("=" * 60)
        print(f"\n📊 Final Statistics:")
        print(f"  - Total Drivers: {len(drivers)}")
        print(f"  - Active Drivers: {sum(1 for d in drivers if d['is_active'])}")
        print(f"  - Total Passengers: {len(passengers)}")
        print(f"  - Total Trips: {len(trips)}")
        print(f"  - Total Notifications: {len(notifications)}")
        
        print(f"\n🔑 Default Admin Credentials:")
        print(f"  - Email: admin@snabb.ir")
        print(f"  - Password: admin123")
        
        print(f"\n🌐 Admin Panel URL: http://localhost:3001")
        print(f"🔧 Backend API URL: http://localhost:8001/api")
        print("\n")
        
    except Exception as e:
        print(f"\n❌ Error during seeding: {e}")
        raise
    finally:
        client.close()

if __name__ == "__main__":
    asyncio.run(main())
