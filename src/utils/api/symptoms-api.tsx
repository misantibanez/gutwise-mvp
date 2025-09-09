import { graphqlClient, Symptom } from './graphql-client';

// GraphQL queries for symptoms management
const GET_USER_SYMPTOMS = `
  query GetUserSymptoms($userId: ID!, $first: Int, $after: String) {
    symptoms(userId: $userId, first: $first, after: $after) {
      items {
        id
        userId
        mealId
        severity
        symptoms
        notes
        timestamp
        timeAfterMeal
      }
      pageInfo {
        hasNextPage
        endCursor
      }
      totalCount
    }
  }
`;

const GET_SYMPTOMS_BY_MEAL = `
  query GetSymptomsByMeal($mealId: ID!) {
    symptoms(mealId: $mealId) {
      items {
        id
        userId
        mealId
        severity
        symptoms
        notes
        timestamp
        timeAfterMeal
      }
    }
  }
`;

const GET_SYMPTOM_BY_ID = `
  query GetSymptomById($id: ID!) {
    symptom(id: $id) {
      id
      userId
      mealId
      severity
      symptoms
      notes
      timestamp
      timeAfterMeal
    }
  }
`;

const CREATE_SYMPTOM = `
  mutation CreateSymptom($input: CreateSymptomInput!) {
    createSymptom(input: $input) {
      id
      userId
      mealId
      severity
      symptoms
      notes
      timestamp
      timeAfterMeal
    }
  }
`;

const UPDATE_SYMPTOM = `
  mutation UpdateSymptom($id: ID!, $input: UpdateSymptomInput!) {
    updateSymptom(id: $id, input: $input) {
      id
      userId
      mealId
      severity
      symptoms
      notes
      timestamp
      timeAfterMeal
    }
  }
`;

const DELETE_SYMPTOM = `
  mutation DeleteSymptom($id: ID!) {
    deleteSymptom(id: $id) {
      id
    }
  }
`;

export interface SymptomFilters {
  mealId?: string;
  severityMin?: number;
  severityMax?: number;
  symptoms?: string[];
  dateFrom?: string;
  dateTo?: string;
}

export interface SymptomsResponse {
  items: Symptom[];
  pageInfo: {
    hasNextPage: boolean;
    endCursor: string | null;
  };
  totalCount: number;
}

export class SymptomsAPI {
  
  /**
   * Get user's symptoms with pagination and filters
   */
  static async getUserSymptoms(
    userId: string, 
    first: number = 20, 
    after?: string,
    filters?: SymptomFilters
  ): Promise<SymptomsResponse> {
    try {
      const variables = {
        userId,
        first,
        after,
        ...filters
      };

      const result = await graphqlClient.query<{ symptoms: SymptomsResponse }>(
        GET_USER_SYMPTOMS, 
        variables
      );
      
      return result.symptoms || { items: [], pageInfo: { hasNextPage: false, endCursor: null }, totalCount: 0 };
    } catch (error) {
      console.error('Failed to fetch user symptoms:', error);
      return { items: [], pageInfo: { hasNextPage: false, endCursor: null }, totalCount: 0 };
    }
  }

  /**
   * Get symptoms for a specific meal
   */
  static async getSymptomsByMeal(mealId: string): Promise<Symptom[]> {
    try {
      const result = await graphqlClient.query<{ symptoms: { items: Symptom[] } }>(
        GET_SYMPTOMS_BY_MEAL, 
        { mealId }
      );
      
      return result.symptoms?.items || [];
    } catch (error) {
      console.error('Failed to fetch symptoms by meal:', error);
      return [];
    }
  }

  /**
   * Get a specific symptom by ID
   */
  static async getSymptomById(id: string): Promise<Symptom | null> {
    try {
      const result = await graphqlClient.query<{ symptom: Symptom }>(GET_SYMPTOM_BY_ID, { id });
      return result.symptom || null;
    } catch (error) {
      console.error('Failed to fetch symptom:', error);
      return null;
    }
  }

