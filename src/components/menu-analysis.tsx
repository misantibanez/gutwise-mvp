import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { CheckCircle, AlertTriangle, XCircle, Info, MapPin, Clock, Star, Phone, ExternalLink } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";

interface MenuAnalysisProps {
  restaurant: any;
  onNavigate: (screen: string, data?: any) => void;
  onBack: () => void;
}

export function MenuAnalysis({ restaurant, onNavigate, onBack }: MenuAnalysisProps) {
  // Mock restaurant data with enhanced details
  const defaultRestaurant = {
    name: "La Nonna Ristorante",
    cuisine: "Italian",
    distance: "0.2 miles",
    safeOptions: 3,
    riskOptions: 2,
    rating: 4.5,
    priceLevel: "$$",
    hours: "11:00 AM - 10:00 PM",
    phone: "(555) 123-4567",
    address: "123 Main Street, Downtown",
    image: "https://images.unsplash.com/photo-1667388968964-4aa652df0a9b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyZXN0YXVyYW50JTIwaW50ZXJpb3IlMjBkaW5pbmd8ZW58MXx8fHwxNzU3MjQzMzg1fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    features: ["Gluten-free options", "Vegan friendly", "Outdoor seating"],
    compatibility: 92
  };

  // Merge restaurant prop with defaults to ensure all properties exist
  const restaurantData = {
    ...defaultRestaurant,
    ...restaurant,
    features: restaurant?.features || defaultRestaurant.features
  };

  const menuItems = [
    {
      id: 1,
      name: "Mediterranean Quinoa Bowl",
      description: "Quinoa, cucumber, tomatoes, olives, feta cheese, olive oil dressing",
      status: "safe",
      confidence: 98,
      reasons: ["Low FODMAP ingredients", "No gluten", "Anti-inflammatory", "Previous positive reactions"],
      triggers: []
    },
    {
      id: 2,
      name: "Grilled Chicken Salad",
      description: "Mixed greens, grilled chicken, avocado, cherry tomatoes",
      status: "safe",
      confidence: 95,
      reasons: ["Simple ingredients", "No dairy", "Lean protein", "Good fiber balance"],
      triggers: []
    },
    {
      id: 3,
      name: "Buddha Bowl",
      description: "Brown rice, roasted vegetables, chickpeas, tahini dressing",
      status: "safe",
      confidence: 92,
      reasons: ["Whole grains", "Plant-based protein", "Familiar ingredients"],
      triggers: []
    },
    {
      id: 4,
      name: "Spicy Thai Curry",
      description: "Coconut curry with vegetables, jasmine rice, chili peppers",
      status: "caution",
      confidence: 45,
      reasons: ["High fiber vegetables"],
      triggers: ["Spicy ingredients", "Coconut (high FODMAP)", "Onions in curry base"]
    },
    {
      id: 5,
      name: "Loaded Burrito Bowl",
      description: "Black beans, corn, cheese, sour cream, guacamole, salsa",
      status: "avoid",
      confidence: 15,
      reasons: [],
      triggers: ["High FODMAP beans", "Dairy products", "Onions in salsa", "High fat content"]
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'safe': return 'text-green-400 bg-green-600 hover:bg-green-700';
      case 'caution': return 'text-yellow-400 bg-yellow-600 hover:bg-yellow-700';
      case 'avoid': return 'text-red-400 bg-red-600 hover:bg-red-700';
      default: return 'text-gray-400 bg-gray-600 hover:bg-gray-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'safe': return <CheckCircle className="w-4 h-4" />;
      case 'caution': return <AlertTriangle className="w-4 h-4" />;
      case 'avoid': return <XCircle className="w-4 h-4" />;
      default: return <Info className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-4" data-frame="[screen:MenuAnalysis]">
      {/* Header */}
      <div className="flex items-center justify-between py-4">
        <Button 
          variant="ghost" 
          onClick={onBack}
          className="text-gray-300 hover:text-white hover:bg-gray-800"
        >
          ← Back
        </Button>
        <h2 className="text-white">Menu Analysis</h2>
        <div></div>
      </div>

      {/* Enhanced Restaurant Info */}
      <Card className="bg-gradient-to-r from-gray-800 to-gray-700 border-gray-600 overflow-hidden">
        {/* Restaurant Image Header */}
        <div className="relative h-32 w-full overflow-hidden">
          <ImageWithFallback 
            src={restaurantData.image}
            alt={restaurantData.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
          
          {/* Compatibility Score Badge */}
          <div className="absolute top-3 right-3">
            <Badge className="bg-green-600/90 text-white border-0 backdrop-blur-sm">
              <CheckCircle className="w-3 h-3 mr-1" />
              {restaurantData.compatibility}% Match
            </Badge>
          </div>
        </div>

        <div className="p-4">
          {/* Restaurant Basic Info */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <h3 className="text-white text-xl mb-1">{restaurantData.name}</h3>
              <div className="flex items-center space-x-2 mb-2">
                <Badge variant="outline" className="text-xs border-blue-400 text-blue-300">
                  {restaurantData.cuisine}
                </Badge>
                <Badge variant="outline" className="text-xs border-gray-500 text-gray-400">
                  {restaurantData.priceLevel}
                </Badge>
              </div>
            </div>
            
            {/* Rating */}
            <div className="flex items-center space-x-1 text-right">
              <Star className="w-4 h-4 text-yellow-400 fill-current" />
              <span className="text-yellow-400 font-medium">{restaurantData.rating}</span>
            </div>
          </div>

          {/* Location & Hours */}
          <div className="space-y-2 mb-4">
            <div className="flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-300">{restaurantData.address}</span>
              <span className="text-sm text-blue-400">• {restaurantData.distance}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-300">{restaurantData.hours}</span>
              <Badge className="bg-green-600/20 text-green-400 border-0 text-xs">
                Open Now
              </Badge>
            </div>
          </div>

          {/* Features */}
          <div className="mb-4">
            <div className="flex flex-wrap gap-2">
              {restaurantData.features.map((feature, index) => (
                <Badge key={index} variant="outline" className="text-xs border-purple-400 text-purple-300">
                  {feature}
                </Badge>
              ))}
            </div>
          </div>

          {/* Safety Analysis */}
          <div className="bg-gray-900/50 rounded-lg p-3 mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-300 font-medium">Menu Safety Analysis</span>
              <Badge className="bg-blue-600/20 text-blue-400 border-0 text-xs">
                AI Analyzed
              </Badge>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <div>
                  <span className="text-lg font-medium text-green-400">{restaurantData.safeOptions}</span>
                  <p className="text-xs text-gray-400">Safe Options</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-yellow-400" />
                <div>
                  <span className="text-lg font-medium text-yellow-400">{restaurantData.riskOptions}</span>
                  <p className="text-xs text-gray-400">Review Needed</p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              <Phone className="w-4 h-4 mr-2" />
              Call
            </Button>
            <Button 
              variant="outline" 
              className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Directions
            </Button>
          </div>
        </div>
      </Card>

      {/* Menu Items */}
      <div className="space-y-3">
        {menuItems.map((item) => (
          <Card key={item.id} className="bg-gray-800 border-gray-700 p-4">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <h4 className="text-white mb-1">{item.name}</h4>
                <p className="text-sm text-gray-400 mb-2">{item.description}</p>
              </div>
              <div className="text-right ml-4">
                <Badge className={`${getStatusColor(item.status)} border-0`}>
                  <div className="flex items-center space-x-1">
                    {getStatusIcon(item.status)}
                    <span>{item.confidence}%</span>
                  </div>
                </Badge>
              </div>
            </div>

            {/* Analysis Details */}
            <div className="space-y-2 mt-3">
              {item.reasons.length > 0 && (
                <div>
                  <div className="flex items-center space-x-1 mb-1">
                    <CheckCircle className="w-3 h-3 text-green-400" />
                    <span className="text-xs text-green-400 uppercase tracking-wide">Good for you</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {item.reasons.map((reason, index) => (
                      <Badge key={index} variant="outline" className="text-xs border-green-400 text-green-300">
                        {reason}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {item.triggers.length > 0 && (
                <div>
                  <div className="flex items-center space-x-1 mb-1">
                    <AlertTriangle className="w-3 h-3 text-yellow-400" />
                    <span className="text-xs text-yellow-400 uppercase tracking-wide">Potential triggers</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {item.triggers.map((trigger, index) => (
                      <Badge key={index} variant="outline" className="text-xs border-yellow-400 text-yellow-300">
                        {trigger}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Action Button */}
            <Button 
              onClick={() => onNavigate('log-meal', { dish: item, restaurant })}
              className={`w-full mt-3 ${
                item.status === 'safe' 
                  ? 'bg-green-600 hover:bg-green-700 text-white' 
                  : item.status === 'caution'
                    ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
                    : 'bg-gray-600 hover:bg-gray-700 text-white'
              }`}
              disabled={item.status === 'avoid'}
            >
              {item.status === 'avoid' ? 'Not Recommended' : 'Log This Meal'}
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
}