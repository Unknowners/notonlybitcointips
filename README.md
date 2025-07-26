# Donation Hub - ICP DApp

DApp для створення кампаній збору коштів на Internet Computer з підтримкою авторизації через Internet Identity.

## Особливості

- 🔐 Авторизація через Internet Identity
- 🎯 Створення кампаній збору коштів
- 📱 QR-коди для поширення кампаній
- 💰 Підтримка різних валют (ICP, BTC, ETH, USDT)
- 🎨 Сучасний UI з Tailwind CSS

## Технології

- **Backend**: Motoko (Internet Computer)
- **Frontend**: React + TypeScript + Vite
- **Авторизація**: Internet Identity
- **Стилізація**: Tailwind CSS

## Встановлення та запуск

### Передумови

1. Встановіть [DFX](https://internetcomputer.org/docs/current/developer-docs/setup/install/)
2. Встановіть Node.js (версія 16 або вище)

### Кроки запуску

1. **Клонуйте репозиторій**
   ```bash
   git clone <repository-url>
   cd notonlybitcointips
   ```

2. **Встановіть залежності фронтенду**
   ```bash
   cd frontend
   npm install
   cd ..
   ```

3. **Запустіть локальну мережу Internet Computer**
   ```bash
   dfx start --clean --background
   ```

4. **Розгорніть canisters**
   ```bash
   dfx deploy
   ```

5. **Запустіть фронтенд у режимі розробки**
   ```bash
   cd frontend
   npm run dev
   ```

6. **Відкрийте браузер**
   - Локальний фронтенд: http://localhost:5173
   - Розгорнутий фронтенд: http://127.0.0.1:4943

## Використання

### Авторизація

1. Відкрийте додаток у браузері
2. Натисніть "Увійти через Internet Identity"
3. Слідуйте інструкціям для створення або входу в Internet Identity
4. Після успішної авторизації ви побачите свій Principal ID

### Створення кампанії

1. Після авторизації заповніть форму реєстрації
2. Перейдіть до створення кампанії
3. Заповніть назву, опис та виберіть валюти для донатів
4. Натисніть "Створити кампанію"
5. Скопіюйте лінк або QR-код для поширення

## Структура проекту

```
notonlybitcointips/
├── backend/
│   ├── user_canister.mo      # Motoko canister
│   └── user_canister.did     # Candid interface
├── frontend/
│   ├── src/
│   │   ├── App.tsx           # Головний компонент
│   │   ├── MainApp.tsx       # Основний інтерфейс з авторизацією
│   │   ├── CampaignPage.tsx  # Сторінка кампанії
│   │   └── canisters/        # Генеровані файли для роботи з canisters
│   ├── package.json
│   └── vite.config.ts
└── dfx.json                  # Конфігурація DFX
```

## Internet Identity

Проект використовує Internet Identity для авторизації користувачів. При локальній розробці використовується локальний Internet Identity canister.

### Налаштування для різних мереж

- **Локальна розробка**: `http://rdmx6-jaaaa-aaaaa-aaadq-cai.localhost:4943`
- **Mainnet**: `https://identity.ic0.app`

## Розробка

### Локальна розробка фронтенду

Для швидкої розробки використовуйте локальний сервер:

```bash
cd frontend
npm run dev
```

Це дозволить використовувати Hot Module Reloading для миттєвих змін.

### Розгортання змін

Після внесення змін у код:

```bash
# Для змін у backend
dfx deploy

# Для змін у frontend
dfx deploy frontend
```

## Ліцензія

MIT License
