declare module "./canisters" {
  export const canisterId: string;
  export const user_canister: {
    getAllCampaigns: () => Promise<any[]>;
    createUser: (name: string, email: string[] | []) => Promise<boolean>;
    createCampaign: (name: string, description: string, acceptedTokens: string[]) => Promise<string>;
    getCampaign: (id: string) => Promise<any>;
    getUserCampaigns: (userId: string) => Promise<any[]>;
  };
} 