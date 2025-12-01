# Chrome Web Push Notifications - Setup Guide

Your project already has Chrome web push notifications implemented using Firebase Cloud Messaging (FCM). Here's how to use and test them:

## ✅ What's Already Set Up

1. **Firebase Cloud Messaging (FCM)** - Configured with service workers
2. **PushNotificationProvider** - React context for managing notifications
3. **Service Worker** - `public/firebase-messaging-sw.js` handles background notifications
4. **Notification API Integration** - Request permissions and display notifications

## 🚀 How to Use Push Notifications

### For Users

The notification permission is automatically requested when users visit your app. They can also:

1. Click the notification bell icon in the navigation bar
2. Enable/disable notifications from their profile settings
3. Receive notifications even when the browser is in the background

### For Developers

#### 1. Send a notification to a user:

```javascript
import { createNotification } from '@/app/lib/notification/notification';

await createNotification({
  userId: 'user-clerk-id',
  type: 'message',
  title: 'New Message',
  message: 'You have a new chat message',
  link: '/chats',
  priority: 'high',
  sendPush: true // Enable push notification
});
```

#### 2. Request notification permission manually:

```javascript
import { usePushNotifications } from '@/app/lib/notification/PushNotificationProvider';

function MyComponent() {
  const { subscribe, isSupported } = usePushNotifications();
  
  const handleEnableNotifications = async () => {
    if (isSupported) {
      await subscribe();
    }
  };
  
  return <button onClick={handleEnableNotifications}>Enable Notifications</button>;
}
```

#### 3. Check notification status:

```javascript
const { isSubscribed, permission } = usePushNotifications();

// isSubscribed: boolean - Is user subscribed to push notifications
// permission: 'default' | 'granted' | 'denied'
```

## 🔧 Configuration

### Environment Variables Required

Make sure these are set in your `.env.local`:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Firebase VAPID Key (for push notifications)
NEXT_PUBLIC_FIREBASE_VAPID_KEY=your_vapid_key
```

### Get VAPID Key from Firebase

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to **Project Settings** → **Cloud Messaging**
4. Under **Web Push certificates**, generate or copy your VAPID key
5. Add it to your `.env.local` file

## 📱 Testing Push Notifications

### Test Pages Available

1. **Push Test Page**: `/push-test` - Basic push notification testing
2. **Notification Test**: `/notification-test` - Advanced notification testing
3. **Notifications Demo**: `/notifications-demo` - Full demo with examples

### Manual Testing Steps

1. **Open your app in Chrome**
2. **Allow notifications** when prompted (or click the bell icon)
3. **Go to `/push-test`** page
4. **Click "Send Test Notification"**
5. **You should see a notification** even if you switch tabs

### Testing Background Notifications

1. Open your app and enable notifications
2. Open a different tab or minimize the browser
3. Send a notification using the API or test page
4. You should receive a native Chrome notification

## 🔍 Debugging

### Check Service Worker Status

1. Open Chrome DevTools (F12)
2. Go to **Application** tab
3. Check **Service Workers** section
4. Verify `firebase-messaging-sw.js` is active

### Check Notification Permission

```javascript
console.log('Permission:', Notification.permission);
// Should be 'granted' if enabled
```

### Check if Subscribed

```javascript
navigator.serviceWorker.ready.then(registration => {
  registration.pushManager.getSubscription().then(subscription => {
    console.log('Subscription:', subscription);
  });
});
```

### Common Issues

#### "Notifications not working"
- Check if notification permission is granted in browser settings
- Verify VAPID key is correctly set in environment variables
- Check browser console for errors

#### "Service worker not registering"
- Make sure you're testing on HTTPS or localhost
- Clear browser cache and reload
- Check if service worker file exists at `/firebase-messaging-sw.js`

#### "Permission denied"
- User must manually allow notifications
- Check site settings in Chrome: `chrome://settings/content/notifications`
- Reset permission: Click padlock icon in address bar → Site settings → Notifications

## 🎯 Features

### Current Implementation

✅ **Foreground Notifications** - Shown as toast when app is open
✅ **Background Notifications** - Native Chrome notifications when app is closed
✅ **Notification Actions** - Open/Dismiss buttons in notifications
✅ **Notification Storage** - All notifications stored in Firestore
✅ **Notification History** - Users can view past notifications
✅ **Auto-subscription** - Automatically subscribes when permission granted
✅ **Multi-device Support** - Works across different devices/browsers

### Notification Types Supported

- `item_found` - When an item is found
- `item_lost` - When an item is lost
- `match_found` - When a match is found for lost/found items
- `message` - New chat messages
- `system` - System announcements
- `qr_scan` - QR code scanned
- `item_claimed` - Item claimed by owner
- `verification` - Account verification updates

## 📊 Usage in Your Code

### Example: Notify user when someone messages them

```javascript
// In your chat component
import { createNotification, NOTIFICATION_TYPES } from '@/app/lib/notification/notification';

const sendMessage = async (chatId, message, recipientUserId) => {
  // Send the message...
  
  // Notify the recipient
  await createNotification({
    userId: recipientUserId,
    type: NOTIFICATION_TYPES.MESSAGE,
    title: 'New Message',
    message: `New message: ${message.substring(0, 50)}...`,
    link: `/chats/${chatId}`,
    data: { chatId },
    priority: 'high',
    sendPush: true
  });
};
```

### Example: Notify post owner when item is found

```javascript
await createNotification({
  userId: postOwnerId,
  type: NOTIFICATION_TYPES.ITEM_FOUND,
  title: 'Potential Match Found!',
  message: `Someone may have found your ${itemTitle}`,
  link: `/found/${foundPostId}`,
  data: { 
    postId: lostPostId,
    matchId: foundPostId 
  },
  priority: 'high',
  sendPush: true
});
```

## 🔐 Security

- FCM handles authentication and encryption
- Only authenticated users (via Clerk) can receive notifications
- Service worker verifies origin before showing notifications
- VAPID key ensures notifications come from your server

## 📝 API Endpoint

Send push notifications via API:

```javascript
// POST /api/push/send
const response = await fetch('/api/push/send', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId: 'clerk-user-id',
    title: 'Notification Title',
    body: 'Notification body text',
    url: '/link-to-open',
    data: { customKey: 'customValue' }
  })
});
```

## 🎨 UI Components

### NotificationToggleButton

```javascript
import NotificationToggleButton from '@/components/notifications/NotificationToggleButton';

<NotificationToggleButton />
```

Shows a button to enable/disable notifications with visual feedback.

## ✨ Next Steps

1. **Test notifications** on your local environment
2. **Verify VAPID key** is set correctly
3. **Test on production** (requires HTTPS)
4. **Customize notification UI** in service worker if needed
5. **Add notification preferences** for users to control what they receive

---

**Your push notifications are ready to use!** 🎉

Just make sure the VAPID key is configured, and users allow notifications when prompted.
