"use client";
import React, { useState, useRef, useEffect } from "react";

import DatePicker from "../../../../components/createpost/DatePicker";
import FileUploadArea from "../../../../components/createpost/FileUploadArea";
import GmapLocationFetch from "@/components/map/NewGmapLocationFetch";
import { FaLocationArrow } from "react-icons/fa6";

import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";

import { useUser } from "@clerk/clerk-react";

const sriLankanCities = [
  "Colombo",
  "Kandy",
  "Galle",
  "Jaffna",
  "Negombo",
  "Trincomalee",
  "Batticaloa",
  "Anuradhapura",
  "Ratnapura",
  "Badulla",
  "Matara",
  "Kurunegala",
  "Polonnaruwa",
  "Hambantota",
  "Nuwara Eliya",
  "Kegalle",
  "Matale",
  "Puttalam",
  "Kalutara",
  "Ampara",
  "Gampaha",
  "Kilinochchi",
  "Mullaitivu",
  "Mannar",
  "Vavuniya",
];

export default function LostItemForm() {
  const router = useRouter();
  // clerk user data
  const { isSignedIn, user, isLoaded } = useUser();
  const [userEmail, setUserEmail] = useState(""); // to store user email
  const [showReward, setShowReward] = useState(false);
  const [files, setFiles] = useState([]);
  const [lostDate, setLostDate] = useState(null);
  const [isUploadingImages, setIsUploadingImages] = useState(false);

  // Set user email when loaded clerk user data
  useEffect(() => {
    if (isLoaded && isSignedIn) {
      setUserEmail(user.primaryEmailAddress?.emailAddress || "");
    }
  }, [isLoaded, isSignedIn, user]);

  //  GPS state with location name
  const [gps, setGps] = useState({
    lat: 7.487718248208046,
    lng: 80.36427172854248,
    name: "Default Location",
  });

  // Fetch current location on component mount
  useEffect(() => {
    getCurrentLocation();
  }, []);

  // Fetch current location
  const getCurrentLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setGps({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          toast.success("Location updated successfully!");
        },
        (error) => {
          console.error("Error getting location:", error);
          toast.error("Could not get your location. Using default location.");
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000,
        }
      );
    } else {
      toast.error("Geolocation is not supported by your browser");
    }
  };

  // Handle location change from map component
  const handleLocationChange = (newLocation) => {
    setGps({
      lat: newLocation.lat,
      lng: newLocation.lng,
    });
    console.log("Location updated:", newLocation);
    toast.success("Location selected successfully!");
  };

  // Refs for inputs
  const itemNameRef = useRef();
  const phoneRef = useRef();
  const categoryRef = useRef();
  const locationRef = useRef();
  const descriptionRef = useRef();
  const rewardAmountRef = useRef();

  const handleDateChange = (date) => {
    setLostDate(date);
  };

  const handleSubmit = async () => {
    // Validate required fields
    if (
      !itemNameRef.current?.value ||
      !lostDate ||
      !phoneRef.current?.value ||
      !categoryRef.current?.value ||
      !locationRef.current?.value ||
      !descriptionRef.current?.value
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    const formData = {
      title: itemNameRef.current?.value,
      date: lostDate,
      phone: phoneRef.current?.value,
      Category: categoryRef.current?.value,
      District: locationRef.current?.value,
      description: descriptionRef.current?.value,
      email: userEmail,
      clerkUserId: user?.id || "", // Add Clerk user ID for notifications
      photo: files
        .map((f) => (typeof f === "string" ? f : f.url))
        .filter(Boolean),
      postType: "lost",
      reward: showReward,
      price: showReward ? rewardAmountRef.current?.value : null,
      gps: `${gps.lat},${gps.lng}`,
    };

    console.log("Form Data:", formData);

    // Insert data into database
    try {
      toast.loading("Creating post...");
      const res = await fetch("/api/post/lost", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      toast.dismiss();

      // Check if response is JSON
      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const textResponse = await res.text();
        console.error("Non-JSON response:", textResponse);
        throw new Error(
          "Server returned an error. Please check the console and restart the development server."
        );
      }

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to create post");
      }

      console.log("Response from API:", data);
      toast.success("Post published successfully!");
      setTimeout(() => {
        router.push("/lost");
      }, 1500);
    } catch (error) {
      console.error("Error posting data:", error);
      toast.dismiss();
      toast.error(error.message || "Failed to create post");
    }
  };

  return (
    <div className="bg-gray-950 text-white min-h-screen sm:p-48 p-10 mt-48 sm:mt-10">
      <h1 className="text-2xl font-bold mb-8">Lost an item? Post it here.</h1>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Left side: Form fields */}
        <div className="space-y-6 md:w-1/2">
          <div>
            <label className="block mb-2 font-bold">Name / Title</label>
            <input
              ref={itemNameRef}
              maxLength={50}
              type="text"
              placeholder="e.g: Black Leather Wallet"
              className="w-full p-3 bg-gradient-to-b from-white to-[#959595] placeholder-[#6B7280] text-black rounded-md"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-2 font-bold">Lost Date</label>
              <DatePicker
                onDateChange={handleDateChange}
                initialDate={lostDate}
                placeholder="Select date"
              />
            </div>

            <div>
              <label className="block mb-2 font-bold">Phone</label>
              <input
                ref={phoneRef}
                maxLength={10}
                type="text"
                placeholder="077xxxxxxx"
                onInput={(e) => {
                  e.target.value = e.target.value.replace(/[^0-9]/g, "");
                }}
                className="w-full p-3 bg-gradient-to-b from-white to-[#959595] rounded-md placeholder-[#6B7280] text-black"
              />
            </div>
          </div>

          <div>
            <label className="block mb-2 font-bold">Category</label>
            <select
              ref={categoryRef}
              defaultValue=""
              className="w-full p-3 bg-gradient-to-b from-white to-[#959595] placeholder-[#6B7280] text-black rounded-md"
            >
              <option value="" disabled hidden>
                Select Category
              </option>
              <option value="Personal">Personal</option>
              <option value="Vehicle">Vehicle</option>
              <option value="Electronics">Electronics</option>
              <option value="People">People</option>
              <option value="Pets & Animals">Pets & Animals</option>
              <option value="Other Items">Other Items</option>
            </select>
          </div>

          <div>
            <label className="block mb-2 font-bold">Lost at (Location)</label>
            <select
              ref={locationRef}
              defaultValue=""
              className="w-full p-3 bg-gradient-to-b from-white to-[#959595] placeholder-[#6B7280] text-black rounded-md"
            >
              <option value="" disabled hidden>
                Select City
              </option>
              {sriLankanCities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block mb-2 font-bold">Description</label>
            <textarea
              ref={descriptionRef}
              maxLength={300}
              placeholder="Details about the item: color, brand, unique identifiers, condition, etc."
              className="w-full p-3 bg-gradient-to-b from-white to-[#959595] placeholder-[#6B7280] text-black rounded-md h-32"
            />
          </div>

          <div>
            <div className="flex items-center gap-3">
              <label className="block font-bold">Reward</label>
              <div
                className={`w-12 h-6 rounded-full p-1 cursor-pointer ${
                  showReward ? "bg-green-400" : "bg-gray-700"
                }`}
                onClick={() => setShowReward(!showReward)}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full transform transition-transform ${
                    showReward ? "translate-x-6" : ""
                  }`}
                />
              </div>
            </div>
            <div className="text-xs text-gray-400 mt-1">
              Would you like to offer a reward for the return of your lost item?
            </div>
          </div>

          {showReward && (
            <div>
              <label className="block mb-2 font-bold">Amount</label>
              <input
                ref={rewardAmountRef}
                maxLength={10}
                type="text"
                placeholder="Rs. 1000.00"
                onInput={(e) => {
                  e.target.value = e.target.value.replace(/[^0-9.]/g, "");
                }}
                className="w-full p-3 bg-gradient-to-b from-white to-[#959595] placeholder-[#6B7280] text-black rounded-md"
              />
            </div>
          )}
        </div>

        {/* Right side:  Map and File Upload */}
        <div className="space-y-6 md:w-1/2">
          <div>
            <h3 className="text-left font-semibold mb-4">
              Select Lost Location
            </h3>

            {/* Location Info Display */}
            <div className="bg-gray-800 p-3 rounded-lg mb-4">
              <h4 className="font-medium text-sm text-gray-300 mb-1">
                Selected Location:
              </h4>
              <p className="text-white text-sm">{gps.name}</p>
              <p className="text-gray-400 text-xs">
                Coordinates: {gps.lat.toFixed(6)}, {gps.lng.toFixed(6)}
              </p>
            </div>

            {/*  Map Component */}
            <div className="bg-white rounded-lg p-2">
              <GmapLocationFetch
                lat={gps.lat}
                lng={gps.lng}
                name={gps.name}
                onLocationChange={handleLocationChange}
                allowCustomPicker={true}
                className="w-full"
              />
            </div>

            {/* Quick Location Actions */}
            <div className="flex gap-3 mt-4">
              <button
                type="button"
                onClick={getCurrentLocation}
                className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm transition-colors"
              >
                <FaLocationArrow />
                Use Current Location
              </button>
            </div>
          </div>

          <div>
            <label className="block mb-2 font-bold">Photos</label>
            <FileUploadArea
              files={files}
              setFiles={setFiles}
              onUploadStatusChange={setIsUploadingImages}
            />
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex md:justify-start justify-center">
        <button
          onClick={handleSubmit}
          disabled={isUploadingImages}
          className={`w-48 p-3 rounded-md font-bold mt-6 text-black transition-colors ${
            isUploadingImages
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-green-400 hover:bg-green-500"
          }`}
        >
          {isUploadingImages ? "Uploading Images..." : "Post"}
        </button>
      </div>
    </div>
  );
}
