import { graphqlClient, User } from './graphql-client';
import { azureAuth } from '../auth/azure-auth';

// GraphQL queries for profile management
const GET_USER_PROFILE = `
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
`;

const UPDATE_HEALTH_CONDITIONS = `
  mutation UpdateHealthConditions($userId: ID!, $healthConditions: [String!]!) {
    updateUser(id: $userId, input: { healthConditions: $healthConditions }) {
      id
      healthConditions
      updatedAt
    }
  }
`;

const UPDATE_DIETARY_RESTRICTIONS = `
  mutation UpdateDietaryRestrictions($userId: ID!, $dietaryRestrictions: [String!]!) {
    updateUser(id: $userId, input: { dietaryRestrictions: $dietaryRestrictions }) {
      id
      dietaryRestrictions
      updatedAt
    }
  }
`;

const CREATE_USER_PROFILE = `
  mutation CreateUserProfile($input: CreateUserInput!) {
    createUser(input: $input) {
      id
      name
      email
      healthConditions
      dietaryRestrictions
      createdAt
    }
  }
`;

export class ProfileAPI {
  
  /**
   * Get user profile by ID
   */
  static async getUserProfile(userId: string): Promise<User | null> {
    try {
      const result = await graphqlClient.query<{ user: User }>(GET_USER_PROFILE, { userId });
      return result.user || null;
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      return null;
    }
  }

  /**
   * Update user's health conditions
   */
  static async updateHealthConditions(userId: string, healthConditions: string[]): Promise<boolean> {
    try {
      const result = await graphqlClient.query<{ updateUser: User }>(
        UPDATE_HEALTH_CONDITIONS, 
        { userId, healthConditions }
      );
      
      console.log('Health conditions updated:', result.updateUser);
      return true;
    } catch (error) {
      console.error('Failed to update health conditions:', error);
      return false;
    }
  }

  /**
   * Update user's dietary restrictions
   */
  static async updateDietaryRestrictions(userId: string, dietaryRestrictions: string[]): Promise<boolean> {
    try {
      const result = await graphqlClient.query<{ updateUser: User }>(
        UPDATE_DIETARY_RESTRICTIONS, 
        { userId, dietaryRestrictions }
      );
      
      console.log('Dietary restrictions updated:', result.updateUser);
      return true;
    } catch (error) {
      console.error('Failed to update dietary restrictions:', error);
      return false;
    }
  }

  /**
   * Create a new user profile
   */
  static async createUserProfile(userData: {
    name: string;
    email: string;
    healthConditions?: string[];
    dietaryRestrictions?: string[];
  }): Promise<User | null> {
    try {
      const result = await graphqlClient.query<{ createUser: User }>(
        CREATE_USER_PROFILE, 
        { input: userData }
      );
      
      console.log('User profile created:', result.createUser);
      return result.createUser;
    } catch (error) {
      console.error('Failed to create user profile:', error);
      return null;
    }
  }

  /**
   * Update user profile (generic update)
   */
  static async updateUserProfile(userId: string, updates: Partial<User>): Promise<User | null> {
    try {
      // For now, handle health conditions and dietary restrictions separately
      // You can expand this to handle other fields as needed
      
      if (updates.healthConditions) {
        await this.updateHealthConditions(userId, updates.healthConditions);
      }
      
      if (updates.dietaryRestrictions) {
        await this.updateDietaryRestrictions(userId, updates.dietaryRestrictions);
      }
      
      // Fetch updated profile
      return await this.getUserProfile(userId);
    } catch (error) {
      console.error('Failed to update user profile:', error);
      return null;
    }
  }

  /**
   * Get current user from Azure authentication
   */
  static getCurrentUserId(): string {
    try {
      // Try to get from Azure auth context first
      const authInfo = azureAuth.getMockAuthInfo(); // This will check environment automatically
      
      if (authInfo.isAuthenticated && authInfo.user) {
        return authInfo.user.id;
      }
      
      // Fallback for demo purposes
      return 'demo-user';
    } catch (error) {
      console.error('Error getting current user ID:', error);
      return 'demo-user';
    }
  }
}