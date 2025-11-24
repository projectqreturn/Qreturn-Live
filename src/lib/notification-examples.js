/**
 * Example: How to integrate push notifications into your Qreturn features
 * 
 * This file shows practical examples of where and how to send push notifications
 * in various scenarios throughout your app.
 */

// ============================================================================
// EXAMPLE 1: Send notification when someone finds a lost item
// ============================================================================

// In your item matching/claiming logic (e.g., when marking item as found)
async function notifyItemOwner(item, finder) {
  try {
    await fetch('/api/push/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: item.ownerId,
        title: '🎉 Great News!',
        body: `Someone found your ${item.name}`,
        url: `/post/${item.id}`,
      })
    });
  } catch (error) {
    console.error('Failed to send notification:', error);
  }
}

// ============================================================================
// EXAMPLE 2: Chat message notifications
// ============================================================================

// In your chat message handler (e.g., when a new message is sent)
async function sendChatNotification(message, recipient) {
  // Don't send if recipient is currently viewing the chat
  const isActiveInChat = checkIfUserActiveInChat(recipient.id, message.chatId);
  
  if (!isActiveInChat) {
    await fetch('/api/push/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: recipient.id,
        title: `💬 ${message.senderName}`,
        body: message.text.substring(0, 100), // Preview
        url: `/chat/${message.chatId}`,
      })
    });
  }
}

// ============================================================================
// EXAMPLE 3: Location-based notifications
// ============================================================================

// When a lost item is reported near user's location
async function notifyNearbyUsers(item, nearbyUserIds) {
  const notifications = nearbyUserIds.map(userId => 
    fetch('/api/push/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        title: '📍 Lost Item Nearby',
        body: `${item.name} reported lost near your location`,
        url: `/map?itemId=${item.id}`,
      })
    })
  );
  
  await Promise.all(notifications);
}

// ============================================================================
// EXAMPLE 4: QR Code scan notification
// ============================================================================

// When someone scans an item's QR code
async function notifyQRScan(item, scanner) {
  await fetch('/api/push/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId: item.ownerId,
      title: '🔍 QR Code Scanned',
      body: `Someone scanned the QR code for your ${item.name}`,
      url: `/protectedqr/${item.qrId}`,
      // Optional: include location data
      data: {
        scannerId: scanner.id,
        scanLocation: scanner.location,
      }
    })
  });
}

// ============================================================================
// EXAMPLE 5: Batch notifications (e.g., daily digest)
// ============================================================================

// Send daily summary to users
async function sendDailyDigest(users) {
  for (const user of users) {
    const stats = await getUserDailyStats(user.id);
    
    if (stats.newMatches > 0 || stats.newMessages > 0) {
      await fetch('/api/push/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          title: '📊 Your Daily Qreturn Summary',
          body: `${stats.newMatches} new matches, ${stats.newMessages} messages`,
          url: '/profile',
        })
      });
    }
  }
}

// ============================================================================
// EXAMPLE 6: Integration with existing API routes
// ============================================================================

// Example: Update your existing post creation API
// File: /src/app/api/post/create/route.js

import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';

export async function POST(request) {
  const { userId } = auth();
  const postData = await request.json();
  
  // ... your existing post creation logic ...
  const newPost = await createPost(postData);
  
  // NEW: Send notifications to relevant users
  if (postData.type === 'found') {
    // Find users who reported similar lost items
    const matchingUsers = await findMatchingLostItemOwners(newPost);
    
    for (const matchUser of matchingUsers) {
      await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/push/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: matchUser.id,
          title: '✨ Potential Match Found',
          body: `A ${newPost.itemName} was found near ${newPost.location}`,
          url: `/post/${newPost.id}`,
        })
      });
    }
  }
  
  return NextResponse.json({ success: true, post: newPost });
}

// ============================================================================
// EXAMPLE 7: Background sync for offline notifications
// ============================================================================

