// Mock data service to replace all API calls for demo purposes

export interface MealEntry {
  id: string;
  dish_name: string;
  restaurant_name: string | null;
  meal_time: string;
  tags: string[] | null;
  notes?: string;
  images?: string[];
}

export interface SymptomEntry {
  id: string;
  overall_feeling: string;
  symptoms: string[] | null;
  severity_scores: Record<string, number> | null;
  recorded_at: string;
  meal_id?: string;
  notes?: string;
}

export interface Restaurant {
  id: string;
  name: string;
  address: string;
  cuisine_type: string;
  rating: number;
  distance: string;
  price_level: string;
  image_url: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface MenuDish {
  id: string;
  name: string;
  description: string;
  price: string;
  category: string;
  safety_score: number;
  ingredients: string[];
  allergens: string[];
  dietary_tags: string[];
  image_url?: string;
  ai_analysis?: {
    risk_level: 'low' | 'medium' | 'high';
    trigger_ingredients: string[];
    safe_for_conditions: string[];
    confidence_score: number;
  };
}

// Generate timestamps for the last 30 days
const generateTimestamp = (daysAgo: number, hour = 12) => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  date.setHours(hour, Math.floor(Math.random() * 60), 0, 0);
  return date.toISOString();
};

// Mock meals data
export const mockMeals: MealEntry[] = [
  {
    id: 'meal-001',
    dish_name: 'Margherita Pizza',
    restaurant_name: 'La Nonna Ristorante',
    meal_time: generateTimestamp(0, 19),
    tags: ['italian', 'pizza', 'vegetarian'],
    notes: 'Delicious thin crust pizza'
  },
  {
    id: 'meal-002',
    dish_name: 'Chicken Caesar Salad',
    restaurant_name: 'Fresh Garden Bistro',
    meal_time: generateTimestamp(1, 13),
    tags: ['salad', 'chicken', 'healthy'],
    notes: 'Light and fresh'
  },
  {
    id: 'meal-003',
    dish_name: 'Pad Thai',
    restaurant_name: 'Bangkok Kitchen',
    meal_time: generateTimestamp(1, 20),
    tags: ['thai', 'noodles', 'spicy'],
    notes: 'Medium spice level'
  },
  {
    id: 'meal-004',
    dish_name: 'Quinoa Buddha Bowl',
    restaurant_name: null, // Home cooked
    meal_time: generateTimestamp(2, 12),
    tags: ['healthy', 'vegan', 'quinoa'],
    notes: 'Homemade with fresh vegetables'
  },
  {
    id: 'meal-005',
    dish_name: 'Fish Tacos',
    restaurant_name: 'Coastal Cantina',
    meal_time: generateTimestamp(3, 18),
    tags: ['mexican', 'fish', 'tacos'],
    notes: 'Great fresh fish'
  },
  {
    id: 'meal-006',
    dish_name: 'Greek Chicken Bowl',
    restaurant_name: 'Mediterranean Delights',
    meal_time: generateTimestamp(4, 14),
    tags: ['mediterranean', 'chicken', 'healthy'],
    notes: 'With tzatziki sauce'
  },
  {
    id: 'meal-007',
    dish_name: 'Vegetable Stir Fry',
    restaurant_name: null,
    meal_time: generateTimestamp(5, 19),
    tags: ['asian', 'vegetarian', 'healthy'],
    notes: 'Home cooked with brown rice'
  },
  {
    id: 'meal-008',
    dish_name: 'BBQ Burger',
    restaurant_name: 'The Burger Joint',
    meal_time: generateTimestamp(6, 20),
    tags: ['american', 'burger', 'bbq'],
    notes: 'Felt a bit heavy afterwards'
  }
];

