import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainApp from "./MainApp";
import CampaignPage from "./CampaignPage";
import { AuthProvider } from "./contexts/AuthContext";
import { useState } from "react";
import { AuthClient } from '@dfinity/auth-client';

interface AuthState {
  actor: any;
  authClient?: AuthClient;
  isAuthenticated: boolean;
  principal: string;
}

export default function App() {
  const [authState, setAuthState] = useState<AuthState>({
    actor: undefined as any,
    authClient: undefined as AuthClient | undefined,
    isAuthenticated: false,
    principal: 'Click "Whoami" to see your Principal ID'
  });

  return (
    <AuthProvider authState={authState}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<MainApp authState={authState} setAuthState={setAuthState} />} />
          <Route path="/donate/:id" element={<CampaignPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}