"use client";
import React, { useState, useRef, useCallback, useEffect } from "react";
import {
  GoogleMap,
  useLoadScript,
  Marker,
  InfoWindow,
} from "@react-google-maps/api";
import { FaLocationArrow, FaMapMarkerAlt } from "react-icons/fa";

const containerStyle = {
  width: "100%",
  height: "500px",
};

// Move this outside the component to prevent re-initialization
const libraries = ["places"];

const mapOptions = {
  disableDefaultUI: false,
  zoomControl: true,
  streetViewControl: false,
  mapTypeControl: true,
  fullscreenControl: true,
  clickableIcons: false,
};

const GmapLocationFetch = ({ 
  lat, 
  lng, 
  name = "Your Location", 
  className = "",
  onLocationChange = () => {},
  allowCustomPicker = true 
}) => {
  const [showInfo, setShowInfo] = useState(false);
  const [mapError, setMapError] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState({ lat: parseFloat(lat), lng: parseFloat(lng) });
  const [locationName, setLocationName] = useState(name);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  
  const mapRef = useRef(null);

  // Use the hook pattern instead of LoadScript component
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
    libraries,
  });

  // Update location when props change
  useEffect(() => {
    setSelectedLocation({ lat: parseFloat(lat), lng: parseFloat(lng) });
    setLocationName(name);
  }, [lat, lng, name]);

  const onMapLoad = useCallback((map) => {
    mapRef.current = map;
  }, []);

  const onMapError = useCallback((error) => {
    console.error("Map error:", error);
    setMapError("Failed to load the map. Please check your API key and try again.");
  }, []);

  // Handle map click to set custom location
  const onMapClick = useCallback((event) => {
    if (!allowCustomPicker) return;
    
    const newLocation = {
      lat: event.latLng.lat(),
      lng: event.latLng.lng()
    };
    
    setSelectedLocation(newLocation);
    setLocationName("Custom Location");
    setShowInfo(false);
    
    onLocationChange({ ...newLocation, name: "Custom Location" });
  }, [allowCustomPicker, onLocationChange]);

  // Get current location
  const getCurrentLocation = useCallback(() => {
    setIsGettingLocation(true);
    
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          
          setSelectedLocation(newLocation);
          setLocationName("Current Location");
          setIsGettingLocation(false);
          setShowInfo(false);
          
          // Move map to new location
          if (mapRef.current) {
            mapRef.current.panTo(newLocation);
            mapRef.current.setZoom(16);
          }
          
          onLocationChange({ ...newLocation, name: "Current Location" });
        },
        (error) => {
          console.error("Error getting location:", error);
          setIsGettingLocation(false);
          alert("Unable to get your current location. Please check location permissions.");
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000
        }
      );
    } else {
      setIsGettingLocation(false);
      alert("Geolocation is not supported by your browser");
    }
  }, [onLocationChange]);

  // Handle API key issues
  if (!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <p className="text-red-600">Google Maps API key is missing. Please add it to your environment variables.</p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <p className="text-red-600">Error loading Google Maps: {loadError.message}</p>
        <p className="text-red-500 text-sm mt-2">Please check your API key and ensure Maps JavaScript API is enabled.</p>
      </div>
    );
  }

  if (mapError) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <p className="text-red-600">{mapError}</p>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="bg-gray-100 rounded-lg p-6 text-center" style={{ height: "500px" }}>
        <div className="flex items-center justify-center h-full">
          <div>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading map...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`container mx-auto ${className}`}>
      {/* Control Buttons */}
      {/* <div className="mb-4 space-y-3">
        <div className="flex gap-3 flex-wrap">
          <button
            onClick={getCurrentLocation}
            disabled={isGettingLocation}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors text-sm font-medium"
          >
            <FaLocationArrow className={isGettingLocation ? "animate-spin" : ""} />
            {isGettingLocation ? "Getting Location..." : "Current Location"}
          </button>

          {allowCustomPicker && (
            <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-100 px-3 py-2 rounded-lg">
              <FaMapMarkerAlt />
              <span>Click on map to set location</span>
            </div>
          )}
        </div>

        <div className="bg-gray-50 p-3 rounded-lg">
          <h3 className="font-medium text-gray-800 mb-1">Selected Location:</h3>
          <p className="text-gray-600 text-sm">{locationName}</p>
          <p className="text-gray-500 text-xs mt-1">
            Lat: {selectedLocation.lat.toFixed(6)}, Lng: {selectedLocation.lng.toFixed(6)}
          </p>
        </div>
      </div> */}

      {/* Map */}
      <div className="rounded-lg overflow-hidden shadow-lg">
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={selectedLocation}
          zoom={16}
          onLoad={onMapLoad}
          onError={onMapError}
          onClick={onMapClick}
          options={mapOptions}
        >
          <Marker
            position={selectedLocation}
            onClick={() => setShowInfo(true)}
            icon={{
              url: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
              scaledSize: new window.google.maps.Size(40, 40),
            }}
            animation={window.google.maps.Animation.DROP}
          />
          
          {showInfo && (
            <InfoWindow
              position={selectedLocation}
              onCloseClick={() => setShowInfo(false)}
            >
              <div className="p-2">
                <h3 className="font-semibold text-lg text-blue-600 mb-1">
                  {locationName}
                </h3>
                <p className="text-gray-600 text-sm">
                  Lat: {selectedLocation.lat.toFixed(6)}<br />
                  Lng: {selectedLocation.lng.toFixed(6)}
                </p>
              </div>
            </InfoWindow>
          )}
        </GoogleMap>
      </div>
    </div>
  );
};

export default GmapLocationFetch;