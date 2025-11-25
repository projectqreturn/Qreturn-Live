'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useUser } from '@clerk/nextjs';
import { requestFCMToken, onForegroundMessage } from '@/firebase/firebase.config';
import { 
  isPushNotificationSupported, 
  requestNotificationPermission,
  subscribeToPushNotifications,
  sendSubscriptionToServer,
  getCurrentSubscription,
  unsubscribeFromPushNotifications 
} from '@/lib/utils/pushNotifications';
import toast from 'react-hot-toast';

/**
 * Push Notification Context
 */
const PushNotificationContext = createContext({
  isSupported: false,
  isSubscribed: false,
  isLoading: false,
  permission: 'default',
  subscribe: async () => {},
  unsubscribe: async () => {},
  requestPermission: async () => {},
});

/**
 * Custom hook to use push notification context
 */
export const usePushNotifications = () => {
  const context = useContext(PushNotificationContext);
  if (!context) {
    throw new Error('usePushNotifications must be used within PushNotificationProvider');
  }
  return context;
};

/**
 * Push Notification Provider Component
 * Manages push notification state and initialization
 */
export default function PushNotificationProvider({ children }) {
  const { user, isLoaded } = useUser();
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [permission, setPermission] = useState('default');

  // Check if push notifications are supported
  useEffect(() => {
    const supported = isPushNotificationSupported();
    setIsSupported(supported);
    
    if (supported && typeof Notification !== 'undefined') {
      setPermission(Notification.permission);
    }
  }, []);

  // Check subscription status
  const checkSubscriptionStatus = useCallback(async () => {
    if (!isSupported) return;

    try {
      const subscription = await getCurrentSubscription();
      setIsSubscribed(!!subscription);
    } catch (error) {
      console.error('Error checking subscription status:', error);
    }
  }, [isSupported]);

  // Initialize push notifications when user is loaded
  useEffect(() => {
    if (isLoaded && user && isSupported) {
      checkSubscriptionStatus();
    }
  }, [isLoaded, user, isSupported, checkSubscriptionStatus]);

  // Listen for foreground messages (Firebase)
  useEffect(() => {
    if (!user || !isSupported) return;

    const unsubscribe = onForegroundMessage((payload) => {
      console.log('Foreground message received:', payload);
      
      const title = payload.notification?.title || payload.data?.title || 'New Notification';
      const body = payload.notification?.body || payload.data?.body || '';
      
      // Show toast notification when app is in foreground
      toast.custom((t) => (
        <div
          className={`${
            t.visible ? 'animate-enter' : 'animate-leave'
          } max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
        >
          <div className="flex-1 w-0 p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0 pt-0.5">
                <img
                  className="h-10 w-10 rounded-full"
                  src="/icons/192.png"
                  alt="Qreturn"
                />
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-gray-900">{title}</p>
                <p className="mt-1 text-sm text-gray-500">{body}</p>
              </div>
            </div>
          </div>
          <div className="flex border-l border-gray-200">
            <button
              onClick={() => {
                toast.dismiss(t.id);
                if (payload.data?.url || payload.fcmOptions?.link) {
                  window.location.href = payload.data?.url || payload.fcmOptions?.link;
                }
              }}
              className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-blue-600 hover:text-blue-500 focus:outline-none"
            >
              View
            </button>
          </div>
        </div>
      ), { duration: 5000 });
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [user, isSupported]);

  /**
   * Request notification permission
   */
  const handleRequestPermission = useCallback(async () => {
    if (!isSupported) {
      toast.error('Push notifications are not supported in this browser');
      return false;
    }

    try {
      const granted = await requestNotificationPermission();
      setPermission(granted ? 'granted' : 'denied');
      return granted;
    } catch (error) {
      console.error('Error requesting permission:', error);
      toast.error('Failed to request notification permission');
      return false;
    }
  }, [isSupported]);

  /**
   * Subscribe to push notifications
   */
  const subscribe = useCallback(async () => {
    if (!user) {
      toast.error('You must be logged in to enable notifications');
      return false;
    }

    if (!isSupported) {
      toast.error('Push notifications are not supported in this browser');
      return false;
    }

    setIsLoading(true);

    try {
      // Request permission if not granted
      if (permission !== 'granted') {
        const granted = await handleRequestPermission();
        if (!granted) {
          toast.error('Notification permission denied');
          setIsLoading(false);
          return false;
        }
      }

      // Get VAPID and FCM keys from environment
      const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      const fcmVapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;

      let subscription = null;
      let fcmToken = null;

      // Try to get FCM token (Firebase Cloud Messaging)
      if (fcmVapidKey) {
        try {
          fcmToken = await requestFCMToken(fcmVapidKey);
          console.log('FCM Token obtained:', fcmToken);
        } catch (error) {
          console.warn('Failed to get FCM token:', error);
        }
      }

      // Try to get web-push subscription (fallback)
      if (vapidPublicKey) {
        try {
          subscription = await subscribeToPushNotifications(vapidPublicKey);
          console.log('Web-push subscription obtained');
        } catch (error) {
          console.warn('Failed to get web-push subscription:', error);
        }
      }

      // Send subscription to server
      if (subscription || fcmToken) {
        await sendSubscriptionToServer({ subscription, fcmToken });
        setIsSubscribed(true);
        toast.success('Push notifications enabled successfully!');
        return true;
      } else {
        toast.error('Failed to create push subscription. Please check your configuration.');
        return false;
      }
    } catch (error) {
      console.error('Error subscribing to push notifications:', error);
      toast.error('Failed to enable push notifications');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [user, isSupported, permission, handleRequestPermission]);

  /**
   * Unsubscribe from push notifications
   */
  const unsubscribe = useCallback(async () => {
    if (!user) {
      toast.error('You must be logged in');
      return false;
    }

    setIsLoading(true);

    try {
      await unsubscribeFromPushNotifications();
      setIsSubscribed(false);
      toast.success('Push notifications disabled');
      return true;
    } catch (error) {
      console.error('Error unsubscribing from push notifications:', error);
      toast.error('Failed to disable push notifications');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const value = {
    isSupported,
    isSubscribed,
    isLoading,
    permission,
    subscribe,
    unsubscribe,
    requestPermission: handleRequestPermission,
  };

  return (
    <PushNotificationContext.Provider value={value}>
      {children}
    </PushNotificationContext.Provider>
  );
}
