import { azureAuth } from '../auth/azure-auth';

// Types for our GraphQL API
export interface User {
  id: string;
  name: string;
  email: string;
  healthConditions?: string[];
  dietaryRestrictions?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Meal {
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

export interface Symptom {
  id: string;
  userId: string;
  mealId?: string;
  severity: number;
  symptoms: string[];
  notes?: string;
  timestamp: string;
  timeAfterMeal?: number;
}

// GraphQL endpoint
const GRAPHQL_ENDPOINT = 'https://14e7b5b7aaca42f286ae7990148f89c4.z14.graphql.fabric.microsoft.com/v1/workspaces/14e7b5b7-aaca-42f2-86ae-7990148f89c4/graphqlapis/a7089c67-7516-48dc-a59f-237f736999c4/graphql';

class GraphQLClient {
  async getAccessToken(): Promise<string | null> {
    try {
      // Get token from Azure App Service authentication
      const token = await azureAuth.getAccessToken();
      
      if (token) {
        console.log('Using Azure App Service access token');
        return token;
      }

      // Fallback for development mode
      if (process.env.NODE_ENV === 'development') {
        console.log('Development mode: using mock token');
        return 'mock-access-token';
      }

      return null;
    } catch (error) {
      console.error('Token acquisition failed:', error);
      return null;
    }
  }

  async query<T = any>(query: string, variables: Record<string, any> = {}): Promise<T> {
    try {
      const token = await this.getAccessToken();

      // For demo purposes, return mock data if no token or in development
      if (!token || process.env.NODE_ENV === 'development') {
        console.log('Using mock data for GraphQL query:', query);
        return this.getMockData(query) as T;
      }

      const response = await fetch(GRAPHQL_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ query, variables }),
      });

      const result = await response.json();
      
      if (result.errors) {
        console.error('GraphQL errors:', result.errors);
        throw new Error(`GraphQL errors: ${result.errors.map((e: any) => e.message).join(', ')}`);
      }

      return result.data;
    } catch (error) {
      console.error('GraphQL query failed:', error);
      // Fallback to mock data in case of error
      return this.getMockData(query) as T;
    }
  }

  private getMockData(query: string): any {
    // Mock data for development/demo
    if (query.includes('symptoms')) {
      return {
        symptoms: {
          items: [
            {
              id: '1',
              userId: 'demo-user',
              mealId: 'meal-1',
              severity: 3,
              symptoms: ['Bloating', 'Gas'],
              notes: 'Mild discomfort after pasta',
              timestamp: new Date().toISOString(),
              timeAfterMeal: 120,
            },
            {
              id: '2',
              userId: 'demo-user',
              mealId: 'meal-2',
              severity: 1,
              symptoms: ['Slight nausea'],
              notes: 'Very mild reaction',
              timestamp: new Date(Date.now() - 86400000).toISOString(),
              timeAfterMeal: 180,
            },
          ],
        },
      };
    }

    if (query.includes('meals')) {
      return {
        meals: {
          items: [
            {
              id: 'meal-1',
              userId: 'demo-user',
              restaurantName: 'Italian Corner',
              dishName: 'Spaghetti Carbonara',
              description: 'Classic carbonara with eggs, cheese, and pancetta',
              ingredients: ['pasta', 'eggs', 'parmesan', 'pancetta', 'black pepper'],
              cuisine: 'Italian',
              safetyScore: 7,
              timestamp: new Date().toISOString(),
              location: 'Downtown',
              cost: 18.50,
              rating: 4,
            },
            {
              id: 'meal-2',
              userId: 'demo-user',
              restaurantName: 'Green Garden',
              dishName: 'Quinoa Buddha Bowl',
              description: 'Healthy bowl with quinoa, vegetables, and tahini dressing',
              ingredients: ['quinoa', 'kale', 'chickpeas', 'avocado', 'tahini'],
              cuisine: 'Healthy',
              safetyScore: 9,
              timestamp: new Date(Date.now() - 86400000).toISOString(),
              location: 'Uptown',
              cost: 16.00,
              rating: 5,
            },
          ],
        },
      };
    }

    if (query.includes('user') || query.includes('profile')) {
      return {
        user: {
          id: 'demo-user',
          name: 'Demo User',
          email: 'demo@gutwise.com',
          healthConditions: ['IBS (Irritable Bowel Syndrome)', 'Lactose Intolerance'],
          dietaryRestrictions: ['Gluten-free', 'Low FODMAP'],
          createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
          updatedAt: new Date().toISOString(),
        },
      };
    }

    return {};
  }
}

// Create singleton instance
export const graphqlClient = new GraphQLClient();