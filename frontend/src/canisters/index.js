import { Actor, HttpAgent } from "@dfinity/agent";
import { idlFactory } from './user_canister/user_canister.did.js';

// Determine canister ID based on environment
const isLocal = window.location.hostname.includes('localhost') || 
               window.location.hostname.includes('127.0.0.1') ||
               import.meta.env.VITE_DFX_NETWORK === 'local';

const isMainnet = window.location.hostname.includes('ic0.app') || 
                 window.location.hostname.includes('icp0.io') ||
                 window.location.hostname.includes('icp1.io') ||
                 import.meta.env.VITE_DFX_NETWORK === 'ic';

// Check if running in ICP Ninja
const isICPNinja = window.location.hostname.includes('ninja.ic0.app');

// For development, always use local canister even if deployed on mainnet
const isDevelopment = import.meta.env.DEV || 
                     window.location.hostname.includes('localhost') || 
                     window.location.hostname.includes('127.0.0.1');

// Import canister IDs from configuration
import canisterIds from '../../../canister_ids.json';

// Function to get canister ID from URL (for ICP Ninja)
const getCanisterIdFromURL = () => {
  // Try to extract canister ID from URL path
  const pathParts = window.location.pathname.split('/');
  for (let i = 0; i < pathParts.length; i++) {
    const part = pathParts[i];
    if (part && part.includes('-') && part.includes('cai')) {
      return part;
    }
  }
  return null;
};

// Get canister ID from environment or URL
const getCanisterId = () => {
  // First try environment variable
  if (import.meta.env.VITE_CANISTER_ID_USER_CANISTER) {
    return import.meta.env.VITE_CANISTER_ID_USER_CANISTER;
  }
  
  // Then try URL (for ICP Ninja)
  if (isICPNinja) {
    const urlCanisterId = getCanisterIdFromURL();
    if (urlCanisterId) {
      return urlCanisterId;
    }
  }
  
  // Fall back to configuration
  if (isICPNinja) {
    return canisterIds.user_canister.ic;
  } else if (isDevelopment) {
    return canisterIds.user_canister.local;
  } else if (isMainnet) {
    return canisterIds.user_canister.ic;
  } else {
    return canisterIds.user_canister.local;
  }
};

export const canisterId = getCanisterId();

// Determine canister host from environment variables for flexibility between
// local and production deployments.
const defaultHost = isICPNinja || isMainnet ? "https://ic0.app" : "http://127.0.0.1:4943";
const host = import.meta.env.VITE_CANISTER_HOST || defaultHost;

console.log('🌐 Canister host detection:', {
  hostname: window.location.hostname,
  isLocal,
  isMainnet,
  isDevelopment,
  isICPNinja,
  host,
  canisterId,
  VITE_DFX_NETWORK: import.meta.env.VITE_DFX_NETWORK,
  pathname: window.location.pathname,
  VITE_CANISTER_ID_USER_CANISTER: import.meta.env.VITE_CANISTER_ID_USER_CANISTER,
  canisterIds: canisterIds
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
    isMainnet,
    isICPNinja
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
