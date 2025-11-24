# Notification Library Documentation

## Overview
A comprehensive Firebase-based notification library for the Qreturn application with real-time updates, easy integration, and helper functions.

## Installation
The library is already integrated with Firebase. No additional installation needed.

## Quick Start

### Basic Usage

```javascript
import { 
  createNotification, 
  getNotifications, 
  NOTIFICATION_TYPES 
} from '@/app/lib/notification/notification';

// Create a notification
const notifId = await createNotification({
  userId: 'user123',
  type: NOTIFICATION_TYPES.ITEM_FOUND,
  title: 'Item Found!',
  message: 'Someone found your lost wallet',
  data: { itemId: 'item456' },
  link: '/found/item456',
  priority: 'high'
});

// Get all notifications
const notifications = await getNotifications('user123');

// Get unread notifications only
const unread = await getNotifications('user123', { unreadOnly: true });
```

### Using React Hook (Recommended)

```javascript
'use client';

import { useNotifications } from '@/app/lib/notification/useNotifications';
import { useUser } from '@clerk/nextjs';

function NotificationComponent() {
  const { user } = useUser();
  const {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotifications(user?.id, { autoSubscribe: true });

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h2>Notifications ({unreadCount} unread)</h2>
      <button onClick={markAllAsRead}>Mark All Read</button>
      
      {notifications.map(notif => (
        <div key={notif.id} className={notif.read ? 'read' : 'unread'}>
          <h3>{notif.title}</h3>
          <p>{notif.message}</p>
          <button onClick={() => markAsRead(notif.id)}>Mark Read</button>
          <button onClick={() => deleteNotification(notif.id)}>Delete</button>
        </div>
      ))}
    </div>
  );
}
```

## API Reference

### Core Functions

#### `createNotification(notificationData)`
Creates a new notification.

**Parameters:**
- `userId` (string, required): Target user ID
- `type` (string, required): Notification type from NOTIFICATION_TYPES
- `title` (string, required): Notification title
- `message` (string, required): Notification message
- `data` (object, optional): Additional metadata
- `link` (string, optional): Navigation link
- `priority` (string, optional): 'high' | 'medium' | 'low' (default: 'medium')

**Returns:** Promise<string> - Notification ID

**Example:**
```javascript
import { createNotification, NOTIFICATION_TYPES } from '@/app/lib/notification/notification';

// Basic notification
const notifId = await createNotification({
  userId: 'user_2a3b4c5d',
  type: NOTIFICATION_TYPES.ITEM_FOUND,
  title: 'Item Found!',
  message: 'Someone found your lost backpack',
  data: { 
    itemId: 'item_123',
    location: 'Central Station',
    foundBy: 'user_xyz'
  },
  link: '/found/item_123',
  priority: 'high'
});

console.log('Notification created with ID:', notifId);
```

---

#### `getNotifications(userId, options)`
Retrieves notifications for a user.

**Parameters:**
- `userId` (string, required): User ID
- `options` (object, optional):
  - `limitCount` (number): Max notifications (default: 50)
  - `unreadOnly` (boolean): Only unread notifications (default: false)

**Returns:** Promise<Array> - Array of notification objects

**Example:**
```javascript
import { getNotifications } from '@/app/lib/notification/notification';

// Get all notifications (up to 50)
const allNotifications = await getNotifications('user_2a3b4c5d');
console.log(`Total notifications: ${allNotifications.length}`);

// Get only unread notifications
const unreadNotifications = await getNotifications('user_2a3b4c5d', { 
  unreadOnly: true 
});
console.log(`Unread: ${unreadNotifications.length}`);

// Get last 10 notifications
const recentNotifications = await getNotifications('user_2a3b4c5d', { 
  limitCount: 10 
});

// Process notifications
recentNotifications.forEach(notif => {
  console.log(`${notif.title}: ${notif.message}`);
  console.log(`Created: ${notif.createdAt.toLocaleString()}`);
  console.log(`Read: ${notif.read ? 'Yes' : 'No'}`);
});
```

---

#### `getUnreadCount(userId)`
Gets the count of unread notifications.

**Returns:** Promise<number>

**Example:**
```javascript
import { getUnreadCount } from '@/app/lib/notification/notification';

const count = await getUnreadCount('user_2a3b4c5d');
console.log(`You have ${count} unread notifications`);

// Use in conditional logic
if (count > 0) {
  console.log('You have new notifications!');
  // Show notification badge
  document.querySelector('.notification-badge').textContent = count;
}

// Check for high notification count
if (count > 50) {
  console.log('Consider clearing old notifications');
}
```

