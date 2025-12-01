"use client";
import React, { useState } from "react";
import { FaTag, FaUserCircle, FaBars, FaSignOutAlt } from "react-icons/fa";
import { HiMenu } from "react-icons/hi";
import { FaBell } from "react-icons/fa";
import { BsChatDotsFill } from "react-icons/bs";
import { AiFillPlusCircle } from "react-icons/ai";
import { IoIosWarning } from "react-icons/io";
import Link from "next/link";
import { SignOutButton, useUser } from "@clerk/nextjs";
import { MdOutlineImageSearch } from "react-icons/md";
import { useNotifications } from "@/app/lib/notification/useNotifications";
import { NOTIFICATION_TYPES } from "@/app/lib/notification/notification";

const NavLinks = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useUser();

  // Get all notification counts with real-time updates
  const { notifications, unreadCount, loading } = useNotifications(user?.id, {
    autoSubscribe: true,
  });

  // Count message notifications specifically - memoized to prevent recalculation
  const messageCount = React.useMemo(() => {
    if (loading || !notifications || notifications.length === 0) return 0;

    const unreadMessages = notifications.filter(
      (notif) => !notif.read && notif.type === NOTIFICATION_TYPES.MESSAGE
    );

    return unreadMessages.length;
  }, [notifications, loading]);

  const navItems = [
    { href: "/createpost", icon: AiFillPlusCircle, label: "New Post" },
    {
      href: "/notifications",
      icon: FaBell,
      label: "Notifications",
      showBadge: true,
      badgeCount: unreadCount || 0,
    },
    {
      href: "/chats",
      icon: BsChatDotsFill,
      label: "Messages",
      showBadge: true,
      badgeCount: messageCount || 0,
    },
    { href: "/myitems", icon: FaTag, label: "My Items" },
    { href: "/reports", icon: IoIosWarning, label: "Reports" },
    
    {
      href: "/image-search",
      icon: MdOutlineImageSearch,
      label: "Image Search",

    },
    { href: "/profile", icon: FaUserCircle, label: "Profile" },
    { href: "#", icon: FaSignOutAlt, label: "Sign Out", isSignOut: true },
  ];

  return (
    <div className="relative">
      {/* Mobile Hamburger Menu */}
      <div className="md:hidden">
        <button onClick={() => setIsOpen(!isOpen)} className="text-white">
          <HiMenu size={32} />
        </button>
      </div>

      {/* Mobile Navigation */}
      <div
        className={`${
          isOpen ? "block" : "hidden"
        } md:flex items-center bg-gray-700/70 backdrop-blur-md p-4 absolute top-10 right-0 md:static md:bg-transparent rounded-lg z-50`}
      >
        {navItems.map((item, index) =>
          item.isSignOut ? (
            <SignOutButton key={index}>
              <div
                className={`flex items-center space-x-2 py-4 ${
                  !isOpen ? "group relative" : ""
                } hover:underline me-4 md:me-6 cursor-pointer`}
              >
                <item.icon className="text-white" size={26} />

                {/* Display label on mobile if the menu is open */}
                {isOpen && <span className="text-white">{item.label}</span>}

                {/* Tooltip for desktop hover */}
                {!isOpen && (
                  <span
                    className="
                      absolute left-1/2 -translate-x-1/2 top-full mt-2
                      bg-gray-800 text-white text-sm 
                      px-2 py-1 rounded 
                      opacity-0 group-hover:opacity-100
                      transform group-hover:-translate-y-0 -translate-y-2
                      transition-all duration-300 
                      pointer-events-none
                    "
                  >
                    {item.label}
                  </span>
                )}
              </div>
            </SignOutButton>
          ) : (
            <Link
              key={index}
              href={item.href}
              className={`flex items-center space-x-2 py-4 ${
                !isOpen ? "group relative" : ""
              } hover:underline me-4 md:me-6`}
            >
              <div className="relative">
                <item.icon className="text-white" size={26} />

                {/* Notification Badge */}
                {item.showBadge && item.badgeCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1.5 animate-pulse">
                    {item.badgeCount > 99 ? "99+" : item.badgeCount}
                  </span>
                )}

                {/* Visual indicator dot for notifications (when count is 0 but there are unread) */}
                {item.showBadge && item.badgeCount > 0 && !isOpen && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-gray-900"></span>
                )}
              </div>

              {/* Display label on mobile if the menu is open */}
              {isOpen && (
                <div className="flex items-center gap-2">
                  <span className="text-white">{item.label}</span>
                  {item.showBadge && item.badgeCount > 0 && (
                    <span className="bg-red-500 text-white text-xs font-bold rounded-full px-2 py-0.5">
                      {item.badgeCount > 99 ? "99+" : item.badgeCount}
                    </span>
                  )}
                </div>
              )}

              {/* Tooltip for desktop hover */}
              {!isOpen && (
                <span
                  className="
                    absolute left-1/2 -translate-x-1/2 top-full mt-2
                    bg-gray-800 text-white text-sm 
                    px-2 py-1 rounded 
                    opacity-0 group-hover:opacity-100
                    transform group-hover:-translate-y-0 -translate-y-2
                    transition-all duration-300 
                    pointer-events-none
                    whitespace-nowrap
                  "
                >
                  {item.label}
                  {item.showBadge && item.badgeCount > 0 && (
                    <span className="ml-1 text-red-400 font-bold">
                      ({item.badgeCount})
                    </span>
                  )}
                </span>
              )}
            </Link>
          )
        )}
      </div>
    </div>
  );
};

export default NavLinks;
