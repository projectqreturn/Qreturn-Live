"use client";
import React, { useState, useEffect } from "react";
import { IoChatboxEllipses } from "react-icons/io5";
import { HiCheckBadge } from "react-icons/hi2";
import Image from "next/image";
import qReturnLogo from "../../../../assets/logo-w.png";
import Infocard from "@/components/protectedqr/Infocard";
import Detailcard from "@/components/protectedqr/Detailcard";
import { useRouter, useParams } from "next/navigation";
import { useUser } from "@clerk/clerk-react";
import { db } from "@/firebase/firebase.config";
import {
  addDoc,
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import toast, { Toaster } from "react-hot-toast";

const Page = () => {
  const router = useRouter();
  const params = useParams();
  const [item, setItem] = useState(null);
  const [itemOwnerData, setItemOwnerData] = useState(null); // Store fetched user data
  const [lostPostData, setLostPostData] = useState(null); // Store lost post data
  const [contactData, setContactData] = useState(null); // Store contact data
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const qrId = params.qrid;

  // Clerk user data
  const { isSignedIn, user, isLoaded } = useUser();
  const [userEmail, setUserEmail] = useState(""); // to store user email
  const [isOwner, setIsOwner] = useState(false); // Track if current user is the owner

  // Determine if info card should be shown based on whether item is marked as lost
  const showInfoCard = !item?.isMarkedAsLost;
  
  // Set user email when loaded clerk user data
  useEffect(() => {
    if (isLoaded && isSignedIn) {
      setUserEmail(user.primaryEmailAddress?.emailAddress || "");
    }
  }, [isLoaded, isSignedIn, user]);

  // Check if user is the owner
  useEffect(() => {
    if (item && itemOwnerData && userEmail) {
      setIsOwner(itemOwnerData.email === userEmail);
    }
    console.log("Item Owner Email:", itemOwnerData ? itemOwnerData.email : "N/A");
    console.log("Current User Email:", userEmail);
  }, [item, itemOwnerData, userEmail]);

  useEffect(() => {
    const fetchItem = async () => {
      if (!qrId) {
        setError("Invalid QR code");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/myitems?id=${qrId}`);
        
        if (!response.ok) {
          throw new Error('Item not found');
        }

        const itemData = await response.json();
        setItem(itemData);
        console.log("Item Data:", itemData);

        // Fetch user data using userId from item
        if (itemData.userId) {
          try {
            const userResponse = await fetch(`/api/user?clerkId=${itemData.userId}`);
            if (userResponse.ok) {
              const userData = await userResponse.json();
              setItemOwnerData(userData);
              console.log("User Data:", userData);
            } else {
              console.error("Failed to fetch user data");
            }
          } catch (userError) {
            console.error("Error fetching user data:", userError);
          }
        }

        // Fetch lost post data if item is marked as lost
        if (itemData.isMarkedAsLost && itemData.lostPostId) {
          try {
            const lostPostResponse = await fetch(`/api/post/lost?id=${itemData.lostPostId}`);
            if (lostPostResponse.ok) {
              const lostPostData = await lostPostResponse.json();
              setLostPostData(lostPostData);
              console.log("Lost Post Data:", lostPostData);
            } else {
              console.error("Failed to fetch lost post data");
            }
          } catch (lostPostError) {
            console.error("Error fetching lost post data:", lostPostError);
          }
        }

        // Fetch contact data if item is marked as lost
        if (itemData.isMarkedAsLost && itemData.userId) {
          try {
            const contactResponse = await fetch(`/api/contact?userId=${itemData.userId}`);
            if (contactResponse.ok) {
              const contactResult = await contactResponse.json();
              if (contactResult.contacts && contactResult.contacts.length > 0) {
                setContactData(contactResult.contacts[0]);
                console.log("Contact Data:", contactResult.contacts[0]);
              }
            } else {
              console.error("Failed to fetch contact data");
            }
          } catch (contactError) {
            console.error("Error fetching contact data:", contactError);
          }
        }
      } catch (error) {
        console.error("Error fetching item:", error);
        setError("Item not found or QR code is invalid");
      } finally {
        setLoading(false);
      }
    };

    fetchItem();
  }, [qrId]);

  if (loading) {
    return (
      <div className="pt-[23vh] lg:pt-44 mb-8 px-4 mt-8">
        <div className="text-center">
          <p>Loading item information...</p>
        </div>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="pt-[23vh] lg:pt-44 mb-8 px-4 mt-8">
        <div className="mx-auto max-w-2xl w-full bg-gray-900 rounded-2xl shadow-lg text-white p-6">
          <div className="text-center">
            <h2 className="text-xl font-bold text-red-400 mb-4">Item Not Found</h2>
            <p className="text-gray-300 mb-4">{error}</p>
            <p className="text-sm text-gray-400">
              This QR code may be invalid or the item may have been removed.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const itemOwner = {
    id: item.userId || "unknown",
    name: itemOwnerData ? `${itemOwnerData.firstName || ""} ${itemOwnerData.lastName || ""}`.trim() || "Item Owner" : "Item Owner",
    mobileInfo: contactData?.phone || lostPostData?.phone || "Contact via QReturn",
    note: item.description || lostPostData?.description || "",
    email: itemOwnerData ? itemOwnerData.email : "Contact via QReturn",
    reward: lostPostData?.reward && lostPostData?.price ? `Rs. ${lostPostData.price}` : "No reward offered",
    lostDate: lostPostData?.date || new Date().toISOString().split('T')[0],
  };

  //---firebase chat functions---//

  // Chat check functionality - returns chat ID if exists, null otherwise
  const checkChatExists = async () => {
    console.log("Checking if chat exists...");
    try {
      const q = query(
        collection(db, "chatRoom"),
        where("postId", "==", item.myItemsId),
        where("chatOwner", "==", userEmail)
      );
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        console.log("Chat already exists.");
        return querySnapshot.docs[0].id; // Return chat ID directly
      } else {
        console.log("Chat does not exist.");
        return null;
      }
    } catch (error) {
      console.error("Error checking chat:", error);
      return null;
    }
  };

  // Create chat function - returns the new chat ID
  const createChat = async () => {
    console.log("Creating chat with item owner...");
    try {
      // Validate required fields before creating chat
      if (!itemOwnerData || !itemOwnerData.email || !item.userId) {
        console.error("Missing item owner information");
        toast.error("Item owner information is not available.");
        return null;
      }

      const docRef = await addDoc(collection(db, "chatRoom"), {
        title: item.title || "Protected Item",
        postId: item.myItemsId || qrId,
        postOwner: itemOwnerData.email,
        postOwnerUserId: item.userId, // Store Clerk user ID for notifications
        postOwnerId: item.userId,
        postPhoto: item.photo && item.photo.length > 0 ? item.photo[0] : "/slider/bag1.jpg",
        chatOwner: userEmail,
        chatOwnerUserId: user?.id, // Store Clerk user ID for notifications
        createdAt: new Date()
      });
      console.log("Chat created with ID:", docRef.id);
      return docRef.id; // Return the newly created chat ID
    } catch (error) {
      console.error("Error creating chat:", error);
      return null;
    }
  };

  // Navigate to chat handler - simplified logic
  const navigateToChat = async () => {
    console.log("Navigating to chat...");

    // Redirect to sign-in if user is not logged in
    if (!isSignedIn || !userEmail) {
      toast.error("Please sign in to chat with the item owner.");
      // Redirect to sign-in page with return URL
      setTimeout(() => {
        router.push(`/sign-in?redirect_url=${encodeURIComponent(window.location.pathname)}`);
      }, 1500);
      return;
    }

    // Check if item owner email is available
    if (!itemOwnerData || !itemOwnerData.email) {
      toast.error("Item owner information is not available.");
      return;
    }

    // Prevent chatting with yourself
    if (itemOwnerData.email === userEmail) {
      toast.error("You cannot chat with yourself.");
      return;
    }

    try {
      toast.loading("Opening chat...");
      
      // First, check if chat already exists
      let chatId = await checkChatExists();

      // If no chat exists, create one
      if (!chatId) {
        console.log("Creating new chat...");
        chatId = await createChat();
      }

      // Navigate to chat if we have a valid ID
      if (chatId) {
        console.log(`Redirecting to /chats/${chatId}`);
        toast.dismiss();
        toast.success("Redirecting to chat...");
        window.location.href = `/chats/${chatId}`;
      } else {
        console.error("Failed to get or create chat.");
        toast.dismiss();
        toast.error("Failed to start chat. Please try again.");
      }
    } catch (error) {
      console.error("Error navigating to chat:", error);
      toast.dismiss();
      toast.error("An error occurred. Please try again.");
    }
  };

  return (
    <div className="pt-[23vh] lg:pt-44 mb-8 px-4 mt-8">
      <Toaster position="top-center" />
      <div className="mx-auto max-w-2xl w-full bg-gray-900 rounded-2xl shadow-lg text-white p-6">
        <div
          className={
            showInfoCard
              ? "border-2 border-green-500 rounded-2xl"
              : "border-2 border-red-500 rounded-2xl"
          }
        >
          <div className="flex flex-col items-center bg-gray-800 rounded-2xl p-6">
            {/* Image Section */}
            <img
              className="w-20 h-20 object-cover rounded-full border-2 border-white"
              src={item.photo && item.photo.length > 0 ? item.photo[0] : "/slider/bag1.jpg"}
              alt={item.title}
            />

            {/* Title Section */}
            <div className="text-center mt-3">
              <h4 className="font-semibold text-sm">
                {item.title}
              </h4>
              <p className="text-xs text-gray-400 mt-1">
                Category: {item.Category} • ID: {item.myItemsId}
              </p>
              <div className="flex items-center justify-center gap-1 mt-1 text-xs text-gray-300">
                <p>Verified User</p>
                <HiCheckBadge color="#308AFF" />
              </div>
            </div>

            {/* Status Card */}
            <div className="text-center mt-3">
              <h4 className="font-semibold text-sm">
                Status:
                {showInfoCard ? (
                  <span className="text-[#45F498] ml-1">
                    Not Reported Lost or Missing
                  </span>
                ) : (
                  <span className="text-red-500 ml-1">
                    Reported Lost or Missing
                  </span>
                )}
                {/* <span className="text-[#45F498] ml-1">
                
                Not Reported Lost or Missing
              </span> */}
              </h4>
            </div>

            {/* Conditional Render */}
            {showInfoCard ? (
              <Infocard />
            ) : (
              <Detailcard
                id={itemOwner.id}
                name={itemOwner.name}
                mobileInfo={itemOwner.mobileInfo}
                note={itemOwner.note}
                email={itemOwner.email}
                reward={itemOwner.reward}
                lostDate={itemOwner.lostDate}
              />
            )}

            {/* Chat Button - Only show if not the item owner */}
            {!isOwner && (
              <button
                type="button"
                className="mt-10 flex items-center justify-center text-black bg-[#45F498] hover:bg-[#32e286] active:bg-green-300 rounded-lg text-sm px-5 py-2.5 font-semibold transition"
                onClick={navigateToChat}
              >
                <IoChatboxEllipses className="w-5 h-5" />
                <span className="ml-2">Chat</span>
              </button>
            )}
            
            {/* Show message if user is viewing their own item */}
            {isOwner && (
              <div className="mt-10 text-center text-gray-400 text-sm">
                This is your item
              </div>
            )}

            {/* Footer */}
            <p className="mt-6 text-gray-300 text-sm text-center">
              This is protected by QReturn.
            </p>

            <Image
              className="h-[31px] mt-3 w-auto object-contain"
              src={qReturnLogo}
              alt="QReturn Logo"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
