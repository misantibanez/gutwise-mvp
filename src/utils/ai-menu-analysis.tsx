// Mock AI menu analysis service to simulate Azure OpenAI
import { MenuDish, Restaurant, mockMenus } from './mock-data';

export interface MenuAnalysisResult {
  dishes: MenuDish[];
  overallSafety: number;
  totalDishes: number;
  safeRecommendations: string[];
  warnings: string[];
  processingTime: number;
}

export interface AIAnalysisOptions {
  userConditions?: string[];
  dietaryRestrictions?: string[];
  previousReactions?: string[];
  preferredCuisines?: string[];
}

class MockAIMenuAnalyzer {
  // Simulate Azure OpenAI menu analysis
  async analyzeMenu(
    menuText: string, 
    restaurant: Restaurant,
    options: AIAnalysisOptions = {}
  ): Promise<MenuAnalysisResult> {
    const startTime = Date.now();
    
    // Simulate AI processing time (2-4 seconds)
    const processingTime = 2000 + Math.random() * 2000;
    await new Promise(resolve => setTimeout(resolve, processingTime));

    // Get mock menu data for this restaurant
    const dishes = mockMenus[restaurant.id] || this.generateMockDishes(menuText);
    
    // Apply user preferences and conditions to analysis
    const analyzedDishes = this.applyUserPreferences(dishes, options);
    
    // Calculate overall safety score
    const overallSafety = this.calculateOverallSafety(analyzedDishes);
    
    // Generate recommendations and warnings
    const { recommendations, warnings } = this.generateInsights(analyzedDishes, options);

    return {
      dishes: analyzedDishes,
      overallSafety,
      totalDishes: analyzedDishes.length,
      safeRecommendations: recommendations,
      warnings,
      processingTime: Date.now() - startTime
    };
  }

  // Simulate analyzing a specific dish
  async analyzeDish(
    dishName: string, 
    description: string,
    options: AIAnalysisOptions = {}
  ): Promise<MenuDish> {
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Generate mock analysis for the dish
    const ingredients = this.extractIngredients(description);
    const allergens = this.detectAllergens(ingredients);
    const safetyScore = this.calculateDishSafety(ingredients, allergens, options);
    
    return {
      id: `dish-${Date.now()}`,
      name: dishName,
      description,
      price: '$' + (Math.floor(Math.random() * 25) + 10),
      category: this.categorizedish(dishName, description),
      safety_score: safetyScore,
      ingredients,
      allergens,
      dietary_tags: this.detectDietaryTags(ingredients),
      ai_analysis: {
        risk_level: safetyScore >= 80 ? 'low' : safetyScore >= 60 ? 'medium' : 'high',
        trigger_ingredients: this.identifyTriggers(ingredients, options),
        safe_for_conditions: this.checkConditionCompatibility(ingredients, options),
        confidence_score: 0.85 + Math.random() * 0.15
      }
    };
  }

  // Simulate real-time menu updates
  async getMenuUpdates(restaurantId: string): Promise<MenuDish[]> {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Return updated mock menu
    return mockMenus[restaurantId] || [];
  }

  // Private helper methods
  private generateMockDishes(menuText: string): MenuDish[] {
    // Simulate extracting dishes from menu text
    const dishNames = [
      'Grilled Salmon', 'Caesar Salad', 'Margherita Pizza', 
      'Chicken Alfredo', 'Quinoa Bowl', 'Fish Tacos'
    ];
    
    return dishNames.map((name, index) => ({
      id: `generated-dish-${index}`,
      name,
      description: `Delicious ${name.toLowerCase()} prepared with fresh ingredients`,
      price: '$' + (Math.floor(Math.random() * 20) + 12),
      category: this.categorizeGeneric(name),
      safety_score: Math.floor(Math.random() * 40) + 60,
      ingredients: this.generateIngredients(name),
      allergens: [],
      dietary_tags: [],
      ai_analysis: {
        risk_level: 'medium',
        trigger_ingredients: [],
        safe_for_conditions: [],
        confidence_score: 0.75
      }
    }));
  }

  private applyUserPreferences(dishes: MenuDish[], options: AIAnalysisOptions): MenuDish[] {
    return dishes.map(dish => {
      let adjustedSafety = dish.safety_score;
      
      // Adjust safety based on user conditions
      if (options.userConditions?.includes('lactose_intolerant') && 
          dish.allergens.includes('dairy')) {
        adjustedSafety -= 30;
      }
      
      if (options.userConditions?.includes('gluten_sensitive') && 
          dish.allergens.includes('gluten')) {
        adjustedSafety -= 25;
      }
      
      // Boost safety for preferred cuisines
      if (options.preferredCuisines?.some(cuisine => 
          dish.category.toLowerCase().includes(cuisine.toLowerCase()))) {
        adjustedSafety += 10;
      }

      return {
        ...dish,
        safety_score: Math.max(0, Math.min(100, adjustedSafety))
      };
    });
  }

