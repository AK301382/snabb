"""
Create sample completed trips for today to test revenue analytics
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

async def create_completed_trips_today():
    """Create 10 completed trips for today"""
    print("🚕 Creating 10 completed trips for today...")
    
    # Get existing drivers and passengers
    drivers = await db.users.find({"role": "driver", "is_active": True}, {"_id": 0}).to_list(20)
    passengers = await db.users.find({"role": "passenger"}, {"_id": 0}).to_list(20)
    
    if not drivers or not passengers:
        print("❌ No drivers or passengers found!")
        return
    
    today = datetime.now(timezone.utc)
    trips = []
    
    for i in range(10):
        driver = random.choice(drivers)
        passenger = random.choice(passengers)
        
        # Random time today
        hours_ago = random.randint(1, 12)
        created_at = today - timedelta(hours=hours_ago)
        accepted_at = created_at + timedelta(minutes=random.randint(1, 3))
        started_at = accepted_at + timedelta(minutes=random.randint(3, 8))
        completed_at = started_at + timedelta(minutes=random.randint(10, 45))
        
        distance_km = random.uniform(3, 18)
        base_fare = 5000
        per_km = 3000
        price = base_fare + (distance_km * per_km)
        
        trip = {
            "id": f"trip_today_{i+1}_{random.randint(1000, 9999)}",
            "passenger_id": passenger["id"],
            "passenger_name": passenger["name"],
            "passenger_phone": passenger["phone"],
            "driver_id": driver["id"],
            "driver_name": driver["name"],
            "driver_phone": driver["phone"],
            "driver_car_model": driver.get("car_model", "پژو 206"),
            "origin": {
                "lat": 35.6892 + random.uniform(-0.05, 0.05),
                "lng": 51.3890 + random.uniform(-0.05, 0.05),
                "address": f"خیابان {random.choice(['ولیعصر', 'انقلاب', 'آزادی', 'ستارخان'])}"
            },
            "destination": {
                "lat": 35.6892 + random.uniform(-0.05, 0.05),
                "lng": 51.3890 + random.uniform(-0.05, 0.05),
                "address": f"میدان {random.choice(['تجریش', 'رسالت', 'قدس', 'شهدا'])}"
            },
            "price": round(price, 0),
            "status": "completed",
            "distance_km": round(distance_km, 2),
            "duration_minutes": int(distance_km * 2.5),
            "created_at": created_at.isoformat(),
            "accepted_at": accepted_at.isoformat(),
            "started_at": started_at.isoformat(),
            "completed_at": completed_at.isoformat()
        }
        trips.append(trip)
    
    # Insert trips
    result = await db.trips.insert_many(trips)
    print(f"✅ Created {len(result.inserted_ids)} completed trips for today")
    
    # Calculate total revenue
    total_revenue = sum(trip["price"] for trip in trips)
    print(f"💰 Total revenue from today's trips: {total_revenue:,.0f} تومان")

async def main():
    try:
        await create_completed_trips_today()
    finally:
        client.close()

if __name__ == "__main__":
    asyncio.run(main())
