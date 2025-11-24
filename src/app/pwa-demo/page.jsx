'use client';

/**
 * Simple example page showing how to use PWA features
 * Add this to your app to demonstrate/test PWA functionality
 * 
 * To use: Create a page at /src/app/pwa-demo/page.jsx
 */

import { useState, useEffect } from 'react';
import PushNotificationButton from '@/components/pwa/PushNotificationButton';
import { 
  isPushNotificationSupported, 
  isNotificationPermissionGranted,
  getCurrentSubscription,
  showLocalNotification 
} from '@/lib/utils/pushNotifications';

export default function PWADemoPage() {
  const [isSupported, setIsSupported] = useState(false);
  const [isGranted, setIsGranted] = useState(false);
  const [subscription, setSubscription] = useState(null);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    setIsSupported(isPushNotificationSupported());
    setIsGranted(isNotificationPermissionGranted());
    setIsStandalone(
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true
    );

    getCurrentSubscription().then(setSubscription);
  }, []);

  const handleTestNotification = async () => {
    await showLocalNotification('Test Notification', {
      body: 'This is a test notification from Qreturn!',
      icon: '/icons/192.png',
    });
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">PWA Demo & Testing</h1>

        {/* PWA Status */}
        <div className="bg-gray-900 rounded-lg p-6 mb-6">
          <h2 className="text-2xl font-semibold mb-4">PWA Status</h2>
          <div className="space-y-2">
            <StatusItem 
              label="Installed as App" 
              status={isStandalone}
            />
            <StatusItem 
              label="Push Notifications Supported" 
              status={isSupported}
            />
            <StatusItem 
              label="Notification Permission Granted" 
              status={isGranted}
            />
            <StatusItem 
              label="Push Subscription Active" 
              status={!!subscription}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="bg-gray-900 rounded-lg p-6 mb-6">
          <h2 className="text-2xl font-semibold mb-4">Actions</h2>
          <div className="space-y-4">
            <PushNotificationButton />
            
            {isGranted && (
              <button
                onClick={handleTestNotification}
                className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center space-x-2"
              >
                <span>🧪</span>
                <span>Send Test Notification</span>
              </button>
            )}
          </div>
        </div>

        {/* Installation Instructions */}
        {!isStandalone && (
          <div className="bg-gray-900 rounded-lg p-6 mb-6">
            <h2 className="text-2xl font-semibold mb-4">Install App</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg mb-2">Desktop (Chrome/Edge)</h3>
                <ol className="list-decimal list-inside space-y-1 text-gray-300">
                  <li>Look for the install button (➕) in the address bar</li>
                  <li>Or wait for the install popup to appear</li>
                  <li>Click "Install" to add to your desktop</li>
                </ol>
              </div>
              
              <div>
                <h3 className="font-semibold text-lg mb-2">Android (Chrome)</h3>
                <ol className="list-decimal list-inside space-y-1 text-gray-300">
                  <li>Tap the menu (⋮) in the top right</li>
                  <li>Select "Install app" or "Add to Home screen"</li>
                  <li>Follow the prompts</li>
                </ol>
              </div>
              
              <div>
                <h3 className="font-semibold text-lg mb-2">iOS (Safari)</h3>
                <ol className="list-decimal list-inside space-y-1 text-gray-300">
                  <li>Tap the Share button (📤) at the bottom</li>
                  <li>Scroll down and tap "Add to Home Screen"</li>
                  <li>Tap "Add" in the top right</li>
                </ol>
              </div>
            </div>
          </div>
        )}

        {/* Subscription Details */}
        {subscription && (
          <div className="bg-gray-900 rounded-lg p-6 mb-6">
            <h2 className="text-2xl font-semibold mb-4">Subscription Details</h2>
            <div className="bg-gray-800 rounded p-4 overflow-x-auto">
              <pre className="text-xs text-gray-300">
                {JSON.stringify(subscription, null, 2)}
              </pre>
            </div>
          </div>
        )}

        {/* Feature List */}
        <div className="bg-gray-900 rounded-lg p-6">
          <h2 className="text-2xl font-semibold mb-4">PWA Features</h2>
          <ul className="space-y-2 text-gray-300">
            <li>✅ Installable on home screen/desktop</li>
            <li>✅ Works offline with service worker caching</li>
            <li>✅ Push notifications support</li>
            <li>✅ Fast loading with caching</li>
            <li>✅ Native app-like experience</li>
            <li>✅ Background sync capabilities</li>
            <li>✅ Responsive on all devices</li>
          </ul>
        </div>

        {/* Developer Info */}
        <div className="mt-8 p-4 bg-blue-900 bg-opacity-30 rounded-lg border border-blue-700">
          <h3 className="font-semibold mb-2">Developer Info</h3>
          <p className="text-sm text-gray-300">
            This is a demo page. To integrate PWA features into your app, see the 
            documentation files: PWA_SETUP_GUIDE.md and notification-examples.js
          </p>
        </div>
      </div>
    </div>
  );
}

function StatusItem({ label, status }) {
  return (
    <div className="flex items-center justify-between py-2 px-4 bg-gray-800 rounded">
      <span className="text-gray-300">{label}</span>
      <span className={`font-semibold ${status ? 'text-green-400' : 'text-red-400'}`}>
        {status ? '✓ Yes' : '✗ No'}
      </span>
    </div>
  );
}
