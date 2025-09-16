import { useState, useEffect } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

import { MapPin, Star, Clock, CheckCircle, AlertTriangle, XCircle, Loader2, Plus, Type } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { azureMapsService, Restaurant, RestaurantResponse } from "../utils/azure-maps-service";
import { LocationPermissionHelper } from "./location-permission-helper";
import { menuAnalysisService, AnalyzedMenuItem } from "../utils/menu-analysis-service";

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
  
  // Track menu items for each restaurant
  const [restaurantMenus, setRestaurantMenus] = useState<Record<string, AnalyzedMenuItem[]>>({});
  const [menuLoadingStates, setMenuLoadingStates] = useState<Record<string, boolean>>({});
  
  // Custom restaurant input
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customRestaurant, setCustomRestaurant] = useState({ name: '', cuisine: '', location: '' });
  const [isCreatingCustom, setIsCreatingCustom] = useState(false);

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
        setLocationStatus(`Found ${restaurantData.length} restaurants - loading real menus with AI analysis...`);
      }

      // Load menu previews for each restaurant
      loadMenuPreviews(restaurantData);
    } catch (err) {
      console.error('Error loading restaurants:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unable to load nearby restaurants. Please check your location permissions.';
      setError(errorMessage);
      setLocationStatus('Unable to access location');
    } finally {
      setLoading(false);
    }
  };

  const loadMenuPreviews = async (restaurantData: Restaurant[]) => {
    // Get user's actual health conditions and dietary restrictions
    const getUserProfile = () => {
      try {
        const healthConditions = JSON.parse(localStorage.getItem('gutwise-health-conditions') || '["IBS", "Lactose Intolerance"]');
        const dietaryRestrictions = JSON.parse(localStorage.getItem('gutwise-dietary-restrictions') || '["Gluten-free", "Low FODMAP"]');
        return { healthConditions, dietaryRestrictions };
      } catch {
        return { healthConditions: ['IBS', 'Lactose Intolerance'], dietaryRestrictions: ['Gluten-free', 'Low FODMAP'] };
      }
    };

    console.log(`🍽️ Loading menu data for ${restaurantData.length} restaurants (trying real API first, demo fallback available)...`);
    
    // Load menu items for each restaurant in parallel using real API
    const menuPromises = restaurantData.map(async (restaurant) => {
      try {
        // Set loading state for this restaurant
        setMenuLoadingStates(prev => ({ ...prev, [restaurant.id]: true }));
        
        console.log(`🔄 Attempting real menu API for ${restaurant.name}...`);
        
        // Use the dedicated method for real menu analysis with 10 items
        const menuItems = await menuAnalysisService.generateMenuForAnalysis({
          name: restaurant.name,
          cuisine: restaurant.cuisine,
          location: restaurant.address || 'New York, NY'
        }, getUserProfile());
        
        // Store all 10 items for this restaurant
        setRestaurantMenus(prev => ({
          ...prev,
          [restaurant.id]: menuItems
        }));
        
        console.log(`✅ Successfully loaded ${menuItems.length} menu items for ${restaurant.name}`);
      } catch (error) {
        console.log(`🔄 Menu API unavailable for ${restaurant.name}, using demo menu instead`);
        // Try to generate demo menu as fallback
        try {
          const fallbackMenuItems = await menuAnalysisService.generateAndAnalyzeMenu({
            name: restaurant.name,
            cuisine: restaurant.cuisine,
            location: restaurant.address || 'New York, NY'
          }, getUserProfile(), false); // Force demo mode
          
          setRestaurantMenus(prev => ({
            ...prev,
            [restaurant.id]: fallbackMenuItems
          }));
          console.log(`📋 Generated ${fallbackMenuItems.length} demo menu items for ${restaurant.name}`);
        } catch (fallbackError) {
          console.error(`Failed to generate fallback menu for ${restaurant.name}:`, fallbackError);
          setRestaurantMenus(prev => ({
            ...prev,
            [restaurant.id]: []
          }));
        }
      } finally {
        setMenuLoadingStates(prev => ({ ...prev, [restaurant.id]: false }));
      }
    });

    // Wait for all menu requests to complete
    await Promise.allSettled(menuPromises);
    console.log('🎉 All restaurant menu data loaded');
    
    // Count how many restaurants got real vs demo data
    const totalLoaded = Object.values(restaurantMenus).filter(menu => menu.length > 0).length;
    
    // Update status to show completion
    setLocationStatus(`Found ${restaurantData.length} restaurants with AI-analyzed menus ready`);
  };

  // Helper function to calculate real safety counts
  const getRestaurantSafetyCounts = (restaurantId: string) => {
    const menuItems = restaurantMenus[restaurantId] || [];
    if (menuItems.length === 0) {
      // Fallback to mock data if no real data available
      const restaurant = restaurants.find(r => r.id === restaurantId);
      return {
        safe: restaurant?.safeOptions || 0,
        caution: restaurant?.riskOptions || 0,
        avoid: 0
      };
    }
    
    const safe = menuItems.filter(item => item.status === 'safe').length;
    const caution = menuItems.filter(item => item.status === 'caution').length;
    const avoid = menuItems.filter(item => item.status === 'avoid').length;
    
    return { safe, caution, avoid };
  };

  // Helper function to get top 2 dishes for display
  const getTopDishes = (restaurantId: string) => {
    const menuItems = restaurantMenus[restaurantId] || [];
    if (menuItems.length === 0) {
      // Fallback to mock data
      const restaurant = restaurants.find(r => r.id === restaurantId);
      return restaurant?.dishes?.slice(0, 2) || [];
    }
    
    // Return top 2 dishes sorted by confidence (from the 10 real items we loaded)
    return menuItems
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 2);
  };

  // Create custom restaurant from user input
  const handleCreateCustomRestaurant = async () => {
    if (!customRestaurant.name.trim()) return;
    
    setIsCreatingCustom(true);
    
    try {
      // Create a mock restaurant object
      const newRestaurant: Restaurant = {
        id: `custom-${Date.now()}`,
        name: customRestaurant.name.trim(),
        cuisine: customRestaurant.cuisine.trim() || 'International',
        address: customRestaurant.location.trim() || 'User specified location',
        distance: 'Custom entry',
        rating: 4.0 + Math.random() * 1, // Random rating between 4.0-5.0
        safeOptions: 0,
        riskOptions: 0,
        image: `https://images.unsplash.com/photo-${1565299624946 + Math.floor(Math.random() * 1000)}?w=400&q=80`,
        dishes: []
      };

      // Get user profile for analysis
      const getUserProfile = () => {
        try {
          const healthConditions = JSON.parse(localStorage.getItem('gutwise-health-conditions') || '[\"IBS\", \"Lactose Intolerance\"]');
          const dietaryRestrictions = JSON.parse(localStorage.getItem('gutwise-dietary-restrictions') || '[\"Gluten-free\", \"Low FODMAP\"]');
          return { healthConditions, dietaryRestrictions };
        } catch {
          return { healthConditions: ['IBS', 'Lactose Intolerance'], dietaryRestrictions: ['Gluten-free', 'Low FODMAP'] };
        }
      };

      // Generate menu analysis for the custom restaurant
      setMenuLoadingStates(prev => ({ ...prev, [newRestaurant.id]: true }));
      
      const menuItems = await menuAnalysisService.generateAndAnalyzeMenu({
        name: newRestaurant.name,
        cuisine: newRestaurant.cuisine,
        location: newRestaurant.address
      }, getUserProfile(), false); // Force mock mode for custom restaurants

      // Store the menu items
      setRestaurantMenus(prev => ({
        ...prev,
        [newRestaurant.id]: menuItems
      }));

      // Add the custom restaurant to the list (at the top)
      setRestaurants(prev => [newRestaurant, ...prev]);
      
      // Reset form and hide input
      setCustomRestaurant({ name: '', cuisine: '', location: '' });
      setShowCustomInput(false);
      
      console.log(`✅ Created custom restaurant "${newRestaurant.name}" with ${menuItems.length} analyzed menu items`);
      
    } catch (error) {
      console.error('Error creating custom restaurant:', error);
    } finally {
      setIsCreatingCustom(false);
      setMenuLoadingStates(prev => ({ ...prev, [`custom-${Date.now()}`]: false }));
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

      {/* Add Custom Restaurant Button */}
      {!showCustomInput && !loading && (
        <Card className="bg-gray-800 border-gray-700 p-4">
          <Button
            onClick={() => setShowCustomInput(true)}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white flex items-center justify-center space-x-2"
          >
            <Type className="w-4 h-4" />
            <span>Type Restaurant Name</span>
          </Button>
          <p className="text-gray-400 text-xs text-center mt-2">
            Can't find the restaurant you're looking for? Add it manually and get AI menu analysis.
          </p>
        </Card>
      )}

      {/* Custom Restaurant Input Form */}
      {showCustomInput && (
        <Card className="bg-gray-800 border-gray-700 p-4 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-white">Add Custom Restaurant</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setShowCustomInput(false);
                setCustomRestaurant({ name: '', cuisine: '', location: '' });
              }}
              className="text-gray-400 hover:text-white"
            >
              ✕
            </Button>
          </div>
          
          <div>
            <Label className="text-gray-300">Restaurant Name *</Label>
            <Input
              value={customRestaurant.name}
              onChange={(e) => setCustomRestaurant(prev => ({ ...prev, name: e.target.value }))}
              placeholder="e.g., Joe's Pizza, The Italian Corner"
              className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400"
            />
          </div>

          <div>
            <Label className="text-gray-300">Cuisine Type</Label>
            <Input
              value={customRestaurant.cuisine}
              onChange={(e) => setCustomRestaurant(prev => ({ ...prev, cuisine: e.target.value }))}
              placeholder="e.g., Italian, Mexican, Asian"
              className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400"
            />
          </div>

          <div>
            <Label className="text-gray-300">Location (Optional)</Label>
            <Input
              value={customRestaurant.location}
              onChange={(e) => setCustomRestaurant(prev => ({ ...prev, location: e.target.value }))}
              placeholder="e.g., Downtown, 123 Main St"
              className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400"
            />
          </div>

          <Button
            onClick={handleCreateCustomRestaurant}
            disabled={!customRestaurant.name.trim() || isCreatingCustom}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white"
          >
            {isCreatingCustom ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating AI Menu Analysis...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 mr-2" />
                Create & Analyze Menu
              </>
            )}
          </Button>
        </Card>
      )}

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
                  {(() => {
                    const safetyCounts = getRestaurantSafetyCounts(restaurant.id);
                    const isLoading = menuLoadingStates[restaurant.id];
                    
                    return (
                      <>
                        <div className="flex items-center space-x-1">
                          <CheckCircle className="w-4 h-4 text-green-400" />
                          <span className="text-sm text-green-400">
                            {isLoading ? '...' : safetyCounts.safe} safe
                          </span>
                        </div>
                        {(safetyCounts.caution > 0 || isLoading) && (
                          <div className="flex items-center space-x-1">
                            <AlertTriangle className="w-4 h-4 text-yellow-400" />
                            <span className="text-sm text-yellow-400">
                              {isLoading ? '...' : safetyCounts.caution} caution
                            </span>
                          </div>
                        )}
                        {safetyCounts.avoid > 0 && !isLoading && (
                          <div className="flex items-center space-x-1">
                            <XCircle className="w-4 h-4 text-red-400" />
                            <span className="text-sm text-red-400">
                              {safetyCounts.avoid} avoid
                            </span>
                          </div>
                        )}
                      </>
                    );
                  })()}
                </div>

                <div className="space-y-1 mb-3">
                  {menuLoadingStates[restaurant.id] ? (
                    [1, 2].map((i) => (
                      <div key={i} className="flex items-center justify-between animate-pulse">
                        <div className="h-3 bg-gray-700 rounded w-3/4"></div>
                        <div className="h-4 bg-gray-700 rounded w-12"></div>
                      </div>
                    ))
                  ) : getTopDishes(restaurant.id).map((dish: any, index: number) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm text-gray-300">{dish.name}</span>
                      <Badge 
                        variant={dish.status === 'safe' ? 'default' : 'secondary'}
                        className={`text-xs flex-shrink-0 ${
                          dish.status === 'safe' 
                            ? 'bg-green-600 hover:bg-green-700 text-white' 
                            : dish.status === 'caution'
                              ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
                              : 'bg-red-600 hover:bg-red-700 text-white'
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
                  {restaurantMenus[restaurant.id] && restaurantMenus[restaurant.id].length > 0 && !menuLoadingStates[restaurant.id] 
                    ? 'View All 10 Analyzed Dishes' 
                    : 'View Full Menu'
                  }
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