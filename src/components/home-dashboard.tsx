import { useState, useEffect } from 'react';
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { MapPin, Clock, TrendingUp, Camera, Plus, CheckCircle, XCircle, HelpCircle, Star } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { smartRestaurantSuggestionService, RestaurantSafetyAnalysis } from "../utils/smart-restaurant-suggestion";
import { GamificationDisplay } from "./gamification-display";

interface HomeDashboardProps {
  onNavigate: (screen: string) => void;
}

export function HomeDashboard({ onNavigate }: HomeDashboardProps) {
  const [smartSuggestion, setSmartSuggestion] = useState<RestaurantSafetyAnalysis | null>(null);
  const [isLoadingSuggestion, setIsLoadingSuggestion] = useState(true);
  const [recentMeals, setRecentMeals] = useState<any[]>([]);
  const [isLoadingMeals, setIsLoadingMeals] = useState(false); // Set to false since we're using mock data directly

  // Load smart restaurant suggestion
  useEffect(() => {
    const loadSmartSuggestion = async () => {
      try {
        setIsLoadingSuggestion(true);
        const suggestion = await smartRestaurantSuggestionService.getBestRestaurantSuggestion();
        setSmartSuggestion(suggestion);
      } catch (error) {
        console.error('Failed to load smart suggestion:', error);
      } finally {
        setIsLoadingSuggestion(false);
      }
    };

    loadSmartSuggestion();
  }, []);

  // Load recent meals directly from mock data (no API calls)
  useEffect(() => {
    const loadRecentMeals = () => {
      console.log('📝 Loading recent meals from mock data...');
      
      // Use mock data directly - no API calls
      setRecentMeals(mockMealsData);
      setIsLoadingMeals(false);
      
      console.log('✅ Recent meals loaded from mock data:', mockMealsData.length, 'meals');
    };

    loadRecentMeals();
  }, []);

  // Mock data for recent meals (used directly, no API calls)
  const mockMealsData = [
    {
      id: 'meal-001',
      dish_name: 'Margherita Pizza',
      restaurant_name: 'La Nonna Ristorante',
      timeAgo: '2 hours ago',
      safetyStatus: 'safe',
      imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80'
    },
    {
      id: 'meal-002',
      dish_name: 'Chicken Caesar Salad',
      restaurant_name: 'Fresh Garden Bistro',
      timeAgo: '1 day ago',
      safetyStatus: 'safe',
      imageUrl: 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400&q=80'
    },
    {
      id: 'meal-003',
      dish_name: 'Pad Thai',
      restaurant_name: 'Bangkok Kitchen',
      timeAgo: '2 days ago',
      safetyStatus: 'neutral',
      imageUrl: 'https://images.unsplash.com/photo-1718964313403-2db158f67844?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwYWQlMjB0aGFpJTIwbm9vZGxlc3xlbnwxfHx8fDE3NTc5NjEzMTB8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
    }
  ];

  // Helper function to format time ago
  const formatTimeAgo = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
      
      if (diffInHours < 1) {
        return 'Just now';
      } else if (diffInHours < 24) {
        return `${diffInHours} hours ago`;
      } else {
        const days = Math.floor(diffInHours / 24);
        return `${days} day${days > 1 ? 's' : ''} ago`;
      }
    } catch {
      return 'Recently';
    }
  };

  const weeklyInsights = {
    mealsThisWeek: 5,
    safeRatio: 92,
    topCuisine: 'Mediterranean'
  };

  // Get safety score color
  const getSafetyScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  // Get risk level badge
  const getRiskLevelBadge = (riskLevel: 'low' | 'medium' | 'high') => {
    switch (riskLevel) {
      case 'low':
        return <Badge className="bg-green-600/20 text-green-400 border-green-500/30">Low Risk</Badge>;
      case 'medium':
        return <Badge className="bg-yellow-600/20 text-yellow-400 border-yellow-500/30">Medium Risk</Badge>;
      case 'high':
        return <Badge className="bg-red-600/20 text-red-400 border-red-500/30">High Risk</Badge>;
    }
  };

  // Get safety indicator component
  const getSafetyIndicator = (safetyStatus: string) => {
    switch (safetyStatus) {
      case 'safe':
        return (
          <div className="flex items-center space-x-1 bg-green-500/20 text-green-400 px-2 py-1 rounded-full">
            <CheckCircle className="w-3 h-3" />
            <span className="text-xs font-medium">Safe</span>
          </div>
        );
      case 'risky':
        return (
          <div className="flex items-center space-x-1 bg-red-500/20 text-red-400 px-2 py-1 rounded-full">
            <XCircle className="w-3 h-3" />
            <span className="text-xs font-medium">Risky</span>
          </div>
        );
      case 'neutral':
        return (
          <div className="flex items-center space-x-1 bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded-full">
            <HelpCircle className="w-3 h-3" />
            <span className="text-xs font-medium">Okay</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center space-x-1 bg-gray-500/20 text-gray-400 px-2 py-1 rounded-full">
            <HelpCircle className="w-3 h-3" />
            <span className="text-xs font-medium">Unknown</span>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6" data-frame="[screen:Home]">
      {/* Header */}
      <div className="text-center py-6">
        <h1 className="text-3xl mb-2 text-white">GutWise</h1>
        <p className="text-gray-400">Your personal digestive health companion</p>
      </div>

      {/* Gamification Progress */}
      <GamificationDisplay variant="mini" showDoctorShare={false} />

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4">
        <Button 
          onClick={() => onNavigate('log-meal')}
          className="h-16 bg-blue-600 hover:bg-blue-700 text-white flex flex-col items-center justify-center space-y-1"
        >
          <Plus className="w-5 h-5" />
          <span>Log Meal</span>
        </Button>
        <Button 
          onClick={() => onNavigate('restaurants')}
          className="h-16 bg-green-600 hover:bg-green-700 text-white flex flex-col items-center justify-center space-y-1"
        >
          <MapPin className="w-5 h-5" />
          <span>Find Safe Food</span>
        </Button>
      </div>

      {/* Smart Restaurant Suggestion */}
      {isLoadingSuggestion ? (
        <Card className="bg-gradient-to-r from-blue-600/10 to-green-600/10 border-blue-500/30 p-5">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            </div>
            <div>
              <span className="text-sm text-blue-400 font-medium">🎯 Finding Best Suggestion</span>
              <p className="text-xs text-gray-400">Analyzing nearby restaurants for you...</p>
            </div>
          </div>
        </Card>
      ) : smartSuggestion ? (
        <Card className="bg-gradient-to-r from-blue-600/10 to-green-600/10 border-blue-500/30 p-5">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <Star className="w-4 h-4 text-white" />
              </div>
              <div>
                <span className="text-sm text-blue-400 font-medium">🎯 Smart Suggestion</span>
                <p className="text-xs text-gray-400">Best match for your health conditions</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge className="bg-green-600/20 text-green-400 border-green-500/30">
                {smartSuggestion.safeDishCount} Safe Options
              </Badge>
              {getRiskLevelBadge(smartSuggestion.riskLevel)}
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="bg-gray-800/50 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-white font-medium">{smartSuggestion.restaurant.name}</h4>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-gray-400">{smartSuggestion.restaurant.distance}</span>
                </div>
              </div>
              
              <div className="flex items-center space-x-2 mb-2">
                <Badge variant="outline" className="text-xs border-blue-400 text-blue-300">
                  {smartSuggestion.restaurant.cuisine} Cuisine
                </Badge>
                <span className="text-xs text-gray-400">•</span>
                <span className="text-xs text-gray-300">
                  {smartSuggestion.safeDishCount}/{smartSuggestion.totalDishCount} dishes are safe
                </span>
              </div>

              {/* Reasons */}
              {smartSuggestion.reasons.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {smartSuggestion.reasons.map((reason, index) => (
                    <span key={index} className="text-xs text-green-400 bg-green-500/10 px-2 py-1 rounded">
                      {reason}
                    </span>
                  ))}
                </div>
              )}

              {/* Top Safe Dishes Preview */}
              {smartSuggestion.topSafeDishes.length > 0 && (
                <div className="mt-3 pt-2 border-t border-gray-700">
                  <p className="text-xs text-gray-400 mb-1">Safest options:</p>
                  <div className="space-y-1">
                    {smartSuggestion.topSafeDishes.slice(0, 2).map((dish, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-xs text-white">{dish.name}</span>
                        <span className={`text-xs ${getSafetyScoreColor(dish.safetyScore)}`}>
                          {dish.safetyScore}%
                        </span>
                      </div>
                    ))}
                    {smartSuggestion.topSafeDishes.length > 2 && (
                      <p className="text-xs text-gray-400">
                        +{smartSuggestion.topSafeDishes.length - 2} more safe options
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            <Button 
              onClick={() => onNavigate('menu', { restaurant: smartSuggestion.restaurant })}
              className="w-full bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white py-3 flex items-center justify-center space-x-2"
            >
              <MapPin className="w-4 h-4" />
              <span>View Full Menu Analysis</span>
            </Button>
          </div>
        </Card>
      ) : null}

      {/* Recent Activity */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white">Recent Meals</h3>
          <Button 
            variant="ghost" 
            className="text-blue-400 hover:text-blue-300"
            onClick={() => onNavigate('all-meals')}
          >
            View All
          </Button>
        </div>
        
        {isLoadingMeals ? (
          <Card className="bg-gray-800 border-gray-700 p-6">
            <div className="text-center space-y-4">
              <div className="w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-gray-400 text-sm">Loading recent meals...</p>
            </div>
          </Card>
        ) : recentMeals.length > 0 ? (
          recentMeals.map((meal) => (
            <Card key={meal.id} className="bg-gray-800 border-gray-700 p-4 mb-3">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-700">
                  <ImageWithFallback 
                    src={meal.imageUrl}
                    alt={meal.dish_name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-1">
                    <h4 className="text-white flex-1 pr-2">{meal.dish_name}</h4>
                    {getSafetyIndicator(meal.safetyStatus)}
                  </div>
                  <p className="text-sm text-gray-400">{meal.restaurant_name || 'Home cooked'}</p>
                  <div className="flex items-center mt-1">
                    <Clock className="w-3 h-3 text-gray-500 mr-1" />
                    <span className="text-xs text-gray-500">{meal.timeAgo}</span>
                  </div>
                </div>
              </div>
            </Card>
          ))
        ) : (
          <Card className="bg-gray-800 border-gray-700 p-6">
            <div className="text-center space-y-2">
              <Plus className="w-8 h-8 text-gray-400 mx-auto" />
              <p className="text-gray-400">No meals logged yet</p>
              <Button 
                onClick={() => onNavigate('log-meal')}
                variant="outline" 
                className="text-blue-400 border-blue-500 hover:bg-blue-500/10"
              >
                Log Your First Meal
              </Button>
            </div>
          </Card>
        )}
      </div>

      {/* Insights Preview */}
      <Card className="bg-gray-800 border-gray-700 p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white">This Week's Insights</h3>
          <TrendingUp className="w-4 h-4 text-green-400" />
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-gray-400 text-sm">Meals this week</span>
            <span className="text-white font-medium">{weeklyInsights.mealsThisWeek}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-400 text-sm">Safe ratio</span>
            <span className={`font-medium ${weeklyInsights.safeRatio >= 80 ? 'text-green-400' : weeklyInsights.safeRatio >= 60 ? 'text-yellow-400' : 'text-red-400'}`}>
              {weeklyInsights.safeRatio}%
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-400 text-sm">Top cuisine</span>
            <span className="text-white font-medium max-w-[60%] truncate" title={weeklyInsights.topCuisine}>
              {weeklyInsights.topCuisine}
            </span>
          </div>
        </div>
        
        <Button 
          onClick={() => onNavigate('insights')}
          className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white border-0"
        >
          View Detailed Insights
        </Button>
      </Card>
    </div>
  );
}