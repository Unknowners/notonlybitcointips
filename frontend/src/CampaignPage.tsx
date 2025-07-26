import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import { user_canister, canisterId } from "./canisters/index.js";
import { accountIdentifier } from "./account";

export default function CampaignPage() {
  const { id } = useParams();
  const [campaign, setCampaign] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [account, setAccount] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      user_canister.getCampaign(id).then((res: any) => {
        setCampaign(res[0] || null);
        setLoading(false);
      });
      user_canister.getCampaignSubaccount(id).then(async (res: any) => {
        if (res[0]) {
          const sub = new Uint8Array(res[0]);
          const acc = await accountIdentifier(canisterId, sub);
          setAccount(acc);
        }
      });
    }
  }, [id]);

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
        {account && (
          <div className="mb-4 text-center">
            <p className="text-sm text-gray-600 break-all font-mono mb-2">{account}</p>
            <div className="flex justify-center">
              <QRCodeSVG value={account} size={128} bgColor="#fff" fgColor="#1e293b" className="rounded-md shadow-md" />
            </div>
          </div>
        )}
        <button className="w-full bg-gradient-to-r from-green-500 to-blue-500 text-white py-3 rounded-xl font-bold text-lg shadow-lg hover:scale-105 active:scale-95 transition-all duration-200 mt-4">
          Donate
        </button>
      </div>
    </div>
  );
} 