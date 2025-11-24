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
  height: "400px",
};

// Move this outside the component to prevent re-initialization
const libraries = ["places"];

const Gmap = ({ lat, lng, name }) => {
  const [showInfo, setShowInfo] = useState(false);
  const center = { lat, lng };
  const mapRef = useRef(null);

  // Use the hook pattern instead of LoadScript component
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
    libraries,
  });

  const onMapLoad = (map) => {
    mapRef.current = map;
  };

  if (loadError) return <div>Error loading maps</div>;
  if (!isLoaded) return <div>Loading maps...</div>;

  return (
    <div className="container mx-auto p-4">
      <div className="rounded-lg overflow-hidden">
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={center}
          zoom={19}
          onLoad={onMapLoad}
        >
          <Marker
            position={center}
            // onClick={() => setShowInfo(true)}
            icon={{
              url: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
            }}
          />
          {showInfo && (
            <InfoWindow
              position={center}
              onCloseClick={() => setShowInfo(false)}
            >
              <div className="font-semibold text-2xl text-blue-600 dark:text-sky-400">
                {name}
              </div>
            </InfoWindow>
          )}
        </GoogleMap>
        
      </div>
    </div>
  );
};

export default Gmap;
