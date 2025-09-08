import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { CheckCircle, Clock, TrendingUp } from "lucide-react";

interface SuccessScreenProps {
  type: 'meal-logged' | 'feedback-submitted';
  onNavigate: (screen: string) => void;
}

export function SuccessScreen({ type, onNavigate }: SuccessScreenProps) {
  if (type === 'meal-logged') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6 px-4">
        <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center">
          <CheckCircle className="w-8 h-8 text-white" />
        </div>
        
        <div className="text-center space-y-2">
          <h2 className="text-white text-xl">Meal Logged!</h2>
          <p className="text-gray-400">
            We'll check in with you in 2-4 hours to see how you're feeling.
          </p>
        </div>

        <Card className="bg-gray-800 border-gray-700 p-4 w-full max-w-sm">
          <div className="flex items-center justify-center space-x-2 text-blue-400">
            <Clock className="w-4 h-4" />
            <span className="text-sm">Reminder set for {
              new Date(Date.now() + 3 * 60 * 60 * 1000).toLocaleTimeString([], {
                hour: '2-digit', 
                minute: '2-digit'
              })
            }</span>
          </div>
        </Card>

        <div className="space-y-2 w-full max-w-sm">
          <Button 
            onClick={() => onNavigate('home')}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            Back to Home
          </Button>
          <Button 
            onClick={() => onNavigate('restaurants')}
            variant="outline"
            className="w-full border-gray-600 text-gray-300 hover:bg-gray-700"
          >
            Find More Safe Options
          </Button>
        </div>
      </div>
    );
  }

  if (type === 'feedback-submitted') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6 px-4">
        <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
          <TrendingUp className="w-8 h-8 text-white" />
        </div>
        
        <div className="text-center space-y-2">
          <h2 className="text-white text-xl">Thanks for the feedback!</h2>
          <p className="text-gray-400">
            Your input helps GutWise learn and provide better recommendations.
          </p>
        </div>

        <Card className="bg-gray-800 border-gray-700 p-4 w-full max-w-sm">
          <div className="text-center">
            <div className="text-green-400 mb-1">Your gut health is improving!</div>
            <div className="text-sm text-gray-400">
              You've successfully avoided triggers 86% of the time this week.
            </div>
          </div>
        </Card>

        <div className="space-y-2 w-full max-w-sm">
          <Button 
            onClick={() => onNavigate('insights')}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            View Your Progress
          </Button>
          <Button 
            onClick={() => onNavigate('home')}
            variant="outline"
            className="w-full border-gray-600 text-gray-300 hover:bg-gray-700"
          >
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  return null;
}