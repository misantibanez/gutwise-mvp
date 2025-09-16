// Note: Using a simplified analysis since MenuAnalysisService is designed for full restaurant analysis

export interface RestaurantSafetyAnalysis {
  restaurant: {
    id: string;
    name: string;
    cuisine: string;
    distance: string;
    distanceValue: number; // for sorting
    address?: string;
  };
  safetyScore: number; // 0-100
  safeDishCount: number;
  totalDishCount: number;
  riskLevel: 'low' | 'medium' | 'high';
  topSafeDishes: Array<{
    name: string;
    safetyScore: number;
    reasons: string[];
  }>;
  reasons: string[];
}

class SmartRestaurantSuggestionService {
  private static readonly MOCK_RESTAURANTS = [
    {
      id: 'rest-001',
      name: 'La Nonna Ristorante',
      cuisine: 'Italian',
      distance: '0.2 miles',
      distanceValue: 0.2,
      address: '123 Main St'
    },
    {
      id: 'rest-002', 
      name: 'Fresh Garden Bistro',
      cuisine: 'American',
      distance: '0.3 miles',
      distanceValue: 0.3,
      address: '456 Oak Ave'
    },
    {
      id: 'rest-003',
      name: 'Bangkok Kitchen',
      cuisine: 'Thai',
      distance: '0.4 miles',
      distanceValue: 0.4,
      address: '789 Pine St'
    },
    {
      id: 'rest-004',
      name: 'Cafe Verde',
      cuisine: 'Mediterranean',
      distance: '0.5 miles',
      distanceValue: 0.5,
      address: '321 Elm St'
    },
    {
      id: 'rest-005',
      name: 'Tokyo Sushi Bar',
      cuisine: 'Japanese',
      distance: '0.6 miles',
      distanceValue: 0.6,
      address: '654 Cedar Rd'
    }
  ];

