# Тестування Internet Identity

## Запуск проекту

1. **Локальна мережа вже запущена**
   ```bash
   # Перевірте, чи dfx запущений
   dfx ping
   ```

2. **Розгорнути canisters**
   ```bash
   dfx deploy
   ```

3. **Запустити фронтенд у режимі розробки**
   ```bash
   cd frontend
   npm run dev
   ```

4. **Або використовувати розгорнутий фронтенд**
   - Відкрийте: http://uzt4z-lp777-77774-qaabq-cai.localhost:4943/

## Тестування авторизації

### Крок 1: Вхід через Internet Identity

1. Відкрийте додаток у браузері
2. Натисніть "Увійти через Internet Identity"
3. Вас перенаправить на локальний Internet Identity
4. Створіть нову ідентичність або увійдіть в існуючу

### Крок 2: Перевірка Principal ID

1. Після успішної авторизації ви повернетеся до додатку
2. Натисніть "Оновити" біля Principal ID
3. Ви повинні побачити ваш унікальний Principal ID

### Крок 3: Реєстрація користувача

1. Заповніть форму реєстрації (ім'я та email)
2. Натисніть "Завершити реєстрацію"

### Крок 4: Створення кампанії

1. Заповніть форму створення кампанії
2. Виберіть валюти для донатів
3. Натисніть "Створити кампанію"

## Відладка

### Перевірка canister ID

Якщо виникають проблеми з підключенням, перевірте canister ID:

```bash
cat .dfx/local/canister_ids.json
```

Оновіть `frontend/src/canisters/index.js` з актуальним ID.

### Перевірка Internet Identity

Локальний Internet Identity доступний за адресою:
- http://rdmx6-jaaaa-aaaaa-aaadq-cai.localhost:4943/

### Логи браузера

Відкрийте Developer Tools (F12) і перевірте консоль на наявність помилок.

## Відомі проблеми

1. **Помилка "No such file or directory"** - переконайтеся, що dfx запущений
2. **Помилка авторизації** - перевірте, чи Internet Identity canister розгорнутий
3. **Помилка підключення до canister** - перевірте canister ID у фронтенді

## Корисні команди

```bash
# Перезапустити dfx
dfx stop
dfx start --clean --background

# Перебудувати фронтенд
cd frontend
npm run build

# Розгорнути тільки backend
dfx deploy user_canister

# Розгорнути тільки frontend
dfx deploy frontend
``` 