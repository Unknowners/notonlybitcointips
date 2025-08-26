// Функції для роботи з ICP Ledger через агент @dfinity/agent

const ledgerCanisterId = "ryjl3-tyaaa-aaaaa-aaaba-cai"; // ICP Ledger canister ID

// Конфігурація мережі
const isMainnet = window.location.hostname.includes('ic0.app') || 
                 window.location.hostname.includes('icp0.io') ||
                 window.location.hostname.includes('icp1.io') ||
                 import.meta.env.VITE_DFX_NETWORK === 'ic';

const isICPNinja = window.location.hostname.includes('ninja.ic0.app');


import { Actor, HttpAgent } from '@dfinity/agent';
// @ts-ignore - JS IDL factory
import { idlFactory as ledgerIdl } from './canisters/ledger.did.js';

function stringifyWithBigInt(value: unknown): string {
  return JSON.stringify(value, (_key, val) => (typeof val === 'bigint' ? val.toString() : val));
}

function formatTransferError(err: any): string {
  try {
    if (err && typeof err === 'object') {
      if ('InsufficientFunds' in err) {
        const bal = (err as any).InsufficientFunds?.balance?.e8s;
        return `Insufficient funds${bal !== undefined ? ` (balance: ${bal.toString()} e8s)` : ''}`;
      }
      if ('BadFee' in err) {
        const exp = (err as any).BadFee?.expected_fee?.e8s;
        return `Bad fee${exp !== undefined ? ` (expected: ${exp.toString()} e8s)` : ''}`;
      }
      if ('TxTooOld' in err) {
        const win = (err as any).TxTooOld?.allowed_window_nanos;
        return `Transaction too old${win !== undefined ? ` (allowed window: ${win.toString()} ns)` : ''}`;
      }
      if ('TxDuplicate' in err) {
        const dup = (err as any).TxDuplicate?.duplicate_of;
        return `Duplicate transaction${dup !== undefined ? ` (block: ${dup.toString()})` : ''}`;
      }
      if ('TxCreatedInFuture' in err) {
        return 'Transaction created in the future';
      }
      if ('TemporarilyUnavailable' in err) {
        return 'Ledger temporarily unavailable';
      }
    }
    return stringifyWithBigInt(err);
  } catch (_) {
    return 'Unknown transfer error';
  }
}

// Функція для отримання балансу account через HTTP запит
export async function getAccountBalance(accountId: string): Promise<bigint> {
  try {
    const host = (isMainnet || isICPNinja) ? 'https://ic0.app' : 'http://localhost:4943';
    
    if (import.meta.env.DEV) {
      console.log('Getting balance for account:', accountId);
      console.log('Using host:', host);
    }
    
    // Використовуємо реальний HTTP запит до ICP Ledger
    const balance = await getRealAccountBalance(accountId);
    console.log('Real balance:', balance);
    return balance;
    
  } catch (error) {
    console.error('Error getting account balance:', error);
    return 0n;
  }
}

// Функція для правильного HTTP запиту до ICP Ledger
export async function getRealAccountBalance(accountId: string): Promise<bigint> {
  try {
    const host = (isMainnet || isICPNinja) ? 'https://ic0.app' : 'http://127.0.0.1:4943';
    
    const agent = new HttpAgent({ host });
    if (!isMainnet && !isICPNinja) {
      await agent.fetchRootKey();
    }
    const ledger = Actor.createActor(ledgerIdl, {
      agent,
      canisterId: ledgerCanisterId,
    });

    const res = await (ledger as any).account_balance_dfx({ account: accountId });
    
    // res: { e8s: nat64 }
    const e8s = BigInt(res?.e8s ?? 0);
    return e8s;
  } catch (error) {
    console.error('Error getting real account balance:', error);
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

// Функція для виведення коштів (справжня реалізація через HTTP)
export async function transferICP(
  to: string,
  amount: bigint,
  fromSubaccount?: Uint8Array,
  identity?: any,
  memo?: bigint
): Promise<{ success: boolean; blockHeight?: bigint; error?: string }> {
  try {
    const host = (isMainnet || isICPNinja) ? 'https://ic0.app' : 'http://127.0.0.1:4943';

    const agent = new HttpAgent({ host, identity });
    if (!isMainnet && !isICPNinja) {
      await agent.fetchRootKey();
    }
    const ledger = Actor.createActor(ledgerIdl, {
      agent,
      canisterId: ledgerCanisterId,
    });

    // Convert hex accountId to raw bytes
    const toBytes = hexToBytes(to);
    const fee = 10000n; // 0.0001 ICP in e8s
    const nowNanos = BigInt(Date.now()) * 1_000_000n;

    const args = {
      memo: memo ?? 0n,
      amount: { e8s: amount },
      fee: { e8s: fee },
      from_subaccount: fromSubaccount ? [Array.from(fromSubaccount)] : [],
      to: Array.from(toBytes),
      created_at_time: [{ timestamp_nanos: nowNanos }]
    };

    const res = await (ledger as any).transfer(args);
    if ('Ok' in res) {
      return { success: true, blockHeight: BigInt(res.Ok) };
    }
    return { success: false, error: formatTransferError(res.Err) };
  } catch (error) {
    console.error('Error transferring ICP:', error);
    return { success: false, error: (error as Error).toString() };
  }
}

function hexToBytes(hex: string): Uint8Array {
  const clean = hex.trim().toLowerCase().replace(/^0x/, '');
  if (clean.length % 2 !== 0) throw new Error('Invalid hex string length');
  const bytes = new Uint8Array(clean.length / 2);
  for (let i = 0; i < clean.length; i += 2) {
    bytes[i / 2] = parseInt(clean.slice(i, i + 2), 16);
  }
  return bytes;
}

// Функція для отримання балансу з симуляцією (для демонстрації)
export async function getSimulatedBalance(accountId: string): Promise<bigint> {
  // Симулюємо баланс на основі account ID
  const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(accountId));
  const hashArray = new Uint8Array(hash);
  const balance = BigInt(hashArray[0]) * 1000000n; // Симульований баланс
  return balance;
} 