  private static readonly MOCK_MENUS = {
    'rest-001': [ // La Nonna Ristorante - Italian
      { name: 'Margherita Pizza', ingredients: ['tomato sauce', 'mozzarella', 'basil', 'olive oil'], price: '$16' },
      { name: 'Grilled Chicken Breast', ingredients: ['chicken', 'herbs', 'olive oil', 'lemon'], price: '$22' },
      { name: 'Caesar Salad', ingredients: ['romaine lettuce', 'parmesan', 'croutons', 'caesar dressing'], price: '$14' },
      { name: 'Carbonara Pasta', ingredients: ['pasta', 'eggs', 'bacon', 'parmesan', 'black pepper'], price: '$18' },
      { name: 'Risotto Primavera', ingredients: ['arborio rice', 'vegetables', 'parmesan', 'white wine'], price: '$20' },
      { name: 'Osso Buco', ingredients: ['veal shanks', 'tomatoes', 'onions', 'carrots', 'white wine'], price: '$28' },
      { name: 'Caprese Salad', ingredients: ['mozzarella', 'tomatoes', 'basil', 'balsamic vinegar'], price: '$12' },
      { name: 'Penne Arrabbiata', ingredients: ['penne pasta', 'tomatoes', 'chili peppers', 'garlic'], price: '$16' },
      { name: 'Branzino', ingredients: ['sea bass', 'herbs', 'lemon', 'olive oil'], price: '$26' },
      { name: 'Tiramisu', ingredients: ['mascarpone', 'coffee', 'ladyfingers', 'cocoa'], price: '$8' }
    ],
    'rest-002': [ // Fresh Garden Bistro - American
      { name: 'Garden Salad', ingredients: ['mixed greens', 'carrots', 'cucumber', 'tomatoes', 'vinaigrette'], price: '$12' },
      { name: 'Grilled Salmon', ingredients: ['salmon', 'lemon', 'dill', 'asparagus'], price: '$24' },
      { name: 'Quinoa Bowl', ingredients: ['quinoa', 'roasted vegetables', 'avocado', 'tahini dressing'], price: '$16' },
      { name: 'Turkey Sandwich', ingredients: ['turkey', 'lettuce', 'tomato', 'whole grain bread', 'mustard'], price: '$14' },
      { name: 'BBQ Chicken', ingredients: ['chicken', 'bbq sauce', 'corn', 'coleslaw'], price: '$19' },
      { name: 'Veggie Burger', ingredients: ['black bean patty', 'lettuce', 'tomato', 'avocado', 'bun'], price: '$15' },
      { name: 'Steak Frites', ingredients: ['sirloin steak', 'french fries', 'herb butter'], price: '$32' },
      { name: 'Fish Tacos', ingredients: ['white fish', 'corn tortillas', 'cabbage slaw', 'lime'], price: '$17' },
      { name: 'Mushroom Risotto', ingredients: ['arborio rice', 'mushrooms', 'parmesan', 'truffle oil'], price: '$21' },
      { name: 'Chocolate Cake', ingredients: ['chocolate', 'flour', 'sugar', 'eggs', 'buttercream'], price: '$7' }
    ],
    'rest-003': [ // Bangkok Kitchen - Thai
      { name: 'Pad Thai', ingredients: ['rice noodles', 'shrimp', 'bean sprouts', 'peanuts', 'tamarind'], price: '$15' },
      { name: 'Green Curry', ingredients: ['chicken', 'coconut milk', 'thai basil', 'green chili', 'eggplant'], price: '$17' },
      { name: 'Tom Yum Soup', ingredients: ['shrimp', 'lemongrass', 'chili', 'lime', 'mushrooms'], price: '$13' },
      { name: 'Thai Fried Rice', ingredients: ['jasmine rice', 'egg', 'vegetables', 'soy sauce', 'fish sauce'], price: '$14' },
      { name: 'Massaman Curry', ingredients: ['beef', 'coconut milk', 'potatoes', 'peanuts', 'tamarind'], price: '$18' },
      { name: 'Som Tam Salad', ingredients: ['green papaya', 'tomatoes', 'lime', 'fish sauce', 'chili'], price: '$11' },
      { name: 'Pad See Ew', ingredients: ['flat noodles', 'chinese broccoli', 'egg', 'dark soy sauce'], price: '$16' },
      { name: 'Larb Gai', ingredients: ['ground chicken', 'mint', 'lime', 'fish sauce', 'chili flakes'], price: '$14' },
      { name: 'Thai Basil Stir Fry', ingredients: ['ground pork', 'thai basil', 'chili', 'garlic', 'jasmine rice'], price: '$15' },
      { name: 'Mango Sticky Rice', ingredients: ['mango', 'sticky rice', 'coconut milk', 'sugar'], price: '$6' }
    ],
    'rest-004': [ // Cafe Verde - Mediterranean
      { name: 'Greek Salad', ingredients: ['olives', 'feta cheese', 'cucumber', 'tomatoes', 'red onion'], price: '$13' },
      { name: 'Grilled Halloumi', ingredients: ['halloumi cheese', 'herbs', 'olive oil', 'lemon'], price: '$15' },
      { name: 'Hummus Plate', ingredients: ['chickpeas', 'tahini', 'olive oil', 'pita bread', 'paprika'], price: '$11' },
      { name: 'Lamb Kebab', ingredients: ['lamb', 'onions', 'herbs', 'yogurt sauce', 'rice pilaf'], price: '$21' },
      { name: 'Moussaka', ingredients: ['eggplant', 'ground lamb', 'bechamel sauce', 'tomatoes'], price: '$19' },
      { name: 'Falafel Wrap', ingredients: ['chickpea falafel', 'tahini sauce', 'vegetables', 'pita'], price: '$13' },
      { name: 'Grilled Octopus', ingredients: ['octopus', 'olive oil', 'lemon', 'herbs', 'capers'], price: '$24' },
      { name: 'Spanakopita', ingredients: ['spinach', 'feta cheese', 'phyllo pastry', 'herbs'], price: '$14' },
      { name: 'Mediterranean Sea Bass', ingredients: ['sea bass', 'tomatoes', 'olives', 'capers', 'white wine'], price: '$26' },
      { name: 'Baklava', ingredients: ['phyllo pastry', 'nuts', 'honey', 'cinnamon'], price: '$6' }
    ],
    'rest-005': [ // Tokyo Sushi Bar - Japanese
      { name: 'Salmon Sashimi', ingredients: ['fresh salmon'], price: '$18' },
      { name: 'California Roll', ingredients: ['crab', 'avocado', 'cucumber', 'nori', 'sesame seeds'], price: '$12' },
      { name: 'Miso Soup', ingredients: ['miso paste', 'tofu', 'seaweed', 'scallions'], price: '$4' },
      { name: 'Chicken Teriyaki', ingredients: ['chicken', 'teriyaki sauce', 'steamed rice', 'vegetables'], price: '$16' },
      { name: 'Chirashi Bowl', ingredients: ['assorted sashimi', 'sushi rice', 'wasabi', 'pickled ginger'], price: '$22' },
      { name: 'Tempura Udon', ingredients: ['udon noodles', 'tempura shrimp', 'dashi broth', 'scallions'], price: '$17' },
      { name: 'Beef Yakitori', ingredients: ['beef skewers', 'tare sauce', 'grilled vegetables'], price: '$19' },
      { name: 'Agedashi Tofu', ingredients: ['silken tofu', 'dashi broth', 'grated daikon', 'ginger'], price: '$9' },
      { name: 'Rainbow Roll', ingredients: ['california roll', 'assorted fish', 'avocado', 'tobiko'], price: '$15' },
      { name: 'Green Tea Ice Cream', ingredients: ['green tea', 'cream', 'sugar'], price: '$5' }
    ]
  };

