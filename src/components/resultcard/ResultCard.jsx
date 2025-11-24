import React from "react";
import { CheckCircle, BadgeCheck } from "lucide-react";

export default function ResultCard({
  imageUrl,
  title,
  price,
  location,
  date,
  isVerified = false,
}) {
  return (
    <div className="flex bg-[#EEF1F7] rounded-xl p-3 gap-4 items-start shadow-sm hover:shadow-md transition cursor-pointer">
      
      {/* Image */}
      <img
        src={imageUrl}
        alt={title}
        className="w-28 h-28 object-cover rounded-lg"
      />

      {/* Content */}
      <div className="flex flex-col w-full">
        <p className="text-sm font-semibold text-gray-700">{title}</p>

        <p className="text-xs text-gray-500 mt-1">Personal</p>

        {/* Tags */}
        <div className="flex gap-2 items-center mt-1">
          {isVerified && (
            <span className="flex items-center gap-1 text-xs py-0.5  text-gray-600">
              Verified User
              <CheckCircle size={14} className="text-blue-500" />
            </span>
          )}

          <span className="flex items-center gap-1 text-xs py-0.5 text-gray-600">
            Reward
            <BadgeCheck size={14} className="text-purple-500" />
          </span>
        </div>

        {/* Price */}
        <p className="text-[15px] font-semibold text-gray-900 mt-2">
          {price}
        </p>

        {/* Location and Date */}
        <p className="text-xs text-gray-500 mt-1">
          {location}
        </p>

        <p className="text-xs text-gray-400">{date}</p>
      </div>
    </div>
  );
}
