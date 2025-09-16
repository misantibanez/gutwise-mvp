import { geolocationService, Location } from './location/geolocation';
import { requestLocationWithTimeout, getLocationErrorMessage } from './location-utils';

// Azure Maps API configuration
const AZURE_MAPS_API_KEY = '';
const AZURE_MAPS_BASE_URL = 'https://atlas.microsoft.com/search/poi/category/json';

// Interface for Azure Maps API response
interface AzureMapsResult {
  type: string;
  id: string;
  score: number;
  dist: number;
  poi: {
    name: string;
    phone?: string;
    categorySet: Array<{ id: number }>;
    categories: string[];
    classifications: Array<{
      code: string;
      names: Array<{
        nameLocale: string;
        name: string;
      }>;
    }>;
  };
  address: {
    streetNumber?: string;
    streetName?: string;
    municipality: string;
    countrySubdivision: string;
    postalCode?: string;
    freeformAddress: string;
  };
  position: {
    lat: number;
    lon: number;
  };
}

interface AzureMapsResponse {
  summary: {
    query: string;
    numResults: number;
    totalResults: number;
  };
  results: AzureMapsResult[];
}

// Restaurant interface matching the app's expected format
export interface Restaurant {
  id: string;
  name: string;
  cuisine: string;
  distance: string;
  rating: number;
  safeOptions: number;
  riskOptions: number;
  image: string;
  dishes: Array<{
    name: string;
    status: 'safe' | 'caution' | 'risk';
    confidence: number;
  }>;
  address: string;
  phone?: string;
  categories: string[];
  position: {
    lat: number;
    lon: number;
  };
}

export interface RestaurantResponse {
  restaurants: Restaurant[];
  isUsingDefaultLocation: boolean;
  locationName?: string;
  currentLocation?: Location;
}

