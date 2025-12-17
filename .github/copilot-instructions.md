# Qreturn - AI Coding Agent Instructions

## Project Overview
Qreturn is a **Next.js 15 PWA** for lost & found items using QR codes, AI image matching, and real-time location tracking. Users post lost/found items, receive notifications when matches are detected via external ML API, and communicate through Firebase-powered chat.

## Architecture & Stack

### Core Technologies
- **Framework**: Next.js 15 (App Router, React 19, Server Actions)
- **Auth**: Clerk (middleware at `src/middleware.js`, routes protected via `clerkMiddleware`)
- **Database**: MongoDB with Mongoose (connection pooling in `src/app/lib/db.js`)
- **Real-time**: Firebase (Firestore for notifications/chat, FCM for push)
- **Styling**: Tailwind CSS with dark mode default (`darkMode: 'class'`)
- **PWA**: `next-pwa` with custom service workers (`public/sw.js`, `public/firebase-messaging-sw.js`)

### Key Architecture Patterns
1. **Dual Storage**: MongoDB for posts/users, Firestore for real-time features (notifications, chat)
2. **External ML API**: Image uploads go to `http://18.136.211.184:8000` for visual search (lost/found matching)
3. **Location-First**: Auto-tracking via `LocationTracker` component, stored in MongoDB User model
4. **Server Actions**: Use `"use server"` in `src/app/lib/actions/*.js` for database operations
5. **API Routes**: All in `src/app/api/`, handle webhooks, reports, posts, push notifications

## Development Workflow

### Running the App
```bash
npm run dev          # Dev server with Turbopack
npm run build        # Production build (ESLint disabled in next.config.mjs)
npm start            # Production server (required for PWA testing)
```

### Environment Variables (Required)
```env
# MongoDB
MONGODB_URL=mongodb+srv://...

# Clerk Auth
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...

# Firebase (for push notifications & chat)
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_VAPID_KEY=...  # For web push

# External Image API
NEXT_PUBLIC_IMAGE_API_URL=http://18.136.211.184:8000

# Cloudinary (image hosting)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=...
```

### Key Scripts
- `npm run configure-firebase`: Configure service worker (see `scripts/configure-firebase-sw.js`)
- `npm run generate-vapid`: Generate Firebase VAPID keys for push

## Code Conventions

### File Structure
- **Routes**: `src/app/(mainapp)/` for authenticated pages, `src/app/(login)/` for auth, `src/app/(sub-content)/` for public pages
- **Models**: `src/app/lib/modals/*.modal.js` (Mongoose schemas with auto-increment for posts)
- **Actions**: `src/app/lib/actions/*.action.js` (server actions, always use `"use server"`)
- **Components**: `src/components/` organized by feature (appnav, chat, profile, pwa, etc.)

### Mongoose Models
All post models (`lostPost.modal.js`, `foundPost.modal.js`) use:
- `mongoose-sequence` for auto-incrementing IDs (`lostPostId`, `foundPostId`)
- Cached model pattern: `models?.LostPost || model("LostPost", LostPostSchema)`
- Required fields: `title, date, phone, Category, District, gps, description, email`
- `search_Id`: UUID-based identifier from external API for image matching

### Authentication (Clerk)
- Access user: `import { useUser } from '@clerk/nextjs'; const { user } = useUser();`
- User ID: `user.id` (clerkUserId in MongoDB)
- Protected routes: Add to `isProtectedRoute` in `src/middleware.js`
- Webhooks: `src/app/api/webhooks/clerk/route.js` syncs Clerk users to MongoDB

### Database Operations
```javascript
// Always connect first
import { connect } from "@/app/lib/db";
await connect();

// Use cached models (avoid re-initialization)
import LostPost from "@/app/lib/modals/lostPost.modal";
const posts = await LostPost.find({ clerkUserId: userId });
```

