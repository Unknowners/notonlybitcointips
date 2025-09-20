/**
 * Session Storage utilities for user authentication
 * Uses sessionStorage for security - data is cleared when browser is closed
 */

export interface AuthSession {
  isAuthenticated: boolean;
  principal: string;
  timestamp: number;
  // Don't store sensitive data like actor or authClient
}

const SESSION_KEY = 'notonlybitcointips_auth_session';
const SESSION_TIMEOUT = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

/**
 * Save authentication session to sessionStorage
 */
export const saveAuthSession = (session: Partial<AuthSession>): void => {
  try {
    const fullSession: AuthSession = {
      isAuthenticated: session.isAuthenticated || false,
      principal: session.principal || '',
      timestamp: Date.now(),
    };
    
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(fullSession));
    console.log('💾 Auth session saved to sessionStorage');
  } catch (error) {
    console.error('❌ Error saving auth session:', error);
  }
};

/**
 * Load authentication session from sessionStorage
 */
export const loadAuthSession = (): AuthSession | null => {
  try {
    const stored = sessionStorage.getItem(SESSION_KEY);
    if (!stored) {
      console.log('🔍 No auth session found in sessionStorage');
      return null;
    }

    const session: AuthSession = JSON.parse(stored);
    
    // Check if session is expired
    const now = Date.now();
    const sessionAge = now - session.timestamp;
    
    if (sessionAge > SESSION_TIMEOUT) {
      console.log('⏰ Auth session expired, clearing...');
      clearAuthSession();
      return null;
    }

    console.log('✅ Auth session loaded from sessionStorage');
    return session;
  } catch (error) {
    console.error('❌ Error loading auth session:', error);
    clearAuthSession();
    return null;
  }
};

/**
 * Clear authentication session from sessionStorage
 */
export const clearAuthSession = (): void => {
  try {
    sessionStorage.removeItem(SESSION_KEY);
    console.log('🗑️ Auth session cleared from sessionStorage');
  } catch (error) {
    console.error('❌ Error clearing auth session:', error);
  }
};

/**
 * Check if user has a valid session
 */
export const hasValidSession = (): boolean => {
  const session = loadAuthSession();
  return session !== null && session.isAuthenticated;
};

/**
 * Get current session info
 */
export const getCurrentSession = (): AuthSession | null => {
  return loadAuthSession();
};
