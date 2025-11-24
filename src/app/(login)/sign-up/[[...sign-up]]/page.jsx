"use client";
import React from "react";
import Link from "next/link";
import { SignUp } from "@clerk/nextjs";
import { IoArrowBackSharp } from "react-icons/io5";

const Page = () => {
  return (
    <div className="h-screen flex flex-col">
      {/* Back button */}
      <div className="p-4">
        <Link
          href="/"
          className="flex items-center text-lg text-gray-700 hover:text-black"
        >
          <div className="p-2 bg-gray-200 rounded-full hover:bg-gray-300 transition">
            <IoArrowBackSharp size={24} />
          </div>
        </Link>
      </div>

      {/* Centered SignIn Component */}
      <div className="flex flex-1 justify-center items-center">
        <SignUp />
      </div>
    </div>
  );
};

export default Page;
