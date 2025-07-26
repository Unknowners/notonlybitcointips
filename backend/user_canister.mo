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
import Int "mo:base/Int";

shared({ caller = initializer }) actor class UserCanister() = {

    // Types
    type UserId = Principal;
    type CampaignId = Text;
    
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
        createdAt: Nat64;
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

    public shared({ caller }) func userExists() : async Bool {
        switch (usersMap.get(caller)) {
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

    // Campaign management
    public shared({ caller }) func createCampaign(name: Text, description: Text, acceptedTokens: [Text]) : async Text {
        if (Text.size(name) == 0 or Text.size(description) == 0) {
            return "";
        };
        
        let campaignId = Nat64.toText(Nat64.fromNat(Int.abs(Time.now())));
        
        let campaign: Campaign = {
            id = campaignId;
            name = name;
            description = description;
            owner = caller;
            acceptedTokens = acceptedTokens;
            createdAt = Nat64.fromNat(Int.abs(Time.now()));
        };
        
        campaignsMap.put(campaignId, campaign);
        return campaignId;
    };

    // Get campaign by id
    public query func getCampaign(id: Text) : async ?Campaign {
        campaignsMap.get(id)
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
    
    // Get campaigns for current user (shared version)
    public shared({ caller }) func getMyCampaigns() : async [Campaign] {
        let userCampaigns = Array.filter<Campaign>(
            Iter.toArray(campaignsMap.vals()),
            func (campaign: Campaign) : Bool {
                Principal.equal(campaign.owner, caller)
            }
        );
        return userCampaigns;
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