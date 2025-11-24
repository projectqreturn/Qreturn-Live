"use client";
import React, { useState, useEffect } from "react";
import ChatsCards from "@/components/chat/ChatsCards";
import toast, { Toaster } from 'react-hot-toast';

import { db } from "@/firebase/firebase.config";
import {
  collection,
  getDocs,
  query,
  where,
  or,
  deleteDoc,
  doc,
  onSnapshot
} from "firebase/firestore";
import { useUser } from "@clerk/clerk-react";
import { NOTIFICATION_TYPES } from "@/app/lib/notification/notification";

const Page = () => {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [selectedChats, setSelectedChats] = useState([]);
  const [deleting, setDeleting] = useState(false);
  const [unreadChats, setUnreadChats] = useState(new Set());

  // clerk user data
  const { isSignedIn, user, isLoaded } = useUser();
  const [userEmail, setUserEmail] = useState("");

  // Set user email when loaded clerk user data
  useEffect(() => {
    if (isLoaded && isSignedIn) {
      setUserEmail(user.primaryEmailAddress?.emailAddress || "");
    }
  }, [isLoaded, isSignedIn, user]);

  // Check if chat has unread notifications
  const checkUnreadNotifications = async (roomId) => {
    if (!user?.id) return false;
    
    try {
      const notificationsRef = collection(db, "notifications");
      const q = query(
        notificationsRef,
        where("userId", "==", user.id),
        where("type", "==", NOTIFICATION_TYPES.MESSAGE),
        where("read", "==", false),
        where("data.chatId", "==", roomId)
      );

      const querySnapshot = await getDocs(q);
      return !querySnapshot.empty;
    } catch (error) {
      console.error("Error checking unread notifications:", error);
      return false;
    }
  };

  // Fetch the latest message for a specific room
  const getLatestMessage = async (roomId) => {
    try {
      const messagesRef = collection(db, "messages");
      // Query without orderBy to avoid index requirement (temporary fix)
      const q = query(
        messagesRef,
        where("roomId", "==", roomId)
      );
      
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        // Get all messages and sort client-side
        const messages = [];
        querySnapshot.forEach((doc) => {
          messages.push(doc.data());
        });
        
        // Sort by createdAt descending (newest first)
        messages.sort((a, b) => {
          const timeA = a.createdAt?.toDate().getTime() || 0;
          const timeB = b.createdAt?.toDate().getTime() || 0;
          return timeB - timeA;
        });
        
        // Get the latest message
        const latestMsg = messages[0];
        
        // Remove HTML tags for preview (if message contains images)
        let messagePreview = latestMsg.message || "No messages yet...";
        if (messagePreview.includes("<img")) {
          messagePreview = "📷 Image";
        } else if (messagePreview.length > 50) {
          messagePreview = messagePreview.substring(0, 50) + "...";
        }
        
        return {
          message: messagePreview,
          timestamp: latestMsg.createdAt?.toDate() || new Date()
        };
      }
      
      return {
        message: "No messages yet...",
        timestamp: new Date()
      };
    } catch (error) {
      console.error("Error fetching latest message:", error);
      return {
        message: "No messages yet...",
        timestamp: new Date()
      };
    }
  };

  // Fetch chat rooms from Firebase
  const getChatRooms = async () => {
    if (!userEmail) return;
    
    setLoading(true);
    try {
      // Query chat rooms where user is either chatOwner or postOwner
      const chatRoomsRef = collection(db, "chatRoom");
      const q = query(
        chatRoomsRef,
        or(
          where("chatOwner", "==", userEmail),
          where("postOwner", "==", userEmail)
        )
      );
      
      const querySnapshot = await getDocs(q);
      const chatRoomsData = [];
      
      querySnapshot.forEach((doc) => {
        chatRoomsData.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      // Fetch latest message and unread status for each chat room
      const chatRoomsWithMessages = await Promise.all(
        chatRoomsData.map(async (room) => {
          const [latestMessage, hasUnread] = await Promise.all([
            getLatestMessage(room.id),
            checkUnreadNotifications(room.id)
          ]);
          
          return {
            id: room.id,
            img: room.postPhoto || "/slider/bag2.jpg",
            title: room.title || "Chat Room",
            description: latestMessage.message,
            date: latestMessage.timestamp.toLocaleDateString(),
            timestamp: latestMessage.timestamp, // For sorting
            chatOwner: room.chatOwner,
            postOwner: room.postOwner,
            hasUnread: hasUnread
          };
        })
      );
      
      // Sort by most recent message
      chatRoomsWithMessages.sort((a, b) => b.timestamp - a.timestamp);
      
      setChats(chatRoomsWithMessages);
      console.log("Chat rooms loaded with latest messages:", chatRoomsWithMessages);
    } catch (error) {
      console.error("Error fetching chat rooms:", error);
      toast.error("Failed to load chat rooms");
    } finally {
      setLoading(false);
    }
  };

  // Real-time listener for unread notifications
  useEffect(() => {
    if (!user?.id) return;

    const notificationsRef = collection(db, "notifications");
    const q = query(
      notificationsRef,
      where("userId", "==", user.id),
      where("type", "==", NOTIFICATION_TYPES.MESSAGE),
      where("read", "==", false)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      // Group unread notifications by chatId
      const unreadChatIds = new Set();
      snapshot.forEach((doc) => {
        const chatId = doc.data().data?.chatId;
        if (chatId) {
          unreadChatIds.add(chatId);
        }
      });

      // Update chats with new unread status
      setChats(prevChats => 
        prevChats.map(chat => ({
          ...chat,
          hasUnread: unreadChatIds.has(chat.id)
        }))
      );
    }, (error) => {
      console.error("Error listening to notifications:", error);
    });

    return () => unsubscribe();
  }, [user?.id]);

  // Fetch chats when userEmail is available
  useEffect(() => {
    if (userEmail) {
      getChatRooms();
    }
  }, [userEmail]);

  const toggleEditMode = () => {
    setEditMode(!editMode);
    setSelectedChats([]);
  };

  const handleCheckboxChange = (id) => {
    // Validate ID before adding
    if (!id) {
      console.error("Invalid chat ID:", id);
      return;
    }
    
    if (selectedChats.includes(id)) {
      setSelectedChats(selectedChats.filter((itemId) => itemId !== id));
    } else {
      setSelectedChats([...selectedChats, id]);
    }
  };

  // Delete all messages in a chat room
  const deleteMessagesInRoom = async (roomId) => {
    if (!roomId) {
      console.error("Room ID is undefined");
      return;
    }

    try {
      const messagesRef = collection(db, "messages");
      const q = query(messagesRef, where("roomId", "==", roomId));
      const querySnapshot = await getDocs(q);
      
      const deletePromises = [];
      querySnapshot.forEach((document) => {
        deletePromises.push(deleteDoc(doc(db, "messages", document.id)));
      });
      
      await Promise.all(deletePromises);
      console.log(`Deleted ${deletePromises.length} messages from room ${roomId}`);
    } catch (error) {
      console.error("Error deleting messages from room:", roomId, error);
      throw error;
    }
  };

  const handleDelete = async () => {
    if (selectedChats.length === 0) {
      toast.error("Please select chat rooms to delete");
      return;
    }

    // Filter out any undefined values
    const validChatIds = selectedChats.filter(id => id !== undefined && id !== null);
    
    if (validChatIds.length === 0) {
      toast.error("Invalid chat selection");
      setSelectedChats([]);
      return;
    }
    
    setDeleting(true);
    const deletingToast = toast.loading(`Deleting ${validChatIds.length} chat room(s)...`);
    
    try {
      let successCount = 0;
      let failCount = 0;

      // Delete each chat room and its messages
      for (const chatId of validChatIds) {
        try {
          console.log("Deleting chat room:", chatId);
          
          // First, delete all messages in the room
          await deleteMessagesInRoom(chatId);
          
          // Then, delete the chat room itself
          await deleteDoc(doc(db, "chatRoom", chatId));
          
          successCount++;
        } catch (error) {
          console.error(`Failed to delete chat room ${chatId}:`, error);
          failCount++;
        }
      }
      
      // Update local state - remove successfully deleted chats
      const updatedChats = chats.filter((chat) => !validChatIds.includes(chat.id));
      setChats(updatedChats);
      setSelectedChats([]);
      setEditMode(false);
      
      // Show result
      toast.dismiss(deletingToast);
      
      if (failCount === 0) {
        toast.success(`Successfully deleted ${successCount} chat room(s)!`);
      } else if (successCount > 0) {
        toast.success(`Deleted ${successCount} chat room(s). ${failCount} failed.`);
      } else {
        toast.error("Failed to delete chat rooms. Please try again.");
      }
      
      console.log(`Deletion complete: ${successCount} success, ${failCount} failed`);
    } catch (error) {
      console.error("Error deleting chats:", error);
      toast.dismiss(deletingToast);
      toast.error("Error deleting chat rooms. Please try again.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <Toaster position="top-center" />
      
      <div className="pt-[23vh] lg:pt-44 px-4 mb-4">
        <h3 className="text-center font-semibold mt-8">Chats</h3>
      </div>
      <div className="px-4 sm:px-6 md:px-8">
        <div className="flex flex-col items-center justify-center bg-gray-900 rounded-2xl w-full max-w-2xl shadow-lg text-white p-8 mx-auto">
          <div className="flex items-left w-full mb-4 justify-between">
            <span 
              className="ml-3 cursor-pointer hover:text-gray-300 transition"
              onClick={toggleEditMode}
            >
              {editMode ? "Cancel" : "Edit"}
            </span>
            {editMode && selectedChats.length > 0 && (
              <button
                onClick={handleDelete}
                disabled={deleting}
                className={`bg-red-500 hover:bg-red-600 text-white px-4 py-1 rounded transition ${
                  deleting ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {deleting ? "Deleting..." : `Delete (${selectedChats.length})`}
              </button>
            )}
          </div>

          {loading ? (
            <div className="text-center py-8">Loading chats...</div>
          ) : chats.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              No chat rooms found
            </div>
          ) : (
            chats.map((item) => {
              // Debug: Log each item to check if id exists
              if (!item.id) {
                console.warn("Chat item missing ID:", item);
              }
              
              return (
                <ChatsCards
                  key={item.id || Math.random()}
                  id={item.id}
                  img={item.img}
                  title={item.title}
                  description={item.description}
                  date={item.date}
                  showCheckbox={editMode}
                  checked={selectedChats.includes(item.id)}
                  onCheck={handleCheckboxChange}
                  hasUnread={item.hasUnread}
                />
              );
            })
          )}
        </div>
      </div>
    </>
  );
};

export default Page;