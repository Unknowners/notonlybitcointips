import Principal "mo:base/Principal";
import Time "mo:base/Time";
import Array "mo:base/Array";
import Text "mo:base/Text";
import Nat "mo:base/Nat";
import Int "mo:base/Int";

actor {
  // --- Типи ---
  type UserId = Principal;
  type CampaignId = Text; // короткий id/токен для посилання

  type User = {
    id: UserId;
    name: Text;
    email: ?Text;
    createdAt: Time.Time;
  };

  type Campaign = {
    id: CampaignId;
    name: Text;
    description: Text;
    owner: UserId;
    acceptedTokens: [Text];
    createdAt: Time.Time;
  };

  // --- Сховище ---
  stable var users : [User] = [];
  stable var campaigns : [Campaign] = [];

  // --- Допоміжна функція для підрядка ---
  func textPrefix(t : Text, n : Nat) : Text {
    var result = "";
    var count = 0;
    label l for (c in t.chars()) {
      if (count >= n) break l;
      result #= Text.fromChar(c);
      count += 1;
    };
    result
  };

  // --- Методи --- 

  // Створити користувача
  public shared({caller}) func createUser(name: Text, email: ?Text) : async Bool {
    // Якщо користувач вже існує — не додаємо
    let exists = Array.find<User>(users, func u = u.id == caller) != null;
    if (exists) return false;
    let user : User = {
      id = caller;
      name = name;
      email = email;
      createdAt = Time.now();
    };
    users := Array.append(users, [user]);
    return true;
  };

  // Створити кампанію
  public shared({caller}) func createCampaign(name: Text, description: Text, acceptedTokens: [Text]) : async Text {
    // Генеруємо короткий id (наприклад, на основі часу та частини principal)
    let principalText = Principal.toText(caller);
    let prefix = textPrefix(principalText, 5);
    let shortId = Int.toText(Time.now() / 1_000_000) # "-" # prefix;
    let campaign : Campaign = {
      id = shortId;
      name = name;
      description = description;
      owner = caller;
      acceptedTokens = acceptedTokens;
      createdAt = Time.now();
    };
    campaigns := Array.append(campaigns, [campaign]);
    return shortId;
  };

  // Отримати кампанію за id
  public query func getCampaign(id: CampaignId) : async ?Campaign {
    for (c in campaigns.vals()) {
      if (c.id == id) return ?c;
    };
    return null;
  };

  // (Опціонально) Отримати всі кампанії користувача
  public query func getUserCampaigns(userId: UserId) : async [Campaign] {
    Array.filter<Campaign>(campaigns, func c = c.owner == userId)
  };

  // (DEBUG) Отримати всі кампанії для діагностики
  public query func getAllCampaigns() : async [Campaign] {
    campaigns
  };

  // (DEBUG) Отримати всіх користувачів
  public query func getAllUsers() : async [User] {
    users
  };

  // (DEBUG) Очистити всіх користувачів (тільки для тесту)
  public func clearUsers() : async () {
    users := [];
  };

  public query func debugCompare(userId: Principal) : async [(Text, Principal, Bool)] {
    Array.map<Campaign, (Text, Principal, Bool)>(
      campaigns,
      func c = (c.id, c.owner, c.owner == userId)
    )
  };

  public query func debugPrincipal(userId: Principal) : async Text {
    Principal.toText(userId)
  };
} 