"use client";
import React, { use, useEffect, useState } from "react";
import ImageCarousel from "@/components/Carousel/Carousel";
import Gmap2 from "@/components/map/Gmap2";
import { MdOutlineReport, MdVerified } from "react-icons/md";
import { IoChatboxEllipses } from "react-icons/io5";
import { useParams } from "next/navigation";

import { useUser } from "@clerk/clerk-react";
import { db } from "@/firebase/firebase.config";
import {
  addDoc,
  collection,
  getDocs,
  query, where,
} from "firebase/firestore";
import { notifyNewMessage, NOTIFICATION_TYPES, createNotification } from '@/app/lib/notification/notification';

export default function LostPostPage() {
  // clerk user data
  const { isSignedIn, user, isLoaded } = useUser();
  const [userEmail, setUserEmail] = useState(""); // to store user email

  const { lostpostid } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [gps, setGps] = useState({
    lat: 7.487718248208046,
    lng: 80.36427172854248
  });

  // Set user email when loaded clerk user data
  useEffect(() => {
    if (isLoaded && isSignedIn) {
      setUserEmail(user.primaryEmailAddress?.emailAddress || "");
    }
  }, [isLoaded, isSignedIn, user]);


  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`/api/post/lost?id=${lostpostid}`, { cache: "no-store" });
        const data = await res.json();
        setPost(data.post || null);
        console.log('post Data:',data.post);

        // Handle GPS coordinates update
        if (data.post?.gps) {
          const parts = data.post.gps.split(",");
          const lat = parseFloat(parts[0]);
          const lng = parseFloat(parts[1]);

          if (!isNaN(lat) && !isNaN(lng)) {
            setGps({ lat, lng });
          }
        }
      } catch (e) {
        console.error("Failed to load post", e);
      } finally {
        setLoading(false);
      }
    };
    if (lostpostid) load();
  }, [lostpostid]);

  if (loading) {
    return <div className="pt-[23vh] lg:pt-44 px-4 mb-8">Loading...</div>;
  }
  if (!post) {
    return <div className="pt-[23vh] lg:pt-44 px-4 mb-8">Post not found.</div>;
  }

  //---firebase chat functions---//

  // Chat check functionality

// Chat check functionality - returns chat ID if exists, null otherwise
const checkChatExists = async () => {
  console.log("Checking if chat exists...");
  try {
    const q = query(
      collection(db, "chatRoom"),
      where("postId", "==", post.lostPostId),
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
  console.log("Creating chat with post owner...");
  try {
    const docRef = await addDoc(collection(db, "chatRoom"), {
      title: `${post.title}`,
      postId: post.lostPostId,
      postOwner: post.email,
      postOwnerUserId: post.clerkUserId || "", // Store Clerk user ID for notifications
      postPhoto: post.photo[0],
      chatOwner: userEmail,
      chatOwnerUserId: user?.id || "", // Store Clerk user ID for notifications
      createdAt: new Date()
    });
    console.log("Chat created with ID:", docRef.id);
    
    // Notify the post owner about the new chat
    const postOwnerId = post.clerkUserId;
    if (postOwnerId && postOwnerId !== "") {
      try {
        await createNotification({
          userId: postOwnerId,
          type: NOTIFICATION_TYPES.MESSAGE,
          title: 'New Chat About Your Lost Item',
          message: `Someone wants to chat about your lost item: ${post.title}`,
          data: { 
            chatId: docRef.id,
            postId: post.lostPostId,
            itemTitle: post.title,
            chatInitiator: userEmail
          },
          link: `/chats/${docRef.id}`,
          priority: 'high'
        });
        console.log('Notification sent to post owner');
      } catch (notifError) {
        console.error('Failed to send notification:', notifError);
        // Don't fail the chat creation if notification fails
      }
    }
    
    return docRef.id; // Return the newly created chat ID
  } catch (error) {
    console.error("Error creating chat:", error);
    return null;
  }
};

// Navigate to chat handler - simplified logic
const navigateToChat = async () => {
  console.log("Navigating to chat...");

  // Prevent action if user is not signed in
  if (!isSignedIn || !userEmail) {
    alert("Please sign in to chat with the post owner.");
    return;
  }

  // Prevent chatting with yourself
  if (post.email === userEmail) {
    alert("You cannot chat with yourself.");
    return;
  }

  try {
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
      window.location.href = `/chats/${chatId}`;
    } else {
      console.error("Failed to get or create chat.");
      alert("Failed to start chat. Please try again.");
    }
  } catch (error) {
    console.error("Error navigating to chat:", error);
    alert("An error occurred. Please try again.");
  }
};

  const images = Array.isArray(post.photo) && post.photo.length ? post.photo : ["/slider/bag1.jpg"];
  const rewardText = post.reward ? `Rs.${post.price ?? 0}` : "None";

  return (
    <div className="pt-[23vh] lg:pt-44 px-4 mb-8">
      <h3 className="text-center font-semibold">Lost: {post.title}</h3>
      <center>
        <div className="flex items-stretch justify-center gap-7 mt-1">
          <div>
            <p className="text-sm text-gray-400">Date: {post.date}</p>
          </div>
          <div>
            <p className="text-sm text-gray-400">Reward: {rewardText}</p>
          </div>
          <div>
            <p className="text-sm text-gray-400">Location: {post.District}</p>
          </div>
        </div>
        <div className="py-10 px-4 w-full">
          <ImageCarousel images={images} autoSlide={false} />
        </div>
      </center>
      <center>
        <div className="max-w-md lg:max-w-2xl mb-3">
          <div>
            <h3 className="text-left font-semibold mt-5 mb-2">Have you seen it? Contact</h3>
            {post.is_verified && (
              <div className="flex items-center gap-1 mb-2">
                <MdVerified className="text-blue-500" size={18} />
                <span className="text-sm text-gray-600">Verified User</span>
              </div>
            )}
            <p className="text-left">Phone: <span className="text-blue-500 font-bold">{post.phone}</span></p>
            <p className="text-left">Email: <span className="text-blue-500 font-bold">{post.email}</span></p>
          </div>
          <div>
            <h3 className="text-left font-semibold mt-5 mb-2">Location</h3>
            <Gmap2 lat={gps.lat} lng={gps.lng} name={post.District} className="rounded-lg" />
          </div>
          <div>
            <h3 className="text-left font-semibold mt-3 mb-2">Description</h3>
            <p className="text-left">{post.description}</p>
          </div>
          <div className="mt-5">
            <p className="text-left">Category: <span className="underline">{post.Category}</span></p>
          </div>
          <div className="mt-3 text-left">
            <p className="font-bold">Post ID: <span className="text-blue-500">{post.lostPostId}</span></p>
          </div>
          {post.email !== userEmail && (
            <div className="flex items-left justify-left gap-4 mt-5">
              <button
                type="button"
                onClick={navigateToChat}
                className="flex items-center text-black bg-[#45F498] active:bg-green-300 rounded-lg text-sm px-5 py-2.5 font-medium"
              >
                <IoChatboxEllipses className="w-5 h-5" />
                <p className="ml-2">Chat</p>
              </button>
            </div>
          )}
        </div>
        <button type="button" className="mt-4 flex items-center text-rose-500 border-2 border-rose-500 hover:bg-rose-600 hover:text-white hover:border-rose-600 rounded-lg text-sm px-5 py-2.5 font-medium">
          <MdOutlineReport className="w-5 h-5" />
          <p className="ml-2">Report Post</p>
        </button>
      </center>
    </div>
  );
}