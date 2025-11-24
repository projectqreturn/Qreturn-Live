# PWA Setup Guide for Qreturn

This guide explains how to complete the PWA setup and configure push notifications for your Qreturn app.

## ✅ What's Already Done

Your app now includes:
- ✅ PWA configuration with `next-pwa`
- ✅ Web App Manifest (`/public/manifest.json`)
- ✅ Service Worker with push notification support
- ✅ Install prompt component
- ✅ Push notification utilities
- ✅ API endpoints for subscription management
- ✅ Updated layouts with PWA metadata

## 🎨 Step 1: Create App Icons

You need to create icon images in the following sizes and place them in the `/public/icons/` directory:

Required icon sizes (using project icon filenames):
- 100x100 → `/public/icons/100.png`
- 128x128 → `/public/icons/128.png`
- 144x144 → `/public/icons/144.png`
- 152x152 → `/public/icons/152.png`
- 167x167 → `/public/icons/167.png`
- 192x192 → `/public/icons/192.png`
- 256x256 → `/public/icons/256.png`
- 512x512 → `/public/icons/512.png`

### Easy Way to Generate Icons:

1. **Online Tools:**
   - Use https://realfavicongenerator.net/
   - Use https://www.pwabuilder.com/imageGenerator
   - Upload your logo and download all required sizes

2. **Using a Script:**
   ```bash
   npm install -g pwa-asset-generator
   pwa-asset-generator logo.png public/icons --icon-only
   ```

## 🔐 Step 2: Generate VAPID Keys

VAPID keys are required for push notifications. Generate them using the web-push package:

```bash
npx web-push generate-vapid-keys
```

This will output something like:
```
=======================================
Public Key:
BFxG...your-public-key...xyz

Private Key:
abc...your-private-key...123
=======================================
```

## 🔧 Step 3: Configure Environment Variables

Create or update your `.env.local` file with the VAPID keys:

```env
# VAPID Keys for Push Notifications
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your-public-key-here
VAPID_PRIVATE_KEY=your-private-key-here
VAPID_EMAIL=mailto:your-email@example.com
```

