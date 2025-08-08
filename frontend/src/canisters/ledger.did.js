export const idlFactory = ({ IDL }) => {
  const AccountBalanceArgs = IDL.Record({ account: IDL.Text });
  const ICP = IDL.Record({ e8s: IDL.Nat64 });
  return IDL.Service({
    account_balance_dfx: IDL.Func([AccountBalanceArgs], [ICP], ['query'])
  });
};
export const init = ({ IDL }) => { return []; }; 