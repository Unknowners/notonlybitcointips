import { Actor, HttpAgent } from "@dfinity/agent";
import { idlFactory } from './user_canister.did.js';

// Determine canister ID based on environment
const isMainnet = window.location.hostname.includes('ic0.app') || 
                 window.location.hostname.includes('icp0.io') ||
                 window.location.hostname.includes('icp1.io') ||
                 import.meta.env.VITE_DFX_NETWORK === 'ic';

export const canisterId = isMainnet 
  ? "g7k3j-maaaa-aaaah-arinq-cai" // Production canister ID
  : (import.meta.env.VITE_CANISTER_ID_USER_CANISTER || "g7k3j-maaaa-aaaah-arinq-cai"); // Local canister ID

// Determine canister host from environment variables for flexibility between
// local and production deployments.
const defaultHost = isMainnet ? "https://ic0.app" : "http://127.0.0.1:4943";
const host = import.meta.env.VITE_CANISTER_HOST || defaultHost;

console.log('🌐 Canister host detection:', {
  hostname: window.location.hostname,
  isMainnet,
  host,
  canisterId,
  VITE_DFX_NETWORK: import.meta.env.VITE_DFX_NETWORK
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
  console.log('🔧 createActor called with:', {
    identity: !!identity,
    host,
    canisterId,
    isMainnet
  });
  
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
