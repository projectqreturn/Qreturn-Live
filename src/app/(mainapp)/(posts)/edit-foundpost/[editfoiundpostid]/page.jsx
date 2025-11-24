"use client";
import React, { useState, useRef, useEffect } from "react";
import DatePicker from "../../../../../components/createpost/DatePicker";
import FileUploadArea from "../../../../../components/createpost/FileUploadArea";
import Gmap2 from "@/components/map/Gmap2";
import { useParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function FoundItemForm() {
  const [files, setFiles] = useState([]);
  const [foundDate, setFoundDate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [postData, setPostData] = useState(null);
  const [gpsCoordinates, setGpsCoordinates] = useState("7.487718248208046,80.36427172854248");
  const [mapLocation, setMapLocation] = useState({
    lat: 7.487718248208046,
    lng: 80.36427172854248,
    name: "Bus Stand - Kurunegala"
  });

  const { editfoiundpostid } = useParams();
  const router = useRouter();

  // Refs for inputs
  const itemNameRef = useRef();
  const phoneRef = useRef();
  const categoryRef = useRef();
  const locationRef = useRef();
  const descriptionRef = useRef();

  const handleDateChange = (date) => {
    setFoundDate(date);
  };

  const handleSubmit = async () => {
    try {
      setUpdating(true);

      // Prepare update data
      const updateData = {
        title: itemNameRef.current?.value,
        date: foundDate ? foundDate.toISOString() : postData.date,
        phone: phoneRef.current?.value,
        Category: categoryRef.current?.value,
        District: locationRef.current?.value,
        gps: gpsCoordinates,
        description: descriptionRef.current?.value,
        email: postData.email, // Keep original email
        photo: files.length > 0 ? files : postData.photo, // Use new files or keep existing
      };

      console.log("Updating post with data:", updateData);

      // Send PUT request
      const res = await fetch(`/api/post/found?id=${editfoiundpostid}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      const data = await res.json();

      if (res.ok) {
        console.log("Post updated successfully:", data);
        toast.success('Post updated successfully!')
        // Optionally redirect to profile or post detail page
        router.push("/profile"); // or wherever you want to redirect
      } else {
        console.error("Failed to update post:", data.message);
        alert(`Failed to update post: ${data.message}`);
        toast.error(`Failed to update post: ${data.message}`)
      }
    } catch (error) {
      console.error("Error updating post:", error);
      alert("An error occurred while updating the post");
    } finally {
      setUpdating(false);
    }
  };

  // Fetch post data and populate form
  useEffect(() => {
    const load = async () => {
      const baseUrl = "/api/post/found";
      let newUrl = `${baseUrl}?id=${editfoiundpostid}`;

      try {
        setLoading(true);
        const res = await fetch(newUrl, { cache: "no-store" });
        const data = await res.json();
        console.log('post Data:', data.post);

        if (data.post) {
          const post = data.post;
          setPostData(post);

          // Set form field values
          if (itemNameRef.current) itemNameRef.current.value = post.title || "";
          if (phoneRef.current) phoneRef.current.value = post.phone || "";
          if (categoryRef.current) categoryRef.current.value = post.Category || "";
          if (locationRef.current) locationRef.current.value = post.District || "";
          if (descriptionRef.current) descriptionRef.current.value = post.description || "";

          // Set date
          if (post.date) {
            setFoundDate(new Date(post.date));
          }

          // Set photos/files
          if (post.photo && Array.isArray(post.photo)) {
            setFiles(post.photo);
          }

          // Set map location from GPS
          if (post.gps) {
            setGpsCoordinates(post.gps);
            const [lat, lng] = post.gps.split(',').map(Number);
            if (!isNaN(lat) && !isNaN(lng)) {
              setMapLocation({
                lat,
                lng,
                name: post.District || "Location"
              });
            }
          }
        }
      } catch (e) {
        console.error("Failed to load post", e);
      } finally {
        setLoading(false);
      }
    };

    if (editfoiundpostid) {
      load();
    }
  }, [editfoiundpostid]);

  if (loading) {
    return (
      <div className="bg-gray-950 text-white min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading post data...</div>
      </div>
    );
  }

  if (!postData) {
    return (
      <div className="bg-gray-950 text-white min-h-screen flex items-center justify-center">
        <div className="text-xl">Post not found</div>
      </div>
    );
  }

  return (
    <div className="bg-gray-950 text-white min-h-screen sm:p-48 p-10 mt-48 sm:mt-10">
      <h1 className="text-2xl font-bold mb-8">Edit Your Found item Post.</h1>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Left side: Form fields */}
        <div className="space-y-6 md:w-1/2">
          <div>
            <label className="block mb-2 font-bold">
              Found Item Name / Title
            </label>
            <input
              ref={itemNameRef}
              maxLength={50}
              type="text"
              placeholder="e.g: Black Leather Wallet"
              defaultValue={postData.title || ""}
              className="w-full p-3 bg-gradient-to-b from-white to-[#959595] placeholder-[#6B7280] text-black rounded-md"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-2 font-bold">Found Date</label>
              <DatePicker
                onDateChange={handleDateChange}
                initialDate={foundDate}
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
                defaultValue={postData.phone || ""}
                onInput={(e) => {
                  e.target.value = e.target.value.replace(/[^0-9.]/g, "");
                }}
                className="w-full p-3 bg-gradient-to-b from-white to-[#959595] rounded-md placeholder-[#6B7280] text-black"
              />
            </div>
          </div>

          <div>
            <label className="block mb-2 font-bold">Category</label>
            <select
              ref={categoryRef}
              defaultValue={postData.Category || ""}
              className="w-full p-3 bg-gradient-to-b from-white to-[#959595] placeholder-[#6B7280] text-black rounded-md"
            >
              <option value="" disabled>
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
            <label className="block mb-2 font-bold">Found at (Location)</label>
            <input
              ref={locationRef}
              maxLength={20}
              type="text"
              placeholder="ex: Near Kurunegala bus stand"
              defaultValue={postData.District || ""}
              className="w-full p-3 bg-gradient-to-b from-white to-[#959595] placeholder-[#6B7280] text-black rounded-md"
            />
          </div>

          <div>
            <label className="block mb-2 font-bold">Description</label>
            <textarea
              ref={descriptionRef}
              maxLength={300}
              placeholder="Details about the item: color, brand, unique identifiers, condition, etc."
              defaultValue={postData.description || ""}
              className="w-full p-3 bg-gradient-to-b from-white to-[#959595] placeholder-[#6B7280] text-black rounded-md h-32"
            />
          </div>
        </div>

        {/* Right side: Map and File Upload */}
        <div className="space-y-6 md:w-1/2">
          <div>
            <h3 className="text-left font-semibold mb-2">Location</h3>
            <Gmap2
              lat={mapLocation.lat}
              lng={mapLocation.lng}
              name={mapLocation.name}
              className="rounded-lg"
            />
          </div>

          <div>
            <label className="block mb-2 font-bold">Photos</label>
            <FileUploadArea files={files} setFiles={setFiles} />
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex md:justify-start justify-center gap-4">
        <button
          onClick={handleSubmit}
          disabled={updating}
          className={`w-48 p-3 rounded-md font-bold mt-6 text-black ${
            updating 
              ? "bg-gray-400 cursor-not-allowed" 
              : "bg-green-400 hover:bg-green-500"
          }`}
        >
          {updating ? "Updating..." : "Save Changes"}
        </button>
        <button
          onClick={() => router.back()}
          disabled={updating}
          className="w-48 p-3 bg-gray-600 hover:bg-gray-700 rounded-md font-bold mt-6 text-white"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}