// Mock symptoms data
export const mockSymptoms: SymptomEntry[] = [
  {
    id: 'symptom-001',
    overall_feeling: 'great',
    symptoms: [],
    severity_scores: {},
    recorded_at: generateTimestamp(0, 21),
    meal_id: 'meal-001',
    notes: 'Felt amazing after this meal'
  },
  {
    id: 'symptom-002',
    overall_feeling: 'good',
    symptoms: [],
    severity_scores: {},
    recorded_at: generateTimestamp(1, 15),
    meal_id: 'meal-002',
    notes: 'Light and satisfying'
  },
  {
    id: 'symptom-003',
    overall_feeling: 'okay',
    symptoms: ['mild bloating'],
    severity_scores: { 'bloating': 2 },
    recorded_at: generateTimestamp(1, 22),
    meal_id: 'meal-003',
    notes: 'Slight discomfort, maybe too spicy'
  },
  {
    id: 'symptom-004',
    overall_feeling: 'great',
    symptoms: [],
    severity_scores: {},
    recorded_at: generateTimestamp(2, 14),
    meal_id: 'meal-004',
    notes: 'Perfect homemade meal'
  },
  {
    id: 'symptom-005',
    overall_feeling: 'good',
    symptoms: [],
    severity_scores: {},
    recorded_at: generateTimestamp(3, 20),
    meal_id: 'meal-005',
    notes: 'Fresh and tasty'
  },
  {
    id: 'symptom-006',
    overall_feeling: 'great',
    symptoms: [],
    severity_scores: {},
    recorded_at: generateTimestamp(4, 16),
    meal_id: 'meal-006',
    notes: 'Mediterranean food agrees with me'
  },
  {
    id: 'symptom-007',
    overall_feeling: 'good',
    symptoms: [],
    severity_scores: {},
    recorded_at: generateTimestamp(5, 21),
    meal_id: 'meal-007',
    notes: 'Healthy home cooking'
  },
  {
    id: 'symptom-008',
    overall_feeling: 'not-good',
    symptoms: ['bloating', 'fatigue'],
    severity_scores: { 'bloating': 4, 'fatigue': 3 },
    recorded_at: generateTimestamp(6, 22),
    meal_id: 'meal-008',
    notes: 'Too heavy and greasy'
  }
];

// Mock restaurants data
export const mockRestaurants: Restaurant[] = [
  {
    id: 'restaurant-001',
    name: 'La Nonna Ristorante',
    address: '123 Italian Way, Downtown',
    cuisine_type: 'Italian',
    rating: 4.7,
    distance: '0.2 miles',
    price_level: '$$',
    image_url: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=400&q=80',
    coordinates: { lat: 40.7589, lng: -73.9851 }
  },
  {
    id: 'restaurant-002',
    name: 'Fresh Garden Bistro',
    address: '456 Green Street, Midtown',
    cuisine_type: 'Healthy',
    rating: 4.5,
    distance: '0.3 miles',
    price_level: '$',
    image_url: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=400&q=80',
    coordinates: { lat: 40.7505, lng: -73.9934 }
  },
  {
    id: 'restaurant-003',
    name: 'Bangkok Kitchen',
    address: '789 Spice Avenue, East Side',
    cuisine_type: 'Thai',
    rating: 4.6,
    distance: '0.4 miles',
    price_level: '$$',
    image_url: 'https://images.unsplash.com/photo-1559847844-d721426d6edc?w=400&q=80',
    coordinates: { lat: 40.7614, lng: -73.9776 }
  },
  {
    id: 'restaurant-004',
    name: 'Mediterranean Delights',
    address: '321 Olive Road, West Village',
    cuisine_type: 'Mediterranean',
    rating: 4.8,
    distance: '0.5 miles',
    price_level: '$$',
    image_url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80',
    coordinates: { lat: 40.7359, lng: -74.0014 }
  },
  {
    id: 'restaurant-005',
    name: 'Coastal Cantina',
    address: '654 Beach Blvd, Waterfront',
    cuisine_type: 'Mexican',
    rating: 4.4,
    distance: '0.6 miles',
    price_level: '$$',
    image_url: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&q=80',
    coordinates: { lat: 40.7282, lng: -74.0776 }
  }
];

