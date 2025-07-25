import Nat "mo:base/Nat";
import Principal "mo:base/Principal";
import Time "mo:base/Time";
import Array "mo:base/Array";

actor {

  type UserId = Principal;
  type User = {
    id: UserId;
    username: Text;
    wallet: Text;
    createdAt: Time.Time;
  };

  stable var users : [User] = [];

  // Додаємо користувача
  public shared({caller}) func registerUser(username: Text, wallet: Text) : async Bool {
    let user : User = {
      id = caller;
      username = username;
      wallet = wallet;
      createdAt = Time.now();
    };
    users := Array.append(users, [user]);
    return true;
  };

  // Отримати користувача за Principal
  public query func getUser(userId: UserId) : async ?User {
    for (user in users.vals()) {
      if (user.id == userId) {
        return ?user;
      }
    };
    return null;
  };

  // Отримати всіх користувачів (для тесту)
  public query func getAllUsers() : async [User] {
    return users;
  };
} 