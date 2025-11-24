'use client';

import { useEffect } from 'react';
import { useUserLocation } from '@/app/lib/hooks/useUserLocation';

/**
 * LocationTracker Component
 * Automatically tracks and updates user location in the background
 * Add this to your main layout to enable location-based notifications
 */
const LocationTracker = () => {
  const { location, getCurrentLocation } = useUserLocation();

  useEffect(() => {
    // Update location every 10 minutes
    const interval = setInterval(() => {
      getCurrentLocation();
    }, 10 * 60 * 1000); // 10 minutes

    return () => clearInterval(interval);
  }, []);

  // This component doesn't render anything
  return null;
};

export default LocationTracker;
