"use client";
import React, { useState, useRef } from "react";
import {
  GoogleMap,
  useLoadScript,
  Marker,
  InfoWindow,
} from "@react-google-maps/api";

const containerStyle = {
  width: "100%",
  height: "550px",
};

const libraries = ["places"];

const Gmap = ({ locations, userLocation, postType }) => {
  const [activeMarker, setActiveMarker] = useState(null);
  const [showUserInfo, setShowUserInfo] = useState(false);
  const mapRef = useRef(null);
  
  // Create custom SVG icon for pets
  const createPetIcon = (color) => {
    const svgIcon = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${color}" width="48px" height="48px">
        <path d="M4.5 12c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5-.67 1.5-1.5 1.5-1.5-.67-1.5-1.5zm3-6c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5-.67 1.5-1.5 1.5-1.5-.67-1.5-1.5zm6 0c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5-.67 1.5-1.5 1.5-1.5-.67-1.5-1.5zm3 6c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5-.67 1.5-1.5 1.5-1.5-.67-1.5-1.5zm-4.5 5c-2.33 0-4.32 1.45-5.12 3.5h10.24c-.8-2.05-2.79-3.5-5.12-3.5z"/>
      </svg>
    `;
    return 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svgIcon);
  };
  
  // Determine marker icon based on category and post type
  const getMarkerIcon = (category) => {
    const isPet = category && (
      category.toLowerCase().includes('pet') || 
      category.toLowerCase().includes('dog') || 
      category.toLowerCase().includes('cat') ||
      category.toLowerCase().includes('animal')
    );
    
    if (isPet) {
      // Use paw icon for pets
      const color = postType === "lost" ? "#EF4444" : "#10B981"; // red for lost, green for found
      return {
        url: createPetIcon(color),
        scaledSize: new window.google.maps.Size(48, 48),
        anchor: new window.google.maps.Point(24, 48),
      };
    } else {
      // Use default colored dots for other items
      if (postType === "lost") {
        return {
          url: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
          scaledSize: new window.google.maps.Size(40, 40),
        };
      } else {
        return {
          url: "https://maps.google.com/mapfiles/ms/icons/green-dot.png",
          scaledSize: new window.google.maps.Size(40, 40),
        };
      }
    }
  };

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
    libraries,
  });

  const onMapLoad = (map) => {
    mapRef.current = map;
  };

  if (loadError) return <div>Error loading maps</div>;
  if (!isLoaded) return <div>Loading maps...</div>;

  //calculate average center
  const defaultCenter = userLocation
    ? { lat: userLocation.lat, lng: userLocation.lng }
    : locations.length > 0
    ? { lat: locations[0].lat, lng: locations[0].lng }
    : { lat: 0, lng: 0 };

  return (
    <div className="container mx-auto p-4">
      <div className="rounded-lg overflow-hidden">
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={defaultCenter}
          zoom={15}
          onLoad={onMapLoad}
        >
          {/* Add user location marker */}
          {userLocation && (
            <Marker
              position={{ lat: userLocation.lat, lng: userLocation.lng }}
              onClick={() => setShowUserInfo(true)}
              icon={{
                url: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png",
                scaledSize: new window.google.maps.Size(40, 40),
              }}
            />
          )}

          {/* Show user location info window */}
          {showUserInfo && userLocation && (
            <InfoWindow
              position={{ lat: userLocation.lat, lng: userLocation.lng }}
              onCloseClick={() => setShowUserInfo(false)}
            >
              <div className="p-2">
                <h2 className="text-lg font-bold text-blue-600">Your Location</h2>
              </div>
            </InfoWindow>
          )}

          {/* Category-based location markers */}
          {locations.map((location, index) => (
            <Marker
              key={index}
              position={{ lat: location.lat, lng: location.lng }}
              onClick={() => setActiveMarker(index)}
              icon={getMarkerIcon(location.category)}
            />
          ))}

          {/* Enhanced info window with image and details */}
          {activeMarker !== null && (
            <InfoWindow
              position={{
                lat: locations[activeMarker].lat,
                lng: locations[activeMarker].lng,
              }}
              onCloseClick={() => setActiveMarker(null)}
            >
              <div className="w-72 bg-white rounded-lg overflow-hidden shadow-lg">
                {/* Image */}
                <div className="relative h-40 w-full bg-gray-200">
                  <img
                    src={locations[activeMarker].imageUrl || '/slider/bag1.jpg'}
                    alt={locations[activeMarker].name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = '/slider/bag1.jpg';
                    }}
                  />
                  {locations[activeMarker].hasReward && (
                    <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                      💰 Reward
                    </div>
                  )}
                </div>
                
                {/* Content */}
                <div className="p-4">
                  <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                    {locations[activeMarker].name}
                  </h3>
                  
                  {locations[activeMarker].rewardAmount && (
                    <div className="mb-3 flex items-center gap-2">
                      <span className="text-sm font-semibold text-green-600">
                        Reward: {locations[activeMarker].rewardAmount}
                      </span>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                    <span>Near your location</span>
                  </div>
                  
                  <a
                    href={locations[activeMarker].url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                  >
                    View Full Details
                  </a>
                </div>
              </div>
            </InfoWindow>
          )}
        </GoogleMap>
      </div>
    </div>
  );
};

export default Gmap;
