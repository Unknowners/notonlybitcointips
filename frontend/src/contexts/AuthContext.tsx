import { createContext, useContext, type ReactNode } from 'react';
import { AuthClient } from '@dfinity/auth-client';

interface AuthState {
  actor: any;
  authClient?: AuthClient;
  isAuthenticated: boolean;
  principal: string;
}

interface AuthContextType {
  authState: AuthState;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
  authState: AuthState;
}

export function AuthProvider({ children, authState }: AuthProviderProps) {
  return (
    <AuthContext.Provider value={{ authState }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
