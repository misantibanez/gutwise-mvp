import { useState, useEffect } from 'react';
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Clock, Search, Calendar, MapPin, AlertTriangle, Loader2 } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { mealsAPI } from "../utils/api/index";

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
}

export function AllMealsScreen({ onBack, onNavigate }: AllMealsScreenProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [meals, setMeals] = useState<MealEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch real meals data
  useEffect(() => {
    const fetchMeals = async () => {
      setIsLoading(true);
      setError("");
      
      try {
        const result = await mealsAPI.getMeals();
        setMeals(result.meals || []);
        console.log('All meals loaded:', result.meals?.length || 0, 'entries');
      } catch (err) {
        console.error('Failed to fetch all meals:', err);
        setError("Unable to load meals data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchMeals();
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

      {/* Error State */}
      {error && (
        <Card className="bg-red-500/10 border-red-500/20 p-6">
          <div className="text-center space-y-4">
            <AlertTriangle className="w-8 h-8 text-red-400 mx-auto" />
            <p className="text-red-400">{error}</p>
          </div>
        </Card>
      )}

      {/* Stats */}
      {!isLoading && !error && (
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
      {!isLoading && !error && (
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
                          <Card key={meal.id} className="bg-gray-800 border-gray-700 p-4">
                            <div className="flex items-center space-x-4">
                              <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-700 flex-shrink-0">
                                <ImageWithFallback 
                                  src={`https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400`}
                                  alt={meal.dish_name}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between mb-1">
                                  <h4 className="text-white font-medium truncate">{meal.dish_name}</h4>
                                  <div className="flex items-center space-x-1 ml-2 flex-shrink-0">
                                    <Clock className="w-3 h-3 text-gray-400" />
                                    <span className="text-xs text-gray-400">
                                      {formatMealTime(meal.meal_time)}
                                    </span>
                                  </div>
                                </div>
                                <div className="flex items-center space-x-2 mb-1">
                                  <MapPin className="w-3 h-3 text-gray-400" />
                                  <span className="text-sm text-gray-400 truncate">{meal.restaurant_name || 'Home cooked'}</span>
                                </div>
                                {meal.tags && meal.tags.length > 0 && (
                                  <Badge variant="outline" className="text-xs">
                                    {meal.tags.join(', ')}
                                  </Badge>
                                )}
                                {meal.notes && (
                                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                                    {meal.notes}
                                  </p>
                                )}
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