  async getBestRestaurantSuggestion(): Promise<RestaurantSafetyAnalysis | null> {
    try {
      // Get user's health conditions and dietary restrictions
      const healthConditions = this.getUserHealthConditions();
      const dietaryRestrictions = this.getUserDietaryRestrictions();
      
      // Analyze all nearby restaurants
      const analyses: RestaurantSafetyAnalysis[] = [];
      
      for (const restaurant of SmartRestaurantSuggestionService.MOCK_RESTAURANTS) {
        const analysis = await this.analyzeRestaurant(restaurant, healthConditions, dietaryRestrictions);
        if (analysis) {
          analyses.push(analysis);
        }
      }
      
      // Sort by safety score (desc) and then by distance (asc)
      analyses.sort((a, b) => {
        if (b.safetyScore !== a.safetyScore) {
          return b.safetyScore - a.safetyScore;
        }
        return a.restaurant.distanceValue - b.restaurant.distanceValue;
      });
      
      // Return the best option
      return analyses.length > 0 ? analyses[0] : null;
      
    } catch (error) {
      console.error('Error getting restaurant suggestion:', error);
      return this.getFallbackSuggestion();
    }
  }

  private async analyzeRestaurant(
    restaurant: any, 
    healthConditions: string[], 
    dietaryRestrictions: string[]
  ): Promise<RestaurantSafetyAnalysis | null> {
    try {
      const menu = SmartRestaurantSuggestionService.MOCK_MENUS[restaurant.id as keyof typeof SmartRestaurantSuggestionService.MOCK_MENUS];
      if (!menu) return null;

      const dishAnalyses = [];
      let totalSafetyScore = 0;
      let safeDishCount = 0;

      // Analyze each dish using simplified analysis
      for (const dish of menu) {
        const analysis = this.analyzeDishSafety(dish, healthConditions, dietaryRestrictions);

        dishAnalyses.push({
          name: dish.name,
          safetyScore: analysis.safetyScore,
          reasons: analysis.reasons
        });

        totalSafetyScore += analysis.safetyScore;
        if (analysis.safetyScore >= 70) {
          safeDishCount++;
        }
      }

      const avgSafetyScore = totalSafetyScore / menu.length;
      
      // Get top 3 safest dishes
      const topSafeDishes = dishAnalyses
        .filter(dish => dish.safetyScore >= 70)
        .sort((a, b) => b.safetyScore - a.safetyScore)
        .slice(0, 3);

      // Determine risk level
      let riskLevel: 'low' | 'medium' | 'high' = 'high';
      if (avgSafetyScore >= 80) riskLevel = 'low';
      else if (avgSafetyScore >= 60) riskLevel = 'medium';

      // Generate reasons
      const reasons = this.generateReasons(restaurant, safeDishCount, menu.length, avgSafetyScore, healthConditions, dietaryRestrictions);

      // Enhance restaurant object with additional properties needed for menu analysis
      const enhancedRestaurant = {
        ...restaurant,
        image: this.generateRestaurantImage(restaurant.cuisine),
        rating: Number((3.5 + Math.random() * 1.5).toFixed(1)), // Generate rating between 3.5-5.0
        safeOptions: safeDishCount,
        riskOptions: menu.length - safeDishCount,
        categories: [restaurant.cuisine.toLowerCase()],
        position: { lat: 40.7579336, lon: -74.0244151 }, // Default position
        priceLevel: '$',
        hours: '11:00 AM - 10:00 PM',
        phone: '(555) 123-4567',
        features: ['Gluten-free options', 'Vegan friendly'],
        compatibility: Math.round(avgSafetyScore)
      };

      return {
        restaurant: enhancedRestaurant,
        safetyScore: Math.round(avgSafetyScore),
        safeDishCount,
        totalDishCount: menu.length,
        riskLevel,
        topSafeDishes,
        reasons
      };

    } catch (error) {
      console.error(`Error analyzing restaurant ${restaurant.name}:`, error);
      return null;
    }
  }

