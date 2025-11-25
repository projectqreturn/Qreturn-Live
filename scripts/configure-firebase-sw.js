#!/usr/bin/env node

/**
 * Script to help configure Firebase Messaging Service Worker
 * Run this after setting up your environment variables
 * 
 * Usage: node scripts/configure-firebase-sw.js
 */

const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Check if all required variables are present
const missingVars = Object.entries(firebaseConfig)
  .filter(([key, value]) => !value)
  .map(([key]) => key);

if (missingVars.length > 0) {
  console.error('❌ Missing environment variables:');
  missingVars.forEach(varName => console.error(`   - NEXT_PUBLIC_FIREBASE_${varName.toUpperCase()}`));
  console.error('\nPlease add these to your .env.local file');
  process.exit(1);
}

// Read the service worker template
const swPath = path.join(__dirname, '../public/firebase-messaging-sw.js');
let swContent = fs.readFileSync(swPath, 'utf8');

// Replace placeholder values
swContent = swContent.replace(
  /const firebaseConfig = \{[\s\S]*?\};/,
  `const firebaseConfig = ${JSON.stringify(firebaseConfig, null, 2)};`
);

// Write back to file
fs.writeFileSync(swPath, swContent, 'utf8');

console.log('✅ Firebase Messaging Service Worker configured successfully!');
console.log('\nConfiguration:');
console.log(JSON.stringify(firebaseConfig, null, 2));
console.log('\n📝 File updated: public/firebase-messaging-sw.js');
console.log('\n🚀 Next steps:');
console.log('   1. Generate VAPID keys: npx web-push generate-vapid-keys');
console.log('   2. Add VAPID keys to .env.local');
console.log('   3. Restart your dev server: npm run dev');
console.log('   4. Test at: http://localhost:3000/notifications-demo');
