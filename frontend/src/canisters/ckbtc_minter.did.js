export const idlFactory = ({ IDL }) => {
  const Subaccount = IDL.Vec(IDL.Nat8);
  const GetAddressArgs = IDL.Record({ owner: IDL.Opt(IDL.Principal), subaccount: IDL.Opt(Subaccount) });
  const UpdateBalanceArgs = GetAddressArgs;
  const UpdateBalanceOk = IDL.Record({ balance: IDL.Nat64 });
  const UpdateBalanceErr = IDL.Variant({ GenericError: IDL.Text });
  const UpdateBalanceResult = IDL.Variant({ Ok: UpdateBalanceOk, Err: UpdateBalanceErr });
  const RetrieveBtcArgs = IDL.Record({ amount: IDL.Nat64, address: IDL.Text });
  const BlockIndex = IDL.Nat64;
  const RetrieveBtcErr = IDL.Variant({ GenericError: IDL.Text, TemporarilyUnavailable: IDL.Null, MalformedAddress: IDL.Text, InsufficientFunds: IDL.Null });
  const RetrieveBtcResult = IDL.Variant({ Ok: BlockIndex, Err: RetrieveBtcErr });
  const EstimateArgs = RetrieveBtcArgs;
  const FeeInfo = IDL.Record({ minter_fee: IDL.Nat64, bitcoin_fee: IDL.Nat64, total_fee: IDL.Nat64 });
  return IDL.Service({
    get_btc_address: IDL.Func([GetAddressArgs], [IDL.Text], []),
    update_balance: IDL.Func([UpdateBalanceArgs], [UpdateBalanceResult], []),
    retrieve_btc: IDL.Func([RetrieveBtcArgs], [RetrieveBtcResult], []),
    estimate_withdrawal_fee: IDL.Func([EstimateArgs], [FeeInfo], ['query'])
  });
};
export const init = ({ IDL }) => { return []; }; 