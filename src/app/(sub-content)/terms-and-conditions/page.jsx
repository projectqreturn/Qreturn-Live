"use client";
import React from "react";
import { FaThumbtack } from "react-icons/fa";

export default function Tearms() {
  return (
    <section className="text-white pt-20">
      <div className="bg-green-400 rounded-b-[80%] h-28 flex items-center justify-center">
        <h2 className="text-2xl font-semibold">Terms & Conditions</h2>
      </div>

      <div className="min-h-screen text-white pt-6 flex items-center justify-center">
        <div className="w-full max-w-7xl bg-gray-800 border border-gray-700 shadow-xl rounded-2xl p-6 space-y-6">

          <div className="text-center">
            <div className="inline-block bg-red-500 text-white text-sm px-4 py-1 rounded-full">
              Effective Date: April 13, 2025
            </div>
            <p className="mt-4 text-sm text-gray-300">
              These Terms & Conditions govern your use of the QReturn platform.
              By accessing or using QReturn, you agree to follow these rules,
              responsibilities, and limitations as part of our community-powered
              lost and found platform.
            </p>
          </div>

          <hr className="border-gray-500" />

          {/* ACCOUNT CREATION */}
          <section>
            <h2 className="flex items-center text-lg font-semibold mb-2">
              <FaThumbtack className="mr-2 text-red-400" /> Account Creation & Verification
            </h2>

            <p className="text-sm text-gray-300">
              To use features such as reporting lost/found items, messaging, or receiving notifications, a QReturn account is required. Users must provide accurate information and verify their identity to help maintain a safe and trusted community.
            </p>

            <div className="mt-4 text-sm text-gray-300">
              <p className="mb-2 font-semibold">Identity Verification:</p>
              <p>
                During registration, you may be asked to provide a valid NIC or official ID. This verification helps:
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Ensure real and trustworthy user activity.</li>
                <li>Prevent fake profiles and fraudulent item claims.</li>
                <li>Support safe and responsible reporting.</li>
              </ul>

              <p className="mt-2">
                Your ID is securely stored and only used for verification. It is
                never shared unless required by law. Failure to provide valid
                information may limit access to certain features or lead to
                account suspension.
              </p>
            </div>
          </section>

          <hr className="border-gray-500" />

          {/* ACCEPTABLE USE */}
          <section>
            <h2 className="flex items-center text-lg font-semibold mb-2">
              <FaThumbtack className="mr-2 text-red-400" /> Acceptable Use Policy
            </h2>

            <p className="text-sm text-gray-300">
              By using QReturn, you agree to use the platform responsibly and legally. You must not:
            </p>

            <ul className="list-disc list-inside text-sm text-gray-300 mt-2 space-y-1">
              <li>Post false or misleading lost/found reports.</li>
              <li>Impersonate others or claim items you do not own.</li>
              <li>Harass, threaten, or abuse others through in-app chat.</li>
              <li>Share illegal, harmful, or offensive content.</li>
              <li>Attempt to hack, disrupt, or misuse platform systems.</li>
            </ul>

            <p className="mt-2 text-sm text-gray-300">
              Violations may result in temporary or permanent account suspension and, when applicable, legal action.
            </p>
          </section>

          <hr className="border-gray-500" />

          {/* REPORTING / CLAIMING */}
          <section>
            <h2 className="flex items-center text-lg font-semibold mb-2">
              <FaThumbtack className="mr-2 text-red-400" /> Reporting & Claiming Items
            </h2>

            <p className="text-sm text-gray-300">
              QReturn provides tools for reporting, locating, and communicating about lost and found items. However, we are not responsible for the accuracy of user-submitted reports or ownership disputes.  
              When claiming an item, you may need to present proof of ownership such as photos, receipts, or verification through your QReturn account.
            </p>
          </section>

          <hr className="border-gray-500" />

          {/* PRIVACY */}
          <section>
            <h2 className="flex items-center text-lg font-semibold mb-2">
              <FaThumbtack className="mr-2 text-red-400" /> Privacy & Data Protection
            </h2>

            <p className="text-sm text-gray-300">
              By using QReturn, you agree to our Privacy Policy. Personal data such as your name, contact details, location (with consent), ID copies, and chat messages are handled securely and transparently.  
              QReturn never sells or trades your personal information and follows all applicable data protection regulations.
            </p>
          </section>

          <hr className="border-gray-500" />

          {/* QR CODE */}
          <section>
            <h2 className="flex items-center text-lg font-semibold mb-2">
              <FaThumbtack className="mr-2 text-red-400" /> QR Code Usage
            </h2>

            <p className="text-sm text-gray-300">
              Items registered on QReturn receive unique QR codes. These are used to identify items and help reconnect them with their owners.  
              Users must not tamper with, share, or misuse QR codes belonging to others. Unauthorized scanning or manipulation may lead to account suspension.
            </p>
          </section>

          <hr className="border-gray-500" />

        </div>
      </div>
    </section>
  );
}
