import { mockDataService } from '../mock-data';

// Pure Mock Data API - no external dependencies
// All operations use local mock data service for consistent demo experience

// Helper to get current user session (demo mode only)
export async function getCurrentUser() {
  try {    // Check if we're in test mode with a real Azure user
    const testConfig = localStorage.getItem('gutwise-test-config');
    if (testConfig) {
      const config = JSON.parse(testConfig);
      if (config.active) {
        return { 
          session: { 
            user: { 
              id: config.object_id, // Use real Azure object_id
              email: config.email || 'test@gutwise.com',
              user_metadata: { full_name: config.name || 'Test User' }
            }, 
            access_token: `test-token-${config.object_id}` 
          }, 
          error: null 
        };
      }
    }
    
    // Check if we're in demo mode
    const demoUser = localStorage.getItem('gutwise-demo-user');
    if (demoUser) {
      const parsedUser = JSON.parse(demoUser);
      // Ensure demo user always has the consistent ID
      const consistentUser = {
        ...parsedUser,
        id: parsedUser.id || 'user_12345' // Fallback to consistent ID if missing
      };
      return { 
        session: { 
          user: { 
            id: consistentUser.id, 
            email: consistentUser.email,
            user_metadata: { full_name: consistentUser.name }
          }, 
          access_token: 'demo-token' 
        }, 
        error: null 
      };
    }
    
    // Return null session to indicate no user logged in
    return { session: null, error: null };
  } catch (error) {
    console.error('getCurrentUser exception:', error);
    return { session: null, error };
  }
}

// Helper to get the current user ID for API calls
async function getCurrentUserId(): Promise<string | null> {
  const { session } = await getCurrentUser();
  return session?.user?.id || null;
}

// Auth API (Pure demo mode)
export const authAPI = {
  async signUp(email: string, password: string, fullName: string) {
    // Use consistent demo user ID
    const demoUser = {
      id: 'user_12345',
      email,
      name: fullName,
      created_at: new Date().toISOString()
    };
    
    localStorage.setItem('gutwise-demo-user', JSON.stringify(demoUser));
    console.log('📝 Demo user created in localStorage');
    
    return { user: demoUser };
  },

  async signIn(email: string, password: string) {
    // Use consistent demo user ID
    const demoUser = {
      id: 'user_12345',
      email,
      name: email.split('@')[0],
      created_at: new Date().toISOString()
    };
    
    localStorage.setItem('gutwise-demo-user', JSON.stringify(demoUser));
    console.log('📝 Demo user signed in with localStorage');
    
    return { user: demoUser };
  },

  async signOut() {
    localStorage.removeItem('gutwise-demo-user');
    console.log('📝 Demo user signed out');
  },

  async signInWithGoogle() {
    // Use consistent demo user ID
    const demoUser = {
      id: 'user_12345',
      email: 'demo@gutwise.app',
      name: 'Demo User',
      created_at: new Date().toISOString()
    };
    
    localStorage.setItem('gutwise-demo-user', JSON.stringify(demoUser));
    console.log('📝 Demo user signed in with Google (mock)');
    
    return { user: demoUser };
  },
};

// Profile API (Pure mock data)
export const profileAPI = {
  async getProfile() {
    console.log('📝 Getting profile from mock data service');
    return mockDataService.getUserProfile();
  },

  async updateProfile(updates: any) {
    console.log('📝 Updating profile in mock data service');
    const currentProfile = mockDataService.getUserProfile().profile;
    return { 
      success: true, 
      profile: { 
        ...currentProfile, 
        ...updates,
        updated_at: new Date().toISOString()
      } 
    };
  },
};

