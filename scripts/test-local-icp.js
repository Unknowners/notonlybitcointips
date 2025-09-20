#!/usr/bin/env node

// Тестовий скрипт для локального тестування ICP операцій
const { Actor, HttpAgent } = require('@dfinity/agent');
const { Principal } = require('@dfinity/principal');

// Конфігурація
const LEDGER_CANISTER_ID = "ulvla-h7777-77774-qaacq-cai";
const USER_CANISTER_ID = "uzt4z-lp777-77774-qaabq-cai";
const HOST = "http://127.0.0.1:4943";

// Простий IDL для ledger
const ledgerIdl = ({ IDL }) => {
  return IDL.Service({
    'account_balance_dfx': IDL.Func([IDL.Record({ 'account': IDL.Text })], [IDL.Record({ 'e8s': IDL.Nat64 })], ['query']),
    'transfer': IDL.Func([
      IDL.Record({
        'memo': IDL.Nat64,
        'amount': IDL.Record({ 'e8s': IDL.Nat64 }),
        'fee': IDL.Record({ 'e8s': IDL.Nat64 }),
        'from_subaccount': IDL.Opt(IDL.Vec(IDL.Nat8)),
        'to': IDL.Vec(IDL.Nat8),
        'created_at_time': IDL.Opt(IDL.Record({ 'timestamp_nanos': IDL.Nat64 }))
      })
    ], [IDL.Variant({ 'Ok': IDL.Nat64, 'Err': IDL.Text })], []),
    'total_supply': IDL.Func([], [IDL.Record({ 'e8s': IDL.Nat64 })], ['query']),
    'symbol': IDL.Func([], [IDL.Text], ['query']),
    'name': IDL.Func([], [IDL.Text], ['query']),
    'decimals': IDL.Func([], [IDL.Nat8], ['query'])
  });
};

async function testLedger() {
  console.log('🧪 Тестування локального ICP Ledger...');
  
  try {
    // Створюємо агент
    const agent = new HttpAgent({ host: HOST });
    await agent.fetchRootKey();
    
    // Створюємо актор для ledger
    const ledger = Actor.createActor(ledgerIdl, {
      agent,
      canisterId: LEDGER_CANISTER_ID,
    });
    
    console.log('✅ Ledger canister підключено');
    
    // Тестуємо отримання балансу
    const testAccount = "a84c477c0a626566737a747b35726e0f3d444347434849434a4c4d504d514b4c";
    console.log(`🔍 Перевіряємо баланс для account: ${testAccount}`);
    
    const balance = await ledger.account_balance_dfx({ account: testAccount });
    console.log(`💰 Баланс: ${balance.e8s} e8s (${Number(balance.e8s) / 100_000_000} ICP)`);
    
    // Тестуємо transfer
    console.log('🔄 Тестуємо transfer...');
    const transferResult = await ledger.transfer({
      memo: 12345n,
      amount: { e8s: 1000000n }, // 0.01 ICP
      fee: { e8s: 10000n }, // 0.0001 ICP
      from_subaccount: [],
      to: [1, 2, 3, 4, 5], // Тестовий адрес
      created_at_time: [{ timestamp_nanos: BigInt(Date.now()) * 1_000_000n }]
    });
    
    console.log('📤 Transfer результат:', transferResult);
    
    // Тестуємо інші методи
    const symbol = await ledger.symbol();
    const name = await ledger.name();
    const decimals = await ledger.decimals();
    const totalSupply = await ledger.total_supply();
    
    console.log(`📊 Symbol: ${symbol}`);
    console.log(`📊 Name: ${name}`);
    console.log(`📊 Decimals: ${decimals}`);
    console.log(`📊 Total Supply: ${totalSupply.e8s} e8s (${Number(totalSupply.e8s) / 100_000_000} ICP)`);
    
    console.log('✅ Всі тести пройшли успішно!');
    
  } catch (error) {
    console.error('❌ Помилка при тестуванні:', error);
  }
}

// Запускаємо тести
testLedger();
