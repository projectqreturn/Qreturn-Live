# Quick Start: Generating VAPID Keys and Icons

## Generate VAPID Keys (Required for Push Notifications)

Run this command in your terminal:

```bash
npx web-push generate-vapid-keys
```

You'll get output like this:
```
=======================================
Public Key:
BFxG...your-public-key...xyz

Private Key:
abc...your-private-key...123
=======================================
```

## Add to Environment Variables

Create `.env.local` file in your project root:

```env
# Copy your keys here
NEXT_PUBLIC_VAPID_PUBLIC_KEY=paste-your-public-key-here
VAPID_PRIVATE_KEY=paste-your-private-key-here
VAPID_EMAIL=mailto:your-email@qreturn.com
```

## Generate App Icons

### Option 1: Online Tool (Easiest)
1. Go to https://www.pwabuilder.com/imageGenerator
2. Upload your logo (ideally 512x512 PNG with transparent background)
3. Download the generated icon pack
4. Extract to `/public/icons/` folder

### Option 2: Using PWA Asset Generator
```bash
# Install globally
npm install -g pwa-asset-generator

# Generate icons (have a logo.png ready in your project root)
pwa-asset-generator logo.png public/icons --icon-only --background "#000000"
```

### Option 3: Manual Creation
Use any image editor (Photoshop, GIMP, Figma) to create these sizes:

Save them all as PNG in `/public/icons/` with names like `icon-192x192.png`
Use any image editor (Photoshop, GIMP, Figma) to create these sizes used in this project:
- 100x100, 128x128, 144x144, 152x152, 167x167, 192x192, 256x256, 512x512

Save them as PNG in `/public/icons/` with filenames: `100.png`, `128.png`, `144.png`, `152.png`, `167.png`, `192.png`, `256.png`, `512.png`
## Verify Everything Works

```bash
# 1. Build the app
npm run build

# 2. Start production server
npm run start

# 3. Open in browser
# http://localhost:3000

# 4. Open DevTools (F12)
# Go to Application tab → Manifest
# Verify all icons appear correctly
```

## Quick Test Push Notifications

After setting up VAPID keys:

1. Click "Enable Notifications" button in your app
2. Grant permission when browser asks
3. You should see a welcome notification

Test from code:
```javascript
import { showLocalNotification } from '@/lib/utils/pushNotifications';

// Anywhere in your app
await showLocalNotification('Test', { 
  body: 'This is working!' 
});
```

## Next Steps

See `PWA_SETUP_GUIDE.md` for complete setup including database configuration.
