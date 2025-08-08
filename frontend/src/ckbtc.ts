import { Actor, HttpAgent } from '@dfinity/agent';
// @ts-ignore
import { idlFactory as ckbtcMinterIdl } from './canisters/ckbtc_minter.did.js';
// @ts-ignore
import { idlFactory as icrcIdl } from './canisters/ledger.did.js';

const isMainnet = window.location.hostname.includes('ic0.app') || 
                  window.location.hostname.includes('icp0.io') ||
                  window.location.hostname.includes('icp1.io') ||
                  import.meta.env.VITE_DFX_NETWORK === 'ic';
const isICPNinja = window.location.hostname.includes('ninja.ic0.app');
const host = (isMainnet || isICPNinja) ? 'https://ic0.app' : 'http://127.0.0.1:4943';

// TODO: замінити фактичними ідентифікаторами ckBTC minter і ICRC ledger у середовищі
const CKBTC_MINTER_CANISTER_ID = 'qjdve-lqaaa-aaaaa-aaaeq-cai'; // приклад
const CKBTC_LEDGER_CANISTER_ID = 'mxzaz-hqaaa-aaaar-qaada-cai'; // приклад

export async function getCkBtcDepositAddress(identity: any, owner?: any, subaccount?: Uint8Array): Promise<string> {
  const agent = new HttpAgent({ host, identity });
  if (!isMainnet && !isICPNinja) { await agent.fetchRootKey(); }
  const minter = Actor.createActor(ckbtcMinterIdl, { agent, canisterId: CKBTC_MINTER_CANISTER_ID });
  const args = { owner: owner ? [owner] : [], subaccount: subaccount ? [Array.from(subaccount)] : [] };
  const address = await (minter as any).get_btc_address(args);
  return address as string;
}

export async function getCkBtcBalance(identity: any, account: Uint8Array): Promise<bigint> {
  const agent = new HttpAgent({ host, identity });
  if (!isMainnet && !isICPNinja) { await agent.fetchRootKey(); }
  const ledger = Actor.createActor(icrcIdl, { agent, canisterId: CKBTC_LEDGER_CANISTER_ID });
  // ICRC-1 balance_of
  const res = await (ledger as any).icrc1_balance_of({ owner: identity.getPrincipal(), subaccount: [Array.from(account)] });
  return BigInt(res ?? 0);
} 