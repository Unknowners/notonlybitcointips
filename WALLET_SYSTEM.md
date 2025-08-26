# Система Гаманців для Crowdfunding dApp

## Огляд

Цей документ описує реалізовану систему гаманців для crowdfunding dApp на Internet Computer (ICP), яка дозволяє кожній кампанії мати унікальний гаманець для прийому пожертвувань в ICP та ckBTC.

## Архітектура

### 1. Генерація Account ID

Кожна кампанія має унікальний account ID, який генерується на основі:
- **User Principal ID** - унікальний ідентифікатор користувача від Internet Identity
- **Campaign ID** - унікальний ідентифікатор кампанії

```
account_id = CRC32(h) || h
де h = SHA224("\x0Aaccount-id" || user_principal || campaign_subaccount)
```

### 2. Формула генерації (Frontend)

```typescript
// Функція для генерації account ID згідно з ICP стандартами
export async function generateAccountId(userPrincipal: string, campaignId: string): Promise<string> {
  const principal = Principal.fromText(userPrincipal);
  const campaignBytes = new TextEncoder().encode(campaignId);
  const subaccount = new Uint8Array(32);
  
  // Копіюємо campaign ID bytes в subaccount
  for (let i = 0; i < Math.min(campaignBytes.length, 32); i++) {
    subaccount[i] = campaignBytes[i];
  }
  
  // Генеруємо account identifier згідно з ICP стандартами
  const accountIdentifier = await generateAccountIdentifier(principal, subaccount);
  return accountIdentifier;
}
```

### 3. Стандарт ICP Account Identifier

```typescript
// account_identifier(principal,subaccount_identifier) = CRC32(h) || h
// де h = sha224("\x0Aaccount-id" || principal || subaccount_identifier)
export async function generateAccountIdentifier(principal: Principal, subaccount: Uint8Array): Promise<string> {
  const domainSeparator = new Uint8Array([0x0A, ...new TextEncoder().encode('account-id')]);
  const principalBytes = principal.toUint8Array();
  
  // Об'єднуємо всі частини: domain_separator + principal + subaccount
  const data = new Uint8Array(domainSeparator.length + principalBytes.length + subaccount.length);
  data.set(domainSeparator, 0);
  data.set(principalBytes, domainSeparator.length);
  data.set(subaccount, domainSeparator.length + principalBytes.length);
  
  // Генеруємо SHA-256 hash і беремо перші 28 байт (SHA-224)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = new Uint8Array(hashBuffer);
  const h = hashArray.slice(0, 28);
  
  // Генеруємо CRC32 checksum
  const checksum = crc32(h);
  
  // Формуємо фінальний account identifier: CRC32(h) || h
  const result = new Uint8Array(4 + h.length);
  result[0] = (checksum >>> 24) & 0xFF;
  result[1] = (checksum >>> 16) & 0xFF;
  result[2] = (checksum >>> 8) & 0xFF;
  result[3] = checksum & 0xFF;
  result.set(h, 4);
  
  // Конвертуємо в hex string
  return Array.from(result)
    .map(byte => byte.toString(16).padStart(2, '0'))
    .join('');
}
```

## Функціональність

### 1. Створення Кампанії

При створенні кампанії:
- Генерується унікальний Campaign ID
- Обчислюється Account ID на основі user principal + campaign ID
- Зберігається в canister разом з метаданими кампанії
- Підтримка різних токенів (ICP, ckBTC)

### 2. Відображення Балансу

- **Frontend (Query calls)**: Оновлення балансу кожні 10 секунд
- **Backend (Update calls)**: Виведення коштів тільки при натисканні кнопки "Withdraw"
- **Підтримка багатьох токенів**: ICP та ckBTC баланси окремо

### 3. Операційний Потік

#### Авторизація користувача:
1. Логін через Internet Identity
2. Отримання user principal ID
3. Перевірка існування користувача в системі

#### Створення кампанії:
1. Генерація campaign_id
2. Обчислення унікального account_id = hash(user_principal + campaign_id)
3. Збереження метаданих кампанії в canister
4. Вибір прийнятих токенів (ICP, ckBTC)

#### Пожертвування:
1. Відображення account_id кампанії (hex та QR код)
2. Пряме відправлення ICP на account_id
3. Пряме відправлення ckBTC на account_id
4. Автоматичне оновлення балансу кожні 10 секунд

#### Виведення коштів:
1. Власник кампанії вводить цільову адресу
2. Вказує суму для виведення
3. Backend виконує transfer через ICP Ledger canister
4. Підтримка виведення ckBTC через ckBTC Minter

## Технічні Деталі

### Backend (user_canister.mo)

```motoko
type Campaign = {
    id: CampaignId;
    name: Text;
    description: Text;
    owner: UserId;
    acceptedTokens: [Text]; // ["ICP", "ckBTC"]
    subaccount: Blob;
    accountId: AccountId;
    createdAt: Nat64;
};

type TransferRequest = {
    campaignId: CampaignId;
    targetAddress: Text;
    amount: Nat64;
    tokenType: Text; // "ICP" або "ckBTC"
};
```

### Frontend

#### Основні файли:
- `ledger.ts` - функції для роботи з ICP Ledger
- `ckbtc.ts` - функції для роботи з ckBTC
- `account.ts` - функція генерації account ID

#### ckBTC Інтеграція:

```typescript
// Отримання ckBTC адреси для депозиту
export async function getCkBtcDepositAddress(identity: any, owner?: any, subaccount?: Uint8Array): Promise<string>

// Отримання ckBTC балансу
export async function getCkBtcBalance(identity: any, owner: any, subaccount?: Uint8Array): Promise<bigint>

// Оновлення балансу після депозиту
export async function pollUpdateBalance(identity: any, owner?: any, subaccount?: Uint8Array, intervalMs = 4000, maxAttempts = 20): Promise<'credited' | 'timeout' | 'error'>

// Оцінка комісії за виведення
export async function estimateWithdrawFee(identity: any, address: string, amountE8s: bigint): Promise<{ total: bigint; minter: bigint; bitcoin: bigint }>

// Виведення ckBTC
export async function withdrawCkBtc(identity: any, address: string, amountE8s: bigint): Promise<{ ok?: bigint; err?: string }>
```

#### ICP Ledger Інтеграція:

```typescript
// Отримання реального балансу account
export async function getRealAccountBalance(accountId: string): Promise<bigint>

// Виведення ICP
export async function transferICP(to: string, amount: bigint, fromSubaccount?: Uint8Array, identity?: any, memo?: bigint): Promise<{ success: boolean; blockHeight?: bigint; error?: string }>

// Конвертація e8s ↔ ICP
export function e8sToICP(e8s: bigint): number
export function icpToE8s(icp: number): bigint
```

### Canister IDs

#### Mainnet:
- **ICP Ledger**: `ryjl3-tyaaa-aaaaa-aaaba-cai`
- **ckBTC Minter**: `mqygn-kiaaa-aaaar-qaadq-cai`
- **ckBTC Ledger**: `mxzaz-hqaaa-aaaar-qaada-cai`

#### Local Development:
- Використовується `localhost:4943` для тестування

## Безпека

1. **Авторизація**: Тільки власник кампанії може виводити кошти
2. **Валідація**: Перевірка адрес та сум перед виведенням
3. **Прозорість**: Всі транзакції відкриті для перевірки
4. **Криптографічна безпека**: Використання SHA-224 та CRC32 для account ID
5. **Principal validation**: Завжди перевіряється ідентичність викликача

## Переваги Реалізації

1. **Унікальність**: Кожна кампанія має свій гаманець
2. **Безпека**: Кошти належать користувачу, не dApp
3. **Прозорість**: Можна перевірити баланс будь-якої кампанії
4. **Масштабованість**: Підтримка багатьох кампаній на користувача
5. **Сумісність**: Використовує стандартні ICP account ID
6. **Мультитокенність**: Підтримка ICP та ckBTC
7. **Стандарти**: Повна відповідність ICP специфікаціям

## Майбутні Покращення

### 1. Розширена Підтримка Токенів
- **SNS токени**: Інтеграція з SNS (Service Nervous System) токенами
- **ICRC-2**: Підтримка approve/transferFrom для DeFi протоколів
- **Wrapped токени**: wETH, wBTC на ICP
- **Stablecoins**: USDC, USDT на ICP

### 2. DeFi Інтеграція
- **Liquidity Pools**: Автоматичне розміщення коштів у пули ліквідності
- **Yield Farming**: Заробіток на депозитах кампаній
- **Flash Loans**: Короткострокові позики для кампаній
- **Staking**: Стейкінг токенів для отримання додаткових винагород

### 3. Розширена Аналітика
- **Real-time Dashboard**: Детальна статистика пожертвувань
- **Donor Analytics**: Аналіз поведінки донорів
- **Campaign Performance**: Метрики успішності кампаній
- **Token Flow Tracking**: Відстеження руху коштів між токенами

### 4. Сповіщення та Комунікація
- **Push Notifications**: Миттєві сповіщення про пожертвування
- **Email Integration**: Автоматичні email повідомлення
- **SMS Alerts**: SMS сповіщення для критичних подій
- **Social Media**: Інтеграція з Twitter, Telegram, Discord

### 5. Розширена Безпека
- **Multi-signature Wallets**: Багатосторонні гаманці для великих сум
- **Time-locks**: Затримка виведення коштів
- **Audit Trails**: Повна історія всіх операцій
- **Insurance**: Страхування коштів кампаній

### 6. API та Інтеграції
- **Public API**: REST API для перевірки балансів
- **Webhook System**: Автоматичні сповіщення про транзакції
- **Third-party Integrations**: Підключення до зовнішніх сервісів
- **Mobile SDK**: Нативні мобільні додатки

### 7. Гейміфікація
- **Achievement System**: Досягнення для донорів
- **Leaderboards**: Рейтинги найактивніших учасників
- **NFT Rewards**: Унікальні NFT за пожертвування
- **Social Features**: Спільноти навколо кампаній

### 8. Масштабування
- **Layer 2 Solutions**: Інтеграція з ICP Layer 2
- **Cross-chain Bridges**: Міст між різними блокчейнами
- **Subnet Architecture**: Розподіл навантаження між підмережами
- **Sharding**: Горизонтальне масштабування даних

## Використання

1. Зайдіть на сайт та авторизуйтесь через Internet Identity
2. Створіть кампанію з описом та прийнятими валютами (ICP, ckBTC)
3. Поділіться QR кодом або адресою для пожертвувань
4. Відстежуйте баланс в реальному часі для кожного токена
5. Виводьте кошти на свій гаманець при необхідності
6. Використовуйте ckBTC для Bitcoin пожертвувань без високих комісій 