---

#### `markAsRead(notificationId)`
Marks a notification as read.

**Returns:** Promise<void>

**Example:**
```javascript
import { markAsRead } from '@/app/lib/notification/notification';

// Mark single notification as read
await markAsRead('notif_abc123');
console.log('Notification marked as read');

// Mark as read when user clicks notification
async function handleNotificationClick(notificationId, link) {
  try {
    await markAsRead(notificationId);
    // Navigate to the linked page
    window.location.href = link;
  } catch (error) {
    console.error('Failed to mark as read:', error);
  }
}
```

---

#### `markMultipleAsRead(notificationIds)`
Marks multiple notifications as read at once.

**Parameters:**
- `notificationIds` (Array<string>, required): Array of notification IDs

**Returns:** Promise<void>

**Example:**
```javascript
import { markMultipleAsRead } from '@/app/lib/notification/notification';

// Mark selected notifications as read
const selectedIds = ['notif_1', 'notif_2', 'notif_3'];
await markMultipleAsRead(selectedIds);
console.log(`Marked ${selectedIds.length} notifications as read`);

// Mark all notifications from a specific type
import { getNotificationsByType, NOTIFICATION_TYPES } from '@/app/lib/notification/notification';

const messageNotifs = await getNotificationsByType('user_123', NOTIFICATION_TYPES.MESSAGE);
const unreadIds = messageNotifs.filter(n => !n.read).map(n => n.id);
await markMultipleAsRead(unreadIds);
console.log('All message notifications marked as read');
```

---

#### `markAllAsRead(userId)`
Marks all notifications as read for a user.

**Returns:** Promise<void>

**Example:**
```javascript
import { markAllAsRead } from '@/app/lib/notification/notification';

// Clear all unread notifications
await markAllAsRead('user_2a3b4c5d');
console.log('All notifications marked as read');

// Use in a "Clear All" button
async function handleClearAllButton(userId) {
  const confirmed = confirm('Mark all notifications as read?');
  if (confirmed) {
    await markAllAsRead(userId);
    alert('All notifications marked as read!');
    // Refresh notification list
    refreshNotifications();
  }
}
```

---

#### `deleteNotification(notificationId)`
Deletes a specific notification.

**Returns:** Promise<void>

**Example:**
```javascript
import { deleteNotification } from '@/app/lib/notification/notification';

// Delete a notification
await deleteNotification('notif_abc123');
console.log('Notification deleted');

// Delete with confirmation
async function handleDeleteNotification(notificationId) {
  try {
    await deleteNotification(notificationId);
    console.log('Notification deleted successfully');
    // Remove from UI
    document.getElementById(`notif-${notificationId}`)?.remove();
  } catch (error) {
    console.error('Failed to delete:', error);
    alert('Could not delete notification');
  }
}
```

---

#### `deleteAllNotifications(userId)`
Deletes all notifications for a user.

**Returns:** Promise<void>

**Example:**
```javascript
import { deleteAllNotifications } from '@/app/lib/notification/notification';

// Delete all notifications
await deleteAllNotifications('user_2a3b4c5d');
console.log('All notifications deleted');

// Delete with confirmation
async function clearAllNotifications(userId) {
  const confirmed = confirm('Are you sure? This will permanently delete all notifications.');
  if (confirmed) {
    try {
      await deleteAllNotifications(userId);
      alert('All notifications have been deleted');
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to delete notifications');
    }
  }
}
```

---

#### `getNotificationById(notificationId)`
Gets a single notification by its ID.

**Returns:** Promise<Object|null> - Notification object or null if not found

**Example:**
```javascript
import { getNotificationById } from '@/app/lib/notification/notification';

// Get specific notification
const notification = await getNotificationById('notif_abc123');

if (notification) {
  console.log('Title:', notification.title);
  console.log('Message:', notification.message);
  console.log('Type:', notification.type);
  console.log('Read:', notification.read);
  console.log('Data:', notification.data);
} else {
  console.log('Notification not found');
}

// Use in notification detail page
async function loadNotificationDetails(notifId) {
  const notif = await getNotificationById(notifId);
  if (notif) {
    document.getElementById('notif-title').textContent = notif.title;
    document.getElementById('notif-message').textContent = notif.message;
    document.getElementById('notif-time').textContent = notif.createdAt.toLocaleString();
  }
}
```

