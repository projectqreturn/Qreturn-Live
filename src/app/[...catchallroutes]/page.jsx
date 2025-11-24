import React from "react";
import Image from "next/image";
import QretunrLogo from "../../assets/logo-w.png";
import Loader from "@/components/landingpage/radaranimation/Loader";
import GoToItemsButton from "@/components/catchroutes/GoToItemsButton";

const NotFoundPage = ({}) => {
  // Join the catchall routes with slashes to display the path

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-950 text-white p-4">
      <div className="max-w-lg w-full ">
        {/* Logo area with proper Next.js Image component */}
        <div className="h-64 w-full flex items-center justify-center">
          <div className="relative h-32 w-64">
            <Image
              src={QretunrLogo}
              alt="Qretunr Logo"
              fill
              priority
              style={{ objectFit: "contain" }}
            />
          </div>
        </div>

        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Page Not Found</h1>
          <p className="text-lg text-gray-400 mb-6">
            The page you&apos;re looking for doesn&apos;t exist
          </p>

          <div className="mt-8">
            <div className="flex justify-center items-center min-h-32">
              <Loader />
            </div>
          </div>

          <div className="flex justify-center mt-6">
            <GoToItemsButton />
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
