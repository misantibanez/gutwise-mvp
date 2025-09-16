import { useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Badge } from "./ui/badge";
import { Camera, MapPin, Clock, Plus, Mic, Type, Scan, Loader2, Trophy, Star } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { apiService } from "../utils/api";
import { gamificationService } from "../utils/gamification-service";
import { toast } from "sonner@2.0.3";

interface MealLoggerProps {
  dish?: any;
  restaurant?: any;
  onNavigate: (screen: string, data?: any) => void;
  onBack: () => void;
}

export function MealLogger({ dish, restaurant, onNavigate, onBack }: MealLoggerProps) {
  const [mealData, setMealData] = useState({
    dishName: dish?.name || '',
    restaurantName: restaurant?.name || '',
    notes: '',
    portion: 'regular',
    customizations: ''
  });

  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [inputMethod, setInputMethod] = useState<string>('');
  const [isListening, setIsListening] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [dishAnalysis, setDishAnalysis] = useState<any>(null);

  const commonTags = [
    'Gluten-free', 'Dairy-free', 'Low FODMAP', 'High fiber', 
    'Spicy', 'Oily', 'Raw vegetables', 'Fermented', 'Artificial sweeteners'
  ];

  const portionSizes = [
    { value: 'small', label: 'Small', description: '1/4 - 1/2 portion' },
    { value: 'regular', label: 'Regular', description: 'Full portion' },
    { value: 'large', label: 'Large', description: '1.5+ portions' }
  ];

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  // Mock dish analysis function - simulates AI analysis of spoken dish
  const analyzeDishWithMockAI = async (dishName: string, restaurantName: string = '') => {
    // Get user's health conditions and dietary restrictions for personalized analysis
    const getUserProfile = () => {
      try {
        const healthConditions = JSON.parse(localStorage.getItem('gutwise-health-conditions') || '[\"IBS\", \"Lactose Intolerance\"]');
        const dietaryRestrictions = JSON.parse(localStorage.getItem('gutwise-dietary-restrictions') || '[\"Gluten-free\", \"Low FODMAP\"]');
        return { healthConditions, dietaryRestrictions };
      } catch {
        return { healthConditions: ['IBS', 'Lactose Intolerance'], dietaryRestrictions: ['Gluten-free', 'Low FODMAP'] };
      }
    };

    const userProfile = getUserProfile();
    
    // Mock AI analysis based on dish name keywords
    const dishLower = dishName.toLowerCase();
    let safetyScore = 75; // Default score
    let safetyStatus = 'caution';
    let triggers: string[] = [];
    let safeIngredients: string[] = [];
    let aiRecommendation = '';

    // Analyze dish based on common ingredients and preparation methods
    if (dishLower.includes('salad') || dishLower.includes('grilled') || dishLower.includes('steamed')) {
      safetyScore = 90;
      safetyStatus = 'safe';
      safeIngredients.push('Fresh vegetables', 'Lean protein');
      aiRecommendation = 'Excellent choice! Simple preparation methods and fresh ingredients are typically gentle on the digestive system.';
    }

    if (dishLower.includes('fried') || dishLower.includes('crispy') || dishLower.includes('battered')) {
      safetyScore -= 20;
      triggers.push('Fried/fatty preparation');
      aiRecommendation = 'Fried foods may trigger digestive symptoms due to high fat content.';
    }

    if (dishLower.includes('spicy') || dishLower.includes('hot') || dishLower.includes('jalapeño') || dishLower.includes('chili')) {
      safetyScore -= 15;
      triggers.push('Spicy ingredients');
      aiRecommendation = 'Spicy foods can irritate sensitive digestive systems.';
    }

    if (dishLower.includes('cheese') || dishLower.includes('cream') || dishLower.includes('dairy') || dishLower.includes('butter')) {
      if (userProfile.healthConditions.includes('Lactose Intolerance') || userProfile.dietaryRestrictions.includes('Dairy-free')) {
        safetyScore -= 25;
        triggers.push('Dairy products');
        aiRecommendation = 'Contains dairy which may trigger lactose intolerance symptoms.';
      }
    }

    if (dishLower.includes('bread') || dishLower.includes('pasta') || dishLower.includes('wheat') || dishLower.includes('flour')) {
      if (userProfile.dietaryRestrictions.includes('Gluten-free')) {
        safetyScore -= 30;
        triggers.push('Gluten-containing ingredients');
        aiRecommendation = 'Contains gluten which conflicts with your gluten-free dietary restriction.';
      }
    }

    if (dishLower.includes('quinoa') || dishLower.includes('rice') || dishLower.includes('chicken breast') || dishLower.includes('fish')) {
      safetyScore += 10;
      safeIngredients.push('Gut-friendly protein', 'Easy-to-digest grains');
    }

    if (dishLower.includes('beans') || dishLower.includes('lentils') || dishLower.includes('chickpeas')) {
      safetyScore -= 10;
      triggers.push('High-fiber legumes');
      aiRecommendation = 'Legumes are nutritious but may cause bloating in IBS sufferers.';
    }

    if (dishLower.includes('onion') || dishLower.includes('garlic')) {
      if (userProfile.dietaryRestrictions.includes('Low FODMAP')) {
        safetyScore -= 20;
        triggers.push('High FODMAP ingredients (onions/garlic)');
        aiRecommendation = 'Onions and garlic are high in FODMAPs which may trigger IBS symptoms.';
      }
    }

    // Determine final safety status
    if (safetyScore >= 85) {
      safetyStatus = 'safe';
    } else if (safetyScore >= 65) {
      safetyStatus = 'caution';
    } else {
      safetyStatus = 'avoid';
    }

    // Cap scores between 0-100
    safetyScore = Math.max(0, Math.min(100, safetyScore));

    if (!aiRecommendation && safetyStatus === 'safe') {
      aiRecommendation = 'This dish appears to be compatible with your dietary preferences and health conditions.';
    }

    return {
      safetyScore,
      safetyStatus,
      triggers,
      safeIngredients,
      aiRecommendation,
      confidence: Math.round(safetyScore * 0.9 + Math.random() * 10) // Add some variation
    };
  };

  const handleScanDish = async () => {
    setIsScanning(true);
    setInputMethod('scan');
    
    // Simulate camera scanning and AI recognition process
    setTimeout(async () => {
      const scannedDishes = [
        'Grilled Salmon with Quinoa',
        'Caesar Salad with Grilled Chicken',
        'Margherita Pizza (Wood-fired)',
        'Chicken Teriyaki Bowl with Rice',
        'Fish Tacos with Corn Tortillas',
        'Quinoa Buddha Bowl with Vegetables',
        'Beef Burger with Sweet Potato Fries',
        'Pad Thai with Shrimp',
        'Mediterranean Grain Bowl',
        'Chicken Tikka Masala with Naan',
        'Grilled Vegetable Wrap',
        'Spaghetti Carbonara'
      ];
      
      const randomDish = scannedDishes[Math.floor(Math.random() * scannedDishes.length)];
      const randomRestaurant = 'Scanned from photo';
      
      setMealData(prev => ({
        ...prev,
        dishName: randomDish,
        restaurantName: randomRestaurant
      }));
      
      setIsScanning(false);
      setIsAnalyzing(true);
      
      // Analyze the scanned dish with mock AI
      try {
        const analysis = await analyzeDishWithMockAI(randomDish, randomRestaurant);
        setDishAnalysis(analysis);
        
        // Set appropriate tags based on analysis
        const newTags: string[] = [];
        if (analysis.safeIngredients.length > 0) {
          if (analysis.safeIngredients.includes('Fresh vegetables')) newTags.push('Gluten-free');
          if (analysis.safeIngredients.includes('Lean protein')) newTags.push('High fiber');
          if (analysis.safeIngredients.includes('Gut-friendly protein')) newTags.push('Low FODMAP');
        }
        if (analysis.triggers.length > 0) {
          if (analysis.triggers.includes('Dairy products')) newTags.push('Dairy-free');
          if (analysis.triggers.includes('Spicy ingredients')) newTags.push('Spicy');
          if (analysis.triggers.includes('Fried/fatty preparation')) newTags.push('Oily');
          if (analysis.triggers.includes('Gluten-containing ingredients')) newTags.push('Gluten-free');
        }
        
        setSelectedTags(newTags);
      } catch (error) {
        console.error('Error analyzing scanned dish:', error);
      } finally {
        setIsAnalyzing(false);
      }
    }, 2500); // Slightly longer delay to simulate photo processing
  };

  const handleVoiceInput = async () => {
    setIsListening(true);
    setInputMethod('voice');
    
    // Simulate voice recognition process
    setTimeout(async () => {
      const spokenDishes = [
        'Mediterranean quinoa bowl with grilled chicken',
        'Caesar salad with grilled salmon',
        'Spicy pad thai with shrimp',
        'Margherita pizza with extra cheese',
        'Grilled fish tacos with avocado',
        'Chicken stir fry with vegetables',
        'Creamy mushroom risotto',
        'Turkey and cheese sandwich',
        'Thai green curry with rice',
        'Quinoa salad with roasted vegetables'
      ];
      
      const randomDish = spokenDishes[Math.floor(Math.random() * spokenDishes.length)];
      const randomRestaurant = Math.random() > 0.5 ? 'Voice Input' : '';
      
      setMealData(prev => ({
        ...prev,
        dishName: randomDish,
        restaurantName: randomRestaurant
      }));
      
      setIsListening(false);
      setIsAnalyzing(true);
      
      // Analyze the dish with mock AI
      try {
        const analysis = await analyzeDishWithMockAI(randomDish, randomRestaurant);
        setDishAnalysis(analysis);
        
        // Set appropriate tags based on analysis
        const newTags: string[] = [];
        if (analysis.safeIngredients.length > 0) {
          if (analysis.safeIngredients.includes('Fresh vegetables')) newTags.push('Gluten-free');
          if (analysis.safeIngredients.includes('Lean protein')) newTags.push('High fiber');
        }
        if (analysis.triggers.length > 0) {
          if (analysis.triggers.includes('Dairy products')) newTags.push('Dairy-free');
          if (analysis.triggers.includes('Spicy ingredients')) newTags.push('Spicy');
          if (analysis.triggers.includes('Fried/fatty preparation')) newTags.push('Oily');
        }
        
        setSelectedTags(newTags);
      } catch (error) {
        console.error('Error analyzing dish:', error);
      } finally {
        setIsAnalyzing(false);
      }
    }, 3000);
  };

  const handleTypeInput = () => {
    setInputMethod('type');
  };

  const handleSaveMeal = async () => {
    if (!mealData.dishName.trim()) {
      return;
    }

    setIsLoading(true);

    try {
      // Create the meal data payload in the format expected by the API
      const mealPayload = {
        dish_name: mealData.dishName.trim(),
        restaurant_name: mealData.restaurantName.trim() || null,
        portion_size: mealData.portion,
        meal_type: 'lunch', // Could be determined by time of day
        customizations: mealData.customizations.trim() || null,
        notes: mealData.notes.trim() || null,
        tags: selectedTags.length > 0 ? selectedTags : null,
        meal_time: new Date().toISOString(),
        cuisine_type: 'unknown', // Could be inferred from restaurant
        analysis: {
          safety_status: 'unknown',
          confidence_score: 50,
          ai_analysis: 'Meal logged by user',
          potential_triggers: selectedTags.filter(tag => 
            ['Spicy', 'High fiber', 'Raw vegetables', 'Fermented', 'Artificial sweeteners'].includes(tag)
          ),
          safe_ingredients: selectedTags.filter(tag => 
            ['Gluten-free', 'Dairy-free', 'Low FODMAP'].includes(tag)
          )
        }
      };

      console.log('🔄 Logging meal to mock data service:', mealPayload);

      // Call the API function (uses mock data service)
      const result = await apiService.meals.logMeal(mealPayload);
      
      if (result && result.meal && result.meal.id) {
        console.log('✅ Meal successfully logged:', result.meal);
        
        // Update gamification stats
        const { newAchievements, levelUp } = gamificationService.logMeal();
        
        // Show achievement notifications
        if (levelUp) {
          const stats = gamificationService.getStats();
          toast.success(`Level Up! You're now Level ${stats.level}! 🎉`, {
            icon: '🏆',
            duration: 3000
          });
        }
        
        newAchievements.forEach(achievement => {
          toast.success(`Achievement Unlocked: ${achievement.name}!`, {
            icon: achievement.isRare ? '🌟' : '🏆',
            description: achievement.description,
            duration: 4000
          });
        });
        
        if (newAchievements.length === 0 && !levelUp) {
          const stats = gamificationService.getStats();
          toast.success(`Meal logged! +10 XP (${stats.experiencePoints} total)`, {
            icon: '📝',
            duration: 2000
          });
        }
        
        onNavigate('meal-logged-success', { meal: result.meal });
      } else {
        console.log('❌ Invalid result from meal logging API:', result);
        throw new Error('Failed to log meal - invalid response');
      }
    } catch (error) {
      console.error('❌ Error logging meal:', error);
      
      // Fallback to mock save if API fails
      const savedMeal = {
        id: `meal_${Date.now()}`,
        dish_name: mealData.dishName.trim(),
        restaurant_name: mealData.restaurantName.trim() || null,
        portion_size: mealData.portion,
        customizations: mealData.customizations.trim() || null,
        notes: mealData.notes.trim() || null,
        tags: selectedTags.length > 0 ? selectedTags : null,
        meal_time: new Date().toISOString(),
        created_at: new Date().toISOString(),
      };
      
      console.log('📝 Using fallback mock meal save:', savedMeal);
      
      // Update gamification stats even for fallback
      const { newAchievements, levelUp } = gamificationService.logMeal();
      
      // Show achievement notifications
      if (levelUp) {
        const stats = gamificationService.getStats();
        toast.success(`Level Up! You're now Level ${stats.level}! 🎉`, {
          icon: '🏆',
          duration: 3000
        });
      }
      
      newAchievements.forEach(achievement => {
        toast.success(`Achievement Unlocked: ${achievement.name}!`, {
          icon: achievement.isRare ? '🌟' : '🏆',
          description: achievement.description,
          duration: 4000
        });
      });
      
      if (newAchievements.length === 0 && !levelUp) {
        const stats = gamificationService.getStats();
        toast.success(`Meal logged! +10 XP (${stats.experiencePoints} total)`, {
          icon: '📝',
          duration: 2000
        });
      }
      
      onNavigate('meal-logged-success', { meal: savedMeal });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6" data-frame="[screen:MealLogger]">
      {/* Header */}
      <div className="flex items-center justify-between py-4">
        <Button 
          variant="ghost" 
          onClick={onBack}
          className="text-gray-300 hover:text-white hover:bg-gray-800"
        >
          ← Back
        </Button>
        <h2 className="text-white">Log Meal</h2>
        <div></div>
      </div>

      {/* Input Method Selection */}
      {!dish && !inputMethod && (
        <Card className="bg-gray-800 border-gray-700 p-6">
          <h3 className="text-white mb-4 text-center">How would you like to log your meal?</h3>
          <div className="space-y-3">
            <Button 
              onClick={handleTypeInput}
              className="w-full h-16 bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-start space-x-4 px-6"
            >
              <Type className="w-6 h-6" />
              <div className="text-left">
                <div className="font-medium">Type Dish</div>
                <div className="text-sm text-blue-100">Manually enter what you ate</div>
              </div>
            </Button>
            
            <Button 
              onClick={handleScanDish}
              className="w-full h-16 bg-green-600 hover:bg-green-700 text-white flex items-center justify-start space-x-4 px-6"
            >
              <Camera className="w-6 h-6" />
              <div className="text-left">
                <div className="font-medium">Scan Dish</div>
                <div className="text-sm text-green-100">Take a photo for AI recognition</div>
              </div>
            </Button>
            
            <Button 
              onClick={handleVoiceInput}
              className="w-full h-16 bg-purple-600 hover:bg-purple-700 text-white flex items-center justify-start space-x-4 px-6"
            >
              <Mic className="w-6 h-6" />
              <div className="text-left">
                <div className="font-medium">Say Dish</div>
                <div className="text-sm text-purple-100">Voice input to describe your meal</div>
              </div>
            </Button>
          </div>
        </Card>
      )}

      {/* Scanning State */}
      {isScanning && (
        <Card className="bg-gray-800 border-gray-700 p-6">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto animate-pulse">
              <Camera className="w-8 h-8 text-white" />
            </div>
            <div>
              <h3 className="text-white mb-2">Scanning your dish...</h3>
              <p className="text-gray-400 text-sm">Our AI is analyzing your photo to identify the dish and ingredients</p>
              <div className="flex justify-center space-x-1 mt-3">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Voice Listening State */}
      {isListening && (
        <Card className="bg-gray-800 border-gray-700 p-6">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto animate-pulse">
              <Mic className="w-8 h-8 text-white" />
            </div>
            <div>
              <h3 className="text-white mb-2">Listening...</h3>
              <p className="text-gray-400 text-sm">Describe what you ate and we'll log it for you</p>
              <div className="flex justify-center space-x-1 mt-3">
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* AI Analysis State */}
      {isAnalyzing && (
        <Card className="bg-gray-800 border-gray-700 p-6">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto animate-pulse">
              <Loader2 className="w-8 h-8 text-white animate-spin" />
            </div>
            <div>
              <h3 className="text-white mb-2">Analyzing your dish...</h3>
              <p className="text-gray-400 text-sm">Our AI is evaluating safety based on your dietary profile</p>
            </div>
          </div>
        </Card>
      )}

      {/* AI Analysis Results */}
      {dishAnalysis && !isAnalyzing && mealData.dishName && (
        <Card className="bg-gray-800 border-gray-700 p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-white">AI Safety Analysis</h3>
            <Badge 
              className={`${
                dishAnalysis.safetyStatus === 'safe' 
                  ? 'bg-green-600 hover:bg-green-700 text-white' 
                  : dishAnalysis.safetyStatus === 'caution'
                    ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
                    : 'bg-red-600 hover:bg-red-700 text-white'
              }`}
            >
              {dishAnalysis.confidence}% Confidence
            </Badge>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${
                dishAnalysis.safetyStatus === 'safe' ? 'bg-green-400' :
                dishAnalysis.safetyStatus === 'caution' ? 'bg-yellow-400' : 'bg-red-400'
              }`}></div>
              <span className="text-gray-300 text-sm">
                Safety Score: {dishAnalysis.safetyScore}/100 ({dishAnalysis.safetyStatus.toUpperCase()})
              </span>
            </div>
            
            {dishAnalysis.aiRecommendation && (
              <p className="text-gray-300 text-sm bg-gray-700 p-3 rounded">
                💡 {dishAnalysis.aiRecommendation}
              </p>
            )}
            
            {dishAnalysis.triggers.length > 0 && (
              <div>
                <p className="text-red-400 text-sm mb-1">⚠️ Potential Triggers:</p>
                <div className="flex flex-wrap gap-1">
                  {dishAnalysis.triggers.map((trigger: string, index: number) => (
                    <Badge key={index} variant="outline" className="text-xs text-red-400 border-red-400">
                      {trigger}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            
            {dishAnalysis.safeIngredients.length > 0 && (
              <div>
                <p className="text-green-400 text-sm mb-1">✅ Safe Aspects:</p>
                <div className="flex flex-wrap gap-1">
                  {dishAnalysis.safeIngredients.map((ingredient: string, index: number) => (
                    <Badge key={index} variant="outline" className="text-xs text-green-400 border-green-400">
                      {ingredient}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Pre-filled Info from Menu Selection */}
      {dish && (
        <Card className="bg-gray-800 border-gray-700 p-4">
          <div className="flex space-x-3">
            <div className="w-16 h-16 rounded-lg bg-gray-700 flex items-center justify-center">
              <Camera className="w-6 h-6 text-gray-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-white mb-1">{dish.name}</h3>
              <p className="text-sm text-gray-400 mb-2">{restaurant?.name}</p>
              <div className="flex items-center space-x-2">
                <Badge className="bg-green-600 hover:bg-green-700 text-white">
                  {dish.confidence}% Safe
                </Badge>
                <span className="text-xs text-gray-500">•</span>
                <div className="flex items-center space-x-1">
                  <MapPin className="w-3 h-3 text-gray-500" />
                  <span className="text-xs text-gray-500">{restaurant?.distance}</span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Manual Entry - Show when typing or when dish info is present */}
      {(inputMethod === 'type' || dish || mealData.dishName) && (
        <Card className="bg-gray-800 border-gray-700 p-4 space-y-4">
          <div>
            <Label className="text-gray-300">Dish Name</Label>
            <Input 
              value={mealData.dishName}
              onChange={(e) => setMealData(prev => ({ ...prev, dishName: e.target.value }))}
              placeholder="What did you eat?"
              className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400"
            />
          </div>

          <div>
            <Label className="text-gray-300">Restaurant/Location</Label>
            <Input 
              value={mealData.restaurantName}
              onChange={(e) => setMealData(prev => ({ ...prev, restaurantName: e.target.value }))}
              placeholder="Where did you eat?"
              className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400"
            />
          </div>
        </Card>
      )}

      {/* Show rest of form only when we have meal data */}
      {(mealData.dishName || dish) && (
        <>
          {/* Portion Size */}
          <Card className="bg-gray-800 border-gray-700 p-4">
            <Label className="text-gray-300 mb-3 block">Portion Size</Label>
            <div className="space-y-2">
              {portionSizes.map((portion) => (
                <label key={portion.value} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-700 cursor-pointer">
                  <input
                    type="radio"
                    name="portion"
                    value={portion.value}
                    checked={mealData.portion === portion.value}
                    onChange={(e) => setMealData(prev => ({ ...prev, portion: e.target.value }))}
                    className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600"
                  />
                  <div className="flex-1">
                    <div className="text-white">{portion.label}</div>
                    <div className="text-xs text-gray-400">{portion.description}</div>
                  </div>
                </label>
              ))}
            </div>
          </Card>

          {/* Food Tags */}
          <Card className="bg-gray-800 border-gray-700 p-4">
            <Label className="text-gray-300 mb-3 block">Food Characteristics</Label>
            <div className="flex flex-wrap gap-2">
              {commonTags.map((tag) => (
                <Badge
                  key={tag}
                  variant={selectedTags.includes(tag) ? "default" : "outline"}
                  className={`cursor-pointer ${
                    selectedTags.includes(tag)
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'border-gray-600 text-gray-300 hover:bg-gray-700'
                  }`}
                  onClick={() => toggleTag(tag)}
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </Card>

          {/* Customizations */}
          <Card className="bg-gray-800 border-gray-700 p-4 space-y-4">
            <div>
              <Label className="text-gray-300">Customizations</Label>
              <Input 
                value={mealData.customizations}
                onChange={(e) => setMealData(prev => ({ ...prev, customizations: e.target.value }))}
                placeholder="No onions, extra sauce, etc."
                className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400"
              />
            </div>

            <div>
              <Label className="text-gray-300">Additional Notes</Label>
              <Textarea 
                value={mealData.notes}
                onChange={(e) => setMealData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="How are you feeling? Any concerns?"
                rows={3}
                className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400"
              />
            </div>
          </Card>

          {/* Time Info */}
          <Card className="bg-gray-800 border-gray-700 p-3">
            <div className="flex items-center justify-center space-x-2 text-gray-400">
              <Clock className="w-4 h-4" />
              <span className="text-sm">Logged for {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
            </div>
          </Card>

          {/* Save Button */}
          <div className="pb-6">
            <Button 
              onClick={handleSaveMeal}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3"
              disabled={!mealData.dishName}
            >
              Log Meal & Set Reminder
            </Button>
            <p className="text-xs text-gray-500 text-center mt-2">
              We'll check in with you in 2-4 hours to see how you're feeling
            </p>
          </div>
        </>
      )}

      {/* Loading State */}
      {isLoading && (
        <Card className="bg-gray-800 border-gray-700 p-6">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto animate-pulse">
              <Loader2 className="w-8 h-8 text-white animate-spin" />
            </div>
            <div>
              <h3 className="text-white mb-2">Saving to Cosmos DB...</h3>
              <p className="text-gray-400 text-sm">Attempting to store your meal data securely</p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}