  /**
   * Create a new symptom entry
   */
  static async createSymptom(symptomData: {
    userId: string;
    mealId?: string;
    severity: number;
    symptoms: string[];
    notes?: string;
    timeAfterMeal?: number;
  }): Promise<Symptom | null> {
    try {
      const input = {
        ...symptomData,
        timestamp: new Date().toISOString(),
      };

      const result = await graphqlClient.query<{ createSymptom: Symptom }>(
        CREATE_SYMPTOM, 
        { input }
      );
      
      console.log('Symptom created:', result.createSymptom);
      return result.createSymptom;
    } catch (error) {
      console.error('Failed to create symptom:', error);
      return null;
    }
  }

  /**
   * Update an existing symptom
   */
  static async updateSymptom(id: string, updates: Partial<Symptom>): Promise<Symptom | null> {
    try {
      const result = await graphqlClient.query<{ updateSymptom: Symptom }>(
        UPDATE_SYMPTOM, 
        { id, input: updates }
      );
      
      console.log('Symptom updated:', result.updateSymptom);
      return result.updateSymptom;
    } catch (error) {
      console.error('Failed to update symptom:', error);
      return null;
    }
  }

  /**
   * Delete a symptom
   */
  static async deleteSymptom(id: string): Promise<boolean> {
    try {
      await graphqlClient.query<{ deleteSymptom: { id: string } }>(
        DELETE_SYMPTOM, 
        { id }
      );
      
      console.log('Symptom deleted:', id);
      return true;
    } catch (error) {
      console.error('Failed to delete symptom:', error);
      return false;
    }
  }

  /**
   * Get recent symptoms for dashboard
   */
  static async getRecentSymptoms(userId: string, limit: number = 5): Promise<Symptom[]> {
    try {
      const result = await this.getUserSymptoms(userId, limit);
      return result.items.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
    } catch (error) {
      console.error('Failed to fetch recent symptoms:', error);
      return [];
    }
  }

  /**
   * Get symptoms by severity range
   */
  static async getSymptomsBySeverity(
    userId: string, 
    minSeverity: number, 
    maxSeverity: number = 10
  ): Promise<Symptom[]> {
    try {
      const result = await this.getUserSymptoms(userId, 100, undefined, {
        severityMin: minSeverity,
        severityMax: maxSeverity
      });
      return result.items;
    } catch (error) {
      console.error('Failed to fetch symptoms by severity:', error);
      return [];
    }
  }

  /**
   * Get analytics data for symptoms
   */
  static async getSymptomAnalytics(userId: string): Promise<{
    totalSymptoms: number;
    averageSeverity: number;
    mostCommonSymptoms: { symptom: string; count: number }[];
    symptomsLastWeek: number;
  }> {
    try {
      const result = await this.getUserSymptoms(userId, 1000);
      const symptoms = result.items;

      const lastWeek = new Date();
      lastWeek.setDate(lastWeek.getDate() - 7);

      const symptomsLastWeek = symptoms.filter(s => 
        new Date(s.timestamp) >= lastWeek
      ).length;

      const averageSeverity = symptoms.length > 0 
        ? symptoms.reduce((sum, s) => sum + s.severity, 0) / symptoms.length 
        : 0;

      // Count symptom occurrences
      const symptomCounts: { [key: string]: number } = {};
      symptoms.forEach(s => {
        s.symptoms.forEach(symptom => {
          symptomCounts[symptom] = (symptomCounts[symptom] || 0) + 1;
        });
      });

      const mostCommonSymptoms = Object.entries(symptomCounts)
        .map(([symptom, count]) => ({ symptom, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      return {
        totalSymptoms: symptoms.length,
        averageSeverity: Math.round(averageSeverity * 10) / 10,
        mostCommonSymptoms,
        symptomsLastWeek,
      };
    } catch (error) {
      console.error('Failed to fetch symptom analytics:', error);
      return {
        totalSymptoms: 0,
        averageSeverity: 0,
        mostCommonSymptoms: [],
        symptomsLastWeek: 0,
      };
    }
  }
}