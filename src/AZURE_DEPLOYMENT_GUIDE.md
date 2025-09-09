# Azure App Service Deployment Guide

This guide explains how to deploy GutWise to Azure App Service with Azure AD authentication.

## 🚀 Azure App Service Setup

### 1. Create Azure App Service

```bash
# Using Azure CLI
az webapp create \
  --resource-group your-resource-group \
  --plan your-app-service-plan \
  --name gutwise-app \
  --runtime "NODE:18-lts"
```

### 2. Configure Authentication & Authorization

In the Azure Portal:

1. **Navigate to your App Service** → Authentication
2. **Add identity provider** → Microsoft
3. **Configure Microsoft provider:**
   - **App registration type**: Create new app registration
   - **Name**: GutWise App
   - **Supported account types**: Current tenant - Single tenant
   - **Restrict access**: Require authentication
   - **Unauthenticated requests**: Return HTTP 302 Found redirect

### 3. Configure API Permissions

In Azure AD App Registration:

1. **Go to API permissions**
2. **Add permission** → APIs my organization uses
3. **Search for "Power BI Service"** or your Fabric workspace
4. **Add permissions:**
   - `https://analysis.windows.net/powerbi/api/user_impersonation`
   - Any other permissions your GraphQL API requires

### 4. Configure App Settings

In App Service → Configuration → Application settings:

```bash
GRAPHQL_ENDPOINT=https://14e7b5b7aaca42f286ae7990148f89c4.z14.graphql.fabric.microsoft.com/v1/workspaces/14e7b5b7-aaca-42f2-86ae-7990148f89c4/graphqlapis/a7089c67-7516-48dc-a59f-237f736999c4/graphql
WEBSITE_AUTH_UNAUTHENTICATED_ACTION=RedirectToLoginPage
WEBSITE_AUTH_DEFAULT_PROVIDER=AzureActiveDirectory
```

## 🔐 Authentication Flow

### How Azure App Service Authentication Works:

1. **User accesses app** → Redirected to Azure AD login
2. **After successful login** → Azure sets authentication cookies
3. **App reads user info** from `/.auth/me` endpoint
4. **Access token available** via `/.auth/token` endpoint
5. **GraphQL calls use** the Azure-provided access token

### Authentication Endpoints Available:

- `/.auth/me` - Get current user information
- `/.auth/token` - Get access tokens for API calls
- `/.auth/login/aad` - Initiate Azure AD login
- `/.auth/logout` - Sign out user
- `/.auth/refresh` - Refresh tokens

## 📋 Deployment Steps

### 1. Build the App

```bash
npm run build
```

### 2. Deploy to Azure

**Option A: Azure CLI**
```bash
az webapp deployment source config-zip \
  --resource-group your-resource-group \
  --name gutwise-app \
  --src dist.zip
```

**Option B: GitHub Actions**
```yaml
name: Deploy to Azure App Service

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm run build
      - uses: azure/webapps-deploy@v2
        with:
          app-name: 'gutwise-app'
          publish-profile: ${{ secrets.AZURE_WEBAPP_PUBLISH_PROFILE }}
          package: './dist'
```

**Option C: VS Code Azure Extension**
1. Install Azure App Service extension
2. Right-click project → Deploy to Web App
3. Select your App Service

## 🧪 Testing Authentication

### Local Development
The app automatically detects the environment:
- **Local**: Uses mock authentication with demo data
- **Azure**: Uses real Azure AD authentication

### Verify Authentication Works
1. Deploy to Azure App Service
2. Access your app URL
3. Should redirect to Microsoft login
4. After login, should return to app with user context
5. Check browser dev tools:
   - `/.auth/me` should return user info
   - `/.auth/token` should return access tokens

## 📊 GraphQL API Integration

### Automatic Token Handling
The app automatically:
1. **Gets access token** from Azure App Service
2. **Includes token** in GraphQL requests
3. **Falls back to mock data** if API unavailable
4. **Handles token refresh** automatically

### Test GraphQL Connection
```javascript
// In browser console on deployed app:
fetch('/.auth/token')
  .then(r => r.json())
  .then(tokens => {
    const aadToken = tokens.find(t => t.provider_name === 'aad');
    console.log('Access token available:', !!aadToken?.access_token);
  });
```

## 🔧 Configuration Files

### Package.json Scripts
```json
{
  "scripts": {
    "build": "vite build",
    "preview": "vite preview",
    "deploy": "npm run build && az webapp deployment source config-zip --src dist.zip"
  }
}
```

### Web.config (if needed)
```xml
<?xml version="1.0" encoding="utf-8"?>
<configuration>
  <system.webServer>
    <rewrite>
      <rules>
        <rule name="SPA Routes" stopProcessing="true">
          <match url=".*" />
          <conditions logicalGrouping="MatchAll">
            <add input="{REQUEST_FILENAME}" matchType="IsFile" negate="true" />
            <add input="{REQUEST_FILENAME}" matchType="IsDirectory" negate="true" />
          </conditions>
          <action type="Rewrite" url="/" />
        </rule>
      </rules>
    </rewrite>
  </system.webServer>
</configuration>
```

## 🛡️ Security Features

### Built-in Security:
- **Azure AD authentication** at infrastructure level
- **HTTPS enforcement** by default
- **CORS handling** by Azure App Service
- **Token management** handled automatically
- **Session management** via Azure cookies

### Best Practices:
- Enable **Application Insights** for monitoring
- Set up **custom domains** with SSL certificates
- Configure **IP restrictions** if needed
- Enable **diagnostic logging**
- Set up **backup and restore**

## 📝 User Experience

### Seamless Authentication Flow:
1. **User visits app** → Automatic redirect to Azure AD
2. **Successful login** → Redirected back to app
3. **App loads user data** from GraphQL API
4. **Persistent session** until user signs out

### Development vs Production:
- **Development**: Mock authentication with localStorage
- **Production**: Real Azure AD with GraphQL API
- **Same UI/UX** in both environments
- **Graceful fallbacks** if API unavailable

## 🚀 Ready to Deploy!

Your GutWise app is now ready for Azure App Service deployment with:
- ✅ **Azure AD authentication** integrated
- ✅ **GraphQL API** connection ready  
- ✅ **Fallback mechanisms** for reliability
- ✅ **Production-ready** architecture
- ✅ **Development-friendly** local testing

Simply deploy to Azure App Service and configure authentication - the app will automatically detect the Azure environment and use real authentication! 🎉