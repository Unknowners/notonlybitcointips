import { Principal } from '@dfinity/principal';

function crc32(buf: Uint8Array): Uint8Array {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc ^= buf[i] << 24;
    for (let j = 0; j < 8; j++) {
      if ((crc & 0x80000000) !== 0) {
        crc = (crc << 1) ^ 0x04c11db7;
      } else {
        crc <<= 1;
      }
      crc >>>= 0;
    }
  }
  const out = new Uint8Array(4);
  out[0] = (crc >>> 24) & 0xff;
  out[1] = (crc >>> 16) & 0xff;
  out[2] = (crc >>> 8) & 0xff;
  out[3] = crc & 0xff;
  return out;
}

// Функція для генерації account ID на основі user principal + campaign ID
export async function generateAccountId(userPrincipal: string, campaignId: string): Promise<string> {
  // Конвертуємо user principal в bytes
  const userPrincipalObj = Principal.fromText(userPrincipal);
  const userBytes = userPrincipalObj.toUint8Array();
  
  // Конвертуємо campaign ID в bytes (32-byte subaccount)
  const campaignBytes = new TextEncoder().encode(campaignId);
  const paddedCampaignBytes = new Uint8Array(32);
  paddedCampaignBytes.set(campaignBytes.slice(0, 32));
  
  // Об'єднуємо user principal + campaign ID
  const combinedBytes = new Uint8Array(userBytes.length + paddedCampaignBytes.length);
  combinedBytes.set(userBytes, 0);
  combinedBytes.set(paddedCampaignBytes, userBytes.length);
  
  // Хешуємо комбінацію
  const hash = await crypto.subtle.digest('SHA-256', combinedBytes);
  const hashBytes = new Uint8Array(hash);
  
  // Беремо перші 28 байт для account ID
  const accountBytes = hashBytes.slice(0, 28);
  
  // Генеруємо CRC32 checksum
  const checksum = crc32(accountBytes);
  
  // Об'єднуємо checksum + account bytes
  const result = new Uint8Array(checksum.length + accountBytes.length);
  result.set(checksum, 0);
  result.set(accountBytes, checksum.length);
  
  // Конвертуємо в hex string
  return Array.from(result)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

// Оригінальна функція для сумісності
export async function accountIdentifier(principal: string, sub: Uint8Array): Promise<string> {
  const padding = new Uint8Array([0x0a, ...new TextEncoder().encode('account-id')]);
  const principalBytes = Principal.fromText(principal).toUint8Array();
  const data = new Uint8Array(padding.length + principalBytes.length + sub.length);
  data.set(padding, 0);
  data.set(principalBytes, padding.length);
  data.set(sub, padding.length + principalBytes.length);
  const fullHash = new Uint8Array(await crypto.subtle.digest('SHA-256', data));
  // Truncate to 28 bytes to maintain compatibility with ICP account format
  const hash = fullHash.slice(0, 28);
  const checksum = crc32(hash);
  const result = new Uint8Array(checksum.length + hash.length);
  result.set(checksum, 0);
  result.set(hash, checksum.length);
  return Array.from(result)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}
