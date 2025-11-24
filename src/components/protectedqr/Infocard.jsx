"use client";
import React from "react";
import { FaLock } from "react-icons/fa";

const Infocard = (
  {
    // id,
    // name,
    // mobileInfo,
  }
) => {
  return (
    <div className="bg-gray-900 rounded-2xl p-6 pb-10 text-center mt-8">
      <FaLock className="mx-auto mb-2" size={25} color="#D9D9D9" />
      <p className="text-sm text-gray-300">
        Personal information remains confidential until the <br /> owner reports
        it as lost or missing. However, you can <br /> still reach out to the
        owner via secure chat.
      </p>
    </div>
  );
};

export default Infocard;
