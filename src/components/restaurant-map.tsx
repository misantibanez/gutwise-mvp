import { useState, useEffect, useRef } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { MapPin, List, Navigation, Star, CheckCircle, AlertTriangle, XCircle, Loader2 } from "lucide-react";
import { azureMapsService, Restaurant } from "../utils/azure-maps-service";
import { menuAnalysisService, AnalyzedMenuItem } from "../utils/menu-analysis-service";

interface RestaurantMapProps {
  onNavigate: (screen: string, data?: any) => void;
  onBack: () => void;
  onToggleView: () => void;
}

// Azure Maps types
declare global {
  interface Window {
    atlas: any;
  }
}

export function RestaurantMap({ onNavigate, onBack, onToggleView }: RestaurantMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  
  // Track menu items for selected restaurant
  const [restaurantMenus, setRestaurantMenus] = useState<Record<string, AnalyzedMenuItem[]>>({});
  const [menuLoadingStates, setMenuLoadingStates] = useState<Record<string, boolean>>({});

  // Load Azure Maps SDK
  useEffect(() => {
    const loadAzureMapsSDK = () => {
      return new Promise<void>((resolve, reject) => {
        if (window.atlas) {
          resolve();
          return;
        }

        const script = document.createElement('script');
        script.src = 'https://atlas.microsoft.com/sdk/javascript/mapcontrol/3/atlas.min.js';
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('Failed to load Azure Maps SDK'));
        document.head.appendChild(script);

        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://atlas.microsoft.com/sdk/javascript/mapcontrol/3/atlas.min.css';
        document.head.appendChild(link);
      });
    };

    loadAzureMapsSDK()
      .then(() => setMapLoaded(true))
      .catch((err) => setError('Failed to load map'));
  }, []);

  // Load restaurants
  useEffect(() => {
    loadNearbyRestaurants();
  }, []);

  // Initialize map when SDK is loaded and restaurants are available
  useEffect(() => {
    if (mapLoaded && restaurants.length > 0 && mapRef.current && !mapInstanceRef.current) {
      initializeMap();
    }
  }, [mapLoaded, restaurants]);

  const loadNearbyRestaurants = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await azureMapsService.getNearbyRestaurants();
      const { restaurants: restaurantData, isUsingDefaultLocation, locationName } = response;
      
      setRestaurants(restaurantData);
      
      // Store user location for directions
      if (!isUsingDefaultLocation) {
        // Try to get current location
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              setUserLocation({
                lat: position.coords.latitude,
                lng: position.coords.longitude
              });
            },
            () => {
              // Use default NYC location if geolocation fails
              setUserLocation({ lat: 40.7128, lng: -74.0060 });
            }
          );
        }
      } else {
        // Use default NYC location
        setUserLocation({ lat: 40.7128, lng: -74.0060 });
      }
    } catch (err) {
      console.error('Error loading restaurants:', err);
      setError('Unable to load nearby restaurants');
    } finally {
      setLoading(false);
    }
  };

  const initializeMap = () => {
    if (!window.atlas || !mapRef.current) return;

    // Calculate center point from restaurants
    const centerLat = restaurants.reduce((sum, r) => sum + r.coordinates.lat, 0) / restaurants.length;
    const centerLng = restaurants.reduce((sum, r) => sum + r.coordinates.lng, 0) / restaurants.length;

    // Initialize the map
    const map = new window.atlas.Map(mapRef.current, {
      center: [centerLng, centerLat],
      zoom: 14,
      style: 'night', // Dark theme to match app
      language: 'en-US',
      authOptions: {
        authType: 'subscriptionKey',
        subscriptionKey: 'AapXwnbdXyKhB7T4tFgPaDVcS7WvZcA1l4_3aP31Q2sVkH1GV8Bc7WZMjR9s2Zat' // Replace with env var in production
      }
    });

    mapInstanceRef.current = map;

    map.events.add('ready', () => {
      const datasource = new window.atlas.source.DataSource();
      map.sources.add(datasource);

      // Add restaurant markers
      const points = restaurants.map(restaurant => {
        const point = new window.atlas.data.Feature(
          new window.atlas.data.Point([restaurant.coordinates.lng, restaurant.coordinates.lat]),
          {
            id: restaurant.id,
            name: restaurant.name,
            cuisine: restaurant.cuisine,
            rating: restaurant.rating,
            safeOptions: restaurant.safeOptions,
            riskOptions: restaurant.riskOptions
          }
        );
        return point;
      });

      datasource.add(points);

      // Create symbol layer for restaurants
      const symbolLayer = new window.atlas.layer.SymbolLayer(datasource, null, {
        iconOptions: {
          image: 'marker-red',
          allowOverlap: true,
          anchor: 'bottom',
          size: 0.8
        },
        textOptions: {
          textField: ['get', 'name'],
          color: '#ffffff',
          offset: [0, -2.5],
          size: 12,
          font: ['StandardFont-Bold']
        }
      });

      map.layers.add(symbolLayer);

      // Add click event for markers
      map.events.add('click', symbolLayer, (e: any) => {
        if (e.shapes && e.shapes.length > 0) {
          const properties = e.shapes[0].getProperties();
          const restaurant = restaurants.find(r => r.id === properties.id);
          if (restaurant) {
            setSelectedRestaurant(restaurant);
            loadRestaurantMenu(restaurant);
          }
        }
      });

      // Add user location marker if available
      if (userLocation) {
        const userPoint = new window.atlas.data.Feature(
          new window.atlas.data.Point([userLocation.lng, userLocation.lat]),
          { type: 'user-location' }
        );
        
        const userDatasource = new window.atlas.source.DataSource();
        userDatasource.add(userPoint);
        map.sources.add(userDatasource);

        const userLayer = new window.atlas.layer.SymbolLayer(userDatasource, null, {
          iconOptions: {
            image: 'marker-blue',
            allowOverlap: true,
            anchor: 'center',
            size: 0.6
          }
        });

        map.layers.add(userLayer);
      }
    });
  };

  const loadRestaurantMenu = async (restaurant: Restaurant) => {
    if (restaurantMenus[restaurant.id]) return; // Already loaded

    try {
      setMenuLoadingStates(prev => ({ ...prev, [restaurant.id]: true }));
      
      const menuItems = await menuAnalysisService.generateAndAnalyzeMenu({
        name: restaurant.name,
        cuisine: restaurant.cuisine,
        location: restaurant.address || 'New York, NY'
      });
      
      setRestaurantMenus(prev => ({
        ...prev,
        [restaurant.id]: menuItems
      }));
    } catch (error) {
      console.error(`Failed to load menu for ${restaurant.name}:`, error);
      setRestaurantMenus(prev => ({
        ...prev,
        [restaurant.id]: []
      }));
    } finally {
      setMenuLoadingStates(prev => ({ ...prev, [restaurant.id]: false }));
    }
  };

  const getRestaurantSafetyCounts = (restaurantId: string) => {
    const menuItems = restaurantMenus[restaurantId] || [];
    if (menuItems.length === 0) {
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

  const getTopDishes = (restaurantId: string) => {
    const menuItems = restaurantMenus[restaurantId] || [];
    if (menuItems.length === 0) {
      const restaurant = restaurants.find(r => r.id === restaurantId);
      return restaurant?.dishes?.slice(0, 2) || [];
    }
    
    return menuItems
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 2);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between py-4">
          <Button 
            variant="ghost" 
            onClick={onBack}
            className="text-gray-300 hover:text-white hover:bg-gray-800"
          >
            ← Back
          </Button>
          <h2 className="text-white">Restaurant Map</h2>
          <Button
            variant="ghost"
            onClick={onToggleView}
            className="text-gray-300 hover:text-white hover:bg-gray-800"
          >
            <List className="w-4 h-4" />
          </Button>
        </div>
        
        <div className="h-96 bg-gray-800 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-8 h-8 text-blue-400 animate-spin mx-auto mb-2" />
            <p className="text-gray-300">Loading map...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between py-4">
          <Button 
            variant="ghost" 
            onClick={onBack}
            className="text-gray-300 hover:text-white hover:bg-gray-800"
          >
            ← Back
          </Button>
          <h2 className="text-white">Restaurant Map</h2>
          <Button
            variant="ghost"
            onClick={onToggleView}
            className="text-gray-300 hover:text-white hover:bg-gray-800"
          >
            <List className="w-4 h-4" />
          </Button>
        </div>
        
        <Card className="bg-gray-800 border-gray-700 p-8 text-center">
          <h3 className="text-white mb-2">Map Unavailable</h3>
          <p className="text-gray-400 mb-4">{error}</p>
          <Button 
            onClick={loadNearbyRestaurants}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Try Again
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between py-4">
        <Button 
          variant="ghost" 
          onClick={onBack}
          className="text-gray-300 hover:text-white hover:bg-gray-800"
        >
          ← Back
        </Button>
        <h2 className="text-white">Restaurant Map</h2>
        <Button
          variant="ghost"
          onClick={onToggleView}
          className="text-gray-300 hover:text-white hover:bg-gray-800"
        >
          <List className="w-4 h-4" />
        </Button>
      </div>

      {/* Map Container */}
      <div className="relative">
        <div 
          ref={mapRef} 
          className="h-80 w-full rounded-lg overflow-hidden border border-gray-700"
          style={{ minHeight: '320px' }}
        />
        
        {!mapLoaded && (
          <div className="absolute inset-0 bg-gray-800 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <Loader2 className="w-6 h-6 text-blue-400 animate-spin mx-auto mb-2" />
              <p className="text-gray-300 text-sm">Loading map...</p>
            </div>
          </div>
        )}
      </div>

      {/* Instructions */}
      <Card className="bg-gray-800 border-gray-700 p-3">
        <div className="flex items-center space-x-2">
          <MapPin className="w-4 h-4 text-blue-400" />
          <p className="text-gray-300 text-sm">
            Tap on any restaurant marker to view details and menu options
          </p>
        </div>
      </Card>

      {/* Selected Restaurant Details */}
      {selectedRestaurant && (
        <Card className="bg-gray-800 border-gray-700 p-4">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="text-white">{selectedRestaurant.name}</h3>
              <div className="flex items-center space-x-2 mt-1">
                <span className="text-sm text-gray-400">{selectedRestaurant.cuisine}</span>
                <span className="text-sm text-gray-500">•</span>
                <span className="text-sm text-gray-400">{selectedRestaurant.distance}</span>
              </div>
            </div>
            <div className="flex items-center space-x-1">
              <Star className="w-4 h-4 text-yellow-400 fill-current" />
              <span className="text-sm text-gray-300">{selectedRestaurant.rating.toFixed(1)}</span>
            </div>
          </div>

          {/* Safety Counts */}
          <div className="flex items-center space-x-4 mb-3">
            {(() => {
              const safetyCounts = getRestaurantSafetyCounts(selectedRestaurant.id);
              const isLoading = menuLoadingStates[selectedRestaurant.id];
              
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

          {/* Top Dishes */}
          <div className="space-y-1 mb-3">
            {menuLoadingStates[selectedRestaurant.id] ? (
              <>
                <div className="flex items-center space-x-2 mb-2">
                  <Loader2 className="w-3 h-3 text-blue-400 animate-spin" />
                  <span className="text-xs text-blue-400">Loading top dishes...</span>
                </div>
                {[1, 2].map((i) => (
                  <div key={i} className="flex items-center justify-between animate-pulse">
                    <div className="h-3 bg-gray-700 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-700 rounded w-12"></div>
                  </div>
                ))}
              </>
            ) : (
              getTopDishes(selectedRestaurant.id).map((dish: any, index: number) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm text-gray-300 truncate pr-2" title={dish.name}>
                    {dish.name}
                  </span>
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
              ))
            )}
          </div>

          <Button 
            onClick={() => onNavigate('menu', { restaurant: selectedRestaurant })}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            View Full Menu
          </Button>
        </Card>
      )}
    </div>
  );
}