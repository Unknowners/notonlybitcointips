export const idlFactory = ({ IDL }) => {
  const UserId = IDL.Principal;
  const AccountId = IDL.Text;
  const CampaignId = IDL.Text;
  const Campaign = IDL.Record({
    'id' : CampaignId,
    'accountId' : AccountId,
    'owner' : UserId,
    'name' : IDL.Text,
    'createdAt' : IDL.Nat64,
    'acceptedTokens' : IDL.Vec(IDL.Text),
    'subaccount' : IDL.Vec(IDL.Nat8),
    'description' : IDL.Text,
  });
  const User = IDL.Record({
    'id' : UserId,
    'name' : IDL.Text,
    'createdAt' : IDL.Nat64,
    'email' : IDL.Opt(IDL.Text),
  });
  const TransferRequest = IDL.Record({
    'campaignId' : CampaignId,
    'targetAddress' : IDL.Text,
    'amount' : IDL.Nat64,
  });
  const UserCanister = IDL.Service({
    'clearUsers' : IDL.Func([], [], []),
    'createCampaign' : IDL.Func(
        [IDL.Text, IDL.Text, IDL.Vec(IDL.Text)],
        [IDL.Text],
        [],
      ),
    'createUser' : IDL.Func([IDL.Text, IDL.Opt(IDL.Text)], [IDL.Bool], []),
    'debugCompare' : IDL.Func(
        [UserId],
        [IDL.Vec(IDL.Tuple(IDL.Text, IDL.Principal, IDL.Bool))],
        ['query'],
      ),
    'debugPrincipal' : IDL.Func([UserId], [IDL.Text], ['query']),
    'getAccountBalance' : IDL.Func([AccountId], [IDL.Nat64], ['query']),
    'getAllCampaigns' : IDL.Func([], [IDL.Vec(Campaign)], ['query']),
    'getAllUsers' : IDL.Func([], [IDL.Vec(User)], ['query']),
    'getCampaign' : IDL.Func([IDL.Text], [IDL.Opt(Campaign)], ['query']),
    'getCampaignAccountId' : IDL.Func(
        [IDL.Text],
        [IDL.Opt(AccountId)],
        ['query'],
      ),
    'getCampaignSubaccount' : IDL.Func(
        [IDL.Text],
        [IDL.Opt(IDL.Vec(IDL.Nat8))],
        ['query'],
      ),
    'getPrincipal' : IDL.Func([], [IDL.Principal], ['query']),
    'getUserCampaigns' : IDL.Func([UserId], [IDL.Vec(Campaign)], ['query']),
    'userExists' : IDL.Func([], [IDL.Bool], ['query']),
    'whoami' : IDL.Func([], [IDL.Principal], []),
    'withdrawFunds' : IDL.Func([TransferRequest], [IDL.Bool], []),
  });
  return UserCanister;
};
export const init = ({ IDL }) => { return []; };
