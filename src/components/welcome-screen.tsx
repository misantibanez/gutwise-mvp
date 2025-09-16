import { Button } from "./ui/button";
import { MapPin, Shield, BarChart3, Heart } from "lucide-react";

interface WelcomeScreenProps {
  onNavigate: (screen: string) => void;
}

export function WelcomeScreen({ onNavigate }: WelcomeScreenProps) {
  const features = [
    {
      icon: <MapPin className="w-5 h-5 text-blue-400" />,
      title: "Find Safe Restaurants",
      description: "Discover nearby restaurants with dishes that work for your digestive needs"
    },
    {
      icon: <Shield className="w-5 h-5 text-green-400" />,
      title: "AI Menu Analysis",
      description: "Get real-time safety scores and ingredient insights for any dish"
    },
    {
      icon: <BarChart3 className="w-5 h-5 text-purple-400" />,
      title: "Track Your Patterns",
      description: "Log meals and symptoms to discover your personal trigger foods"
    },
    {
      icon: <Heart className="w-5 h-5 text-red-400" />,
      title: "Personalized Insights",
      description: "Build confidence with data-driven recommendations just for you"
    }
  ];

  return (
    <div className="min-h-screen flex flex-col justify-between px-4 py-8" data-frame="[screen:Welcome]">
      {/* Logo/Brand Section */}
      <div className="text-center space-y-4 mt-8">
        <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-blue-500 rounded-2xl flex items-center justify-center mx-auto">
          <Heart className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-white text-2xl">Welcome to GutWise</h1>
        <p className="text-gray-400 max-w-xs mx-auto leading-relaxed">
          Your personal AI companion for confident food choices and digestive wellness
        </p>
      </div>

      {/* Features Grid - Now more compact and without card styling */}
      <div className="space-y-5 w-full max-w-sm mx-auto mt-8">
        {features.map((feature, index) => (
          <div key={index} className="flex items-start space-x-3">
            <div className="p-2 bg-gray-800 rounded-lg flex-shrink-0 mt-0.5">
              {feature.icon}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-white text-sm mb-2">{feature.title}</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                {feature.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Call to Action - Now always visible */}
      <div className="w-full max-w-sm mx-auto space-y-4 pb-4 mt-8">
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