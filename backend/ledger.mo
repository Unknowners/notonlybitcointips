import Principal "mo:base/Principal";
import Text "mo:base/Text";
import Nat64 "mo:base/Nat64";
import Result "mo:base/Result";
import HashMap "mo:base/HashMap";
import Iter "mo:base/Iter";

actor Ledger {
    type AccountId = Text;
    type Balance = Nat64;
    
    // Простий баланс для тестування
    private var balances = HashMap.HashMap<AccountId, Balance>(0, Text.equal, Text.hash);
    
    // Ініціалізуємо з тестовими балансами
    balances.put("a84c477c0a626566737a747b35726e0f3d444347434849434a4c4d504d514b4c", 100000000); // 1 ICP
    
    public query func account_balance_dfx(request: { account: AccountId }) : async { e8s: Nat64 } {
        switch (balances.get(request.account)) {
            case (?balance) { { e8s = balance } };
            case null { { e8s = 0 } };
        };
    };
    
    public func transfer(args: {
        memo: Nat64;
        amount: { e8s: Nat64 };
        fee: { e8s: Nat64 };
        from_subaccount: ?[Nat8];
        to: [Nat8];
        created_at_time: ?{ timestamp_nanos: Nat64 };
    }) : async Result.Result<Nat64, Text> {
        // Проста реалізація для тестування
        #ok(12345); // Повертаємо фейковий block height
    };
    
    public query func total_supply() : async { e8s: Nat64 } {
        { e8s = 1000000000 }; // 10 ICP загальна кількість
    };
    
    public query func symbol() : async Text {
        "ICP";
    };
    
    public query func name() : async Text {
        "Internet Computer";
    };
    
    public query func decimals() : async Nat8 {
        8;
    };
}
