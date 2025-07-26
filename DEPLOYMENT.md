# Deployment Guide

This guide covers deploying the Not Only Bitcoin Tips application to the Internet Computer mainnet.

## Prerequisites

### 1. DFX Installation
Ensure you have DFX installed and updated:
```bash
sh -ci "$(curl -fsSL https://internetcomputer.org/install.sh)"
dfx --version
```

### 2. Internet Computer Account Setup
- Create Internet Identity: https://identity.ic0.app/
- Add ICP to your account: https://nns.ic0.app/
- Set up dfx identity: `dfx identity new mainnet-identity`

## Local Development Setup

### Step 1: Start Local Environment
```bash
# Start local replica
dfx start --clean --background

# Deploy canisters
dfx deploy
```

### Step 2: Internet Identity Setup
1. Open local Internet Identity: http://127.0.0.1:4943/?canisterId=umunu-kh777-77774-qaaca-cai&id=u6s2n-gx777-77774-qaaba-cai
2. Create a new identity for testing
3. Note your Principal ID

### Step 3: Environment Configuration
```bash
# Create frontend environment file
cd frontend
echo "VITE_CANISTER_ID_USER_CANISTER=$(dfx canister id user_canister)" > .env
echo "VITE_CANISTER_ID_INTERNET_IDENTITY=$(dfx canister id internet_identity)" >> .env
echo "VITE_CANISTER_HOST=http://127.0.0.1:4943" >> .env
echo "DFX_NETWORK=local" >> .env
echo "VITE_DFX_NETWORK=local" >> .env
```

## Mainnet Deployment

### Automated Deployment
Use the provided script for automatic deployment:
```bash
./scripts/deploy-to-mainnet.sh
```

### Manual Deployment Steps

#### Step 1: Prepare Identity
```bash
# Create mainnet identity
dfx identity new mainnet-identity

# Use mainnet identity
dfx identity use mainnet-identity

# Check balance
dfx ledger --network ic balance
```

#### Step 2: Deploy Canisters
```bash
# Create canisters on mainnet
dfx canister --network ic create --all

# Deploy backend
dfx deploy --network ic user_canister

# Update canister IDs
node scripts/update-canister-ids.js
```

#### Step 3: Deploy Frontend
```bash
# Build frontend
cd frontend && npm run build && cd ..

# Deploy frontend
dfx deploy --network ic frontend
```

#### Step 4: Verify Deployment
```bash
# Check canister status
dfx canister --network ic status frontend
dfx canister --network ic status user_canister
```

## Configuration Files

### dfx.json
```json
{
  "canisters": {
    "user_canister": {
      "main": "backend/user_canister.mo",
      "type": "motoko"
    },
    "frontend": {
      "dependencies": ["user_canister"],
      "frontend": {
        "entrypoint": "frontend/index.html"
      },
      "source": ["frontend/dist"],
      "type": "assets"
    },
    "internet_identity": {
      "candid": "https://github.com/dfinity/internet-identity/releases/latest/download/internet_identity.did",
      "type": "custom",
      "remote": {
        "id": {
          "ic": "rdmx6-jaaaa-aaaaa-aaadq-cai"
        }
      },
      "wasm": "https://github.com/dfinity/internet-identity/releases/latest/download/internet_identity_dev.wasm.gz"
    }
  }
}
```

### canister_ids.json
```json
{
  "frontend": {
    "ic": "your-frontend-canister-id",
    "local": "local-frontend-canister-id"
  },
  "user_canister": {
    "ic": "your-user-canister-id",
    "local": "local-user-canister-id"
  },
  "internet_identity": {
    "ic": "rdmx6-jaaaa-aaaaa-aaadq-cai",
    "local": "local-internet-identity-canister-id"
  }
}
```

## Testing Deployment

### 1. Authentication Test
1. Open your deployed frontend URL
2. Click "Sign in with Internet Identity"
3. Create a new identity or sign in to existing one

### 2. User Registration Test
1. Fill out the registration form
2. Verify user creation

### 3. Campaign Creation Test
1. Create a test campaign
2. Verify QR code generation
3. Test campaign link sharing

## Troubleshooting

### Insufficient Cycles Error
```bash
# Check canister cycles
dfx canister --network ic status frontend

# Add cycles if needed
dfx canister --network ic deposit-cycles 1000000000000 frontend
```

### Authentication Issues
- Verify Internet Identity canister is deployed
- Check frontend environment variables
- Ensure proper network configuration

### Build Errors
- Check Node.js version compatibility
- Verify all dependencies are installed
- Check for TypeScript compilation errors

## Monitoring

### Canister Metrics
```bash
# Check canister status
dfx canister --network ic status user_canister

# View canister logs
dfx canister --network ic call user_canister getAllCampaigns
```

### Performance Monitoring
- Monitor canister cycles usage
- Check response times
- Monitor error rates

## Security Considerations

### Environment Variables
- Never commit sensitive data to version control
- Use environment-specific configuration
- Validate all user inputs

### Canister Permissions
- Review canister access controls
- Implement proper authentication checks
- Validate user permissions

## Maintenance

### Regular Updates
```bash
# Update DFX
sh -ci "$(curl -fsSL https://internetcomputer.org/install.sh)"

# Update dependencies
npm update
```

### Backup Strategy
- Regular canister state backups
- Configuration file backups
- User data export capabilities

## Support

For deployment issues:
- Check [Internet Computer documentation](https://internetcomputer.org/docs/current/developer-docs/)
- Review [DFX documentation](https://internetcomputer.org/docs/current/developer-docs/setup/install/)
- Open issues in the project repository 