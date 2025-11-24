"use client";
import React, { useEffect, useState } from "react";
import { FaLocationArrow, FaMapMarkerAlt, FaSave } from "react-icons/fa";
import GmapLocationFetch from "@/components/map/NewGmapLocationFetch";

const Page = () => {
  const [userLocation, setUserLocation] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch current location
  const getCurrentLocation = () => {
    setLoading(true);
    setError(null);
    
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setUserLocation(location);
          setSelectedLocation(location);
          setError(null);
          setLoading(false);
        },
        (error) => {
          console.error("Error getting location:", error);
          let errorMessage = "Unable to fetch your location.";
          
          switch(error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = "Location access denied. Please enable location services.";
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = "Location information unavailable.";
              break;
            case error.TIMEOUT:
              errorMessage = "Location request timed out.";
              break;
          }
          
          setError(errorMessage);
          setLoading(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        }
      );
    } else {
      setError("Geolocation is not supported by your browser");
      setLoading(false);
    }
  };

  // Handle location change from map component
  const handleLocationChange = (newLocation) => {
    setSelectedLocation(newLocation);
    console.log("New location selected:", newLocation);
  };

  // Save/use selected location
  const handleSaveLocation = () => {
    if (selectedLocation) {
      // Here you can implement your save logic
      // For example, save to localStorage, send to API, etc.
      localStorage.setItem('savedLocation', JSON.stringify(selectedLocation));
      alert(`Location saved: ${selectedLocation.name || 'Custom Location'}`);
    }
  };

  // Load saved location on mount
  useEffect(() => {
    // Try to load saved location first
    const savedLocation = localStorage.getItem('savedLocation');
    if (savedLocation) {
      try {
        const parsed = JSON.parse(savedLocation);
        setSelectedLocation(parsed);
        setUserLocation(parsed);
        setLoading(false);
      } catch (e) {
        // If parsing fails, get current location
        getCurrentLocation();
      }
    } else {
      getCurrentLocation();
    }
  }, []);

  console.log("User Location:", userLocation);
  console.log("Selected Location:", selectedLocation);

  if (loading) {
    return (
      <div className="bg-gray-950 text-white min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
          <p>Getting your location...</p>
        </div>
      </div>
    );
  }

  if (error && !userLocation) {
    return (
      <div className="bg-gray-950 text-white min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <FaLocationArrow className="text-red-500 text-4xl mx-auto mb-4" />
          <p className="text-red-400 mb-6">{error}</p>
          <button
            onClick={getCurrentLocation}
            className="flex items-center gap-2 mx-auto px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
          >
            <FaLocationArrow />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Use default location if no location is available
  const defaultLocation = userLocation || { lat: 40.7128, lng: -74.0060 }; // NYC as fallback

  return (
    <div className="bg-gray-950 text-white min-h-screen sm:p-8 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Location Picker</h1>
          <p className="text-gray-400">
            Use current location or click on the map to set a custom location
          </p>
        </div>

        {/* Map Component */}
        <div className="bg-white rounded-lg p-4 mb-6">
          <GmapLocationFetch
            lat={defaultLocation.lat}
            lng={defaultLocation.lng}
            name={selectedLocation?.name || "Your Location"}
            onLocationChange={handleLocationChange}
            allowCustomPicker={true}
            className="w-full"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 justify-center">
          <button
            onClick={handleSaveLocation}
            disabled={!selectedLocation}
            className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg transition-colors font-medium"
          >
            <FaSave />
            Save Location
          </button>
          
          <button
            onClick={getCurrentLocation}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors font-medium"
          >
            <FaLocationArrow />
            Reset to Current Location
          </button>
        </div>

        {/* Selected Location Details */}
        {selectedLocation && (
          <div className="mt-8 bg-gray-800 rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <FaMapMarkerAlt className="text-red-400" />
              Selected Location Details
            </h3>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <label className="block text-gray-400 mb-1">Name/Address:</label>
                <p className="text-white">{selectedLocation.name || "Custom Location"}</p>
              </div>
              <div>
                <label className="block text-gray-400 mb-1">Coordinates:</label>
                <p className="text-white">
                  {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}
                </p>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default Page;
