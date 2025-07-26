#!/bin/bash

set -e

echo "🚀 Starting deployment to Internet Computer mainnet..."

# Перевіряємо чи встановлений dfx
if ! command -v dfx &> /dev/null; then
    echo "❌ dfx is not installed. Please install it first:"
    echo "sh -ci \"\$(curl -fsSL https://internetcomputer.org/install.sh)\""
    exit 1
fi

# Перевіряємо чи є активна identity
if ! dfx identity whoami &> /dev/null; then
    echo "❌ No active dfx identity found."
    echo "Please create and use an identity:"
    echo "dfx identity new mainnet-identity --disable-encryption"
    echo "dfx identity use mainnet-identity"
    exit 1
fi

# Перевіряємо баланс
echo "💰 Checking balance..."
BALANCE=$(dfx ledger --network ic balance 2>/dev/null || echo "0")
echo "Current balance: $BALANCE"

if [[ "$BALANCE" == "0" ]]; then
    echo "⚠️  Warning: Balance is 0. You may need to add ICP to your account."
    echo "Visit https://nns.ic0.app/ to add ICP to your account."
    echo "Your principal: $(dfx identity --network ic get-principal)"
    read -p "Continue anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Збірка frontend
echo "🔨 Building frontend..."
cd frontend
npm run build
cd ..

# Створення canisters
echo "📦 Creating canisters..."
dfx canister --network ic create --all

# Розгортання backend
echo "🚀 Deploying backend canister..."
dfx deploy --network ic user_canister

# Оновлення canister IDs
echo "🔄 Updating canister IDs..."
node scripts/update-canister-ids.js

# Перебілд frontend з новими canister IDs
echo "🔨 Rebuilding frontend with updated canister IDs..."
cd frontend
npm run build
cd ..

# Розгортання frontend
echo "🚀 Deploying frontend canister..."
dfx deploy --network ic frontend

# Отримання фінальних canister IDs
USER_CANISTER_ID=$(dfx canister --network ic id user_canister)
FRONTEND_CANISTER_ID=$(dfx canister --network ic id frontend)

echo ""
echo "🎉 Deployment completed successfully!"
echo ""
echo "📱 Your application is now live at:"
echo "   Frontend: https://${FRONTEND_CANISTER_ID}.ic0.app/"
echo "   Candid UI: https://a4gq6-oaaaa-aaaab-qaa4q-cai.raw.ic0.app/?id=${USER_CANISTER_ID}"
echo ""
echo "🔧 Canister IDs:"
echo "   User Canister: ${USER_CANISTER_ID}"
echo "   Frontend Canister: ${FRONTEND_CANISTER_ID}"
echo ""
echo "📝 Next steps:"
echo "   1. Visit your frontend URL"
echo "   2. Create an Internet Identity at https://identity.ic0.app/"
echo "   3. Test your application"
echo ""
echo "💡 Useful commands:"
echo "   Check status: dfx canister --network ic status user_canister"
echo "   View logs: dfx canister --network ic call user_canister getAllUsers"
echo "   Add cycles: dfx canister --network ic deposit-cycles user_canister 1000000000000" 