  private calculateOverallSafety(dishes: MenuDish[]): number {
    if (dishes.length === 0) return 0;
    
    const totalSafety = dishes.reduce((sum, dish) => sum + dish.safety_score, 0);
    return Math.round(totalSafety / dishes.length);
  }

  private generateInsights(dishes: MenuDish[], options: AIAnalysisOptions) {
    const safeDishes = dishes.filter(d => d.safety_score >= 80);
    const riskyDishes = dishes.filter(d => d.safety_score < 60);
    
    const recommendations = [
      `${safeDishes.length} dishes are highly recommended for you`,
      'Mediterranean and grilled options tend to be safest',
      'Consider asking about ingredient modifications'
    ];
    
    const warnings = [];
    if (riskyDishes.length > 0) {
      warnings.push(`${riskyDishes.length} dishes may cause digestive issues`);
    }
    if (options.userConditions?.includes('lactose_intolerant')) {
      warnings.push('Several dishes contain dairy - ask about dairy-free options');
    }
    
    return { recommendations, warnings };
  }

  private extractIngredients(description: string): string[] {
    // Simulate ingredient extraction from description
    const commonIngredients = [
      'tomato', 'cheese', 'chicken', 'pasta', 'olive oil', 
      'garlic', 'onion', 'herbs', 'lettuce', 'salmon'
    ];
    
    return commonIngredients.filter(() => Math.random() > 0.6);
  }

  private detectAllergens(ingredients: string[]): string[] {
    const allergenMap: Record<string, string> = {
      'cheese': 'dairy',
      'milk': 'dairy',
      'pasta': 'gluten',
      'bread': 'gluten',
      'salmon': 'fish',
      'nuts': 'tree nuts'
    };
    
    return ingredients
      .map(ingredient => allergenMap[ingredient])
      .filter(allergen => allergen);
  }

  private calculateDishSafety(
    ingredients: string[], 
    allergens: string[], 
    options: AIAnalysisOptions
  ): number {
    let score = 85; // Base score
    
    // Reduce score for allergens
    score -= allergens.length * 15;
    
    // Reduce score for trigger ingredients
    if (options.previousReactions?.some(reaction => 
        ingredients.some(ing => ing.includes(reaction)))) {
      score -= 25;
    }
    
    return Math.max(20, Math.min(100, score));
  }

  private detectDietaryTags(ingredients: string[]): string[] {
    const tags = [];
    
    if (!ingredients.some(ing => ['meat', 'chicken', 'beef', 'fish'].includes(ing))) {
      tags.push('vegetarian');
    }
    
    if (!ingredients.some(ing => ['cheese', 'milk', 'dairy'].includes(ing))) {
      tags.push('dairy-free');
    }
    
    return tags;
  }

  private categorizedish(name: string, description: string): string {
    const lower = `${name} ${description}`.toLowerCase();
    
    if (lower.includes('pizza')) return 'Pizza';
    if (lower.includes('salad')) return 'Salads';
    if (lower.includes('pasta')) return 'Pasta';
    if (lower.includes('fish') || lower.includes('salmon')) return 'Seafood';
    if (lower.includes('chicken') || lower.includes('meat')) return 'Main Courses';
    
    return 'Entrees';
  }

  private categorizeGeneric(name: string): string {
    if (name.toLowerCase().includes('salad')) return 'Salads';
    if (name.toLowerCase().includes('pizza')) return 'Pizza';
    return 'Main Courses';
  }

  private generateIngredients(dishName: string): string[] {
    const ingredientSets: Record<string, string[]> = {
      'salmon': ['salmon', 'lemon', 'herbs', 'olive oil'],
      'salad': ['lettuce', 'tomato', 'cucumber', 'dressing'],
      'pizza': ['dough', 'tomato sauce', 'cheese', 'basil'],
      'chicken': ['chicken', 'herbs', 'garlic', 'olive oil'],
      'quinoa': ['quinoa', 'vegetables', 'herbs', 'tahini'],
      'tacos': ['fish', 'tortilla', 'cabbage', 'lime']
    };
    
    const key = Object.keys(ingredientSets).find(k => 
      dishName.toLowerCase().includes(k)
    );
    
    return key ? ingredientSets[key] : ['mixed ingredients'];
  }

  private identifyTriggers(ingredients: string[], options: AIAnalysisOptions): string[] {
    const triggers = [];
    
    if (options.previousReactions?.includes('dairy') && 
        ingredients.includes('cheese')) {
      triggers.push('dairy');
    }
    
    return triggers;
  }

  private checkConditionCompatibility(ingredients: string[], options: AIAnalysisOptions): string[] {
    const compatible = [];
    
    if (options.dietaryRestrictions?.includes('vegetarian') && 
        !ingredients.some(ing => ['meat', 'fish'].includes(ing))) {
      compatible.push('vegetarian');
    }
    
    return compatible;
  }
}

export const aiMenuAnalyzer = new MockAIMenuAnalyzer();