"use client";
import React, { useState, useEffect, useRef } from "react";
import { X, Search } from "lucide-react";
import { cn } from "../../app/lib/utils.js";

// Sri Lankan cities list
const sriLankanCities = [
  "Colombo",
  "Kandy",
  "Galle",
  "Jaffna",
  "Negombo",
  "Trincomalee",
  "Batticaloa",
  "Anuradhapura",
  "Ratnapura",
  "Badulla",
  "Matara",
  "Kurunegala",
  "Polonnaruwa",
  "Hambantota",
  "Nuwara Eliya",
  "Kegalle",
  "Matale",
  "Puttalam",
  "Kalutara",
  "Ampara",
  "Gampaha",
  "Kilinochchi",
  "Mullaitivu",
  "Mannar",
  "Vavuniya",
];

const LocationFilter = ({
  isOpen,
  onClose,
  onLocationSelect,
  selectedCity: initialSelectedCity,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState(initialSelectedCity);
  const [animationState, setAnimationState] = useState("entering");
  const backdropRef = useRef(null);
  const dialogRef = useRef(null);

  const filteredCities = sriLankanCities.filter((city) =>
    city.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Update selectedCity when initialSelectedCity changes
  useEffect(() => {
    setSelectedCity(initialSelectedCity);
  }, [initialSelectedCity]);

  // Handle outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (backdropRef.current && e.target === backdropRef.current) {
        handleClose();
      }
    };

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") handleClose();
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  // Handle animation states
  useEffect(() => {
    if (isOpen) {
      setAnimationState("entering");
      document.body.style.overflow = "hidden";
      setTimeout(() => setAnimationState("entered"), 10);
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleClose = () => {
    setAnimationState("exiting");
    setTimeout(() => onClose(), 300);
  };

  const handleCitySelect = (city) => {
    setSelectedCity(city);
    // Removed the setTimeout that was immediately closing the modal
  };

  const handleApply = () => {
    if (selectedCity && typeof onLocationSelect === "function") {
      onLocationSelect(selectedCity);
    }
    handleClose();
  };

  const handleClear = () => {
    setSelectedCity(null);
    if (typeof onLocationSelect === "function") {
      onLocationSelect(null);
    }
    handleClose();
  };

  if (!isOpen && animationState !== "exiting") return null;

  return (
    <div
      ref={backdropRef}
      className={cn(
        "fixed inset-0 z-[999] mt-[25vh] bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 transition-opacity duration-300",
        animationState === "entering" ? "opacity-0" : "opacity-100",
        animationState === "exiting" ? "opacity-0" : "opacity-100"
      )}
    >
      <div
        ref={dialogRef}
        className={cn(
          "bg-gray-700 rounded-2xl w-full max-w-[92%] sm:max-w-md shadow-2xl overflow-hidden transition-all duration-300 text-white",
          animationState === "entering"
            ? "scale-95 opacity-0"
            : "scale-100 opacity-100",
          animationState === "exiting"
            ? "scale-95 opacity-0"
            : "scale-100 opacity-100"
        )}
        style={{
          transform:
            animationState === "entered" ? "translateY(0)" : "translateY(20px)",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-3 sm:p-5 border-b border-gray-600">
          <h2 className="text-lg sm:text-xl font-semibold text-white">
            Select Location
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-300 hover:text-white rounded-full p-1 hover:bg-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="p-3 sm:p-4 border-b border-gray-600">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search cities..."
              className="block w-full pl-10 pr-3 py-2 sm:py-2.5 border border-gray-600 rounded-lg focus:ring-2 focus:ring-white focus:border-white bg-gray-800 text-white placeholder-gray-400 text-sm sm:text-base"
              autoFocus
            />
          </div>
        </div>

        {/* City List */}
        <div className="overflow-y-auto max-h-[200px] sm:max-h-[300px] p-1 bg-gray-700">
          {filteredCities.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-2 sm:p-3">
              {filteredCities.map((city) => (
                <button
                  key={city}
                  onClick={() => handleCitySelect(city)}
                  className={cn(
                    "text-left px-3 sm:px-4 py-2 sm:py-3 rounded-lg transition-colors text-sm",
                    selectedCity === city
                      ? "bg-gray-800 text-white border-2 border-white"
                      : "text-gray-200 hover:bg-gray-600 border border-transparent"
                  )}
                >
                  {city}
                </button>
              ))}
            </div>
          ) : (
            <div className="p-3 sm:p-4 text-center text-gray-300 text-sm sm:text-base">
              No cities found matching &quot;{searchQuery}&quot;
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="p-3 sm:p-4 border-t border-gray-600 flex flex-wrap justify-end gap-2 sm:gap-3">
          {initialSelectedCity && (
            <button
              onClick={handleClear}
              className="px-3 sm:px-4 py-1.5 sm:py-2 border border-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm sm:text-base"
            >
              Clear
            </button>
          )}
          <button
            onClick={handleClose}
            className="px-3 sm:px-4 py-1.5 sm:py-2 border border-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm sm:text-base"
          >
            Cancel
          </button>
          <button
            onClick={handleApply}
            disabled={!selectedCity}
            className={cn(
              "px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg transition-colors text-sm sm:text-base",
              selectedCity
                ? "bg-white text-gray-800 hover:bg-gray-200"
                : "bg-gray-600 text-gray-400 cursor-not-allowed"
            )}
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
};

export default LocationFilter;
