"use client";
import React from "react";
import { RiScan2Line } from "react-icons/ri";
import { IoIosCloseCircle, IoMdCheckmarkCircleOutline } from "react-icons/io";
import { FaMessage, FaLocationDot } from "react-icons/fa6";
import { BsCheckCircleFill } from "react-icons/bs";
import { MdDeleteSweep } from "react-icons/md";

// Define icon map with proper React element types
const iconMap = {
  search: <RiScan2Line size={30} className="text-gray-400" />,
  msg: <FaMessage size={30} className="text-gray-400" />,
  post: <BsCheckCircleFill size={30} className="text-gray-400" />,
  delete: <MdDeleteSweep size={30} className="text-gray-400" />,
  lost: <FaLocationDot size={30} className="text-orange-400" />,
};

// Define props type
const NotifyCard = ({ id, iconKey, title, description, onDelete }) => {
  return (
    <div className="m-2 bg-gray-900 rounded-xl flex items-start w-full max-w-2xl shadow-lg text-white p-3 md:p-4 gap-2 md:gap-3">
      {/* Icon */}
      <div className="flex-shrink-0 mt-1">
        {iconMap[iconKey] || iconMap.search}
      </div>
      
      {/* Content */}
      <div className="flex-grow min-w-0 overflow-hidden pr-2">
        <h4 className="font-semibold text-sm md:text-base break-words line-clamp-2 mb-1">
          {title}
        </h4>
        <p className="text-xs md:text-sm text-blue-400 break-words line-clamp-3">
          {description}
        </p>
      </div>
      
      {/* Delete Button */}
      <div className="flex-shrink-0">
        <button
          className="p-1 hover:opacity-75 transition-opacity"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(id);
          }}
          aria-label="Delete notification"
        >
          <IoIosCloseCircle size={24} className="text-gray-500 hover:text-red-500" />
        </button>
      </div>
    </div>
  );
};

export default NotifyCard;
