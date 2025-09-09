/**
 * Azure App Service Authentication utilities
 * Works with Azure App Service Easy Auth integration
 */

export interface AzureUser {
  id: string;
  name: string;
  email: string;
  preferred_username?: string;
  given_name?: string;
  family_name?: string;
  roles?: string[];
  claims?: Record<string, any>;
}

export interface AuthInfo {
  isAuthenticated: boolean;
  user: AzureUser | null;
  accessToken: string | null;
  idToken: string | null;
  refreshToken: string | null;
}

export class AzureAuthService {
  private static instance: AzureAuthService;

  private constructor() {}

  static getInstance(): AzureAuthService {
    if (!AzureAuthService.instance) {
      AzureAuthService.instance = new AzureAuthService();
    }
    return AzureAuthService.instance;
  }

  /**
   * Get authentication info from Azure App Service Easy Auth
   */
  async getAuthInfo(): Promise<AuthInfo> {
    try {
      // In Azure App Service, authentication info is available via /.auth/me endpoint
      const response = await fetch('/.auth/me', {
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        console.log('Not authenticated or auth endpoint not available');
        return this.getUnauthenticatedState();
      }

      const authData = await response.json();
      
      if (!authData || authData.length === 0) {
        console.log('No authentication data available');
        return this.getUnauthenticatedState();
      }

      // Azure App Service Easy Auth returns an array
      const userInfo = authData[0];
      
      if (!userInfo || !userInfo.user_id) {
        console.log('Invalid user info from Azure auth');
        return this.getUnauthenticatedState();
      }

      // Extract user information
      const user: AzureUser = {
        id: userInfo.user_id,
        name: userInfo.user_claims?.find((c: any) => c.typ === 'name')?.val || 
              userInfo.user_claims?.find((c: any) => c.typ === 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name')?.val ||
              'User',
        email: userInfo.user_claims?.find((c: any) => c.typ === 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress')?.val ||
               userInfo.user_claims?.find((c: any) => c.typ === 'email')?.val ||
               'user@domain.com',
        preferred_username: userInfo.user_claims?.find((c: any) => c.typ === 'preferred_username')?.val,
        given_name: userInfo.user_claims?.find((c: any) => c.typ === 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname')?.val,
        family_name: userInfo.user_claims?.find((c: any) => c.typ === 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/surname')?.val,
        roles: userInfo.user_claims?.filter((c: any) => c.typ === 'roles').map((c: any) => c.val) || [],
        claims: this.parseClaims(userInfo.user_claims || []),
      };

      // Get access token from headers (Azure App Service provides this)
      const accessToken = await this.getAccessToken();
      
      return {
        isAuthenticated: true,
        user,
        accessToken,
        idToken: userInfo.id_token || null,
        refreshToken: userInfo.refresh_token || null,
      };

    } catch (error) {
      console.error('Error getting Azure auth info:', error);
      return this.getUnauthenticatedState();
    }
  }

  /**
   * Get access token for API calls
   */
  async getAccessToken(): Promise<string | null> {
    try {
      // Try to get token from Azure App Service token store
      const response = await fetch('/.auth/token', {
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        console.log('Could not retrieve access token');
        return null;
      }

      const tokenData = await response.json();
      
      // Look for AAD access token (for Microsoft Graph/PowerBI API)
      const aadToken = tokenData.find((token: any) => token.provider_name === 'aad');
      
      if (aadToken && aadToken.access_token) {
        return aadToken.access_token;
      }

      // Fallback to first available token
      if (tokenData.length > 0 && tokenData[0].access_token) {
        return tokenData[0].access_token;
      }

      return null;
    } catch (error) {
      console.error('Error getting access token:', error);
      return null;
    }
  }

  /**
   * Check if user is authenticated (lightweight check)
   */
  async isAuthenticated(): Promise<boolean> {
    try {
      const response = await fetch('/.auth/me', {
        method: 'HEAD',
        credentials: 'include',
      });
      return response.ok;
    } catch (error) {
      console.error('Error checking authentication status:', error);
      return false;
    }
  }

  /**
   * Sign out user (redirect to Azure logout)
   */
  signOut(): void {
    // Azure App Service Easy Auth logout endpoint
    window.location.href = '/.auth/logout?post_logout_redirect_uri=' + 
                           encodeURIComponent(window.location.origin);
  }

  /**
   * Sign in user (redirect to Azure login)
   */
  signIn(): void {
    // Azure App Service Easy Auth login endpoint
    window.location.href = '/.auth/login/aad?post_login_redirect_uri=' + 
                           encodeURIComponent(window.location.href);
  }

  /**
   * Get user information from browser headers (alternative method)
   */
  getUserFromHeaders(): AzureUser | null {
    try {
      // In some Azure App Service configurations, user info is in document.cookie
      const cookies = document.cookie.split(';');
      
      // Look for AppServiceAuthSession cookie or X-MS-CLIENT-PRINCIPAL header info
      const principalCookie = cookies.find(cookie => 
        cookie.trim().startsWith('AppServiceAuthSession=') ||
        cookie.trim().startsWith('X-MS-CLIENT-PRINCIPAL=')
      );

      if (principalCookie) {
        // This would need to be decoded from base64 if available
        console.log('Found auth cookie, but user info extraction needs server-side processing');
      }

      return null;
    } catch (error) {
      console.error('Error getting user from headers:', error);
      return null;
    }
  }

  /**
   * Development mode - use mock authentication
   */
  getMockAuthInfo(): AuthInfo {
    if (process.env.NODE_ENV === 'development') {
      return {
        isAuthenticated: true,
        user: {
          id: 'mock-user-id',
          name: 'Demo User',
          email: 'demo@gutwise.com',
          preferred_username: 'demo.user',
          given_name: 'Demo',
          family_name: 'User',
          roles: ['User'],
          claims: {
            'name': 'Demo User',
            'email': 'demo@gutwise.com',
          },
        },
        accessToken: 'mock-access-token',
        idToken: 'mock-id-token',
        refreshToken: null,
      };
    }
    return this.getUnauthenticatedState();
  }

  /**
   * Check if we're running in Azure App Service
   */
  isAzureAppService(): boolean {
    // Check for Azure App Service environment variables
    return !!(
      typeof window !== 'undefined' && (
        // Check if auth endpoints exist (best indicator)
        window.location.hostname.includes('.azurewebsites.net') ||
        // Or if we have Azure-specific environment indicators
        document.cookie.includes('AppServiceAuthSession') ||
        // Or if the auth endpoints respond
        this.hasAzureAuthEndpoints()
      )
    );
  }

  /**
   * Check if Azure auth endpoints are available
   */
  private async hasAzureAuthEndpoints(): Promise<boolean> {
    try {
      const response = await fetch('/.auth/me', { 
        method: 'HEAD',
        credentials: 'include',
      });
      // If we get any response (even 401), the endpoint exists
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Parse user claims into a more usable format
   */
  private parseClaims(claims: any[]): Record<string, any> {
    const parsed: Record<string, any> = {};
    
    claims.forEach((claim) => {
      if (claim.typ && claim.val) {
        // Clean up claim type names
        const key = claim.typ.replace('http://schemas.xmlsoap.org/ws/2005/05/identity/claims/', '')
                              .replace('http://schemas.microsoft.com/ws/2008/06/identity/claims/', '');
        parsed[key] = claim.val;
      }
    });

    return parsed;
  }

  /**
   * Return unauthenticated state
   */
  private getUnauthenticatedState(): AuthInfo {
    return {
      isAuthenticated: false,
      user: null,
      accessToken: null,
      idToken: null,
      refreshToken: null,
    };
  }
}

// Export singleton instance
export const azureAuth = AzureAuthService.getInstance();