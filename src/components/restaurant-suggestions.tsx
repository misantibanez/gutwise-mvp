import { useState, useEffect } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";

import { MapPin, Star, Clock, CheckCircle, AlertTriangle, Loader2 } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { azureMapsService, Restaurant, RestaurantResponse } from "../utils/azure-maps-service";
import { LocationPermissionHelper } from "./location-permission-helper";

interface RestaurantSuggestionsProps {
  onNavigate: (screen: string, data?: any) => void;
  onBack: () => void;
}

export function RestaurantSuggestions({ onNavigate, onBack }: RestaurantSuggestionsProps) {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [locationStatus, setLocationStatus] = useState<string>('Getting your location...');
  const [locationName, setLocationName] = useState<string | null>(null);
  const [isUsingMockData, setIsUsingMockData] = useState(false);
  const [isUsingDefaultLocation, setIsUsingDefaultLocation] = useState(false);

  useEffect(() => {
    loadNearbyRestaurants();
  }, []);

  const loadNearbyRestaurants = async () => {
    try {
      setLoading(true);
      setError(null);
      setLocationStatus('Getting your location...');
      
      const response: RestaurantResponse = await azureMapsService.getNearbyRestaurants();
      const { restaurants: restaurantData, isUsingDefaultLocation: usingDefault, locationName: locName } = response;
      
      setRestaurants(restaurantData);
      setIsUsingDefaultLocation(usingDefault);
      setLocationName(locName || null);
      
      // Check if we're using mock data (they will have IDs starting with 'mock-')
      const usingMockData = restaurantData.some(r => r.id.startsWith('mock-'));
      setIsUsingMockData(usingMockData);
      
      if (usingMockData) {
        setLocationStatus(`Showing demo restaurants (location unavailable)`);
      } else if (usingDefault) {
        setLocationStatus(`Showing nearby restaurants (using default location)`);
      } else {
        setLocationStatus(`Found ${restaurantData.length} restaurants with safe options nearby`);
      }
    } catch (err) {
      console.error('Error loading restaurants:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unable to load nearby restaurants. Please check your location permissions.';
      setError(errorMessage);
      setLocationStatus('Unable to access location');
    } finally {
      setLoading(false);
    }
  };

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

      {/* Location Permission Helper */}
      <LocationPermissionHelper 
        show={isUsingDefaultLocation && !loading && !error}
        onRetry={loadNearbyRestaurants}
      />

      {/* Location Info */}
      <Card className="bg-gray-800 border-gray-700 p-4">
        <div className="flex items-center space-x-2 mb-2">
          <MapPin className="w-4 h-4 text-blue-400" />
          <span className="text-blue-400">Your Location</span>
          {loading && <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />}
        </div>
        
        {/* Display location name if available */}
        {locationName && !loading && (
          <div className="mb-2">
            <p className="text-white font-medium">{locationName}</p>
          </div>
        )}
        
        <p className="text-gray-300 text-sm">{locationStatus}</p>
        {(isUsingMockData || isUsingDefaultLocation) && (
          <div className="mt-2 p-2 bg-blue-900/30 rounded border border-blue-700">
            <p className="text-blue-300 text-xs">
              {isUsingMockData 
                ? "📍 Demo mode: Showing sample restaurants. Enable location for real nearby restaurants."
                : "📍 Using default location: Enable location permissions for personalized results."
              }
            </p>
          </div>
        )}
        {error && (
          <div className="mt-2 flex items-center justify-between">
            <p className="text-red-400 text-sm">{error}</p>
            <Button 
              onClick={loadNearbyRestaurants}
              variant="outline"
              size="sm"
              className="text-blue-400 border-blue-400 hover:bg-blue-400/10"
            >
              Retry
            </Button>
          </div>
        )}
      </Card>

      {/* Loading State */}
      {loading && (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="bg-gray-800 border-gray-700 p-4">
              <div className="flex space-x-4">
                <div className="w-20 h-20 rounded-lg bg-gray-700 animate-pulse"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-700 rounded animate-pulse"></div>
                  <div className="h-3 bg-gray-700 rounded w-2/3 animate-pulse"></div>
                  <div className="h-3 bg-gray-700 rounded w-1/2 animate-pulse"></div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Restaurant List */}
      {!loading && restaurants.length > 0 && (
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
                    <span className="text-sm text-gray-300">{restaurant.rating.toFixed(1)}</span>
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
      )}

      {/* Empty State */}
      {!loading && restaurants.length === 0 && !error && (
        <Card className="bg-gray-800 border-gray-700 p-8 text-center">
          <MapPin className="w-12 h-12 text-gray-500 mx-auto mb-4" />
          <h3 className="text-white mb-2">No Restaurants Found</h3>
          <p className="text-gray-400 mb-4">
            We couldn't find any restaurants in your area. Try expanding your search radius or check your location settings.
          </p>
          <Button 
            onClick={loadNearbyRestaurants}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Try Again
          </Button>
        </Card>
      )}
    </div>
  );
}