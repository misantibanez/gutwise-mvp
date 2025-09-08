// Geolocation and restaurant detection utilities
export interface Location {
  latitude: number;
  longitude: number;
}

export interface Restaurant {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  cuisine_type?: string;
  distance?: number;
}

class GeolocationService {
  private watchId: number | null = null;
  private currentLocation: Location | null = null;
  private locationCallbacks: ((location: Location) => void)[] = [];
  private restaurantCallbacks: ((restaurants: Restaurant[]) => void)[] = [];

  // Get current location
  async getCurrentLocation(): Promise<Location> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          };
          this.currentLocation = location;
          resolve(location);
        },
        (error) => {
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000 // 1 minute cache
        }
      );
    });
  }

  // Start watching location changes
  startWatching() {
    if (!navigator.geolocation) {
      console.warn('Geolocation is not supported');
      return;
    }

    this.watchId = navigator.geolocation.watchPosition(
      (position) => {
        const location = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        };
        
        // Only update if location changed significantly (>50 meters)
        if (this.hasLocationChangedSignificantly(location)) {
          this.currentLocation = location;
          this.notifyLocationChange(location);
          this.checkNearbyRestaurants(location);
        }
      },
      (error) => {
        console.error('Location watch error:', error);
      },
      {
        enableHighAccuracy: true,
        timeout: 30000,
        maximumAge: 60000
      }
    );
  }

  // Stop watching location
  stopWatching() {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
  }

  // Check if location changed significantly
  private hasLocationChangedSignificantly(newLocation: Location): boolean {
    if (!this.currentLocation) return true;
    
    const distance = this.calculateDistance(
      this.currentLocation,
      newLocation
    );
    
    return distance > 0.05; // 50 meters
  }

  // Calculate distance between two points in kilometers
  private calculateDistance(loc1: Location, loc2: Location): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(loc2.latitude - loc1.latitude);
    const dLon = this.toRadians(loc2.longitude - loc1.longitude);
    
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(this.toRadians(loc1.latitude)) * Math.cos(this.toRadians(loc2.latitude)) *
        Math.sin(dLon/2) * Math.sin(dLon/2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI/180);
  }

  // Find nearby restaurants using our backend API
  private async checkNearbyRestaurants(location: Location) {
    try {
      const response = await fetch('/api/restaurants/nearby', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          latitude: location.latitude,
          longitude: location.longitude,
          radius: 0.1 // 100 meters
        })
      });

      if (response.ok) {
        const restaurants = await response.json();
        this.notifyRestaurantsFound(restaurants);
      }
    } catch (error) {
      console.error('Error checking nearby restaurants:', error);
    }
  }

  // Subscribe to location changes
  onLocationChange(callback: (location: Location) => void) {
    this.locationCallbacks.push(callback);
  }

  // Subscribe to restaurant detection
  onRestaurantsFound(callback: (restaurants: Restaurant[]) => void) {
    this.restaurantCallbacks.push(callback);
  }

  private notifyLocationChange(location: Location) {
    this.locationCallbacks.forEach(callback => callback(location));
  }

  private notifyRestaurantsFound(restaurants: Restaurant[]) {
    this.restaurantCallbacks.forEach(callback => callback(restaurants));
  }

  // Get current location without watching
  getCurrentLocationOnce(): Promise<Location> {
    return this.getCurrentLocation();
  }
}

export const geolocationService = new GeolocationService();