import { useState } from 'react';
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { MapPin, Clock, TrendingUp, Camera, Plus, CheckCircle, XCircle, HelpCircle } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";

interface HomeDashboardProps {
  onNavigate: (screen: string) => void;
}

export function HomeDashboard({ onNavigate }: HomeDashboardProps) {
  // Simple mock data - no API calls
  const recentMeals = [
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
      imageUrl: 'https://images.unsplash.com/photo-1559847844-d721426d6edc?w=400&q=80'
    }
  ];

  const weeklyInsights = {
    mealsThisWeek: 8,
    safeRatio: 87,
    topCuisine: 'Italian'
  };

  const nearbyAlerts = [
    {
      restaurant: "La Nonna Ristorante",
      distance: "0.2 miles",
      safeOptions: 3,
      type: "Italian"
    }
  ];

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

      {/* Location Alert */}
      {nearbyAlerts.length > 0 && (
        <Card className="bg-gradient-to-r from-blue-600/10 to-green-600/10 border-blue-500/30 p-5">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <MapPin className="w-4 h-4 text-white" />
              </div>
              <div>
                <span className="text-sm text-blue-400 font-medium">🎯 Smart Suggestion</span>
                <p className="text-xs text-gray-400">Based on your location & preferences</p>
              </div>
            </div>
            <Badge className="bg-green-600/20 text-green-400 border-green-500/30">
              {nearbyAlerts[0].safeOptions} Safe Options
            </Badge>
          </div>
          
          <div className="space-y-3">
            <div className="bg-gray-800/50 rounded-lg p-3">
              <div className="flex items-center justify-between mb-1">
                <h4 className="text-white font-medium">{nearbyAlerts[0].restaurant}</h4>
                <span className="text-xs text-gray-400">{nearbyAlerts[0].distance}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="text-xs border-blue-400 text-blue-300">
                  {nearbyAlerts[0].type} Cuisine
                </Badge>
                <span className="text-xs text-gray-400">•</span>
                <span className="text-xs text-green-400">High compatibility</span>
              </div>
            </div>
            
            <Button 
              onClick={() => onNavigate('suggestions')}
              className="w-full bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white py-3 flex items-center justify-center space-x-2"
            >
              <MapPin className="w-4 h-4" />
              <span>View Menu Analysis & Safe Dishes</span>
            </Button>
          </div>
        </Card>
      )}

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
        
        {recentMeals.length > 0 ? (
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