  private generateReasons(
    restaurant: any, 
    safeDishCount: number, 
    totalDishCount: number, 
    avgSafetyScore: number,
    healthConditions: string[],
    dietaryRestrictions: string[]
  ): string[] {
    const reasons = [];

    // Safe dish count
    if (safeDishCount >= 3) {
      reasons.push(`${safeDishCount} safe dishes available`);
    } else if (safeDishCount >= 1) {
      reasons.push(`${safeDishCount} safe option${safeDishCount > 1 ? 's' : ''} found`);
    }

    // Cuisine compatibility
    const cuisineCompatibility = this.getCuisineCompatibility(restaurant.cuisine, healthConditions, dietaryRestrictions);
    if (cuisineCompatibility) {
      reasons.push(cuisineCompatibility);
    }

    // Distance
    if (restaurant.distanceValue <= 0.3) {
      reasons.push('Very close to your location');
    } else if (restaurant.distanceValue <= 0.5) {
      reasons.push('Within walking distance');
    }

    // Safety score
    if (avgSafetyScore >= 85) {
      reasons.push('Excellent safety rating');
    } else if (avgSafetyScore >= 70) {
      reasons.push('Good safety rating');
    }

    return reasons.slice(0, 3); // Limit to 3 reasons
  }

  private getCuisineCompatibility(cuisine: string, healthConditions: string[], dietaryRestrictions: string[]): string | null {
    // Mediterranean is generally good for digestive health
    if (cuisine.toLowerCase().includes('mediterranean')) {
      return 'Mediterranean cuisine is gut-friendly';
    }

    // Japanese is often good for sensitive stomachs
    if (cuisine.toLowerCase().includes('japanese')) {
      return 'Simple, clean Japanese flavors';
    }

    // Italian has many safe options
    if (cuisine.toLowerCase().includes('italian')) {
      return 'Many simple, familiar dishes';
    }

    // Check dietary restrictions
    if (dietaryRestrictions.includes('Gluten-free')) {
      if (['Mediterranean', 'American'].includes(cuisine)) {
        return 'Good gluten-free options';
      }
    }

    return null;
  }

