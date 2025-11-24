"use client";
import React from "react";

const ChatReceiverCard = ({ msg }) => {
  return (
    <div className="w-full text-sm text-left">
      <div
        className="inline-block p-3 bg-green-500 rounded-t-2xl rounded-br-2xl"
        dangerouslySetInnerHTML={{ __html: msg }}
      />
    </div>
  );
};

export default ChatReceiverCard;
