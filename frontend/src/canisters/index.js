import { Actor, HttpAgent } from "@dfinity/agent";
import { idlFactory } from './user_canister.did.js';

export const canisterId = import.meta.env.VITE_CANISTER_ID_USER_CANISTER || "g7k3j-maaaa-aaaah-arinq-cai";

// Determine canister host from environment variables for flexibility between
// local and production deployments.
const isMainnet = window.location.hostname.includes('ic0.app') || 
                 window.location.hostname.includes('icp0.io') ||
                 import.meta.env.DFX_NETWORK === 'ic';

const defaultHost = isMainnet ? "https://ic0.app" : "http://127.0.0.1:4943";
const host = import.meta.env.VITE_CANISTER_HOST || defaultHost;

console.log('🌐 Canister host detection:', {
  hostname: window.location.hostname,
  isMainnet,
  host
});

// Create a default agent for anonymous calls
const defaultAgent = new HttpAgent({ host });
if (!isMainnet) {
  defaultAgent.fetchRootKey();
}

// Create the default actor instance
export const user_canister = Actor.createActor(idlFactory, {
  agent: defaultAgent,
  canisterId,
});

// Function to create an actor with custom identity
export const createActor = (identity) => {
  const agent = new HttpAgent({ 
    host,
    identity 
  });
  
  if (!isMainnet) {
    agent.fetchRootKey();
  }
  
  return Actor.createActor(idlFactory, {
    agent,
    canisterId,
  });
};
