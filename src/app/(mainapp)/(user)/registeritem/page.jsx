"use client";
import React, { useState, useRef } from "react";
import DatePicker from "../../../../components/createpost/DatePicker";
import FileUploadArea from "../../../../components/createpost/FileUploadArea";
import Gmap2 from "@/components/map/Gmap2";
import { BiQrScan } from "react-icons/bi";
import { useRouter } from 'next/navigation';
import { useUser } from "@clerk/nextjs";

export default function RegItemForm() {
  const router = useRouter();
  const { user } = useUser();
  const [showReward, setShowReward] = useState(false);
  const [files, setFiles] = useState([]);
  const [foundDate, setFoundDate] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Refs for inputs
  const itemNameRef = useRef();
  const phoneRef = useRef();
  const categoryRef = useRef();
  const locationRef = useRef();
  const descriptionRef = useRef();
  const rewardAmountRef = useRef();

  const handleDateChange = (date) => {
    setFoundDate(date);
  };

  const handleSubmit = async () => {
    setError("");
    setIsSubmitting(true);

    try {
      // Validate required fields
      const itemName = itemNameRef.current?.value;
      const category = categoryRef.current?.value;
      const description = descriptionRef.current?.value;

      if (!itemName || !category || !description) {
        setError("Please fill in all required fields");
        setIsSubmitting(false);
        return;
      }

      if (!user) {
        setError("Please log in to register an item");
        setIsSubmitting(false);
        return;
      }

      const formData = {
        userId: user.id,
        title: itemName,
        Category: category,
        description: description,
        photo: files.map(f => (typeof f === "string" ? f : f.url)).filter(Boolean),
      };

      console.log("Submitting form data:", formData);

      const response = await fetch('/api/myitems', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to register item');
      }

      const result = await response.json();
      console.log("Item registered successfully:", result);

      if (!result || !result.myItemsId) {
        throw new Error("Invalid response from server");
      }

      // Navigate to QR code page with the created item ID
      router.push(`/registeritem/qrcode?itemId=${result.myItemsId}`);
    } catch (error) {
      console.error("Error registering item:", error);
      setError(error.message || "Failed to register item. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNavigation = () => {
    router.push("/registeritem/qrcode");
  };

  return (
    <div className="bg-gray-950 text-white min-h-screen sm:p-48 p-10 mt-48 sm:mt-1">
      <div className="flex items-center gap-2">
        <BiQrScan className="sm:w-10 sm:h-10 w-20 h-20 text-white mb-8" />
        <h1 className="text-2xl font-bold mb-8">
          Register Your Item & Generate a QR Code.
        </h1>
      </div>
      
      {error && (
        <div className="bg-red-500 text-white p-3 rounded-md mb-4">
          {error}
        </div>
      )}
      
      <div>
        <span className="mt-[-24px] block font-semibold text-sm">
          <span className="text-green-400">
            Update your private contact information
          </span>{" "}
          in your profile. These details remain hidden and are{" "}
          <span className="text-green-400 ">
            only shared with others when you Marked an item as lost
          </span>
        </span>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Left side: Form fields */}
        <div className="space-y-6 md:w-1/2 mt-5">
          <div>
            <label className="block mb-2 font-bold">
              Item Name / Title <span className="text-red-400">*</span>
            </label>
            <input
              ref={itemNameRef}
              maxLength={50}
              type="text"
              placeholder="e.g: Black Leather Wallet"
              className="w-full p-3 bg-gradient-to-b from-white to-[#959595] placeholder-[#6B7280] text-black rounded-md"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4"></div>

          <div>
            <label className="block mb-2 font-bold">
              Category <span className="text-red-400">*</span>
            </label>
            <select
              ref={categoryRef}
              className="w-full p-3 bg-gradient-to-b from-white to-[#959595] placeholder-[#6B7280] text-black rounded-md"
              required
            >
              <option value="" disabled selected hidden>
                Select Category
              </option>
              <option>Personal</option>
              <option>Electronics</option>
              <option>People</option>
              <option>Pets & Animals</option>
              <option>Other Items</option>
            </select>
          </div>

          <div>
            <label className="block mb-2 font-bold">
              Description <span className="text-red-400">*</span>
            </label>
            <textarea
              ref={descriptionRef}
              maxLength={300}
              placeholder="Details about the item: color, brand, unique identifiers, condition, etc."
              className="w-full p-3 bg-gradient-to-b from-white to-[#959595] placeholder-[#6B7280] text-black rounded-md h-32"
              required
            />
          </div>
        </div>
      </div>
  <div className="md:w-1/2">
        <label className="block mb-2 font-bold">Photos (Optional)</label>
        <FileUploadArea files={files} setFiles={setFiles} />
      </div>

      {/* Submit Button */}
      <div className="flex justify-center md:justify-end">
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className={`w-48 p-3 rounded-md font-bold mt-6 text-black ${
            isSubmitting 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-green-400 hover:bg-green-500'
          }`}
        >
          {isSubmitting ? 'Registering...' : 'Generate QR Code'}
        </button>
      </div>
    </div>
  );
}