// Mock menu data for restaurants
export const mockMenus: Record<string, MenuDish[]> = {
  'restaurant-001': [ // La Nonna Ristorante
    {
      id: 'dish-001',
      name: 'Margherita Pizza',
      description: 'Classic pizza with fresh mozzarella, tomato sauce, and basil',
      price: '$18',
      category: 'Pizza',
      safety_score: 95,
      ingredients: ['flour', 'tomato sauce', 'mozzarella', 'basil', 'olive oil'],
      allergens: ['gluten', 'dairy'],
      dietary_tags: ['vegetarian'],
      image_url: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=400&q=80',
      ai_analysis: {
        risk_level: 'low',
        trigger_ingredients: [],
        safe_for_conditions: ['lactose_sensitive'],
        confidence_score: 0.92
      }
    },
    {
      id: 'dish-002',
      name: 'Pasta Carbonara',
      description: 'Creamy pasta with pancetta, eggs, and parmesan cheese',
      price: '$22',
      category: 'Pasta',
      safety_score: 75,
      ingredients: ['pasta', 'pancetta', 'eggs', 'parmesan', 'cream'],
      allergens: ['gluten', 'dairy', 'eggs'],
      dietary_tags: [],
      image_url: 'https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?w=400&q=80',
      ai_analysis: {
        risk_level: 'medium',
        trigger_ingredients: ['cream', 'dairy'],
        safe_for_conditions: [],
        confidence_score: 0.88
      }
    },
    {
      id: 'dish-003',
      name: 'Grilled Branzino',
      description: 'Fresh Mediterranean sea bass with lemon and herbs',
      price: '$28',
      category: 'Seafood',
      safety_score: 90,
      ingredients: ['branzino', 'lemon', 'herbs', 'olive oil'],
      allergens: ['fish'],
      dietary_tags: ['gluten-free', 'dairy-free'],
      image_url: 'https://images.unsplash.com/photo-1545558014-8692077e9b5c?w=400&q=80',
      ai_analysis: {
        risk_level: 'low',
        trigger_ingredients: [],
        safe_for_conditions: ['gluten_free', 'dairy_free'],
        confidence_score: 0.95
      }
    }
  ],
  'restaurant-002': [ // Fresh Garden Bistro
    {
      id: 'dish-004',
      name: 'Quinoa Buddha Bowl',
      description: 'Nutritious bowl with quinoa, roasted vegetables, and tahini dressing',
      price: '$16',
      category: 'Bowls',
      safety_score: 98,
      ingredients: ['quinoa', 'kale', 'sweet potato', 'chickpeas', 'tahini'],
      allergens: ['sesame'],
      dietary_tags: ['vegan', 'gluten-free'],
      image_url: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&q=80',
      ai_analysis: {
        risk_level: 'low',
        trigger_ingredients: [],
        safe_for_conditions: ['vegan', 'gluten_free'],
        confidence_score: 0.97
      }
    },
    {
      id: 'dish-005',
      name: 'Chicken Caesar Salad',
      description: 'Crispy romaine with grilled chicken, parmesan, and caesar dressing',
      price: '$14',
      category: 'Salads',
      safety_score: 85,
      ingredients: ['romaine lettuce', 'chicken breast', 'parmesan', 'croutons', 'caesar dressing'],
      allergens: ['dairy', 'gluten', 'anchovies'],
      dietary_tags: [],
      image_url: 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400&q=80',
      ai_analysis: {
        risk_level: 'low',
        trigger_ingredients: ['dairy'],
        safe_for_conditions: [],
        confidence_score: 0.89
      }
    }
  ]
};

// Mock location data
export const mockUserLocation = {
  latitude: 40.7589,
  longitude: -73.9851,
  address: '123 Demo Street, New York, NY'
};

// Mock AI menu analysis function
export const analyzeMenuWithAI = async (menuText: string, restaurant: Restaurant): Promise<MenuDish[]> => {
  // Simulate AI processing time
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Return mock analyzed menu based on restaurant
  return mockMenus[restaurant.id] || mockMenus['restaurant-001'];
};

// Mock API functions to replace real API calls
export const mockAPI = {
  // Meals API
  getMeals: async () => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return { meals: mockMeals, success: true };
  },

  addMeal: async (meal: Omit<MealEntry, 'id'>) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const newMeal = {
      ...meal,
      id: `meal-${Date.now()}`
    };
    mockMeals.unshift(newMeal);
    return { meal: newMeal, success: true };
  },

  // Symptoms API
  getSymptoms: async () => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return { symptoms: mockSymptoms, success: true };
  },

  addSymptom: async (symptom: Omit<SymptomEntry, 'id'>) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const newSymptom = {
      ...symptom,
      id: `symptom-${Date.now()}`
    };
    mockSymptoms.unshift(newSymptom);
    return { symptom: newSymptom, success: true };
  },

  // Restaurants API
  getNearbyRestaurants: async (location?: { lat: number; lng: number }) => {
    await new Promise(resolve => setTimeout(resolve, 800));
    return { restaurants: mockRestaurants, success: true };
  },

  getRestaurantMenu: async (restaurantId: string) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return { 
      menu: mockMenus[restaurantId] || [], 
      success: true 
    };
  },

  // AI Analysis API
  analyzeMenu: async (menuText: string, restaurantId: string) => {
    await new Promise(resolve => setTimeout(resolve, 2000));
    return { 
      analyzedMenu: mockMenus[restaurantId] || mockMenus['restaurant-001'],
      success: true 
    };
  },

  // Location API
  getCurrentLocation: async () => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return { location: mockUserLocation, success: true };
  }
};