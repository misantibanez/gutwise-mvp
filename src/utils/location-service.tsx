// Mock location service for demo purposes
import { mockAPI, Restaurant, mockUserLocation } from './mock-data';

export interface LocationData {
  latitude: number;
  longitude: number;
  address?: string;
}

export interface NearbyRestaurant extends Restaurant {
  menuAnalyzed?: boolean;
  safeOptionsCount?: number;
}

class MockLocationService {
  private currentLocation: LocationData | null = null;
  private isWatching = false;

  // Simulate getting current location
  async getCurrentLocation(): Promise<LocationData> {
    // Simulate GPS loading time
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    this.currentLocation = {
      latitude: mockUserLocation.latitude,
      longitude: mockUserLocation.longitude,
      address: mockUserLocation.address
    };

    return this.currentLocation;
  }

  // Simulate finding nearby restaurants with AI analysis
  async findNearbyRestaurants(location?: LocationData): Promise<NearbyRestaurant[]> {
    // Use provided location or current location
    const searchLocation = location || this.currentLocation || mockUserLocation;
    
    // Simulate API call time
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    // Get restaurants from mock API
    const result = await mockAPI.getNearbyRestaurants({
      lat: searchLocation.latitude,
      lng: searchLocation.longitude
    });

    // Simulate AI analysis for each restaurant
    const analyzedRestaurants: NearbyRestaurant[] = result.restaurants.map((restaurant, index) => ({
      ...restaurant,
      menuAnalyzed: true,
      safeOptionsCount: Math.floor(Math.random() * 8) + 2, // 2-10 safe options
      distance: `${(0.1 + index * 0.1).toFixed(1)} miles` // Simulate increasing distance
    }));

    return analyzedRestaurants;
  }

  // Simulate real-time location watching
  startLocationWatch(callback: (location: LocationData) => void): void {
    if (this.isWatching) return;
    
    this.isWatching = true;
    
    // Simulate initial location detection
    setTimeout(async () => {
      try {
        const location = await this.getCurrentLocation();
        callback(location);
      } catch (error) {
        console.error('Location watch error:', error);
      }
    }, 2000);

    // Simulate periodic location updates (every 30 seconds in demo)
    const watchInterval = setInterval(async () => {
      if (!this.isWatching) {
        clearInterval(watchInterval);
        return;
      }

      // Simulate small location changes
      if (this.currentLocation) {
        const updatedLocation = {
          ...this.currentLocation,
          latitude: this.currentLocation.latitude + (Math.random() - 0.5) * 0.001,
          longitude: this.currentLocation.longitude + (Math.random() - 0.5) * 0.001
        };
        
        this.currentLocation = updatedLocation;
        callback(updatedLocation);
      }
    }, 30000); // 30 seconds
  }

  stopLocationWatch(): void {
    this.isWatching = false;
  }

  // Get restaurants detected at current location
  async getRestaurantsAtLocation(): Promise<NearbyRestaurant[]> {
    const restaurants = await this.findNearbyRestaurants();
    
    // Filter to very close restaurants (simulating being "at" a restaurant)
    return restaurants.filter((_, index) => index < 2); // Show only closest 2
  }

  // Simulate detecting when user is at a specific restaurant
  async detectCurrentRestaurant(): Promise<Restaurant | null> {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Simulate being at "La Nonna Ristorante" for demo
    const nearbyRestaurants = await this.findNearbyRestaurants();
    return nearbyRestaurants.find(r => r.name === 'La Nonna Ristorante') || null;
  }

  // Check if user location permission is granted
  async checkLocationPermission(): Promise<boolean> {
    // Simulate permission check
    await new Promise(resolve => setTimeout(resolve, 200));
    return true; // Always granted in demo mode
  }

  // Request location permission
  async requestLocationPermission(): Promise<boolean> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return true; // Always granted in demo mode
  }
}

export const locationService = new MockLocationService();