"use client";
import { ChevronRightIcon } from "@heroicons/react/24/solid";
import React from "react";
import { useRouter } from "next/navigation";

const Button = () => {
  const router = useRouter();
  const handleButtonClick = () => {
    router.push("/lost");
  };

  return (
    <div>
      <button onClick={handleButtonClick}>
        <div className="flex justify-center items-center mt-8">
          <div className="border-4 border-white-500 relative flex items-center justify-center px-6 py-3 bg-green-400 text-black text-lg font-semibold rounded-full shadow-lg transform hover:scale-105 transition-transform duration-200">
            <span className="absolute inset-0 rounded-full bg-green-300 opacity-50 animate-ping"></span>

            <div className="relative z-10 flex items-center space-x-2">
              <span>Start Finding</span>
              <ChevronRightIcon className="h-7 w-7 text-black" />
            </div>
          </div>
        </div>
      </button>
    </div>
  );
};

export default Button;
