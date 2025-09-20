# Testing Guide - Not Only Bitcoin Tips

## Overview

This project has a comprehensive testing suite covering both frontend and backend functionality, including ckBTC integration. The testing approach has been simplified to focus on a single end-to-end test that covers the complete user journey.

## Test Types

### 1. API Tests (Backend)
- **Location**: `tests/api/`
- **Runner**: Jest
- **Command**: `npm run test:api`
- **Coverage**: 
  - User management (createUser, userExists)
  - Campaign CRUD operations
  - Account ID generation
  - ckBTC integration
  - Withdrawal functionality

### 2. Frontend E2E Tests
- **Location**: `frontend/tests/`
- **Runner**: Playwright
- **Command**: `npm run test:frontend`
- **Coverage**:
  - Complete user journey from authentication to campaign management
  - Campaign creation and management
  - ckBTC integration UI

## Quick Start

### Prerequisites
1. Node.js 18+
2. DFX (Internet Computer SDK)
3. Internet Computer replica running

### Running All Tests
```bash
# Complete test suite
npm run test

# Or step by step
npm run test:setup  # Start IC replica
npm run test:api    # Backend tests
npm run test:frontend    # Frontend tests
```

### Visual Testing (Recommended)

For development and debugging, run tests with a visible browser interface:

```bash
# Visual mode - see browser and test execution
npm run test:frontend:visual

# Full flow test with UI
npm run test:full-flow
```

## Main Test: Full User Flow

The primary test is `frontend/tests/full-flow.spec.ts` which covers:

1. **Authentication**: Manual login with Internet Identity
2. **Campaign Creation**: Automatic creation of test campaign
3. **Campaign Management**: Viewing campaign list and details
4. **State Persistence**: Authentication state is saved for future runs

### First Time Setup

When running the full flow test for the first time:

1. **Start the test**: `npm run test:full-flow`
2. **Wait for the app to load** on http://localhost:5173
3. **Click "Sign in with Internet Identity"**
4. **Complete authentication** in the popup window
5. **Test will automatically continue** after successful authentication
6. **Authentication state is saved** for future test runs

### Subsequent Runs

After the first run:
- **Authentication state is preserved** in `frontend/storageState.json`
- **Tests run automatically** without manual login
- **If state expires**, the test will prompt for re-authentication

## Individual Test Suites

#### API Tests Only
```bash
npm run test:api
```

#### Frontend E2E Tests Only
```bash
npm run test:frontend
```

#### Visual Mode Tests
```bash
npm run test:frontend:visual
```

#### Full Flow Test (Visual)
```bash
npm run test:full-flow
```

## Test Configuration

### Jest Configuration
- **File**: `jest.config.js`
- **Timeout**: 30 seconds
- **Environment**: Node.js
- **Setup**: `tests/api/setup.js`

### Playwright Configuration
- **File**: `frontend/playwright.config.ts`
- **Timeout**: 60 seconds (increased for manual authentication)
- **Base URL**: http://localhost:5173
- **Headless**: false in non-CI environments
- **Features**: Screenshots, video recording, traces

## Test Data Management

### Authentication State
- **File**: `frontend/storageState.json`
- **Creation**: Automatic during first test run
- **Usage**: Automatically loaded by subsequent tests
- **Refresh**: Delete file to force re-authentication

### Test Cleanup
- API tests clean up created campaigns automatically
- E2E tests use unique timestamps to avoid conflicts
- IC replica state is reset between test runs

## Troubleshooting

### Common Issues

#### 1. IC Replica Not Running
```bash
# Start IC replica
dfx start --background
dfx deploy
```

#### 2. Authentication Tests Failing
```bash
# Recreate auth state
rm frontend/storageState.json
npm run test:full-flow
```

#### 3. Port Conflicts
```bash
# Check if ports are in use
lsof -i :5173  # Frontend
lsof -i :4943  # IC replica
```

#### 4. Jest Tests Failing
```bash
# Clear Jest cache
npx jest --clearCache
```

### Debug Mode

#### Playwright Debug
```bash
cd frontend
npm run test:frontend:visual
```

#### Jest Debug
```bash
npm run test:api -- --verbose
```

## Visual Testing Features

### Browser Visibility
- **Headed Mode**: See browser window during test execution
- **UI Mode**: Interactive Playwright interface for step-by-step execution
- **Screenshots**: Automatic screenshots on test failures
- **Video Recording**: Videos saved for failed tests
- **Trace Files**: Detailed execution traces for debugging

### Test Report Access

After running tests, view the HTML report:

```bash
# From project root
npm run test:report

# Or directly
cd frontend && npx playwright show-report
```

The report includes:
- Test execution timeline
- Screenshots and videos
- Error details and stack traces
- Performance metrics
- Test artifacts

## Continuous Integration

### Pre-commit Hooks
- Tests run automatically before commits
- Must pass 100% to allow commit
- Version is automatically updated

### Test Coverage
- API tests cover all canister methods
- E2E tests cover critical user flows
- ckBTC tests cover Bitcoin integration

## Performance

### Test Execution Time
- **API Tests**: ~30 seconds
- **E2E Tests**: ~2 minutes
- **Full Suite**: ~3 minutes

### Optimization
- Tests run in parallel where possible
- IC replica reuse between tests
- Minimal test data creation

## Future Improvements

1. **Visual Regression Tests**: Screenshot comparisons
2. **Load Testing**: Performance under load
3. **Mobile Testing**: Responsive design tests
4. **Cross-browser Testing**: Firefox, Safari support
5. **Integration Tests**: Full user journey tests

## Contributing

When adding new features:
1. Add corresponding API tests
2. Update E2E tests for UI changes
3. Update ckBTC tests if applicable
4. Ensure all tests pass before committing
5. Update this documentation if needed

## Commands Reference

```bash
# All tests
npm run test

# API tests only
npm run test:api

# Frontend tests (headless)
npm run test:frontend

# Frontend tests (with browser)
npm run test:frontend:headed

# Frontend tests (visual UI)
npm run test:frontend:visual

# Full flow test (visual)
npm run test:full-flow

# View test report
npm run test:report

# Setup environment
npm run test:setup
```
