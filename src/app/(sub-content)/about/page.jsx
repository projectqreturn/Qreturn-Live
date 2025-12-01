"use client";

import React from "react";
import Image from "next/image";
import { useInView } from "react-intersection-observer";

import KavinduImg from "../../../assets/member/Kavindu.jpg";
import NipunImg from "../../../assets/member/Nipun.jpg";
import ChamudiImg from "../../../assets/member/Chamudi.jpg";

export default function AboutUs() {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.25,
  });

  const members = [
    { name: "Kavindu Bimsara", image: KavinduImg },
    { name: "Kavishan Nipun", image: NipunImg },
    { name: "Chamudi Gopallawa", image: ChamudiImg },
  ];

  const stats = [
    { value: 5, label: "Categories" },
    { value: 1000, label: "Users" },
    { value: 220, label: "Returns" },
  ];

  return (
    <section className="min-h-screen bg-gray-950 text-white mt-32">
      {/* Hero */}
      <div>
        <div className="max-w-4xl mx-auto px-6 py-20 text-center">
          <h1 className="text-5xl font-semibold mb-4 tracking-tight">About Us</h1>
          <p className="text-gray-400 text-lg font-light max-w-2xl mx-auto">
              We are undergraduates at SLTC Research University, and this is our final year project: creating a safe platform to help people recover lost items through community collaboration.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-16 space-y-24">
        {/* Mission */}
        <div>
          <h2 className="text-sm uppercase tracking-widest text-gray-500 mb-6 font-semibold">
            Our Mission
          </h2>
          <p className="text-2xl font-light leading-relaxed text-gray-300">
            We aim to create a safe and easy platform to help people recover
            lost items by leveraging crowdsourcing to bridge the gaps in
            existing solutions.
          </p>
        </div>

        {/* Why QReturn */}
        <div className="mt-20">
          <h2 className="text-sm uppercase tracking-widest text-gray-500 mb-6 font-semibold">
            Why We Built QReturn
          </h2>
          <div className="space-y-6 text-gray-400 font-light leading-relaxed">
            <p>
              Crowdsourcing is a powerful way to solve problems by getting help
              from a large group of people. But when it comes to finding lost
              items in local communities, like in Sri Lanka, the current options
              aren't good enough.
            </p>
            <p>
              Most of the time, people use social media or small systems at
              places like universities. These methods are not well organized,
              don't protect privacy, and don't offer a real incentive to help
              return lost items.
            </p>
            <p>
              That's when we decided to build something better. QReturn is
              designed to fill this gap by providing a smart system for people
              to report lost and found items quickly and safely.
            </p>
          </div>
        </div>

        {/* Stats */}
        <div
          ref={ref}
          className="py-12 border-y border-gray-800 grid grid-cols-1 sm:grid-cols-3 gap-10"
        >
          {stats.map((stat, i) => (
            <StatCounter
              key={i}
              count={stat.value}
              label={stat.label}
              inView={inView}
            />
          ))}
        </div>

        {/* Team */}
        <div>
          <h2 className="text-sm uppercase tracking-widest text-gray-500 mb-12 text-center font-semibold">
            Meet the Team
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-16 sm:gap-12">
            {members.map((person, index) => (
              <div key={index} className="text-center group">
                <div className="w-32 h-32 mx-auto mb-4 rounded-full overflow-hidden bg-gray-900 relative">
                  <Image
                    src={person.image}
                    alt={person.name}
                    fill
                    sizes="128px"
                    className="object-cover grayscale group-hover:grayscale-0 transition-all duration-300"
                  />
                </div>
                <p className="text-gray-300 font-light">{person.name}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function StatCounter({ count, label, inView }) {
  const [currentCount, setCurrentCount] = React.useState(0);

  React.useEffect(() => {
    if (!inView) return;

    let start = 0;
    const duration = 1500;
    const increment = count / (duration / 16);

    const timer = setInterval(() => {
      start += increment;
      if (start >= count) {
        setCurrentCount(count);
        clearInterval(timer);
      } else {
        setCurrentCount(Math.floor(start));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [inView, count]);

  return (
    <div className="text-center">
      <div className="text-4xl font-light text-white mb-2">{currentCount}+</div>
      <div className="text-sm uppercase tracking-widest text-gray-500">
        {label}
      </div>
    </div>
  );
}
