import { Actor, HttpAgent } from "@dfinity/agent";
import { idlFactory } from './user_canister.did.js';

export const canisterId = "uxrrr-q7777-77774-qaaaq-cai"; // ваш реальний canisterId

const agent = new HttpAgent({ host: "http://127.0.0.1:4943" });
if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
  agent.fetchRootKey();
}
export const user_canister = Actor.createActor(idlFactory, {
  agent,
  canisterId,
});
