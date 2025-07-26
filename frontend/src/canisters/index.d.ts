export const canisterId: string;
export const user_canister: {
  getAllCampaigns: () => Promise<any[]>;
  createUser: (name: string, email: string[] | []) => Promise<boolean>;
  createCampaign: (name: string, description: string, acceptedTokens: string[]) => Promise<string>;
  getCampaign: (id: string) => Promise<any>;
  getCampaignSubaccount: (id: string) => Promise<Uint8Array | undefined>;
  getUserCampaigns: (userId: string) => Promise<any[]>;
  whoami: () => Promise<any>;
  userExists: () => Promise<boolean>;
  clearUsers: () => Promise<void>;
};
export const createActor: (identity: any) => {
  getAllCampaigns: () => Promise<any[]>;
  createUser: (name: string, email: string[] | []) => Promise<boolean>;
  createCampaign: (name: string, description: string, acceptedTokens: string[]) => Promise<string>;
  getCampaign: (id: string) => Promise<any>;
  getCampaignSubaccount: (id: string) => Promise<Uint8Array | undefined>;
  getUserCampaigns: (userId: string) => Promise<any[]>;
  whoami: () => Promise<any>;
  userExists: () => Promise<boolean>;
  clearUsers: () => Promise<void>;
};