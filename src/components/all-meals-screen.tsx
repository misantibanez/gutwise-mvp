import { useState, useEffect } from 'react';
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Clock, Search, Calendar, MapPin, AlertTriangle, Loader2, CheckCircle, TrendingUp, User, Activity } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { apiService } from "../utils/api";

interface AllMealsScreenProps {
  onBack: () => void;
  onNavigate: (screen: string, data?: any) => void;
}

interface MealEntry {
  id: string;
  dish_name: string;
  restaurant_name: string | null;
  meal_time: string;
  created_at: string;
  tags: string[] | null;
  notes?: string;
  safety_score?: number;
  portion_size?: 'small' | 'regular' | 'large';
  symptoms_logged?: boolean;
  reaction?: 'positive' | 'neutral' | 'negative';
  calories?: number;
  cuisine_type?: string;
  image_url?: string;
}

export function AllMealsScreen({ onBack, onNavigate }: AllMealsScreenProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Fallback mock data for when API is unavailable
  const mockMeals: MealEntry[] = [
    {
      id: 'meal-001',
      dish_name: 'Margherita Pizza',
      restaurant_name: 'La Nonna Ristorante',
      meal_time: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      tags: ['italian', 'pizza', 'vegetarian'],
      notes: 'Delicious thin crust pizza',
      safety_score: 85,
      portion_size: 'regular',
      symptoms_logged: true,
      reaction: 'positive',
      calories: 650,
      cuisine_type: 'Italian',
      image_url: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpdGFsaWFuJTIwcGl6emF8ZW58MXx8fHwxNzU3MzU3OTI3fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
    },
    {
      id: 'meal-002',
      dish_name: 'Chicken Caesar Salad',
      restaurant_name: 'Fresh Garden Bistro',
      meal_time: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      tags: ['salad', 'chicken', 'healthy'],
      notes: 'Light and fresh',
      safety_score: 95,
      portion_size: 'regular',
      symptoms_logged: true,
      reaction: 'positive',
      calories: 420,
      cuisine_type: 'American',
      image_url: 'https://images.unsplash.com/photo-1582034986517-30d163aa1da9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaGlja2VuJTIwY2Flc2FyJTIwc2FsYWR8ZW58MXx8fHwxNzU3Mjg2OTM4fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
    },
    {
      id: 'meal-003',
      dish_name: 'Pad Thai',
      restaurant_name: 'Bangkok Kitchen',
      meal_time: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      tags: ['thai', 'noodles', 'spicy'],
      notes: 'Medium spice level',
      safety_score: 60,
      portion_size: 'regular',
      symptoms_logged: true,
      reaction: 'neutral',
      calories: 580,
      cuisine_type: 'Thai',
      image_url: 'https://images.unsplash.com/photo-1718964313403-2db158f67844?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwYWQlMjB0aGFpJTIwbm9vZGxlc3xlbnwxfHx8fDE3NTc5NjEzMTB8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
    },
    {
      id: 'meal-004',
      dish_name: 'Quinoa Buddha Bowl',
      restaurant_name: null,
      meal_time: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      tags: ['healthy', 'vegan', 'quinoa'],
      notes: 'Homemade with fresh vegetables',
      safety_score: 98,
      portion_size: 'large',
      symptoms_logged: true,
      reaction: 'positive',
      calories: 480,
      cuisine_type: 'Healthy',
      image_url: 'https://images.unsplash.com/photo-1572319216151-4fb52730dc68?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoZWFsdGh5JTIwbWVhbCUyMGJvd2x8ZW58MXx8fHwxNzU3Mjc0MjA5fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
    },
    {
      id: 'meal-005',
      dish_name: 'Fish Tacos',
      restaurant_name: 'Coastal Cantina',
      meal_time: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      tags: ['mexican', 'fish', 'tacos'],
      notes: 'Great fresh fish',
      safety_score: 88,
      portion_size: 'regular',
      symptoms_logged: true,
      reaction: 'positive',
      calories: 520,
      cuisine_type: 'Mexican',
      image_url: 'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmaXNoJTIwdGFjb3N8ZW58MXx8fHwxNzU3MzU3OTU5fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
    },
    {
      id: 'meal-006',
      dish_name: 'Greek Chicken Bowl',
      restaurant_name: 'Mediterranean Delights',
      meal_time: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      tags: ['mediterranean', 'chicken', 'healthy'],
      notes: 'With tzatziki sauce',
      safety_score: 92,
      portion_size: 'regular',
      symptoms_logged: true,
      reaction: 'positive',
      calories: 540,
      cuisine_type: 'Mediterranean',
      image_url: 'https://images.unsplash.com/photo-1544255763-46a013bb70d5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxncmVlayUyMGNoaWNrZW58ZW58MXx8fHwxNzU3MzU3OTcwfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
    },
    {
      id: 'meal-007',
      dish_name: 'Vegetable Stir Fry',
      restaurant_name: null,
      meal_time: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
      created_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
      tags: ['asian', 'vegetarian', 'healthy'],
      notes: 'Home cooked with brown rice',
      safety_score: 94,
      portion_size: 'regular',
      symptoms_logged: true,
      reaction: 'positive',
      calories: 380,
      cuisine_type: 'Asian',
      image_url: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2ZWdldGFibGUlMjBzdGlyJTIwZnJ5fGVufDF8fHx8MTc1NzM1Nzk4MHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
    },
    {
      id: 'meal-008',
      dish_name: 'BBQ Burger',
      restaurant_name: 'The Burger Joint',
      meal_time: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      tags: ['american', 'burger', 'bbq'],
      notes: 'Felt a bit heavy afterwards',
      safety_score: 45,
      portion_size: 'large',
      symptoms_logged: true,
      reaction: 'negative',
      calories: 890,
      cuisine_type: 'American',
      image_url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiYnElMjBidXJnZXJ8ZW58MXx8fHwxNzU3MzU3OTkxfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
    }
  ];

  const [meals, setMeals] = useState<MealEntry[]>([]);

  // Load meals from API (mock data service)
  useEffect(() => {
    const loadMeals = async () => {
      try {
        console.log('🔄 Loading meals from API...');
        
        // Get meals from mock data service
        
        // Get meals from API (tries Cosmos DB first, falls back to mock)
        const result = await apiService.meals.getMeals(20); // Get up to 20 meals
        
        if (result && result.meals && Array.isArray(result.meals)) {
          console.log('✅ Meals loaded from API:', result.meals.length, 'meals');
          setMeals(result.meals);
        } else {
          console.log('📝 Invalid meal data structure from API, using mock data. Result:', result);
          setMeals(mockMeals);
        }
      } catch (error) {
        console.error('❌ Error loading meals:', error);
        console.log('📝 Falling back to mock meals');
        setMeals(mockMeals);
      } finally {
        setIsLoading(false);
      }
    };

    loadMeals();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours} hours ago`;
    } else if (diffInHours < 168) { // Less than a week
      const days = Math.floor(diffInHours / 24);
      return `${days} day${days > 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const formatMealTime = (mealTimeString: string) => {
    try {
      const time = new Date(mealTimeString);
      return time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return mealTimeString;
    }
  };

  // Helper functions for enhanced features
  const getSafetyColor = (score?: number) => {
    if (!score) return 'text-gray-400';
    if (score >= 85) return 'text-green-400';
    if (score >= 65) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getSafetyIcon = (score?: number) => {
    if (!score) return <AlertTriangle className="w-4 h-4 text-gray-400" />;
    if (score >= 85) return <CheckCircle className="w-4 h-4 text-green-400" />;
    if (score >= 65) return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
    return <AlertTriangle className="w-4 h-4 text-red-400" />;
  };

  const getReactionIcon = (reaction?: string) => {
    switch (reaction) {
      case 'positive': return <CheckCircle className="w-3 h-3 text-green-400" />;
      case 'neutral': return <AlertTriangle className="w-3 h-3 text-yellow-400" />;
      case 'negative': return <AlertTriangle className="w-3 h-3 text-red-400" />;
      default: return null;
    }
  };

  const getReactionColor = (reaction?: string) => {
    switch (reaction) {
      case 'positive': return 'text-green-400 bg-green-900/20 border-green-600';
      case 'neutral': return 'text-yellow-400 bg-yellow-900/20 border-yellow-600';
      case 'negative': return 'text-red-400 bg-red-900/20 border-red-600';
      default: return 'text-gray-400 bg-gray-900/20 border-gray-600';
    }
  };

  const getPortionSizeColor = (size?: string) => {
    switch (size) {
      case 'small': return 'text-blue-400 bg-blue-900/20 border-blue-600';
      case 'regular': return 'text-gray-400 bg-gray-900/20 border-gray-600';
      case 'large': return 'text-orange-400 bg-orange-900/20 border-orange-600';
      default: return 'text-gray-400 bg-gray-900/20 border-gray-600';
    }
  };

  const filteredMeals = meals.filter(meal => 
    meal.dish_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (meal.restaurant_name && meal.restaurant_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (meal.tags && meal.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())))
  );

  const groupMealsByDate = (meals: any[]) => {
    const groups: Record<string, any[]> = {};
    
    meals.forEach(meal => {
      const date = new Date(meal.created_at);
      const dateKey = date.toDateString();
      
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(meal);
    });

    return groups;
  };

  const groupedMeals = groupMealsByDate(filteredMeals);

  return (
    <div className="space-y-6" data-frame="[screen:AllMeals]">
      {/* Header */}
      <div className="flex items-center justify-between py-4">
        <Button 
          variant="ghost" 
          onClick={onBack}
          className="text-gray-300 hover:text-white hover:bg-gray-800"
        >
          ← Back
        </Button>
        <h2 className="text-white">All Meals</h2>
        <div></div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          type="text"
          placeholder="Search meals, restaurants, or cuisine..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 bg-gray-800 border-gray-600 text-white placeholder-gray-400"
        />
      </div>

      {/* Loading State */}
      {isLoading && (
        <Card className="bg-gray-800 border-gray-700 p-8">
          <div className="text-center space-y-4">
            <Loader2 className="w-8 h-8 text-blue-400 mx-auto animate-spin" />
            <p className="text-gray-400">Loading your meals...</p>
          </div>
        </Card>
      )}

      {/* Stats */}
      {!isLoading && ( 
        <div className="grid grid-cols-2 gap-4">
          <Card className="bg-gray-800 border-gray-700 p-4 text-center">
            <div className="text-2xl font-bold text-white">{meals.length}</div>
            <div className="text-xs text-gray-400">Total Meals</div>
          </Card>
          <Card className="bg-gray-800 border-gray-700 p-4 text-center">
            <div className="text-2xl font-bold text-blue-400">{Object.keys(groupedMeals).length}</div>
            <div className="text-xs text-gray-400">Days Tracked</div>
          </Card>
        </div>
      )}

      {/* Meals List */}
      {!isLoading && (
        <>
          {filteredMeals.length === 0 ? (
            <Card className="bg-gray-800 border-gray-700 p-6 text-center">
              <Calendar className="w-12 h-12 text-gray-500 mx-auto mb-4" />
              <h3 className="text-white mb-2">No meals found</h3>
              <p className="text-gray-400">
                {searchQuery ? 'Try adjusting your search terms' : 'Start logging your meals to see them here'}
              </p>
              {!searchQuery && (
                <Button 
                  onClick={() => onNavigate('log-meal')} 
                  className="mt-4 bg-blue-600 hover:bg-blue-700"
                >
                  Log Your First Meal
                </Button>
              )}
            </Card>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedMeals)
                .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
                .map(([dateKey, dayMeals]) => (
                  <div key={dateKey}>
                    <div className="flex items-center space-x-2 mb-3">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <h3 className="text-white font-medium">
                        {new Date(dateKey).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </h3>
                      <Badge variant="outline" className="text-xs">
                        {dayMeals.length} meal{dayMeals.length > 1 ? 's' : ''}
                      </Badge>
                    </div>
                    
                    <div className="space-y-3">
                      {dayMeals
                        .sort((a, b) => new Date(b.meal_time).getTime() - new Date(a.meal_time).getTime())
                        .map((meal) => (
                          <Card key={meal.id} className="bg-gradient-to-r from-gray-800 to-gray-700 border-gray-600 overflow-hidden hover:from-gray-750 hover:to-gray-650 transition-all duration-200">
                            {/* Header with Image and Safety Score */}
                            <div className="relative">
                              <div className="flex p-4">
                                {/* Meal Image */}
                                <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-gray-700 flex-shrink-0">
                                  <ImageWithFallback 
                                    src={meal.image_url}
                                    alt={meal.dish_name}
                                    className="w-full h-full object-cover"
                                  />
                                  {/* Safety Score Overlay */}
                                  {meal.safety_score && (
                                    <div className="absolute top-1 right-1">
                                      <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium backdrop-blur-sm bg-black/50 ${getSafetyColor(meal.safety_score)}`}>
                                        {getSafetyIcon(meal.safety_score)}
                                        <span>{meal.safety_score}</span>
                                      </div>
                                    </div>
                                  )}
                                </div>

                                {/* Main Content */}
                                <div className="flex-1 ml-4 min-w-0">
                                  {/* Title and Time */}
                                  <div className="flex items-start justify-between mb-2">
                                    <div className="flex-1 min-w-0">
                                      <h4 className="text-white font-medium truncate">{meal.dish_name}</h4>
                                      <Badge variant="outline" className="text-xs border-blue-400 text-blue-300 mt-1">
                                        {meal.cuisine_type}
                                      </Badge>
                                    </div>
                                    <div className="flex items-center space-x-1 ml-2 flex-shrink-0">
                                      <Clock className="w-3 h-3 text-gray-400" />
                                      <span className="text-xs text-gray-400">
                                        {formatMealTime(meal.meal_time)}
                                      </span>
                                    </div>
                                  </div>

                                  {/* Location */}
                                  <div className="flex items-center space-x-2 mb-2">
                                    {meal.restaurant_name ? (
                                      <MapPin className="w-3 h-3 text-gray-400" />
                                    ) : (
                                      <User className="w-3 h-3 text-purple-400" />
                                    )}
                                    <span className="text-sm text-gray-400 truncate">
                                      {meal.restaurant_name || 'Home cooked'}
                                    </span>
                                  </div>

                                  {/* Metrics Grid */}
                                  <div className="grid grid-cols-3 gap-2 mt-2">
                                    {/* Calories */}
                                    {meal.calories && (
                                      <div className="text-center">
                                        <div className="text-xs text-gray-400">Calories</div>
                                        <div className="text-sm text-white font-medium">{meal.calories}</div>
                                      </div>
                                    )}
                                    
                                    {/* Portion Size */}
                                    {meal.portion_size && (
                                      <div className="text-center">
                                        <div className="text-xs text-gray-400">Portion</div>
                                        <Badge className={`text-xs border-0 ${getPortionSizeColor(meal.portion_size)}`}>
                                          {meal.portion_size}
                                        </Badge>
                                      </div>
                                    )}

                                    {/* Symptoms Status */}
                                    <div className="text-center">
                                      <div className="text-xs text-gray-400">Tracked</div>
                                      <div className="flex justify-center">
                                        {meal.symptoms_logged ? (
                                          <CheckCircle className="w-4 h-4 text-green-400" />
                                        ) : (
                                          <AlertTriangle className="w-4 h-4 text-yellow-400" />
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Reaction Banner */}
                              {meal.reaction && (
                                <div className={`px-4 py-2 border-t border-gray-600 ${getReactionColor(meal.reaction)}`}>
                                  <div className="flex items-center space-x-2">
                                    {getReactionIcon(meal.reaction)}
                                    <span className="text-xs font-medium capitalize">
                                      {meal.reaction === 'positive' ? 'Felt great after this meal' :
                                       meal.reaction === 'neutral' ? 'No significant reaction' :
                                       'Had some discomfort after this meal'}
                                    </span>
                                    {meal.reaction === 'negative' && (
                                      <Button
                                        onClick={() => onNavigate('insights')}
                                        variant="ghost"
                                        className="text-xs p-1 h-auto text-red-300 hover:text-red-200 hover:bg-red-900/20 ml-auto"
                                      >
                                        <TrendingUp className="w-3 h-3 mr-1" />
                                        View Patterns
                                      </Button>
                                    )}
                                  </div>
                                </div>
                              )}

                              {/* Tags and Notes */}
                              <div className="px-4 pb-4">
                                {/* Tags */}
                                {meal.tags && meal.tags.length > 0 && (
                                  <div className="flex flex-wrap gap-1 mb-2">
                                    {meal.tags.slice(0, 3).map((tag, index) => (
                                      <Badge key={index} variant="outline" className="text-xs border-gray-500 text-gray-300">
                                        {tag}
                                      </Badge>
                                    ))}
                                    {meal.tags.length > 3 && (
                                      <Badge variant="outline" className="text-xs border-gray-500 text-gray-400">
                                        +{meal.tags.length - 3}
                                      </Badge>
                                    )}
                                  </div>
                                )}

                                {/* Notes */}
                                {meal.notes && (
                                  <p className="text-xs text-gray-500 line-clamp-2 italic">
                                    "{meal.notes}"
                                  </p>
                                )}

                                {/* Quick Actions */}
                                <div className="flex space-x-2 mt-3">
                                  <Button
                                    onClick={() => onNavigate('symptom-tracker', { meal })}
                                    className="flex-1 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white py-2 px-3 text-xs font-medium shadow-sm transition-all duration-200"
                                  >
                                    <Activity className="w-3 h-3 mr-1" />
                                    {meal.symptoms_logged ? 'Update' : 'Track'}
                                  </Button>
                                  <Button
                                    onClick={() => onNavigate('log-meal', { meal })}
                                    className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white py-2 px-3 text-xs font-medium shadow-sm transition-all duration-200"
                                  >
                                    <Clock className="w-3 h-3 mr-1" />
                                    Log Again
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </Card>
                        ))}
                    </div>
                  </div>
                ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}