"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import React from "react";
import qReturnLogo from "../../assets/logo-w.png";

const NavBar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 w-full z-50 backdrop-blur-md">
      <div className=" ">
        <div className="max-w-7xl mx-auto px-6 sm:px-12">
          <div className="flex justify-between items-center h-16 sm:h-20">
            {/* Logo */}
            <div className="flex-shrink-0">
              <Image
                src={qReturnLogo}
                alt="Qreturn Logo"
                className="sm:h-20 sm:w-auto object-contain h-14 w-auto"
                priority
              />
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex space-x-6 text-lg text-white">
              <Link className="hover:underline" href="/lost">
                Go to App
              </Link>
              <Link className="hover:underline" href="/sign-in">
                Account
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 text-white"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>

          {/* Mobile Menu Dropdown */}
          {isMobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-white/10">
              <div className="flex flex-col space-y-4 text-lg text-white">
                <Link
                  className="hover:underline"
                  href="/lost"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Go to App
                </Link>
                <Link
                  className="hover:underline"
                  href="/sign-in"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Account
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