---

#### `subscribeToNotifications(userId, callback, options)`
Real-time subscription to notifications.

**Parameters:**
- `userId` (string): User ID
- `callback` (function): Called with updated notifications
- `options` (object):
  - `unreadOnly` (boolean): Subscribe only to unread

**Returns:** Function - Unsubscribe function

**Example:**
```javascript
import { subscribeToNotifications } from '@/app/lib/notification/notification';

// Subscribe to all notifications
const unsubscribe = subscribeToNotifications(
  'user_2a3b4c5d',
  (notifications) => {
    console.log(`Received ${notifications.length} notifications`);
    updateNotificationUI(notifications);
  }
);

// Later, cleanup the subscription
unsubscribe();

// Subscribe to only unread notifications
const unsubscribeUnread = subscribeToNotifications(
  'user_2a3b4c5d',
  (unreadNotifications) => {
    const count = unreadNotifications.length;
    document.querySelector('.badge').textContent = count;
    
    // Show toast for new notifications
    if (count > 0) {
      showToast(`You have ${count} new notification(s)`);
    }
  },
  { unreadOnly: true }
);

// Use in React component
import { useEffect, useState } from 'react';

function NotificationListener({ userId }) {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const unsubscribe = subscribeToNotifications(
      userId,
      (notifs) => setNotifications(notifs)
    );

    // Cleanup on unmount
    return () => unsubscribe();
  }, [userId]);

  return <div>You have {notifications.length} notifications</div>;
}
```

---

#### `getNotificationsByType(userId, type, limitCount)`
Gets notifications filtered by type.

**Parameters:**
- `userId` (string, required): User ID
- `type` (string, required): Notification type from NOTIFICATION_TYPES
- `limitCount` (number, optional): Maximum notifications (default: 50)

**Returns:** Promise<Array> - Array of notification objects

**Example:**
```javascript
import { getNotificationsByType, NOTIFICATION_TYPES } from '@/app/lib/notification/notification';

// Get all message notifications
const messageNotifs = await getNotificationsByType(
  'user_2a3b4c5d',
  NOTIFICATION_TYPES.MESSAGE
);
console.log(`You have ${messageNotifs.length} message notifications`);

// Get last 10 QR scan notifications
const qrScans = await getNotificationsByType(
  'user_2a3b4c5d',
  NOTIFICATION_TYPES.QR_SCAN,
  10
);

qrScans.forEach(scan => {
  console.log(`QR scanned at: ${scan.data.location}`);
});

// Get all match notifications
const matches = await getNotificationsByType(
  'user_2a3b4c5d',
  NOTIFICATION_TYPES.MATCH_FOUND
);

console.log(`Found ${matches.length} potential matches for your items`);
```

---

#### `bulkCreateNotifications(notificationsData)`
Creates multiple notifications at once.

**Parameters:**
- `notificationsData` (Array<Object>, required): Array of notification objects

**Returns:** Promise<Array<string>> - Array of created notification IDs

**Example:**
```javascript
import { bulkCreateNotifications, NOTIFICATION_TYPES } from '@/app/lib/notification/notification';

// Send announcement to multiple users
const userIds = ['user_1', 'user_2', 'user_3', 'user_4'];
const notifications = userIds.map(userId => ({
  userId,
  type: NOTIFICATION_TYPES.SYSTEM,
  title: 'System Maintenance',
  message: 'The system will be under maintenance tonight from 10 PM to 2 AM',
  priority: 'high'
}));

const notifIds = await bulkCreateNotifications(notifications);
console.log(`Sent ${notifIds.length} notifications`);

// Notify all users about a found item match
async function notifyPotentialMatches(lostItem, potentialOwners) {
  const notifications = potentialOwners.map(owner => ({
    userId: owner.id,
    type: NOTIFICATION_TYPES.MATCH_FOUND,
    title: 'Potential Match Found!',
    message: `A ${lostItem.name} was found that might be yours`,
    data: { itemId: lostItem.id, confidence: owner.matchScore },
    link: `/found/${lostItem.id}`,
    priority: 'high'
  }));

  const ids = await bulkCreateNotifications(notifications);
  return ids;
}
```

### Notification Types

