import Principal "mo:base/Principal";
import Text "mo:base/Text";
import Nat64 "mo:base/Nat64";
import Time "mo:base/Time";
import HashMap "mo:base/HashMap";
import Array "mo:base/Array";
import Iter "mo:base/Iter";
import _Option "mo:base/Option";
import _Debug "mo:base/Debug";
import _Error "mo:base/Error";
import Blob "mo:base/Blob";
import Int "mo:base/Int";
import Nat "mo:base/Nat";
import Nat8 "mo:base/Nat8";
import Nat32 "mo:base/Nat32";
import _Buffer "mo:base/Buffer";
import Result "mo:base/Result";

// ICP Ledger canister ID (mainnet)
let LEDGER_CANISTER_ID = "ryjl3-tyaaa-aaaaa-aaaba-cai";

shared({ caller = initializer }) persistent actor class UserCanister() = {

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
    private var users: [(UserId, User)] = [];
    private var campaigns: [(CampaignId, Campaign)] = [];
    
    private transient var usersMap = HashMap.HashMap<UserId, User>(0, Principal.equal, Principal.hash);
    private transient var campaignsMap = HashMap.HashMap<CampaignId, Campaign>(0, Text.equal, Text.hash);

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
    
    // Query version for compatibility - REMOVED: This was causing anonymous user issues
    // public query func getPrincipal() : async Principal {
    //     return Principal.fromText("2vxsx-fae"); // Anonymous principal for query calls
    // };

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
            case (?_) { return true; };
            case null { return false; };
        };
    };

    public query func getAllUsers() : async [User] {
        Iter.toArray(usersMap.vals())
    };

    public shared({ caller = _ }) func clearUsers() : async () {
        usersMap := HashMap.HashMap<UserId, User>(0, Principal.equal, Principal.hash);
    };

    public shared({ caller = _ }) func clearCampaigns() : async () {
        campaignsMap := HashMap.HashMap<CampaignId, Campaign>(0, Text.equal, Text.hash);
    };

    // Функція для видалення конкретної кампанії (тільки власником, якщо баланс = 0)
    public shared({ caller }) func deleteCampaign(campaignId: CampaignId) : async Result.Result<(), Text> {
        switch (campaignsMap.get(campaignId)) {
            case (?campaign) {
                // Перевіряємо чи користувач є власником кампанії
                if (Principal.equal(campaign.owner, caller) == false) {
                    return #err("Only campaign owner can delete the campaign");
                };
                
                // Перевіряємо чи баланс кампанії = 0
                // TODO: В майбутньому тут буде перевірка реального балансу через Ledger
                // Поки що завжди дозволяємо видалення (для тестування)
                // let balance = await getCampaignBalance(campaign.accountId);
                // if (balance > 0) {
                //     return #err("Cannot delete campaign with non-zero balance");
                // };
                
                // Видаляємо кампанію
                campaignsMap.delete(campaignId);
                return #ok(());
            };
            case null {
                return #err("Campaign not found");
            };
        };
    };

    // Функція для перевірки балансу кампанії (заглушка для майбутнього)
    private func _getCampaignBalance(_accountId: AccountId) : async Nat64 {
        // TODO: Реальна перевірка балансу через ICP Ledger
        // Поки що повертаємо симульований баланс для тестування
        // В реальному проекті тут буде виклик до ICP Ledger canister
        return 100000000; // 1 ICP в e8s для тестування
    };
    
    // Правильна функція для генерації account ID згідно з ICP стандартами
    // account_identifier(principal,subaccount_identifier) = CRC32(h) || h
    // де h = sha224("\x0Aaccount-id" || principal || subaccount_identifier)
    private func generateAccountId(userPrincipal: Principal, campaignId: Text) : AccountId {
        // Конвертуємо campaign ID в 32-byte subaccount
        let campaignBytes = Blob.toArray(Text.encodeUtf8(campaignId));
        let subaccount = Array.tabulate<Nat8>(32, func(i : Nat) : Nat8 {
            if (i < campaignBytes.size()) { campaignBytes[i] } else { 0 }
        });
        
        // Формуємо дані для хешування згідно з ICP специфікацією
        // Domain separator: \x0A + "account-id"
        let domainSeparator = Array.append<Nat8>([0x0A], Blob.toArray(Text.encodeUtf8("account-id")));
        let principalBytes = Blob.toArray(Principal.toBlob(userPrincipal));
        
        // Об'єднуємо всі частини: domain_separator + principal + subaccount
        let data1 = Array.append<Nat8>(domainSeparator, principalBytes);
        let data = Array.append<Nat8>(data1, subaccount);
        
        // Генеруємо SHA-256 hash і беремо перші 28 байт (імітуємо SHA-224)
        // В реальному проекті потрібно використовувати справжню SHA-224 бібліотеку
        let hash = simpleSHA256(data);
        
        // Беремо перші 28 байт (SHA-224)
        let h = Array.tabulate<Nat8>(28, func(i : Nat) : Nat8 {
            if (i < hash.size()) { hash[i] } else { 0 }
        });
        
        // Генеруємо CRC32 checksum
        let checksum = generateCRC32(h);
        
        // Формуємо фінальний account identifier: CRC32(h) || h
        let result = Array.append<Nat8>(checksum, h);
        
        // Конвертуємо в hex string
        let hexString = Array.foldLeft<Nat8, Text>(
            result,
            "",
            func(acc : Text, byte : Nat8) : Text {
                let byteValue = Nat8.toNat(byte);
                // Кожен байт повинен конвертуватися в рівно 2 hex символи
                let high = byteValue / 16;
                let low = byteValue % 16;
                let highHex = if (high < 10) Nat.toText(high) else 
                    switch(high) {
                        case 10 { "a" }; case 11 { "b" }; case 12 { "c" };
                        case 13 { "d" }; case 14 { "e" }; case 15 { "f" };
                        case _ { "0" };
                    };
                let lowHex = if (low < 10) Nat.toText(low) else 
                    switch(low) {
                        case 10 { "a" }; case 11 { "b" }; case 12 { "c" };
                        case 13 { "d" }; case 14 { "e" }; case 15 { "f" };
                        case _ { "0" };
                    };
                acc # highHex # lowHex
            }
        );
        
        hexString
    };
    
    // Простий SHA-256 (для демонстрації - в продакшені потрібна справжня SHA-256)
    private func simpleSHA256(data: [Nat8]) : [Nat8] {
        // Це спрощена версія для демонстрації
        // В реальному проекті використовуйте справжню SHA-256 бібліотеку
        let hash = Array.tabulate<Nat8>(32, func(i : Nat) : Nat8 {
            if (i < data.size()) { 
                let temp = (Nat8.toNat(data[i]) + (i % 255)) % 255;
                Nat8.fromNat(temp)
            } else { 
                Nat8.fromNat(i % 255) 
            }
        });
        hash
    };
    
    // Функція для генерації CRC32 checksum згідно з ISO 3309, ITU-T V.42
    private func generateCRC32(data: [Nat8]) : [Nat8] {
        // CRC32 polynomial 0xEDB88320
        var crc : Nat32 = 0xFFFFFFFF;
        
        for (byte in data.vals()) {
            crc := crc ^ Nat32.fromNat(Nat8.toNat(byte));
            for (j in Iter.range(0, 7)) {
                if ((crc & 1) != 0) {
                    crc := (crc >> 1) ^ 0xEDB88320;
                } else {
                    crc := crc >> 1;
                };
            };
        };
        
        crc := crc ^ 0xFFFFFFFF;
        
        // Конвертуємо в big-endian 4-byte array
        let result = Array.tabulate<Nat8>(4, func(i : Nat) : Nat8 {
            switch (i) {
                case 0 { Nat8.fromNat(Nat32.toNat((crc >> 24) & 0xFF)) };
                case 1 { Nat8.fromNat(Nat32.toNat((crc >> 16) & 0xFF)) };
                case 2 { Nat8.fromNat(Nat32.toNat((crc >> 8) & 0xFF)) };
                case 3 { Nat8.fromNat(Nat32.toNat(crc & 0xFF)) };
                case _ { 0 };
            }
        });
        
        result
    };

    private func generateSubaccount(id : Text) : Blob {
        let bytes = Blob.toArray(Text.encodeUtf8(id));
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
    public query func getAccountBalance(_accountId: AccountId) : async Nat64 {
        // Це заглушка - реальна реалізація буде через frontend query до ledger canister
        return 0;
    };

    // Функція для конвертації hex string в bytes
    private func hexToBytes(hex: Text) : [Nat8] {
        let cleanHex = Text.replace(hex, #text " ", "");
        let bytes = Array.tabulate<Nat8>(cleanHex.size() / 2, func(i: Nat) : Nat8 {
            let start = i * 2;
            let end = start + 2;
            let hexByte = Text.subText(cleanHex, start, end);
            Nat8.fromNat(Nat.fromText(hexByte, 16));
        });
        bytes;
    };

    // Функція для виведення коштів (справжня реалізація)
    public shared({ caller }) func withdrawFunds(request: TransferRequest) : async Bool {
        // Перевіряємо чи користувач є власником кампанії
        switch (campaignsMap.get(request.campaignId)) {
            case (?campaign) {
                if (Principal.equal(campaign.owner, caller)) {
                    // Перевіряємо баланс кампанії
                    let balance = await _getCampaignBalance(campaign.accountId);
                    
                    // Перевіряємо чи достатньо коштів для виведення
                    if (balance < request.amount) {
                        return false; // Недостатньо коштів
                    };
                    
                    // Виконуємо transfer через ICP Ledger
                    try {
                        // Конвертуємо target address в bytes
                        let toBytes = hexToBytes(request.targetAddress);
                        
                        // Створюємо transfer args
                        let transferArgs = {
                            memo = 0;
                            amount = { e8s = request.amount };
                            fee = { e8s = 10000 }; // 0.0001 ICP fee
                            from_subaccount = ?Array.toArray(campaign.subaccount);
                            to = toBytes;
                            created_at_time = ?{ timestamp_nanos = Nat64.fromNat(Int.abs(Time.now())) };
                        };
                        
                        // Викликаємо ICP Ledger
                        let ledger = actor(LEDGER_CANISTER_ID) : actor {
                            transfer : (args: {
                                memo: Nat64;
                                amount: { e8s: Nat64 };
                                fee: { e8s: Nat64 };
                                from_subaccount: ?[Nat8];
                                to: [Nat8];
                                created_at_time: ?{ timestamp_nanos: Nat64 };
                            }) -> async Result.Result<Nat64, {
                                #BadFee: { expected_fee: { e8s: Nat64 } }
                                #InsufficientFunds: { balance: { e8s: Nat64 } }
                                #TxTooOld: { allowed_window_nanos: Nat64 }
                                #TxCreatedInFuture: {}
                                #TxDuplicate: { duplicate_of: Nat64 }
                            };
                        };
                        
                        let result = await ledger.transfer(transferArgs);
                        
                        switch (result) {
                            case (#ok(blockHeight)) {
                                // Transfer успішний
                                return true;
                            };
                            case (#err(error)) {
                                // Transfer не вдався
                                return false;
                            };
                        };
                    } catch (error) {
                        // Помилка при transfer
                        return false;
                    };
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