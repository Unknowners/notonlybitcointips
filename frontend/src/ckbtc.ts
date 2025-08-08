import { Actor, HttpAgent } from '@dfinity/agent';
// @ts-ignore
import { idlFactory as ckbtcMinterIdl } from './canisters/ckbtc_minter.did.js';
// @ts-ignore
import { idlFactory as icrcIdl } from './canisters/icrc1.did.js';

const isMainnet = window.location.hostname.includes('ic0.app') || 
                  window.location.hostname.includes('icp0.io') ||
                  window.location.hostname.includes('icp1.io') ||
                  import.meta.env.VITE_DFX_NETWORK === 'ic';
const isICPNinja = window.location.hostname.includes('ninja.ic0.app');
const host = (isMainnet || isICPNinja) ? 'https://ic0.app' : 'http://127.0.0.1:4943';

// Mainnet canister IDs (official)
// Source: ckBTC canister ids (Bitcoin mainnet)
// - Minter: mqygn-kiaaa-aaaar-qaadq-cai
// - Ledger: mxzaz-hqaaa-aaaar-qaada-cai
export const CKBTC_MINTER_CANISTER_ID = 'mqygn-kiaaa-aaaar-qaadq-cai';
export const CKBTC_LEDGER_CANISTER_ID = 'mxzaz-hqaaa-aaaar-qaada-cai';

export async function getCkBtcDepositAddress(identity: any, owner?: any, subaccount?: Uint8Array): Promise<string> {
  const agent = new HttpAgent({ host, identity });
  if (!isMainnet && !isICPNinja) { await agent.fetchRootKey(); }
  const minter = Actor.createActor(ckbtcMinterIdl, { agent, canisterId: CKBTC_MINTER_CANISTER_ID });
  const args = { owner: owner ? [owner] : [], subaccount: subaccount ? [Array.from(subaccount)] : [] };
  const address = await (minter as any).get_btc_address(args);
  return address as string;
}

export async function getCkBtcBalance(identity: any, owner: any, subaccount?: Uint8Array): Promise<bigint> {
  const agent = new HttpAgent({ host, identity });
  if (!isMainnet && !isICPNinja) { await agent.fetchRootKey(); }
  const ledger = Actor.createActor(icrcIdl, { agent, canisterId: CKBTC_LEDGER_CANISTER_ID });
  const res = await (ledger as any).icrc1_balance_of({ owner, subaccount: subaccount ? [Array.from(subaccount)] : [] });
  return BigInt(res ?? 0);
}

export async function pollUpdateBalance(identity: any, owner?: any, subaccount?: Uint8Array, intervalMs = 4000, maxAttempts = 20): Promise<'credited' | 'timeout' | 'error'> {
  const agent = new HttpAgent({ host, identity });
  if (!isMainnet && !isICPNinja) { await agent.fetchRootKey(); }
  const minter = Actor.createActor(ckbtcMinterIdl, { agent, canisterId: CKBTC_MINTER_CANISTER_ID });
  const args = { owner: owner ? [owner] : [], subaccount: subaccount ? [Array.from(subaccount)] : [] };
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const res = await (minter as any).update_balance(args);
      if ('Ok' in res) {
        return 'credited';
      }
    } catch (_) {}
    await new Promise(r => setTimeout(r, intervalMs));
  }
  return 'timeout';
}

export async function estimateWithdrawFee(identity: any, address: string, amountE8s: bigint): Promise<{ total: bigint; minter: bigint; bitcoin: bigint }> {
  const agent = new HttpAgent({ host, identity });
  if (!isMainnet && !isICPNinja) { await agent.fetchRootKey(); }
  const minter = Actor.createActor(ckbtcMinterIdl, { agent, canisterId: CKBTC_MINTER_CANISTER_ID });
  const res = await (minter as any).estimate_withdrawal_fee({ address, amount: amountE8s });
  return { total: BigInt(res.total_fee), minter: BigInt(res.minter_fee), bitcoin: BigInt(res.bitcoin_fee) };
}

export async function withdrawCkBtc(identity: any, address: string, amountE8s: bigint): Promise<{ ok?: bigint; err?: string }> {
  const agent = new HttpAgent({ host, identity });
  if (!isMainnet && !isICPNinja) { await agent.fetchRootKey(); }
  const minter = Actor.createActor(ckbtcMinterIdl, { agent, canisterId: CKBTC_MINTER_CANISTER_ID });
  const res = await (minter as any).retrieve_btc({ address, amount: amountE8s });
  if ('Ok' in res) return { ok: BigInt(res.Ok) };
  return { err: JSON.stringify(res.Err) };
} 