```javascript
export const NOTIFICATION_TYPES = {
  ITEM_FOUND: 'item_found',
  ITEM_LOST: 'item_lost',
  MATCH_FOUND: 'match_found',
  MESSAGE: 'message',
  SYSTEM: 'system',
  QR_SCAN: 'qr_scan',
  ITEM_CLAIMED: 'item_claimed',
  VERIFICATION: 'verification',
};
```

### Helper Functions

#### `notifyItemMatch(userId, itemId, itemName, matchType)`
Creates a match notification when a potential match is found.

**Parameters:**
- `userId` (string, required): User ID to notify
- `itemId` (string, required): Item ID
- `itemName` (string, required): Name of the item
- `matchType` (string, required): 'lost' or 'found'

**Returns:** Promise<string> - Notification ID

**Example:**
```javascript
import { notifyItemMatch } from '@/app/lib/notification/notification';

// Notify user about a lost item match
await notifyItemMatch('user_2a3b4c5d', 'item_123', 'Blue Wallet', 'lost');

// Notify user about a found item match
await notifyItemMatch('user_xyz', 'item_456', 'iPhone 13 Pro', 'found');

// Use in matching algorithm
async function findAndNotifyMatches(newItem) {
  const matches = await findPotentialMatches(newItem);
  
  for (const match of matches) {
    await notifyItemMatch(
      match.userId,
      newItem.id,
      newItem.name,
      newItem.type // 'lost' or 'found'
    );
  }
  
  console.log(`Notified ${matches.length} users about potential matches`);
}

// Integrate with item posting
async function handleItemPost(item) {
  // Save item to database
  await saveItem(item);
  
  // Find and notify potential matches
  const potentialOwners = await searchForMatches(item);
  
  for (const owner of potentialOwners) {
    await notifyItemMatch(owner.id, item.id, item.name, item.type);
  }
}
```

---

#### `notifyQRScan(userId, itemId, location)`
Creates a notification when someone scans a QR code.

**Parameters:**
- `userId` (string, required): Item owner's user ID
- `itemId` (string, required): Item ID
- `location` (string, required): Location where QR was scanned

**Returns:** Promise<string> - Notification ID

**Example:**
```javascript
import { notifyQRScan } from '@/app/lib/notification/notification';

// Simple QR scan notification
await notifyQRScan('user_2a3b4c5d', 'item_123', 'Colombo, Sri Lanka');

// With detailed location
await notifyQRScan(
  'user_abc',
  'item_789',
  'Colombo Fort Railway Station, Platform 3'
);

// Use in QR scanner component
async function handleQRCodeScan(qrData) {
  try {
    // Parse QR data
    const { itemId, ownerId } = parseQRCode(qrData);
    
    // Get current location
    const location = await getCurrentLocation();
    const locationName = await reverseGeocode(location);
    
    // Notify owner
    await notifyQRScan(ownerId, itemId, locationName);
    
    console.log('Owner has been notified of the scan');
    return { success: true };
  } catch (error) {
    console.error('QR scan notification failed:', error);
    return { success: false, error };
  }
}

// With GPS coordinates
async function notifyQRScanWithGPS(ownerId, itemId, lat, lng) {
  const locationString = `GPS: ${lat.toFixed(6)}, ${lng.toFixed(6)}`;
  await notifyQRScan(ownerId, itemId, locationString);
}

// Real-world example
async function processProtectedQRScan(qrCode, scannerLocation) {
  const item = await getItemByQRCode(qrCode);
  
  if (item && item.ownerId) {
    await notifyQRScan(
      item.ownerId,
      item.id,
      scannerLocation || 'Unknown location'
    );
    
    // Log scan event
    await logScanEvent(item.id, scannerLocation);
  }
}
```

---

#### `notifyNewMessage(userId, senderName, messagePreview, chatId)`
Creates a notification for new chat messages.

**Parameters:**
- `userId` (string, required): Recipient's user ID
- `senderName` (string, required): Name of message sender
- `messagePreview` (string, required): Preview of the message
- `chatId` (string, required): Chat/conversation ID

**Returns:** Promise<string> - Notification ID

