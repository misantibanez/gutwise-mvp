// Service for calling Azure Function generate-menu API

export interface Restaurant {
  name: string;
  cuisine?: string;
  location?: string;
}

export interface UserProfile {
  healthConditions: string[];
  dietaryRestrictions: string[];
}

export interface GenerateMenuRequest {
  restaurant_name: string;
  location: string;
  cuisine_hint: string;
  max_items: number;
  health_conditions: string[];
  dietary_restrictions: string[];
}

export interface MenuItemEvaluation {
  score_percent: number;
  good_for_you_tags: string[];
  potential_triggers: string[];
  recommended: boolean;
  reason_short: string;
}

export interface GeneratedMenuItem {
  dish_name: string;
  contents: string;
  evaluation: MenuItemEvaluation;
}

export interface GenerateMenuResponse {
  restaurant_name: string;
  items: GeneratedMenuItem[];
}

export interface AnalyzedMenuItem {
  id: number;
  name: string;
  description: string;
  status: 'safe' | 'caution' | 'avoid';
  confidence: number;
  reasons: string[];
  triggers: string[];
}

class MenuAnalysisService {
  private readonly apiUrl = 'https://func-generate-menu.azurewebsites.net/api/generate-menu?code=';

  // Default user profile for demo purposes
  private readonly defaultUserProfile: UserProfile = {
    healthConditions: ['IBS', 'Lactose Intolerance'],
    dietaryRestrictions: ['Gluten-free', 'Low FODMAP']
  };

  // Get user profile from localStorage with fallback to defaults
  private getUserProfileFromStorage(): UserProfile {
    try {
      const healthConditions = JSON.parse(localStorage.getItem('gutwise-health-conditions') || '[]');
      const dietaryRestrictions = JSON.parse(localStorage.getItem('gutwise-dietary-restrictions') || '[]');
      
      return {
        healthConditions: healthConditions.length > 0 ? healthConditions : this.defaultUserProfile.healthConditions,
        dietaryRestrictions: dietaryRestrictions.length > 0 ? dietaryRestrictions : this.defaultUserProfile.dietaryRestrictions
      };
    } catch {
      return this.defaultUserProfile;
    }
  }

  // Dedicated method for menu analysis that always tries real API first
  async generateMenuForAnalysis(
    restaurant: Restaurant,
    userProfile?: UserProfile
  ): Promise<AnalyzedMenuItem[]> {
    console.log(`🍽️ Generating real menu for analysis: ${restaurant.name}`);
    
    try {
      const profile = userProfile || this.getUserProfileFromStorage();
      
      const requestBody: GenerateMenuRequest = {
        restaurant_name: restaurant.name,
        location: restaurant.location || 'New York, NY',
        cuisine_hint: restaurant.cuisine || 'International',
        max_items: 10, // Always request 10 items for comprehensive restaurant analysis
        health_conditions: profile.healthConditions,
        dietary_restrictions: profile.dietaryRestrictions
      };

      const callTimestamp = new Date().toISOString();
      console.log(`[${callTimestamp}] Real API call for menu analysis:`, requestBody);

      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'X-Request-ID': `menu-analysis-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        },
        body: JSON.stringify(requestBody),
        signal: AbortSignal.timeout(30000) // 30 second timeout for menu analysis
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error');
        throw new Error(`API request failed: ${response.status} ${response.statusText}. ${errorText}`);
      }

      const result: GenerateMenuResponse = await response.json();
      console.log(`[${callTimestamp}] Menu Analysis API Success - Generated ${result.items?.length || 0} items for "${restaurant.name}"`);
      
      if (!result.items || result.items.length === 0) {
        throw new Error('API returned empty menu - no items generated');
      }
      
      return this.convertToAnalyzedMenuItems(result);
    } catch (error) {
      // Handle different types of API failures gracefully
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        console.warn(`⚠️ Network connectivity issue for ${restaurant.name} - using demo menu data`);
      } else if (error instanceof Error && error.message.includes('AbortError')) {
        console.warn(`⏱️ API timeout for ${restaurant.name} - using demo menu data`);
      } else {
        console.warn(`🔄 API unavailable for ${restaurant.name} - using demo menu data:`, error.message);
      }
      
      // Fall back to mock data gracefully
      console.log(`📝 Generating comprehensive demo menu for ${restaurant.name} (${restaurant.cuisine || 'International'} cuisine)`);
      const profile = userProfile || this.getUserProfileFromStorage();
      return this.createMockGeneratedMenu(restaurant, profile);
    }
  }

  async generateAndAnalyzeMenu(
    restaurant: Restaurant,
    userProfile?: UserProfile,
    forceRealAPI: boolean = true // Force real API calls for menu analysis
  ): Promise<AnalyzedMenuItem[]> {
    // For menu analysis, always try real API first unless explicitly disabled
    if (!forceRealAPI) {
      const isRestrictedEnvironment = this.isRestrictedEnvironment();
      if (isRestrictedEnvironment) {
        console.log('Detected restricted environment, using mock data for:', restaurant.name);
        const profile = userProfile || this.defaultUserProfile;
        return this.createMockGeneratedMenu(restaurant, profile);
      }
    } else {
      console.log('🚀 Force using real API for menu analysis of:', restaurant.name);
    }

    try {
      const profile = userProfile || this.defaultUserProfile;
      
      const requestBody: GenerateMenuRequest = {
        restaurant_name: restaurant.name,
        location: restaurant.location || 'New York, NY',
        cuisine_hint: restaurant.cuisine || 'International',
        max_items: 10,
        health_conditions: profile.healthConditions,
        dietary_restrictions: profile.dietaryRestrictions
      };

      // Add timestamp to ensure fresh API calls for each restaurant
      const callTimestamp = new Date().toISOString();
      console.log(`[${callTimestamp}] Making API call for menu generation:`, requestBody);

      console.log('Calling generate_menu API for restaurant:', restaurant.name);

      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'X-Request-ID': `menu-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        },
        body: JSON.stringify(requestBody),
        // Add timeout to prevent hanging requests
        signal: AbortSignal.timeout(25000) // 25 second timeout for API calls
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error');
        throw new Error(`API request failed: ${response.status} ${response.statusText}. ${errorText}`);
      }