**Important:** 
- The public key needs `NEXT_PUBLIC_` prefix (it's used in the browser)
- The private key should NOT have the prefix (server-only)
- Never commit `.env.local` to version control

## 💾 Step 4: Set Up Database for Subscriptions

You need to store push subscriptions in your database. Here's the recommended schema:

### MongoDB Example:

```javascript
// Create a collection: pushSubscriptions
{
  userId: String,           // Clerk user ID
  endpoint: String,         // Push subscription endpoint
  keys: {
    p256dh: String,        // Encryption key
    auth: String           // Auth secret
  },
  createdAt: Date,
  updatedAt: Date
}

// Create indexes:
db.pushSubscriptions.createIndex({ userId: 1 })
db.pushSubscriptions.createIndex({ endpoint: 1 })
```

### Update the API Routes:

1. **`/src/app/api/push/subscribe/route.js`**
   - Uncomment the database code
   - Add your database connection logic

2. **`/src/app/api/push/send/route.js`**
   - Uncomment the database query code
   - Implement subscription retrieval logic

Example implementation:

```javascript
// In subscribe/route.js
import { auth } from '@clerk/nextjs';
import clientPromise from '@/lib/db';

export async function POST(request) {
  const { userId } = auth();
  const subscription = await request.json();
  
  const client = await clientPromise;
  const db = client.db('qreturn');
  
  await db.collection('pushSubscriptions').updateOne(
    { userId },
    { 
      $set: {
        userId,
        endpoint: subscription.endpoint,
        keys: subscription.keys,
        updatedAt: new Date()
      },
      $setOnInsert: {
        createdAt: new Date()
      }
    },
    { upsert: true }
  );
  
  return NextResponse.json({ success: true });
}
```

## 📱 Step 5: Add Notification Button to Your App

Add the notification enable button wherever you want users to opt-in:

```jsx
import PushNotificationButton from '@/components/pwa/PushNotificationButton';

// In your settings page or profile page
<PushNotificationButton />
```

## 🚀 Step 6: Build and Test

1. **Build the app:**
   ```bash
   npm run build
   ```

2. **Run in production mode:**
   ```bash
   npm run start
   ```

3. **Test the PWA:**
   - Open Chrome/Edge DevTools
   - Go to Application tab → Manifest
   - Verify manifest is loaded correctly
   - Check Service Workers tab
   - Try the "Add to Home Screen" prompt

## 📤 Step 7: Sending Push Notifications

### From Your Backend:

```javascript
// Send notification to a specific user
const response = await fetch('/api/push/send', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId: 'user_123',
    title: 'Item Found!',
    body: 'Someone found your lost item',
    url: '/myitems/123'
  })
});
```

### Example Use Cases:

1. **When someone finds a lost item:**
```javascript
// In your item matching logic
await fetch('/api/push/send', {
  method: 'POST',
  body: JSON.stringify({
    userId: lostItemOwner.id,
    title: 'Great News!',
    body: `Someone found your ${item.name}`,
    url: `/post/${item.id}`
  })
});
```

2. **Chat notifications:**
```javascript
// When someone sends a message
await fetch('/api/push/send', {
  method: 'POST',
  body: JSON.stringify({
    userId: recipientId,
    title: 'New Message',
    body: `${senderName}: ${messagePreview}`,
    url: `/chat/${chatId}`
  })
});
```

## 🔍 Testing Push Notifications

### Test in Browser:

1. Open your app in Chrome/Edge
2. Click "Enable Notifications" button
3. Grant permission when prompted
4. Open DevTools → Application → Push Messaging
5. Click "Send test notification"

### Test from API:

```bash
curl -X POST http://localhost:3000/api/push/send \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Notification",
    "body": "This is a test from the API",
    "url": "/"
  }'
```

## 📋 Checklist

- [ ] Created all required icon sizes
- [ ] Generated VAPID keys
- [ ] Added environment variables
- [ ] Set up database schema for subscriptions
- [ ] Updated API routes with database logic
- [ ] Added notification button to UI
- [ ] Built and tested the app
- [ ] Tested install prompt
- [ ] Tested push notifications
- [ ] Tested on mobile devices

## 🌐 Deployment Notes

### Vercel/Netlify:
1. Add environment variables in the dashboard
2. Ensure service worker is not blocked
3. HTTPS is required for PWA features

### Custom Server:
1. Ensure HTTPS is enabled
2. Configure proper CORS headers
3. Set up firewall rules for push service

## 📱 Platform-Specific Notes

### iOS (Safari):
- Install prompt shows different UI
- Uses native "Add to Home Screen" flow
- Push notifications supported in iOS 16.4+
- Requires HTTPS

### Android (Chrome):
- Native install prompt
- Full push notification support
- Best PWA experience

### Desktop:
- Supported in Chrome, Edge, Opera
- Install as standalone app
- Full feature parity

## 🐛 Troubleshooting

### Service Worker Not Registering:
- Check browser console for errors
- Verify HTTPS is enabled
- Clear cache and hard reload

### Push Notifications Not Working:
- Verify VAPID keys are correct
- Check notification permissions
- Ensure subscription is saved to database
- Test with DevTools

### Install Prompt Not Showing:
- Must meet PWA criteria (HTTPS, manifest, service worker)
- User must interact with the page first
- May not show if previously dismissed

## 📚 Additional Resources

- [PWA Documentation](https://web.dev/progressive-web-apps/)
- [Push API Guide](https://web.dev/push-notifications-overview/)
- [Next.js PWA Guide](https://github.com/shadowwalker/next-pwa)
- [Web Push Protocol](https://developers.google.com/web/fundamentals/push-notifications)

## 🔄 Updating the App

When you update your app:
1. Increment version in `manifest.json`
2. Service worker will auto-update
3. Users will see "Update available" prompt
4. Clicking refresh will load new version

---

**Need help?** Check the console logs for detailed error messages and debugging information.