  private getUserHealthConditions(): string[] {
    try {
      const saved = localStorage.getItem('gutwise-health-conditions');
      return saved ? JSON.parse(saved) : ['IBS', 'Lactose Intolerance'];
    } catch {
      return ['IBS', 'Lactose Intolerance'];
    }
  }

  private getUserDietaryRestrictions(): string[] {
    try {
      const saved = localStorage.getItem('gutwise-dietary-restrictions');
      return saved ? JSON.parse(saved) : ['Gluten-free', 'Low FODMAP'];
    } catch {
      return ['Gluten-free', 'Low FODMAP'];
    }
  }

  private analyzeDishSafety(
    dish: { name: string; ingredients: string[]; price: string },
    healthConditions: string[],
    dietaryRestrictions: string[]
  ): { safetyScore: number; reasons: string[] } {
    let safetyScore = 85; // Start with high score
    const reasons: string[] = [];
    const triggers: string[] = [];

    // Check dietary restrictions
    const ingredientsLower = dish.ingredients.map(i => i.toLowerCase());
    
    if (dietaryRestrictions.includes('Gluten-free')) {
      const glutenIngredients = ['flour', 'bread', 'pasta', 'wheat', 'barley', 'rye', 'croutons'];
      if (glutenIngredients.some(g => ingredientsLower.some(i => i.includes(g)))) {
        safetyScore -= 40;
        triggers.push('Contains gluten');
      } else {
        reasons.push('Gluten-free');
      }
    }

    if (dietaryRestrictions.includes('Dairy-free')) {
      const dairyIngredients = ['cheese', 'milk', 'butter', 'cream', 'yogurt', 'mozzarella', 'parmesan'];
      if (dairyIngredients.some(d => ingredientsLower.some(i => i.includes(d)))) {
        safetyScore -= 40;
        triggers.push('Contains dairy');
      } else {
        reasons.push('Dairy-free');
      }
    }

    if (dietaryRestrictions.includes('Low FODMAP')) {
      const highFodmapIngredients = ['onion', 'garlic', 'beans', 'peas', 'apple', 'honey'];
      if (highFodmapIngredients.some(f => ingredientsLower.some(i => i.includes(f)))) {
        safetyScore -= 15;
        triggers.push('High FODMAP ingredients');
      }
    }

    // Check health conditions
    if (healthConditions.includes('IBS')) {
      const ibsTriggers = ['spicy', 'chili', 'pepper', 'onion', 'garlic', 'beans'];
      if (ibsTriggers.some(t => ingredientsLower.some(i => i.includes(t)))) {
        safetyScore -= 20;
        triggers.push('May trigger IBS');
      }
    }

    if (healthConditions.includes('GERD') || healthConditions.includes('Gastroesophageal Reflux Disease')) {
      const gerdTriggers = ['tomato', 'citrus', 'lemon', 'lime', 'vinegar', 'wine', 'spicy'];
      if (gerdTriggers.some(t => ingredientsLower.some(i => i.includes(t)))) {
        safetyScore -= 15;
        triggers.push('May trigger GERD');
      }
    }

    if (healthConditions.includes('Lactose Intolerance')) {
      const lactoseIngredients = ['milk', 'cheese', 'cream', 'butter', 'yogurt'];
      if (lactoseIngredients.some(l => ingredientsLower.some(i => i.includes(l)))) {
        safetyScore -= 30;
        triggers.push('Contains lactose');
      }
    }

    // Add positive reasons for safe ingredients
    const safeIngredients = ['chicken', 'fish', 'rice', 'vegetables', 'herbs', 'olive oil'];
    if (safeIngredients.some(s => ingredientsLower.some(i => i.includes(s)))) {
      if (ingredientsLower.some(i => i.includes('chicken') || i.includes('fish'))) {
        reasons.push('Lean protein');
      }
      if (ingredientsLower.some(i => i.includes('vegetables') || i.includes('herbs'))) {
        reasons.push('Fresh ingredients');
      }
    }

    // Ensure score stays within bounds
    safetyScore = Math.max(10, Math.min(100, safetyScore));

    return {
      safetyScore: Math.round(safetyScore),
      reasons: triggers.length > 0 ? triggers : reasons.slice(0, 3)
    };
  }

