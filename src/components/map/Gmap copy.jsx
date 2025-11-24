"use client";
import React, {
  useState,
  useCallback,
  useMemo,
  useRef,
  useEffect,
} from "react";
import { GoogleMap, useLoadScript } from "@react-google-maps/api";

const containerStyle = {
  width: "100%",
  height: "400px",
};

const defaultCenter = {
  lat: 6.585409900724701,
  lng: 79.96057490265069,
};

const allCoordinates = [
  { lat: 6.585719350880768, lng: 79.96128115092635, name: "Fire and rescue" },
  { lat: 6.5849792210312765, lng: 79.96106181833566, name: "Kalutara Police" },
  {
    lat: 6.584554734326314,
    lng: 79.96359237791089,
    name: "Kalutara Hindu Kovila",
  },
];

const libraries = ["places"];

const Gmap = () => {
  const mapRef = useRef(null);
  const [mapInstance, setMapInstance] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [nearestCoordinates, setNearestCoordinates] = useState([]);
  const [error, setError] = useState("");

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
    libraries,
  });

  const getDistance = useCallback((point1, point2) => {
    const R = 6371;
    const dLat = ((point2.lat - point1.lat) * Math.PI) / 180;
    const dLon = ((point2.lng - point1.lng) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((point1.lat * Math.PI) / 180) *
        Math.cos((point2.lat * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }, []);

  const findNearestCoordinates = useCallback(() => {
    if (!selectedLocation) {
      setError("Please enter coordinates first");
      return;
    }

    const withDistances = allCoordinates
      .map((coord) => ({
        ...coord,
        distance: getDistance(selectedLocation, coord),
      }))
      .filter((coord) => coord.distance <= 20)
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 10);

    setNearestCoordinates(withDistances);
  }, [selectedLocation, getDistance]);

  const handleCoordinateSubmit = useCallback((e) => {
    e.preventDefault();
    const lat = parseFloat(e.target.latitude.value);
    const lng = parseFloat(e.target.longitude.value);

    if (isNaN(lat) || isNaN(lng)) {
      setError("Please enter valid coordinates");
      return;
    }

    setSelectedLocation({ lat, lng });
    setError("");
  }, []);

  const mapOptions = useMemo(
    () => ({
      disableDefaultUI: false,
      clickableIcons: true,
      scrollwheel: true,
      mapId: "YOUR_MAP_ID", // Optional if you're using styled maps
    }),
    []
  );

  useEffect(() => {
    if (!mapInstance || !window.google || !window.google.maps) return;

    const drawMarkers = async () => {
      const { AdvancedMarkerElement } = await window.google.maps.importLibrary(
        "marker"
      );

      // Clear previous markers
      const existing = document.querySelectorAll(".gm-adv-marker");
      existing.forEach((el) => el.remove());

      const markers = [];

      if (selectedLocation) {
        const marker = new AdvancedMarkerElement({
          map: mapInstance,
          position: selectedLocation,
          title: "Selected Location",
        });
        markers.push(marker);
      }

      nearestCoordinates.forEach((coord, i) => {
        const marker = new AdvancedMarkerElement({
          map: mapInstance,
          position: { lat: coord.lat, lng: coord.lng },
          title: coord.name,
        });
        markers.push(marker);
      });
    };

    drawMarkers();
  }, [mapInstance, selectedLocation, nearestCoordinates]);

  if (loadError)
    return <div className="p-4 text-red-500">Error loading maps</div>;
  if (!isLoaded) return <div className="p-4">Loading maps...</div>;

  return (
    <div className="container mx-auto p-4">
      <form
        onSubmit={handleCoordinateSubmit}
        className="flex flex-wrap gap-4 mb-3"
      >
        <input
          type="text"
          name="latitude"
          className="border rounded px-3 py-2 w-full sm:w-1/3"
          placeholder="Enter Latitude"
        />
        <input
          type="text"
          name="longitude"
          className="border rounded px-3 py-2 w-full sm:w-1/3"
          placeholder="Enter Longitude"
        />
        <div className="flex flex-col sm:w-1/3 gap-2">
          <button
            type="submit"
            className="bg-blue-500 text-white font-bold py-2 px-4 rounded w-full"
          >
            Set Location
          </button>
          <button
            type="button"
            className="bg-gray-500 text-white font-bold py-2 px-4 rounded w-full"
            onClick={findNearestCoordinates}
          >
            Find Nearest
          </button>
        </div>
      </form>

      {error && (
        <div className="bg-red-500 text-white p-3 rounded mb-3">{error}</div>
      )}

      {nearestCoordinates.length > 0 && (
        <div className="mb-3">
          <h5 className="text-lg font-bold">Nearest Points:</h5>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {nearestCoordinates.map((coord, index) => (
              <div key={index} className="shadow-md rounded p-4">
                <h6 className="font-bold text-lg">{coord.name}</h6>
                <p>
                  Latitude: {coord.lat}
                  <br />
                  Longitude: {coord.lng}
                  <br />
                  Distance: {coord.distance.toFixed(2)} km
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="rounded-lg overflow-hidden">
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={selectedLocation || defaultCenter}
          zoom={16}
          options={mapOptions}
          onLoad={(map) => setMapInstance(map)}
          ref={mapRef}
        />
      </div>
    </div>
  );
};

export default Gmap;
