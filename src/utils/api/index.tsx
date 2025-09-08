import { supabase } from '../supabase/client';
import { projectId, publicAnonKey } from '../supabase/info';

const API_BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-10f495ea`;

// Helper to get current user session
export async function getCurrentUser() {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('getCurrentUser error:', error);
      return { session: null, error };
    }
    
    if (session?.user) {
      console.log('getCurrentUser success:', {
        userId: session.user.id,
        email: session.user.email,
        hasAccessToken: !!session.access_token
      });
    } else {
      console.log('getCurrentUser: no active session');
    }
    
    return { session, error: null };
  } catch (error) {
    console.error('getCurrentUser exception:', error);
    return { session: null, error };
  }
}

// Helper to properly format error messages
function formatError(error: any): string {
  if (error instanceof Error) {
    return error.message;
  }
  
  if (typeof error === 'string') {
    return error;
  }
  
  if (error && typeof error === 'object') {
    // Handle various error object structures
    if (error.message) return error.message;
    if (error.error) return error.error;
    if (error.msg) return error.msg;
    if (error.description) return error.description;
    
    // Try to stringify the object for debugging
    try {
      return JSON.stringify(error);
    } catch {
      return 'Unknown error occurred';
    }
  }
  
  return 'Unknown error occurred';
}

// Helper to make authenticated API calls
async function apiCall(endpoint: string, options: RequestInit = {}) {
  try {
    const { session } = await getCurrentUser();
    
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': session?.access_token ? `Bearer ${session.access_token}` : `Bearer ${publicAnonKey}`,
      ...options.headers,
    };

    console.log('Making API call to:', `${API_BASE_URL}${endpoint}`);
    console.log('With headers:', { ...headers, Authorization: '[REDACTED]' });

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    console.log('Response status:', response.status, response.statusText);

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      
      try {
        const errorData = await response.text();
        console.log('Error response body:', errorData);
        
        // Try to parse as JSON
        try {
          const parsedError = JSON.parse(errorData);
          errorMessage = parsedError.error || parsedError.message || errorMessage;
        } catch {
          // If not JSON, use the text directly
          errorMessage = errorData || errorMessage;
        }
      } catch (e) {
        console.log('Could not read error response body:', e);
      }
      
      throw new Error(errorMessage);
    }

    return response.json();
  } catch (error) {
    console.error('API call error:', formatError(error));
    
    // Always throw a properly formatted error
    throw new Error(formatError(error));
  }
}

// Auth API
export const authAPI = {
  async signUp(email: string, password: string, fullName: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName }
      }
    });
    
    if (error) throw error;
    return data;
  },

  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) throw error;
    return data;
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async signInWithGoogle() {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
    });
    
    if (error) throw error;
    return data;
  },
};

// Profile API
export const profileAPI = {
  async getProfile() {
    return apiCall('/profile');
  },

  async updateProfile(updates: any) {
    return apiCall('/profile', {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },
};

// Meals API
export const mealsAPI = {
  async logMeal(mealData: any) {
    // First try the full API, then fallback to KV store if it fails
    try {
      return await apiCall('/meals', {
        method: 'POST',
        body: JSON.stringify(mealData),
      });
    } catch (error) {
      const errorMsg = formatError(error);
      console.log('Database API failed, trying KV store fallback:', errorMsg);
      
      // Fallback: Store in KV store using simple approach
      try {
        const { session } = await getCurrentUser();
        if (!session?.user) {
          throw new Error('Not authenticated - please sign in again');
        }

        const mealId = `meal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const mealRecord = {
          id: mealId,
          user_id: session.user.id,
          ...mealData,
          created_at: new Date().toISOString(),
        };

        // Store using KV (this should work immediately)
        const kvResponse = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-10f495ea/kv-meals`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify(mealRecord),
        });

        if (!kvResponse.ok) {
          const errorText = await kvResponse.text();
          throw new Error(`KV storage failed: ${kvResponse.status} - ${errorText}`);
        }

        const result = await kvResponse.json();
        console.log('Meal stored in KV successfully:', result);
        return { meal: mealRecord };
      } catch (kvError) {
        const kvErrorMsg = formatError(kvError);
        console.error('KV fallback also failed:', kvErrorMsg);
        throw new Error(`Both database and KV storage failed. Database error: ${errorMsg}. KV error: ${kvErrorMsg}`);
      }
    }
  },

  async getMeals(limit?: number) {
    const query = limit ? `?limit=${limit}` : '';
    return apiCall(`/meals${query}`);
  },

  async getMeal(id: string) {
    return apiCall(`/meals/${id}`);
  },
};

// Symptoms API
export const symptomsAPI = {
  async logSymptoms(symptomData: any) {
    return apiCall('/symptoms', {
      method: 'POST',
      body: JSON.stringify(symptomData),
    });
  },

  async getSymptoms() {
    return apiCall('/symptoms');
  },
};

// Insights API
export const insightsAPI = {
  async getInsights() {
    return apiCall('/insights');
  },
};

// Mock data for restaurant suggestions (you can replace with real API later)
export const restaurantAPI = {
  async getNearbyRestaurants(lat?: number, lng?: number) {
    // Mock data - replace with real API call
    return {
      restaurants: [
        {
          id: 1,
          name: "La Nonna Ristorante",
          cuisine: "Italian",
          distance: "0.2 miles",
          rating: 4.5,
          safeOptions: 3,
          riskOptions: 2,
          image: "https://images.unsplash.com/photo-1609951734391-b79a50460c6c?w=400",
        },
        {
          id: 2,
          name: "Green Bowl Cafe",
          cuisine: "Healthy",
          distance: "0.4 miles",
          rating: 4.8,
          safeOptions: 5,
          riskOptions: 0,
          image: "https://images.unsplash.com/photo-1642339800099-921df1a0a958?w=400",
        },
      ]
    };
  },

  async analyzeMenu(restaurantId: string) {
    // Mock data - replace with real API call
    return {
      menuItems: [
        {
          id: 1,
          name: "Mediterranean Quinoa Bowl",
          description: "Quinoa, cucumber, tomatoes, olives, feta cheese, olive oil dressing",
          status: "safe",
          confidence: 98,
          reasons: ["Low FODMAP ingredients", "No gluten", "Anti-inflammatory"],
          triggers: []
        },
      ]
    };
  },
};

// Convenience exports for direct access
export const signUp = authAPI.signUp;
export const signIn = authAPI.signIn;
export const signOut = authAPI.signOut;
export const signInWithGoogle = authAPI.signInWithGoogle;
export const getProfile = profileAPI.getProfile;
export const updateProfile = profileAPI.updateProfile;
export const logMeal = mealsAPI.logMeal;
export const getMeals = mealsAPI.getMeals;
export const logSymptoms = symptomsAPI.logSymptoms;
export const getSymptoms = symptomsAPI.getSymptoms;
export const getInsights = insightsAPI.getInsights;

// Export restaurant and menu analysis APIs
export { restaurantsAPI, menuAnalysisAPI } from './restaurants';
export { geolocationService } from '../location/geolocation';