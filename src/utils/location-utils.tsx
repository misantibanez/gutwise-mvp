// Utility functions for handling location services and permissions

export interface LocationError {
  code: number;
  message: string;
  userFriendlyMessage: string;
}

export const getLocationErrorMessage = (error: GeolocationPositionError | any): LocationError => {
  // Handle case where error might be an empty object or invalid
  if (!error || typeof error.code !== 'number') {
    return {
      code: -1,
      message: 'Unknown location error',
      userFriendlyMessage: "Unable to access your location. Please enable location permissions and try again."
    };
  }

  switch (error.code) {
    case error.PERMISSION_DENIED:
      return {
        code: error.code,
        message: error.message,
        userFriendlyMessage: "Location access denied. Please enable location permissions in your browser settings to find nearby restaurants."
      };
    case error.POSITION_UNAVAILABLE:
      return {
        code: error.code,
        message: error.message,
        userFriendlyMessage: "Your location is currently unavailable. Please check your GPS or network connection."
      };
    case error.TIMEOUT:
      return {
        code: error.code,
        message: error.message,
        userFriendlyMessage: "Location request timed out. Please try again."
      };
    default:
      return {
        code: error.code,
        message: error.message,
        userFriendlyMessage: "Unable to access your location. Please try again or check your browser settings."
      };
  }
};

export const checkLocationPermission = async (): Promise<boolean> => {
  if (!navigator.geolocation) {
    return false;
  }

  if ('permissions' in navigator) {
    try {
      const permission = await navigator.permissions.query({ name: 'geolocation' });
      return permission.state === 'granted';
    } catch (error) {
      // Fallback for browsers that don't support permissions API
      console.warn('Permissions API not available:', error);
      return true; // Assume permission is available and let geolocation API handle it
    }
  }

  return true; // Assume permission is available for older browsers
};

export const requestLocationWithTimeout = (timeout: number = 10000): Promise<GeolocationPosition> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser'));
      return;
    }

    // Check for permissions policy restrictions
    try {
      // Try to detect if geolocation is blocked by permissions policy
      if (typeof PermissionsPolicy !== 'undefined' && 'allowsFeature' in PermissionsPolicy) {
        if (!PermissionsPolicy.allowsFeature('geolocation')) {
          reject(new Error('Geolocation disabled by permissions policy'));
          return;
        }
      }
    } catch (error) {
      // PermissionsPolicy might not be available in all browsers
      console.log('Could not check permissions policy:', error);
    }

    const timeoutId = setTimeout(() => {
      reject(new Error('Location request timed out'));
    }, timeout);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        clearTimeout(timeoutId);
        resolve(position);
      },
      (error) => {
        clearTimeout(timeoutId);
        console.log('Geolocation error details:', {
          code: error.code,
          message: error.message,
          PERMISSION_DENIED: error.PERMISSION_DENIED,
          POSITION_UNAVAILABLE: error.POSITION_UNAVAILABLE,
          TIMEOUT: error.TIMEOUT
        });
        reject(error);
      },
      {
        enableHighAccuracy: false, // Set to false for better compatibility
        timeout: Math.max(timeout - 1000, 5000), // Leave some buffer for our timeout, minimum 5s
        maximumAge: 300000 // 5 minute cache for better performance
      }
    );
  });
};