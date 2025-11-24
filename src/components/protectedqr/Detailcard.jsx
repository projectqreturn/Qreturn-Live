"use client";
import React from "react";
import { FaFacebook } from "react-icons/fa";
import { TbBrandInstagram } from "react-icons/tb";
import { MdStars } from "react-icons/md";

const Detailcard = ({
  id,
  name,
  mobileInfo,
  note,
  email,
  reward,
  lostDate,
}) => {
  return (
    <div className="bg-gray-900 rounded-2xl p-6 text-center mt-8 w-full max-w-xl mx-auto">
      {/* Contact Info */}
      <div className="text-left space-y-4">
        <p className="font-medium">
          Posted by: <span className="text-green-400 font-medium">{name}</span>
        </p>
        <p className="font-medium">
          Phone:{" "}
          <span className="text-green-400 font-medium">{mobileInfo}</span>
        </p>
        <p className="font-medium">
          Note: <span className="text-gray-400 font-light">{note}</span>
        </p>

        {/* Social Media */}
        <div className="font-medium lg:flex gap-2 items-center justify-left">
          <p>Social Media:</p>
          <div className="flex flex-wrap items-center gap-4 text-blue-500">
            <div className="flex items-center gap-2">
              <FaFacebook size={20} className="text-gray-400" />
              <span className="text-sm">Facebook</span>
            </div>
            <div className="flex items-center gap-2">
              <TbBrandInstagram size={22} className="text-gray-400" />
              <span className="text-sm">Instagram</span>
            </div>
          </div>
        </div>

        {/* Reward */}
        <p className="font-medium">
          Reward:{" "}
          <span className="text-gray-400 font-light">
            The owner is offering a cash reward, as specified below.
          </span>
        </p>
      </div>

      {/* Cash Reward */}
      <div className="mt-6 items-center justify-center flex flex-col">
        <button
          type="button"
          className="flex items-center justify-center gap-2 text-white bg-purple-600 hover:bg-purple-700 focus:ring-4 focus:ring-purple-300 font-medium rounded-lg text-sm px-4 py-2"
        >
          <MdStars className="w-5 h-5" />
          <p className="font-bold">Rs. {reward}</p>
        </button>
      </div>

      {/* Lost Date */}
      <p className="text-center font-medium mt-6">
        Lost or Missing Since:{" "}
        <span className="text-red-600 font-light">{lostDate}</span>
      </p>
    </div>
  );
};

export default Detailcard;
