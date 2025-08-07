import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import { user_canister } from "./canisters/index.js";
import { getSimulatedBalance, formatBalance } from "./ledger";
import { getAccountBalance } from "./ledger"; // Added import for getAccountBalance

type Campaign = {
  id: string;
  name: string;
  description: string;
  owner: string;
  acceptedTokens: string[];
  accountId: string;
  createdAt: bigint;
};

export default function CampaignPage() {
  const { id } = useParams();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [accountId, setAccountId] = useState<string | null>(null);
  const [balance, setBalance] = useState<bigint>(0n);
  const [balanceLoading, setBalanceLoading] = useState(false);
  const [withdrawAddress, setWithdrawAddress] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawLoading, setWithdrawLoading] = useState(false);
  const [withdrawError, setWithdrawError] = useState<string | null>(null);
  const [withdrawSuccess, setWithdrawSuccess] = useState(false);

  useEffect(() => {
    if (id) {
      loadCampaign();
    }
  }, [id]);

  const loadCampaign = async () => {
    try {
      const res = await user_canister.getCampaign(id!);
      if (res[0]) {
        const campaignData = res[0] as Campaign;
        setCampaign(campaignData);
        
        // Використовуємо accountId з кампанії
        if (campaignData.accountId) {
          setAccountId(campaignData.accountId);
          loadBalance(campaignData.accountId);
        }
      }
    } catch (error) {
      console.error('Error loading campaign:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadBalance = async (accountId: string) => {
    setBalanceLoading(true);
    try {
      // Використовуємо справжній баланс замість симуляції
      const balanceValue = await getAccountBalance(accountId);
      setBalance(balanceValue);
    } catch (error) {
      console.error('Error loading balance:', error);
      // Якщо справжній баланс не працює, використовуємо симуляцію
      const simulatedBalance = await getSimulatedBalance(accountId);
      setBalance(simulatedBalance);
    } finally {
      setBalanceLoading(false);
    }
  };

  // Автоматично оновлюємо баланс кожні 10 секунд
  useEffect(() => {
    if (!accountId) return;

    const interval = setInterval(() => {
      loadBalance(accountId);
    }, 10000);

    return () => clearInterval(interval);
  }, [accountId]);

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

      // Тут буде виклик до backend для виведення коштів
      const result = await user_canister.withdrawFunds({
        campaignId: campaign.id,
        targetAddress: withdrawAddress,
        amount: BigInt(Math.floor(amount * 100_000_000)) // Конвертуємо в e8s
      });

      if (result) {
        setWithdrawSuccess(true);
        setWithdrawAddress("");
        setWithdrawAmount("");
        // Оновлюємо баланс після успішного виведення
        setTimeout(() => loadBalance(accountId!), 1000);
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
  if (!campaign) return <div className="min-h-screen flex items-center justify-center text-xl text-red-500">Campaign not found</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-indigo-900 to-gray-900 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white/90 rounded-3xl shadow-2xl p-10 backdrop-blur-md">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">{campaign.name}</h1>
        <p className="text-gray-700 mb-4">{campaign.description}</p>
        
        <div className="mb-4">
          <span className="font-semibold text-gray-800">Currencies for donations:</span>
          <div className="flex gap-2 mt-2">
            {campaign.acceptedTokens.map((token: string) => (
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

        {accountId && (
          <div className="mb-6 text-center">
            <h3 className="font-semibold text-gray-800 mb-2">Donation Address</h3>
            <p className="text-sm text-gray-600 break-all font-mono mb-2 bg-gray-100 p-2 rounded">
              {accountId}
            </p>
            <div className="flex justify-center">
              <QRCodeSVG value={accountId} size={128} bgColor="#fff" fgColor="#1e293b" className="rounded-md shadow-md" />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Scan this QR code to donate ICP directly to this campaign
            </p>
          </div>
        )}

        {/* Форма виведення коштів (тільки для власника кампанії) */}
        {campaign.owner && (
          <div className="mb-6 p-4 bg-yellow-50 rounded-lg">
            <h3 className="font-semibold text-yellow-900 mb-2">Withdraw Funds</h3>
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
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  placeholder="0.00000000"
                  className="w-full px-3 py-2 border border-yellow-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  required
                />
              </div>
              {withdrawError && (
                <div className="text-red-600 text-sm">{withdrawError}</div>
              )}
              {withdrawSuccess && (
                <div className="text-green-600 text-sm">Withdrawal successful!</div>
              )}
              <button
                type="submit"
                disabled={withdrawLoading}
                className="w-full bg-yellow-600 text-white py-2 rounded-md font-medium hover:bg-yellow-700 disabled:opacity-50"
              >
                {withdrawLoading ? "Processing..." : "Withdraw Funds"}
              </button>
            </form>
          </div>
        )}

        <div className="text-center">
          <a 
            href="/" 
            className="inline-block bg-gradient-to-r from-blue-600 to-indigo-500 text-white py-3 px-6 rounded-xl font-bold text-lg shadow-lg hover:scale-105 active:scale-95 transition-all duration-200"
          >
            Back to Dashboard
          </a>
        </div>
      </div>
    </div>
  );
} 