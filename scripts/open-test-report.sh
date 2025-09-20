#!/bin/bash

# Open Playwright test report
echo "📊 Opening Playwright Test Report..."
echo "===================================="

if [ -f "frontend/playwright-report/index.html" ]; then
    echo "✅ Report found at: frontend/playwright-report/index.html"
    echo "🌐 Opening in browser..."
    
    # Try different ways to open the report
    if command -v open >/dev/null 2>&1; then
        open frontend/playwright-report/index.html
    elif command -v xdg-open >/dev/null 2>&1; then
        xdg-open frontend/playwright-report/index.html
    elif command -v start >/dev/null 2>&1; then
        start frontend/playwright-report/index.html
    else
        echo "Please open manually: frontend/playwright-report/index.html"
    fi
else
    echo "❌ No test report found. Run tests first:"
    echo "   npm run test:e2e"
    echo "   or"
    echo "   npm run test:all"
fi
