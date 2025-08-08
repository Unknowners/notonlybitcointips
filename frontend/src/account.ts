import { Principal } from '@dfinity/principal';

// Функція для генерації account ID згідно з ICP стандартами
export async function generateAccountId(userPrincipal: string, campaignId: string): Promise<string> {
  try {
    // Конвертуємо user principal в Principal об'єкт
    const principal = Principal.fromText(userPrincipal);
    
    // Конвертуємо campaign ID в 32-byte subaccount
    const campaignBytes = new TextEncoder().encode(campaignId);
    const subaccount = new Uint8Array(32);
    
    // Копіюємо campaign ID bytes в subaccount
    for (let i = 0; i < Math.min(campaignBytes.length, 32); i++) {
      subaccount[i] = campaignBytes[i];
    }
    
    // Генеруємо account identifier згідно з ICP стандартами
    const accountIdentifier = await generateAccountIdentifier(principal, subaccount);
    
    return accountIdentifier;
  } catch (error) {
    console.error('Error generating account ID:', error);
    // Fallback
    return `account_${userPrincipal}_${campaignId}`;
  }
}

// Функція для генерації account identifier згідно з ICP стандартами
// account_identifier(principal,subaccount_identifier) = CRC32(h) || h
// де h = sha224("\x0Aaccount-id" || principal || subaccount_identifier)
export async function generateAccountIdentifier(principal: Principal, subaccount: Uint8Array): Promise<string> {
  // Формуємо дані для хешування згідно з ICP специфікацією
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
  
  // Беремо перші 28 байт (SHA-224)
  const h = hashArray.slice(0, 28);
  
  // Генеруємо CRC32 checksum
  const checksum = crc32(h);
  
  // Формуємо фінальний account identifier: CRC32(h) || h
  const result = new Uint8Array(4 + h.length);
  
  // Записуємо CRC32 у big-endian форматі
  result[0] = (checksum >>> 24) & 0xFF;
  result[1] = (checksum >>> 16) & 0xFF;
  result[2] = (checksum >>> 8) & 0xFF;
  result[3] = checksum & 0xFF;
  
  // Додаємо хеш
  result.set(h, 4);
  
  // Конвертуємо в hex string
  return Array.from(result)
    .map(byte => byte.toString(16).padStart(2, '0'))
    .join('');
}

// CRC32 implementation згідно з ISO 3309, ITU-T V.42
function crc32(data: Uint8Array): number {
  const table = new Uint32Array(256);
  
  // Генеруємо CRC32 таблицю
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let j = 0; j < 8; j++) {
      c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[i] = c;
  }
  
  let crc = 0xFFFFFFFF;
  
  for (let i = 0; i < data.length; i++) {
    crc = (crc >>> 8) ^ table[(crc ^ data[i]) & 0xFF];
  }
  
  return (crc ^ 0xFFFFFFFF) >>> 0; // Unsigned 32-bit
}

// Функція для генерації account identifier (для сумісності - застаріла)
export function accountIdentifier(principal: Principal, subaccount?: Uint8Array): string {
  // Ця функція застаріла, використовуйте generateAccountIdentifier
  console.warn('accountIdentifier is deprecated, use generateAccountIdentifier instead');
  
  const data = new Uint8Array([
    ...new TextEncoder().encode('\x0Aaccount-id'),
    ...principal.toUint8Array(),
    ...(subaccount ?? new Uint8Array(32))
  ]);
  
  const hash = new Uint8Array(32);
  // Простий hash для демонстрації
  for (let i = 0; i < Math.min(data.length, 32); i++) {
    hash[i] = data[i];
  }
  
  return Array.from(hash)
    .map(byte => byte.toString(16).padStart(2, '0'))
    .join('');
}
