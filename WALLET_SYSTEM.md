# Система Гаманців для Crowdfunding dApp

## Огляд

Цей документ описує реалізовану систему гаманців для crowdfunding dApp на Internet Computer (ICP), яка дозволяє кожній кампанії мати унікальний гаманець для прийому пожертвувань.

## Архітектура

### 1. Генерація Account ID

Кожна кампанія має унікальний account ID, який генерується на основі:
- **User Principal ID** - унікальний ідентифікатор користувача від Internet Identity
- **Campaign ID** - унікальний ідентифікатор кампанії

```
account_id = hash(user_principal + campaign_id)
```

### 2. Формула генерації

```motoko
private func generateAccountId(userPrincipal: Principal, campaignId: Text) : AccountId {
    // 1. Конвертуємо user principal в bytes
    let userBytes = Principal.toBlob(userPrincipal);
    
    // 2. Конвертуємо campaign ID в bytes (32-byte subaccount)
    let campaignBytes = Text.encodeUtf8(campaignId);
    let paddedCampaignBytes = Array.tabulate<Nat8>(32, func(i : Nat) : Nat8 {
        if (i < campaignBytes.size()) { campaignBytes[i] } else { 0 }
    });
    
    // 3. Об'єднуємо user principal + campaign ID
    let combinedBytes = Buffer.Buffer<Nat8>(userBytes.size() + paddedCampaignBytes.size());
    for (byte in userBytes.vals()) {
        combinedBytes.add(byte);
    };
    for (byte in paddedCampaignBytes.vals()) {
        combinedBytes.add(byte);
    };
    
    // 4. Хешуємо комбінацію
    let hash = SHA256.sha256(Blob.fromArray(Buffer.toArray(combinedBytes)));
    let hashBytes = Blob.toArray(hash);
    
    // 5. Беремо перші 28 байт для account ID
    let accountBytes = Array.tabulate<Nat8>(28, func(i : Nat) : Nat8 {
        hashBytes[i]
    });
    
    // 6. Генеруємо CRC32 checksum
    let checksum = CRC32.crc32(Blob.fromArray(accountBytes));
    let checksumBytes = Blob.toArray(checksum);
    
    // 7. Об'єднуємо checksum + account bytes
    let result = Buffer.Buffer<Nat8>(checksumBytes.size() + accountBytes.size());
    for (byte in checksumBytes.vals()) {
        result.add(byte);
    };
    for (byte in accountBytes.vals()) {
        result.add(byte);
    };
    
    // 8. Конвертуємо в hex string
    let hexString = Array.foldLeft<Nat8, Text>(
        Buffer.toArray(result),
        "",
        func(acc : Text, byte : Nat8) : Text {
            acc # Nat8.toText(byte, 16).padStart(2, '0')
        }
    );
    
    hexString
}
```

## Функціональність

### 1. Створення Кампанії

При створенні кампанії:
- Генерується унікальний Campaign ID
- Обчислюється Account ID на основі user principal + campaign ID
- Зберігається в canister разом з метаданими кампанії

### 2. Відображення Балансу

- **Frontend (Query calls)**: Оновлення балансу кожні 10 секунд
- **Backend (Update calls)**: Виведення коштів тільки при натисканні кнопки "Withdraw"

### 3. Операційний Потік

#### Авторизація користувача:
1. Логін через Internet Identity
2. Отримання user principal ID
3. Перевірка існування користувача в системі

#### Створення кампанії:
1. Генерація campaign_id
2. Обчислення унікального account_id = hash(user_principal + campaign_id)
3. Збереження метаданих кампанії в canister

#### Пожертвування:
1. Відображення account_id кампанії (hex та QR код)
2. Пряме відправлення ICP на account_id
3. Автоматичне оновлення балансу кожні 10 секунд

#### Виведення коштів:
1. Власник кампанії вводить цільову адресу
2. Вказує суму для виведення
3. Backend виконує transfer через ICP Ledger canister

## Технічні Деталі

### Backend (user_canister.mo)

```motoko
type Campaign = {
    id: CampaignId;
    name: Text;
    description: Text;
    owner: UserId;
    acceptedTokens: [Text];
    subaccount: Blob;
    accountId: AccountId; // Новий field
    createdAt: Nat64;
};

type TransferRequest = {
    campaignId: CampaignId;
    targetAddress: Text;
    amount: Nat64;
};
```

### Frontend

#### Нові файли:
- `ledger.ts` - функції для роботи з ICP Ledger
- `account.ts` - оновлена функція генерації account ID

#### Оновлені компоненти:
- `CampaignPage.tsx` - відображення балансу та функція виведення
- `MainApp.tsx` - відображення балансу в списку кампаній

### Безпека

1. **Авторизація**: Тільки власник кампанії може виводити кошти
2. **Валідація**: Перевірка адрес та сум перед виведенням
3. **Прозорість**: Всі транзакції відкриті для перевірки

## Переваги Реалізації

1. **Унікальність**: Кожна кампанія має свій гаманець
2. **Безпека**: Кошти належать користувачу, не dApp
3. **Прозорість**: Можна перевірити баланс будь-якої кампанії
4. **Масштабованість**: Підтримка багатьох кампаній на користувача
5. **Сумісність**: Використовує стандартні ICP account ID

## Майбутні Покращення

1. **Реальна інтеграція з ICP Ledger**: Заміна симуляції на реальні запити
2. **Підтримка інших токенів**: BTC, ETH, USDT
3. **Аналітика**: Статистика пожертвувань
4. **Сповіщення**: Email/SMS повідомлення про пожертвування
5. **API**: Публічне API для перевірки балансів

## Використання

1. Зайдіть на сайт та авторизуйтесь через Internet Identity
2. Створіть кампанію з описом та прийнятими валютами
3. Поділіться QR кодом або адресою для пожертвувань
4. Відстежуйте баланс в реальному часі
5. Виводьте кошти на свій гаманець при необхідності 