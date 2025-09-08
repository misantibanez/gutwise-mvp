import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { CheckCircle, AlertTriangle, XCircle, Info } from "lucide-react";

interface MenuAnalysisProps {
  restaurant: any;
  onNavigate: (screen: string, data?: any) => void;
  onBack: () => void;
}

export function MenuAnalysis({ restaurant, onNavigate, onBack }: MenuAnalysisProps) {
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

      {/* Restaurant Info */}
      <Card className="bg-gray-800 border-gray-700 p-4">
        <h3 className="text-white mb-1">{restaurant.name}</h3>
        <p className="text-gray-400 mb-2">{restaurant.cuisine} • {restaurant.distance}</p>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1">
            <CheckCircle className="w-4 h-4 text-green-400" />
            <span className="text-sm text-green-400">{restaurant.safeOptions} safe options</span>
          </div>
          <div className="flex items-center space-x-1">
            <AlertTriangle className="w-4 h-4 text-yellow-400" />
            <span className="text-sm text-yellow-400">{restaurant.riskOptions} to review</span>
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