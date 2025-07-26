export const idlFactory = ({ IDL }) => {
  const UserId = IDL.Principal;
  const CampaignId = IDL.Text;
  const Campaign = IDL.Record({
    'id' : CampaignId,
    'owner' : UserId,
    'name' : IDL.Text,
    'createdAt' : IDL.Nat64,
    'subaccount' : IDL.Vec(IDL.Nat8),
    'acceptedTokens' : IDL.Vec(IDL.Text),
    'description' : IDL.Text,
  });
  const User = IDL.Record({
    'id' : UserId,
    'name' : IDL.Text,
    'createdAt' : IDL.Nat64,
    'email' : IDL.Opt(IDL.Text),
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
    'getAllCampaigns' : IDL.Func([], [IDL.Vec(Campaign)], ['query']),
    'getAllUsers' : IDL.Func([], [IDL.Vec(User)], ['query']),
    'getCampaign' : IDL.Func([IDL.Text], [IDL.Opt(Campaign)], ['query']),
    'getCampaignSubaccount' : IDL.Func([
        IDL.Text
      ], [IDL.Opt(IDL.Vec(IDL.Nat8))], ['query']),
    'getPrincipal' : IDL.Func([], [IDL.Principal], ['query']),
    'getUserCampaigns' : IDL.Func([UserId], [IDL.Vec(Campaign)], ['query']),
    'userExists' : IDL.Func([], [IDL.Bool], ['query']),
    'whoami' : IDL.Func([], [IDL.Principal], []),
  });
  return UserCanister;
};
export const init = ({ IDL }) => { return []; };
