'use client';
import React from "react";
import { FaCirclePlus } from "react-icons/fa6";
import { useRouter } from "next/navigation";


const Page = () => {
  const router = useRouter();
  const images = ["/slider/bag1.jpg", "/slider/bag2.jpg"];
  
  const navigateToLost = () => {
    router.push("/createpost/lost");
  };
  
  const navigateToFound = () => {
    router.push("/createpost/found");
  };
  
  return (
    <div className="pt-[23vh] lg:pt-44 px-4 mb-8 mt-12">
      <center>
        <h2 className="text-center font-bold text-3xl mt-6">
          Lost Something? Found Something?
        </h2>
        <p className="text-center font-light m-2">
          Every lost item has a story. Every found item <br />
          has a chance.
        </p>
        <h3 className="text-center font-semibold text-l mt-8 mb-5">
          Create a Post
        </h3>

        {/* Lost Button */}
        <div className="m-5 relative w-64 p-[2px] rounded-2xl bg-gradient-to-br from-[#FFA616] to-[#111827] hover:brightness-125 transition">
          <button 
            className="w-full h-full bg-gradient-to-br from-[#030712] to-[#111827] rounded-2xl p-4 flex flex-col items-center justify-center"
            onClick={navigateToLost}
          >
            <span>
              <span className="text-white font-bold">I </span>
              <span className="text-orange-400 font-bold">Lost </span>
              <span>Something!</span>
            </span>
            <div className="mt-2 rounded-full w-8 h-8 flex items-center justify-center">
              <center>
                <FaCirclePlus
                  className="m-2"
                  style={{ fontSize: "32px" }}
                />
              </center>
            </div>
          </button>
        </div>

        {/* Found Button */}
        <div className="m-5 relative w-64 p-[2px] rounded-2xl bg-gradient-to-br from-[#74FFB6] to-[#111827] hover:brightness-125 transition">
          <button 
            className="w-full h-full bg-gradient-to-br from-[#030712] to-[#111827] rounded-2xl p-4 flex flex-col items-center justify-center"
            onClick={navigateToFound}
          >
            <span>
              <span className="text-white font-bold">I </span>
              <span className="text-green-400 font-bold">Found </span>
              <span>Something!</span>
            </span>
            <div className="mt-2 rounded-full w-8 h-8 flex items-center justify-center">
              <center>
                <FaCirclePlus
                  className="m-2"
                  style={{ fontSize: "32px" }}
                />
              </center>
            </div>
          </button>
        </div>
      </center>
    </div>
  );
};

export default Page;