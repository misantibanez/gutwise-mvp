// Restaurant and menu analysis API utilities
import { projectId, publicAnonKey } from '../supabase/info';

const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-10f495ea`;

export interface Restaurant {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  cuisine_type?: string;
  distance?: number;
}

export interface DishAnalysis {
  dish: string;
  safetyScore: number;
  riskLevel: 'low' | 'medium' | 'high';
  triggers: string[];
  recommendations: string;
  modifications?: string[];
}

export interface MenuAnalysisResponse {
  analyses: DishAnalysis[];
  overallRecommendation: string;
  safestOptions: string[];
  riskiestOptions: string[];
}

// Restaurant detection
export const restaurantsAPI = {
  async findNearby(latitude: number, longitude: number, radius = 0.1): Promise<{ restaurants: Restaurant[] }> {
    const token = localStorage.getItem('supabase_access_token');
    
    const response = await fetch(`${API_BASE}/restaurants/nearby`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ latitude, longitude, radius }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to find nearby restaurants');
    }

    return response.json();
  }
};

// Menu analysis
export const menuAnalysisAPI = {
  async analyzeMenu(
    menuItems: string[], 
    userConditions?: string[], 
    dietaryRestrictions?: string[]
  ): Promise<{ analysis: MenuAnalysisResponse }> {
    const token = localStorage.getItem('supabase_access_token');
    
    const response = await fetch(`${API_BASE}/analyze-menu`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ menuItems, userConditions, dietaryRestrictions }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to analyze menu');
    }

    return response.json();
  },

  async analyzeDish(dishName: string, userConditions?: string[]): Promise<{ analysis: DishAnalysis }> {
    const token = localStorage.getItem('supabase_access_token');
    
    const response = await fetch(`${API_BASE}/analyze-dish`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ dishName, userConditions }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to analyze dish');
    }

    return response.json();
  }
};