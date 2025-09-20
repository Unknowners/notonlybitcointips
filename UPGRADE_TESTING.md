# Upgrade Testing Guide

## Manual postupgrade Testing

This guide describes how to manually test the postupgrade functionality to ensure campaigns are properly restored after canister upgrades.

### Prerequisites

1. IC replica running locally (`dfx start --background`)
2. Canister deployed (`dfx deploy`)
3. Frontend running (optional, for UI testing)

### Test Scenario

#### Step 1: Create Test Data

1. **Create a user:**
   ```bash
   dfx canister call user_canister createUser '("Test User", opt "test@example.com")'
   ```

2. **Create multiple campaigns:**
   ```bash
   # Campaign 1
   dfx canister call user_canister createCampaign '("Test Campaign 1", "Description 1", vec {"ICP"})'
   
   # Campaign 2
   dfx canister call user_canister createCampaign '("Test Campaign 2", "Description 2", vec {"ICP"; "BTC"})'
   
   # Campaign 3
   dfx canister call user_canister createCampaign '("Test Campaign 3", "Description 3", vec {"ICP"})'
   ```

3. **Verify campaigns exist:**
   ```bash
   dfx canister call user_canister getAllCampaigns
   ```

#### Step 2: Simulate Upgrade

1. **Deploy with upgrade (this triggers preupgrade/postupgrade):**
   ```bash
   dfx deploy --upgrade-unchanged
   ```

#### Step 3: Verify Data Restoration

1. **Check that all campaigns still exist:**
   ```bash
   dfx canister call user_canister getAllCampaigns
   ```

2. **Verify specific campaign data:**
   ```bash
   # Get campaign ID from previous output
   dfx canister call user_canister getCampaign '("CAMPAIGN_ID")'
   ```

3. **Verify account IDs are still accessible:**
   ```bash
   dfx canister call user_canister getCampaignAccountId '("CAMPAIGN_ID")'
   ```

4. **Verify users still exist:**
   ```bash
   dfx canister call user_canister getAllUsers
   ```

### Expected Results

- All campaigns created before upgrade should still exist
- Campaign data (name, description, owner, etc.) should be identical
- Account IDs should remain the same
- Users should still exist
- No data loss should occur

### Troubleshooting

If campaigns are lost after upgrade:

1. **Check postupgrade logs:**
   ```bash
   dfx canister call user_canister --query getAllCampaigns
   ```

2. **Verify preupgrade worked:**
   - Check if campaigns were serialized to persistent storage
   - Look for any error messages during upgrade

3. **Check postupgrade implementation:**
   - Ensure local copies are created before clearing arrays
   - Verify HashMap.fromIter is called with correct parameters
   - Confirm arrays are only cleared after successful restoration

### Automated Testing

Run the automated tests:

```bash
# Run API tests
npm run test:api

# Run specific postupgrade test
npm test -- --testNamePattern="postupgrade data restoration verification"
```

### Code Review Checklist

- [ ] `preupgrade()` serializes data to persistent arrays
- [ ] `postupgrade()` creates local copies before clearing arrays
- [ ] `postupgrade()` restores HashMaps from copied data
- [ ] `postupgrade()` only clears arrays after successful restoration
- [ ] Debug logging is present for verification
- [ ] Error handling prevents data loss
- [ ] Tests cover the postupgrade scenario