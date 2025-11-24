"use client";
import React from "react";
import { GrMap } from "react-icons/gr";
import { useRouter } from "next/navigation";

const MapButton = () => {
  const router = useRouter();
  const handleButtonClick = () => {
    router.push("/map");
  };
  return (
    <div className="fixed bottom-6 right-6">
      <button
        onClick={handleButtonClick}
        className="relative flex items-center justify-center bg-gray-800 text-white p-4 rounded-full shadow-lg hover:bg-gray-950 transform hover:scale-105 transition-transform duration-200"
        aria-label="Map"
      >
        <span className="absolute inset-0 rounded-full bg-gray-700 opacity-50 animate-ping"></span>
        <div className="relative z-10">
          <GrMap size={30} />
        </div>
      </button>
    </div>
  );
};

export default MapButton;
