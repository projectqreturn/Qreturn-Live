'use client';

import { useState } from 'react';
import { 
  requestNotificationPermission, 
  initializePushNotifications,
  showLocalNotification,
  isPushNotificationSupported,
  isNotificationPermissionGranted 
} from '@/lib/utils/pushNotifications';
import toast from 'react-hot-toast';

export default function PushNotificationButton() {
  const [isLoading, setIsLoading] = useState(false);

  const handleEnableNotifications = async () => {
    if (!isPushNotificationSupported()) {
      toast.error('Push notifications are not supported in this browser');
      return;
    }

    if (isNotificationPermissionGranted()) {
      toast.success('Notifications are already enabled');
      // Show a test notification
      await showLocalNotification('Notifications Enabled', {
        body: 'You will now receive updates from Qreturn',
      });
      return;
    }

    setIsLoading(true);
    
    try {
      // Replace with your actual VAPID public key
      // You'll need to generate this on your server
      const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || 
        'YOUR_VAPID_PUBLIC_KEY_HERE';

      const result = await initializePushNotifications(VAPID_PUBLIC_KEY);

      if (result.success) {
        toast.success('Push notifications enabled!');
        
        // Show a welcome notification
        await showLocalNotification('Welcome to Qreturn!', {
          body: 'You\'ll now receive notifications about your lost and found items',
          icon: '/icons/192.png',
        });
      } else {
        toast.error(result.message || 'Failed to enable notifications');
      }
    } catch (error) {
      console.error('Error enabling notifications:', error);
      toast.error('Failed to enable notifications');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleEnableNotifications}
      disabled={isLoading}
      className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center space-x-2"
    >
      {isLoading ? (
        <>
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          <span>Enabling...</span>
        </>
      ) : (
        <>
          <span>🔔</span>
          <span>Enable Notifications</span>
        </>
      )}
    </button>
  );
}
