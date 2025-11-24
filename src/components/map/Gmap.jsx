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

const Gmap = ({ locations, userLocation }) => {
  const [activeMarker, setActiveMarker] = useState(null);
  const [showUserInfo, setShowUserInfo] = useState(false);
  const mapRef = useRef(null);

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

          {/* Existing location markers */}
          {locations.map((location, index) => (
            <Marker
              key={index}
              position={{ lat: location.lat, lng: location.lng }}
              onClick={() => setActiveMarker(index)}
              // icon={{
              //   url: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
              // }}
            />
          ))}

          {/* Existing info window code */}
          {activeMarker !== null && (
            <InfoWindow
              position={{
                lat: locations[activeMarker].lat,
                lng: locations[activeMarker].lng,
              }}
              onCloseClick={() => setActiveMarker(null)}
            >
              <div className="p-2 max-w-xs">
                <h2 className="text-lg font-bold text-red-600 mb-1">
                  {locations[activeMarker].name}
                </h2>
                <p className="text-base text-gray-800 dark:text-white mb-2">
                  {locations[activeMarker].name}
                </p>
                <a
                  href={locations[activeMarker].url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline hover:text-blue-800"
                >
                  View Details
                </a>
              </div>
            </InfoWindow>
          )}
        </GoogleMap>
      </div>
    </div>
  );
};

export default Gmap;
