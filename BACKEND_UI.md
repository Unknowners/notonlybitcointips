# Backend Candid UI

## Доступні функції бекенду

Для тестування та управління бекендом використовуйте Candid UI:

### Основні URL:

- **Frontend**: http://uzt4z-lp777-77774-qaabq-cai.localhost:4943/
- **Backend Candid UI**: http://127.0.0.1:4943/?canisterId=u6s2n-gx777-77774-qaaba-cai&id=uxrrr-q7777-77774-qaaaq-cai

## Доступні функції в Candid UI:

### Користувачі:
- `createUser(name: text, email: opt text) -> (bool)` - Створити користувача
- `getAllUsers() -> (vec User) query` - Отримати всіх користувачів
- `clearUsers() -> ()` - Очистити всіх користувачів (для тестування)

### Кампанії:
- `createCampaign(name: text, description: text, acceptedTokens: vec text) -> (text)` - Створити кампанію
- `getCampaign(id: text) -> (opt Campaign) query` - Отримати кампанію за ID
- `getUserCampaigns(userId: UserId) -> (vec Campaign) query` - Отримати кампанії користувача
- `getAllCampaigns() -> (vec Campaign) query` - Отримати всі кампанії

### Авторизація:
- `whoami() -> (principal) query` - Отримати Principal ID поточного користувача
- `userExists() -> (bool) query` - Перевірити чи існує користувач

### Діагностика:
- `debugCompare(userId: UserId) -> (vec (text, principal, bool)) query` - Порівняти користувачів
- `debugPrincipal(userId: UserId) -> (text) query` - Конвертувати Principal в текст

## Як використовувати Candid UI:

1. **Відкрийте посилання**: http://127.0.0.1:4943/?canisterId=u6s2n-gx777-77774-qaaba-cai&id=uxrrr-q7777-77774-qaaaq-cai

2. **Для очищення користувачів**:
   - Знайдіть функцію `clearUsers`
   - Натисніть "Call"
   - Це видалить всіх користувачів з бази даних

3. **Для перегляду користувачів**:
   - Використовуйте `getAllUsers` для перегляду всіх користувачів

4. **Для тестування авторизації**:
   - Використовуйте `whoami` для отримання Principal ID

## Типи даних:

```candid
type UserId = principal;
type CampaignId = text;

type User = record {
  id: UserId;
  name: text;
  email: opt text;
  createdAt: int;
};

type Campaign = record {
  id: CampaignId;
  name: text;
  description: text;
  owner: UserId;
  acceptedTokens: vec text;
  createdAt: int;
};
```

## Примітки:

- Функція `clearUsers` призначена тільки для тестування
- Всі функції з `query` не змінюють стан canister
- Функції без `query` можуть змінювати стан canister 