"use client";
import React from "react";
import { FaThumbtack } from "react-icons/fa";

export default function Privacy() {
  return (
    <section className="text-white">
      <div className="bg-green-400 rounded-b-[80%] h-28 flex items-center justify-center mb-0">
        <h2 className="text-2xl font-semibold">Privacy policy</h2>
      </div>

      <div className="pt-6 text-white flex items-center justify-center">
        <div className="w-full max-w-7xl bg-gray-800 border border-gray-700 shadow-xl rounded-2xl px-6 py-4 space-y-4">
          <div className="text-center">
            <div className="inline-block bg-red-500 text-white text-sm px-4 py-1 rounded-full">
              Effective Date: April 13, 2025
            </div>
            <p className="mt-4 text-sm text-gray-300">
              Welcome to QReturn, your trusted community-powered lost and found
              platform. This Privacy Policy outlines how we collect, use, store,
              and protect the personal and non-personal information of our
              users. Your privacy is very important to us, and we are committed
              to maintaining your trust by handling your data responsibly and
              transparently.
            </p>
          </div>

          <hr className="border-gray-500" />

          <section>
            <h2 className="flex items-center text-lg font-semibold mb-2">
              <FaThumbtack className="mr-2 text-red-400" /> Informattion we
              collect
            </h2>
            <p className="text-sm text-gray-300">
              When you interact with QReturn, we collect information to provide
              you with a secure, efficient, and user-friendly experience. The
              types of information we gather include both personal
              identification data and non-personal data related to your use of
              our platform.
            </p>
            <div className="mt-4 text-sm text-gray-300">
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>
                  Personal Identification Information: When you register or
                  report a lost or found item, we may collect your name, phone
                  number, and email address.
                </li>
                <li>
                  Location Data: To help locate lost items and show relevant
                  items nearby, we may collect your location data with your
                  explicit consent.
                </li>
                <li>
                  QR Code Data: Our system reads QR codes linked to user
                  profiles or item details, enabling easy ownership confirmation
                  without revealing personal information.
                </li>
                <li>
                  Chat Data: Conversations conducted through our in-app chat
                  system are end-to-end encrypted and are only accessible to the
                  respective users involved.
                </li>
              </ul>
            </div>
          </section>

          <hr className="border-gray-500" />

          <section>
            <h2 className="flex items-center text-lg font-semibold mb-2">
              <FaThumbtack className="mr-2 text-red-400" /> How we use data
            </h2>
            <p className="text-sm text-gray-300">
              The information we gather serves several important purposes, each
              aimed at improving your experience and maintaining the integrity
              of our community.
            </p>
            <div className="mt-4 text-sm text-gray-300">
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>
                  Service Delivery: We use your personal and technical
                  information to provide important services like reporting lost
                  or found items, finding nearby reports, and letting users
                  communicate safely with each other. This helps us confirm who
                  you are, handle your reports, and manage QR code activities.
                </li>
                <li>
                  Safety and Security: Your information helps us spot and stop
                  fake accounts, false reports, and harmful actions on our
                  platform. We also check for any suspicious activity or
                  unauthorized access.
                </li>
                <li>
                  Platform Improvement: We study how people use QReturn to make
                  the app better, fix problems, and add useful features.
                </li>
                <p className="bold italic">
                  Important:We will never sell, rent, or trade your personal
                  information to other companies for money-making purposes.
                </p>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="flex items-center text-lg font-semibold mb-2">
              <FaThumbtack className="mr-2 text-red-400" />
              How we protect our data
            </h2>
            <p className="text-sm text-gray-300">
              Protecting your data is one of our highest priorities. To this
              end, we implement a combination of administrative, technical, and
              physical security measures.
            </p>
            <div className="mt-4 text-sm text-gray-300">
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>
                  End-to-End Encryption: All messages exchanged via our in-app
                  chat system are encrypted, ensuring that only the
                  communicating parties can read their contents. This prevents
                  unauthorized access to sensitive conversations, even by our
                  administrators.
                </li>
                <li>
                  Minimal Data Sharing: We ensure that only necessary
                  information is exchanged between finders and owners during
                  item recovery. Sensitive personal details such as your phone
                  number or home address remain private unless you choose to
                  share them voluntarily
                </li>
                <li>
                  Regular Security Updates: Our technical team continually
                  monitors and updates our application and servers to address
                  security vulnerabilities and keep your data safe against
                  emerging threats.
                </li>
                <li>
                  Secure Storage: User data is stored on secure servers with
                  controlled access and encryption protocols, ensuring that your
                  personal information remains protected at all times.
                </li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="flex items-center text-lg font-semibold mb-2">
              <FaThumbtack className="mr-2 text-red-400" />
              Location data usage
            </h2>
            <p className="text-sm text-gray-300">
              QReturn’s location-based features are designed to help users
              quickly identify lost or found items within a specific geographic
              area. Location data is collected only when you grant permission
              through your device settings. This data is used to:
            </p>
            <div className="mt-4 text-sm text-gray-300">
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Display nearby lost or found reports</li>
                <li>Send proximity-based notifications.</li>
                <li>Track the location of QR-tagged items when scanned.</li>
              </ul>
              <p>
                Your location information is never visible to other users
                without your explicit consent. Additionally, you can revoke
                location permissions at any time through your device’s privacy
                settings.
              </p>
            </div>
          </section>
        </div>
      </div>
    </section>
  );
}
