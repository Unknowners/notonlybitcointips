import React, { useState, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import { AuthClient } from '@dfinity/auth-client';
import { createActor } from "./canisters/index.js";

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
  const [step, setStep] = useState<"auth" | "register" | "dashboard" | "qr">("auth");
  const [user, setUser] = useState<{ name: string; email: string }>({ name: "", email: "" });
  const [campaign, setCampaign] = useState({ name: "", description: "", tokens: [] as string[] });
  const [campaignId, setCampaignId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userCampaigns, setUserCampaigns] = useState<CampaignDisplay[]>([]);
  const [isFetchingCampaigns, setIsFetchingCampaigns] = useState(false);
  
  // Стан для авторизації
  const [authState, setAuthState] = useState({
    actor: undefined as any,
    authClient: undefined as AuthClient | undefined,
    isAuthenticated: false,
    principal: 'Click "Whoami" to see your Principal ID'
  });

  // Налаштування мережі
  const isMainnet = window.location.hostname.includes('ic0.app') || 
                   window.location.hostname.includes('icp0.io') ||
                   window.location.hostname.includes('icp1.io') ||
                   import.meta.env.VITE_DFX_NETWORK === 'ic';
  
  const internetIdentityCanisterId = isMainnet
    ? "rdmx6-jaaaa-aaaaa-aaadq-cai" // Production Internet Identity
    : (import.meta.env.VITE_CANISTER_ID_INTERNET_IDENTITY || 'u6s2n-gx777-77774-qaaba-cai'); // Local Internet Identity
  
  const identityProvider = isMainnet
    ? 'https://identity.ic0.app' // Mainnet
    : `http://${internetIdentityCanisterId}.localhost:4943`; // Local
    
  console.log('🌐 Network detection:', {
    hostname: window.location.hostname,
    isMainnet,
    identityProvider,
    internetIdentityCanisterId,
    VITE_CANISTER_ID_INTERNET_IDENTITY: import.meta.env.VITE_CANISTER_ID_INTERNET_IDENTITY,
    VITE_DFX_NETWORK: import.meta.env.VITE_DFX_NETWORK
  });

  // Ініціалізація авторизації
  useEffect(() => {
    console.log('🚀 MainApp: Component mounted, calling updateActor...');
    updateActor();
  }, []);

  // Очищаємо кампанії при зміні actor (новий користувач)
  useEffect(() => {
    setUserCampaigns([]);
  }, [authState.actor]);

  // Автоматично завантажуємо кампанії коли actor стає доступним і користувач на dashboard
  useEffect(() => {
    if (authState.actor && step === "dashboard") {
      // Використовуємо setTimeout щоб уникнути повторних викликів
      const timeoutId = setTimeout(() => {
        fetchUserCampaigns();
      }, 100);
      
      return () => clearTimeout(timeoutId);
    }
  }, [authState.actor, step, campaignId]);

  const updateActor = async () => {
    try {
      console.log('🔄 updateActor: Starting...');
      const authClient = await AuthClient.create({
        idleOptions: {
          disableDefaultIdleCallback: true,
          disableIdle: true
        }
      });
      const identity = authClient.getIdentity();
      const actor = createActor(identity);
      const isAuthenticated = await authClient.isAuthenticated();

      console.log('🔐 Auth status:', { isAuthenticated });

      setAuthState((prev) => ({
        ...prev,
        actor,
        authClient,
        isAuthenticated
      }));

                        // Якщо користувач авторизований, перевіряємо чи він вже існує
                  if (isAuthenticated) {
                    console.log('✅ User is authenticated, checking if user exists...');
                    
                    // Функція для перевірки існування користувача з повторними спробами
                    // Спрощена логіка: спробуємо отримати кампанії користувача
                    // Якщо це не викликає помилку, значить користувач існує
                    let userExists = false;
                    try {
                      console.log('🔍 Checking user existence via getUserCampaigns...');
                      // Спробуємо whoami, але якщо його немає, використовуємо анонімний principal
                      let principal;
                      try {
                        principal = await actor.whoami();
                      } catch (whoamiError) {
                        console.log('❌ whoami not available, using anonymous principal');
                        // Використовуємо анонімний principal для production canister
                        // Імпортуємо Principal з @dfinity/principal
                        const { Principal } = await import('@dfinity/principal');
                        principal = Principal.fromText("2vxsx-fae");
                      }
                      await actor.getUserCampaigns(principal);
                      console.log('✅ User exists - getUserCampaigns succeeded');
                      userExists = true;
                    } catch (error) {
                      console.log('❌ getUserCampaigns failed:', error);
                      // Якщо getUserCampaigns не працює, спробуємо createUser
                      try {
                        console.log('🔍 Trying createUser as fallback...');
                        await actor.createUser("", []);
                        console.log('✅ createUser succeeded - user exists');
                        userExists = true;
                      } catch (createUserError) {
                        console.log('❌ createUser also failed:', createUserError);
                        // Якщо обидва методи не працюють, припускаємо що користувач не існує
                        userExists = false;
                      }
                    }
                    
                                          if (userExists) {
                        console.log('👤 User exists, going to dashboard');
                        // Користувач вже існує, переходимо до dashboard
                        setStep("dashboard");
                        // fetchUserCampaigns буде викликано автоматично через useEffect
                      } else {
                      console.log('🆕 User does not exist, showing registration form');
                      // Користувач не існує, показуємо форму реєстрації
                      setStep("register");
                    }
                  } else {
                    console.log('❌ User is not authenticated');
                  }
    } catch (error) {
      console.error('❌ Error updating actor:', error);
    }
  };

  const login = async () => {
    if (!authState.authClient) return;
    
    await authState.authClient.login({
      identityProvider,
      onSuccess: updateActor
    });
  };

  const logout = async () => {
    if (!authState.authClient) return;
    
    await authState.authClient.logout();
    updateActor();
    setStep("auth");
    // Очищаємо кампанії при logout
    setUserCampaigns([]);
  };

  const whoami = async () => {
    if (!authState.actor) return;

    console.log('🔍 Calling whoami...');
    setAuthState((prev) => ({
      ...prev,
      principal: 'Loading...'
    }));

    try {
      const result = await authState.actor.whoami();
      const principal = result.toString();
      console.log('👤 Whoami result:', principal);
      setAuthState((prev) => ({
        ...prev,
        principal
      }));
    } catch (error) {
      console.error('❌ Error calling whoami:', error);
      // Якщо whoami не доступний, показуємо повідомлення
      setAuthState((prev) => ({
        ...prev,
        principal: 'Whoami not available in production'
      }));
    }
  };

  // --- КАМПАНІЇ КОРИСТУВАЧА ---
  
  const fetchUserCampaigns = async () => {
    if (!authState.actor || isFetchingCampaigns) {
      return;
    }
    
    setIsFetchingCampaigns(true);
    
    const fetchWithRetry = async (retries = 3) => {
      for (let i = 0; i < retries; i++) {
        try {
          // Використовуємо whoami + getUserCampaigns для отримання кампаній поточного користувача
          let principal;
          try {
            principal = await authState.actor.whoami();
          } catch (whoamiError) {
            console.log('❌ whoami not available, using anonymous principal');
            // Використовуємо анонімний principal для production canister
            // Імпортуємо Principal з @dfinity/principal
            const { Principal } = await import('@dfinity/principal');
            principal = Principal.fromText("2vxsx-fae");
          }
          const res = await authState.actor.getUserCampaigns(principal) as Campaign[];
          // Конвертуємо BigInt в string для JSON
          const campaignsForDisplay = res.map(campaign => ({
            ...campaign,
            createdAt: campaign.createdAt.toString()
          }));
          setUserCampaigns(campaignsForDisplay);
          return;
        } catch (err) {
          console.error(`Error fetching campaigns (attempt ${i + 1}/${retries}):`, err);
          if (i === retries - 1) {
            setUserCampaigns([]);
          } else {
            // Чекаємо перед повторною спробою
            await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
          }
        }
      }
    };
    
    try {
      await fetchWithRetry();
    } finally {
      setIsFetchingCampaigns(false);
    }
  };

  // --- ХЕНДЛЕРИ ---
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('📝 handleRegister: Starting registration...');
    console.log('👤 User data:', user);
    console.log('🔐 Using authenticated actor:', !!authState.actor);
    setLoading(true);
    setError(null);
    try {
      console.log('🔧 Calling createUser with authenticated actor...');
      const res = await authState.actor.createUser(user.name, user.email ? [user.email] : []);
      console.log('📊 createUser result:', res);
      if (res) {
        console.log('✅ Registration successful, going to dashboard');
        setStep("dashboard");
        // fetchUserCampaigns буде викликано автоматично через useEffect
      } else {
        console.log('❌ Registration failed - user already exists');
        setError("User already exists or registration error.");
      }
    } catch (error) {
      console.error('❌ Error during registration:', error);
      // Якщо createUser не існує (production canister), просто переходимо до dashboard
      if (error && error.toString().includes('Canister has no update method \'createUser\'')) {
        console.log('🔄 createUser not available, assuming user exists, going to dashboard');
        setStep("dashboard");
        // fetchUserCampaigns буде викликано автоматично через useEffect
      } else {
        setError("Connection error to canister.");
      }
    }
    setLoading(false);
  };

  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Валідація: перевіряємо чи вибрана хоча б одна валюта
    if (campaign.tokens.length === 0) {
      setError("Please select at least one currency for donations");
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      const res = await authState.actor.createCampaign(
        campaign.name,
        campaign.description,
        campaign.tokens
      );
      console.log("Campaign created, id:", res);
      setCampaignId(res);
      // Очищаємо форму після успішного створення
      setCampaign({ name: "", description: "", tokens: [] });
      setStep("dashboard");
      console.log("step:", "dashboard");
      // Примусово оновлюємо список кампаній після створення
      setTimeout(() => {
        fetchUserCampaigns();
      }, 100);
    } catch (err) {
      setError("Error creating campaign.");
      console.error("Error creating campaign:", err);
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
            {step === "auth" && "Not Only Bitcoin Tips"}
            {step === "register" && "Complete Registration"}
            {step === "dashboard" && "Create Your Campaign"}
          </h1>
          <p className="text-gray-500 text-center text-lg font-medium">
            {step === "auth" && "Sign in with Internet Identity to create donation campaigns"}
            {step === "register" && "Fill in additional information"}
            {step === "dashboard" && "Fill out the form to start a donation campaign"}
          </p>
        </div>

        {/* Екран авторизації */}
        {step === "auth" && (
          <div className="space-y-6">
            <div className="text-center">
              <p className="text-gray-600 mb-4">
                To use the application, you need to sign in with Internet Identity
              </p>
              <button
                onClick={login}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-500 text-white py-3 rounded-xl font-bold text-lg shadow-lg hover:scale-105 active:scale-95 transition-all duration-200"
              >
                Sign in with Internet Identity
              </button>
            </div>
            
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">What is Internet Identity?</h3>
              <p className="text-blue-800 text-sm">
                Internet Identity is an authentication system from DFINITY that allows you to securely sign in to dApps without passwords, 
                using your device or browser as a key.
              </p>
            </div>
          </div>
        )}

        {/* Інформація про Principal ID */}
        {authState.isAuthenticated && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">Your Principal ID:</h3>
            <p className="text-sm text-gray-600 font-mono break-all mb-2">{authState.principal}</p>
            <div className="flex gap-2">
              <button
                onClick={whoami}
                className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 transition"
              >
                Update
              </button>
              <button
                onClick={logout}
                className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600 transition"
              >
                Sign Out
              </button>
            </div>
          </div>
        )}

        {/* Список кампаній користувача */}
        {step === "dashboard" && (
          <div className="mb-8">
            <h2 className="text-lg font-bold mb-2 text-gray-800">Your Campaigns</h2>
            <ul className="space-y-2">
              {userCampaigns.map((c, i) => (
                <li key={i} className="bg-gray-100 rounded-lg px-4 py-2 flex justify-between items-center">
                  <div>
                    <div className="font-semibold text-gray-900">{c.name}</div>
                    <div className="text-gray-500 text-sm">{c.description}</div>
                    <div className="text-xs text-gray-400">Created: {new Date(Number(c.createdAt) / 1_000_000).toLocaleString()}</div>
                  </div>
                  <a href={`/donate/${c.id}`} className="text-blue-600 hover:underline font-bold">Go to</a>
                </li>
              ))}
            </ul>
          </div>
        )}

        {step === "register" && (
          <form className="space-y-6" onSubmit={handleRegister}>
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Name</label>
              <input
                type="text"
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg transition"
                required
                value={user.name}
                onChange={e => setUser(u => ({ ...u, name: e.target.value }))}
                placeholder="Enter your name"
                autoFocus
              />
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Email <span className="text-gray-400 font-normal">(optional)</span></label>
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
              {loading ? "Registering..." : "Complete Registration"}
            </button>
          </form>
        )}

        {step === "dashboard" && (
          <form className="space-y-6" onSubmit={e => { console.log("submit"); handleCreateCampaign(e); }}>
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Campaign Name</label>
              <input
                type="text"
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-lg transition"
                required
                value={campaign.name}
                onChange={e => setCampaign(c => ({ ...c, name: e.target.value }))}
                placeholder="e.g., Volunteer Support"
                autoFocus
              />
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Description</label>
              <textarea
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-lg transition min-h-[80px]"
                required
                value={campaign.description}
                onChange={e => setCampaign(c => ({ ...c, description: e.target.value }))}
                placeholder="Describe the purpose of the campaign..."
              />
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Currencies for Donations <span className="text-red-500">*</span></label>
              <div className="flex flex-wrap gap-3">
                {TOKENS.map(token => {
                  const isAvailable = token === "ICP";
                  const isSelected = campaign.tokens.includes(token);
                  
                  return (
                    <label 
                      key={token} 
                      className={`flex items-center space-x-2 px-3 py-2 rounded-lg shadow-sm transition ${
                        isAvailable 
                          ? 'bg-gray-100 cursor-pointer hover:bg-blue-50' 
                          : 'bg-gray-50 cursor-not-allowed opacity-60'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={e => {
                          if (isAvailable) {
                            setCampaign(c => ({
                              ...c,
                              tokens: e.target.checked
                                ? [...c.tokens, token]
                                : c.tokens.filter(t => t !== token),
                            }));
                          }
                        }}
                        disabled={!isAvailable}
                        className="accent-indigo-500 w-5 h-5"
                      />
                      <span className="font-medium text-gray-700">{token}</span>
                      {!isAvailable && (
                        <span className="text-xs text-gray-500 bg-gray-200 px-1 py-0.5 rounded">Coming Soon</span>
                      )}
                    </label>
                  );
                })}
              </div>

            </div>
            {error && <div className="text-red-500 text-sm font-semibold text-center">{error}</div>}
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-green-500 to-blue-500 text-white py-3 rounded-xl font-bold text-lg shadow-lg hover:scale-105 active:scale-95 transition-all duration-200"
              disabled={loading}
            >
              {loading ? "Creating..." : "Create Campaign"}
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
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Campaign Created!</h2>
              <p className="text-gray-600 text-center mb-2">Share this link or QR code:</p>
              <div className="mb-2 break-all text-blue-700 underline text-center text-lg font-mono select-all cursor-pointer" onClick={() => navigator.clipboard.writeText(`${window.location.origin}/donate/${campaignId}`)}>
                {`${window.location.origin}/donate/${campaignId}`}
              </div>
              <div className="flex justify-center my-4">
                <QRCodeSVG value={`${window.location.origin}/donate/${campaignId}`} size={200} bgColor="#fff" fgColor="#1e293b" className="rounded-xl shadow-xl border-4 border-white" />
              </div>
              <div className="text-gray-500 text-sm text-center">Scan the QR code or copy the link to share the campaign on social networks or messengers.</div>
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
              Create Another Campaign
            </button>
          </>
        )}
      </div>
      <div className="mt-8 text-gray-400 text-xs text-center select-none">&copy; {new Date().getFullYear()} Donation Hub. Powered by ICP Hackathon.</div>
    </div>
  );
} 