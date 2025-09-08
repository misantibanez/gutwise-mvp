import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { CheckCircle, Clock, Bell, TrendingUp } from "lucide-react";

interface MealLoggedSuccessProps {
  onNavigate: (screen: string, data?: any) => void;
  meal?: any;
}

export function MealLoggedSuccess({ onNavigate, meal }: MealLoggedSuccessProps) {
  return (
    <div className="space-y-6 text-center" data-frame="[screen:MealLoggedSuccess]">
      {/* Success Icon */}
      <div className="flex justify-center py-8">
        <div className="w-20 h-20 bg-green-600 rounded-full flex items-center justify-center">
          <CheckCircle className="w-12 h-12 text-white" />
        </div>
      </div>

      {/* Success Message */}
      <div className="space-y-3">
        <h1 className="text-white text-2xl">Meal Logged!</h1>
        <p className="text-gray-400 max-w-sm mx-auto">
          Your meal has been successfully recorded. We'll help you track how it affects your digestive health.
        </p>
      </div>

      {/* Logged Meal Info */}
      {meal && (
        <Card className="bg-gray-800 border-gray-700 p-4 text-left">
          <h3 className="text-white mb-2 text-center">Meal Details</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-400">Dish:</span>
              <span className="text-white">{meal.dish_name}</span>
            </div>
            {meal.restaurant_name && (
              <div className="flex justify-between">
                <span className="text-gray-400">Restaurant:</span>
                <span className="text-white">{meal.restaurant_name}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-400">Portion:</span>
              <span className="text-white capitalize">{meal.portion_size || 'Regular'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Time:</span>
              <span className="text-white">{new Date(meal.meal_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
            </div>
          </div>
        </Card>
      )}

      {/* Next Steps */}
      <Card className="bg-gray-800 border-gray-700 p-6 text-left">
        <h3 className="text-white mb-4 text-center">What's Next?</h3>
        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <Clock className="w-5 h-5 text-blue-400 mt-0.5" />
            <div>
              <p className="text-white text-sm">Check-in Reminder</p>
              <p className="text-gray-400 text-xs">We'll notify you in 2-4 hours to log any symptoms</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <TrendingUp className="w-5 h-5 text-green-400 mt-0.5" />
            <div>
              <p className="text-white text-sm">Track Patterns</p>
              <p className="text-gray-400 text-xs">Your data helps us identify safe foods and triggers</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <Bell className="w-5 h-5 text-purple-400 mt-0.5" />
            <div>
              <p className="text-white text-sm">Smart Suggestions</p>
              <p className="text-gray-400 text-xs">Get personalized meal recommendations based on your history</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Action Buttons */}
      <div className="space-y-3 pt-4">
        {/* Primary Action - Back to Dashboard */}
        <Button 
          onClick={() => onNavigate('home')}
          className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-3 shadow-lg"
        >
          <CheckCircle className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>
        
        {/* Quick Symptom Check Button - High Priority */}
        {meal && (
          <Button 
            onClick={() => onNavigate('symptom-tracker', { meal })}
            className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white py-3 shadow-lg"
          >
            <Clock className="w-4 h-4 mr-2" />
            Log Symptoms Now
          </Button>
        )}
        
        {/* Secondary Actions */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <Button 
            onClick={() => onNavigate('log-meal')}
            className="bg-green-600 hover:bg-green-700 text-white py-3 flex items-center justify-center space-x-2"
          >
            <span>+</span>
            <span>Log Another</span>
          </Button>
          
          <Button 
            onClick={() => onNavigate('insights')}
            className="bg-orange-600 hover:bg-orange-700 text-white py-3 flex items-center justify-center space-x-2"
          >
            <TrendingUp className="w-4 h-4" />
            <span>View Insights</span>
          </Button>
        </div>
      </div>
    </div>
  );
}