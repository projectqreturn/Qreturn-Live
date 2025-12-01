"use client";

import React from "react";
import { FaThumbtack } from "react-icons/fa";

export default function Privacy() {
  return (
    <section className="text-white">
      {/* Hero */}
      <div className="bg-green-400 rounded-b-[80%] h-28 flex items-center justify-center mb-0">
        <h2 className="text-2xl font-semibold">Privacy Policy</h2>
      </div>

      <div className="pt-6 text-white flex items-center justify-center">
        <div className="w-full max-w-7xl bg-gray-800 border border-gray-700 shadow-xl rounded-2xl px-6 py-8 space-y-6">
          {/* Effective Date */}
          <div className="text-center">
            <div className="inline-block bg-red-500 text-white text-sm px-4 py-1 rounded-full">
              Effective Date: April 13, 2025
            </div>
            <p className="mt-4 text-sm text-gray-300">
              Welcome to QReturn, your trusted community-powered lost and found
              platform. This Privacy Policy explains how we collect, use, store,
              and protect the personal and non-personal information of our users.
              Your privacy is our top priority, and we are committed to handling
              your data responsibly and transparently.
            </p>
          </div>

          <hr className="border-gray-500" />

          {/* Information We Collect */}
          <section>
            <h2 className="flex items-center text-lg font-semibold mb-2">
              <FaThumbtack className="mr-2 text-red-400" /> Information We Collect
            </h2>
            <p className="text-sm text-gray-300">
              To provide a secure and user-friendly experience, we collect both
              personal and non-personal information when you interact with QReturn.
            </p>
            <ul className="list-disc list-inside mt-2 text-sm text-gray-300 space-y-1">
              <li>
                <strong>Personal Identification Information:</strong> Name, email, and phone number when registering or reporting lost/found items.
              </li>
              <li>
                <strong>Location Data:</strong> Used to display nearby items and relevant notifications (collected only with explicit consent).
              </li>
              <li>
                <strong>QR Code Data:</strong> Reads QR codes linked to items or user profiles to verify ownership without exposing private information.
              </li>
              <li>
                <strong>Chat Data:</strong> In-app messages are end-to-end encrypted and accessible only by the communicating users.
              </li>
              <li>
                <strong>Usage Data:</strong> Technical details like device type, browser, and interaction logs to improve platform functionality.
              </li>
            </ul>
          </section>

          <hr className="border-gray-500" />

          {/* How We Use Data */}
          <section>
            <h2 className="flex items-center text-lg font-semibold mb-2">
              <FaThumbtack className="mr-2 text-red-400" /> How We Use Data
            </h2>
            <p className="text-sm text-gray-300">
              Your information helps us operate QReturn safely and efficiently:
            </p>
            <ul className="list-disc list-inside mt-2 text-sm text-gray-300 space-y-1">
              <li>
                <strong>Service Delivery:</strong> To enable lost/found reporting, QR code verification, proximity-based notifications, and safe communication between users.
              </li>
              <li>
                <strong>Safety & Security:</strong> Detect fake accounts, fraudulent reports, and unauthorized access attempts.
              </li>
              <li>
                <strong>Platform Improvement:</strong> Analyze usage patterns to enhance features, fix bugs, and optimize performance.
              </li>
              <li className="italic font-semibold">
                Note: We never sell, rent, or trade your personal information for commercial purposes.
              </li>
            </ul>
          </section>

          <hr className="border-gray-500" />

          {/* How We Protect Data */}
          <section>
            <h2 className="flex items-center text-lg font-semibold mb-2">
              <FaThumbtack className="mr-2 text-red-400" /> How We Protect Your Data
            </h2>
            <p className="text-sm text-gray-300">
              We implement multiple layers of security to protect your information:
            </p>
            <ul className="list-disc list-inside mt-2 text-sm text-gray-300 space-y-1">
              <li>End-to-End Encryption for all in-app chats.</li>
              <li>Minimal Data Sharing: Only essential information is shared during item recovery.</li>
              <li>Regular Security Updates to protect against vulnerabilities.</li>
              <li>Secure Storage on encrypted servers with controlled access.</li>
            </ul>
          </section>

          <hr className="border-gray-500" />

          {/* Location Data Usage */}
          <section>
            <h2 className="flex items-center text-lg font-semibold mb-2">
              <FaThumbtack className="mr-2 text-red-400" /> Location Data Usage
            </h2>
            <p className="text-sm text-gray-300">
              Location services help you find nearby lost/found items. Data is only collected with your consent.
            </p>
            <ul className="list-disc list-inside mt-2 text-sm text-gray-300 space-y-1">
              <li>Show nearby lost or found reports.</li>
              <li>Send proximity-based notifications.</li>
              <li>Track QR-tagged items when scanned.</li>
            </ul>
            <p className="text-sm text-gray-300 mt-2">
              Your location is never shared without explicit permission, and you can revoke access anytime in device settings.
            </p>
          </section>

          <hr className="border-gray-500" />

          {/* Data Retention */}
          <section>
            <h2 className="flex items-center text-lg font-semibold mb-2">
              <FaThumbtack className="mr-2 text-red-400" /> Data Retention
            </h2>
            <p className="text-sm text-gray-300">
              We retain personal and non-personal data only as long as necessary to provide services, comply with legal obligations, and maintain security. Inactive accounts may have their data anonymized or deleted after a period of inactivity.
            </p>
          </section>

          <hr className="border-gray-500" />

          {/* Cookies & Tracking */}
          <section>
            <h2 className="flex items-center text-lg font-semibold mb-2">
              <FaThumbtack className="mr-2 text-red-400" /> Cookies & Tracking
            </h2>
            <p className="text-sm text-gray-300">
              QReturn uses cookies and similar technologies to enhance user experience, remember preferences, and analyze app usage. These are never used for advertising purposes.
            </p>
          </section>

          <hr className="border-gray-500" />

          {/* User Rights */}
          <section>
            <h2 className="flex items-center text-lg font-semibold mb-2">
              <FaThumbtack className="mr-2 text-red-400" /> Your Rights
            </h2>
            <p className="text-sm text-gray-300">
              Users have the right to access, correct, or delete their personal information. You may also restrict certain data processing or revoke consent at any time. Contact us for assistance.
            </p>
          </section>

          <hr className="border-gray-500" />

          {/* Contact */}
          <section>
            <h2 className="flex items-center text-lg font-semibold mb-2">
              <FaThumbtack className="mr-2 text-red-400" /> Contact Us
            </h2>
            <p className="text-sm text-gray-300">
              If you have questions or concerns about this Privacy Policy, please contact us at <strong>support@qreturn.app</strong>.
            </p>
          </section>
        </div>
      </div>
    </section>
  );
}
