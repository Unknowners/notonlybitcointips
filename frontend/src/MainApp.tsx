import React, { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { user_canister } from "./canisters";

// Типи для кампаній
type Campaign = {
  id: string;
  name: string;
  description: string;
  owner: string;
  acceptedTokens: string[];
  createdAt: bigint;
};

type CampaignDisplay = Omit<Campaign, 'createdAt'> & {
  createdAt: string;
};

const TOKENS = ["ICP", "BTC", "ETH", "USDT"];

export default function MainApp() {
  const [step, setStep] = useState<"register" | "dashboard" | "qr">("register");
  const [user, setUser] = useState<{ name: string; email: string }>({ name: "", email: "" });
  const [campaign, setCampaign] = useState({ name: "", description: "", tokens: [] as string[] });
  const [campaignId, setCampaignId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userCampaigns, setUserCampaigns] = useState<CampaignDisplay[]>([]);

  // --- КАМПАНІЇ КОРИСТУВАЧА ---
  const fetchUserCampaigns = async () => {
    try {
      console.log("Fetching all campaigns...");
      const res = await user_canister.getAllCampaigns() as Campaign[];
      // Конвертуємо BigInt в string для JSON
      const campaignsForDisplay = res.map(campaign => ({
        ...campaign,
        createdAt: campaign.createdAt.toString()
      }));
      console.log("All campaigns:", campaignsForDisplay);
      setUserCampaigns(campaignsForDisplay);
    } catch (err) {
      console.error("Error fetching campaigns:", err);
      setUserCampaigns([]);
    }
  };

  // --- ХЕНДЛЕРИ ---
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await user_canister.createUser(user.name, user.email ? [user.email] : []);
      if (res) {
        setStep("dashboard");
        fetchUserCampaigns();
      } else {
        setError("Користувач вже існує або помилка реєстрації.");
      }
    } catch {
      setError("Помилка підключення до canister.");
    }
    setLoading(false);
  };

  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await user_canister.createCampaign(
        campaign.name,
        campaign.description,
        campaign.tokens
      );
      console.log("Кампанія створена, id:", res);
      setCampaignId(res);
      setStep("dashboard");
      console.log("step:", "dashboard");
      fetchUserCampaigns();
    } catch (err) {
      setError("Помилка створення кампанії.");
      console.error("Помилка створення кампанії:", err);
    }
    setLoading(false);
  };

  // --- UI ---
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-indigo-900 to-gray-900 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white/90 rounded-3xl shadow-2xl p-10 backdrop-blur-md animate-fade-in">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-full p-3 shadow-lg mb-2">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="12" fill="#6366F1"/>
              <path d="M8 12l2.5 2.5L16 9" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-1 drop-shadow-lg">
            {step === "register" && "Вітаємо у Donation Hub"}
            {step === "dashboard" && "Створіть свою кампанію"}
          </h1>
          <p className="text-gray-500 text-center text-lg font-medium">
            {step === "register" && "Зареєструйтесь, щоб створювати збори та отримувати донати"}
            {step === "dashboard" && "Заповніть форму для старту збору"}
          </p>
        </div>

        {/* Список кампаній користувача */}
        {step === "dashboard" && (
          <div className="mb-8">
            <h2 className="text-lg font-bold mb-2 text-gray-800">Ваші кампанії</h2>
            <pre>{JSON.stringify(userCampaigns, null, 2)}</pre>
            <ul className="space-y-2">
              {userCampaigns.map((c, i) => (
                <li key={i} className="bg-gray-100 rounded-lg px-4 py-2 flex justify-between items-center">
                  <div>
                    <div className="font-semibold text-gray-900">{c.name}</div>
                    <div className="text-gray-500 text-sm">{c.description}</div>
                    <div className="text-xs text-gray-400">Created: {new Date(Number(c.createdAt) / 1_000_000).toLocaleString()}</div>
                  </div>
                  <a href={`/donate/${c.id}`} className="text-blue-600 hover:underline font-bold">Перейти</a>
                </li>
              ))}
            </ul>
          </div>
        )}

        {step === "register" && (
          <form className="space-y-6" onSubmit={handleRegister}>
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Ім'я</label>
              <input
                type="text"
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg transition"
                required
                value={user.name}
                onChange={e => setUser(u => ({ ...u, name: e.target.value }))}
                placeholder="Введіть ім'я"
                autoFocus
              />
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Email <span className="text-gray-400 font-normal">(необов'язково)</span></label>
              <input
                type="email"
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg transition"
                value={user.email}
                onChange={e => setUser(u => ({ ...u, email: e.target.value }))}
                placeholder="email@example.com"
              />
            </div>
            {error && <div className="text-red-500 text-sm font-semibold text-center">{error}</div>}
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-500 text-white py-3 rounded-xl font-bold text-lg shadow-lg hover:scale-105 active:scale-95 transition-all duration-200"
              disabled={loading}
            >
              {loading ? "Реєстрація..." : "Зареєструватись"}
            </button>
          </form>
        )}

        {step === "dashboard" && (
          <form className="space-y-6" onSubmit={e => { console.log("submit"); handleCreateCampaign(e); }}>
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Назва кампанії</label>
              <input
                type="text"
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-lg transition"
                required
                value={campaign.name}
                onChange={e => setCampaign(c => ({ ...c, name: e.target.value }))}
                placeholder="Наприклад, Підтримка волонтерів"
                autoFocus
              />
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Опис</label>
              <textarea
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-lg transition min-h-[80px]"
                required
                value={campaign.description}
                onChange={e => setCampaign(c => ({ ...c, description: e.target.value }))}
                placeholder="Опишіть мету збору..."
              />
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Валюти для донатів</label>
              <div className="flex flex-wrap gap-3">
                {TOKENS.map(token => (
                  <label key={token} className="flex items-center space-x-2 bg-gray-100 px-3 py-2 rounded-lg shadow-sm cursor-pointer hover:bg-blue-50 transition">
                    <input
                      type="checkbox"
                      checked={campaign.tokens.includes(token)}
                      onChange={e => {
                        setCampaign(c => ({
                          ...c,
                          tokens: e.target.checked
                            ? [...c.tokens, token]
                            : c.tokens.filter(t => t !== token),
                        }));
                      }}
                      className="accent-indigo-500 w-5 h-5"
                    />
                    <span className="font-medium text-gray-700">{token}</span>
                  </label>
                ))}
              </div>
            </div>
            {error && <div className="text-red-500 text-sm font-semibold text-center">{error}</div>}
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-green-500 to-blue-500 text-white py-3 rounded-xl font-bold text-lg shadow-lg hover:scale-105 active:scale-95 transition-all duration-200"
              disabled={loading}
            >
              {loading ? "Створення..." : "Створити кампанію"}
            </button>
          </form>
        )}

        {step === "qr" && campaignId && (
          <>
            <div className="flex flex-col items-center mb-6">
              <div className="bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-full p-3 shadow-lg mb-2 animate-bounce">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="12" fill="#22c55e"/>
                  <path d="M8 12l2.5 2.5L16 9" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Кампанію створено!</h2>
              <p className="text-gray-600 text-center mb-2">Поділіться цим лінком або QR-кодом:</p>
              <div className="mb-2 break-all text-blue-700 underline text-center text-lg font-mono select-all cursor-pointer" onClick={() => navigator.clipboard.writeText(`${window.location.origin}/donate/${campaignId}`)}>
                {`${window.location.origin}/donate/${campaignId}`}
              </div>
              <div className="flex justify-center my-4">
                <QRCodeSVG value={`${window.location.origin}/donate/${campaignId}`} size={200} bgColor="#fff" fgColor="#1e293b" className="rounded-xl shadow-xl border-4 border-white" />
              </div>
              <div className="text-gray-500 text-sm text-center">Відскануйте QR-код або скопіюйте лінк, щоб поділитись кампанією у соцмережах чи месенджерах.</div>
            </div>
            <button
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-500 text-white py-3 rounded-xl font-bold text-lg shadow-lg hover:scale-105 active:scale-95 transition-all duration-200 mt-2"
              onClick={() => {
                setCampaign({ name: "", description: "", tokens: [] });
                setCampaignId(null);
                setStep("dashboard");
                fetchUserCampaigns();
              }}
            >
              Створити ще одну кампанію
            </button>
          </>
        )}
      </div>
      <div className="mt-8 text-gray-400 text-xs text-center select-none">&copy; {new Date().getFullYear()} Donation Hub. Powered by ICP Hackathon.</div>
    </div>
  );
} 