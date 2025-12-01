'use client';

import { useEffect } from 'react';
import { useUser } from '@clerk/nextjs';

/**
 * LocationTracker Component
 * Automatically tracks and updates user location in real-time using watchPosition
 * Add this to your main layout to enable continuous location tracking
 */
const LocationTracker = () => {
  const { user } = useUser();

  useEffect(() => {
    if (!user?.id) return;
    if (!('geolocation' in navigator)) {
      console.warn('Geolocation is not supported');
      return;
    }

    let watchId = null;
    let lastLocation = null;

    // Function to update location in database
    const updateLocationInDB = async (gps) => {
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

        if (response.ok) {
          console.log('📍 Location updated:', gps);
        }
      } catch (error) {
        console.error('Error updating location:', error);
      }
    };

    // Check if location changed significantly (more than ~50 meters)
    const hasLocationChanged = (newLat, newLng) => {
      if (!lastLocation) return true;
      
      const [oldLat, oldLng] = lastLocation.split(',').map(Number);
      const distance = Math.sqrt(
        Math.pow(newLat - oldLat, 2) + Math.pow(newLng - oldLng, 2)
      ) * 111000; // Convert to meters
      
      return distance > 50; // Only update if moved more than 50 meters
    };

    // Start watching location continuously
    watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const gpsString = `${latitude},${longitude}`;
        
        // Only update if location changed significantly
        if (hasLocationChanged(latitude, longitude)) {
          lastLocation = gpsString;
          updateLocationInDB(gpsString);
        }
      },
      (error) => {
        console.error('Location tracking error:', error.message);
      },
      {
        enableHighAccuracy: true,
        timeout: 30000,
        maximumAge: 0, // Always get fresh location
      }
    );

    console.log('🟢 Started continuous location tracking');

    // Cleanup function
    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
        console.log('🔴 Stopped location tracking');
      }
    };
  }, [user?.id]);

  // This component doesn't render anything
  return null;
};

export default LocationTracker;
