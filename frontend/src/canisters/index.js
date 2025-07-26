import { Actor, HttpAgent } from "@dfinity/agent";
import { idlFactory } from './user_canister.did.js';

// Determine canister ID based on environment
const isLocal = window.location.hostname.includes('localhost') || 
               window.location.hostname.includes('127.0.0.1') ||
               import.meta.env.VITE_DFX_NETWORK === 'local';

const isMainnet = window.location.hostname.includes('ic0.app') || 
                 window.location.hostname.includes('icp0.io') ||
                 window.location.hostname.includes('icp1.io') ||
                 import.meta.env.VITE_DFX_NETWORK === 'ic' ||
                 window.location.hostname.includes('ninja.ic0.app');

// For development, always use local canister even if deployed on mainnet
const isDevelopment = import.meta.env.DEV || window.location.hostname.includes('localhost') || window.location.hostname.includes('127.0.0.1');

// Import canister IDs from configuration
import canisterIds from '../../../canister_ids.json';

export const canisterId = isDevelopment
  ? (import.meta.env.VITE_CANISTER_ID_USER_CANISTER || canisterIds.user_canister.local) // Always use local for development
  : isMainnet 
  ? canisterIds.user_canister.ic // Production canister ID
  : canisterIds.user_canister.local; // Default to local

// Determine canister host from environment variables for flexibility between
// local and production deployments.
const defaultHost = isDevelopment ? "http://127.0.0.1:4943" : isMainnet ? "https://ic0.app" : "http://127.0.0.1:4943";
const host = import.meta.env.VITE_CANISTER_HOST || defaultHost;

console.log('🌐 Canister host detection:', {
  hostname: window.location.hostname,
  isLocal,
  isMainnet,
  isDevelopment,
  host,
  canisterId,
  VITE_DFX_NETWORK: import.meta.env.VITE_DFX_NETWORK
});

// Create a default agent for anonymous calls
const defaultAgent = new HttpAgent({ host });
if (isDevelopment) {
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
  
  if (isDevelopment) {
    agent.fetchRootKey();
  }
  
  return Actor.createActor(idlFactory, {
    agent,
    canisterId,
  });
};
