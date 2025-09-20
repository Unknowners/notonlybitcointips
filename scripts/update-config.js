#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Load configuration
const configPath = path.join(__dirname, '..', 'config.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

// Update canister_ids.json
const canisterIdsPath = path.join(__dirname, '..', 'canister_ids.json');
const canisterIds = {
  user_canister: {
    local: config.canisterIds.local.user_canister
  },
  frontend: {
    local: config.canisterIds.local.frontend
  },
  internet_identity: {
    local: config.canisterIds.local.internet_identity
  }
};

fs.writeFileSync(canisterIdsPath, JSON.stringify(canisterIds, null, 2));

// Update frontend canister IDs
const frontendCanisterPath = path.join(__dirname, '..', 'frontend', 'src', 'canisters', 'index.js');
let frontendCanisterContent = fs.readFileSync(frontendCanisterPath, 'utf8');

// Replace canister IDs
frontendCanisterContent = frontendCanisterContent.replace(
  /export const userCanisterId = "[^"]*"/,
  `export const userCanisterId = "${config.canisterIds.local.user_canister}"`
);

frontendCanisterContent = frontendCanisterContent.replace(
  /export const internetIdentityCanisterId = "[^"]*"/,
  `export const internetIdentityCanisterId = "${config.canisterIds.local.internet_identity}"`
);

fs.writeFileSync(frontendCanisterPath, frontendCanisterContent);

// Update environment variables for testing
const envPath = path.join(__dirname, '..', '.env.local');
const envContent = `# Local development environment
CANISTER_ID_USER_CANISTER=${config.canisterIds.local.user_canister}
CANISTER_ID_FRONTEND=${config.canisterIds.local.frontend}
CANISTER_ID_INTERNET_IDENTITY=${config.canisterIds.local.internet_identity}
PLAYWRIGHT_BASE_URL=${config.testing.playwright_base_url}
`;

fs.writeFileSync(envPath, envContent);

console.log('✅ Configuration updated successfully');
console.log('📋 Canister IDs:');
console.log(`   User Canister: ${config.canisterIds.local.user_canister}`);
console.log(`   Frontend: ${config.canisterIds.local.frontend}`);
console.log(`   Internet Identity: ${config.canisterIds.local.internet_identity}`);
