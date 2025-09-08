import { useState, useEffect } from 'react';
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { MapPin, Clock, TrendingUp, Camera, Plus, Loader2, AlertTriangle, CheckCircle, XCircle, HelpCircle } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { mealsAPI, symptomsAPI } from "../utils/api/index";

interface HomeDashboardProps {
  onNavigate: (screen: string) => void;
}

interface MealEntry {
  id: string;
  dish_name: string;
  restaurant_name: string | null;
  meal_time: string;
  tags: string[] | null;
}

interface SymptomEntry {
  id: string;
  overall_feeling: string;
  symptoms: string[] | null;
  severity_scores: Record<string, number> | null;
  recorded_at: string;
  meal_id?: string;
}

export function HomeDashboard({ onNavigate }: HomeDashboardProps) {
  const [recentMeals, setRecentMeals] = useState<MealEntry[]>([]);
  const [symptoms, setSymptoms] = useState<SymptomEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch real data on component mount
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError("");
      
      try {
        // Fetch meals and symptoms data
        const [mealsResult, symptomsResult] = await Promise.allSettled([
          mealsAPI.getMeals(),
          symptomsAPI.getSymptoms()
        ]);

        if (mealsResult.status === 'fulfilled') {
          setRecentMeals(mealsResult.value.meals || []);
          console.log('Meals data loaded for home:', mealsResult.value.meals?.length || 0, 'entries');
        } else {
          console.error('Failed to fetch meals for home:', mealsResult.reason);
        }

        if (symptomsResult.status === 'fulfilled') {
          setSymptoms(symptomsResult.value.symptoms || []);
          console.log('Symptoms data loaded for home:', symptomsResult.value.symptoms?.length || 0, 'entries');
        } else {
          console.error('Failed to fetch symptoms for home:', symptomsResult.reason);
        }

      } catch (err) {
        console.error('Failed to fetch home data:', err);
        setError("Unable to load dashboard data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Calculate this week's insights
  const calculateWeeklyInsights = () => {
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    // Filter meals and symptoms from this week
    const thisWeekMeals = recentMeals.filter(meal => 
      new Date(meal.meal_time) >= oneWeekAgo
    );
    
    const thisWeekSymptoms = symptoms.filter(symptom => 
      new Date(symptom.recorded_at) >= oneWeekAgo
    );

    // Calculate safe ratio (great + good feelings)
    const goodFeelings = thisWeekSymptoms.filter(s => 
      ['great', 'good'].includes(s.overall_feeling)
    ).length;
    const safeRatio = thisWeekSymptoms.length > 0 
      ? Math.round((goodFeelings / thisWeekSymptoms.length) * 100)
      : 0;

    // Find top cuisine from restaurant names or tags
    const cuisineCount: Record<string, number> = {};
    thisWeekMeals.forEach(meal => {
      // Try to extract cuisine from restaurant name or tags
      const restaurantName = meal.restaurant_name || '';
      const tags = meal.tags || [];
      
      // Simple cuisine detection based on restaurant names
      let cuisine = 'Various';
      if (restaurantName.toLowerCase().includes('italian') || restaurantName.toLowerCase().includes('pizza') || restaurantName.toLowerCase().includes('nonna') || restaurantName.toLowerCase().includes('ristorante')) {
        cuisine = 'Italian';
      } else if (restaurantName.toLowerCase().includes('mexican') || restaurantName.toLowerCase().includes('taco') || restaurantName.toLowerCase().includes('burrito')) {
        cuisine = 'Mexican';
      } else if (restaurantName.toLowerCase().includes('asian') || restaurantName.toLowerCase().includes('chinese') || restaurantName.toLowerCase().includes('sushi') || restaurantName.toLowerCase().includes('thai')) {
        cuisine = 'Asian';
      } else if (restaurantName.toLowerCase().includes('mediterranean') || restaurantName.toLowerCase().includes('greek') || restaurantName.toLowerCase().includes('gyro')) {
        cuisine = 'Mediterranean';
      } else if (restaurantName.toLowerCase().includes('indian') || restaurantName.toLowerCase().includes('curry')) {
        cuisine = 'Indian';
      } else if (restaurantName.toLowerCase().includes('french') || restaurantName.toLowerCase().includes('bistro')) {
        cuisine = 'French';
      } else if (restaurantName.toLowerCase().includes('american') || restaurantName.toLowerCase().includes('burger') || restaurantName.toLowerCase().includes('grill')) {
        cuisine = 'American';
      } else if (restaurantName.toLowerCase().includes('cafe') || restaurantName.toLowerCase().includes('coffee')) {
        cuisine = 'Cafe';
      } else if (tags.some(tag => tag.toLowerCase().includes('healthy'))) {
        cuisine = 'Healthy';
      } else if (restaurantName) {
        // Better fallback: if no cuisine detected, use "Restaurant" instead of first word
        cuisine = 'Restaurant';
      }
      
      cuisineCount[cuisine] = (cuisineCount[cuisine] || 0) + 1;
    });

    const topCuisine = Object.entries(cuisineCount)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'Various';

    return {
      mealsThisWeek: thisWeekMeals.length,
      safeRatio,
      topCuisine
    };
  };

  // Get recent meals with formatted time
  const getFormattedRecentMeals = () => {
    return recentMeals
      .sort((a, b) => new Date(b.meal_time).getTime() - new Date(a.meal_time).getTime())
      .slice(0, 3) // Show only 3 most recent
      .map(meal => {
        const mealTime = new Date(meal.meal_time);
        const now = new Date();
        const diffInHours = Math.floor((now.getTime() - mealTime.getTime()) / (1000 * 60 * 60));
        const diffInMinutes = Math.floor((now.getTime() - mealTime.getTime()) / (1000 * 60));
        
        let timeAgo;
        if (diffInMinutes < 60) {
          timeAgo = diffInMinutes <= 1 ? 'Just now' : `${diffInMinutes} minutes ago`;
        } else if (diffInHours < 24) {
          timeAgo = diffInHours === 1 ? '1 hour ago' : `${diffInHours} hours ago`;
        } else {
          const diffInDays = Math.floor(diffInHours / 24);
          timeAgo = diffInDays === 1 ? '1 day ago' : `${diffInDays} days ago`;
        }

        // Find related symptoms for this meal (within 6 hours after meal)
        const mealTimeMs = mealTime.getTime();
        const relatedSymptoms = symptoms.filter(symptom => {
          const symptomTime = new Date(symptom.recorded_at).getTime();
          const timeDiff = symptomTime - mealTimeMs;
          // Look for symptoms within 6 hours after the meal, or if meal_id matches
          return (symptom.meal_id === meal.id) || (timeDiff >= 0 && timeDiff <= 6 * 60 * 60 * 1000);
        });

        // Calculate safety status
        let safetyStatus = 'unknown';
        if (relatedSymptoms.length > 0) {
          const latestSymptom = relatedSymptoms.sort((a, b) => 
            new Date(b.recorded_at).getTime() - new Date(a.recorded_at).getTime()
          )[0];
          
          const feeling = latestSymptom.overall_feeling;
          if (['great', 'good'].includes(feeling)) {
            safetyStatus = 'safe';
          } else if (feeling === 'okay') {
            safetyStatus = 'neutral';
          } else if (['not-good', 'terrible'].includes(feeling)) {
            safetyStatus = 'risky';
          }
        }

        return {
          ...meal,
          timeAgo,
          safetyStatus,
          // Generate a food-related image URL based on dish name
          imageUrl: `https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80`
        };
      });
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

  const weeklyInsights = calculateWeeklyInsights();
  const formattedMeals = getFormattedRecentMeals();

  const nearbyAlerts = [
    {
      restaurant: "La Nonna Ristorante",
      distance: "0.2 miles",
      safeOptions: 3,
      type: "Italian"
    }
  ];

  return (
    <div className="space-y-6" data-frame="[screen:Home]">
      {/* Header */}
      <div className="text-center py-6">
        <h1 className="text-3xl mb-2 text-white">GutWise</h1>
        <p className="text-gray-400">Your personal digestive health companion</p>
      </div>

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
          className="h-16 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white flex flex-col items-center justify-center space-y-1"
        >
          <MapPin className="w-5 h-5" />
          <span>Find Restaurants</span>
        </Button>
      </div>

      {/* Location Alert */}
      {nearbyAlerts.length > 0 && (
        <Card className="bg-gray-800 border-gray-700 p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-2 mb-2">
              <MapPin className="w-4 h-4 text-blue-400" />
              <span className="text-sm text-blue-400">GutWise Suggestion</span>
            </div>
          </div>
          <p className="text-white mb-2">
            You are at {nearbyAlerts[0].restaurant}. Safe Options: {nearbyAlerts[0].safeOptions} dishes • {nearbyAlerts[0].distance}
          </p>
          <Button 
            onClick={() => onNavigate('suggestions')}
            variant="outline" 
            className="w-full border-blue-500 text-blue-400 hover:bg-blue-500/10"
          >
            View Suggestions
          </Button>
        </Card>
      )}

      {/* Loading State */}
      {isLoading && (
        <Card className="bg-gray-800 border-gray-700 p-8">
          <div className="text-center space-y-4">
            <Loader2 className="w-8 h-8 text-blue-400 mx-auto animate-spin" />
            <p className="text-gray-400">Loading your dashboard...</p>
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

      {/* Recent Activity */}
      {!isLoading && !error && (
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
          
          {formattedMeals.length > 0 ? (
            formattedMeals.map((meal) => (
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
      )}

      {/* Insights Preview */}
      {!isLoading && !error && (
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
      )}
    </div>
  );
}