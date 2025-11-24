"use client";

import React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation"; // Changed from next/router to next/navigation
import SearchBar from "../../components/searchbar/searchbar";
import NavLinks from "./NavLinks";
import qReturnLogo from "../../assets/logo-w.png";

const Appnav = () => {
  const router = useRouter();

  const handleBackClick = () => {
    router.push("/lost");
  };

  return (
    <nav className="bg-gradient-to-b from-gray-950 to-gray-900 p-4 w-full">
      <div className="max-w-7xl mx-auto px-6 sm:px-12">
        {/* Mobile logo */}
        <div className="block sm:hidden text-center mb-4">
          <div
            onClick={handleBackClick}
            className="cursor-pointer inline-block"
            role="button"
            aria-label="Go back"
          >
            <Image
              src={qReturnLogo}
              alt="Qreturn Logo"
              className="mx-auto h-14 w-auto"
              priority
            />
          </div>
        </div>

        <div className="flex items-center justify-center gap-8 flex-row">
          {/* Desktop logo */}
          <div className="hidden sm:flex items-center">
            <div
              onClick={handleBackClick}
              className="cursor-pointer"
              role="button"
              aria-label="Go back"
            >
              <Image
                src={qReturnLogo}
                alt="Qreturn Logo"
                className="sm:h-20 sm:w-auto object-contain h-14 w-auto"
                priority
              />
            </div>
          </div>
          <div className="flex items-center">
            <SearchBar />
          </div>
          <div>
            <NavLinks />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Appnav;
