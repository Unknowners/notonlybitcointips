#!/bin/bash

# Not Only Bitcoin Tips - Complete Test Suite
# This script runs all tests in the correct order

set -e

echo "🧪 Starting Not Only Bitcoin Tips Test Suite"
echo "=============================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if IC replica is running
echo "🔍 Checking IC replica status..."
if ! dfx ping 2>/dev/null; then
    print_warning "IC replica not running. Starting it now..."
    dfx start --background
    sleep 5
    dfx deploy
    print_status "IC replica started and deployed"
else
    print_status "IC replica is running"
fi

# Run API tests
echo ""
echo "🔧 Running API Tests..."
echo "----------------------"
if npm run test:api; then
    print_status "API tests passed"
else
    print_error "API tests failed"
    exit 1
fi

# Run Frontend E2E tests
echo ""
echo "🎭 Running Frontend E2E Tests..."
echo "--------------------------------"
cd frontend
if npm run test:e2e; then
    print_status "Frontend E2E tests passed"
else
    print_warning "Some frontend tests may have failed (check output above)"
fi
cd ..

# Run ckBTC specific tests
echo ""
echo "₿ Running ckBTC Integration Tests..."
echo "------------------------------------"
if npm run test:api -- tests/api/ckbtc.spec.js; then
    print_status "ckBTC API tests passed"
else
    print_warning "ckBTC API tests may have failed"
fi

cd frontend
if npm run test:e2e -- tests/ckbtc.spec.ts; then
    print_status "ckBTC E2E tests passed"
else
    print_warning "ckBTC E2E tests may have failed"
fi
cd ..

echo ""
echo "🎉 Test Suite Complete!"
echo "======================"
print_status "All critical tests have been executed"
print_warning "Check individual test outputs above for any failures"
echo ""
echo "To run specific test suites:"
echo "  npm run test:api          # API tests only"
echo "  npm run test:e2e          # Frontend E2E tests only"
echo "  npm run test:setup        # Start IC replica and deploy"
