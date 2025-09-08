import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { MapPin, Shield, BarChart3, Heart } from "lucide-react";

interface WelcomeScreenProps {
  onNavigate: (screen: string) => void;
}

export function WelcomeScreen({ onNavigate }: WelcomeScreenProps) {
  const features = [
    {
      icon: <MapPin className="w-6 h-6 text-blue-400" />,
      title: "Find Safe Restaurants",
      description: "Discover nearby restaurants with dishes that work for your digestive needs"
    },
    {
      icon: <Shield className="w-6 h-6 text-green-400" />,
      title: "AI Menu Analysis",
      description: "Get real-time safety scores and ingredient insights for any dish"
    },
    {
      icon: <BarChart3 className="w-6 h-6 text-purple-400" />,
      title: "Track Your Patterns",
      description: "Log meals and symptoms to discover your personal trigger foods"
    },
    {
      icon: <Heart className="w-6 h-6 text-red-400" />,
      title: "Personalized Insights",
      description: "Build confidence with data-driven recommendations just for you"
    }
  ];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center space-y-8 px-4" data-frame="[screen:Welcome]">
      {/* Logo/Brand Section */}
      <div className="text-center space-y-4">
        <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Heart className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-white text-3xl mb-2">Welcome to GutWise</h1>
        <p className="text-gray-400 text-lg max-w-sm mx-auto leading-relaxed">
          Your personal AI companion for confident food choices and digestive wellness
        </p>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 gap-4 w-full max-w-sm">
        {features.map((feature, index) => (
          <Card key={index} className="bg-gray-800 border-gray-700 p-4">
            <div className="flex items-start space-x-3">
              <div className="p-2 bg-gray-700 rounded-lg flex-shrink-0">
                {feature.icon}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-white mb-1">{feature.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Call to Action */}
      <div className="w-full max-w-sm space-y-4">
        <Button 
          onClick={() => {
            console.log('Get Started button clicked, navigating to auth');
            onNavigate('auth');
          }}
          className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white py-3 rounded-xl transition-all duration-200"
        >
          Get Started
        </Button>        
        <p className="text-center text-xs text-gray-500 leading-relaxed">
          Start your journey to better digestive health with personalized food guidance
        </p>
      </div>
    </div>
  );
}