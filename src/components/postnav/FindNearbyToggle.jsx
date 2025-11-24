import React from "react";

const FindNearbyToggle = ({ enabled, onChange, disabled }) => {
  return (
    <div className="flex items-center space-x-2 bg-navy rounded-full px-2 py-2">
      <span className="text-white text-sm ">Find Nearby</span>
      <label
        className={`inline-flex items-center ${
          disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"
        }`}
      >
        <input
          type="checkbox"
          value=""
          className="sr-only peer"
          checked={enabled}
          onChange={() => !disabled && onChange(!enabled)}
          disabled={disabled}
        />
        <div className="relative w-11 h-6 bg-gray-200 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-green-400 peer-checked:bg-blue-600 dark:peer-checked:bg-green-400"></div>
      </label>
    </div>
  );
};

export default FindNearbyToggle;