class AzureMapsService {
  private async reverseGeocode(location: Location): Promise<string | null> {
    try {
      const url = new URL('https://atlas.microsoft.com/search/address/reverse/json');
      url.searchParams.append('api-version', '1.0');
      url.searchParams.append('subscription-key', AZURE_MAPS_API_KEY);
      url.searchParams.append('query', `${location.latitude},${location.longitude}`);

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        console.warn('Reverse geocoding failed:', response.status);
        return null;
      }

      const data = await response.json();
      
      if (data.addresses && data.addresses.length > 0) {
        const address = data.addresses[0].address;
        // Format as "City, State" or "Municipality, CountrySubdivision"
        if (address.municipality && address.countrySubdivision) {
          return `${address.municipality}, ${address.countrySubdivision}`;
        } else if (address.freeformAddress) {
          // Fallback to full address, but try to extract city/state
          const parts = address.freeformAddress.split(',');
          if (parts.length >= 2) {
            return `${parts[parts.length - 2].trim()}, ${parts[parts.length - 1].trim()}`;
          }
          return address.freeformAddress;
        }
      }
      
      return null;
    } catch (error) {
      console.error('Error in reverse geocoding:', error);
      return null;
    }
  }

  private async fetchRestaurants(location: Location, radius: number = 2000): Promise<AzureMapsResult[]> {
    try {
      const url = new URL(AZURE_MAPS_BASE_URL);
      url.searchParams.append('api-version', '1.0');
      url.searchParams.append('subscription-key', AZURE_MAPS_API_KEY);
      url.searchParams.append('query', 'restaurants');
      url.searchParams.append('lat', location.latitude.toString());
      url.searchParams.append('lon', location.longitude.toString());
      url.searchParams.append('radius', radius.toString());
      url.searchParams.append('limit', '20'); // Get up to 20 restaurants

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });
      
      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          throw new Error('Unable to access restaurant data. Please try again later.');
        } else if (response.status === 429) {
          throw new Error('Too many requests. Please wait a moment and try again.');
        } else {
          throw new Error(`Service temporarily unavailable (${response.status}). Please try again later.`);
        }
      }

      const data: AzureMapsResponse = await response.json();
      
      if (!data.results || data.results.length === 0) {
        console.log('No restaurants found in Azure Maps response');
        return [];
      }
      
      return data.results;
    } catch (error) {
      console.error('Error fetching restaurants from Azure Maps:', error);
      throw error;
    }
  }

  private generateMockDishes(categories: string[]): Array<{ name: string; status: 'safe' | 'caution' | 'risk'; confidence: number }> {
    // Generate mock dishes based on cuisine type
    const dishTemplates: Record<string, string[]> = {
      italian: ['Grilled Salmon', 'Caesar Salad (no croutons)', 'Margherita Pizza', 'Chicken Parmesan', 'Risotto'],
      american: ['Grilled Chicken Breast', 'Garden Salad', 'Burger (no bun)', 'Grilled Vegetables', 'Steak'],
      asian: ['Steamed Rice', 'Grilled Chicken Teriyaki', 'Vegetable Stir Fry', 'Miso Soup', 'Sashimi'],
      mexican: ['Grilled Chicken Fajitas', 'Rice Bowl', 'Guacamole', 'Black Bean Salad', 'Fish Tacos'],
      mediterranean: ['Grilled Fish', 'Greek Salad', 'Hummus', 'Chicken Souvlaki', 'Quinoa Bowl'],
      chinese: ['Steamed Vegetables', 'Chicken and Broccoli', 'Plain Rice', 'Hot and Sour Soup', 'Steamed Fish'],
      japanese: ['Miso Soup', 'Salmon Teriyaki', 'Edamame', 'California Roll', 'Chicken Katsu'],
      indian: ['Tandoori Chicken', 'Basmati Rice', 'Dal', 'Cucumber Raita', 'Grilled Vegetables'],
    };

    // Default dishes for unknown cuisines
    const defaultDishes = ['Grilled Chicken', 'Garden Salad', 'Steamed Vegetables', 'Rice Bowl', 'Soup of the Day'];

    // Find matching cuisine template
    const cuisineType = categories.find(cat => 
      Object.keys(dishTemplates).some(key => cat.toLowerCase().includes(key))
    )?.toLowerCase();

    const dishNames = cuisineType && dishTemplates[cuisineType] 
      ? dishTemplates[cuisineType] 
      : defaultDishes;

    // Generate 3-5 dishes with varying safety levels
    const numDishes = Math.min(3 + Math.floor(Math.random() * 3), dishNames.length);
    const selectedDishes = dishNames.slice(0, numDishes);

    return selectedDishes.map((name, index) => {
      // Make first 2 dishes usually safe, others more varied
      let status: 'safe' | 'caution' | 'risk' = 'safe';
      let confidence = 85 + Math.floor(Math.random() * 10); // 85-95%

      if (index >= 2) {
        const rand = Math.random();
        if (rand < 0.6) {
          status = 'safe';
          confidence = 80 + Math.floor(Math.random() * 15); // 80-95%
        } else if (rand < 0.9) {
          status = 'caution';
          confidence = 50 + Math.floor(Math.random() * 30); // 50-80%
        } else {
          status = 'risk';
          confidence = 20 + Math.floor(Math.random() * 30); // 20-50%
        }
      }

      return { name, status, confidence };
    });
  }

  private generateRestaurantImage(cuisine: string): string {
    // Map cuisine types to actual working Unsplash images
    const cuisineImages: Record<string, string> = {
      italian: 'https://images.unsplash.com/photo-1715607873797-a173a95fd47c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpdGFsaWFuJTIwcmVzdGF1cmFudCUyMGZvb2R8ZW58MXx8fHwxNzU3NTI5OTQwfDA&ixlib=rb-4.1.0&q=80&w=400',
      american: 'https://images.unsplash.com/photo-1572294888157-e750af07dbd3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhbWVyaWNhbiUyMHJlc3RhdXJhbnQlMjBmb29kfGVufDF8fHx8MTc1NzYzMDk3Mnww&ixlib=rb-4.1.0&q=80&w=400',
      asian: 'https://images.unsplash.com/photo-1741612552052-2c5806e8a9ea?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhc2lhbiUyMHJlc3RhdXJhbnQlMjBmb29kfGVufDF8fHx8MTc1NzYyMjQ0MHww&ixlib=rb-4.1.0&q=80&w=400',
      mexican: 'https://images.unsplash.com/photo-1611942766601-12d3aedc6c2f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtZXhpY2FuJTIwcmVzdGF1cmFudCUyMGZvb2R8ZW58MXx8fHwxNzU3NTQ0MTE3fDA&ixlib=rb-4.1.0&q=80&w=400',
      mediterranean: 'https://images.unsplash.com/photo-1705648341120-666923f8b675?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtZWRpdGVycmFuZWFuJTIwcmVzdGF1cmFudCUyMGZvb2R8ZW58MXx8fHwxNzU3NjMwOTgxfDA&ixlib=rb-4.1.0&q=80&w=400',
      chinese: 'https://images.unsplash.com/photo-1556151241-ac08ea44afd6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaGluZXNlJTIwcmVzdGF1cmFudCUyMGZvb2R8ZW58MXx8fHwxNzU3NjMwOTg4fDA&ixlib=rb-4.1.0&q=80&w=400',
      japanese: 'https://images.unsplash.com/photo-1717988732486-285ea23a6f88?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxqYXBhbmVzZSUyMHJlc3RhdXJhbnQlMjBzdXNoaXxlbnwxfHx8fDE3NTc2MzA5ODR8MA&ixlib=rb-4.1.0&q=80&w=400',
      indian: 'https://images.unsplash.com/photo-1690915475414-9aaecfd3ba74?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjByZXN0YXVyYW50JTIwY3Vycnl8ZW58MXx8fHwxNzU3NjMwOTk0fDA&ixlib=rb-4.1.0&q=80&w=400',
      thai: 'https://images.unsplash.com/photo-1665199020996-66cfdf8cba00?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0aGFpJTIwcmVzdGF1cmFudCUyMGZvb2R8ZW58MXx8fHwxNzU3NjMwOTkxfDA&ixlib=rb-4.1.0&q=80&w=400',
      french: 'https://images.unsplash.com/photo-1715607873797-a173a95fd47c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpdGFsaWFuJTIwcmVzdGF1cmFudCUyMGZvb2R8ZW58MXx8fHwxNzU3NTI5OTQwfDA&ixlib=rb-4.1.0&q=80&w=400',
      vietnamese: 'https://images.unsplash.com/photo-1741612552052-2c5806e8a9ea?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhc2lhbiUyMHJlc3RhdXJhbnQlMjBmb29kfGVufDF8fHx8MTc1NzYyMjQ0MHww&ixlib=rb-4.1.0&q=80&w=400',
      korean: 'https://images.unsplash.com/photo-1741612552052-2c5806e8a9ea?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhc2lhbiUyMHJlc3RhdXJhbnQlMjBmb29kfGVufDF8fHx8MTc1NzYyMjQ0MHww&ixlib=rb-4.1.0&q=80&w=400',
      seafood: 'https://images.unsplash.com/photo-1705648341120-666923f8b675?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtZWRpdGVycmFuZWFuJTIwcmVzdGF1cmFudCUyMGZvb2R8ZW58MXx8fHwxNzU3NjMwOTgxfDA&ixlib=rb-4.1.0&q=80&w=400',
      steakhouse: 'https://images.unsplash.com/photo-1572294888157-e750af07dbd3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhbWVyaWNhbiUyMHJlc3RhdXJhbnQlMjBmb29kfGVufDF8fHx8MTc1NzYzMDk3Mnww&ixlib=rb-4.1.0&q=80&w=400',
      pizza: 'https://images.unsplash.com/photo-1715607873797-a173a95fd47c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpdGFsaWFuJTIwcmVzdGF1cmFudCUyMGZvb2R8ZW58MXx8fHwxNzU3NTI5OTQwfDA&ixlib=rb-4.1.0&q=80&w=400',
      cafe: 'https://images.unsplash.com/photo-1667388968964-4aa652df0a9b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyZXN0YXVyYW50JTIwZm9vZCUyMGRpbmluZ3xlbnwxfHx8fDE3NTc1ODE5MTN8MA&ixlib=rb-4.1.0&q=80&w=400',
      bakery: 'https://images.unsplash.com/photo-1667388968964-4aa652df0a9b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyZXN0YXVyYW50JTIwZm9vZCUyMGRpbmluZ3xlbnwxfHx8fDE3NTc1ODE5MTN8MA&ixlib=rb-4.1.0&q=80&w=400',
      fast_food: 'https://images.unsplash.com/photo-1572294888157-e750af07dbd3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhbWVyaWNhbiUyMHJlc3RhdXJhbnQlMjBmb29kfGVufDF8fHx8MTc1NzYzMDk3Mnww&ixlib=rb-4.1.0&q=80&w=400',
      bbq: 'https://images.unsplash.com/photo-1572294888157-e750af07dbd3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhbWVyaWNhbiUyMHJlc3RhdXJhbnQlMjBmb29kfGVufDF8fHx8MTc1NzYzMDk3Mnww&ixlib=rb-4.1.0&q=80&w=400',
      sushi: 'https://images.unsplash.com/photo-1717988732486-285ea23a6f88?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxqYXBhbmVzZSUyMHJlc3RhdXJhbnQlMjBzdXNoaXxlbnwxfHx8fDE3NTc2MzA5ODR8MA&ixlib=rb-4.1.0&q=80&w=400',
    };

    // Default fallback image for unmatched cuisines
    const defaultImage = 'https://images.unsplash.com/photo-1667388968964-4aa652df0a9b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyZXN0YXVyYW50JTIwZm9vZCUyMGRpbmluZ3xlbnwxfHx8fDE3NTc1ODE5MTN8MA&ixlib=rb-4.1.0&q=80&w=400';

    // Return the matching image or default
    return cuisineImages[cuisine.toLowerCase()] || defaultImage;
  }

  private formatDistance(distanceInMeters: number): string {
    if (distanceInMeters < 1000) {
      return `${Math.round(distanceInMeters)} m`;
    } else {
      const miles = distanceInMeters * 0.000621371; // Convert to miles
      return `${miles.toFixed(1)} mi`;
    }
  }

  private formatCuisine(categories: string[]): string {
    // Prioritize cuisine types and capitalize them properly
    const cuisineMap: Record<string, string> = {
      italian: 'Italian',
      american: 'American',
      chinese: 'Chinese',
      japanese: 'Japanese',
      mexican: 'Mexican',
      indian: 'Indian',
      thai: 'Thai',
      french: 'French',
      mediterranean: 'Mediterranean',
      korean: 'Korean',
      vietnamese: 'Vietnamese',
      greek: 'Greek',
      spanish: 'Spanish',
      german: 'German',
      seafood: 'Seafood',
      steakhouse: 'Steakhouse',
      pizza: 'Pizza',
      cafe: 'Cafe',
      bakery: 'Bakery',
      fast_food: 'Fast Food',
      bbq: 'BBQ',
      sushi: 'Sushi',
    };

    // Find the first recognized cuisine type
    for (const category of categories) {
      const normalized = category.toLowerCase().replace(/[^a-z]/g, '');
      if (cuisineMap[normalized]) {
        return cuisineMap[normalized];
      }
    }

    // If no specific cuisine found, use the first category and capitalize it
    return categories[0] ? categories[0].charAt(0).toUpperCase() + categories[0].slice(1) : 'Restaurant';
  }

  private transformAzureResultToRestaurant(result: AzureMapsResult): Restaurant {
    const cuisine = this.formatCuisine(result.poi.categories);
    const dishes = this.generateMockDishes(result.poi.categories);
    const safeOptions = dishes.filter(dish => dish.status === 'safe').length;
    const riskOptions = dishes.filter(dish => dish.status === 'caution' || dish.status === 'risk').length;

    return {
      id: result.id,
      name: result.poi.name,
      cuisine,
      distance: this.formatDistance(result.dist),
      rating: Number((3.5 + Math.random() * 1.5).toFixed(1)), // Generate rating between 3.5-5.0
      safeOptions,
      riskOptions,
      image: this.generateRestaurantImage(cuisine),
      dishes,
      address: result.address.freeformAddress,
      phone: result.poi.phone,
      categories: result.poi.categories,
      position: {
        lat: result.position.lat,
        lon: result.position.lon
      }
    };
  }

  async getNearbyRestaurants(location?: Location): Promise<RestaurantResponse> {
    try {
      let currentLocation: Location;
      let isUsingDefaultLocation = false;

      if (location) {
        currentLocation = location;
      } else {
        try {
          // Check if geolocation is available first
          if (!navigator.geolocation) {
            throw new Error('Geolocation not supported');
          }
          
          // Check if we're in a restricted environment
          if (this.isGeolocationRestricted()) {
            throw new Error('Geolocation disabled by permissions policy');
          }
          
          // Try to get location with improved error handling
          const position = await requestLocationWithTimeout(8000);
          currentLocation = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          };
        } catch (locationError) {
          console.log('Location access unavailable, using demo location:', locationError?.message || 'Unknown error');
          
          // Use a default location (NYC area) for demo purposes
          currentLocation = {
            latitude: 40.7579336, // NYC coordinates
            longitude: -74.0244151
          };
          isUsingDefaultLocation = true;
        }
      }
      
      // Get location name via reverse geocoding (run in parallel with restaurant fetch)
      const [azureResults, locationName] = await Promise.all([
        this.fetchRestaurants(currentLocation),
        this.reverseGeocode(currentLocation)
      ]);
      
      // Transform Azure Maps results to app format
      const restaurants = azureResults.map(result => this.transformAzureResultToRestaurant(result));
      
      // If using default location, adjust distances to show "Demo" instead of actual distance
      if (isUsingDefaultLocation) {
        restaurants.forEach(restaurant => {
          restaurant.distance = 'Demo location';
        });
      }
      
      // Sort by distance (closest first) - but only if not using default location
      if (!isUsingDefaultLocation) {
        restaurants.sort((a, b) => {
          const distA = parseFloat(a.distance.replace(/[^\d.]/g, ''));
          const distB = parseFloat(b.distance.replace(/[^\d.]/g, ''));
          return distA - distB;
        });
      }

      return {
        restaurants,
        isUsingDefaultLocation,
        locationName: isUsingDefaultLocation ? 'New York, NY (Demo)' : locationName || undefined,
        currentLocation
      };

    } catch (error) {
      console.error('Error getting nearby restaurants:', error);
      
      // For any errors, fall back to mock data
      console.warn('Falling back to demo restaurants due to error:', error);
      return {
        restaurants: this.getMockRestaurants(),
        isUsingDefaultLocation: true,
        locationName: 'Demo Location',
        currentLocation: { latitude: 40.7579336, longitude: -74.0244151 }
      };
    }
  }

  // Check if geolocation is restricted by permissions policy
  private isGeolocationRestricted(): boolean {
    try {
      // Check if we're in a restricted environment (like Figma Make)
      if (typeof window === 'undefined') return false;
      
      // Check for iframe restrictions or specific hostnames
      const isInRestrictedIframe = window !== window.top && 
        (window.location.hostname.includes('figma') || 
         window.location.hostname.includes('framer') ||
         window.location.hostname.includes('webcontainer'));
      
      // Check if permissions policy blocks geolocation
      if ('permissions' in navigator) {
        // This might throw if permissions policy blocks it
        navigator.permissions.query({ name: 'geolocation' as any }).catch(() => {
          return true; // If permissions query fails, assume restricted
        });
      }
      
      return isInRestrictedIframe;
    } catch (error) {
      // If we can't access window properties or permissions, likely restricted
      return true;
    }
  }

  // Test the Azure Maps API connection
  async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      // Use a known location (NYC) for testing
      const testLocation: Location = { latitude: 40.7579336, longitude: -74.0244151 };
      const results = await this.fetchRestaurants(testLocation, 1000); // Small radius for faster test
      
      return {
        success: true,
        message: `Azure Maps API is working. Found ${results.length} restaurants in test area.`
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Azure Maps API test failed'
      };
    }
  }

  // Fallback mock data for when Azure Maps fails
  private getMockRestaurants(): Restaurant[] {
    return [
      {
        id: 'mock-1',
        name: 'La Nonna Ristorante',
        cuisine: 'Italian',
        distance: 'Demo location',
        rating: 4.5,
        safeOptions: 3,
        riskOptions: 2,
        image: 'https://images.unsplash.com/photo-1715607873797-a173a95fd47c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpdGFsaWFuJTIwcmVzdGF1cmFudCUyMGZvb2R8ZW58MXx8fHwxNzU3NTI5OTQwfDA&ixlib=rb-4.1.0&q=80&w=400',
        dishes: [
          { name: 'Grilled Salmon', status: 'safe', confidence: 95 },
          { name: 'Caesar Salad (no croutons)', status: 'safe', confidence: 89 },
          { name: 'Margherita Pizza', status: 'caution', confidence: 60 },
        ],
        address: 'Demo Italian Restaurant, Sample Area',
        categories: ['italian', 'restaurant'],
        position: { lat: 40.7579336, lon: -74.0244151 }
      },
      {
        id: 'mock-2',
        name: 'Green Bowl Cafe',
        cuisine: 'Healthy',
        distance: 'Demo location',
        rating: 4.8,
        safeOptions: 5,
        riskOptions: 0,
        image: 'https://images.unsplash.com/photo-1667388968964-4aa652df0a9b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyZXN0YXVyYW50JTIwZm9vZCUyMGRpbmluZ3xlbnwxfHx8fDE3NTc1ODE5MTN8MA&ixlib=rb-4.1.0&q=80&w=400',
        dishes: [
          { name: 'Mediterranean Quinoa Bowl', status: 'safe', confidence: 98 },
          { name: 'Grilled Chicken Salad', status: 'safe', confidence: 95 },
          { name: 'Buddha Bowl', status: 'safe', confidence: 92 },
        ],
        address: 'Demo Healthy Cafe, Sample Area',
        categories: ['healthy', 'restaurant'],
        position: { lat: 40.7579336, lon: -74.0244151 }
      },
      {
        id: 'mock-3',
        name: 'Sakura Sushi',
        cuisine: 'Japanese',
        distance: 'Demo location',
        rating: 4.6,
        safeOptions: 4,
        riskOptions: 1,
        image: 'https://images.unsplash.com/photo-1717988732486-285ea23a6f88?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxqYXBhbmVzZSUyMHJlc3RhdXJhbnQlMjBzdXNoaXxlbnwxfHx8fDE3NTc2MzA5ODR8MA&ixlib=rb-4.1.0&q=80&w=400',
        dishes: [
          { name: 'Salmon Teriyaki', status: 'safe', confidence: 92 },
          { name: 'Miso Soup', status: 'safe', confidence: 88 },
          { name: 'Tempura Roll', status: 'caution', confidence: 65 },
        ],
        address: 'Demo Japanese Restaurant, Sample Area',
        categories: ['japanese', 'sushi', 'restaurant'],
        position: { lat: 40.7579336, lon: -74.0244151 }
      }
    ];
  }
}

export const azureMapsService = new AzureMapsService();