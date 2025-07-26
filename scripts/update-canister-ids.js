#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Читаємо canister IDs з dfx
const { execSync } = require('child_process');

function getCanisterId(canisterName) {
  try {
    const output = execSync(`dfx canister --network ic id ${canisterName}`, { encoding: 'utf8' });
    return output.trim();
  } catch (error) {
    console.error(`Error getting canister ID for ${canisterName}:`, error.message);
    return null;
  }
}

function updateCanisterIds() {
  console.log('🔄 Updating canister IDs for production...');
  
  // Отримуємо canister IDs
  const userCanisterId = getCanisterId('user_canister');
  const frontendCanisterId = getCanisterId('frontend');
  
  if (!userCanisterId || !frontendCanisterId) {
    console.error('❌ Failed to get canister IDs. Make sure you have deployed to mainnet.');
    process.exit(1);
  }
  
  console.log(`📦 User Canister ID: ${userCanisterId}`);
  console.log(`📦 Frontend Canister ID: ${frontendCanisterId}`);
  
  // Оновлюємо frontend/src/canisters/index.js
  const frontendIndexPath = path.join(__dirname, '../frontend/src/canisters/index.js');
  
  if (fs.existsSync(frontendIndexPath)) {
    let content = fs.readFileSync(frontendIndexPath, 'utf8');
    
    // Замінюємо production canister ID
    content = content.replace(
      /"g7k3j-maaaa-aaaah-arinq-cai" \/\/ Production canister ID/,
      `"${userCanisterId}" // Production canister ID`
    );
    
    fs.writeFileSync(frontendIndexPath, content);
    console.log('✅ Updated frontend/src/canisters/index.js');
  }
  
  // Створюємо .env.production
  const envContent = `DFX_NETWORK=ic
VITE_CANISTER_HOST=https://ic0.app
VITE_USER_CANISTER_ID=${userCanisterId}
VITE_FRONTEND_CANISTER_ID=${frontendCanisterId}
`;
  
  fs.writeFileSync(path.join(__dirname, '../.env.production'), envContent);
  console.log('✅ Created .env.production');
  
  // Виводимо URL для доступу
  console.log('\n🎉 Deployment URLs:');
  console.log(`Frontend: https://${frontendCanisterId}.ic0.app/`);
  console.log(`Candid UI: https://a4gq6-oaaaa-aaaab-qaa4q-cai.raw.ic0.app/?id=${userCanisterId}`);
  
  console.log('\n📝 Next steps:');
  console.log('1. Run: cd frontend && npm run build');
  console.log('2. Run: dfx deploy --network ic frontend');
  console.log('3. Test your application at the frontend URL above');
}

// Запускаємо скрипт
updateCanisterIds(); 