# Backend API Documentation

This document describes the backend API for the Not Only Bitcoin Tips application.

## Canister: user_canister

### Users:
- `createUser(name: text, email: opt text) -> (bool)` - Create a new user
- `userExists() -> (bool) query` - Check if current user exists
- `whoami() -> (principal) query` - Get current user's Principal ID

### Campaigns:
- `createCampaign(name: text, description: text, acceptedTokens: vec text) -> (text)` - Create a campaign
- `getCampaign(id: text) -> (opt Campaign) query` - Get campaign by ID
- `getUserCampaigns(userId: UserId) -> (vec Campaign) query` - Get user's campaigns
- `getAllCampaigns() -> (vec Campaign) query` - Get all campaigns

## Data Types

### User
```motoko
type User = {
  id: UserId;
  name: text;
  email: opt text;
  createdAt: nat64;
};
```

### Campaign
```motoko
type Campaign = {
  id: text;
  name: text;
  description: text;
  owner: UserId;
  acceptedTokens: vec text;
  createdAt: nat64;
};
```

### UserId
```motoko
type UserId = principal;
```

## Usage Examples

### Creating a User
```javascript
const result = await actor.createUser("John Doe", ["john@example.com"]);
console.log("User created:", result);
```

### Creating a Campaign
```javascript
const campaignId = await actor.createCampaign(
  "Support Ukraine", 
  "Help people affected by war", 
  ["ICP", "BTC", "ETH"]
);
console.log("Campaign ID:", campaignId);
```

### Getting User Campaigns
```javascript
const principal = await actor.whoami();
const campaigns = await actor.getUserCampaigns(principal.toString());
console.log("User campaigns:", campaigns);
```

## Error Handling

The backend returns appropriate error messages for:
- Invalid input data
- User not found
- Campaign not found
- Authentication failures

## Testing

Use the Candid UI to test the API:
- Local: http://127.0.0.1:4943/?canisterId=umunu-kh777-77774-qaaca-cai&id=uzt4z-lp777-77774-qaabq-cai 