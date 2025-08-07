import { Principal } from '@dfinity/principal';

// Функція для генерації account ID на основі user principal + campaign ID
export async function generateAccountId(userPrincipal: string, campaignId: string): Promise<string> {
  try {
    // Конвертуємо campaign ID в 32-byte subaccount
    const campaignBytes = new TextEncoder().encode(campaignId);
    const subaccount = new Uint8Array(32);
    
    // Копіюємо campaign ID bytes в subaccount
    for (let i = 0; i < Math.min(campaignBytes.length, 32); i++) {
      subaccount[i] = campaignBytes[i];
    }
    
    // Об'єднуємо user principal + subaccount
    const userPrincipalBytes = new TextEncoder().encode(userPrincipal);
    const combined = new Uint8Array(userPrincipalBytes.length + subaccount.length);
    combined.set(userPrincipalBytes);
    combined.set(subaccount, userPrincipalBytes.length);
    
    // Генеруємо SHA-256 hash
    const hash = await crypto.subtle.digest('SHA-256', combined);
    const hashArray = new Uint8Array(hash);
    
    // Конвертуємо в hex string
    const hexString = Array.from(hashArray)
      .map(byte => byte.toString(16).padStart(2, '0'))
      .join('');
    
    return hexString;
  } catch (error) {
    console.error('Error generating account ID:', error);
    // Fallback
    return `account_${userPrincipal}_${campaignId}`;
  }
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
