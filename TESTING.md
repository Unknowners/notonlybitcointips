# Testing Guide

This document provides comprehensive testing instructions for the Not Only Bitcoin Tips application.

## Prerequisites

Before testing, ensure you have:
- DFX installed and configured
- Node.js and npm installed
- Local Internet Computer replica running
- All canisters deployed

## Local Testing Setup

### Step 1: Start Local Environment

```bash
# Start local replica
dfx start --clean --background

# Deploy canisters
dfx deploy

# Start frontend development server
cd frontend && npm run dev
```

### Step 2: Internet Identity Setup

1. Open http://127.0.0.1:4943/?canisterId=umunu-kh777-77774-qaaca-cai&id=u6s2n-gx777-77774-qaaba-cai
2. Create a new identity or sign in to existing one
3. Note your Principal ID for testing

### Step 3: User Registration

1. Open http://localhost:5173
2. Click "Sign in with Internet Identity"
3. Fill out the registration form (name and email)
4. Click "Complete Registration"

### Step 4: Campaign Creation

1. Fill out the campaign creation form
2. Select currencies for donations
3. Click "Create Campaign"
4. Verify QR code and link generation

## Test Scenarios

### Authentication Flow

- [ ] User can sign in with Internet Identity
- [ ] User can see their Principal ID
- [ ] User can logout successfully
- [ ] User registration works correctly

### Campaign Management

- [ ] User can create new campaigns
- [ ] Campaign details are saved correctly
- [ ] QR codes are generated properly
- [ ] Campaign links work correctly

### Data Persistence

- [ ] Campaigns persist after page refresh
- [ ] User data is saved correctly
- [ ] Campaign retrieval works properly

## API Testing

### User Canister Methods

Test the following methods via Candid UI:

1. **whoami()** - Should return Principal ID
2. **createUser(name, email)** - Should create user
3. **userExists()** - Should return true for existing users
4. **createCampaign(name, description, tokens)** - Should create campaign
5. **getCampaign(id)** - Should return campaign details
6. **getUserCampaigns(userId)** - Should return user's campaigns

### Candid UI Access

- Local: http://127.0.0.1:4943/?canisterId=umunu-kh777-77774-qaaca-cai&id=uzt4z-lp777-77774-qaabq-cai

## Troubleshooting

### Common Issues

1. **"No such file or directory" error** - Make sure dfx is running
2. **Authentication error** - Check if Internet Identity canister is deployed
3. **Connection error to canister** - Verify canister ID in frontend

### Debug Steps

1. Check browser console for errors
2. Verify canister IDs in frontend/.env
3. Check dfx logs: `dfx logs`
4. Restart local replica if needed

## Performance Testing

### Load Testing

- Test with multiple campaigns
- Verify QR code generation performance
- Check memory usage with large datasets

### Browser Compatibility

Test in:
- Chrome (recommended)
- Firefox
- Safari
- Edge

## Security Testing

### Authentication

- Verify Internet Identity integration
- Test logout functionality
- Check session management

### Data Validation

- Test with invalid input data
- Verify error handling
- Check XSS prevention

## Reporting Issues

When reporting issues, include:
- Browser and version
- DFX version
- Error messages from console
- Steps to reproduce
- Expected vs actual behavior 