// Meals API (Pure mock data)
export const mealsAPI = {
  async logMeal(mealData: any) {
    console.log('📝 Logging meal in mock data service');
    const userId = await getCurrentUserId();
    const mockMeal = {
      id: `meal_${Date.now()}`,
      user_id: userId || 'user_12345',
      dish_name: mealData.dish_name || 'Unknown Dish',
      restaurant_name: mealData.restaurant_name,
      restaurant_address: mealData.restaurant_address || '',
      cuisine_type: mealData.cuisine_type || 'unknown',
      meal_type: mealData.meal_type || 'lunch',
      portion_size: mealData.portion_size || 'regular',
      analysis: mealData.analysis || {
        safety_status: 'safe',
        confidence_score: 85,
        ai_analysis: 'This meal appears safe based on your dietary profile.',
        potential_triggers: [],
        safe_ingredients: ['fresh ingredients']
      },
      meal_time: mealData.meal_time || new Date().toISOString(),
      notes: mealData.notes,
      image_url: mealData.image_url,
      location: mealData.location,
      created_at: new Date().toISOString(),
    };
    console.log('✅ Mock meal created:', mockMeal.id);
    return { meal: mockMeal };
  },

  async getMeals(limit?: number) {
    console.log('📝 Getting meals from mock data service');
    const mockResult = mockDataService.getRecentMeals(limit);
    // Ensure consistent format - always return { meals: [...] }
    return mockResult && mockResult.meals ? mockResult : { meals: [] };
  },

  async getMeal(id: string) {
    console.log('📝 Getting single meal from mock data service');
    const meals = mockDataService.getRecentMeals(1)?.meals;
    return { meal: meals?.[0] || null };
  },
};

// Symptoms API (Pure mock data)
export const symptomsAPI = {
  async logSymptoms(symptomData: any) {
    console.log('📝 Logging symptoms in mock data service');
    const userId = await getCurrentUserId();
    const mockSymptom = {
      id: `symptom_${Date.now()}`,
      user_id: userId || 'user_12345',
      meal_id: symptomData.meal_id,
      symptoms: symptomData.symptoms || [],
      severity: symptomData.severity || {},
      overall_severity: symptomData.overall_severity || 1,
      mood_impact: symptomData.mood_impact || 1,
      onset_time: symptomData.onset_time || new Date().toISOString(),
      duration_hours: symptomData.duration_hours || 1,
      notes: symptomData.notes,
      possible_other_causes: symptomData.possible_other_causes,
      medications_taken: symptomData.medications_taken,
      created_at: new Date().toISOString()
    };
    console.log('✅ Mock symptom created:', mockSymptom.id);
    return { symptom: mockSymptom };
  },

  async getSymptoms() {
    console.log('📝 Getting symptoms from mock data service');
    return mockDataService.getSymptomHistory();
  },
};

// Insights API (Pure mock data)
export const insightsAPI = {
  async getInsights() {
    console.log('📝 Getting insights from mock data service');
    return mockDataService.getDashboardInsights();
  },
};

// Restaurant API (Mock data only)
export const restaurantAPI = {
  async getNearbyRestaurants(lat?: number, lng?: number) {
    // Mock data - this can be enhanced to use real location services if needed
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
        {
          id: 3,
          name: "Mediterranean Delights",
          cuisine: "Mediterranean",
          distance: "0.5 miles",
          rating: 4.8,
          safeOptions: 4,
          riskOptions: 1,
          image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400",
        }
      ]
    };
  },

  async analyzeMenu(restaurantId: string) {
    // Mock data - this can be enhanced to use real AI analysis if needed
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
        {
          id: 2,
          name: "Grilled Chicken Salad",
          description: "Mixed greens, grilled chicken, cherry tomatoes, cucumber",
          status: "safe",
          confidence: 95,
          reasons: ["Simple ingredients", "No common triggers", "High protein"],
          triggers: []
        },
        {
          id: 3,
          name: "Pasta Carbonara",
          description: "Creamy pasta with bacon and cheese",
          status: "caution",
          confidence: 75,
          reasons: ["High fat content", "Dairy present"],
          triggers: ["dairy", "high-fat"]
        }
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

// Comprehensive API service object
export const apiService = {
  auth: authAPI,
  profile: profileAPI,
  meals: mealsAPI,
  symptoms: symptomsAPI,
  insights: insightsAPI,
  restaurant: restaurantAPI,
  
  // Direct method exports for convenience
  signUp: authAPI.signUp,
  signIn: authAPI.signIn,
  signOut: authAPI.signOut,
  signInWithGoogle: authAPI.signInWithGoogle,
  getProfile: profileAPI.getProfile,
  updateProfile: profileAPI.updateProfile,
  logMeal: mealsAPI.logMeal,
  getMeals: mealsAPI.getMeals,
  logSymptoms: symptomsAPI.logSymptoms,
  getSymptoms: symptomsAPI.getSymptoms,
  getInsights: insightsAPI.getInsights,
};