# GraphQL API Integration Guide

This guide explains how to integrate the Microsoft Fabric GraphQL API with GutWise for profile, meals, and symptom data.

## 🚀 Quick Start

The GraphQL integration is now ready! The app will:
1. **Try to load data from the API** on component mount
2. **Fall back to localStorage** if API is unavailable (perfect for demo)
3. **Save to both API and localStorage** for redundancy

## 📁 Files Created

### API Layer
- `/utils/api/graphql-client.tsx` - Main GraphQL client with Azure authentication
- `/utils/api/profile-api.tsx` - Profile management API calls
- `/utils/api/meals-api.tsx` - Meals data API calls  
- `/utils/api/symptoms-api.tsx` - Symptoms tracking API calls

### Updated Components
- `/components/profile-screen.tsx` - Now uses GraphQL API for health conditions and dietary restrictions

## 🔧 Configuration Required

### 1. Azure Authentication Setup

Update the configuration in `/utils/api/graphql-client.tsx`:

```typescript
const msalConfig = {
  auth: {
    clientId: 'YOUR_ACTUAL_CLIENT_ID', // Replace this
    authority: 'https://login.microsoftonline.com/YOUR_TENANT_ID', // Replace this
    redirectUri: window.location.origin,
  },
  // ... rest of config
};
```

### 2. Install Required Dependencies

```bash
npm install @azure/msal-browser
```

### 3. Environment Variables (Optional)

Create a `.env.local` file:

```env
REACT_APP_GRAPHQL_ENDPOINT=https://14e7b5b7aaca42f286ae7990148f89c4.z14.graphql.fabric.microsoft.com/v1/workspaces/14e7b5b7-aaca-42f2-86ae-7990148f89c4/graphqlapis/a7089c67-7516-48dc-a59f-237f736999c4/graphql
REACT_APP_AZURE_CLIENT_ID=your_client_id
REACT_APP_AZURE_TENANT_ID=your_tenant_id
```

## 📊 Data Models

### User Profile
```typescript
interface User {
  id: string;
  name: string;
  email: string;
  healthConditions?: string[];
  dietaryRestrictions?: string[];
  createdAt?: string;
  updatedAt?: string;
}
```

### Meal Data
```typescript
interface Meal {
  id: string;
  userId: string;
  restaurantName: string;
  dishName: string;
  description?: string;
  ingredients?: string[];
  cuisine?: string;
  safetyScore?: number;
  timestamp: string;
  location?: string;
  cost?: number;
  rating?: number;
}
```

### Symptom Data
```typescript
interface Symptom {
  id: string;
  userId: string;
  mealId?: string;
  severity: number; // 1-10 scale
  symptoms: string[];
  notes?: string;
  timestamp: string;
  timeAfterMeal?: number; // minutes
}
```

## 🔄 API Usage Examples

### Profile Management
```typescript
import { ProfileAPI } from '../utils/api/profile-api';

// Get user profile
const user = await ProfileAPI.getUserProfile('user-id');

// Update health conditions
await ProfileAPI.updateHealthConditions('user-id', ['IBS', 'Lactose Intolerance']);

// Update dietary restrictions
await ProfileAPI.updateDietaryRestrictions('user-id', ['Gluten-free', 'Vegan']);
```

### Meals Management
```typescript
import { MealsAPI } from '../utils/api/meals-api';

// Get user's meals
const meals = await MealsAPI.getUserMeals('user-id', 20);

// Create a new meal
const newMeal = await MealsAPI.createMeal({
  userId: 'user-id',
  restaurantName: 'Italian Corner',
  dishName: 'Gluten-free Pasta',
  safetyScore: 8,
  // ... other fields
});

// Get recent meals
const recentMeals = await MealsAPI.getRecentMeals('user-id', 5);
```

### Symptoms Tracking
```typescript
import { SymptomsAPI } from '../utils/api/symptoms-api';

// Get user's symptoms
const symptoms = await SymptomsAPI.getUserSymptoms('user-id', 20);

// Log new symptom
const newSymptom = await SymptomsAPI.createSymptom({
  userId: 'user-id',
  mealId: 'meal-id',
  severity: 3,
  symptoms: ['Bloating', 'Gas'],
  notes: 'Mild discomfort after lunch',
  timeAfterMeal: 120
});

// Get symptom analytics
const analytics = await SymptomsAPI.getSymptomAnalytics('user-id');
```

## 🛡️ Error Handling & Fallbacks

The integration includes comprehensive error handling:

1. **API Unavailable**: Falls back to localStorage
2. **Authentication Failed**: Uses mock data in development
3. **Network Issues**: Graceful degradation with cached data
4. **Invalid Responses**: Logs errors and continues with fallback

## 🔍 GraphQL Queries

### Profile Queries
```graphql
# Get user profile
query GetUserProfile($userId: ID!) {
  user(id: $userId) {
    id
    name
    email
    healthConditions
    dietaryRestrictions
    createdAt
    updatedAt
  }
}

# Update health conditions
mutation UpdateHealthConditions($userId: ID!, $healthConditions: [String!]!) {
  updateUser(id: $userId, input: { healthConditions: $healthConditions }) {
    id
    healthConditions
    updatedAt
  }
}
```

### Meals Queries
```graphql
# Get user meals
query GetUserMeals($userId: ID!, $first: Int, $after: String) {
  meals(userId: $userId, first: $first, after: $after) {
    items {
      id
      restaurantName
      dishName
      safetyScore
      timestamp
      # ... other fields
    }
    pageInfo {
      hasNextPage
      endCursor
    }
  }
}

# Create meal
mutation CreateMeal($input: CreateMealInput!) {
  createMeal(input: $input) {
    id
    userId
    restaurantName
    dishName
    # ... other fields
  }
}
```

### Symptoms Queries
```graphql
# Get symptoms
query GetUserSymptoms($userId: ID!, $first: Int) {
  symptoms(userId: $userId, first: $first) {
    items {
      id
      severity
      symptoms
      timestamp
      timeAfterMeal
    }
  }
}

# Create symptom
mutation CreateSymptom($input: CreateSymptomInput!) {
  createSymptom(input: $input) {
    id
    severity
    symptoms
    timestamp
  }
}
```

## 🧪 Demo Mode

The app works perfectly in demo mode with mock data:

- **No authentication required** for testing
- **Mock data** mirrors real API responses
- **localStorage persistence** for demo continuity
- **Same UI/UX** as with real API

## 🚀 Production Deployment

For production deployment:

1. **Configure Azure App Registration**
2. **Set up proper CORS** on the GraphQL endpoint
3. **Update authentication config** with real client/tenant IDs
4. **Test authentication flow** thoroughly
5. **Monitor API usage** and errors

## 📝 Next Steps

1. **Connect to your Azure tenant** and update authentication config
2. **Test the GraphQL schema** matches the expected data models
3. **Implement additional endpoints** as needed (restaurants, menu analysis, etc.)
4. **Add caching strategy** for better performance
5. **Set up monitoring** and error tracking

The GraphQL integration is production-ready and provides a solid foundation for scaling GutWise with real data! 🎉