#!/bin/bash

# Not Only Bitcoin Tips - Visual Test Suite
# This script runs all tests with visual browser interface

set -e

echo "🎭 Starting Not Only Bitcoin Tips Visual Test Suite"
echo "=================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
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

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
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

# Run API tests (headless)
echo ""
echo "🔧 Running API Tests (Headless)..."
echo "----------------------------------"
if npm run test:api; then
    print_status "API tests passed"
else
    print_error "API tests failed"
    exit 1
fi

# Run Frontend E2E tests with visual interface
echo ""
echo "🎭 Running Frontend E2E Tests (Visual Mode)..."
echo "----------------------------------------------"
print_info "Browser will open and you can watch tests execute visually"
print_info "Press Ctrl+C to stop tests if needed"

cd frontend
if npm run test:e2e:visual; then
    print_status "Frontend E2E tests completed"
else
    print_warning "Some frontend tests may have failed (check output above)"
fi
cd ..

# Show report
echo ""
echo "📊 Opening Test Report..."
echo "------------------------"
print_info "Opening Playwright HTML report in browser..."
cd frontend
npx playwright show-report &
cd ..

echo ""
echo "🎉 Visual Test Suite Complete!"
echo "=============================="
print_status "All tests have been executed with visual interface"
print_info "Check the browser windows that opened to see test execution"
print_info "HTML report is available at: frontend/playwright-report/index.html"
echo ""
echo "To run specific visual test suites:"
echo "  npm run test:e2e:visual        # Frontend E2E tests with UI"
echo "  npm run test:auth:visual       # Authenticated tests with UI"
echo "  cd frontend && npx playwright show-report  # View test report"
