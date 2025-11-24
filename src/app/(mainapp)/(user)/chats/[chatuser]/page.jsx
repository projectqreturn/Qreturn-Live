"use client";
import React, { useState, useRef, useEffect } from "react";
import { RiShieldUserFill } from "react-icons/ri";
import { LuImagePlus } from "react-icons/lu";
import { IoSend } from "react-icons/io5";
import { HiCheckBadge } from "react-icons/hi2";
import { BiSolidBadgeDollar } from "react-icons/bi";

import { useUser } from "@clerk/nextjs";
import { useParams } from "next/navigation";
import { db } from "@/firebase/firebase.config";
import { 
  doc, 
  getDoc, 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  serverTimestamp,
  getDocs
} from "firebase/firestore";
import { notifyNewMessage, markMultipleAsRead, NOTIFICATION_TYPES } from "@/app/lib/notification/notification";

// SenderCard Component
const SenderCard = ({ msg, date }) => {
  return (
    <div className="w-full text-sm text-right">
      <div className="inline-block p-3 bg-[#296EC9] rounded-t-2xl rounded-bl-2xl">
        <div dangerouslySetInnerHTML={{ __html: msg }} />
        {date && (
          <p className="text-xs text-gray-300 mt-1">
            {new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        )}
      </div>
    </div>
  );
};

// ReceiverCard Component
const ReceiverCard = ({ msg, date }) => {
  return (
    <div className="w-full text-sm text-left">
      <div className="inline-block p-3 bg-[#33B972] rounded-t-2xl rounded-br-2xl">
        <div dangerouslySetInnerHTML={{ __html: msg }} />
        {date && (
          <p className="text-xs text-gray-200 mt-1">
            {new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        )}
      </div>
    </div>
  );
};

const Page = () => {
  const { chatuser } = useParams();
  const [roomId, setRoomId] = useState(chatuser);
  const [chatRoomData, setChatRoomData] = useState(null);

  // clerk user data
  const { isSignedIn, user, isLoaded } = useUser();
  const [userEmail, setUserEmail] = useState("");

  const [input, setInput] = useState("");
  const [chats, setChats] = useState([]);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [alertMessage, setAlertMessage] = useState("");
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  // Set user email when loaded clerk user data
  useEffect(() => {
    if (isLoaded && isSignedIn) {
      setUserEmail(user.primaryEmailAddress?.emailAddress || "");
    }
  }, [isLoaded, isSignedIn, user]);

  // Function to hide error message after a few seconds
  useEffect(() => {
    if (alertMessage) {
      const timer = setTimeout(() => {
        setAlertMessage("");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [alertMessage]);

  // Fetch chat room data
  const getChatRoom = async (roomId) => {
    console.log("Fetching chat room data...");
    try {
      const docRef = doc(db, "chatRoom", roomId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        console.log("Chat room data:", data);
        setChatRoomData(data);
        
        // Check if current user is authorized (either chatOwner or postOwner)
        if (userEmail === data.chatOwner || userEmail === data.postOwner) {
          setIsAuthorized(true);
        } else {
          setIsAuthorized(false);
          setAlertMessage("You are not authorized to view this chat.");
        }
      } else {
        console.log("No such chat room!");
        setAlertMessage("Chat room not found.");
      }
    } catch (error) {
      console.error("Error fetching chat room:", error);
      setAlertMessage("Error loading chat room.");
    } finally {
      setLoading(false);
    }
  };

  // Mark message notifications as read when user opens this chat
  const markChatNotificationsAsRead = async () => {
    if (!user?.id || !roomId) return;

    try {
      // Query notifications for this specific chat room that are unread
      const notificationsRef = collection(db, "notifications");
      const q = query(
        notificationsRef,
        where("userId", "==", user.id),
        where("type", "==", NOTIFICATION_TYPES.MESSAGE),
        where("read", "==", false),
        where("data.chatId", "==", roomId)
      );

      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const notificationIds = [];
        querySnapshot.forEach((doc) => {
          notificationIds.push(doc.id);
        });

        // Mark all these notifications as read
        await markMultipleAsRead(notificationIds);
        console.log(`Marked ${notificationIds.length} chat notifications as read`);
      }
    } catch (error) {
      console.error("Error marking chat notifications as read:", error);
    }
  };

  // Fetch chat room info once
  useEffect(() => {
    if (userEmail && roomId) {
      getChatRoom(roomId);
    }
  }, [roomId, userEmail]);

  // Mark notifications as read when user opens the chat
  useEffect(() => {
    if (user?.id && roomId && isAuthorized) {
      markChatNotificationsAsRead();
    }
  }, [user?.id, roomId, isAuthorized]);

  // Real-time message listener
  useEffect(() => {
    if (!roomId || !isAuthorized) return;

    console.log("Setting up real-time listener for room:", roomId);

    const messagesRef = collection(db, "messages");
    // Query without orderBy to avoid index requirement
    const q = query(
      messagesRef,
      where("roomId", "==", roomId)
    );

    // Set up real-time listener
    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const messages = [];
        querySnapshot.forEach((doc) => {
          messages.push({
            id: doc.id,
            ...doc.data(),
          });
        });
        
        // Sort messages by createdAt in client-side
        messages.sort((a, b) => {
          const timeA = a.createdAt?.toDate().getTime() || 0;
          const timeB = b.createdAt?.toDate().getTime() || 0;
          return timeA - timeB;
        });
        
        console.log("Real-time messages updated:", messages);
        setChats(messages);
      },
      (error) => {
        console.error("Error listening to messages:", error);
        setAlertMessage("Error loading messages.");
      }
    );

    // Cleanup listener on unmount
    return () => unsubscribe();
  }, [roomId, isAuthorized]);

  // Create message function
  const createMessage = async (message) => {
    if (!chatRoomData || !userEmail) return;

    console.log("Creating message in room:", roomId);

    const sender = userEmail;
    let receiver = "";
    let receiverUserId = "";

    // Determine receiver based on sender
    if (userEmail === chatRoomData.chatOwner) {
      receiver = chatRoomData.postOwner;
      receiverUserId = chatRoomData.postOwnerUserId; // You'll need to store this in chatRoom
    } else if (userEmail === chatRoomData.postOwner) {
      receiver = chatRoomData.chatOwner;
      receiverUserId = chatRoomData.chatOwnerUserId; // You'll need to store this in chatRoom
    } else {
      console.error("User not authorized to send messages");
      setAlertMessage("You are not authorized to send messages in this chat.");
      return;
    }

    try {
      // Add message to Firestore
      await addDoc(collection(db, "messages"), {
        sender,
        receiver,
        roomId,
        message: message,
        createdAt: serverTimestamp() // Use server timestamp for consistency
      });
      console.log("Message created successfully.");

      // Send notification to receiver
      if (receiverUserId && receiverUserId !== "") {
        try {
          // Create message preview (remove HTML tags for notification)
          let messagePreview = message;
          if (message.includes("<img")) {
            messagePreview = "📷 Sent an image";
          } else if (message.length > 100) {
            messagePreview = message.substring(0, 100) + "...";
          }

          await notifyNewMessage(
            receiverUserId,
            user?.fullName || user?.firstName || sender,
            messagePreview,
            roomId
          );
          console.log("Message notification sent to:", receiverUserId);
        } catch (notifError) {
          console.error("Error sending notification:", notifError);
          // Don't show error to user, message was sent successfully
        }
      } else {
        console.warn("Receiver user ID not found, notification not sent");
        console.warn("Chat room data:", chatRoomData);
        console.warn("Sender:", sender);
        console.warn("Receiver:", receiver);
        console.warn("ReceiverUserId:", receiverUserId);
      }
    } catch (error) {
      console.error("Error creating message:", error);
      setAlertMessage("Failed to send message. Please try again.");
    }
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      setAlertMessage("Only JPG, PNG, or GIF images are allowed.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setUploadedImage(reader.result);
      setAlertMessage("");
    };
    reader.readAsDataURL(file);
  };

  const sendMessage = async () => {
    if (input.trim() === "" && !uploadedImage) return;
    if (!isAuthorized) {
      setAlertMessage("You are not authorized to send messages.");
      return;
    }

    const messageContent = uploadedImage
      ? `<img src="${uploadedImage}" alt="upload" class="max-w-[200px] rounded-lg" />`
      : input;

    // Clear input immediately for better UX
    setInput("");
    setUploadedImage(null);

    // Send message to Firebase
    await createMessage(messageContent);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") sendMessage();
  };

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chats]);

  // Get other user's name for display
  const getOtherUserEmail = () => {
    if (!chatRoomData || !userEmail) return "Unknown User";
    return userEmail === chatRoomData.chatOwner 
      ? chatRoomData.postOwner 
      : chatRoomData.chatOwner;
  };

  if (loading) {
    return (
      <div className="pt-[23vh] lg:pt-44 mb-4 mt-4">
        <center>
          <div className="flex items-center justify-center bg-gray-800 rounded-2xl w-full max-w-2xl shadow-lg text-white p-8">
            <p>Loading chat...</p>
          </div>
        </center>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="pt-[23vh] lg:pt-44 mb-4 mt-4">
        <center>
          <div className="flex items-center justify-center bg-gray-800 rounded-2xl w-full max-w-2xl shadow-lg text-white p-8">
            <p className="text-red-400">You are not authorized to view this chat.</p>
          </div>
        </center>
      </div>
    );
  }

  return (
    <div className="pt-[23vh] lg:pt-44 mb-4 mt-4">
      <center>
        <div className="flex flex-col items-center justify-center bg-gray-800 rounded-2xl w-full max-w-2xl shadow-lg text-white mb-10 mt-4">
          {/* Chat Header */}
          <div className="flex items-center space-x-4 w-full max-w-2xl pl-6 pt-6 p-4 bg-gray-600 rounded-t-2xl">
            <img
              className="w-12 h-12 object-cover rounded-full"
              src={chatRoomData?.postPhoto || '/slider/bag1.jpg'}
              
              alt="chat-img"
            />
            <div className="text-left">
              <h4 className="font-semibold text-sm">
                {chatRoomData?.title || "Untitled Chat"}
              </h4>
              <div className="flex flex-wrap gap-4 mt-1">
                <p className="text-xs text-gray-400">{getOtherUserEmail()}</p>
                <div className="flex items-center space-x-1">
                  <p className="text-xs text-gray-300">Verified User</p>
                  <HiCheckBadge color="#308AFF" />
                </div>
                <div className="flex items-center space-x-1">
                  <p className="text-xs text-gray-300">Reward</p>
                  <BiSolidBadgeDollar color="#B03EFC" />
                </div>
              </div>
            </div>
          </div>

          {/* Chat Messages */}
          <div className="flex flex-col w-full max-w-xl space-y-4 px-2 py-2 max-h-[450px] overflow-y-auto">
            {/* Safety Info */}
            <div className="items-center space-x-4 w-full max-w-xl p-3 text-center text-[#D9D9D9] text-sm my-4 rounded-lg">
              <RiShieldUserFill size={45} className="mx-auto mb-2" />
              <p>
                Before proceeding with the return, make sure the item is being
                claimed or handed over correctly. To verify ownership, you can
                ask or describe:
              </p>
              <ul className="list-disc list-inside text-center mt-2">
                <li>Any unique features (scratches, marks, stickers, etc.)</li>
                <li>Where and when the item was lost or found</li>
                <li>Specific details only the real owner would know</li>
              </ul>
              <p>
                This helps build trust and ensures the item goes to the rightful
                person.
              </p>
            </div>

            {/* Chat Messages */}
            {chats.length === 0 ? (
              <div className="text-center text-gray-400 py-8">
                No messages yet. Start the conversation!
              </div>
            ) : (
              chats.map((chat) => {
                if (chat.sender === userEmail) {
                  return (
                    <SenderCard 
                      key={chat.id} 
                      msg={chat.message}
                      date={chat.createdAt?.toDate()}
                    />
                  );
                } else {
                  return (
                    <ReceiverCard 
                      key={chat.id} 
                      msg={chat.message}
                      date={chat.createdAt?.toDate()}
                    />
                  );
                }
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Section */}
          <div className="flex items-center space-x-4 w-full max-w-2xl p-4 bg-gray-600 rounded-b-2xl">
            <input
              type="file"
              accept=".jpg, .jpeg, .png, .gif"
              ref={fileInputRef}
              onChange={handleImageUpload}
              className="hidden"
            />
            <div
              className="bg-[#1F2937] p-3 rounded-md flex items-center justify-center cursor-pointer hover:bg-gray-700 transition"
              onClick={() => fileInputRef.current.click()}
            >
              <LuImagePlus size={20} />
            </div>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              className="w-full bg-[#1F2937] rounded-3xl p-2 px-4 text-sm text-white placeholder-gray-400 focus:outline-none"
              type="text"
              placeholder="Type your message..."
              disabled={!isAuthorized}
            />
            <div
              onClick={sendMessage}
              className="bg-[#1F2937] p-3 rounded-3xl flex items-center justify-center cursor-pointer hover:bg-gray-700 transition"
            >
              <IoSend size={20} color="#308AFF" />
            </div>
          </div>

          {/* Preview selected image */}
          {uploadedImage && (
            <div className="w-full max-w-2xl p-4 bg-gray-700">
              <p className="text-xs text-gray-300 mb-2">Image preview:</p>
              <img
                src={uploadedImage}
                alt="preview"
                className="max-w-[200px] rounded-lg"
              />
              <button
                onClick={() => setUploadedImage(null)}
                className="mt-2 text-xs text-red-400 hover:text-red-300"
              >
                Remove image
              </button>
            </div>
          )}

          {/* Display custom alert message */}
          {alertMessage && (
            <div className="w-full max-w-2xl p-3 bg-red-500 text-white text-center">
              {alertMessage}
            </div>
          )}
        </div>
      </center>
    </div>
  );
};

export default Page;