"use client";
import React from "react";
import Link from "next/link";
import Image from "next/image";
import { FaShapes, FaUser, FaHandHoldingHeart } from "react-icons/fa";
import CountUp from "react-countup";
import { useInView } from "react-intersection-observer";
import KavinduImg from "../../../assets/member/Kavindu.jpg";
import NipunImg from "../../../assets/member/Nipun.jpg";
import ChamudiImg from "../../../assets/member/Chamudi.jpg";
import BannerImg from "../../../assets/banner.jpg";

export default function AboutUs() {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.3,
  });

  const members = [
    {
      name: "Kavindu Bimsara",
      image: KavinduImg,
    },
    {
      name: "Kavishan Nipun",
      image: NipunImg,
    },
    {
      name: "Chamudi Gopallawa",
      image: ChamudiImg,
    },
  ];

  return (
    <section className="text-white px-4">
      <div className="bg-green-400 rounded-b-[80%] h-28 flex items-center justify-center">
        <h2 className="text-2xl font-semibold">About Us</h2>
      </div>

      <div className="max-w-6xl mx-auto mt-8 md:mt-12 space-y-8 md:space-y-12">
        <div>
          <div className="flex items-center mb-4 md:mb-6">
            <h3 className="text-lg md:text-xl font-semibold mx-2 md:mx-4">
              Our Mission
            </h3>
            <hr className="border-gray-500 flex-grow" />
          </div>
          <div className="border border-white rounded-lg p-4 md:p-6 text-center">
            <p className="text-base md:text-lg font-medium leading-relaxed">
              Our aim is to create a safe and easy platform to help people
              recover lost items by leveraging crowdsourcing to bridge the gaps
              in existing solutions.
            </p>
          </div>
        </div>

        <div>
          <div className="flex items-center mb-4 md:mb-6">
            <h3 className="text-lg md:text-xl font-semibold mx-2 md:mx-4">
              Why We Built QReturn
            </h3>
            <hr className="border-gray-500 flex-grow" />
          </div>
          <div className="space-y-3 md:space-y-4 text-gray-300 text-sm md:text-base leading-relaxed">
            <p>
              Crowdsourcing is a powerful way to solve problems by getting help
              from a large group of people. But when it comes to finding lost
              items in local communities, like in Sri Lanka, the current options              aren&apos;t good enough. Most of the time, people use social media or
              small systems at places like universities. These methods are not
              well organized, don&apos;t protect people&apos;s privacy, and don&apos;t give
              people a good reason to help return lost items.
            </p>
            <p>
              People losing important things like phones, wallets, ID cards, and
              even pets, with no proper way to connect with the people who might
              find them. That&apos;s when we thought of creating something better.
            </p>
            <p>
              We came up with QReturn, a platform designed to fill this gap by
              providing a smart system where people can report lost and found
              items quickly and safely. Our aim is to make the process fairer,
              faster, and friendlier — QReturn is here to make finding lost
              items simple and secure.
            </p>
          </div>
        </div>

        <div className="text-white py-6 md:py-10 space-y-8 md:space-y-12">
          <div className="relative w-full" ref={ref}>
            <div className="rounded-lg overflow-hidden shadow-lg h-64 md:h-96">
              <div className="w-full h-full bg-gray-700 relative">
                <Image
                  src={BannerImg}
                  alt="Banner"
                  fill
                  className="object-cover opacity-50"
                />
              </div>
            </div>

            <div className="absolute inset-0 flex items-center justify-center z-10">
              <div className="flex flex-row justify-center items-center space-x-4 md:space-x-16 px-2 md:px-6">
                <StatCounter
                  icon={
                    <FaShapes className="text-2xl md:text-4xl text-white" />
                  }
                  count={15}
                  label="Categories"
                  inView={inView}
                />

                <StatCounter
                  icon={<FaUser className="text-2xl md:text-4xl text-white" />}
                  count={1000}
                  label="Users"
                  inView={inView}
                />

                <StatCounter
                  icon={
                    <FaHandHoldingHeart className="text-2xl md:text-4xl text-white" />
                  }
                  count={220}
                  label="Successful returns"
                  inView={inView}
                />
              </div>
            </div>
          </div>

          <div className="text-center mt-8">
            <h2 className="text-xl md:text-2xl font-semibold">Meet the team</h2>
            <div className="w-16 md:w-24 border-b-2 border-gray-600 mx-auto mt-2" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
            {members.map((person, index) => (
              <div key={index} className="flex flex-col items-center space-y-3">
                <div className="w-32 h-32 md:w-40 md:h-40 bg-gray-700 rounded-md shadow-inner overflow-hidden relative">
                  <Image
                    src={person.image}
                    alt={`${person.name} profile`}
                    fill
                    className="object-cover"
                  />
                </div>
                <p className="font-semibold">{person.name}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function StatCounter({ icon, count, label, inView }) {
  return (
    <div className="text-center flex flex-col items-center">
      <div className="mb-1">{icon}</div>
      <div className="text-green-400 text-xl md:text-4xl font-bold">
        <CountUp
          start={0}
          end={inView ? count : 0}
          duration={4}
          useEasing={true}
        />
        +
      </div>
      <div className="text-white text-xs md:text-lg font-semibold">
        {label === "Successful returns" ? (
          <>
            Successful
            <br className="md:hidden" /> returns
          </>
        ) : (
          label
        )}
      </div>
    </div>
  );
}
