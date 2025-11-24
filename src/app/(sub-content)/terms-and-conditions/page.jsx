"use client";
import React from "react";
import { FaThumbtack } from "react-icons/fa";

export default function Tearms() {
  return (
    <section className="text-white">
      <div className="bg-green-400 rounded-b-[80%] h-28 flex items-center justify-center">
        <h2 className="text-2xl font-semibold">About Us</h2>
      </div>

      <div className="min-h-screen text-white pt-6 flex items-center justify-center">
        <div className="w-full max-w-7xl bg-gray-800 border border-gray-700 shadow-xl rounded-2xl p-6 space-y-6">
          <div className="text-center">
            <div className="inline-block bg-red-500 text-white text-sm px-4 py-1 rounded-full">
              Effective Date: April 13, 2025
            </div>
            <p className="mt-4 text-sm text-gray-300">
              These terms govern your use of the QReturn platform and outline
              your rights, responsibilities, and limitations while participating
              in our crowdsourced lost and found community. Please read this
              document carefully before using our services.
            </p>
          </div>

          <hr className="border-gray-500" />

          <section>
            <h2 className="flex items-center text-lg font-semibold mb-2">
              <FaThumbtack className="mr-2 text-red-400" /> User Account
              Creation and Verification
            </h2>
            <p className="text-sm text-gray-300">
              To use certain features of QReturn like reporting lost or found
              items, chatting with other users, and getting notifications, you
              need to create an account. To help keep our community safe and
              trustworthy, we ask you to verify your identity when you register.
            </p>

            <div className="mt-4 text-sm text-gray-300">
              <p className="mb-2 font-semibold">
                NIC (National Identity Card) Submission:
              </p>
              <p>
                When creating your QReturn account, you’ll need to upload a
                clear copy of your National Identity Card (NIC) or another
                official ID. This is done to:
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Make sure people signing up are real.</li>
                <li>
                  Stop fake reports or people pretending to be someone else.
                </li>
                <li>
                  Keep users responsible when reporting or claiming lost and
                  found items.
                </li>
              </ul>
              <p className="mt-2">
                Your ID will be safely stored and only used to check your
                identity. We won’t share it with anyone else unless you say it’s
                okay, or if the law requires it. By sending your ID, you confirm
                it’s real and belongs to you.
              </p>
              <p className="mt-2">
                If you don’t provide a valid ID, you might not be able to use
                some QReturn services or your account could be closed.
              </p>
            </div>
          </section>

          <hr className="border-gray-500" />

          <section>
            <h2 className="flex items-center text-lg font-semibol mb-2">
              <FaThumbtack className="mr-2 text-red-400" /> Acceptable Use
              Policy
            </h2>
            <p className="text-sm text-gray-300">
              By using QReturn, you agree to use our platform responsibly and
              lawfully. You must not:
            </p>
            <ul className="list-disc list-inside text-sm text-gray-300 mt-2 space-y-1">
              <li>
                Post or report false, misleading, or fraudulent lost or found
                items.
              </li>
              <li>
                Impersonate another individual or falsely claim ownership of an
                item.
              </li>
              <li>
                Harass, abuse, or threaten other users through the in-app chat
                system.
              </li>
              <li>
                Upload or share inappropriate, offensive, or illegal content.
              </li>
              <li>
                Attempt to interfere with the normal operation of the platform
                or its security measures.
              </li>
            </ul>
            <p className="mt-2 text-sm text-gray-300">
              Violating these guidelines may result in temporary or permanent
              suspension of your account, and where applicable, legal action.
            </p>
          </section>

          <hr className="border-gray-500" />

          <section>
            <h2 className="flex items-center text-lg font-semibol mb-2">
              <FaThumbtack className="mr-2 text-red-400" />
              Reporting and Claiming Items
            </h2>
            <p className="text-sm text-gray-300">
              QReturn operates on a trust-based, community-driven model where
              users voluntarily report lost and found items. While we provide
              tools for secure communication and item verification through QR
              codes and NIC verification, we do not assume responsibility for
              the accuracy of user-submitted reports or the condition of
              recovered items. When claiming a lost item, you may be asked to
              provide identification or proof of ownership. This can include
              photographs, receipts, or additional verification through your
              QReturn account.
            </p>
          </section>

          <hr className="border-gray-500" />

          <section>
            <h2 className="flex items-center text-lg font-semibol mb-2">
              <FaThumbtack className="mr-2 text-red-400" />
              Privacy and Data Protection
            </h2>
            <p className="text-sm text-gray-300">
              By using QReturn, you acknowledge and agree to our Privacy Policy,
              which details how your personal data, including your NIC copy,
              contact details, location information, and chat records, are
              collected, used, and protected. All personal information submitted
              to QReturn is handled in accordance with applicable data
              protection laws and regulations.
            </p>
          </section>

          <hr className="border-gray-500" />

          <section>
            <h2 className="flex items-center text-lg font-semibol mb-2">
              <FaThumbtack className="mr-2 text-red-400" />
              QR Code Usage
            </h2>
            <p className="text-sm text-gray-300">
              Our system assigns unique QR codes to items registered within the
              QReturn platform. Users are responsible for safeguarding QR
              stickers or digital codes linked to their items. Unauthorized
              scanning or tampering with QR codes not belonging to you is
              strictly prohibited and may result in immediate suspension of your
              account and further investigation.
            </p>
          </section>
        </div>
      </div>
    </section>
  );
}
