#!/bin/bash
# Snabb Taxi System - API Testing Script
# Tests all critical endpoints

echo "========================================"
echo "🧪 Snabb Taxi System API Testing"
echo "========================================"
echo ""

BASE_URL="http://localhost:8001/api"
ADMIN_EMAIL="admin@snabb.ir"
ADMIN_PASSWORD="admin123"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counter
TESTS_PASSED=0
TESTS_FAILED=0

# Function to test endpoint
test_endpoint() {
    local name=$1
    local method=$2
    local endpoint=$3
    local data=$4
    local auth_header=$5
    
    echo -n "Testing: $name... "
    
    if [ "$method" = "GET" ]; then
        if [ -n "$auth_header" ]; then
            response=$(curl -s -w "\n%{http_code}" -H "Authorization: Bearer $auth_header" "$BASE_URL$endpoint")
        else
            response=$(curl -s -w "\n%{http_code}" "$BASE_URL$endpoint")
        fi
    elif [ "$method" = "POST" ]; then
        if [ -n "$auth_header" ]; then
            response=$(curl -s -w "\n%{http_code}" -X POST -H "Content-Type: application/json" -H "Authorization: Bearer $auth_header" -d "$data" "$BASE_URL$endpoint")
        else
            response=$(curl -s -w "\n%{http_code}" -X POST -H "Content-Type: application/json" -d "$data" "$BASE_URL$endpoint")
        fi
    fi
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    if [ "$http_code" = "200" ] || [ "$http_code" = "201" ]; then
        echo -e "${GREEN}✅ PASSED${NC} (HTTP $http_code)"
        TESTS_PASSED=$((TESTS_PASSED + 1))
        return 0
    else
        echo -e "${RED}❌ FAILED${NC} (HTTP $http_code)"
        echo "Response: $body"
        TESTS_FAILED=$((TESTS_FAILED + 1))
        return 1
    fi
}

echo "1️⃣  Testing Health Check"
echo "────────────────────────────────────────"
test_endpoint "Health Check" "GET" "/health"
echo ""

echo "2️⃣  Testing Admin Authentication"
echo "────────────────────────────────────────"
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/admin/login?email=$ADMIN_EMAIL&password=$ADMIN_PASSWORD")
TOKEN=$(echo $LOGIN_RESPONSE | python3 -c "import sys, json; print(json.load(sys.stdin)['access_token'])" 2>/dev/null)

if [ -n "$TOKEN" ]; then
    echo -e "${GREEN}✅ Admin login successful${NC}"
    echo "Token: ${TOKEN:0:30}..."
    TESTS_PASSED=$((TESTS_PASSED + 1))
else
    echo -e "${RED}❌ Admin login failed${NC}"
    TESTS_FAILED=$((TESTS_FAILED + 1))
fi
echo ""

echo "3️⃣  Testing Admin Stats"
echo "────────────────────────────────────────"
test_endpoint "Admin Stats" "GET" "/admin/stats"
STATS=$(curl -s "$BASE_URL/admin/stats")
echo "Stats: $STATS"
echo ""

echo "4️⃣  Testing Active Drivers"
echo "────────────────────────────────────────"
test_endpoint "Active Drivers" "GET" "/admin/drivers/active"
DRIVERS=$(curl -s "$BASE_URL/admin/drivers/active" | python3 -c "import sys, json; data=json.load(sys.stdin); print(f'Found {len(data)} active drivers')")
echo "$DRIVERS"
echo ""

echo "5️⃣  Testing All Users"
echo "────────────────────────────────────────"
test_endpoint "All Users" "GET" "/admin/users"
USERS=$(curl -s "$BASE_URL/admin/users" | python3 -c "import sys, json; data=json.load(sys.stdin); print(f'Found {len(data)} total users')")
echo "$USERS"
echo ""

echo "6️⃣  Testing All Trips"
echo "────────────────────────────────────────"
test_endpoint "All Trips" "GET" "/admin/trips"
TRIPS=$(curl -s "$BASE_URL/admin/trips" | python3 -c "import sys, json; data=json.load(sys.stdin); print(f'Found {len(data)} total trips')")
echo "$TRIPS"
echo ""

echo "7️⃣  Testing Revenue Analytics (with JWT)"
echo "────────────────────────────────────────"
if [ -n "$TOKEN" ]; then
    test_endpoint "Revenue Analytics" "GET" "/admin/analytics/revenue?period=daily" "" "$TOKEN"
else
    echo -e "${YELLOW}⚠️  SKIPPED (no token)${NC}"
fi
echo ""

echo "8️⃣  Testing Driver Performance (with JWT)"
echo "────────────────────────────────────────"
if [ -n "$TOKEN" ]; then
    test_endpoint "Driver Performance" "GET" "/admin/analytics/drivers" "" "$TOKEN"
else
    echo -e "${YELLOW}⚠️  SKIPPED (no token)${NC}"
fi
echo ""

echo "9️⃣  Testing Pricing Config (with JWT)"
echo "────────────────────────────────────────"
if [ -n "$TOKEN" ]; then
    test_endpoint "Get Pricing Config" "GET" "/admin/pricing-config" "" "$TOKEN"
    PRICING=$(curl -s -H "Authorization: Bearer $TOKEN" "$BASE_URL/admin/pricing-config")
    echo "Pricing: $PRICING"
else
    echo -e "${YELLOW}⚠️  SKIPPED (no token)${NC}"
fi
echo ""

echo "🔟 Testing Activity Logs (with JWT)"
echo "────────────────────────────────────────"
if [ -n "$TOKEN" ]; then
    test_endpoint "Activity Logs" "GET" "/admin/activity-logs?limit=5" "" "$TOKEN"
else
    echo -e "${YELLOW}⚠️  SKIPPED (no token)${NC}"
fi
echo ""

echo "========================================"
echo "📊 Test Summary"
echo "========================================"
echo -e "Total Tests: $((TESTS_PASSED + TESTS_FAILED))"
echo -e "${GREEN}Passed: $TESTS_PASSED${NC}"
echo -e "${RED}Failed: $TESTS_FAILED${NC}"
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "${GREEN}✅ All tests passed!${NC}"
    exit 0
else
    echo -e "${RED}❌ Some tests failed!${NC}"
    exit 1
fi
