// Функції для роботи з ICP Ledger через HTTP запити

// Конфігурація мережі
const isMainnet = window.location.hostname.includes('ic0.app') || 
                 window.location.hostname.includes('icp0.io') ||
                 window.location.hostname.includes('icp1.io') ||
                 import.meta.env.VITE_DFX_NETWORK === 'ic';

const ledgerCanisterId = isMainnet
  ? "ryjl3-tyaaa-aaaaa-aaaba-cai" // Mainnet ICP Ledger
  : "ryjl3-tyaaa-aaaaa-aaaba-cai"; // Local ICP Ledger

const host = isMainnet ? 'https://ic0.app' : 'http://localhost:4943';

// Функція для отримання балансу account через HTTP запит
export async function getAccountBalance(): Promise<bigint> {
  try {
    const response = await fetch(`${host}/api/v2/canister/${ledgerCanisterId}/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/cbor',
      },
      body: new Uint8Array([
        // Простий запит для account_balance_dfx
        // Це спрощена версія - в реальному проекті потрібно використовувати правильний Candid interface
      ])
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Повертаємо 0 як заглушку - в реальному проекті потрібно парсити відповідь
    return 0n;
  } catch (error) {
    console.error('Error getting account balance:', error);
    return 0n;
  }
}

// Функція для конвертації e8s в ICP
export function e8sToICP(e8s: bigint): number {
  return Number(e8s) / 100_000_000;
}

// Функція для конвертації ICP в e8s
export function icpToE8s(icp: number): bigint {
  return BigInt(Math.floor(icp * 100_000_000));
}

// Функція для форматування балансу
export function formatBalance(e8s: bigint): string {
  const icp = e8sToICP(e8s);
  return icp.toFixed(8);
}

// Функція для виведення коштів (заглушка)
export async function transferICP(
  to: string,
  amount: bigint,
  fromSubaccount?: Uint8Array
): Promise<{ success: boolean; blockHeight?: bigint; error?: string }> {
  try {
    // Це заглушка - в реальному проекті потрібно реалізувати правильний запит до ledger
    console.log('Transfer request:', { to, amount: amount.toString(), fromSubaccount });
    
    // Симулюємо успішний переказ
    return { success: true, blockHeight: 123456n };
  } catch (error) {
    console.error('Error transferring ICP:', error);
    return { success: false, error: (error as Error).toString() };
  }
}

// Функція для отримання балансу з симуляцією (для демонстрації)
export async function getSimulatedBalance(accountId: string): Promise<bigint> {
  // Симулюємо баланс на основі account ID
  const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(accountId));
  const hashArray = new Uint8Array(hash);
  const balance = BigInt(hashArray[0]) * 1000000n; // Симульований баланс
  return balance;
} 