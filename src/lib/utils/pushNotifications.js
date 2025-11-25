'use client';

/**
 * Push Notification Utility Functions
 * Handles push notification subscription and management
 */

/**
 * Convert VAPID public key to Uint8Array
 */
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

/**
 * Check if push notifications are supported
 */
export function isPushNotificationSupported() {
  return 'serviceWorker' in navigator && 'PushManager' in window;
}

/**
 * Check if notification permission is granted
 */
export function isNotificationPermissionGranted() {
  return Notification.permission === 'granted';
}

/**
 * Request notification permission
 */
export async function requestNotificationPermission() {
  if (!isPushNotificationSupported()) {
    console.warn('Push notifications are not supported');
    return false;
  }

  try {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return false;
  }
}

/**
 * Get the service worker registration
 */
async function getServiceWorkerRegistration() {
  if (!('serviceWorker' in navigator)) {
    throw new Error('Service Worker not supported');
  }

  return await navigator.serviceWorker.ready;
}

/**
 * Subscribe to push notifications
 * @param {string} vapidPublicKey - Your VAPID public key from your server
 */
export async function subscribeToPushNotifications(vapidPublicKey) {
  if (!isPushNotificationSupported()) {
    throw new Error('Push notifications are not supported');
  }

  if (!isNotificationPermissionGranted()) {
    const granted = await requestNotificationPermission();
    if (!granted) {
      throw new Error('Notification permission denied');
    }
  }

  try {
    const registration = await getServiceWorkerRegistration();
    
    // Check if already subscribed
    let subscription = await registration.pushManager.getSubscription();
    
    if (subscription) {
      console.log('Already subscribed to push notifications');
      return subscription;
    }

    // Subscribe to push notifications
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
    });

    console.log('Successfully subscribed to push notifications');
    return subscription;
  } catch (error) {
    console.error('Error subscribing to push notifications:', error);
    throw error;
  }
}

/**
 * Send subscription to your backend server
 * @param {Object} params - Subscription parameters
 * @param {PushSubscription} params.subscription - The push subscription object
 * @param {string} params.fcmToken - FCM token if available
 */
export async function sendSubscriptionToServer({ subscription, fcmToken }) {
  try {
    const response = await fetch('/api/push/subscribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ subscription, fcmToken }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to send subscription to server');
    }

    const data = await response.json();
    console.log('Subscription sent to server:', data);
    return data;
  } catch (error) {
    console.error('Error sending subscription to server:', error);
    throw error;
  }
}

/**
 * Unsubscribe from push notifications
 */
export async function unsubscribeFromPushNotifications() {
  try {
    const registration = await getServiceWorkerRegistration();
    const subscription = await registration.pushManager.getSubscription();

    if (!subscription) {
      console.log('No subscription to unsubscribe from');
      return true;
    }

    const successful = await subscription.unsubscribe();
    
    if (successful) {
      console.log('Successfully unsubscribed from push notifications');
      
      // Notify your server to remove the subscription
      await fetch('/api/push/unsubscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          endpoint: subscription.endpoint,
        }),
      });
    }

    return successful;
  } catch (error) {
    console.error('Error unsubscribing from push notifications:', error);
    throw error;
  }
}

/**
 * Get current push subscription
 */
export async function getCurrentSubscription() {
  try {
    const registration = await getServiceWorkerRegistration();
    return await registration.pushManager.getSubscription();
  } catch (error) {
    console.error('Error getting current subscription:', error);
    return null;
  }
}

/**
 * Show a local notification (for testing)
 */
export async function showLocalNotification(title, options = {}) {
  if (!isNotificationPermissionGranted()) {
    console.warn('Notification permission not granted');
    return;
  }

  try {
    const registration = await getServiceWorkerRegistration();
    
    await registration.showNotification(title, {
      body: options.body || 'This is a notification from Qreturn',
      icon: options.icon || '/icons/192.png',
      badge: options.badge || '/icons/100.png',
      vibrate: options.vibrate || [200, 100, 200],
      tag: options.tag || 'qreturn-notification',
      data: options.data || {},
      actions: options.actions || [],
      ...options,
    });

    console.log('Local notification shown');
  } catch (error) {
    console.error('Error showing local notification:', error);
  }
}

/**
 * Initialize push notifications
 * Call this function when user opts in to receive notifications
 * @param {string} vapidPublicKey - Your VAPID public key
 */
export async function initializePushNotifications(vapidPublicKey) {
  try {
    // Request permission
    const granted = await requestNotificationPermission();
    if (!granted) {
      console.log('Notification permission denied');
      return { success: false, message: 'Permission denied' };
    }

    // Subscribe to push notifications
    const subscription = await subscribeToPushNotifications(vapidPublicKey);

    // Send subscription to server
    await sendSubscriptionToServer(subscription);

    return { 
      success: true, 
      message: 'Push notifications enabled',
      subscription 
    };
  } catch (error) {
    console.error('Error initializing push notifications:', error);
    return { 
      success: false, 
      message: error.message 
    };
  }
}