**Example:**
```javascript
import { notifyNewMessage } from '@/app/lib/notification/notification';

// Simple message notification
await notifyNewMessage(
  'user_2a3b4c5d',
  'John Doe',
  'Hello! I found your wallet',
  'chat_789'
);

// With truncated preview
const longMessage = 'This is a very long message that needs to be truncated...';
const preview = longMessage.substring(0, 50) + '...';
await notifyNewMessage('user_xyz', 'Alice Smith', preview, 'chat_456');

// Use in chat system
async function sendChatMessage(senderId, recipientId, message, chatId) {
  try {
    // Save message to database
    await saveChatMessage({
      senderId,
      recipientId,
      message,
      chatId,
      timestamp: new Date()
    });
    
    // Get sender info
    const sender = await getUserById(senderId);
    
    // Create message preview (first 100 characters)
    const preview = message.length > 100 
      ? message.substring(0, 100) + '...' 
      : message;
    
    // Notify recipient
    await notifyNewMessage(
      recipientId,
      sender.name,
      preview,
      chatId
    );
    
    console.log('Message sent and notification created');
  } catch (error) {
    console.error('Failed to send message:', error);
  }
}

// Handle multiple recipients (group chat)
async function sendGroupMessage(senderId, recipientIds, message, chatId) {
  const sender = await getUserById(senderId);
  const preview = message.substring(0, 80);
  
  // Notify all recipients except sender
  const notifications = recipientIds
    .filter(id => id !== senderId)
    .map(recipientId => 
      notifyNewMessage(recipientId, sender.name, preview, chatId)
    );
  
  await Promise.all(notifications);
}

// With emoji and formatting
await notifyNewMessage(
  'user_123',
  '🔍 Item Finder',
  '✅ Your item has been matched!',
  'chat_system'
);
```

## React Hook API

### `useNotifications(userId, options)`

**Options:**
- `autoSubscribe` (boolean): Enable real-time updates (default: true)
- `unreadOnly` (boolean): Get only unread notifications (default: false)

**Returns:**
```javascript
{
  notifications: Array,      // All notifications
  unreadCount: number,        // Count of unread
  loading: boolean,           // Loading state
  error: string | null,       // Error message
  markAsRead: Function,       // Mark single as read
  markAllAsRead: Function,    // Mark all as read
  deleteNotification: Function, // Delete notification
  sendNotification: Function, // Create notification
  refresh: Function,          // Manual refresh
}
```

**Example:**
```javascript
'use client';

import { useNotifications } from '@/app/lib/notification/useNotifications';
import { useUser } from '@clerk/nextjs';

// Basic usage
function NotificationList() {
  const { user } = useUser();
  const { notifications, unreadCount, loading, error } = useNotifications(user?.id);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h2>Notifications ({unreadCount} unread)</h2>
      {notifications.map(notif => (
        <div key={notif.id}>{notif.title}</div>
      ))}
    </div>
  );
}

// With all features
function AdvancedNotifications() {
  const { user } = useUser();
  const {
    notifications,
    unreadCount,
    loading,
    error,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    sendNotification,
    refresh
  } = useNotifications(user?.id, { autoSubscribe: true });

  const handleNotificationClick = async (notif) => {
    if (!notif.read) {
      await markAsRead(notif.id);
    }
    if (notif.link) {
      window.location.href = notif.link;
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Delete this notification?')) {
      await deleteNotification(id);
    }
  };

  const sendTestNotification = async () => {
    await sendNotification({
      userId: user.id,
      type: 'system',
      title: 'Test Notification',
      message: 'This is a test',
      priority: 'low'
    });
  };

  return (
    <div>
      <div className="header">
        <h2>Notifications ({unreadCount})</h2>
        <button onClick={markAllAsRead}>Clear All</button>
        <button onClick={refresh}>Refresh</button>
        <button onClick={sendTestNotification}>Test</button>
      </div>

      {loading && <div>Loading...</div>}
      {error && <div className="error">{error}</div>}

      <div className="notification-list">
        {notifications.map(notif => (
          <div 
            key={notif.id}
            className={notif.read ? 'read' : 'unread'}
            onClick={() => handleNotificationClick(notif)}
          >
            <h3>{notif.title}</h3>
            <p>{notif.message}</p>
            <small>{notif.createdAt?.toLocaleString()}</small>
            <button onClick={(e) => {
              e.stopPropagation();
              handleDelete(notif.id);
            }}>
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// Unread only mode
function UnreadNotifications() {
  const { user } = useUser();
  const { notifications, loading } = useNotifications(user?.id, { 
    unreadOnly: true 
  });

  return (
    <div>
      <h3>Unread Messages</h3>
      {loading ? (
        <p>Loading...</p>
      ) : notifications.length === 0 ? (
        <p>No unread notifications</p>
      ) : (
        notifications.map(n => <div key={n.id}>{n.title}</div>)
      )}
    </div>
  );
}

// Without auto-subscribe (manual refresh)
function ManualNotifications() {
  const { user } = useUser();
  const { 
    notifications, 
    refresh, 
    loading 
  } = useNotifications(user?.id, { autoSubscribe: false });

  return (
    <div>
      <button onClick={refresh} disabled={loading}>
        {loading ? 'Loading...' : 'Refresh Notifications'}
      </button>
      <div>{notifications.length} notifications</div>
    </div>
  );
}

// Notification badge component
function NotificationBadge() {
  const { user } = useUser();
  const { unreadCount } = useNotifications(user?.id);

  if (unreadCount === 0) return <BellIcon />;

  return (
    <div className="relative">
      <BellIcon />
      <span className="badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
    </div>
  );
}
```

