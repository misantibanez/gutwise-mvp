import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { azureAuth, AuthInfo, AzureUser } from './azure-auth';

interface AuthContextType {
  authInfo: AuthInfo;
  user: AzureUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  accessToken: string | null;
  signIn: () => void;
  signOut: () => void;
  refreshAuth: () => Promise<void>;
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

  const refreshAuth = async () => {
    try {
      setIsLoading(true);
      
      // Check if we're in Azure App Service environment
      if (azureAuth.isAzureAppService()) {
        console.log('Detected Azure App Service environment');
        const newAuthInfo = await azureAuth.getAuthInfo();
        setAuthInfo(newAuthInfo);
      } else {
        console.log('Not in Azure App Service, using development mode');
        // In development, use mock auth or localStorage-based auth
        const mockAuth = azureAuth.getMockAuthInfo();
        setAuthInfo(mockAuth);
      }
    } catch (error) {
      console.error('Error refreshing auth:', error);
      // Fallback to mock auth in case of errors
      const mockAuth = azureAuth.getMockAuthInfo();
      setAuthInfo(mockAuth);
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
    if (azureAuth.isAzureAppService()) {
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
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
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