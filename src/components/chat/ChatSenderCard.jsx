"use client";
import React from "react";

const ChatSenderCard = ({ msg }) => {
  return (
    <div className="w-full text-sm text-right">
      <div
        className="inline-block p-3 bg-[#296EC9] rounded-t-2xl rounded-bl-2xl"
        dangerouslySetInnerHTML={{ __html: msg }}
      />
    </div>
  );
};

export default ChatSenderCard;
