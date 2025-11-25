"use client";
import React, { useState, useRef, useEffect } from "react";
import MyItemCard from "@/components/MyItemCard/MyItemCard";
import { FaCirclePlus } from "react-icons/fa6";
import { IoClose } from "react-icons/io5";
import Gmap2 from "@/components/map/Gmap2";
import { QRCodeCanvas } from "qrcode.react";
import jsPDF from "jspdf";
import { useRouter } from 'next/navigation';
import { useUser } from "@clerk/nextjs";
import GmapLocationFetch from "@/components/map/NewGmapLocationFetch";
import { FaLocationArrow } from "react-icons/fa6";
import toast, { Toaster } from 'react-hot-toast';
import { deleteImageFromExternalApi } from "@/app/lib/utils/imageDelete";

const Page = () => {
  const router = useRouter();
  const { user } = useUser();
  const [showMapPopup, setShowMapPopup] = useState(false);
  const [showQrPopup, setShowQrPopup] = useState(false);
  const [showReward, setShowReward] = useState(false);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);
  const rewardAmountRef = useRef(null);
  const qrRef = useRef();
  const [qrValue, setQrValue] = useState("https://qreturn.com");
  const [userContact, setUserContact] = useState(null);
  const [district, setDistrict] = useState("");

  // Fetch user's items
  useEffect(() => {
    const fetchItems = async () => {
      if (!user?.id) return;

      try {
        setLoading(true);
        const response = await fetch(`/api/myitems?userId=${user.id}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch items');
        }

        const data = await response.json();
        setItems(data);
      } catch (error) {
        console.error("Error fetching items:", error);
        setError("Failed to load items");
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, [user]);

  // Fetch user's contact info
  useEffect(() => {
    const fetchContact = async () => {
      if (!user?.id) return;

      try {
        const response = await fetch(`/api/contact?userId=${user.id}`);
        if (response.ok) {
          const data = await response.json();
          if (data.contacts && data.contacts.length > 0) {
            setUserContact(data.contacts[0]);
          }
        }
      } catch (error) {
        console.error("Error fetching contact:", error);
      }
    };

    fetchContact();
  }, [user]);

  const handleMarkAsLost = async (item) => {
    console.log("handleMarkAsLost called with item:", item);
    
    // Check if lost post already exists for this item
    if (item.lostPostId) {
      toast.error("A lost post already exists for this item. Use the toggle to control contact visibility.");
      return;
    }
    
    setSelectedItem(item);
    setShowMapPopup(true);
  };

  const handleToggleOff = async (item) => {
    try {
      // Update the item to unmark as lost
      const response = await fetch(`/api/myitems?id=${item.myItemsId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          isMarkedAsLost: false,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update item');
      }

      // Update local state
      const updatedItems = items.map(i => 
        i.myItemsId === item.myItemsId 
          ? { ...i, isMarkedAsLost: false }
          : i
      );
      setItems(updatedItems);

      // Check if user has any remaining active marked as lost items
      const hasActiveLostItems = updatedItems.some(i => i.isMarkedAsLost);

      // If no active lost items, set is_public to false
      if (!hasActiveLostItems && userContact) {
        await fetch("/api/contact", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: user.id,
            is_public: false,
          }),
        });
        console.log("Contact set to private (no active lost items)");
        toast.success("Contact info is now private");
      } else {
        toast.success("Contact info hidden for this item");
      }
    } catch (error) {
      console.error("Error unmarking item:", error);
      toast.error("Failed to update item");
    }
  };

  const handleToggleOn = async (item) => {
    try {
      // Update the item to mark as lost
      const response = await fetch(`/api/myitems?id=${item.myItemsId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          isMarkedAsLost: true,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update item');
      }

      // Update local state
      setItems(items.map(i => 
        i.myItemsId === item.myItemsId 
          ? { ...i, isMarkedAsLost: true }
          : i
      ));

      // Set contact as public
      if (userContact) {
        await fetch("/api/contact", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: user.id,
            is_public: true,
          }),
        });
      }
      toast.success("Contact info is now public");
    } catch (error) {
      console.error("Error marking item:", error);
      toast.error("Failed to update item");
    }
  };

  const handleQrClick = (item) => {
    setSelectedItem(item);
    setQrValue(`${window.location.origin}/protectedqr/${item.myItemsId}`);
    setShowQrPopup(true);
  };

  const handleDeleteItem = async (itemId) => {
    try {
      // Find the item to get its search_Id
      const itemToDelete = items.find(item => item.myItemsId === itemId);
      
      toast.loading("Deleting item...");

      // Delete from database
      const response = await fetch(`/api/myitems?id=${itemId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete item');
      }

      // Delete image from external API if search_Id exists
      if (itemToDelete?.search_Id) {
        console.log("Deleting image from external API with search_Id:", itemToDelete.search_Id);
        const imageDeleteResult = await deleteImageFromExternalApi(itemToDelete.search_Id);
        
        if (imageDeleteResult.success) {
          console.log("Image deleted successfully from external API");
        } else {
          console.warn("Failed to delete image from external API:", imageDeleteResult.message);
        }
      }

      toast.dismiss();
      toast.success("Item deleted successfully");

      // Remove item from local state
      setItems(items.filter(item => item.myItemsId !== itemId));
    } catch (error) {
      console.error("Error deleting item:", error);
      toast.dismiss();
      toast.error("Failed to delete item");
      setError("Failed to delete item");
    }
  };

  const handleCreateLostPost = async () => {
    console.log("handleCreateLostPost called");
    console.log("selectedItem:", selectedItem);
    console.log("userContact:", userContact);
    console.log("user:", user);

    if (!selectedItem) {
      toast.error("No item selected");
      return;
    }

    // Validate required fields
    if (!district.trim()) {
      toast.error("Please enter a district");
      return;
    }

    if (!userContact?.phone) {
      toast.error("Please add your phone number in profile settings first");
      return;
    }

    if (showReward && !rewardAmountRef.current?.value) {
      toast.error("Please enter reward amount");
      return;
    }

    if (!user?.primaryEmailAddress?.emailAddress) {
      toast.error("User email not found. Please sign in again.");
      return;
    }

    try {
      // Ensure photo is an array of strings
      const photoArray = Array.isArray(selectedItem.photo) 
        ? selectedItem.photo.filter(p => typeof p === 'string' && p.trim() !== '')
        : [];

      // Prepare lost post data
      const lostPostData = {
        title: selectedItem.title.trim(),
        date: new Date().toISOString().split('T')[0], // Current date
        phone: userContact.phone.trim(),
        Category: selectedItem.Category,
        District: district.trim(),
        gps: `${gps.lat},${gps.lng}`,
        description: (selectedItem.description || "No description provided").trim(),
        reward: Boolean(showReward),
        price: showReward && rewardAmountRef.current?.value ? rewardAmountRef.current.value.trim() : "0",
        email: user.primaryEmailAddress.emailAddress,
        photo: photoArray,
        postType: "lost",
        search_Id: selectedItem.search_Id || "",
      };

      console.log("Creating lost post with data:", lostPostData);

      // Call the lost post API
      toast.loading("Creating lost post...");

      const response = await fetch("/api/post/lost", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(lostPostData),
      });

      toast.dismiss();

      console.log("Response status:", response.status);
      console.log("Response ok:", response.ok);

      // Try to parse response body
      let result;
      try {
        const responseText = await response.text();
        console.log("Raw response:", responseText);

        if (responseText) {
          result = JSON.parse(responseText);
        } else {
          throw new Error("Empty response from server");
        }
      } catch (parseError) {
        console.error("Failed to parse response:", parseError);
        throw new Error("Server returned invalid response. Please check your internet connection and try again.");
      }

      if (!response.ok) {
        console.error("API error response:", result);
        const errorMessage = result?.message || result?.error || "Failed to create lost post";
        throw new Error(errorMessage + ". Please check the server console for more details.");
      }

      console.log("Lost post created:", result);

      // Update contact to make it public
      if (userContact) {
        await fetch("/api/contact", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: user.id,
            is_public: true,
          }),
        });
      }

      // Update the item to mark it as lost with the lostPostId
      const lostPostId = result.lostPostId || result._id || null;
      console.log("Updating item with lostPostId:", lostPostId);

      const updateResponse = await fetch(`/api/myitems?id=${selectedItem.myItemsId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          isMarkedAsLost: true,
          lostPostId: lostPostId,
          email: user.primaryEmailAddress.emailAddress,
        }),
      });

      if (updateResponse.ok) {
        console.log("Item updated successfully with lostPostId:", lostPostId);
        // Update local state
        setItems(items.map(item => 
          item.myItemsId === selectedItem.myItemsId 
            ? { ...item, isMarkedAsLost: true, lostPostId: lostPostId, email: user.primaryEmailAddress.emailAddress }
            : item
        ));
      } else {
        console.error("Failed to update item in database");
        const errorText = await updateResponse.text();
        console.error("Update error response:", errorText);
      }

      toast.success("Item marked as lost successfully!");
      setShowMapPopup(false);
      setShowReward(false);
      setDistrict("");
      setSelectedItem(null);
      
      // Optionally navigate to lost posts page
      setTimeout(() => {
        router.push('/lost');
      }, 1500);
    } catch (error) {
      console.error("Error creating lost post:", error);
      toast.dismiss();
      toast.error(error.message || "Failed to mark item as lost");
    }
  };

  useEffect(() => {
      getCurrentLocation();
    }, []);

    const getCurrentLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setGps({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            name: "Current Location"
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
          maximumAge: 300000
        }
      );
    } else {
      toast.error("Geolocation is not supported by your browser");
    }
  };

  const [gps, setGps] = useState({
      lat: 7.487718248208046,
      lng: 80.36427172854248,
      name: "Default Location"
    });

  // Handle location change from map component
  const handleLocationChange = (newLocation) => {
    setGps({
      lat: newLocation.lat,
      lng: newLocation.lng,
      name: newLocation.name || "Selected Location"
    });
    console.log("Location updated:", newLocation);
    toast.success("Location selected successfully!");
  };

  const downloadQR = () => {
    const canvas = qrRef.current.querySelector("canvas");
    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const bgImage = new Image();
    bgImage.src = "QR/qreturn-pdf-bg.jpeg"; // 

    bgImage.onload = () => {
      pdf.addImage(bgImage, "JPEG", 0, 0, 210, 297); // Full A4
      pdf.addImage(imgData, "PNG", 55, 160, 100, 100); // Centered QR
      pdf.save("qreturn-qr.pdf");
    };
  };

  return (
    <>
      <Toaster position="top-center" reverseOrder={false} />
      <div className="pt-[23vh] lg:pt-44 px-4 mb-8">
        <h3 className="text-center font-semibold mt-8">My items</h3>
      </div>

      {error && (
        <div className="bg-red-500 text-white p-3 rounded-md mb-4 mx-4">
          {error}
        </div>
      )}

      <div className="flex flex-col items-center justify-center">
        <div className="grid w-full max-w-screen-lg">
          <div className="ml-1 mb-2">
            <button
              type="button"
              className="flex items-center h-10 text-black bg-[#45F498] active:bg-green-300 rounded-xl text-sm px-5 py-2.5 font-medium"
              onClick={() => router.push("/registeritem")}
            >
              <p className="font-bold">Add New</p>
              <FaCirclePlus size={20} className="ml-2" />
            </button>
          </div>

          {/* Loading state */}
          {loading && (
            <div className="text-center py-8">
              <p>Loading your items...</p>
            </div>
          )}

          {/* Empty state */}
          {!loading && items.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-400 mb-4">You haven't registered any items yet.</p>
              <button
                onClick={() => router.push("/registeritem")}
                className="text-[#45F498] underline"
              >
                Register your first item
              </button>
            </div>
          )}

          {/* Item cards */}
          {!loading && items.map((item) => (
            <div key={item.myItemsId} className="m-1">
              <MyItemCard
                item={item}
                onMarkAsLost={() => handleMarkAsLost(item)}
                onQrClick={() => handleQrClick(item)}
                onDelete={() => handleDeleteItem(item.myItemsId)}
                onToggleOff={() => handleToggleOff(item)}
                onToggleOn={() => handleToggleOn(item)}
              />
            </div>
          ))}
        </div>
      </div>

      {/* QR Popup */}
      {showQrPopup && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-md z-50 flex items-center justify-center p-4 transition-all duration-300">
          <div className="bg-gradient-to-b from-[#3B3F4E] to-[#2D3040] text-white p-8 rounded-2xl text-center shadow-2xl max-w-sm w-full border border-gray-700/50 relative">
            <button
              onClick={() => setShowQrPopup(false)}
              className="absolute top-3 right-3 text-gray-400 hover:text-white transition-colors duration-200"
            >
              <IoClose size={24} />
            </button>

            <h2 className="font-bold text-xl mb-6">
              {selectedItem ? `QR Code for ${selectedItem.title}` : 'Your QR Code'}
            </h2>
            <div
              ref={qrRef}
              className="bg-white p-4 rounded-xl w-fit mx-auto mb-4"
            >
              <QRCodeCanvas value={qrValue} size={192} />
            </div>

            <button
              onClick={downloadQR}
              className="mt-4 w-full text-black px-6 py-3 rounded-xl bg-[#45F498] hover:bg-[#3ADF8A] transition-all duration-200 font-semibold shadow-lg shadow-[#45F498]/20"
            >
              Download QR
            </button>
          </div>
        </div>
      )}

      {/* Map Popup with Reward UI */}
      {showMapPopup && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-md z-50 flex items-center justify-center p-4 transition-all duration-300 overflow-y-auto">
          <div className="bg-gradient-to-b from-[#3B3F4E] to-[#2D3040] text-white p-8 rounded-2xl shadow-2xl w-full max-w-md border border-gray-700/50 relative my-8 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowMapPopup(false)}
              className="absolute top-3 right-3 text-gray-400 hover:text-white transition-colors duration-200 z-10"
            >
              <IoClose size={24} />
            </button>

            <h2 className="font-bold text-xl mb-4">
              {selectedItem ? `Mark "${selectedItem.title}" as Lost` : 'Where was it lost?'}
            </h2>

            {/* Map UI */}
            <div className="rounded-xl overflow-hidden border border-gray-700/70">
              <GmapLocationFetch
                lat={gps.lat}
                lng={gps.lng}
                name={gps.name}
                onLocationChange={handleLocationChange}
                allowCustomPicker={true}
                className="w-full"
              />
            </div>
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

            {/* Reward Section */}
            <div className="text-left mt-6 bg-black/20 p-4 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <label className="font-bold text-lg">Reward</label>
                <div
                  className={`w-14 h-7 rounded-full p-1 cursor-pointer transition-colors duration-300 ${
                    showReward ? "bg-[#45F498]" : "bg-gray-700"
                  }`}
                  onClick={() => setShowReward(!showReward)}
                >
                  <div
                    className={`bg-white w-5 h-5 rounded-full transform transition-transform duration-300 ${
                      showReward ? "translate-x-7" : ""
                    }`}
                  />
                </div>
              </div>
              <p className="text-sm text-gray-300">
                Would you like to offer a reward for the return of your lost
                item?
              </p>
              {showReward && (
                <div className="mt-4">
                  <label className="block mb-2 font-bold">Amount</label>
                  <input
                    ref={rewardAmountRef}
                    maxLength={10}
                    type="text"
                    placeholder="Rs. 1000.00"
                    onInput={(e) => {
                      e.target.value = e.target.value.replace(/[^0-9.]/g, "");
                    }}
                    className="w-full p-3 bg-gradient-to-b from-white to-[#DEDEDE] placeholder-[#6B7280] text-black rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#45F498]"
                  />
                </div>
              )}
            </div>

            {/* District Input */}
            <div className="mt-4">
              <label className="block mb-2 font-bold">District</label>
              <input
                type="text"
                placeholder="Enter district name"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="w-full p-3 bg-gradient-to-b from-white to-[#DEDEDE] placeholder-[#6B7280] text-black rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#45F498]"
              />
            </div>

            {/* Post Button */}
            <button
              className={`mt-6 w-full text-black px-6 py-3 rounded-xl font-semibold shadow-lg transition-all duration-200 ${
                selectedItem?.lostPostId 
                  ? 'bg-gray-500 cursor-not-allowed opacity-50' 
                  : 'bg-[#45F498] hover:bg-[#3ADF8A] shadow-[#45F498]/20'
              }`}
              onClick={handleCreateLostPost}
              disabled={selectedItem?.lostPostId}
            >
              {selectedItem?.lostPostId ? 'Post Already Created' : 'Post'}
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Page;
