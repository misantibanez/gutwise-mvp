import { useState, useEffect } from 'react';
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { MapPin, Loader2, AlertCircle, Utensils } from "lucide-react";
import { geolocationService, Location, Restaurant } from "../utils/location/geolocation";
import { restaurantsAPI, menuAnalysisAPI } from "../utils/api/restaurants";

interface RestaurantDetectorProps {
  onRestaurantFound?: (restaurant: Restaurant) => void;
  onMenuAnalysisRequested?: (restaurant: Restaurant) => void;
}

export function RestaurantDetector({ onRestaurantFound, onMenuAnalysisRequested }: RestaurantDetectorProps) {
  const [isWatching, setIsWatching] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<Location | null>(null);
  const [nearbyRestaurants, setNearbyRestaurants] = useState<Restaurant[]>([]);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [isLoadingRestaurants, setIsLoadingRestaurants] = useState(false);
  const [error, setError] = useState("");
  const [permissionStatus, setPermissionStatus] = useState<'granted' | 'denied' | 'prompt' | 'unknown'>('unknown');

  useEffect(() => {
    // Check geolocation permission status
    if ('permissions' in navigator) {
      navigator.permissions.query({ name: 'geolocation' }).then((result) => {
        setPermissionStatus(result.state);
      });
    }

    // Set up geolocation callbacks
    geolocationService.onLocationChange((location) => {
      console.log('Location changed:', location);
      setCurrentLocation(location);
    });

    geolocationService.onRestaurantsFound((restaurants) => {
      console.log('Restaurants found:', restaurants);
      setNearbyRestaurants(restaurants);
      setIsLoadingRestaurants(false);
      
      // Notify parent component if callback provided
      if (restaurants.length > 0 && onRestaurantFound) {
        onRestaurantFound(restaurants[0]); // Notify about closest restaurant
      }
    });

    return () => {
      stopWatching();
    };
  }, []);

  const startWatching = async () => {
    try {
      setError("");
      setIsLoadingLocation(true);
      
      // Get initial location
      const location = await geolocationService.getCurrentLocation();
      setCurrentLocation(location);
      
      // Start watching for location changes
      geolocationService.startWatching();
      setIsWatching(true);
      
      // Find nearby restaurants immediately
      await findNearbyRestaurants(location);
      
    } catch (err) {
      console.error('Failed to start location watching:', err);
      setError("Failed to access location. Please enable location permissions.");
      setPermissionStatus('denied');
    } finally {
      setIsLoadingLocation(false);
    }
  };

  const stopWatching = () => {
    geolocationService.stopWatching();
    setIsWatching(false);
  };

  const findNearbyRestaurants = async (location: Location) => {
    try {
      setIsLoadingRestaurants(true);
      const response = await restaurantsAPI.findNearby(location.latitude, location.longitude, 0.2); // 200m radius
      setNearbyRestaurants(response.restaurants);
    } catch (err) {
      console.error('Failed to find nearby restaurants:', err);
      setError("Failed to find nearby restaurants");
    } finally {
      setIsLoadingRestaurants(false);
    }
  };

  const analyzeRestaurantMenu = async (restaurant: Restaurant) => {
    if (onMenuAnalysisRequested) {
      onMenuAnalysisRequested(restaurant);
    }
  };

  const getPermissionStatusMessage = () => {
    switch (permissionStatus) {
      case 'denied':
        return "Location access denied. Please enable location permissions in your browser settings.";
      case 'granted':
        return "Location access granted";
      case 'prompt':
        return "Click to enable location access";
      default:
        return "Location status unknown";
    }
  };

  const getSafetyColor = (cuisineType?: string) => {
    switch (cuisineType?.toLowerCase()) {
      case 'healthy':
      case 'mediterranean':
        return 'text-green-400';
      case 'fast food':
      case 'fried':
        return 'text-red-400';
      default:
        return 'text-yellow-400';
    }
  };

  return (
    <Card className="bg-gray-800 border-gray-700 p-4">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <MapPin className="w-5 h-5 text-blue-400" />
            <h3 className="text-white">Restaurant Detection</h3>
          </div>
          
          {isWatching ? (
            <Button 
              onClick={stopWatching}
              variant="outline"
              size="sm"
              className="border-red-500 text-red-400 hover:bg-red-500/10"
            >
              Stop Watching
            </Button>
          ) : (
            <Button 
              onClick={startWatching}
              disabled={isLoadingLocation}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isLoadingLocation ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Finding Location...
                </>
              ) : (
                'Start Detection'
              )}
            </Button>
          )}
        </div>

        {/* Permission Status */}
        {permissionStatus !== 'granted' && (
          <div className="flex items-center space-x-2 text-sm">
            <AlertCircle className="w-4 h-4 text-yellow-400" />
            <span className="text-gray-400">{getPermissionStatusMessage()}</span>
          </div>
        )}

        {/* Current Location */}
        {currentLocation && (
          <div className="text-sm text-gray-400">
            Location: {currentLocation.latitude.toFixed(6)}, {currentLocation.longitude.toFixed(6)}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="flex items-center space-x-2 p-3 bg-red-500/10 border border-red-500/20 rounded">
            <AlertCircle className="w-4 h-4 text-red-400" />
            <span className="text-red-400 text-sm">{error}</span>
          </div>
        )}

        {/* Loading Restaurants */}
        {isLoadingRestaurants && (
          <div className="flex items-center space-x-2 text-gray-400">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm">Searching for nearby restaurants...</span>
          </div>
        )}

        {/* Nearby Restaurants */}
        {nearbyRestaurants.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-white font-medium">Nearby Restaurants</h4>
            {nearbyRestaurants.map((restaurant) => (
              <Card key={restaurant.id} className="bg-gray-700 border-gray-600 p-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <Utensils className="w-4 h-4 text-blue-400" />
                      <h5 className="text-white font-medium">{restaurant.name}</h5>
                    </div>
                    <p className="text-sm text-gray-400 mb-1">{restaurant.address}</p>
                    <div className="flex items-center space-x-3 text-xs">
                      <span className="text-gray-500">
                        {(restaurant.distance! * 1000).toFixed(0)}m away
                      </span>
                      {restaurant.cuisine_type && (
                        <span className={getSafetyColor(restaurant.cuisine_type)}>
                          {restaurant.cuisine_type}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <Button
                    onClick={() => analyzeRestaurantMenu(restaurant)}
                    size="sm"
                    className="bg-green-600 hover:bg-green-700 text-white ml-2"
                  >
                    Analyze Menu
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* No Restaurants Found */}
        {isWatching && !isLoadingRestaurants && nearbyRestaurants.length === 0 && currentLocation && (
          <div className="text-center text-gray-400 py-4">
            <Utensils className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No restaurants found nearby</p>
            <p className="text-xs text-gray-500 mt-1">Try moving to a different location</p>
          </div>
        )}
      </div>
    </Card>
  );
}