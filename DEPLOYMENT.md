# 🚀 Розгортання в Mainnet

## Підготовка до розгортання

### 1. Встановлення DFX (якщо ще не встановлено)
```bash
sh -ci "$(curl -fsSL https://internetcomputer.org/install.sh)"
```

### 2. Створення акаунту в Internet Computer

#### Крок 1: Відкрийте NNS (Network Nervous System)
- Перейдіть на: https://nns.ic0.app/
- Натисніть "Get ICP" або "Create Account"

#### Крок 2: Створення Internet Identity
- Перейдіть на: https://identity.ic0.app/
- Натисніть "Create Internet Identity"
- Виберіть метод аутентифікації (рекомендується браузер або пристрій)
- Запишіть ваш **Anchor ID** (це ваш унікальний ідентифікатор)

#### Крок 3: Отримання ICP токенів
- **Безкоштовно**: https://faucet.dfinity.org/ (для тестування)
- **Купівля**: Binance, Coinbase, або інші біржі
- **Мінімум для розгортання**: 1-2 ICP

### 3. Налаштування DFX для mainnet

```bash
# Ініціалізація identity для mainnet
dfx identity new mainnet-identity --disable-encryption

# Встановлення як активна identity
dfx identity use mainnet-identity

# Перевірка балансу
dfx ledger --network ic balance

# Якщо баланс порожній, поповніть через NNS
```

### 4. Поповнення балансу

#### Через NNS (рекомендується):
1. Відкрийте https://nns.ic0.app/
2. Увійдіть через Internet Identity
3. Перейдіть в "Accounts"
4. Натисніть "Send" на вашому акаунті
5. Введіть адресу вашого mainnet identity:
   ```bash
   dfx identity --network ic get-principal
   ```
6. Відправте мінімум 1-2 ICP

#### Через командний рядок:
```bash
# Отримання адреси для поповнення
dfx identity --network ic get-principal

# Перевірка балансу після поповнення
dfx ledger --network ic balance
```

## Розгортання проекту

### 1. Підготовка проекту
```bash
# Збірка frontend
cd frontend
npm run build
cd ..

# Перевірка конфігурації
dfx canister --network ic create --all
```

### 2. Розгортання в mainnet
```bash
# Розгортання всіх canisters
dfx deploy --network ic

# Або розгортання по одному
dfx deploy --network ic user_canister
dfx deploy --network ic frontend
```

### 3. Перевірка розгортання
```bash
# Отримання canister IDs
dfx canister --network ic id user_canister
dfx canister --network ic id frontend

# Перевірка статусу
dfx canister --network ic status user_canister
dfx canister --network ic status frontend
```

## Налаштування frontend для production

### 1. Оновлення canister ID
Після розгортання оновіть `frontend/src/canisters/index.js`:
```javascript
export const canisterId = "YOUR_ACTUAL_CANISTER_ID"; // Замініть на реальний ID
```

### 2. Оновлення environment variables
Створіть `.env.production`:
```env
DFX_NETWORK=ic
VITE_CANISTER_HOST=https://ic0.app
```

### 3. Перебілд та redeploy
```bash
cd frontend
npm run build
cd ..
dfx deploy --network ic frontend
```

## Перевірка роботи

### 1. Відкрийте додаток
URL буде показаний після розгортання, зазвичай:
```
https://YOUR_FRONTEND_CANISTER_ID.ic0.app/
```

### 2. Тестування
- Увійдіть через Internet Identity
- Створіть тестову кампанію
- Перевірте всі функції

## Корисні команди

```bash
# Перегляд логів
dfx canister --network ic call user_canister getAllUsers

# Очищення (тільки для тестування)
dfx canister --network ic call user_canister clearUsers

# Отримання інформації про canister
dfx canister --network ic info user_canister
```

## Troubleshooting

### Помилка "Insufficient cycles"
```bash
# Поповнення cycles
dfx canister --network ic deposit-cycles user_canister 1000000000000
```

### Помилка авторизації
- Перевірте, чи використовується правильний Internet Identity URL
- Переконайтеся, що ви увійшли через https://identity.ic0.app/

### Помилка збірки
```bash
# Очищення кешу
dfx stop
dfx start --clean
```

## Корисні посилання

- [Internet Computer Documentation](https://internetcomputer.org/docs)
- [Internet Identity](https://identity.ic0.app/)
- [NNS Dashboard](https://nns.ic0.app/)
- [Cycles Faucet](https://faucet.dfinity.org/)
- [IC Explorer](https://dashboard.internetcomputer.org/) 