export const idlFactory = ({ IDL }) => {
  const CampaignId = IDL.Text;
  const UserId = IDL.Principal;
  const Time = IDL.Int;
  const Campaign = IDL.Record({
    'id' : CampaignId,
    'owner' : UserId,
    'name' : IDL.Text,
    'createdAt' : Time,
    'acceptedTokens' : IDL.Vec(IDL.Text),
    'description' : IDL.Text,
  });
  const User = IDL.Record({
    'id' : UserId,
    'name' : IDL.Text,
    'createdAt' : Time,
    'email' : IDL.Opt(IDL.Text),
  });
  return IDL.Service({
    'clearUsers' : IDL.Func([], [], []),
    'createCampaign' : IDL.Func(
        [IDL.Text, IDL.Text, IDL.Vec(IDL.Text)],
        [IDL.Text],
        [],
      ),
    'createUser' : IDL.Func([IDL.Text, IDL.Opt(IDL.Text)], [IDL.Bool], []),
    'debugCompare' : IDL.Func(
        [IDL.Principal],
        [IDL.Vec(IDL.Tuple(IDL.Text, IDL.Principal, IDL.Bool))],
        ['query'],
      ),
    'debugPrincipal' : IDL.Func([IDL.Principal], [IDL.Text], ['query']),
    'getAllCampaigns' : IDL.Func([], [IDL.Vec(Campaign)], ['query']),
    'getAllUsers' : IDL.Func([], [IDL.Vec(User)], ['query']),
    'getCampaign' : IDL.Func([CampaignId], [IDL.Opt(Campaign)], ['query']),
    'getUserCampaigns' : IDL.Func([UserId], [IDL.Vec(Campaign)], ['query']),
    'whoami' : IDL.Func([], [IDL.Principal], ['query']),
  });
};
export const init = ({ IDL }) => { return []; };
