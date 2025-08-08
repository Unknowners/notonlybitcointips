export const idlFactory = ({ IDL }) => {
  const Subaccount = IDL.Vec(IDL.Nat8);
  const GetAddressArgs = IDL.Record({ owner: IDL.Opt(IDL.Principal), subaccount: IDL.Opt(Subaccount) });
  const UpdateBalanceArgs = GetAddressArgs;
  const UpdateBalanceOk = IDL.Record({ balance: IDL.Nat64 });
  const UpdateBalanceErr = IDL.Variant({ GenericError: IDL.Text });
  const UpdateBalanceResult = IDL.Variant({ Ok: UpdateBalanceOk, Err: UpdateBalanceErr });
  return IDL.Service({
    get_btc_address: IDL.Func([GetAddressArgs], [IDL.Text], ['query']),
    update_balance: IDL.Func([UpdateBalanceArgs], [UpdateBalanceResult], [])
  });
};
export const init = ({ IDL }) => { return []; }; 