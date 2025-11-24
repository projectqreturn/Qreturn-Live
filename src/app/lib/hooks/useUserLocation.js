'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';

/**
 * Custom hook to manage user's GPS location
 * Automatically updates user location in database when position changes
 */
export const useUserLocation = () => {
  const { user } = useUser();
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Update location in database
  const updateLocationInDB = async (gps) => {
    if (!user?.id) return;

    try {
      const response = await fetch('/api/user/location', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clerkId: user.id,
          gps: gps,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update location');
      }

      console.log('Location updated in database:', gps);
    } catch (error) {
      console.error('Error updating location in database:', error);
    }
  };

  // Get current location from browser
  const getCurrentLocation = () => {
    setLoading(true);
    setError(null);

    if (!('geolocation' in navigator)) {
      setError('Geolocation is not supported by your browser');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const gpsString = `${latitude},${longitude}`;
        
        setLocation({
          lat: latitude,
          lng: longitude,
          gps: gpsString,
        });

        // Update in database
        updateLocationInDB(gpsString);
        setLoading(false);
      },
      (error) => {
        // Map GeolocationPositionError codes to user-friendly messages
        let errorMessage = 'Unknown error';
        if (error.code) {
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Location access denied by user';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Location information unavailable';
              break;
            case error.TIMEOUT:
              errorMessage = 'Location request timed out';
              break;
            default:
              errorMessage = error.message || 'Failed to get location';
          }
        } else {
          errorMessage = error.message || 'Failed to get location';
        }
        
        console.error('Error getting location:', {
          code: error.code,
          message: errorMessage,
          originalError: error
        });
        setError(errorMessage);
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // Cache for 5 minutes
      }
    );
  };

  // Fetch location from database
  const fetchLocationFromDB = async () => {
    if (!user?.id) return;

    try {
      const response = await fetch(`/api/user/location?clerkId=${user.id}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch location');
      }

      const data = await response.json();
      
      if (data.gps) {
        const [lat, lng] = data.gps.split(',').map(Number);
        setLocation({
          lat,
          lng,
          gps: data.gps,
        });
      }
    } catch (error) {
      console.error('Error fetching location from database:', error);
    }
  };

  // Initialize location on mount
  useEffect(() => {
    if (user?.id) {
      // First, try to get from database
      fetchLocationFromDB();
      
      // Then update with current location
      getCurrentLocation();
    }
  }, [user?.id]);

  return {
    location,
    loading,
    error,
    getCurrentLocation,
    updateLocation: updateLocationInDB,
  };
};

export default useUserLocation;
