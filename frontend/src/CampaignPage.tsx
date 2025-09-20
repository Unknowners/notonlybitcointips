import React, { useState, useEffect, useRef, startTransition } from "react";
import { QRCodeSVG } from "qrcode.react";
import { useParams, useNavigate } from "react-router-dom";
import { user_canister } from "./canisters/index.js";
import { getSimulatedBalance, formatBalance } from "./ledger";
import { getAccountBalance } from "./ledger";

import { AuthClient } from '@dfinity/auth-client';
import { getCkBtcDepositAddress } from './ckbtc';
import { getCkBtcBalance, pollUpdateBalance, estimateWithdrawFee, withdrawCkBtc } from './ckbtc';
import type { Campaign } from "./canisters/user_canister/user_canister.did.d.ts";
import AlphaWarning from "./components/AlphaWarning";
import { useAuth } from "./contexts/AuthContext";

export default function CampaignPage() {
  const { authState } = useAuth();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [balance, setBalance] = useState<bigint>(0n);
  const [balanceLoading, setBalanceLoading] = useState(true);
  const isFetchingBalanceRef = useRef(false);
  const lastBalanceRef = useRef<bigint>(0n);
  
  // Withdraw form state
  const [withdrawAddress, setWithdrawAddress] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawLoading, setWithdrawLoading] = useState(false);
  const [withdrawError, setWithdrawError] = useState<string | null>(null);
  const [withdrawSuccess, setWithdrawSuccess] = useState(false);
  
  // Share state
  const [isOwner, setIsOwner] = useState(false);

  // Authentication state for ckBTC operations
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const authClientRef = useRef<AuthClient | null>(null);

  // ckBTC state
  const [ckbtcAddress, setCkbtcAddress] = useState<string | null>(null);
  const [ckbtcLoading, setCkbtcLoading] = useState(false);
  const [ckbtcError, setCkbtcError] = useState<string | null>(null);
  const [ckbtcBalance, setCkbtcBalance] = useState<bigint>(0n);
  const [ckbtcRefreshing, setCkbtcRefreshing] = useState(false);
  const [ckbtcWithdrawAddr, setCkbtcWithdrawAddr] = useState("");
  const [ckbtcWithdrawAmount, setCkbtcWithdrawAmount] = useState("");
  const [ckbtcFeeInfo, setCkbtcFeeInfo] = useState<{ total: bigint; minter: bigint; bitcoin: bigint } | null>(null);
  const [ckbtcWithdrawing, setCkbtcWithdrawing] = useState(false);
  const [ckbtcWithdrawError, setCkbtcWithdrawError] = useState<string | null>(null);
  const [ckbtcWithdrawOk, setCkbtcWithdrawOk] = useState<string | null>(null);

  // Завантажуємо кампанію при зміні ID
  useEffect(() => {
    if (id) {
      loadCampaign();
    }
  }, [id]);

  const loadCampaign = async () => {
    if (!id) return;
    
    try {
      console.log('Loading campaign with ID:', id);
      console.log('🔍 Using canister ID:', (user_canister as any).canisterId);
      console.log('🔍 Using host:', (user_canister as any).agent?.host);
      // ВАЖЛИВО: використовуємо автентифікований actor, щоб уникнути анонімних запитів
      const authClient = await (window as any).authClient?.create?.() || await (await import('@dfinity/auth-client')).AuthClient.create();
      const identity = authClient.getIdentity();
      const actor = (await import('./canisters/index.js')).createActor(identity);
      const campaignData = await actor.getCampaign(id);
      console.log('Campaign data received:', campaignData);
      
      // getCampaign повертає Optional<Campaign> = [Campaign] | []
      // В Candid це opt Campaign, тому frontend отримує [Campaign] або []
      if (campaignData && Array.isArray(campaignData) && campaignData.length > 0) {
        const campaign = campaignData[0];
        console.log('🔍 Витягнута кампанія:', campaign);
        
        console.log('🔍 Витягнута кампанія:', campaign);
        console.log('🔍 Тип витягнутої кампанії:', typeof campaign);
        console.log('🔍 Поля кампанії:', Object.keys(campaign));
        console.log('🔍 Кількість полів:', Object.keys(campaign).length);
        
        // Детальний аналіз accountId
        console.log('🔍 accountId поле:', campaign.accountId);
        console.log('🔍 Тип accountId:', typeof campaign.accountId);
        console.log('🔍 accountId === undefined:', campaign.accountId === undefined);
        console.log('🔍 accountId === null:', campaign.accountId === null);
        console.log('🔍 accountId === ""', campaign.accountId === "");
        
        // Перевіряємо чи є accountId в прототипі
        console.log('🔍 accountId в прототипі:', 'accountId' in campaign);
        console.log('🔍 hasOwnProperty accountId:', campaign.hasOwnProperty('accountId'));
        
        setCampaign(campaign);
        console.log('Using account ID from campaign:', campaign.accountId);
        
        // Перевіряємо чи account ID існує в кампанії
        if (!campaign.accountId) {
          console.error('❌ Account ID не знайдено в кампанії!');
          console.error('❌ Перевірте backend генерацію та Candid інтерфейс.');
          console.error('❌ Можливо проблема в десеріалізації Optional типу.');
        } else {
          console.log('✅ Account ID знайдено:', campaign.accountId);
        }
        
        // Перевіряємо чи поточний користувач є власником
        try {
          const currentUser = await user_canister.whoami();
          console.log('Current user:', currentUser);
          console.log('Campaign owner:', campaign.owner);
          
          // Перевіряємо чи owner існує та чи користувач авторизований
          if (campaign.owner && currentUser) {
            // Конвертуємо Principal в string для порівняння
            const ownerString = campaign.owner.toString();
            const currentUserString = currentUser.toString();
            console.log('Comparing owner:', ownerString, 'with current user:', currentUserString);
            setIsOwner(currentUserString === ownerString);
          } else {
            console.log('Owner or current user not available');
            setIsOwner(false);
          }
        } catch (authError) {
          console.log('User not authenticated or error getting current user:', authError);
          // Для анонімних користувачів встановлюємо owner = false
          setIsOwner(false);
        }
      } else {
        console.error('Campaign not found');
      }
    } catch (error) {
      console.error('Error loading campaign:', error);
    } finally {
      setLoading(false);
    }
  };

  // Initialize AuthClient to detect authentication state for donation
  useEffect(() => {
    (async () => {
      try {
        const ac = await AuthClient.create({
          idleOptions: { disableDefaultIdleCallback: true, disableIdle: true }
        });
        authClientRef.current = ac;
        const authed = await ac.isAuthenticated();
        setIsAuthenticated(authed);
      } catch (e) {
        console.warn('AuthClient init failed', e);
      }
    })();
  }, []);



  const loadCkBtcAddress = async () => {
    if (!authClientRef.current || !campaign) return;
    setCkbtcError(null);
    setCkbtcLoading(true);
    try {
      const identity = authClientRef.current.getIdentity();
      const address = await getCkBtcDepositAddress(identity);
      setCkbtcAddress(address);
    } catch (e: any) {
      setCkbtcError(e?.message || String(e));
    } finally {
      setCkbtcLoading(false);
    }
  };

  const refreshCkBtcBalance = async () => {
    if (!authClientRef.current || !campaign) return;
    setCkbtcRefreshing(true);
    try {
      const identity = authClientRef.current.getIdentity();
      const owner = identity.getPrincipal();
      const sub = new TextEncoder().encode(campaign.id);
      const sub32 = new Uint8Array(32); sub32.set(sub.slice(0, 32));
      console.log('[ckBTC] Refresh ckBTC ICRC balance for owner/subaccount...');
      const bal = await getCkBtcBalance(identity, owner, sub32);
      setCkbtcBalance(bal);
    } catch (e) {
      console.warn('ckBTC balance error', e);
    } finally {
      setCkbtcRefreshing(false);
    }
  };

  const pollCkBtcCredit = async () => {
    if (!authClientRef.current) return;
    const identity = authClientRef.current.getIdentity();
    const sub = new TextEncoder().encode(campaign?.id || '');
    const sub32 = new Uint8Array(32); sub32.set(sub.slice(0, 32));
    console.log('[ckBTC] Polling minter update_balance for owner/subaccount...');
    await pollUpdateBalance(identity, identity.getPrincipal(), sub32);
    await refreshCkBtcBalance();
  };

  const onEstimateCkBtc = async () => {
    if (!authClientRef.current) return;
    try {
      const identity = authClientRef.current.getIdentity();
      const amount = parseFloat(ckbtcWithdrawAmount || '0');
      if (isNaN(amount) || amount <= 0) return;
      const e8s = BigInt(Math.floor(amount * 100_000_000));
      console.log('[ckBTC] Estimating withdrawal fee...');
      const fees = await estimateWithdrawFee(identity, ckbtcWithdrawAddr, e8s);
      setCkbtcFeeInfo(fees);
    } catch (e: any) {
      setCkbtcWithdrawError(e?.message || String(e));
    }
  };

  const onWithdrawCkBtc = async () => {
    if (!authClientRef.current) return;
    setCkbtcWithdrawing(true);
    setCkbtcWithdrawError(null);
    setCkbtcWithdrawOk(null);
    try {
      const identity = authClientRef.current.getIdentity();
      const amount = parseFloat(ckbtcWithdrawAmount || '0');
      if (isNaN(amount) || amount <= 0) throw new Error('Invalid amount');
      const e8s = BigInt(Math.floor(amount * 100_000_000));
      console.log('[ckBTC] Submitting withdrawal...');
      const res = await withdrawCkBtc(identity, ckbtcWithdrawAddr, e8s);
      if (res.ok !== undefined) {
        setCkbtcWithdrawOk(`Submitted at block ${res.ok.toString()}`);
        await refreshCkBtcBalance();
      } else {
        setCkbtcWithdrawError(res.err || 'Withdraw failed');
      }
    } catch (e: any) {
      setCkbtcWithdrawError(e?.message || String(e));
    } finally {
      setCkbtcWithdrawing(false);
    }
  };



  const loadBalance = async (accountId: string) => {
    if (!accountId) return;
    if (isFetchingBalanceRef.current) return;
    isFetchingBalanceRef.current = true;
    try {
      console.log('[ICP] Updating ICP balance...');
      let balanceValue: bigint;
      
      try {
        // Отримуємо identity з authState
        const identity = authState.authClient?.getIdentity();
        console.log('[ICP] Using identity for balance check:', !!identity);
        
        // Спочатку пробуємо реальний баланс з identity
        balanceValue = await getAccountBalance(accountId, identity);
      } catch (balanceError) {
        console.log('[ICP] Real balance failed, using simulated:', balanceError);
        // Якщо не вдалося, використовуємо симульований баланс
        balanceValue = await getSimulatedBalance(accountId);
      }
      
      if (balanceValue !== lastBalanceRef.current) {
        lastBalanceRef.current = balanceValue;
        startTransition(() => setBalance(balanceValue));
      }
    } catch (error) {
      console.error('Error loading balance:', error);
      const simulatedBalance = await getSimulatedBalance(accountId);
      if (simulatedBalance !== lastBalanceRef.current) {
        lastBalanceRef.current = simulatedBalance;
        startTransition(() => setBalance(simulatedBalance));
      }
    } finally {
      isFetchingBalanceRef.current = false;
      setBalanceLoading(false);
    }
  };

  // Оновлення балансу кожні 10 секунд
  useEffect(() => {
    if (!campaign?.accountId) return;

    // Завантажуємо баланс одразу
    loadBalance(campaign.accountId);

    // Встановлюємо інтервал для оновлення кожні 10 секунд
    const interval = setInterval(() => {
      console.log('Updating balance...'); // Логуємо для дебагу
      loadBalance(campaign.accountId);
    }, 10000);

    return () => clearInterval(interval);
  }, [campaign?.accountId]);

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!campaign || !withdrawAddress || !withdrawAmount) return;

    setWithdrawLoading(true);
    setWithdrawError(null);
    setWithdrawSuccess(false);

    try {
      const amount = parseFloat(withdrawAmount);
      if (isNaN(amount) || amount <= 0) {
        setWithdrawError("Please enter a valid amount");
        return;
      }

      // Перевіряємо чи сума не перевищує баланс
      const amountE8s = BigInt(Math.floor(amount * 100_000_000));
      if (amountE8s > balance) {
        setWithdrawError("Amount cannot exceed campaign balance");
        return;
      }

      // Тут буде виклик до backend для виведення коштів
      const result = await user_canister.withdrawFunds({
        campaignId: campaign.id,
        targetAddress: withdrawAddress,
        amount: amountE8s
      });

      if (result) {
        setWithdrawSuccess(true);
        setWithdrawAddress("");
        setWithdrawAmount("");
        // Оновлюємо баланс після успішного виведення
        setTimeout(() => loadBalance(campaign.accountId!), 1000);
      } else {
        setWithdrawError("Withdrawal failed. Please check your address and try again.");
      }
    } catch (error) {
      console.error('Error withdrawing funds:', error);
      setWithdrawError("An error occurred during withdrawal.");
    } finally {
      setWithdrawLoading(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-xl">Loading...</div>;
  if (!campaign) return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-indigo-900 to-gray-900 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white/90 rounded-3xl shadow-2xl p-10 backdrop-blur-md text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Campaign Not Found</h1>
        <p className="text-gray-700 mb-6">The campaign you're looking for doesn't exist or has been removed.</p>
        <button
          onClick={() => navigate("/")}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 px-6 rounded-lg transition-all transform hover:scale-105"
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-indigo-900 to-gray-900 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white/90 rounded-3xl shadow-2xl p-10 backdrop-blur-md">
        <AlphaWarning />
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">{campaign.name}</h1>
        <p className="text-gray-700 mb-4">{campaign.description}</p>
        
        <div className="mb-4">
          <span className="font-semibold text-gray-800">Currencies for donations:</span>
          <div className="flex gap-2 mt-2">
            {(campaign.acceptedTokens || []).map((token: string) => (
              <span key={token} className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-semibold">{token}</span>
            ))}
          </div>
        </div>

        {/* Баланс кампанії */}
        <div className="mb-6 p-4 bg-green-50 rounded-lg">
          <h3 className="font-semibold text-green-900 mb-2">Campaign Balance</h3>
          <div className="text-2xl font-bold text-green-700">
            {balanceLoading ? "Loading..." : `${formatBalance(balance)} ICP`}
          </div>
          <p className="text-sm text-green-600 mt-1">Updated every 10 seconds</p>
        </div>

        {/* Donation Address - показується відразу */}
        {campaign.accountId && (
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">Donation Address</h3>
            <div className="flex items-center gap-2 mb-2">
              <p className="text-sm text-gray-600 break-all font-mono flex-1 bg-gray-100 p-2 rounded">
                {campaign.accountId}
              </p>
              <button
                onClick={() => navigator.clipboard.writeText(campaign.accountId)}
                className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                title="Copy address"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </button>
            </div>
            <div className="flex justify-center">
              <QRCodeSVG value={campaign.accountId} size={128} bgColor="#fff" fgColor="#1e293b" className="rounded-md shadow-md" />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Scan this QR code to donate ICP directly to this campaign
            </p>
          </div>
        )}

        {/* Check Balance on NNS Dashboard */}
        <div className="mb-6 p-4 bg-indigo-50 rounded-lg">
          <h3 className="font-semibold text-indigo-900 mb-2">Check Balance on NNS Dashboard</h3>
          <p className="text-sm text-indigo-700 mb-3">
            View your campaign balance, transaction history, and account details on the official ICP dashboard.
          </p>
          <a
            href={`https://dashboard.internetcomputer.org/account/${campaign.accountId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-md transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            Open NNS Dashboard
          </a>
        </div>

        {/* ckBTC deposit (render only if BTC is accepted) */}
        {(campaign.acceptedTokens || []).includes('BTC') && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold text-gray-900 mb-2">ckBTC Deposit</h3>
          {!isAuthenticated ? (
            <p className="text-sm text-gray-600">Sign in above to see a BTC deposit address (minter)</p>
          ) : (
            <div className="space-y-2">
              <button
                className="px-3 py-2 bg-gray-800 text-white rounded-md text-sm"
                onClick={async () => { console.log('[ckBTC] Getting deposit address...'); await loadCkBtcAddress(); }}
                disabled={ckbtcLoading}
              >
                {ckbtcLoading ? 'Loading...' : 'Get BTC Deposit Address'}
              </button>
              {ckbtcError && <div className="text-red-600 text-sm">{ckbtcError}</div>}
              {ckbtcAddress && (
                <div className="flex items-center gap-2">
                  <div className="bg-white p-2 rounded border font-mono text-sm break-all flex-1">{ckbtcAddress}</div>
                  <button
                    onClick={() => navigator.clipboard.writeText(ckbtcAddress)}
                    className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                    title="Copy BTC address"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </button>
                </div>
              )}
              <div className="flex items-center gap-2 mt-2">
                <button className="px-3 py-1 bg-blue-600 text-white rounded text-sm" onClick={refreshCkBtcBalance} disabled={ckbtcRefreshing}>Refresh Balance</button>
                <button className="px-3 py-1 bg-green-600 text-white rounded text-sm" onClick={pollCkBtcCredit} disabled={ckbtcRefreshing}>Poll Credit</button>
                <div className="text-sm text-gray-700">Balance: {formatBalance(ckbtcBalance)} ckBTC</div>
              </div>
              <p className="text-xs text-gray-500">
                Send BTC from your exchange/wallet to this address. After confirmations, ckBTC will appear on the campaign balance.
              </p>

              <div className="mt-3 border-t pt-3">
                <div className="font-semibold text-gray-800 mb-1">Withdraw ckBTC to BTC address</div>
                <input className="w-full px-3 py-2 border rounded mb-2" placeholder="BTC address" value={ckbtcWithdrawAddr} onChange={e=>setCkbtcWithdrawAddr(e.target.value)} />
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <input className="flex-1 px-3 py-2 border rounded" placeholder="Amount (BTC)" value={ckbtcWithdrawAmount} onChange={e=>setCkbtcWithdrawAmount(e.target.value)} />
                    <button className="px-3 py-2 bg-gray-700 text-white rounded" type="button" onClick={onEstimateCkBtc}>Estimate Fee</button>
                  </div>
                  <button 
                    className="w-full px-3 py-2 bg-gray-900 text-white rounded" 
                    type="button" 
                    onClick={onWithdrawCkBtc} 
                    disabled={ckbtcWithdrawing}
                  >
                    {ckbtcWithdrawing ? 'Withdrawing...' : 'Withdraw'}
                  </button>
                </div>
                {ckbtcFeeInfo && (
                  <div className="text-xs text-gray-600 mt-1">Fee: total {formatBalance(ckbtcFeeInfo.total)} (minter {formatBalance(ckbtcFeeInfo.minter)}, network {formatBalance(ckbtcFeeInfo.bitcoin)})</div>
                )}
                {ckbtcWithdrawError && <div className="text-red-600 text-sm mt-1">{ckbtcWithdrawError}</div>}
                {ckbtcWithdrawOk && <div className="text-green-600 text-sm mt-1">{ckbtcWithdrawOk}</div>}
              </div>
            </div>
          )}
        </div>
        )}

        {/* Форма виведення коштів (тільки для власника кампанії) */}
        {isOwner && (
          <div className="mb-6 p-4 bg-yellow-50 rounded-lg">
            <h3 className="font-semibold text-yellow-900 mb-2">Withdraw Funds (Owner Only)</h3>
            <form onSubmit={handleWithdraw} className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-yellow-800 mb-1">
                  Target Address
                </label>
                <input
                  type="text"
                  value={withdrawAddress}
                  onChange={(e) => setWithdrawAddress(e.target.value)}
                  placeholder="Enter ICP address"
                  className="w-full px-3 py-2 border border-yellow-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-yellow-800 mb-1">
                  Amount (ICP)
                </label>
                <input
                  type="number"
                  step="0.00000001"
                  min="0"
                  max={formatBalance(balance)}
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  placeholder="0.00000000"
                  className="w-full px-3 py-2 border border-yellow-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  required
                />
                <p className="text-xs text-yellow-600 mt-1">
                  Available: {formatBalance(balance)} ICP
                </p>
              </div>

              {withdrawError && (
                <div className="text-red-600 text-sm bg-red-50 p-2 rounded">
                  {withdrawError}
                </div>
              )}

              {withdrawSuccess && (
                <div className="text-green-600 text-sm bg-green-50 p-2 rounded">
                  Withdrawal successful!
                </div>
              )}

              <button
                type="submit"
                disabled={withdrawLoading}
                className="w-full bg-yellow-600 hover:bg-yellow-700 disabled:bg-yellow-400 text-white font-semibold py-2 px-4 rounded-md transition-colors"
              >
                {withdrawLoading ? "Processing..." : "Withdraw Funds"}
              </button>
            </form>
          </div>
        )}

        {/* Кнопка повернення */}
        <button
          onClick={() => navigate("/")}
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 px-6 rounded-lg transition-all transform hover:scale-105"
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  );
} 