## Usage Examples

### Example 1: Item Found Notification

```javascript
import { createNotification, NOTIFICATION_TYPES } from '@/app/lib/notification/notification';

async function notifyUserItemFound(userId, item) {
  await createNotification({
    userId,
    type: NOTIFICATION_TYPES.ITEM_FOUND,
    title: 'Your Item Was Found!',
    message: `Great news! Someone found your ${item.name}`,
    data: { 
      itemId: item.id,
      foundBy: item.foundBy,
      location: item.location 
    },
    link: `/found/${item.id}`,
    priority: 'high'
  });
}
```

### Example 2: Real-time Notification Badge

```javascript
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
          {unreadCount}
        </span>
      )}
    </div>
  );
}
```

### Example 3: Bulk Notifications

```javascript
import { bulkCreateNotifications, NOTIFICATION_TYPES } from '@/app/lib/notification/notification';

async function notifyAllUsers(userIds, message) {
  const notifications = userIds.map(userId => ({
    userId,
    type: NOTIFICATION_TYPES.SYSTEM,
    title: 'System Announcement',
    message,
    priority: 'medium'
  }));

  await bulkCreateNotifications(notifications);
}
```

### Example 4: QR Code Scan Alert

```javascript
import { notifyQRScan } from '@/app/lib/notification/notification';

async function handleQRScan(itemId, ownerId, location) {
  try {
    await notifyQRScan(ownerId, itemId, location);
    console.log('Owner notified of QR scan');
  } catch (error) {
    console.error('Failed to send notification:', error);
  }
}
```

## Firebase Setup

### Firestore Rules (add to firestore.rules)

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /notifications/{notificationId} {
      // Users can read their own notifications
      allow read: if request.auth != null && 
                     resource.data.userId == request.auth.uid;
      
      // Users can create notifications (or use admin SDK)
      allow create: if request.auth != null;
      
      // Users can update/delete their own notifications
      allow update, delete: if request.auth != null && 
                               resource.data.userId == request.auth.uid;
    }
  }
}
```

### Firestore Indexes

Create composite indexes in Firebase Console:
1. Collection: `notifications`
   - Fields: `userId` (Ascending), `read` (Ascending), `createdAt` (Descending)
2. Collection: `notifications`
   - Fields: `userId` (Ascending), `type` (Ascending), `createdAt` (Descending)

## Best Practices

1. **Always use NOTIFICATION_TYPES constants** for type safety
2. **Include meaningful data objects** for context
3. **Set appropriate priority levels** for user experience
4. **Use helper functions** for common notification patterns
5. **Subscribe to real-time updates** for live notification badge
6. **Handle errors gracefully** with try-catch blocks
7. **Clean up old notifications** periodically
8. **Use links** to navigate users to relevant content

## Error Handling

```javascript
import { createNotification } from '@/app/lib/notification/notification';
import toast from 'react-hot-toast';

async function sendNotificationSafely(notifData) {
  try {
    const id = await createNotification(notifData);
    toast.success('Notification sent!');
    return id;
  } catch (error) {
    console.error('Notification error:', error);
    toast.error('Failed to send notification');
    return null;
  }
}
```

## Performance Tips

- Use `limitCount` to avoid fetching too many notifications
- Use `unreadOnly` filter when showing notification badges
- Unsubscribe from real-time listeners when components unmount
- Use bulk operations for multiple notifications
- Implement pagination for large notification lists

## Migration Guide

If you have existing notification code:

```javascript
// Old way
const notifications = await fetch('/api/notifications');

// New way
import { getNotifications } from '@/app/lib/notification/notification';
const notifications = await getNotifications(userId);
```
