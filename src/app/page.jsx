"use client";

import Image from "next/image";
import Link from "next/link";
import qReturnLogo from "../assets/logo-w.png";
import mapBackground from "../assets/landingpage/map-background.jpg";
import LiveButton from "../components/landingpage/Button";
import GradientCard from "../components/landingpage/minicardicon";
import GradientCardLarge from "@/components/landingpage/cardicon/card";
import { IoBagRemove } from "react-icons/io5";
import { MdOutlinePhoneIphone, MdFace, MdOutlinePets } from "react-icons/md";
import { RiShapesFill } from "react-icons/ri";
import Loader from "@/components/landingpage/radaranimation/Loader";

import { MdQrCode2, MdVerified, MdOutlineShareLocation } from "react-icons/md";
import { GiReceiveMoney } from "react-icons/gi";
import { TbMessageFilled } from "react-icons/tb";
import { TbPhotoSearch } from "react-icons/tb";

import Footer from "@/components/footer/Footer";
import NavBar from "@/components/nav/NavBar";

export default function Home() {
  return (
    <>
      <div
        className="h-screen bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${mapBackground.src})` }}
      >
        <div>
          <NavBar />
        </div>

        {/* Main Content */}
        <div className="h-full flex items-center justify-center text-center text-white px-6 sm:px-12">
          <div>
            {/* Heading */}
            <h1 className="text-4xl sm:text-6xl font-bold mb-4">
              Lost Something? Found Something? <br />
              Let the Crowd Help You!
            </h1>
            {/* Description */}
            <p className="text-lg sm:text-2xl mb-8">
              Our app connects you with nearby helpers to recover lost items or
              reunite found belongings with their owners. <br />
              Let&apos;s make lost and found easy!
            </p>
            {/* Button */}
            <div>
              <LiveButton />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-950 ">
        <div className="mt-14">
          <div className="flex flex-wrap justify-center gap-14 p-4  ">
            {/* Card 1 */}
            <div className="flex flex-col items-center ">
              <GradientCard
                icon={
                  <IoBagRemove className="sm:h-14 sm:w-14 h-10 w-10 text-gray-400" />
                }
                gradient="bg-gradient-to-br from-gray-600 to-gray-800"
              />
              <span className="mt-2 font-semibold text-gray-400">Personal</span>
            </div>

            {/* Card 2 */}
            <div className="flex flex-col items-center ">
              <GradientCard
                icon={
                  <MdOutlinePhoneIphone className="sm:h-14 sm:w-14 h-10 w-10 text-gray-400 " />
                }
                gradient="bg-gradient-to-br from-gray-600 to-gray-800"
              />
              <span className="mt-2 font-semibold text-gray-400">
                Electronics
              </span>
            </div>

            {/* Card 3 */}
            <div className="flex flex-col items-center ">
              <GradientCard
                icon={
                  <MdFace className="sm:h-14 sm:w-14 h-10 w-10 text-gray-400" />
                }
                gradient="bg-gradient-to-br from-gray-600 to-gray-800"
              />
              <span className="mt-2 font-semibold text-gray-400">People</span>
            </div>

            {/* Card 4 */}
            <div className="flex flex-col items-center ">
              <GradientCard
                icon={
                  <MdOutlinePets className="sm:h-14 sm:w-14 h-10 w-10 text-gray-400" />
                }
                gradient="bg-gradient-to-br from-gray-600 to-gray-800"
              />
              <span className="mt-2 font-semibold text-gray-400">
                Pets & Animals
              </span>
            </div>

            {/* Card 5 */}
            <div className="flex flex-col items-center ">
              <GradientCard
                icon={
                  <RiShapesFill className="sm:h-14 sm:w-14 h-10 w-10 text-gray-400" />
                }
                gradient="bg-gradient-to-br from-gray-600 to-gray-800"
              />
              <span className="mt-2 font-semibold text-gray-400">
                Other Items
              </span>
            </div>
          </div>
        </div>
      </div>
      <div className="h-full flex items-center justify-center text-center text-white px-6 sm:px-12 mt-20">
        <div>
          {/* Heading */}
          <h1 className="text-3xl sm:text-4xl font-bold mb-4">
            How It Works? <br />
            Simple Steps to Find or Return Lost Items
          </h1>
          {/* Description */}
          <p className="text-base sm:text-xl mb-8 text-gray-400">
            Our app simplifies the lost and found process with easy-to-follow
            steps. <br />
            Tag your belongings with QR codes, post lost or found items, connect
            securely with others, and use location-based tools <br />
            to recover items quickly and efficiently.
          </p>
        </div>
      </div>
      <div className="flex justify-center ">
        <Loader className="" />
      </div>
      <div className="my-4 px-32 mt-10">
        <hr className="border-t border-gray-800 X" />
      </div>
      <div className="flex flex-wrap justify-center gap-14 p-4 ">
        <div className="flex flex-col sm:space-y-24 space-y-10 mt-20">
          {/* Section 1 */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start sm:space-x-4 space-y-4 sm:space-y-0 text-center sm:text-left">
            <GradientCardLarge
              icon={
                <MdQrCode2 className="sm:h-28 sm:w-28 h-28 w-28 text-green-400" />
              }
              gradient="bg-gradient-to-br from-gray-600 to-gray-800"
              bordergradient="bg-gradient-to-tl from-gray-600 to-gray-200"
            />
            <div className="flex  flex-col px-5 p-3">
              <h2 className="sm:text-3xl text-2xl font-semibold text-gray-100">
                QR Code System
              </h2>
              <p className="sm:text-lg text-base text-gray-400">
                Easily tag your belongings with a unique QR code. <br />
                If lost, others can scan it to contact you directly,
                <br />
                ensuring quick and secure identification.
              </p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-center sm:items-start sm:space-x-4 space-y-4 sm:space-y-0 text-center sm:text-left">
            <GradientCardLarge
              icon={
                <TbPhotoSearch className="sm:h-28 sm:w-28 h-28 w-28 text-green-400" />
              }
              gradient="bg-gradient-to-br from-gray-600 to-gray-800"
              bordergradient="bg-gradient-to-tl from-gray-600 to-gray-200"
            />
            <div className="flex  flex-col px-5 p-3">
              <h2 className="sm:text-3xl text-2xl font-semibold text-gray-100">
                Ai Image Search
              </h2>
              <p className="sm:text-lg text-base text-gray-400">
                Use AI-powered image recognition to search for <br />lost & Found items by uploading a photo. <br />
                Quickly find matches and connect with finders,
                <br />
                making the recovery process more efficient.
              </p>
            </div>
          </div>
          {/* Section 2 */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start sm:space-x-4 space-y-4 sm:space-y-0 text-center sm:text-left">
            <GradientCardLarge
              icon={
                <GiReceiveMoney className="sm:h-28 sm:w-28 h-28 w-28 text-green-400" />
              }
              gradient="bg-gradient-to-br from-gray-600 to-gray-800"
              bordergradient="bg-gradient-to-tl from-gray-600 to-gray-200"
            />
            <div className="flex  flex-col px-5 p-3">
              <h2 className="sm:text-3xl text-2xl font-semibold text-gray-100">
                Reward System
              </h2>
              <p className="sm:text-lg text-base text-gray-400">
                Offer a reward for lost items, motivating others to <br />
                help. The app securely holds payments, ensuring <br />
                fair transactions once the item is returned.
              </p>
            </div>
          </div>
          {/* Section 3 */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start sm:space-x-4 space-y-4 sm:space-y-0 text-center sm:text-left">
            <GradientCardLarge
              icon={
                <MdOutlineShareLocation className="sm:h-28 sm:w-28 h-28 w-28 text-green-400" />
              }
              gradient="bg-gradient-to-br from-gray-600 to-gray-800"
              bordergradient="bg-gradient-to-tl from-gray-600 to-gray-200"
            />
            <div className="flex  flex-col px-5 p-3">
              <h2 className="sm:text-3xl text-2xl font-semibold text-gray-100">
                Nearby Map Search
              </h2>
              <p className="sm:text-lg text-base text-gray-400">
                View lost items on a map and find posts near you.
                <br />
                Receive notifications for items with rewards in your <br />
                vicinity to help reconnect items faster.
              </p>
            </div>
          </div>
          {/* Section 4 */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start sm:space-x-4 space-y-4 sm:space-y-0 text-center sm:text-left">
            <GradientCardLarge
              icon={
                <TbMessageFilled className="sm:h-28 sm:w-28 h-28 w-28 text-green-400" />
              }
              gradient="bg-gradient-to-br from-gray-600 to-gray-800"
              bordergradient="bg-gradient-to-tl from-gray-600 to-gray-200"
            />
            <div className="flex  flex-col px-5 p-3">
              <h2 className="sm:text-3xl text-2xl font-semibold text-gray-100">
                Secure Messaging
              </h2>
              <p className="sm:text-lg text-base text-gray-400">
                Communicate safely with finders or owners via <br />
                in-app chat, without sharing personal contact details, <br />
                protecting your privacy.
              </p>
            </div>
          </div>
          {/* Section 5 */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start sm:space-x-4 space-y-4 sm:space-y-0 text-center sm:text-left">
            <GradientCardLarge
              icon={
                <MdVerified className="sm:h-28 sm:w-28 h-28 w-28 text-green-400" />
              }
              gradient="bg-gradient-to-br from-gray-600 to-gray-800"
              bordergradient="bg-gradient-to-tl from-gray-600 to-gray-200"
            />
            <div className="flex  flex-col px-5 p-3">
              <h2 className="sm:text-3xl text-2xl font-semibold text-gray-100">
                Account Verification
              </h2>
              <p className="sm:text-lg text-base text-gray-400">
                Verify your identity with your NIC for added security, <br />
                ensuring trust between users and building a safer <br />
                lost and found community.
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-20">
        <Footer />
      </div>
    </>
  );
}