  private getFallbackSuggestion(): RestaurantSafetyAnalysis {
    // Fallback to the first restaurant with some safe defaults
    const baseRestaurant = SmartRestaurantSuggestionService.MOCK_RESTAURANTS[0];
    
    const enhancedRestaurant = {
      ...baseRestaurant,
      image: this.generateRestaurantImage(baseRestaurant.cuisine),
      rating: 4.5,
      safeOptions: 3,
      riskOptions: 2,
      categories: [baseRestaurant.cuisine.toLowerCase()],
      position: { lat: 40.7579336, lon: -74.0244151 },
      priceLevel: '$',
      hours: '11:00 AM - 10:00 PM',
      phone: '(555) 123-4567',
      features: ['Gluten-free options', 'Vegan friendly'],
      compatibility: 75
    };
    
    return {
      restaurant: enhancedRestaurant,
      safetyScore: 75,
      safeDishCount: 3,
      totalDishCount: 5,
      riskLevel: 'medium',
      topSafeDishes: [
        { name: 'Margherita Pizza', safetyScore: 82, reasons: ['Simple ingredients', 'No common triggers'] },
        { name: 'Grilled Chicken Breast', safetyScore: 85, reasons: ['Lean protein', 'Minimal processing'] },
        { name: 'Caesar Salad', safetyScore: 78, reasons: ['Fresh vegetables', 'Light dressing option'] }
      ],
      reasons: ['3 safe dishes available', 'Italian cuisine is familiar', 'Very close to your location']
    };
  }

  private generateRestaurantImage(cuisine: string): string {
    // Map cuisine types to actual working Unsplash images
    const cuisineImages: Record<string, string> = {
      italian: 'https://images.unsplash.com/photo-1715607873797-a173a95fd47c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpdGFsaWFuJTIwcmVzdGF1cmFudCUyMGZvb2R8ZW58MXx8fHwxNzU3NTI5OTQwfDA&ixlib=rb-4.1.0&q=80&w=400',
      american: 'https://images.unsplash.com/photo-1572294888157-e750af07dbd3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhbWVyaWNhbiUyMHJlc3RhdXJhbnQlMjBmb29kfGVufDF8fHx8MTc1NzYzMDk3Mnww&ixlib=rb-4.1.0&q=80&w=400',
      thai: 'https://images.unsplash.com/photo-1665199020996-66cfdf8cba00?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0aGFpJTIwcmVzdGF1cmFudCUyMGZvb2R8ZW58MXx8fHwxNzU3NjMwOTkxfDA&ixlib=rb-4.1.0&q=80&w=400',
      mediterranean: 'https://images.unsplash.com/photo-1705648341120-666923f8b675?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtZWRpdGVycmFuZWFuJTIwcmVzdGF1cmFudCUyMGZvb2R8ZW58MXx8fHwxNzU3NjMwOTgxfDA&ixlib=rb-4.1.0&q=80&w=400',
      japanese: 'https://images.unsplash.com/photo-1717988732486-285ea23a6f88?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxqYXBhbmVzZSUyMHJlc3RhdXJhbnQlMjBzdXNoaXxlbnwxfHx8fDE3NTc2MzA5ODR8MA&ixlib=rb-4.1.0&q=80&w=400'
    };

    // Default fallback image for unmatched cuisines
    const defaultImage = 'https://images.unsplash.com/photo-1667388968964-4aa652df0a9b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyZXN0YXVyYW50JTIwZm9vZCUyMGRpbmluZ3xlbnwxfHx8fDE3NTc1ODE5MTN8MA&ixlib=rb-4.1.0&q=80&w=400';

    // Return the matching image or default
    return cuisineImages[cuisine.toLowerCase()] || defaultImage;
  }
}

export const smartRestaurantSuggestionService = new SmartRestaurantSuggestionService();