// Store notifications in IndexedDB when offline, sync when online
class NotificationQueue {
  async add(notification) {
    const db = await this.openDB();
    await db.put('notifications', notification);
    
    // Try to sync if online
    if (navigator.onLine) {
      await this.sync();
    }
  }
  
  async sync() {
    const db = await this.openDB();
    const pending = await db.getAll('notifications');
    
    for (const notification of pending) {
      try {
        await fetch('/api/push/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(notification)
        });
        
        // Remove from queue on success
        await db.delete('notifications', notification.id);
      } catch (error) {
        console.error('Failed to sync notification:', error);
      }
    }
  }
  
  async openDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('QreturnNotifications', 1);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
}

// ============================================================================
// EXAMPLE 8: Client-side notification request
// ============================================================================

// In a React component where users opt-in
import { initializePushNotifications } from '@/lib/utils/pushNotifications';
import { useUser } from '@clerk/nextjs';

function NotificationSettings() {
  const { user } = useUser();
  
  const handleEnableNotifications = async () => {
    const result = await initializePushNotifications(
      process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
    );
    
    if (result.success) {
      // Update user preferences in database
      await fetch('/api/user/preferences', {
        method: 'PATCH',
        body: JSON.stringify({
          notificationsEnabled: true,
          subscription: result.subscription
        })
      });
      
      toast.success('Notifications enabled!');
    }
  };
  
  return (
    <button onClick={handleEnableNotifications}>
      Enable Notifications
    </button>
  );
}

// ============================================================================
// EXAMPLE 9: Scheduled notifications (using cron or scheduled tasks)
// ============================================================================

// File: /src/app/api/cron/notifications/route.js
// This would be called by Vercel Cron or similar

export async function GET(request) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }
  
  // Find items that have been lost for 24 hours with no updates
  const staleItems = await findStaleItems();
  
  for (const item of staleItems) {
    await fetch('/api/push/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: item.ownerId,
        title: '🔍 Still looking for your item?',
        body: `It's been 24 hours since you reported ${item.name} lost`,
        url: `/myitems/${item.id}`,
      })
    });
  }
  
  return Response.json({ processed: staleItems.length });
}

// ============================================================================
// EXAMPLE 10: Notification preferences
// ============================================================================

// Let users control what notifications they receive
const NOTIFICATION_TYPES = {
  ITEM_FOUND: 'item_found',
  NEW_MESSAGE: 'new_message',
  QR_SCANNED: 'qr_scanned',
  LOCATION_MATCH: 'location_match',
  DAILY_DIGEST: 'daily_digest',
};

// Before sending, check user preferences
async function sendNotificationWithPreferences(userId, type, notification) {
  const preferences = await getUserNotificationPreferences(userId);
  
  if (preferences[type] === true) {
    await fetch('/api/push/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        ...notification,
      })
    });
  }
}

// Usage:
await sendNotificationWithPreferences(
  user.id,
  NOTIFICATION_TYPES.ITEM_FOUND,
  {
    title: 'Item Found!',
    body: 'Someone found your lost item',
    url: '/items/123'
  }
);

// ============================================================================
// TIPS FOR PRODUCTION
// ============================================================================

/*
1. Rate Limiting: Implement rate limits to prevent notification spam
2. Batching: Group multiple notifications into a single digest
3. User Preferences: Always respect user notification preferences
4. Time Zones: Send notifications at appropriate times for user's timezone
5. Error Handling: Gracefully handle failed notification sends
6. Analytics: Track notification delivery and engagement rates
7. Testing: Test notifications on multiple devices and browsers
8. Fallbacks: Use in-app notifications if push fails
9. Cleanup: Remove invalid subscriptions from your database
10. Privacy: Don't send sensitive information in notification body
*/

export { 
  notifyItemOwner, 
  sendChatNotification, 
  notifyNearbyUsers,
  notifyQRScan 
};
