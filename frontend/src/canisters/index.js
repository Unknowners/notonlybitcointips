import { Actor, HttpAgent } from "@dfinity/agent";

// Imports and re-exports candid interface
import { idlFactory } from './user_canister.did.js';
export { idlFactory } from './user_canister.did.js';
// CANISTER_ID is replaced by webpack based on node environment
export const canisterId = "uxrrr-q7777-77774-qaaaq-cai"; // ваш реальний canisterId

/**
 * @deprecated since dfx 0.11.1
 * Do not import from `.dfx`, instead switch to using `dfx generate` to generate your JS interface.
 * @param {string | import("@dfinity/principal").Principal} canisterId Canister ID of Agent
 * @param {{agentOptions?: import("@dfinity/agent").HttpAgentOptions; actorOptions?: import("@dfinity/agent").ActorConfig} | { agent?: import("@dfinity/agent").Agent; actorOptions?: import("@dfinity/agent").ActorConfig }} [options]
 * @return {import("@dfinity/agent").ActorSubclass<import("./user_canister.did.js")._SERVICE>}
 */
export const createActor = (canisterId, options = {}) => {
  console.warn(`Deprecation warning: you are currently importing code from .dfx. Going forward, refactor to use the dfx generate command for JavaScript bindings.

See https://internetcomputer.org/docs/current/developer-docs/updates/release-notes/ for migration instructions`);
//   const agent = options.agent || new HttpAgent({ ...options.agentOptions });
const agent = new HttpAgent({
    host: "http://127.0.0.1:4943", // або "http://localhost:4943"
  });
  // Fetch root key for certificate validation during development
  if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
    agent.fetchRootKey().catch(err => {
      console.warn("Unable to fetch root key. Check to ensure that your local replica is running");
      console.error(err);
    });
  }

  // Creates an actor with using the candid interface and the HttpAgent
  return Actor.createActor(idlFactory, {
    agent,
    canisterId,
    ...(options ? options.actorOptions : {}),
  });
};
  
/**
 * A ready-to-use agent for the user_canister canister
 * @type {import("@dfinity/agent").ActorSubclass<import("./user_canister.did.js")._SERVICE>}
 */
export const user_canister = createActor(canisterId);
