import { graphqlClient, Meal } from './graphql-client';

// GraphQL queries for meals management
const GET_USER_MEALS = `
  query GetUserMeals($userId: ID!, $first: Int, $after: String) {
    meals(userId: $userId, first: $first, after: $after) {
      items {
        id
        userId
        restaurantName
        dishName
        description
        ingredients
        cuisine
        safetyScore
        timestamp
        location
        cost
        rating
      }
      pageInfo {
        hasNextPage
        endCursor
      }
      totalCount
    }
  }
`;

const GET_MEAL_BY_ID = `
  query GetMealById($id: ID!) {
    meal(id: $id) {
      id
      userId
      restaurantName
      dishName
      description
      ingredients
      cuisine
      safetyScore
      timestamp
      location
      cost
      rating
    }
  }
`;

const CREATE_MEAL = `
  mutation CreateMeal($input: CreateMealInput!) {
    createMeal(input: $input) {
      id
      userId
      restaurantName
      dishName
      description
      ingredients
      cuisine
      safetyScore
      timestamp
      location
      cost
      rating
    }
  }
`;

const UPDATE_MEAL = `
  mutation UpdateMeal($id: ID!, $input: UpdateMealInput!) {
    updateMeal(id: $id, input: $input) {
      id
      userId
      restaurantName
      dishName
      description
      ingredients
      cuisine
      safetyScore
      timestamp
      location
      cost
      rating
    }
  }
`;

const DELETE_MEAL = `
  mutation DeleteMeal($id: ID!) {
    deleteMeal(id: $id) {
      id
    }
  }
`;

export interface MealFilters {
  cuisine?: string;
  restaurantName?: string;
  safetyScoreMin?: number;
  safetyScoreMax?: number;
  dateFrom?: string;
  dateTo?: string;
}

export interface MealsResponse {
  items: Meal[];
  pageInfo: {
    hasNextPage: boolean;
    endCursor: string | null;
  };
  totalCount: number;
}

export class MealsAPI {
  
  /**
   * Get user's meals with pagination and filters
   */
  static async getUserMeals(
    userId: string, 
    first: number = 20, 
    after?: string,
    filters?: MealFilters
  ): Promise<MealsResponse> {
    try {
      const variables = {
        userId,
        first,
        after,
        ...filters
      };

      const result = await graphqlClient.query<{ meals: MealsResponse }>(
        GET_USER_MEALS, 
        variables
      );
      
      return result.meals || { items: [], pageInfo: { hasNextPage: false, endCursor: null }, totalCount: 0 };
    } catch (error) {
      console.error('Failed to fetch user meals:', error);
      return { items: [], pageInfo: { hasNextPage: false, endCursor: null }, totalCount: 0 };
    }
  }

  /**
   * Get a specific meal by ID
   */
  static async getMealById(id: string): Promise<Meal | null> {
    try {
      const result = await graphqlClient.query<{ meal: Meal }>(GET_MEAL_BY_ID, { id });
      return result.meal || null;
    } catch (error) {
      console.error('Failed to fetch meal:', error);
      return null;
    }
  }

  /**
   * Create a new meal entry
   */
  static async createMeal(mealData: {
    userId: string;
    restaurantName: string;
    dishName: string;
    description?: string;
    ingredients?: string[];
    cuisine?: string;
    safetyScore?: number;
    location?: string;
    cost?: number;
    rating?: number;
  }): Promise<Meal | null> {
    try {
      const input = {
        ...mealData,
        timestamp: new Date().toISOString(),
      };

      const result = await graphqlClient.query<{ createMeal: Meal }>(
        CREATE_MEAL, 
        { input }
      );
      
      console.log('Meal created:', result.createMeal);
      return result.createMeal;
    } catch (error) {
      console.error('Failed to create meal:', error);
      return null;
    }
  }

  /**
   * Update an existing meal
   */
  static async updateMeal(id: string, updates: Partial<Meal>): Promise<Meal | null> {
    try {
      const result = await graphqlClient.query<{ updateMeal: Meal }>(
        UPDATE_MEAL, 
        { id, input: updates }
      );
      
      console.log('Meal updated:', result.updateMeal);
      return result.updateMeal;
    } catch (error) {
      console.error('Failed to update meal:', error);
      return null;
    }
  }

  /**
   * Delete a meal
   */
  static async deleteMeal(id: string): Promise<boolean> {
    try {
      await graphqlClient.query<{ deleteMeal: { id: string } }>(
        DELETE_MEAL, 
        { id }
      );
      
      console.log('Meal deleted:', id);
      return true;
    } catch (error) {
      console.error('Failed to delete meal:', error);
      return false;
    }
  }

  /**
   * Get recent meals for dashboard
   */
  static async getRecentMeals(userId: string, limit: number = 5): Promise<Meal[]> {
    try {
      const result = await this.getUserMeals(userId, limit);
      return result.items.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
    } catch (error) {
      console.error('Failed to fetch recent meals:', error);
      return [];
    }
  }

  /**
   * Get meals by safety score range
   */
  static async getMealsBySafetyScore(
    userId: string, 
    minScore: number, 
    maxScore: number = 10
  ): Promise<Meal[]> {
    try {
      const result = await this.getUserMeals(userId, 100, undefined, {
        safetyScoreMin: minScore,
        safetyScoreMax: maxScore
      });
      return result.items;
    } catch (error) {
      console.error('Failed to fetch meals by safety score:', error);
      return [];
    }
  }

  /**
   * Get meals by cuisine type
   */
  static async getMealsByCuisine(userId: string, cuisine: string): Promise<Meal[]> {
    try {
      const result = await this.getUserMeals(userId, 100, undefined, { cuisine });
      return result.items;
    } catch (error) {
      console.error('Failed to fetch meals by cuisine:', error);
      return [];
    }
  }
}