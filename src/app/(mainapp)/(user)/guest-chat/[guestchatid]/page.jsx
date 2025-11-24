"use client";
import React, { useState, useRef, useEffect } from "react";
import { RiShieldUserFill } from "react-icons/ri";
import { LuImagePlus } from "react-icons/lu";
import { IoSend } from "react-icons/io5";
import { HiCheckBadge } from "react-icons/hi2";
import { BiSolidBadgeDollar } from "react-icons/bi";

// SenderCard Component
const SenderCard = ({ msg }) => {
  return (
    <div className="w-full text-sm text-right">
      <div
        className="inline-block p-3 bg-[#296EC9] rounded-t-2xl rounded-bl-2xl"
        dangerouslySetInnerHTML={{ __html: msg }}
      />
    </div>
  );
};

// ReceiverCard Component
const ReceiverCard = ({ msg }) => {
  return (
    <div className="w-full text-sm text-left">
      <div
        className="inline-block p-3 bg-[#33B972] rounded-t-2xl rounded-br-2xl"
        dangerouslySetInnerHTML={{ __html: msg }}
      />
    </div>
  );
};

// Guest Name Modal Component
const GuestModal = ({ isOpen, onSubmit }) => {
  const [guestName, setGuestName] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = () => {
    if (guestName.trim() === "") {
      setError("Please enter your name");
      return;
    }
    onSubmit(guestName);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") handleSubmit();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md mx-4">
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-white text-center">Welcome to Secure Chat</h2>
        </div>
        <p className="text-gray-300 mb-4">Please enter your name to continue</p>
        <input
          type="text"
          value={guestName}
          onChange={(e) => setGuestName(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="Your Name"
          maxLength={20}
          className="p-3 w-full bg-gradient-to-b from-white to-[#959595] placeholder-[#6B7280] text-black focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2 rounded-md"
          autoFocus
        />
        {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
        <button
          onClick={handleSubmit}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition duration-300"
        >
          Continue to Chat
        </button>
      </div>
    </div>
  );
};

const Page = () => {
  const [userName, setUserName] = useState("");
  const [input, setInput] = useState("");
  const [chats, setChats] = useState([
    { id: 1, name: "Nuwan", msg: "Hello...", date: "2025/05/06" },
    { id: 2, name: "Kamal", msg: "How are you?", date: "2025/05/06" },
  ]);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [alertMessage, setAlertMessage] = useState("");
  const [showGuestModal, setShowGuestModal] = useState(true);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  // Function to hide error message after a few seconds
  useEffect(() => {
    if (alertMessage) {
      const timer = setTimeout(() => {
        setAlertMessage(""); // Clear the alert message after 5 seconds
      }, 5000);

      return () => clearTimeout(timer); // Clean up the timer when component unmounts or alert changes
    }
  }, [alertMessage]);

  // Save user name to local storage when it changes
  useEffect(() => {
    if (userName) {
      localStorage.setItem("guestUserName", userName);
      // You can also prepare this data for your backend here
      console.log("Guest user name saved:", userName);
      setShowGuestModal(false);
    }
  }, [userName]);

  // Check if user name exists in local storage on component mount
  useEffect(() => {
    const savedName = localStorage.getItem("guestUserName");
    if (savedName) {
      setUserName(savedName);
      setShowGuestModal(false);
    }
  }, []);

  const handleGuestSubmit = (name) => {
    setUserName(name);
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
      setAlertMessage(""); // Clear any previous alert
    };
    reader.readAsDataURL(file);
  };

  const sendMessage = () => {
    if (input.trim() === "" && !uploadedImage) return;

    const newMessage = {
      id: chats.length + 1,
      name: userName,
      msg: uploadedImage
        ? `<img src="${uploadedImage}" alt="upload" class="max-w-[200px] rounded-lg" />`
        : input,
      date: new Date().toISOString().split("T")[0],
    };

    setChats([...chats, newMessage]);
    setInput("");
    setUploadedImage(null);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") sendMessage();
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chats]);

  return (
    <div className="pt-[23vh] lg:pt-44 mb-4 mt-4">
      <GuestModal 
        isOpen={showGuestModal} 
        onSubmit={handleGuestSubmit} 
      />
      
      <center>
        <div className="flex flex-col items-center justify-center bg-gray-800 rounded-2xl w-full max-w-2xl shadow-lg text-white mb-10 mt-4">
          {/* Chat Header */}
          <div className="flex items-center space-x-4 w-full max-w-2xl pl-6 pt-6 p-4 bg-gray-600 rounded-t-2xl">
            <img
              className="w-12 h-12 object-cover rounded-full"
              src="/slider/bag1.jpg"
              alt="chat-img"
            />
            <div className="text-left">
              <h4 className="font-semibold text-sm">
                Nike Backpack - Black color
              </h4>
              <div className="flex flex-wrap gap-4 mt-1">
                <p className="text-xs text-gray-400">Saman Kumara</p>
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

          {/* Guest User Badge */}
          {userName && (
            <div className="w-full px-4 py-2 bg-gray-700">
              <div className="flex items-center space-x-2">
                <p className="text-xs text-gray-300">Chatting as:</p>
                <span className="text-sm font-medium text-blue-400">{userName}</span>
                <span className="text-xs bg-gray-600 px-2 py-1 rounded">Guest</span>
              </div>
            </div>
          )}

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
            {chats.map((chat) => {
              if (chat.name === userName) {
                return <SenderCard key={chat.id} msg={chat.msg} />;
              } else {
                return <ReceiverCard key={chat.id} msg={chat.msg} />;
              }
            })}
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
              className="bg-[#1F2937] p-3 rounded-md flex items-center justify-center cursor-pointer"
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
              disabled={!userName}
            />
            <div
              onClick={sendMessage}
              className={`bg-[#1F2937] p-3 rounded-3xl flex items-center justify-center cursor-pointer ${!userName ? 'opacity-70' : ''}`}
            >
              <IoSend size={20} color="#308AFF" />
            </div>
          </div>

          {/* Preview selected image (optional) */}
          {uploadedImage && (
            <div className="mt-4 text-center">
              <p className="text-xs text-gray-300 mb-2">Image preview:</p>
              <img
                src={uploadedImage}
                alt="preview"
                className="max-w-[200px] rounded-lg mx-auto"
              />
            </div>
          )}

          {/* Display custom alert message */}
          {alertMessage && (
            <div className="mt-4 p-3 bg-red-500 text-white text-center rounded-lg">
              {alertMessage}
            </div>
          )}
        </div>
      </center>
    </div>
  );
};

export default Page;