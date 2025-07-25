export const idlFactory = ({ IDL }) => {
  const UserId = IDL.Principal;
  const Time = IDL.Int;
  const User = IDL.Record({
    'id' : UserId,
    'username' : IDL.Text,
    'createdAt' : Time,
    'wallet' : IDL.Text,
  });
  return IDL.Service({
    'getAllUsers' : IDL.Func([], [IDL.Vec(User)], ['query']),
    'getUser' : IDL.Func([UserId], [IDL.Opt(User)], ['query']),
    'registerUser' : IDL.Func([IDL.Text, IDL.Text], [IDL.Bool], []),
  });
};
export const init = ({ IDL }) => { return []; };
