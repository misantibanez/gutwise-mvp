import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { MapPin, Star, Clock, CheckCircle, AlertTriangle } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";

interface RestaurantSuggestionsProps {
  onNavigate: (screen: string, data?: any) => void;
  onBack: () => void;
}

export function RestaurantSuggestions({ onNavigate, onBack }: RestaurantSuggestionsProps) {
  const restaurants = [
    {
      id: 1,
      name: "La Nonna Ristorante",
      cuisine: "Italian",
      distance: "0.2 miles",
      rating: 4.5,
      safeOptions: 3,
      riskOptions: 2,
      image: "https://images.unsplash.com/photo-1609951734391-b79a50460c6c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyZXN0YXVyYW50JTIwZm9vZCUyMG1lbnUlMjBtb2JpbGV8ZW58MXx8fHwxNzU3MjU3NDk4fDA&ixlib=rb-4.1.0&q=80&w=400",
      dishes: [
        { name: "Grilled Salmon", status: "safe", confidence: 95 },
        { name: "Caesar Salad (no croutons)", status: "safe", confidence: 89 },
        { name: "Margherita Pizza", status: "caution", confidence: 60 },
      ]
    },
    {
      id: 2,
      name: "Green Bowl Cafe",
      cuisine: "Healthy",
      distance: "0.4 miles",
      rating: 4.8,
      safeOptions: 5,
      riskOptions: 0,
      image: "https://images.unsplash.com/photo-1642339800099-921df1a0a958?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoZWFsdGh5JTIwZm9vZCUyMGJvd2x8ZW58MXx8fHwxNzU3MjAzNjk4fDA&ixlib=rb-4.1.0&q=80&w=400",
      dishes: [
        { name: "Mediterranean Quinoa Bowl", status: "safe", confidence: 98 },
        { name: "Grilled Chicken Salad", status: "safe", confidence: 95 },
        { name: "Buddha Bowl", status: "safe", confidence: 92 },
      ]
    }
  ];

  return (
    <div className="space-y-6" data-frame="[screen:Restaurants]">
      {/* Header */}
      <div className="flex items-center justify-between py-4">
        <Button 
          variant="ghost" 
          onClick={onBack}
          className="text-gray-300 hover:text-white hover:bg-gray-800"
        >
          ← Back
        </Button>
        <h2 className="text-white">Nearby Restaurants</h2>
        <div></div>
      </div>

      {/* Location Info */}
      <Card className="bg-gray-800 border-gray-700 p-4">
        <div className="flex items-center space-x-2 mb-2">
          <MapPin className="w-4 h-4 text-blue-400" />
          <span className="text-blue-400">Your Location</span>
        </div>
        <p className="text-gray-300">Found {restaurants.length} restaurants with safe options nearby</p>
      </Card>

      {/* Restaurant List */}
      <div className="space-y-4">
        {restaurants.map((restaurant) => (
          <Card key={restaurant.id} className="bg-gray-800 border-gray-700 p-4">
            <div className="flex space-x-4">
              <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-700 flex-shrink-0">
                <ImageWithFallback 
                  src={restaurant.image}
                  alt={restaurant.name}
                  className="w-full h-full object-cover"
                />
              </div>
              
              <div className="flex-1">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="text-white">{restaurant.name}</h3>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-sm text-gray-400">{restaurant.cuisine}</span>
                      <span className="text-sm text-gray-500">•</span>
                      <span className="text-sm text-gray-400">{restaurant.distance}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="text-sm text-gray-300">{restaurant.rating}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-4 mb-3">
                  <div className="flex items-center space-x-1">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span className="text-sm text-green-400">{restaurant.safeOptions} safe</span>
                  </div>
                  {restaurant.riskOptions > 0 && (
                    <div className="flex items-center space-x-1">
                      <AlertTriangle className="w-4 h-4 text-yellow-400" />
                      <span className="text-sm text-yellow-400">{restaurant.riskOptions} caution</span>
                    </div>
                  )}
                </div>

                <div className="space-y-1 mb-3">
                  {restaurant.dishes.slice(0, 2).map((dish, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm text-gray-300">{dish.name}</span>
                      <Badge 
                        variant={dish.status === 'safe' ? 'default' : 'secondary'}
                        className={`text-xs ${
                          dish.status === 'safe' 
                            ? 'bg-green-600 hover:bg-green-700 text-white' 
                            : 'bg-yellow-600 hover:bg-yellow-700 text-white'
                        }`}
                      >
                        {dish.confidence}%
                      </Badge>
                    </div>
                  ))}
                </div>

                <Button 
                  onClick={() => onNavigate('menu', { restaurant })}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                >
                  View Full Menu
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}