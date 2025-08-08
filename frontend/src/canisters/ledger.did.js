export const idlFactory = ({ IDL }) => {
  const AccountBalanceArgs = IDL.Record({ account: IDL.Text });
  const ICP = IDL.Record({ e8s: IDL.Nat64 });
  const Memo = IDL.Nat64;
  const AccountIdentifier = IDL.Vec(IDL.Nat8);
  const Subaccount = IDL.Vec(IDL.Nat8);
  const TimeStamp = IDL.Record({ timestamp_nanos: IDL.Nat64 });
  const TransferArgs = IDL.Record({
    memo: Memo,
    amount: ICP,
    fee: ICP,
    from_subaccount: IDL.Opt(Subaccount),
    to: AccountIdentifier,
    created_at_time: IDL.Opt(TimeStamp)
  });
  const BlockIndex = IDL.Nat64;
  const TransferError = IDL.Variant({
    TxTooOld: IDL.Record({ allowed_window_nanos: IDL.Nat64 }),
    BadFee: IDL.Record({ expected_fee: ICP }),
    InsufficientFunds: IDL.Record({ balance: ICP }),
    TxDuplicate: IDL.Record({ duplicate_of: BlockIndex }),
    TxCreatedInFuture: IDL.Null,
    TemporarilyUnavailable: IDL.Null,
  });
  const TransferResult = IDL.Variant({ Ok: BlockIndex, Err: TransferError });
  return IDL.Service({
    account_balance_dfx: IDL.Func([AccountBalanceArgs], [ICP], ['query']),
    transfer: IDL.Func([TransferArgs], [TransferResult], [])
  });
};
export const init = ({ IDL }) => { return []; }; 