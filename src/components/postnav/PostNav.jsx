"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MdOutlineAddLocationAlt } from "react-icons/md";
import { TiLocation } from "react-icons/ti";
import { RiMenuSearchLine } from "react-icons/ri";
import { IoIosArrowBack } from "react-icons/io";
import LocationFilter from "./LocationFilter";
import FindNearbyToggle from "./FindNearbyToggle";
import { cn } from "../../app/lib/utils.js";
import MapButton from "../mapfloatingbutton/MapButton";

const PostNav = () => {
  const router = useRouter();
  const [postType, setPostType] = useState("lost");
  const [findNearby, setFindNearby] = useState(false);
  const [locationFilterOpen, setLocationFilterOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const FILTERS_EVENT = "qreturn:postFiltersChange";

  // Load saved states from localStorage when component mounts
  useEffect(() => {
    // Load findNearby state
    const savedFindNearby = localStorage.getItem("findNearby");
    if (savedFindNearby !== null) {
      setFindNearby(savedFindNearby === "true");
    }

    // Load selectedLocation state
    const savedLocation = localStorage.getItem("selectedLocation");
    if (savedLocation) {
      setSelectedLocation(savedLocation);
    }

    // Load postType state
    const savedPostType = localStorage.getItem("postType");
    if (savedPostType) {
      setPostType(savedPostType);
      // Navigate to the saved route on initial load
      router.push(`/${savedPostType}`);
    } else {
      // Navigate to default route if no saved state
      router.push("/lost");
    }

    // Load expand state
    const savedExpandState = localStorage.getItem("navExpanded");
    if (savedExpandState !== null) {
      setIsExpanded(savedExpandState === "true");
    }
  }, [router]);

  const toggleExpand = () => {
    const newState = !isExpanded;
    setIsExpanded(newState);
    localStorage.setItem("navExpanded", newState.toString());
  };

  const handleLocationSelect = (city) => {
    setSelectedLocation(city);
    setFindNearby(false);

    // Save to localStorage
    localStorage.setItem("selectedLocation", city);
    localStorage.setItem("findNearby", "false");

    // Notify listeners (posts pages) to refetch immediately
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent(FILTERS_EVENT, {
          detail: { findNearby: false, selectedLocation: city },
        })
      );
    }
  };

  const handleFindNearbyChange = (value) => {
    if (value) {
      setSelectedLocation(null);
      localStorage.removeItem("selectedLocation");
    }
    setFindNearby(value);

    // Save to localStorage
    localStorage.setItem("findNearby", value.toString());

    // Notify listeners to refetch immediately
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent(FILTERS_EVENT, {
          detail: { findNearby: value, selectedLocation: value ? null : selectedLocation },
        })
      );
    }
  };

  const handlePostTypeChange = (type) => {
    setPostType(type);
    localStorage.setItem("postType", type);
    router.push(`/${type}`);
  };

  return (
    <>
      {/* Overlay for mobile when expanded */}
      {isExpanded && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={toggleExpand}
        />
      )}

      {/* Toggle Button - Always visible in center */}
      <button
        onClick={toggleExpand}
        className={cn(
          "fixed top-1/2 -translate-y-1/2 bg-zinc-800 hover:bg-zinc-700 rounded-r-lg px-3 py-3 text-white shadow-lg transition-all duration-300 z-50",
          isExpanded ? "left-80 sm:left-96" : "left-0"
        )}
        aria-label={isExpanded ? "Collapse menu" : "Expand menu"}
      >
        {isExpanded ? (
          <IoIosArrowBack className="w-6 h-6" />
        ) : (
          <RiMenuSearchLine className="w-6 h-6" />
        )}
      </button>

      {/* Left Side Navigation */}
      <nav
        className={cn(
          "fixed left-0 top-0 h-full bg-zinc-800 shadow-2xl z-40 transition-all duration-300 ease-in-out",
          isExpanded ? "translate-x-0 w-80 sm:w-96" : "-translate-x-full w-80 sm:w-96"
        )}
      >

        {/* Nav Content */}
        <div className="h-full flex flex-col p-4 pt-52 overflow-y-auto">
          {/* Expanded State - Full Content */}
          <div className="transition-opacity duration-300">
            <h2 className="text-white text-xl font-semibold mb-6">Filters</h2>

            {/* Lost/Found Toggle */}
            <div className="mb-5">
              <label className="text-gray-400 text-sm mb-2 block">Post Type</label>
              <div className="relative bg-zinc-900 rounded-full p-1">
                <div
                  className={cn(
                    "absolute inset-y-1 transition-all duration-300 ease-out rounded-full bg-zinc-700",
                    postType === "lost"
                      ? "left-1 right-[50%]"
                      : "left-[50%] right-1"
                  )}
                />
                <div className="relative flex">
                  <button
                    onClick={() => handlePostTypeChange("lost")}
                    className={cn(
                      "relative z-10 flex-1 px-6 py-2.5 rounded-full text-sm font-medium transition-colors",
                      postType === "lost"
                        ? "text-white font-semibold"
                        : "text-gray-400 hover:text-gray-200"
                    )}
                  >
                    Lost
                  </button>
                  <button
                    onClick={() => handlePostTypeChange("found")}
                    className={cn(
                      "relative z-10 flex-1 px-6 py-2.5 rounded-full text-sm font-medium transition-colors",
                      postType === "found"
                        ? "text-white font-semibold"
                        : "text-gray-400 hover:text-gray-200"
                    )}
                  >
                    Found
                  </button>
                </div>
              </div>
            </div>

            {/* Find Nearby Toggle */}
            <div className="mb-6">
              <label className="text-gray-400 text-sm mb-2 block">Search Mode</label>
              <FindNearbyToggle
                enabled={findNearby}
                onChange={handleFindNearbyChange}
                disabled={selectedLocation !== null}
              />
            </div>

            {/* Location Section */}
            <div className="mb-6">
              <label className="text-gray-400 text-sm mb-2 block">Location</label>
              <div className="bg-zinc-900 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2 text-white">
                    <TiLocation className="w-5 h-5 text-green-400" />
                    <span className="text-sm">
                      {findNearby
                        ? "Nearby"
                        : selectedLocation
                        ? selectedLocation
                        : "Sri Lanka"}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setLocationFilterOpen(true)}
                  className="w-full bg-zinc-700 hover:bg-zinc-600 transition-colors rounded-lg py-2.5 px-4 flex items-center justify-center space-x-2 text-white text-sm"
                >
                  <MdOutlineAddLocationAlt className="w-5 h-5" />
                  <span>Change Location</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content Spacer - No spacer needed since menu is hidden */}
      <div className="transition-all duration-300" />

      {/* Location Filter Dialog */}
      {locationFilterOpen && (
        <LocationFilter
          isOpen={locationFilterOpen}
          onClose={() => setLocationFilterOpen(false)}
          onLocationSelect={handleLocationSelect}
          selectedCity={selectedLocation}
        />
      )}

      {/* Map Button - Only visible when findNearby is true */}
      {findNearby && <MapButton />}
    </>
  );
};

export default PostNav;