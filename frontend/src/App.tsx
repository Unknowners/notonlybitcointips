import React, { useEffect, useState } from "react";
import { user_canister } from "./canisters";

export default function App() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    user_canister.getAllUsers().then(setUsers);
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Користувачі</h1>
      <ul>
        {users.map((u, i) => (
          <li key={i}>{u.username} ({u.wallet})</li>
        ))}
      </ul>
    </div>
  );
}