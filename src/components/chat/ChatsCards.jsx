"use client";
import React from "react";
import { useRouter } from "next/navigation";

const ChatsCard = ({
  id,
  img,
  title,
  description,
  date,
  showCheckbox = false,
  checked = false,
  onCheck = () => {},
  hasUnread = false,
  href = `/chats/${id}`, // Default route to chat with this ID
}) => {
  const router = useRouter();

  const handleCardClick = (e) => {
    // Prevent navigation when clicking on checkbox
    if (e.target.type !== "checkbox") {
      router.push(href);
    }
  };

  return (
    <div
      onClick={handleCardClick}
      className="mb-4 bg-gray-700 rounded-2xl flex items-center justify-between w-full max-w-2xl shadow-lg text-white px-4 py-3 cursor-pointer hover:bg-gray-600 transition-colors relative"
    >
      {hasUnread && (
        <div className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full"></div>
      )}
      <div className="flex items-center space-x-4">
        {showCheckbox && (
          <input
            type="checkbox"
            checked={checked}
            onChange={(e) => {
              e.stopPropagation(); // Prevent card click handler
              onCheck(id); // ✅ FIXED: Pass the id to onCheck
            }}
            className="h-5 w-5 text-red-500"
            aria-label="Select chat"
          />
        )}
        <img
          className="w-14 h-14 object-cover rounded-full"
          src={img}
          alt="chat-img"
        />
        <div className="text-left">
          <h4 className="font-semibold text-sm">{title}</h4>
          <p className="text-xs text-gray-400">{description}</p>
        </div>
      </div>
      <div>
        <p className="text-xs text-gray-400">{date}</p>
      </div>
    </div>
  );
};

export default ChatsCard;