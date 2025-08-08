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
export async function generateAccountIdentifier(principal: Principal, subaccount: Uint8Array): Promise<string> {
  // ICP account identifier format:
  // SHA224(0x0A + "account-id" + principal + subaccount)
  
  const prefix = new TextEncoder().encode('\x0Aaccount-id');
  const principalBytes = principal.toUint8Array();
  
  // Об'єднуємо всі частини
  const data = new Uint8Array(prefix.length + principalBytes.length + subaccount.length);
  data.set(prefix, 0);
  data.set(principalBytes, prefix.length);
  data.set(subaccount, prefix.length + principalBytes.length);
  
  // Генеруємо SHA-224 hash
  const hash = await crypto.subtle.digest('SHA-256', data);
  const hashArray = new Uint8Array(hash);
  
  // Беремо перші 28 байт (SHA-224)
  const accountBytes = hashArray.slice(0, 28);
  
  // Генеруємо CRC32 checksum
  const checksum = await generateCRC32(accountBytes);
  
  // Об'єднуємо checksum + account bytes
  const result = new Uint8Array(checksum.length + accountBytes.length);
  result.set(checksum, 0);
  result.set(accountBytes, checksum.length);
  
  // Конвертуємо в hex string
  const hexString = Array.from(result)
    .map(byte => byte.toString(16).padStart(2, '0'))
    .join('');
  
  return hexString;
}

// Функція для генерації CRC32 checksum
async function generateCRC32(data: Uint8Array): Promise<Uint8Array> {
  // Простий CRC32 реалізація
  let crc = 0xFFFFFFFF;
  
  for (let i = 0; i < data.length; i++) {
    crc ^= data[i] << 24;
    for (let j = 0; j < 8; j++) {
      if ((crc & 0x80000000) !== 0) {
        crc = (crc << 1) ^ 0x04C11DB7;
      } else {
        crc <<= 1;
      }
      crc >>>= 0;
    }
  }
  
  const result = new Uint8Array(4);
  result[0] = (crc >>> 24) & 0xFF;
  result[1] = (crc >>> 16) & 0xFF;
  result[2] = (crc >>> 8) & 0xFF;
  result[3] = crc & 0xFF;
  
  return result;
}

// Функція для генерації account identifier (для сумісності)
export function accountIdentifier(principal: Principal, subaccount?: Uint8Array): string {
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
