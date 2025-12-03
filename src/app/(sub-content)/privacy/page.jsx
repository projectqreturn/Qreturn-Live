"use client";
import React from "react";
import { FaThumbtack } from "react-icons/fa";

export default function Privacy() {
  return (
    <section className="text-white pt-20">
      {/* Header */}
      <div className="bg-green-400 rounded-b-[80%] h-28 flex items-center justify-center mb-0">
        <h2 className="text-2xl font-semibold">Privacy policy</h2>
      </div>

      {/* Center Card */}
      <div className="min-h-screen flex items-center justify-center pt-6">
        <div className="w-full max-w-7xl bg-gray-800 border border-gray-700 shadow-xl rounded-2xl px-6 py-4 space-y-4">
          
          {/* Effective Date */}
          <div className="text-center">
            <div className="inline-block bg-red-500 text-white text-sm px-4 py-1 rounded-full">
              Effective Date: April 13, 2025
            </div>
            <p className="mt-4 text-sm text-gray-300">
              Welcome to QReturn, your trusted community-powered lost and found
              platform. This Privacy Policy outlines how we collect, use, store,
              and protect your information.
            </p>
          </div>

          <hr className="border-gray-500" />

          {/* Information We Collect */}
          <section>
            <h2 className="flex items-center text-lg font-semibold mb-2">
              <FaThumbtack className="mr-2 text-red-400" /> Information we collect
            </h2>
            <p className="text-sm text-gray-300">
              When you interact with QReturn, we collect information to provide
              you with a secure and user-friendly experience.
            </p>

            <ul className="list-disc list-inside mt-4 text-sm text-gray-300 space-y-1">
              <li>Name, phone number, email</li>
              <li>Location data (with your consent)</li>
              <li>QR code scan data</li>
              <li>Encrypted chat messages</li>
            </ul>
          </section>

          <hr className="border-gray-500" />

          {/* How We Use Data */}
          <section>
            <h2 className="flex items-center text-lg font-semibold mb-2">
              <FaThumbtack className="mr-2 text-red-400" /> How we use data
            </h2>
            <ul className="list-disc list-inside mt-4 text-sm text-gray-300 space-y-1">
              <li>Delivering core services like posting and searching items</li>
              <li>Ensuring safety and detecting fraud</li>
              <li>Improving app performance and user experience</li>
            </ul>
            <p className="italic font-semibold mt-2">
              Important: We never sell your personal information.
            </p>
          </section>

          {/* More sections remain unchanged */}
          {/* Protect Data */}
          <section>
            <h2 className="flex items-center text-lg font-semibold mb-2">
              <FaThumbtack className="mr-2 text-red-400" /> How we protect your data
            </h2>
            <ul className="list-disc list-inside mt-4 text-sm text-gray-300 space-y-1">
              <li>End-to-end encrypted chat</li>
              <li>Minimal data sharing</li>
              <li>Regular security updates</li>
              <li>Secure encrypted servers</li>
            </ul>
          </section>

          {/* Location Usage */}
          <section>
            <h2 className="flex items-center text-lg font-semibold mb-2">
              <FaThumbtack className="mr-2 text-red-400" /> Location data usage
            </h2>
            <ul className="list-disc list-inside mt-4 text-sm text-gray-300 space-y-1">
              <li>Show nearby lost/found items</li>
              <li>Send area-based alerts</li>
              <li>Track QR-tagged item scans</li>
            </ul>
            <p className="mt-2 text-sm text-gray-300">
              You can disable location access anytime through your device settings.
            </p>
          </section>

        </div>
      </div>
    </section>
  );
}
