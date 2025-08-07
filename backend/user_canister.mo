import Principal "mo:base/Principal";
import Text "mo:base/Text";
import Nat64 "mo:base/Nat64";
import Time "mo:base/Time";
import HashMap "mo:base/HashMap";
import Array "mo:base/Array";
import Iter "mo:base/Iter";
import Option "mo:base/Option";
import Debug "mo:base/Debug";
import Error "mo:base/Error";
import Blob "mo:base/Blob";
import Int "mo:base/Int";
import Nat "mo:base/Nat";
import Nat8 "mo:base/Nat8";
import Buffer "mo:base/Buffer";

shared({ caller = initializer }) actor class UserCanister() = {

    // Types
    type UserId = Principal;
    type CampaignId = Text;
    type AccountId = Text;
    
    type User = {
        id: UserId;
        name: Text;
        email: ?Text;
        createdAt: Nat64;
    };
    
    type Campaign = {
        id: CampaignId;
        name: Text;
        description: Text;
        owner: UserId;
        acceptedTokens: [Text];
        subaccount: Blob;
        accountId: AccountId; // Додаємо account ID
        createdAt: Nat64;
    };

    type TransferRequest = {
        campaignId: CampaignId;
        targetAddress: Text;
        amount: Nat64;
    };

    // Storage
    private stable var users: [(UserId, User)] = [];
    private stable var campaigns: [(CampaignId, Campaign)] = [];
    
    private var usersMap = HashMap.HashMap<UserId, User>(0, Principal.equal, Principal.hash);
    private var campaignsMap = HashMap.HashMap<CampaignId, Campaign>(0, Text.equal, Text.hash);

    // System functions
    system func preupgrade() {
        users := Iter.toArray(usersMap.entries());
        campaigns := Iter.toArray(campaignsMap.entries());
    };

    system func postupgrade() {
        usersMap := HashMap.fromIter<UserId, User>(users.vals(), 0, Principal.equal, Principal.hash);
        campaigns := [];
        campaignsMap := HashMap.fromIter<CampaignId, Campaign>(campaigns.vals(), 0, Text.equal, Text.hash);
        campaigns := [];
    };

    // Authentication
    public shared({ caller }) func whoami() : async Principal {
        return caller;
    };
    
    // Query version for compatibility
    public query func getPrincipal() : async Principal {
        return Principal.fromText("2vxsx-fae"); // Anonymous principal for query calls
    };

    // User management
    public shared({ caller }) func createUser(name: Text, email: ?Text) : async Bool {
        if (Text.size(name) == 0) {
            return false;
        };
        
        let user: User = {
            id = caller;
            name = name;
            email = email;
            createdAt = Nat64.fromNat(Int.abs(Time.now()));
        };
        
        usersMap.put(caller, user);
        return true;
    };

    public query func userExists() : async Bool {
        switch (usersMap.get(initializer)) {
            case (?user) { return true; };
            case null { return false; };
        };
    };

    public query func getAllUsers() : async [User] {
        Iter.toArray(usersMap.vals())
    };

    public shared({ caller }) func clearUsers() : async () {
        usersMap := HashMap.HashMap<UserId, User>(0, Principal.equal, Principal.hash);
    };

    // Спрощена функція для генерації account ID на основі user principal + campaign ID
    private func generateAccountId(userPrincipal: Principal, campaignId: Text) : AccountId {
        // Конвертуємо user principal в text
        let userPrincipalText = Principal.toText(userPrincipal);
        
        // Об'єднуємо user principal + campaign ID як текст
        let combinedText = userPrincipalText # campaignId;
        
        // Повертаємо простий hex string на основі тексту
        // Це спрощена версія для демонстрації
        "account_" # combinedText
    };

    private func generateSubaccount(id : Text) : Blob {
        let bytes = Text.encodeUtf8(id);
        let padded = Array.tabulate<Nat8>(32, func(i : Nat) : Nat8 {
            if (i < bytes.size()) { bytes[i] } else { 0 }
        });
        Blob.fromArray(padded);
    };

    // Campaign management
    public shared({ caller }) func createCampaign(name: Text, description: Text, acceptedTokens: [Text]) : async Text {
        if (Text.size(name) == 0 or Text.size(description) == 0) {
            return "";
        };

        let campaignId = Nat64.toText(Nat64.fromNat(Int.abs(Time.now())));
        let subaccount = generateSubaccount(campaignId);
        let accountId = generateAccountId(caller, campaignId);

        let campaign: Campaign = {
            id = campaignId;
            name = name;
            description = description;
            owner = caller;
            acceptedTokens = acceptedTokens;
            subaccount = subaccount;
            accountId = accountId;
            createdAt = Nat64.fromNat(Int.abs(Time.now()));
        };
        
        campaignsMap.put(campaignId, campaign);
        return campaignId;
    };

    // Get campaign by id
    public query func getCampaign(id: Text) : async ?Campaign {
        campaignsMap.get(id)
    };

    public query func getCampaignSubaccount(id: Text) : async ?Blob {
        switch (campaignsMap.get(id)) {
            case (?c) { ?c.subaccount };
            case null { null };
        }
    };

    // Нова функція для отримання account ID кампанії
    public query func getCampaignAccountId(id: Text) : async ?AccountId {
        switch (campaignsMap.get(id)) {
            case (?c) { ?c.accountId };
            case null { null };
        }
    };

    // (Optional) Get all campaigns for a user
    public query func getUserCampaigns(userId: UserId) : async [Campaign] {
        let userCampaigns = Array.filter<Campaign>(
            Iter.toArray(campaignsMap.vals()),
            func (campaign: Campaign) : Bool {
                Principal.equal(campaign.owner, userId)
            }
        );
        return userCampaigns;
    };
    
    // Функція для отримання балансу account ID (заглушка для frontend)
    public query func getAccountBalance(accountId: AccountId) : async Nat64 {
        // Це заглушка - реальна реалізація буде через frontend query до ledger canister
        return 0;
    };

    // Функція для виведення коштів (заглушка)
    public shared({ caller }) func withdrawFunds(request: TransferRequest) : async Bool {
        // Перевіряємо чи користувач є власником кампанії
        switch (campaignsMap.get(request.campaignId)) {
            case (?campaign) {
                if (Principal.equal(campaign.owner, caller)) {
                    // Тут буде логіка виведення коштів через ledger canister
                    // Поки що повертаємо true як заглушку
                    return true;
                } else {
                    return false; // Не авторизований
                };
            };
            case null { return false; }; // Кампанія не знайдена
        };
    };

    // (DEBUG) Get all campaigns for diagnostics
    public query func getAllCampaigns() : async [Campaign] {
        Iter.toArray(campaignsMap.vals())
    };

    // Debug functions
    public query func debugCompare(userId: UserId) : async [(Text, Principal, Bool)] {
        let userPrincipal = userId;
        let initializerPrincipal = initializer;
        let isEqual = Principal.equal(userPrincipal, initializerPrincipal);
        return [("User Principal", userPrincipal, isEqual)];
    };

    public query func debugPrincipal(userId: UserId) : async Text {
        Principal.toText(userId)
    };
}; 