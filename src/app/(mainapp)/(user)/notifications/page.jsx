"use client";
import React from "react";
import NotifyCard from "@/components/notifi/NotifyCard";
import { useNotifications } from "@/app/lib/notification/useNotifications";
import { useUser } from "@clerk/nextjs";
import { NOTIFICATION_TYPES } from "@/app/lib/notification/notification";

// Map notification types to icon keys
const getIconKey = (type) => {
    const iconMapping = {
        [NOTIFICATION_TYPES.MATCH_FOUND]: "search",
        [NOTIFICATION_TYPES.MESSAGE]: "msg",
        [NOTIFICATION_TYPES.ITEM_FOUND]: "post",
        [NOTIFICATION_TYPES.ITEM_LOST]: "lost",
        [NOTIFICATION_TYPES.QR_SCAN]: "search",
        [NOTIFICATION_TYPES.ITEM_CLAIMED]: "post",
        [NOTIFICATION_TYPES.VERIFICATION]: "post",
        [NOTIFICATION_TYPES.SYSTEM]: "post",
    };
    return iconMapping[type] || "search";
};

export default function Page() {
    const { user } = useUser();
    const { 
        notifications, 
        loading, 
        deleteNotification, 
        markAsRead 
    } = useNotifications(user?.id, { autoSubscribe: true });

    // Filter out read message notifications
    const displayNotifications = notifications.filter(notif => {
        // If it's a message notification and it's read, don't show it
        if (notif.type === NOTIFICATION_TYPES.MESSAGE && notif.read) {
            return false;
        }
        // Show all other notifications
        return true;
    });

    const handleDelete = async (id) => {
        try {
            await deleteNotification(id);
        } catch (error) {
            console.error("Error deleting notification:", error);
        }
    };

    const handleCardClick = async (notification) => {
        // Mark as read when clicked
        if (!notification.read) {
            await markAsRead(notification.id);
        }
        
        // Navigate to link if available
        if (notification.link) {
            window.location.href = notification.link;
        }
    };

    return (
        <>
  <div className="pt-20 md:pt-28 lg:pt-40 px-4 mb-4 md:mb-6 lg:mb-8 mt-32">
    <h3 className="text-center font-semibold text-lg md:text-xl lg:text-2xl">Notifications</h3>
  </div>
  <div className="flex justify-center px-2 sm:px-4 md:px-6">
    <div className="flex flex-col items-center justify-center bg-gray-800 rounded-lg md:rounded-xl lg:rounded-2xl w-full max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl shadow-md md:shadow-lg text-white p-3 sm:p-4 md:p-5 lg:p-6">
      {loading ? (
        <div className="py-8 text-center text-gray-400">
          <p>Loading notifications...</p>
        </div>
      ) : displayNotifications.length > 0 ? (
        displayNotifications.map((item) => {
          // Add distance to description for lost item notifications
          let description = item.message;
          if (item.type === NOTIFICATION_TYPES.ITEM_LOST && item.data?.distance) {
            description = `${item.message} • ${item.data.distance}`;
          }
          
          return (
            <div 
              key={item.id}
              onClick={() => handleCardClick(item)}
              className={`w-full ${!item.read ? 'opacity-100' : 'opacity-60'} cursor-pointer`}
            >
              <NotifyCard
                id={item.id}
                iconKey={getIconKey(item.type)}
                title={item.title}
                description={description}
                onDelete={handleDelete}
              />
            </div>
          );
        })
      ) : (
        <div className="py-8 text-center text-gray-400">
          <p>No notifications to display</p>
        </div>
      )}
    </div>
  </div>
</>
    );
}