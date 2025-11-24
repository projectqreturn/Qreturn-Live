'use client';

import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import toast, { Toaster } from 'react-hot-toast';

/**
 * Location Debug Component
 * Shows current user location and allows manual update
 * Add this temporarily to your page to test location tracking
 */
export default function LocationDebugger() {
  const { user } = useUser();
  const [userLocation, setUserLocation] = useState(null);
  const [dbLocation, setDbLocation] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch location from database
  const fetchDbLocation = async () => {
    if (!user?.id) return;

    try {
      const response = await fetch(`/api/user/location?clerkId=${user.id}`);
      const data = await response.json();
      
      if (response.ok && data.gps) {
        setDbLocation(data.gps);
        console.log('DB Location:', data.gps);
      } else {
        setDbLocation(null);
        console.log('No location in DB');
      }
    } catch (error) {
      console.error('Error fetching DB location:', error);
    }
  };

  // Get current browser location
  const getCurrentLocation = () => {
    setLoading(true);
    
    if (!('geolocation' in navigator)) {
      toast.error('Geolocation not supported');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const gpsString = `${latitude},${longitude}`;
        
        setUserLocation({
          lat: latitude,
          lng: longitude,
          gps: gpsString
        });
        
        console.log('Current Location:', gpsString);
        toast.success('Location obtained!');
        setLoading(false);
      },
      (error) => {
        console.error('Geolocation error:', error);
        toast.error(`Error: ${error.message}`);
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  // Update location in database
  const updateLocationInDb = async () => {
    if (!user?.id || !userLocation) {
      toast.error('No location to update');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/user/location', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clerkId: user.id,
          gps: userLocation.gps,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Location updated in database!');
        setDbLocation(userLocation.gps);
        console.log('Update response:', data);
      } else {
        toast.error(`Failed: ${data.message}`);
      }
    } catch (error) {
      console.error('Update error:', error);
      toast.error('Failed to update location');
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    if (user?.id) {
      fetchDbLocation();
      getCurrentLocation();
    }
  }, [user?.id]);

  if (!user) {
    return <div className="p-4 bg-yellow-100 text-yellow-800">Loading user...</div>;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-gray-900 text-white p-4 rounded-lg shadow-lg max-w-sm">
      <Toaster position="top-center" />
      
      <h3 className="font-bold text-lg mb-3">🗺️ Location Debugger</h3>
      
      <div className="space-y-3 text-sm">
        {/* User Info */}
        <div className="bg-gray-800 p-2 rounded">
          <p className="text-gray-400 text-xs">User ID:</p>
          <p className="font-mono text-xs truncate">{user.id}</p>
        </div>

        {/* DB Location */}
        <div className="bg-gray-800 p-2 rounded">
          <p className="text-gray-400 text-xs">DB Location:</p>
          <p className="font-mono text-xs">
            {dbLocation || '❌ Not set'}
          </p>
        </div>

        {/* Current Location */}
        <div className="bg-gray-800 p-2 rounded">
          <p className="text-gray-400 text-xs">Browser Location:</p>
          {userLocation ? (
            <>
              <p className="font-mono text-xs">{userLocation.gps}</p>
              <p className="text-gray-400 text-xs mt-1">
                Lat: {userLocation.lat.toFixed(6)}<br />
                Lng: {userLocation.lng.toFixed(6)}
              </p>
            </>
          ) : (
            <p className="text-xs">❌ Not obtained</p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={getCurrentLocation}
            disabled={loading}
            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 px-3 py-2 rounded text-xs transition"
          >
            {loading ? 'Loading...' : '📍 Get Location'}
          </button>
          
          <button
            onClick={updateLocationInDb}
            disabled={loading || !userLocation}
            className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 px-3 py-2 rounded text-xs transition"
          >
            💾 Save to DB
          </button>
        </div>

        <button
          onClick={fetchDbLocation}
          disabled={loading}
          className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 px-3 py-2 rounded text-xs transition"
        >
          🔄 Refresh DB Location
        </button>

        {/* Instructions */}
        <div className="bg-yellow-900/50 border border-yellow-600 p-2 rounded text-xs">
          <p className="font-bold mb-1">Instructions:</p>
          <ol className="list-decimal list-inside space-y-1 text-xs">
            <li>Click "Get Location" to get your GPS</li>
            <li>Click "Save to DB" to store it</li>
            <li>Have another user post a lost item nearby</li>
            <li>Check notifications page</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
