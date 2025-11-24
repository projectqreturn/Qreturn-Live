/**
 * Notification Library Usage Examples
 * Copy these examples into your components as needed
 */

// ==========================================
// EXAMPLE 1: Basic Notification Creation
// ==========================================
import { createNotification, NOTIFICATION_TYPES } from '@/app/lib/notification/notification';

async function sendBasicNotification() {
  const notificationId = await createNotification({
    userId: 'user_123',
    type: NOTIFICATION_TYPES.SYSTEM,
    title: 'Welcome to Qreturn!',
    message: 'Thank you for joining our community',
    priority: 'medium'
  });
  
  console.log('Notification created:', notificationId);
}

// ==========================================
// EXAMPLE 2: Item Match Notification
// ==========================================
import { notifyItemMatch } from '@/app/lib/notification/notification';

async function notifyUserAboutMatch(userId, itemDetails) {
  await notifyItemMatch(
    userId,
    itemDetails.id,
    itemDetails.name,
    'lost' // or 'found'
  );
}

// ==========================================
// EXAMPLE 3: QR Code Scan Alert
// ==========================================
import { notifyQRScan } from '@/app/lib/notification/notification';

async function handleQRCodeScan(itemOwnerId, itemId, scanLocation) {
  await notifyQRScan(itemOwnerId, itemId, scanLocation);
}

// ==========================================
// EXAMPLE 4: Using React Hook in Component
// ==========================================
'use client';

import { useNotifications } from '@/app/lib/notification/useNotifications';
import { useUser } from '@clerk/nextjs';

function MyNotificationsPage() {
  const { user } = useUser();
  const {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotifications(user?.id, { autoSubscribe: true });

  if (loading) {
    return <div>Loading notifications...</div>;
  }

  return (
    <div>
      <h1>Notifications ({unreadCount} unread)</h1>
      <button onClick={markAllAsRead}>Mark All as Read</button>

      {notifications.map(notif => (
        <div key={notif.id} className={notif.read ? 'read' : 'unread'}>
          <h3>{notif.title}</h3>
          <p>{notif.message}</p>
          <span>{notif.createdAt?.toLocaleString()}</span>
          <button onClick={() => markAsRead(notif.id)}>Mark Read</button>
          <button onClick={() => deleteNotification(notif.id)}>Delete</button>
        </div>
      ))}
    </div>
  );
}

// ==========================================
// EXAMPLE 5: Notification Badge in Navbar
// ==========================================
'use client';

import { useNotifications } from '@/app/lib/notification/useNotifications';
import { useUser } from '@clerk/nextjs';
import { BellIcon } from '@heroicons/react/24/outline';

function NotificationBadge() {
  const { user } = useUser();
  const { unreadCount } = useNotifications(user?.id);

  return (
    <div className="relative">
      <BellIcon className="w-6 h-6" />
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </div>
  );
}

// ==========================================
// EXAMPLE 6: Send Notification from API Route
// ==========================================
// app/api/items/found/route.js
import { NextResponse } from 'next/server';
import { createNotification, NOTIFICATION_TYPES } from '@/app/lib/notification/notification';

export async function POST(request) {
  try {
    const { itemId, foundBy, ownerId } = await request.json();

    // Send notification to item owner
    await createNotification({
      userId: ownerId,
      type: NOTIFICATION_TYPES.ITEM_FOUND,
      title: 'Your Item Was Found!',
      message: `Great news! Someone found your lost item`,
      data: { itemId, foundBy },
      link: `/found/${itemId}`,
      priority: 'high'
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// ==========================================
// EXAMPLE 7: Bulk Notifications
// ==========================================
import { bulkCreateNotifications, NOTIFICATION_TYPES } from '@/app/lib/notification/notification';

async function notifyMultipleUsers(userIds, announcement) {
  const notifications = userIds.map(userId => ({
    userId,
    type: NOTIFICATION_TYPES.SYSTEM,
    title: 'Important Announcement',
    message: announcement,
    priority: 'high'
  }));

  const notificationIds = await bulkCreateNotifications(notifications);
  console.log(`Sent ${notificationIds.length} notifications`);
}

// ==========================================
// EXAMPLE 8: Real-time Subscription
// ==========================================
'use client';

import { useEffect, useState } from 'react';
import { subscribeToNotifications } from '@/app/lib/notification/notification';

function RealtimeNotifications({ userId }) {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (!userId) return;

    // Subscribe to real-time updates
    const unsubscribe = subscribeToNotifications(
      userId,
      (updatedNotifications) => {
        setNotifications(updatedNotifications);
        console.log('Notifications updated:', updatedNotifications.length);
      },
      { unreadOnly: false }
    );

    // Cleanup subscription
    return () => unsubscribe();
  }, [userId]);

  return (
    <div>
      {notifications.map(n => (
        <div key={n.id}>{n.title}</div>
      ))}
    </div>
  );
}

// ==========================================
// EXAMPLE 9: Get Notifications by Type
// ==========================================
import { getNotificationsByType, NOTIFICATION_TYPES } from '@/app/lib/notification/notification';

async function getMessageNotifications(userId) {
  const messageNotifs = await getNotificationsByType(
    userId,
    NOTIFICATION_TYPES.MESSAGE,
    25 // limit
  );
  
  console.log('Message notifications:', messageNotifs);
}

// ==========================================
// EXAMPLE 10: Send Message Notification
// ==========================================
import { notifyNewMessage } from '@/app/lib/notification/notification';

async function sendChatNotification(recipientId, senderName, message, chatId) {
  await notifyNewMessage(
    recipientId,
    senderName,
    message.substring(0, 50), // Preview
    chatId
  );
}

// ==========================================
// EXAMPLE 11: Error Handling
// ==========================================
import { createNotification, NOTIFICATION_TYPES } from '@/app/lib/notification/notification';
import toast from 'react-hot-toast';

async function sendNotificationWithErrorHandling(userId, data) {
  try {
    const id = await createNotification({
      userId,
      type: NOTIFICATION_TYPES.SYSTEM,
      title: data.title,
      message: data.message,
      priority: 'medium'
    });
    
    toast.success('Notification sent successfully!');
    return id;
  } catch (error) {
    console.error('Failed to send notification:', error);
    toast.error('Failed to send notification');
    return null;
  }
}

// ==========================================
// EXAMPLE 12: Integration with Item Found Post
// ==========================================
async function handleItemFoundPost(item, foundBy) {
  const { ownerId, id: itemId, name } = item;

  // Notify the owner
  await createNotification({
    userId: ownerId,
    type: NOTIFICATION_TYPES.ITEM_FOUND,
    title: 'Item Found Match!',
    message: `Someone posted a found item matching your ${name}`,
    data: {
      itemId,
      foundBy,
      matchConfidence: 'high'
    },
    link: `/found/${itemId}`,
    priority: 'high'
  });
}

export {
  sendBasicNotification,
  notifyUserAboutMatch,
  handleQRCodeScan,
  MyNotificationsPage,
  NotificationBadge,
  notifyMultipleUsers,
  RealtimeNotifications,
  getMessageNotifications,
  sendChatNotification,
  sendNotificationWithErrorHandling,
  handleItemFoundPost,
};