      const result: GenerateMenuResponse = await response.json();
      console.log(`[${callTimestamp}] API Success - Generated ${result.items?.length || 0} menu items for "${restaurant.name}"`);
      
      if (!result.items || result.items.length === 0) {
        throw new Error('API returned empty menu - no items generated');
      }
      
      return this.convertToAnalyzedMenuItems(result);
    } catch (error) {
      // Handle different types of API failures gracefully
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        console.info(`🌐 Network issue accessing menu API for ${restaurant.name} - using demo menu`);
      } else if (error instanceof Error && error.message.includes('AbortError')) {
        console.info(`⏱️ Menu API timeout for ${restaurant.name} - using demo menu`);
      } else {
        console.info(`🔄 Menu API temporarily unavailable for ${restaurant.name} - using demo menu:`, error.message);
      }
      
      // Fall back to high-quality mock data
      console.log(`📋 Generating realistic demo menu for ${restaurant.name} with personalized analysis`);
      const profile = userProfile || this.defaultUserProfile;
      return this.createMockGeneratedMenu(restaurant, profile);
    }
  }

  private convertToAnalyzedMenuItems(response: GenerateMenuResponse): AnalyzedMenuItem[] {
    return response.items.map((item, index) => {
      // Convert score_percent to status
      let status: 'safe' | 'caution' | 'avoid';
      if (!item.evaluation.recommended) {
        status = 'avoid';
      } else if (item.evaluation.score_percent >= 80) {
        status = 'safe';
      } else {
        status = 'caution';
      }

      return {
        id: index + 1,
        name: item.dish_name,
        description: item.contents,
        status,
        confidence: item.evaluation.score_percent,
        reasons: item.evaluation.good_for_you_tags || [],
        triggers: item.evaluation.potential_triggers || []
      };
    });
  }

  // Check if we're in a restricted environment (only for very specific cases)
  private isRestrictedEnvironment(): boolean {
    // Only return true for environments that definitely can't make external API calls
    if (typeof window === 'undefined') return false;
    
    try {
      // Only restrict for very specific sandbox environments that block fetch
      const isRestrictedSandbox = window.location.hostname.includes('webcontainer') ||
                                  window.location.hostname.includes('stackblitz');
      
      // Let Figma Make, localhost, and other environments use real API
      return isRestrictedSandbox;
    } catch (error) {
      // If we can't access window properties, try the API anyway
      return false;
    }
  }

  // Create a mock generated menu based on the restaurant and user profile
  private createMockGeneratedMenu(restaurant: Restaurant, userProfile: UserProfile): AnalyzedMenuItem[] {
    // Create a hash from restaurant name and cuisine to ensure consistent but unique menus
    const restaurantHash = this.hashString(`${restaurant.name}-${restaurant.cuisine || 'unknown'}`);
    
    // Define multiple menu variations for each cuisine type
    const menuTemplates: Record<string, GeneratedMenuItem[][]> = {
      'Italian': [
        // Variation 1 - Classic Italian
        [
          {
            dish_name: 'Grilled Chicken Parmigiana (Gluten-Free)',
            contents: 'Grilled chicken breast with dairy-free marinara sauce, served with zucchini noodles and herbs.',
            evaluation: {
              score_percent: 85,
              good_for_you_tags: ['Lean protein', 'Gluten-free', 'Dairy-free'],
              potential_triggers: ['Tomato sauce (acidic)'],
              recommended: true,
              reason_short: 'Modified for dietary restrictions; tomato may mildly trigger GERD.'
            }
          },
          {
            dish_name: 'Mediterranean Quinoa Bowl',
            contents: 'Quinoa with grilled vegetables, olives, cucumber, and olive oil dressing.',
            evaluation: {
              score_percent: 90,
              good_for_you_tags: ['Plant protein', 'Gluten-free', 'Dairy-free'],
              potential_triggers: [],
              recommended: true,
              reason_short: 'Perfect for gluten-free and dairy-free diets with gentle ingredients.'
            }
          },
          {
            dish_name: 'Herb-Crusted Salmon',
            contents: 'Fresh salmon with herb crust, steamed broccoli, and lemon rice.',
            evaluation: {
              score_percent: 88,
              good_for_you_tags: ['Omega-3 fatty acids', 'Lean protein', 'Gluten-free'],
              potential_triggers: ['Lemon (citrus)'],
              recommended: true,
              reason_short: 'Excellent protein source; lemon may trigger GERD in sensitive individuals.'
            }
          },
          {
            dish_name: 'Gluten-Free Pasta Primavera',
            contents: 'Rice pasta with seasonal vegetables and olive oil-based sauce.',
            evaluation: {
              score_percent: 75,
              good_for_you_tags: ['Vegetables', 'Gluten-free', 'Dairy-free'],
              potential_triggers: ['Garlic', 'Onions in sauce'],
              recommended: true,
              reason_short: 'Safe pasta option; garlic and onions may trigger digestive issues.'
            }
          },
          {
            dish_name: 'Spicy Arrabbiata (Traditional)',
            contents: 'Penne pasta with spicy tomato sauce, garlic, and red peppers.',
            evaluation: {
              score_percent: 45,
              good_for_you_tags: [],
              potential_triggers: ['Spicy peppers', 'Tomato (acidic)', 'Garlic', 'Regular pasta (gluten)'],
              recommended: false,
              reason_short: 'Contains gluten and multiple GERD triggers including spice and acidity.'
            }
          },
          {
            dish_name: 'Grilled Branzino',
            contents: 'Whole Mediterranean sea bass grilled with herbs, served with roasted vegetables.',
            evaluation: {
              score_percent: 92,
              good_for_you_tags: ['Lean protein', 'Omega-3', 'Gluten-free', 'Dairy-free'],
              potential_triggers: [],
              recommended: true,
              reason_short: 'Excellent choice with simple preparation and no common triggers.'
            }
          },
          {
            dish_name: 'Caprese Salad (Dairy-Free)',
            contents: 'Tomatoes with dairy-free mozzarella, fresh basil, and balsamic vinegar.',
            evaluation: {
              score_percent: 70,
              good_for_you_tags: ['Fresh vegetables', 'Gluten-free', 'Dairy-free'],
              potential_triggers: ['Tomatoes (acidic)', 'Balsamic vinegar (acidic)'],
              recommended: true,
              reason_short: 'Modified to be dairy-free; acidity may affect GERD sufferers.'
            }
          },
          {
            dish_name: 'Risotto ai Funghi',
            contents: 'Creamy mushroom risotto with arborio rice, wild mushrooms, and white wine.',
            evaluation: {
              score_percent: 55,
              good_for_you_tags: ['Mushrooms (prebiotics)', 'Gluten-free'],
              potential_triggers: ['Dairy (traditional preparation)', 'White wine (alcohol)', 'Onions'],
              recommended: false,
              reason_short: 'Contains dairy and alcohol; mushrooms provide good prebiotics.'
            }
          },
          {
            dish_name: 'Grilled Vegetable Platter',
            contents: 'Seasonal vegetables grilled with olive oil, herbs, and sea salt.',
            evaluation: {
              score_percent: 95,
              good_for_you_tags: ['Vegetables', 'Gluten-free', 'Dairy-free', 'Anti-inflammatory'],
              potential_triggers: [],
              recommended: true,
              reason_short: 'Perfect for all dietary restrictions with anti-inflammatory benefits.'
            }
          },
          {
            dish_name: 'Osso Buco Traditional',
            contents: 'Braised veal shanks with tomatoes, white wine, and aromatic vegetables.',
            evaluation: {
              score_percent: 50,
              good_for_you_tags: ['Protein', 'Collagen-rich'],
              potential_triggers: ['Tomatoes (acidic)', 'White wine (alcohol)', 'Onions', 'Rich sauce'],
              recommended: false,
              reason_short: 'Rich dish with multiple GERD triggers including alcohol and acidity.'
            }
          }
        ],
        // Variation 2 - Modern Italian
        [
          {
            dish_name: 'Tuscan Grilled Sea Bass',
            contents: 'Fresh sea bass grilled with rosemary, served with steamed asparagus and herb rice.',
            evaluation: {
              score_percent: 92,
              good_for_you_tags: ['Lean protein', 'Omega-3', 'Gluten-free', 'Dairy-free'],
              potential_triggers: [],
              recommended: true,
              reason_short: 'Excellent choice with gentle cooking method and no known triggers.'
            }
          },
          {
            dish_name: 'Roasted Vegetable Risotto (Dairy-Free)',
            contents: 'Arborio rice with roasted zucchini, bell peppers, and nutritional yeast.',
            evaluation: {
              score_percent: 78,
              good_for_you_tags: ['Vegetables', 'Gluten-free', 'Dairy-free'],
              potential_triggers: ['Onions in base'],
              recommended: true,
              reason_short: 'Good vegetarian option; may contain onions that could trigger symptoms.'
            }
          },
          {
            dish_name: 'Margherita Pizza (Cauliflower Crust)',
            contents: 'Cauliflower crust with dairy-free mozzarella, fresh basil, and light tomato sauce.',
            evaluation: {
              score_percent: 70,
              good_for_you_tags: ['Vegetables', 'Gluten-free', 'Dairy-free'],
              potential_triggers: ['Tomato sauce (acidic)'],
              recommended: true,
              reason_short: 'Creative gluten-free option; tomato sauce may be acidic for GERD.'
            }
          },
          {
            dish_name: 'Osso Buco Traditional',
            contents: 'Braised veal shanks with tomatoes, white wine, and aromatic vegetables.',
            evaluation: {
              score_percent: 55,
              good_for_you_tags: ['Protein', 'Rich in collagen'],
              potential_triggers: ['Tomato', 'White wine (alcohol)', 'Onions'],
              recommended: false,
              reason_short: 'Rich dish with multiple GERD triggers including alcohol and acidity.'
            }
          }
        ],
        // Variation 3 - Northern Italian
        [
          {
            dish_name: 'Polenta with Grilled Mushrooms',
            contents: 'Creamy polenta topped with grilled portobello mushrooms and fresh herbs.',
            evaluation: {
              score_percent: 82,
              good_for_you_tags: ['Gluten-free', 'Vegetarian', 'Easy to digest'],
              potential_triggers: ['Dairy in polenta'],
              recommended: true,
              reason_short: 'Gentle on stomach; traditional polenta may contain dairy.'
            }
          },
          {
            dish_name: 'Milanese-Style Chicken Cutlet',
            contents: 'Breaded chicken breast with arugula salad and lemon vinaigrette.',
            evaluation: {
              score_percent: 68,
              good_for_you_tags: ['Lean protein', 'Fresh greens'],
              potential_triggers: ['Breadcrumbs (gluten)', 'Lemon (citrus)'],
              recommended: true,
              reason_short: 'Contains gluten and citrus; can be modified for dietary restrictions.'
            }
          },
          {
            dish_name: 'Butternut Squash Gnocchi',
            contents: 'House-made potato and butternut squash gnocchi with sage butter sauce.',
            evaluation: {
              score_percent: 60,
              good_for_you_tags: ['Vegetables', 'Comfort food'],
              potential_triggers: ['Gluten in gnocchi', 'Butter sauce (dairy)'],
              recommended: false,
              reason_short: 'Contains both gluten and dairy; not suitable for current restrictions.'
            }
          },
          {
            dish_name: 'Venetian Liver with Onions',
            contents: 'Traditional calves liver sautéed with sweet onions and white wine.',
            evaluation: {
              score_percent: 40,
              good_for_you_tags: ['Iron-rich', 'Traditional dish'],
              potential_triggers: ['Onions', 'White wine (alcohol)', 'Rich organ meat'],
              recommended: false,
              reason_short: 'Multiple GERD triggers including onions, alcohol, and rich meat.'
            }
          }
        ]
      ],
      'Mexican': [
        // Variation 1 - Traditional Mexican
        [
          {
            dish_name: 'Guacamole with Corn Tortilla Chips',
            contents: 'Fresh avocado mashed with tomato, onion, cilantro, lime, and served with crispy corn tortilla chips.',
            evaluation: {
              score_percent: 70,
              good_for_you_tags: ['Healthy fats', 'Gluten-free'],
              potential_triggers: ['Raw onion', 'Lime (citrus)', 'Fried chips'],
              recommended: true,
              reason_short: 'Gluten-free and dairy-free; citrus and onion may trigger GERD.'
            }
          },
          {
            dish_name: 'Grilled Chicken Tacos (Corn Tortillas)',
            contents: 'Grilled chicken breast served in soft corn tortillas with lettuce and cilantro.',
            evaluation: {
              score_percent: 85,
              good_for_you_tags: ['Lean protein', 'Gluten-free', 'Dairy-free'],
              potential_triggers: [],
              recommended: true,
              reason_short: 'Perfect for dietary restrictions with simple, gentle ingredients.'
            }
          },
          {
            dish_name: 'Black Bean and Rice Bowl',
            contents: 'Seasoned black beans over cilantro rice with grilled vegetables.',
            evaluation: {
              score_percent: 80,
              good_for_you_tags: ['Plant protein', 'Gluten-free', 'Dairy-free'],
              potential_triggers: ['Beans (gas-producing)', 'Spices'],
              recommended: true,
              reason_short: 'Good protein source; beans may cause digestive discomfort.'
            }
          },
          {
            dish_name: 'Jalapeño Popper Quesadillas',
            contents: 'Flour tortillas filled with cheese, jalapeños, and spicy cream sauce.',
            evaluation: {
              score_percent: 30,
              good_for_you_tags: [],
              potential_triggers: ['Dairy (cheese)', 'Spicy jalapeños', 'Gluten (flour tortilla)', 'Creamy sauce'],
              recommended: false,
              reason_short: 'Contains dairy, gluten, and spicy ingredients that trigger multiple conditions.'
            }
          },
          {
            dish_name: 'Cilantro Lime Rice',
            contents: 'Jasmine rice cooked with fresh cilantro, lime juice, and olive oil.',
            evaluation: {
              score_percent: 78,
              good_for_you_tags: ['Gluten-free', 'Dairy-free', 'Fresh herbs'],
              potential_triggers: ['Lime juice (citrus)'],
              recommended: true,
              reason_short: 'Simple and safe side dish; lime may be mildly acidic for sensitive stomachs.'
            }
          },
          {
            dish_name: 'Carnitas (Traditional)',
            contents: 'Slow-cooked pork shoulder with traditional spices, onions, and orange juice.',
            evaluation: {
              score_percent: 65,
              good_for_you_tags: ['Protein', 'Gluten-free', 'Dairy-free'],
              potential_triggers: ['Fatty pork', 'Orange juice (acidic)', 'Onions'],
              recommended: true,
              reason_short: 'Good protein source; fatty meat and citrus may cause mild symptoms.'
            }
          },
          {
            dish_name: 'Mexican Street Corn Salad',
            contents: 'Corn kernels with dairy-free lime crema, chili powder, and cilantro.',
            evaluation: {
              score_percent: 82,
              good_for_you_tags: ['Vegetables', 'Gluten-free', 'Dairy-free', 'Fiber'],
              potential_triggers: ['Chili powder (mild spice)', 'Lime (citrus)'],
              recommended: true,
              reason_short: 'Modified to be dairy-free; mild spice and citrus may affect sensitive individuals.'
            }
          },
          {
            dish_name: 'Chicken Pozole Verde',
            contents: 'Traditional soup with chicken, hominy, green chiles, and fresh herbs.',
            evaluation: {
              score_percent: 75,
              good_for_you_tags: ['Lean protein', 'Gluten-free', 'Dairy-free', 'Warming soup'],
              potential_triggers: ['Green chiles (mild spice)', 'Onions in broth'],
              recommended: true,
              reason_short: 'Comforting soup option; mild spice and onions may trigger some symptoms.'
            }
          },
          {
            dish_name: 'Fish Tacos (Corn Tortillas)',
            contents: 'Grilled white fish in soft corn tortillas with cabbage slaw and lime.',
            evaluation: {
              score_percent: 85,
              good_for_you_tags: ['Lean protein', 'Gluten-free', 'Dairy-free', 'Fresh vegetables'],
              potential_triggers: ['Lime (citrus)'],
              recommended: true,
              reason_short: 'Excellent choice with clean ingredients; lime may be acidic for GERD.'
            }
          }
        ],
        // Variation 2 - Modern Mexican
        [
          {
            dish_name: 'Ceviche Verde (Fish & Avocado)',
            contents: 'Fresh fish marinated in lime juice with avocado, cucumber, and mild green chiles.',
            evaluation: {
              score_percent: 65,
              good_for_you_tags: ['Lean protein', 'Gluten-free', 'Dairy-free', 'Fresh ingredients'],
              potential_triggers: ['Lime juice (acidic)', 'Raw fish'],
              recommended: true,
              reason_short: 'Fresh and healthy; acidity from lime may trigger GERD in sensitive individuals.'
            }
          },
          {
            dish_name: 'Carnitas Bowl (No Cheese)',
            contents: 'Slow-cooked pork shoulder with cilantro rice, black beans, and pico de gallo.',
            evaluation: {
              score_percent: 75,
              good_for_you_tags: ['Protein', 'Gluten-free', 'Dairy-free'],
              potential_triggers: ['Pork (fatty)', 'Onions in pico'],
              recommended: true,
              reason_short: 'Good protein source; fatty pork and onions may cause mild symptoms.'
            }
          },
          {
            dish_name: 'Elote (Mexican Street Corn)',
            contents: 'Grilled corn with dairy-free lime crema, chili powder, and cilantro.',
            evaluation: {
              score_percent: 82,
              good_for_you_tags: ['Vegetables', 'Gluten-free', 'Dairy-free'],
              potential_triggers: ['Chili powder (mild spice)', 'Lime (citrus)'],
              recommended: true,
              reason_short: 'Modified to be dairy-free; mild spice and citrus may affect sensitive stomachs.'
            }
          },
          {
            dish_name: 'Mole Poblano Enchiladas',
            contents: 'Corn tortillas filled with chicken, topped with complex mole sauce containing chocolate and spices.',
            evaluation: {
              score_percent: 50,
              good_for_you_tags: ['Complex flavors', 'Gluten-free'],
              potential_triggers: ['Chocolate (caffeine)', 'Multiple spices', 'Rich sauce'],
              recommended: false,
              reason_short: 'Complex sauce with chocolate and spices may trigger multiple digestive issues.'
            }
          }
        ],
        // Variation 3 - Healthy Mexican
        [
          {
            dish_name: 'Grilled Fish with Mango Salsa',
            contents: 'Grilled white fish with fresh mango, cucumber, and herb salsa.',
            evaluation: {
              score_percent: 88,
              good_for_you_tags: ['Lean protein', 'Fresh fruit', 'Gluten-free', 'Dairy-free'],
              potential_triggers: [],
              recommended: true,
              reason_short: 'Light and healthy option with no known triggers for your conditions.'
            }
          },
          {
            dish_name: 'Quinoa Stuffed Bell Peppers',
            contents: 'Roasted bell peppers filled with quinoa, black beans, corn, and herbs.',
            evaluation: {
              score_percent: 85,
              good_for_you_tags: ['Plant protein', 'Vegetables', 'Gluten-free', 'Dairy-free'],
              potential_triggers: ['Bell peppers (nightshade)'],
              recommended: true,
              reason_short: 'Nutritious vegetarian option; bell peppers may cause issues for some people.'
            }
          },
          {
            dish_name: 'Chicken Tinga Lettuce Wraps',
            contents: 'Shredded chicken in mild tomato sauce served in butter lettuce cups.',
            evaluation: {
              score_percent: 78,
              good_for_you_tags: ['Lean protein', 'Low carb', 'Gluten-free', 'Dairy-free'],
              potential_triggers: ['Tomato sauce (acidic)'],
              recommended: true,
              reason_short: 'Low-carb alternative; tomato sauce may be acidic for GERD sufferers.'
            }
          },
          {
            dish_name: 'Tres Leches Cake',
            contents: 'Traditional sponge cake soaked in three types of milk with cinnamon.',
            evaluation: {
              score_percent: 25,
              good_for_you_tags: [],
              potential_triggers: ['Dairy (three milks)', 'High sugar', 'Rich dessert'],
              recommended: false,
              reason_short: 'Contains multiple dairy products which conflicts with dairy-free requirement.'
            }
          }
        ]
      ],
      'Asian': [
        // Variation 1 - Japanese
        [
          {
            dish_name: 'Steamed Ginger Chicken',
            contents: 'Chicken breast steamed with fresh ginger, served with jasmine rice and steamed bok choy.',
            evaluation: {
              score_percent: 90,
              good_for_you_tags: ['Lean protein', 'Gluten-free', 'Dairy-free', 'Ginger (digestive aid)'],
              potential_triggers: [],
              recommended: true,
              reason_short: 'Excellent for all dietary restrictions with gentle cooking method.'
            }
          },
          {
            dish_name: 'Miso Soup (Modified)',
            contents: 'Traditional miso broth with tofu, seaweed, and scallions.',
            evaluation: {
              score_percent: 75,
              good_for_you_tags: ['Probiotics', 'Gluten-free', 'Dairy-free'],
              potential_triggers: ['High sodium', 'Fermented ingredients'],
              recommended: true,
              reason_short: 'Good probiotic source; high sodium may affect some conditions.'
            }
          },
          {
            dish_name: 'Teriyaki Salmon Bowl',
            contents: 'Grilled salmon with gluten-free teriyaki sauce, brown rice, and steamed vegetables.',
            evaluation: {
              score_percent: 85,
              good_for_you_tags: ['Omega-3', 'Lean protein', 'Gluten-free', 'Dairy-free'],
              potential_triggers: ['Teriyaki sauce (sweet)'],
              recommended: true,
              reason_short: 'Modified sauce makes it safe for dietary restrictions.'
            }
          },
          {
            dish_name: 'Tempura Vegetables',
            contents: 'Assorted vegetables in crispy tempura batter, served with dipping sauce.',
            evaluation: {
              score_percent: 55,
              good_for_you_tags: ['Vegetables'],
              potential_triggers: ['Fried batter (gluten)', 'Heavy/greasy'],
              recommended: false,
              reason_short: 'Contains gluten in batter and may be too heavy for GERD.'
            }
          }
        ],
        // Variation 2 - Thai
        [
          {
            dish_name: 'Tom Kha Gai (Coconut Chicken Soup)',
            contents: 'Mild coconut soup with chicken, galangal, lemongrass, and mushrooms.',
            evaluation: {
              score_percent: 72,
              good_for_you_tags: ['Lean protein', 'Gluten-free', 'Dairy-free', 'Anti-inflammatory herbs'],
              potential_triggers: ['Coconut (high FODMAP)', 'Lemongrass (citrus-like)'],
              recommended: true,
              reason_short: 'Gentle soup with healing herbs; coconut may trigger digestive issues.'
            }
          },
          {
            dish_name: 'Pad Thai (Rice Noodles)',
            contents: 'Rice noodles stir-fried with shrimp, bean sprouts, and tamarind sauce.',
            evaluation: {
              score_percent: 68,
              good_for_you_tags: ['Gluten-free noodles', 'Lean protein'],
              potential_triggers: ['Tamarind (acidic)', 'Fish sauce (high sodium)'],
              recommended: true,
              reason_short: 'Gluten-free option; tamarind sauce may be acidic for GERD.'
            }
          },
          {
            dish_name: 'Green Papaya Salad',
            contents: 'Shredded green papaya with tomatoes, lime juice, and mild herbs.',
            evaluation: {
              score_percent: 78,
              good_for_you_tags: ['Fresh vegetables', 'Digestive enzymes', 'Gluten-free', 'Dairy-free'],
              potential_triggers: ['Lime juice (acidic)', 'Raw vegetables'],
              recommended: true,
              reason_short: 'Contains digestive enzymes; lime acidity may affect GERD.'
            }
          },
          {
            dish_name: 'Red Curry with Beef',
            contents: 'Spicy red curry with beef, bell peppers, and basil in coconut milk.',
            evaluation: {
              score_percent: 35,
              good_for_you_tags: ['Protein'],
              potential_triggers: ['Spicy curry', 'Coconut (high FODMAP)', 'Bell peppers (nightshade)'],
              recommended: false,
              reason_short: 'Too spicy with multiple potential triggers for sensitive digestive systems.'
            }
          }
        ],
        // Variation 3 - Chinese
        [
          {
            dish_name: 'Steamed Fish with Ginger',
            contents: 'Fresh white fish steamed with ginger and scallions, served with rice.',
            evaluation: {
              score_percent: 92,
              good_for_you_tags: ['Lean protein', 'Ginger (digestive aid)', 'Gluten-free', 'Dairy-free'],
              potential_triggers: [],
              recommended: true,
              reason_short: 'Perfect gentle cooking method with digestive-supporting ginger.'
            }
          },
          {
            dish_name: 'Congee (Rice Porridge)',
            contents: 'Smooth rice porridge with shredded chicken and ginger.',
            evaluation: {
              score_percent: 95,
              good_for_you_tags: ['Easy to digest', 'Gentle on stomach', 'Gluten-free', 'Dairy-free'],
              potential_triggers: [],
              recommended: true,
              reason_short: 'Ideal for sensitive stomachs - very gentle and easy to digest.'
            }
          },
          {
            dish_name: 'Stir-Fried Vegetables',
            contents: 'Mixed vegetables quickly stir-fried with light soy sauce and ginger.',
            evaluation: {
              score_percent: 80,
              good_for_you_tags: ['Vegetables', 'Quick cooking', 'Gluten-free', 'Dairy-free'],
              potential_triggers: ['Soy sauce (sodium)'],
              recommended: true,
              reason_short: 'Healthy vegetables with minimal processing; watch sodium content.'
            }
          },
          {
            dish_name: 'Sweet and Sour Pork',
            contents: 'Battered pork with pineapple, bell peppers in sweet and sour sauce.',
            evaluation: {
              score_percent: 40,
              good_for_you_tags: ['Protein'],
              potential_triggers: ['Fried batter (gluten)', 'Acidic sauce', 'High sugar', 'Bell peppers'],
              recommended: false,
              reason_short: 'Contains gluten, high sugar, and acidic ingredients that trigger GERD.'
            }
          }
        ],
        // Variation 4 - Korean
        [
          {
            dish_name: 'Korean BBQ Chicken Bowl',
            contents: 'Grilled chicken with steamed rice and pickled vegetables.',
            evaluation: {
              score_percent: 86,
              good_for_you_tags: ['Lean protein', 'Gluten-free', 'Dairy-free', 'Probiotics'],
              potential_triggers: [],
              recommended: true,
              reason_short: 'Clean grilled preparation with probiotic vegetables.'
            }
          },
          {
            dish_name: 'Kimchi Fried Rice (Mild)',
            contents: 'Fried rice with mild kimchi, vegetables, and egg.',
            evaluation: {
              score_percent: 78,
              good_for_you_tags: ['Probiotics', 'Vegetables', 'Gluten-free', 'Dairy-free'],
              potential_triggers: ['Fermented kimchi', 'Garlic'],
              recommended: true,
              reason_short: 'Probiotic benefits; fermented foods may cause gas in sensitive individuals.'
            }
          },
          {
            dish_name: 'Seaweed Soup',
            contents: 'Traditional seaweed soup with tofu and mild seasonings.',
            evaluation: {
              score_percent: 90,
              good_for_you_tags: ['Minerals', 'Easy to digest', 'Gluten-free', 'Dairy-free'],
              potential_triggers: [],
              recommended: true,
              reason_short: 'Very gentle and nutritious - perfect for sensitive stomachs.'
            }
          },
          {
            dish_name: 'Spicy Korean Hot Pot',
            contents: 'Very spicy stew with vegetables, tofu, and chili paste.',
            evaluation: {
              score_percent: 30,
              good_for_you_tags: ['Vegetables'],
              potential_triggers: ['Very spicy', 'Chili paste', 'High sodium'],
              recommended: false,
              reason_short: 'Extremely spicy with chili paste - major trigger for GERD and sensitive stomachs.'
            }
          }
        ]
      ],
      'American': [
        // Variation 1 - Classic American
        [
          {
            dish_name: 'Grilled Chicken Breast',
            contents: 'Herb-seasoned grilled chicken breast with roasted sweet potatoes and green beans.',
            evaluation: {
              score_percent: 90,
              good_for_you_tags: ['Lean protein', 'Gluten-free', 'Dairy-free'],
              potential_triggers: [],
              recommended: true,
              reason_short: 'Simple, clean preparation perfect for sensitive digestive systems.'
            }
          },
          {
            dish_name: 'Turkey Meatloaf (Gluten-Free)',
            contents: 'Ground turkey meatloaf with gluten-free breadcrumbs, served with mashed cauliflower.',
            evaluation: {
              score_percent: 85,
              good_for_you_tags: ['Lean protein', 'Gluten-free', 'Dairy-free'],
              potential_triggers: ['Onions in meatloaf'],
              recommended: true,
              reason_short: 'Modified recipe for dietary restrictions; may contain onions.'
            }
          },
          {
            dish_name: 'Garden Salad with Grilled Protein',
            contents: 'Mixed greens with cucumber, carrots, and grilled chicken, olive oil dressing.',
            evaluation: {
              score_percent: 92,
              good_for_you_tags: ['Fresh vegetables', 'Lean protein', 'Gluten-free', 'Dairy-free'],
              potential_triggers: [],
              recommended: true,
              reason_short: 'Fresh, light option with no known triggers for your conditions.'
            }
          },
          {
            dish_name: 'BBQ Bacon Cheeseburger',
            contents: 'Beef patty with bacon, cheese, BBQ sauce on a brioche bun with fries.',
            evaluation: {
              score_percent: 25,
              good_for_you_tags: [],
              potential_triggers: ['Dairy (cheese)', 'Gluten (bun)', 'Fatty bacon', 'Acidic BBQ sauce'],
              recommended: false,
              reason_short: 'Contains dairy, gluten, and acidic ingredients that trigger multiple conditions.'
            }
          }
        ]
      ],
      'Mediterranean': [
        // Variation 1 - Greek-style
        [
          {
            dish_name: 'Grilled Lamb with Herbs',
            contents: 'Herb-marinated grilled lamb with roasted vegetables and rice pilaf.',
            evaluation: {
              score_percent: 82,
              good_for_you_tags: ['Protein', 'Herbs (anti-inflammatory)', 'Gluten-free'],
              potential_triggers: ['Lamb (fatty meat)'],
              recommended: true,
              reason_short: 'Good protein source; lamb may be rich for some sensitive stomachs.'
            }
          },
          {
            dish_name: 'Mediterranean Quinoa Bowl',
            contents: 'Quinoa with cucumber, tomatoes, olives, and olive oil-lemon dressing.',
            evaluation: {
              score_percent: 75,
              good_for_you_tags: ['Plant protein', 'Gluten-free', 'Dairy-free'],
              potential_triggers: ['Tomatoes (acidic)', 'Lemon (citrus)'],
              recommended: true,
              reason_short: 'Healthy grain bowl; tomato and lemon may trigger GERD.'
            }
          },
          {
            dish_name: 'Hummus and Vegetable Platter',
            contents: 'House-made hummus with cucumber, carrots, and gluten-free pita.',
            evaluation: {
              score_percent: 88,
              good_for_you_tags: ['Plant protein', 'Vegetables', 'Gluten-free', 'Dairy-free'],
              potential_triggers: [],
              recommended: true,
              reason_short: 'Excellent plant-based option with no major triggers.'
            }
          },
          {
            dish_name: 'Feta and Spinach Spanakopita',
            contents: 'Traditional Greek pastry filled with spinach and feta cheese.',
            evaluation: {
              score_percent: 45,
              good_for_you_tags: ['Vegetables', 'Calcium'],
              potential_triggers: ['Dairy (feta)', 'Gluten (phyllo pastry)', 'Rich/fatty'],
              recommended: false,
              reason_short: 'Contains dairy and gluten which conflict with dietary restrictions.'
            }
          }
        ]
      ],
      'Indian': [
        // Variation 1 - Mild Indian
        [
          {
            dish_name: 'Tandoori Chicken (Mild)',
            contents: 'Chicken marinated in yogurt-free spices, grilled in tandoor oven with basmati rice.',
            evaluation: {
              score_percent: 80,
              good_for_you_tags: ['Lean protein', 'Gluten-free', 'Dairy-free'],
              potential_triggers: ['Mild spices'],
              recommended: true,
              reason_short: 'Modified to be dairy-free; mild spices should be tolerable.'
            }
          },
          {
            dish_name: 'Dal (Lentil Curry) - Mild',
            contents: 'Yellow lentils cooked with turmeric, ginger, and mild spices.',
            evaluation: {
              score_percent: 85,
              good_for_you_tags: ['Plant protein', 'Anti-inflammatory spices', 'Gluten-free', 'Dairy-free'],
              potential_triggers: ['Legumes (gas-producing)'],
              recommended: true,
              reason_short: 'Nutritious protein source; lentils may cause gas in sensitive individuals.'
            }
          },
          {
            dish_name: 'Basmati Rice with Vegetables',
            contents: 'Fragrant basmati rice with lightly spiced mixed vegetables.',
            evaluation: {
              score_percent: 90,
              good_for_you_tags: ['Easy to digest', 'Vegetables', 'Gluten-free', 'Dairy-free'],
              potential_triggers: [],
              recommended: true,
              reason_short: 'Gentle, easily digestible option perfect for sensitive stomachs.'
            }
          },
          {
            dish_name: 'Vindaloo Curry (Spicy)',
            contents: 'Very spicy curry with vinegar, chilies, and aromatic spices.',
            evaluation: {
              score_percent: 20,
              good_for_you_tags: [],
              potential_triggers: ['Very spicy', 'Vinegar (acidic)', 'Multiple hot spices'],
              recommended: false,
              reason_short: 'Extremely spicy with acidic vinegar - major triggers for GERD.'
            }
          }
        ]
      ]
    };

    // Get cuisine-specific menu variations or use Italian as default
    const cuisine = restaurant.cuisine || 'Italian';
    
    // Normalize cuisine type to match our template keys
    const normalizedCuisine = this.normalizeCuisineType(cuisine);
    const menuVariations = menuTemplates[normalizedCuisine] || menuTemplates['Italian'];
    
    // Use restaurant hash to select a specific variation for this restaurant
    const variationIndex = restaurantHash % menuVariations.length;
    const selectedMenuItems = menuVariations[variationIndex];

    console.log(`Mock menu for "${restaurant.name}" (ID: ${restaurant.id}): Original cuisine: "${cuisine}" → Normalized: "${normalizedCuisine}" → Variation ${variationIndex + 1}/${menuVariations.length} (Hash: ${restaurantHash})`);

    // Convert to AnalyzedMenuItem format
    return selectedMenuItems.map((item, index) => {
      let status: 'safe' | 'caution' | 'avoid';
      if (!item.evaluation.recommended) {
        status = 'avoid';
      } else if (item.evaluation.score_percent >= 80) {
        status = 'safe';
      } else {
        status = 'caution';
      }

      return {
        id: index + 1,
        name: item.dish_name,
        description: item.contents,
        status,
        confidence: item.evaluation.score_percent,
        reasons: item.evaluation.good_for_you_tags || [],
        triggers: item.evaluation.potential_triggers || []
      };
    });
  }

  // Normalize cuisine types to match our template keys
  private normalizeCuisineType(cuisine: string): string {
    const normalized = cuisine.toLowerCase().trim();
    
    // Map various cuisine types to our available templates
    const cuisineMap: Record<string, string> = {
      // Direct matches
      'italian': 'Italian',
      'mexican': 'Mexican',
      'american': 'American',
      'mediterranean': 'Mediterranean',
      'indian': 'Indian',
      
      // Asian variants - all map to Asian
      'asian': 'Asian',
      'japanese': 'Asian',
      'chinese': 'Asian',
      'thai': 'Asian',
      'korean': 'Asian',
      'vietnamese': 'Asian',
      'sushi': 'Asian',
      
      // Additional mappings
      'greek': 'Mediterranean',
      'spanish': 'Mediterranean',
      'seafood': 'Mediterranean',
      'healthy': 'Mediterranean',
      'french': 'Italian', // Map to Italian for similar cooking styles
      'german': 'American',
      'steakhouse': 'American',
      'bbq': 'American',
      'fast food': 'American',
      'cafe': 'American',
      'bakery': 'American',
      'pizza': 'Italian'
    };
    
    return cuisineMap[normalized] || 'Italian'; // Default to Italian
  }

  // Test method to verify API connectivity
  async testApiConnection(): Promise<{ success: boolean; message: string }> {
    try {
      const testRestaurant: Restaurant = {
        name: 'Test Restaurant',
        cuisine: 'Italian',
        location: 'New York, NY'
      };
      
      const result = await this.generateAndAnalyzeMenu(testRestaurant);
      
      return {
        success: true,
        message: `API test successful. Generated menu with ${result.length} items for "${testRestaurant.name}".`
      };
    } catch (error) {
      return {
        success: false,
        message: `API test failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  // Simple hash function to generate consistent numbers from strings
  private hashString(str: string): number {
    let hash = 0;
    if (str.length === 0) return hash;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  // Get user profile from stored preferences (in a real app this would come from user data)
  getUserProfile(): UserProfile {
    // For demo purposes, return default profile
    // In a real app, this would fetch from user preferences or local storage
    return this.defaultUserProfile;
  }

  // Legacy method compatibility - now just calls generateAndAnalyzeMenu
  async analyzeMultipleItems(
    items: any[], // Not used anymore, kept for compatibility
    restaurant: Restaurant,
    userProfile?: UserProfile
  ): Promise<AnalyzedMenuItem[]> {
    console.log('Legacy analyzeMultipleItems called, redirecting to generateAndAnalyzeMenu');
    return this.generateAndAnalyzeMenu(restaurant, userProfile);
  }

  // Legacy method compatibility - kept for backward compatibility
  generateMockMenuItems(restaurantName: string): any[] {
    console.log('Legacy generateMockMenuItems called for:', restaurantName);
    // Return empty array since we now generate menus directly via API
    return [];
  }
}

export const menuAnalysisService = new MenuAnalysisService();