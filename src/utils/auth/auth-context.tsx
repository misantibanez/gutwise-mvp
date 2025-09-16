import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { azureAuth, AuthInfo, AzureUser } from './azure-auth';

// Import testAuth but handle gracefully if not available
let testAuth: any = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  testAuth = require('./test-auth').testAuth;
} catch (_error) {
  console.log('Test auth module not available');
}

interface AuthContextType {
  authInfo: AuthInfo;
  user: AzureUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  accessToken: string | null;
  signIn: () => void;
  signOut: () => void;
  refreshAuth: () => Promise<void>;
  isTestMode: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [authInfo, setAuthInfo] = useState<AuthInfo>({
    isAuthenticated: false,
    user: null,
    accessToken: null,
    idToken: null,
    refreshToken: null,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isTestMode, setIsTestMode] = useState(false);

  const refreshAuth = async () => {
    try {
      setIsLoading(true);

      // First check if test mode is active
      if (testAuth && typeof testAuth.isTestModeActive === 'function' && testAuth.isTestModeActive()) {
        console.log('🧪 Test mode detected, loading test user...');
        const testAuthInfo = await testAuth.loadTestUser?.();
        if (testAuthInfo) {
          setAuthInfo(testAuthInfo);
          setIsTestMode(true);
          return;
        }
      }

      // Check if we're in Azure App Service environment
      if (azureAuth.isAzureAppService()) {
        console.log('Detected Azure App Service environment');
        const newAuthInfo = await azureAuth.getAuthInfo();
        setAuthInfo(newAuthInfo);
        setIsTestMode(false);

        // ❌ CosmosDB user profile sync removed intentionally
        // If you later need to sync with another backend, hook it up here.
      } else {
        console.log('Not in Azure App Service, using development mode');
        // In development, use mock auth or localStorage-based auth
        const mockAuth = azureAuth.getMockAuthInfo();
        setAuthInfo(mockAuth);
        setIsTestMode(false);
      }
    } catch (error) {
      console.error('Error refreshing auth:', error);
      // Fallback to mock auth in case of errors
      const mockAuth = azureAuth.getMockAuthInfo();
      setAuthInfo(mockAuth);
      setIsTestMode(false);
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = () => {
    if (azureAuth.isAzureAppService()) {
      azureAuth.signIn();
    } else {
      // In development, simulate sign in
      console.log('Development mode: simulating sign in');
      const mockAuth = azureAuth.getMockAuthInfo();
      setAuthInfo(mockAuth);
    }
  };

  const signOut = () => {
    if (isTestMode && testAuth) {
      // Clear test mode
      testAuth.clearTestMode?.();
      setIsTestMode(false);
      setAuthInfo({
        isAuthenticated: false,
        user: null,
        accessToken: null,
        idToken: null,
        refreshToken: null,
      });
    } else if (azureAuth.isAzureAppService()) {
      azureAuth.signOut();
    } else {
      // In development, clear auth state
      console.log('Development mode: simulating sign out');
      setAuthInfo({
        isAuthenticated: false,
        user: null,
        accessToken: null,
        idToken: null,
        refreshToken: null,
      });
    }
  };

  // Initialize auth on mount
  useEffect(() => {
    refreshAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Periodically refresh auth info (every 30 minutes)
  useEffect(() => {
    if (authInfo.isAuthenticated) {
      const interval = setInterval(refreshAuth, 30 * 60 * 1000); // 30 minutes
      return () => clearInterval(interval);
    }
  }, [authInfo.isAuthenticated]);

  const contextValue: AuthContextType = {
    authInfo,
    user: authInfo.user,
    isAuthenticated: authInfo.isAuthenticated,
    isLoading,
    accessToken: authInfo.accessToken,
    signIn,
    signOut,
    refreshAuth,
    isTestMode,
  };

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Hook for accessing user info specifically
export function useUser(): AzureUser | null {
  const { user } = useAuth();
  return user;
}

// Hook for checking authentication status
export function useIsAuthenticated(): boolean {
  const { isAuthenticated } = useAuth();
  return isAuthenticated;
}

// Hook for getting access token
export function useAccessToken(): string | null {
  const { accessToken } = useAuth();
  return accessToken;
}