### Notifications System
```javascript
import { createNotification, NOTIFICATION_TYPES } from '@/app/lib/notification/notification';

// Firebase-based notifications with optional push
await createNotification({
  userId: user.id,           // Clerk user ID
  type: NOTIFICATION_TYPES.MATCH_FOUND,
  title: 'Match Found!',
  message: 'Your lost item may have been found',
  link: '/myitems',
  priority: 'high',
  sendPush: true             // Triggers FCM push
});
```
**Storage**: Firestore collection `notifications`, **NOT** MongoDB

### Image Upload Flow
1. Upload to Cloudinary (client-side)
2. Call `uploadMainImageToExternalApi(cloudinaryUrl, 'lost'|'found')` in API route
3. External API returns UUID-based `searchId` (stored in post's `search_Id` field)
4. On match detection, external API notifies via webhook (if configured)
5. Use `deleteImageFromExternalApi(searchId, postType)` when deleting posts

### Location Tracking
- `LocationTracker` component in `(mainapp)/layout.js` auto-tracks every 50+ meters
- Stores as string: `"latitude,longitude"` in User model's `gps` field
- Query nearby users: `getNearbyUsers(centerGps, radiusKm, excludeClerkId)`

## PWA & Push Notifications

### Service Workers
- **Main SW**: `public/sw.js` (generated by next-pwa, handles offline/caching)
- **Firebase SW**: `public/firebase-messaging-sw.js` (handles FCM push in background)
- **Registration**: `PWARegistration` component in root layout

### Push Notification Setup
1. User grants permission → FCM token obtained via `requestFCMToken(vapidKey)`
2. Token stored in Firestore `users/{clerkId}/tokens` subcollection
3. Send via `/api/push/send` endpoint (server-side web-push or FCM Admin SDK)
4. Subscribe/unsubscribe: `/api/push/subscribe` & `/api/push/unsubscribe`

### Testing PWA Features
- **Must use production build**: `npm run build && npm start`
- Install prompt: Appears 3 seconds after visit (InstallPWA component)
- Test pages: `/push-test`, `/notification-test`, `/notifications-demo`

## Common Tasks

### Adding a New Post Type
1. Create model in `src/app/lib/modals/` with auto-increment plugin
2. Add action in `src/app/lib/actions/` with `"use server"`
3. Create API route in `src/app/api/post/` with GET/POST/PUT/DELETE exports
4. Add form in `src/app/(mainapp)/` route
5. Update image API integration if images involved

### Adding Protected Route
Edit `src/middleware.js`:
```javascript
const isProtectedRoute = createRouteMatcher([
  "/your-new-route(.*)",  // Add here
]);
```

### Querying Across Databases
**MongoDB** (users, posts, items) via Mongoose actions  
**Firestore** (notifications, chat) via Firebase SDK directly in API routes/components

### Debugging Location Issues
Use `LocationDebugger` component (import from `@/components/LocationDebugger`) to visualize GPS data

## Important Gotchas

1. **ESLint disabled in builds**: `ignoreDuringBuilds: true` in `next.config.mjs`
2. **Image domains**: Add new CDN domains to `next.config.mjs` → `images.domains`
3. **Service worker conflicts**: Clear browser cache/storage when testing SW changes
4. **MongoDB connection**: Uses global caching (`global.mongoose`), never create multiple connections
5. **Firebase config**: Hardcoded in `public/firebase-messaging-sw.js` (not env vars due to SW limitations)
6. **External API timeouts**: Set to 10-15s, posts still create if API fails (graceful degradation)
7. **Auto-increment IDs**: Require separate sequences per model, see `mongoose-sequence` usage
8. **Dark mode**: Enforced via `<html lang="en" className="dark">`, components assume dark theme

## Reference Files
- **Auth flow**: `src/middleware.js`, `src/app/api/webhooks/clerk/route.js`
- **Post creation**: `src/app/api/post/lost/route.js` (comprehensive example with all integrations)
- **Notification examples**: `src/app/lib/notification/examples.js`
- **Database helpers**: `src/app/lib/db.js`, `src/app/lib/actions/*.action.js`
- **PWA setup**: `PWA_IMPLEMENTATION_SUMMARY.md`, `PUSH_NOTIFICATION_GUIDE.md`
