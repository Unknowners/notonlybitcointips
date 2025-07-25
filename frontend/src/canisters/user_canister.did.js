export const idlFactory = ({ IDL }) => {
  const CampaignId = IDL.Text;
  const UserId = IDL.Principal;
  const Time = IDL.Int;
  const Campaign = IDL.Record({
    'id': CampaignId,
    'owner': UserId,
    'name': IDL.Text,
    'createdAt': Time,
    'acceptedTokens': IDL.Vec(IDL.Text),
    'description': IDL.Text,
  });
  const User = IDL.Record({
    'id': UserId,
    'name': IDL.Text,
    'email': IDL.Opt(IDL.Text),
    'createdAt': Time,
  });
  return IDL.Service({
    'createCampaign': IDL.Func(
      [IDL.Text, IDL.Text, IDL.Vec(IDL.Text)],
      [IDL.Text],
      [],
    ),
    'createUser': IDL.Func([IDL.Text, IDL.Opt(IDL.Text)], [IDL.Bool], []),
    'getCampaign': IDL.Func([CampaignId], [IDL.Opt(Campaign)], ['query']),
    'getUserCampaigns': IDL.Func([UserId], [IDL.Vec(Campaign)], ['query']),
    'getAllCampaigns': IDL.Func([], [IDL.Vec(Campaign)], ['query']),
    'getAllUsers': IDL.Func([], [IDL.Vec(User)], ['query']),
    'clearUsers': IDL.Func([], [], []),
    'debugCompare': IDL.Func(
      [UserId],
      [IDL.Vec(IDL.Tuple(IDL.Text, IDL.Principal, IDL.Bool))],
      ['query'],
    ),
    'debugPrincipal': IDL.Func([UserId], [IDL.Text], ['query']),
  });
};
export const init = ({ IDL }) => { return []; };
