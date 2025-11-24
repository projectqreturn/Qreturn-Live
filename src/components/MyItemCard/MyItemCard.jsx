import React, { useState } from "react";
import { Trash2 } from "lucide-react";
import { BiQrScan } from "react-icons/bi";

export default function MyItemCard({ item, onMarkAsLost, onQrClick, onDelete, onToggleOff, onToggleOn }) {
  const [isChecked, setIsChecked] = useState(item?.isMarkedAsLost || false);

  const handleToggle = (e) => {
    const checked = e.target.checked;
    setIsChecked(checked);
    
    if (checked) {
      // Toggle ON - if lost post exists, just make contact public; otherwise, open map popup
      if (item?.lostPostId && onToggleOn) {
        onToggleOn(item);
      } else if (onMarkAsLost) {
        onMarkAsLost(item);
      }
    } else {
      // Toggle OFF - just update the state, don't delete the post
      if (onToggleOff) {
        onToggleOff(item);
      }
    }
  };

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete "${item?.title}"?`)) {
      onDelete(item);
    }
  };

  // Fallback data if item is not provided
  const itemData = item || {
    title: "Nike Backpack - Black color",
    Category: "Personal",
    description: "Sample item description",
    myItemsId: "sample"
  };

  return (
    <div className="flex justify-center">
      <div className="bg-gray-800 rounded-2xl shadow-lg text-white w-full md:max-w-3xl lg:max-w-4xl xl:max-w-5xl mx-2 sm:mx-0">
        {/* Card container - always row layout */}
        <div className="flex flex-row items-center p-3 md:p-4 gap-2 md:gap-4">
          {/* Item image */}
          <div className="flex-shrink-0">
            <img
              className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 object-cover rounded-xl shadow-md"
              src={itemData.photo && itemData.photo.length > 0 ? itemData.photo[0] : "/slider/bag2.jpg"}
              alt={itemData.title}
            />
          </div>

          {/* Item details - grows to fill available space */}
          <div className="flex-grow min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="font-semibold text-sm md:text-lg truncate">
                {itemData.title}
              </h4>
              {isChecked && (
                <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded-full whitespace-nowrap">
                  Lost
                </span>
              )}
            </div>
            <p className="text-xs md:text-sm text-gray-400 truncate">
              {itemData.Category} • ID: {itemData.myItemsId}
            </p>
          </div>

          {/* QR code button */}
          <div
            className="flex-shrink-0 bg-gray-700 rounded-xl p-2 md:p-3 flex justify-center items-center cursor-pointer hover:bg-gray-600 transition shadow-md"
            onClick={() => onQrClick && onQrClick(itemData)}
          >
            <BiQrScan size={22} className="md:text-lg text-blue-400" />
          </div>

          {/* Lost toggle section - Fixed for better mobile display */}
          <div className="flex-shrink-0">
            {/* Mobile version */}
            <div className="sm:hidden flex flex-col items-center justify-center">
              <span className="text-xs mb-1">Mark as Lost</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={handleToggle}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:bg-green-400 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-4"></div>
              </label>
            </div>

            {/* Tablet and desktop version */}
            <div className="hidden sm:flex items-center gap-2">
              <span className="text-xs md:text-sm whitespace-nowrap">
                Mark as Lost
              </span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={handleToggle}
                  className="sr-only peer"
                />
                <div className="w-10 h-5 md:w-11 md:h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:bg-green-500 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 md:after:h-5 md:after:w-5 after:transition-all peer-checked:after:translate-x-5 md:peer-checked:after:translate-x-5"></div>
              </label>
            </div>
          </div>

          {/* Delete button */}
          <div className="flex-shrink-0">
            <button 
              className="bg-gray-700 p-2 rounded-full hover:bg-red-500/30 transition shadow-md"
              onClick={handleDelete}
            >
              <Trash2 className="text-red-500" size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
