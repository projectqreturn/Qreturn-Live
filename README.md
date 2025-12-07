<div align="center">
  <h1>🔍 Qreturn</h1>
  <p><strong>AI-Powered Lost & Found Platform with QR Technology</strong></p>
  
  [![Next.js](https://img.shields.io/badge/Next.js-15.2-black?logo=next.js)](https://nextjs.org/)
  [![React](https://img.shields.io/badge/React-19-blue?logo=react)](https://react.dev/)
  [![MongoDB](https://img.shields.io/badge/MongoDB-6.16-green?logo=mongodb)](https://www.mongodb.com/)
  [![Firebase](https://img.shields.io/badge/Firebase-12.5-orange?logo=firebase)](https://firebase.google.com/)
  [![PWA](https://img.shields.io/badge/PWA-Enabled-purple?logo=pwa)](https://web.dev/progressive-web-apps/)
</div>

---

## 📋 Table of Contents

- [About](#about)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Environment Setup](#environment-setup)
- [Project Structure](#project-structure)
- [Key Functionalities](#key-functionalities)
- [API Documentation](#api-documentation)
- [PWA & Offline Support](#pwa--offline-support)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

---

## 🎯 About

**Qreturn** is a comprehensive Progressive Web App (PWA) that revolutionizes the lost and found experience by combining:
- 🤖 **AI-powered image matching** for automatic lost/found item detection
- 📱 **QR code technology** for quick item registration and tracking
- 📍 **Real-time location tracking** with proximity notifications (10km radius)
- 💬 **Firebase-powered chat** for seamless communication between users
- 🔔 **Push notifications** for instant match alerts and updates
- 🌐 **Offline-first architecture** for uninterrupted service

Perfect for communities, universities, airports, and public spaces to help reunite people with their belongings.

### UI Design
View our complete design system on Figma:  
🎨 [Qreturn UI Design](https://www.figma.com/design/tddoz6eIpAtMybtPLTzzuQ/Qreturn?node-id=0-1&t=y2DfyFVWUeblQfNg-1)

---

## ✨ Features

### 🔐 User Management
- **Secure Authentication**: Powered by Clerk with email/social login
- **Profile Management**: User verification with NIC/ID upload
- **Location Tracking**: Automatic GPS tracking (updates every 50+ meters)
- **Account Dashboard**: View all posts, items, and activity history

### 📝 Post Management
- **Lost Item Posts**: Create detailed lost item reports with photos
- **Found Item Posts**: Report found items with image upload
- **AI Image Matching**: Automatic matching via external ML API
- **QR Code Generation**: Generate unique QR codes for personal items
- **Protected QR Scanning**: Scan and report found items instantly
- **Category System**: Organize by Electronics, Documents, Accessories, etc.
- **District-based Search**: Filter items by geographical location

### 🔍 Search & Discovery
- **Visual Search**: Upload image to find similar lost/found items
- **Smart Filtering**: Search by category, date, location, and keywords
- **Map View**: Interactive map showing lost/found items with GPS markers
- **Proximity Alerts**: Get notified when items are reported nearby (10km radius)

### 💬 Communication
- **Real-time Chat**: Firebase-powered messaging between users
- **In-app Notifications**: Instant alerts for matches, messages, and updates
- **Push Notifications**: Stay updated even when app is closed
- **Email Notifications**: Fallback for critical updates

### 📱 PWA Features
- **Installable**: Add to home screen on mobile/desktop
- **Offline Support**: Browse cached content without internet
- **Service Workers**: Smart caching for instant loading
- **Push Notifications**: Native-like notification experience
- **Responsive Design**: Seamless experience across all devices

### 🛡️ Safety & Moderation
- **Post Reporting**: Flag inappropriate or suspicious content
- **Admin Dashboard**: Moderate posts and manage user reports
- **Account Verification**: Optional ID verification for trusted users
- **Contact Forms**: Support and inquiry system

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: [Next.js 15](https://nextjs.org/) (App Router, React 19, Server Actions)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) with dark mode
- **UI Components**: [Lucide React](https://lucide.dev/), [Heroicons](https://heroicons.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Maps**: [Google Maps React API](https://www.npmjs.com/package/@react-google-maps/api)
- **QR Codes**: [qrcode.react](https://www.npmjs.com/package/qrcode.react)
- **Image Upload**: [Cloudinary](https://cloudinary.com/)
- **PWA**: [next-pwa](https://www.npmjs.com/package/next-pwa)

### Backend
- **Runtime**: Node.js with Next.js API Routes
- **Database**: [MongoDB](https://www.mongodb.com/) with [Mongoose](https://mongoosejs.com/) ODM
- **Real-time**: [Firebase](https://firebase.google.com/) (Firestore, FCM)
- **Authentication**: [Clerk](https://clerk.com/)
- **Image Processing**: [browser-image-compression](https://www.npmjs.com/package/browser-image-compression)
- **External ML API**: Custom FastAPI server for AI image matching

### DevOps & Tools
- **Package Manager**: npm
- **Build Tool**: Turbopack (Next.js 15)
- **Version Control**: Git & GitHub
- **Deployment**: Vercel-ready
- **Analytics**: [Vercel Analytics](https://vercel.com/analytics)
- **Webhooks**: [Svix](https://www.svix.com/) for Clerk integration

---

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed:
- **Node.js**: v18 or higher
- **npm**: v9 or higher
- **Git**: Latest version
- **MongoDB**: Atlas account or local instance
- **Firebase**: Project with Firestore and FCM enabled
- **Clerk**: Account for authentication

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/projectqreturn/Qreturn-Live.git
   cd Qreturn-Live
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables** (see [Environment Setup](#environment-setup)):
   ```bash
   # Create .env.local file in root directory
   cp .env.example .env.local
   # Edit .env.local with your credentials
   ```

4. **Configure Firebase for PWA**:
   ```bash
   npm run configure-firebase
   ```

5. **Generate VAPID keys for push notifications**:
   ```bash
   npm run generate-vapid
   ```

6. **Run the development server**:
   ```bash
   npm run dev
   ```

7. **Open your browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

### Production Build

For PWA testing and production deployment:

```bash
# Build the application
npm run build

# Start production server
npm start
```

> **Note**: PWA features (install prompt, service workers, push notifications) require a production build.

---

## 🔐 Environment Setup

Create a `.env.local` file in the root directory with the following variables:

```env
# MongoDB Database
MONGODB_URL=mongodb+srv://username:password@cluster.mongodb.net/

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxx
CLERK_SECRET_KEY=sk_test_xxxxxxxxxxxxx
CLERK_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx

# Firebase (Firestore & Cloud Messaging)
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyxxxxxxxxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:xxxxxxxxxxxxx
NEXT_PUBLIC_FIREBASE_VAPID_KEY=BKxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Cloudinary (Image Hosting)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=xxxxxxxxxxxxxxxxxxxxx

# External Image API (AI Matching)
NEXT_PUBLIC_IMAGE_API_URL=http://18.136.211.184:8000

# Google Maps (Optional)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyxxxxxxxxxxxxxxxxxxxxxxxxx

# Application URL (for webhooks & redirects)
NEXT_PUBLIC_APP_URL=http://localhost:3000

# VAPID Keys (for push notifications)
NEXT_PUBLIC_VAPID_PUBLIC_KEY=BPxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
VAPID_PRIVATE_KEY=xxxxxxxxxxxxxxxxxxxxx
VAPID_EMAIL=mailto:admin@qreturn.com
```

### Getting API Keys

- **MongoDB**: [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) - Free tier available
- **Clerk**: [Clerk Dashboard](https://dashboard.clerk.com/) - Free plan includes 5,000 MAU
- **Firebase**: [Firebase Console](https://console.firebase.google.com/) - Enable Firestore & FCM
- **Cloudinary**: [Cloudinary Console](https://cloudinary.com/console) - Free tier: 25GB storage
- **Google Maps**: [Google Cloud Console](https://console.cloud.google.com/) - Enable Maps JavaScript API

---

## 📁 Project Structure

```
qreturn/
├── public/
│   ├── icons/                    # PWA app icons (PNG & SVG)
│   ├── QR/                       # QR code assets
│   ├── slider/                   # Landing page images
│   ├── manifest.json             # PWA manifest
│   ├── sw.js                     # Main service worker (auto-generated)
│   └── firebase-messaging-sw.js  # FCM service worker
│
├── src/
│   ├── app/
│   │   ├── (login)/              # Authentication pages
│   │   │   ├── sign-in/
│   │   │   └── sign-up/
│   │   │
│   │   ├── (mainapp)/            # Protected app routes
│   │   │   ├── (posts)/          # Lost/found post pages
│   │   │   │   ├── lost/
│   │   │   │   ├── found/
│   │   │   │   ├── edit-lostpost/
│   │   │   │   └── edit-foundpost/
│   │   │   ├── (user)/           # User-specific pages
│   │   │   ├── createpost/       # Create new posts
│   │   │   ├── image-search/     # Visual search
│   │   │   ├── map/              # Map view
│   │   │   ├── profile/          # User profile
│   │   │   ├── protectedqr/      # QR scanner
│   │   │   ├── reports/          # User reports
│   │   │   └── layout.js         # Protected layout
│   │   │
│   │   ├── (sub-content)/        # Public pages
│   │   │   ├── about/
│   │   │   ├── contact/
│   │   │   ├── privacy/
│   │   │   └── terms-and-conditions/
│   │   │
│   │   ├── api/                  # API routes
│   │   │   ├── contact/          # Contact form
│   │   │   ├── images/           # Image operations
│   │   │   ├── myitems/          # User items CRUD
│   │   │   ├── post/             # Post management
│   │   │   │   ├── lost/
│   │   │   │   └── found/
│   │   │   ├── push/             # Push notifications
│   │   │   │   ├── subscribe/
│   │   │   │   ├── unsubscribe/
│   │   │   │   └── send/
│   │   │   ├── report/           # Report system
│   │   │   ├── user/             # User management
│   │   │   │   └── location/
│   │   │   └── webhooks/         # External webhooks
│   │   │       └── clerk/
│   │   │
│   │   ├── lib/
│   │   │   ├── actions/          # Server actions
│   │   │   │   ├── user.action.js
│   │   │   │   ├── lostPost.action.js
│   │   │   │   ├── foundPost.action.js
│   │   │   │   ├── myitems.action.js
│   │   │   │   └── contact.action.js
│   │   │   │
│   │   │   ├── modals/           # Mongoose schemas
│   │   │   │   ├── user.modal.js
│   │   │   │   ├── lostPost.modal.js
│   │   │   │   ├── foundPost.modal.js
│   │   │   │   ├── myitems.modal.js
│   │   │   │   ├── chat.modal.js
│   │   │   │   ├── contact.modal.js
│   │   │   │   └── reportPost.modal.js
│   │   │   │
│   │   │   ├── notification/     # Notification system
│   │   │   │   ├── notification.js
│   │   │   │   ├── examples.js
│   │   │   │   └── useNotifications.js
│   │   │   │
│   │   │   ├── utils/            # Utility functions
│   │   │   │   ├── imageUpload.js
│   │   │   │   └── imageDelete.js
│   │   │   │
│   │   │   ├── db.js             # MongoDB connection
│   │   │   └── utils.js          # Helper functions
│   │   │
│   │   ├── layout.js             # Root layout
│   │   ├── page.jsx              # Landing page
│   │   └── globals.css           # Global styles
│   │
│   ├── components/
│   │   ├── appnav/               # App navigation
│   │   ├── chat/                 # Chat components
│   │   ├── createpost/           # Post creation
│   │   ├── footer/               # Footer
│   │   ├── landingpage/          # Landing page sections
│   │   ├── map/                  # Map components
│   │   ├── notifications/        # Notification UI
│   │   ├── postcard/             # Post display cards
│   │   ├── profile/              # Profile components
│   │   ├── pwa/                  # PWA-specific
│   │   │   ├── InstallPWA.jsx
│   │   │   ├── PWARegistration.jsx
│   │   │   └── PushNotificationButton.jsx
│   │   ├── LocationTracker.jsx   # Auto location tracking
│   │   └── LocationDebugger.jsx  # GPS debug tool
│   │
│   ├── firebase/
│   │   └── firebase.config.ts    # Firebase configuration
│   │
│   └── middleware.js             # Clerk route protection
│
├── scripts/
│   ├── configure-firebase-sw.js  # Firebase SW setup
│   └── fix-existing-chats.js     # DB migration script
│
├── .github/
│   └── copilot-instructions.md   # AI coding guidelines
│
├── next.config.mjs               # Next.js + PWA config
├── tailwind.config.mjs           # Tailwind configuration
├── package.json                  # Dependencies
├── firebase.json                 # Firebase config
├── firestore.rules               # Firestore security rules
└── firestore.indexes.json        # Firestore indexes
```

---

## 🔑 Key Functionalities

### 1. Authentication Flow (Clerk)

- User signs up/signs in via Clerk
- Webhook creates/syncs user in MongoDB
- Profile stored in MongoDB with location data
- Protected routes enforced by `src/middleware.js`

```javascript
// Access authenticated user
import { useUser } from '@clerk/nextjs';

const { user } = useUser();
const userId = user.id; // Clerk user ID
```

### 2. Post Creation with AI Matching

1. User uploads images to Cloudinary
2. First image sent to external ML API (`uploadMainImageToExternalApi`)
3. API returns UUID-based `searchId` for matching
4. Post saved to MongoDB with `search_Id` field
5. Background AI matching occurs (external service)


### 3. Real-time Location Tracking

- `LocationTracker` component runs automatically in protected routes
- Updates MongoDB every 50+ meters movement
- GPS stored as string: `"latitude,longitude"`
- Used for proximity notifications and map features

```javascript
// Query nearby users
import { getNearbyUsers } from '@/app/lib/actions/user.action';

const nearbyUsers = await getNearbyUsers(centerGps, radiusKm, excludeUserId);
```

### 4. Push Notification System

**Firebase Cloud Messaging** for web push:
- Tokens stored in Firestore (`users/{clerkId}/tokens`)
- Notifications stored in Firestore (`notifications` collection)
- Background handling via `firebase-messaging-sw.js`

```javascript
// Send notification
import { createNotification, NOTIFICATION_TYPES } from '@/app/lib/notification/notification';

await createNotification({
  userId: 'clerk_user_id',
  type: NOTIFICATION_TYPES.MATCH_FOUND,
  title: 'Match Found!',
  message: 'Someone found your lost wallet',
  link: '/myitems',
  sendPush: true
});
```

### 5. Dual Database Architecture

**MongoDB** (via Mongoose):
- Users, posts, items, reports, contacts
- Structured data with relationships
- Auto-incrementing IDs via `mongoose-sequence`

**Firestore** (Firebase):
- Notifications (real-time updates)
- Chat messages (real-time messaging)
- FCM tokens (push subscription management)

### 6. QR Code System

- Generate unique QR codes for personal items
- Scan QR codes to report found items
- Protected scanning (authentication required)
- Automatic owner notification via push/email

---

## 📡 API Documentation

### Authentication

All API routes use Clerk authentication. Protected routes require valid JWT token.

### Endpoints

#### Posts

```bash
# Create lost post
POST /api/post/lost
Body: { title, date, phone, Category, District, gps, description, email, photo[], clerkUserId }

# Get all lost posts
GET /api/post/lost

# Update lost post
PUT /api/post/lost?id={postId}

# Delete lost post
DELETE /api/post/lost?id={postId}

# Same endpoints for found posts
POST/GET/PUT/DELETE /api/post/found
```

#### User Management

```bash
# Get user profile
GET /api/user?clerkId={userId}

# Update user location
POST /api/user/location
Body: { clerkId, gps }

# Get nearby users
GET /api/user/location?gps={lat,lng}&radius={km}
```

#### Notifications

```bash
# Subscribe to push
POST /api/push/subscribe
Body: { subscription, userId }

# Unsubscribe from push
POST /api/push/unsubscribe
Body: { endpoint }

# Send push notification
POST /api/push/send
Body: { userId, title, body, url, data }
```

#### Reports

```bash
# Report a post
POST /api/report
Body: { postId, postType, reason, description, reporterEmail }

# Get all reports (admin)
GET /api/report

# Update report status
PUT /api/report?id={reportId}
Body: { status }
```

---

## 📱 PWA & Offline Support

### Installation

Users can install Qreturn as a standalone app:
- **Mobile**: "Add to Home Screen" prompt
- **Desktop**: Install button in address bar
- **Custom Prompt**: Appears 3 seconds after first visit

### Service Workers

**Main Service Worker** (`sw.js`):
- Caches static assets (images, CSS, JS)
- Network-first strategy for API calls
- Cache-first for images and static resources
- Offline fallback page

**Firebase Messaging SW** (`firebase-messaging-sw.js`):
- Handles background push notifications
- Displays native notifications
- Routes notification clicks to app

### Offline Capabilities

- Browse cached posts and items
- View previously loaded content
- Queue actions for sync when online
- Automatic retry for failed requests

### Caching Strategy

```javascript
// API calls: Network-first (15s timeout)
// Images: Cache-first (60 days)
// Static assets: Cache-first (1 year)
```

---

## 🚀 Deployment

### Vercel (Recommended)

1. **Connect GitHub repository** to Vercel
2. **Configure environment variables** in Vercel dashboard
3. **Deploy**:
   ```bash
   # Vercel automatically detects Next.js
   # Just push to main branch
   git push origin main
   ```

4. **Custom Domain** (optional):
   - Add domain in Vercel dashboard
   - Update DNS records
   - SSL automatically provisioned

### Environment Variables in Production

Ensure all variables from `.env.local` are added to Vercel:
- Project Settings → Environment Variables
- Add all variables (categorize as Production/Preview/Development)

### Post-Deployment Checklist

- ✅ Verify PWA manifest loads correctly
- ✅ Test service worker registration
- ✅ Confirm push notifications work
- ✅ Check MongoDB connection pooling
- ✅ Validate Clerk webhooks (use Vercel URL)
- ✅ Test image upload to Cloudinary
- ✅ Verify external AI API accessibility
- ✅ Test Firebase FCM delivery
- ✅ Check Google Maps API restrictions

---

## 🧪 Testing

### Development Testing

```bash
# Start development server
npm run dev

# Test in browser
open http://localhost:3000
```

### PWA Testing

```bash
# Build for production
npm run build

# Start production server
npm start

# Test PWA features
open http://localhost:3000
```

**Testing PWA Install**:
1. Open DevTools → Application → Service Workers
2. Check "Offline" to test offline mode
3. Use Lighthouse audit for PWA score

### Push Notification Testing

Visit test pages:
- `/push-test` - Basic push notification testing
- `/notification-test` - Advanced notification features
- `/notifications-demo` - Complete demo

---

## 🤝 Contributing

We welcome contributions! Please follow these guidelines:

### Development Process

1. **Fork the repository**
2. **Create a feature branch**:
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make your changes**
4. **Test thoroughly**
5. **Commit with conventional commits**:
   ```bash
   git commit -m "feat: add amazing feature"
   ```
6. **Push to your fork**:
   ```bash
   git push origin feature/amazing-feature
   ```
7. **Open a Pull Request**

### Commit Convention

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes (formatting)
- `refactor:` Code refactoring
- `test:` Test additions or changes
- `chore:` Build process or tooling changes

### Code Style

- Use Tailwind CSS for styling
- Follow React best practices
- Use TypeScript for type safety (where applicable)
- Write meaningful component names
- Add comments for complex logic
- Keep components small and focused

---

## 📚 Additional Documentation

- [PWA Setup Guide](PWA_SETUP_GUIDE.md) - Comprehensive PWA implementation
- [Push Notification Guide](PUSH_NOTIFICATION_GUIDE.md) - Firebase FCM setup
- [Location Notifications](LOCATION_NOTIFICATIONS_GUIDE.md) - Proximity alert system
- [PWA Implementation Summary](PWA_IMPLEMENTATION_SUMMARY.md) - Quick reference
- [Copilot Instructions](.github/copilot-instructions.md) - AI coding guidelines

---

## 🐛 Troubleshooting

### Common Issues

**1. Service Worker Not Registering**
```bash
# Clear browser cache and storage
# Rebuild the app
npm run build
npm start
```

**2. Push Notifications Not Working**
- Verify VAPID keys are correct
- Check Firebase config in `firebase-messaging-sw.js`
- Ensure HTTPS (required for web push)
- Grant notification permissions in browser

**3. MongoDB Connection Issues**
- Check `MONGODB_URL` in `.env.local`
- Verify IP whitelist in MongoDB Atlas
- Test connection string format

**4. Image Upload Failing**
- Verify Cloudinary credentials
- Check image size limits
- Ensure external API is accessible

**5. Location Tracking Not Working**
- Allow location permissions in browser
- Check HTTPS (required for geolocation API)
- Test on physical device (more accurate)

### Debug Tools

- `LocationDebugger` component - Visualize GPS data
- Browser DevTools → Application → Service Workers
- Firebase Console → Cloud Messaging → Reports
- MongoDB Compass - Database GUI

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 👥 Team

**Qreturn** is developed and maintained by the Project Qreturn team.

- **GitHub**: [projectqreturn](https://github.com/projectqreturn)
- **Repository**: [Qreturn-Live](https://github.com/projectqreturn/Qreturn-Live)

---

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - The React framework
- [Clerk](https://clerk.com/) - Authentication platform
- [Firebase](https://firebase.google.com/) - Real-time backend
- [MongoDB](https://www.mongodb.com/) - Database
- [Cloudinary](https://cloudinary.com/) - Image hosting
- [Vercel](https://vercel.com/) - Deployment platform
- [Tailwind CSS](https://tailwindcss.com/) - Styling framework

---

## 📞 Support

For support, questions, or feature requests:

- 📧 Email: support@qreturn.com
- 🐛 Issues: [GitHub Issues](https://github.com/projectqreturn/Qreturn-Live/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/projectqreturn/Qreturn-Live/discussions)

---

<div align="center">
  <p>Made with ❤️ by the Qreturn Team</p>
  <p>⭐ Star us on GitHub if you find this project helpful!</p>
</div>