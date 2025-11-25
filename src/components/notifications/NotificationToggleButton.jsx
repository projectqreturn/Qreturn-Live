'use client';

import React from 'react';
import { usePushNotifications } from '@/app/lib/notification/PushNotificationProvider';
import { Bell, BellOff, Loader2 } from 'lucide-react';

/**
 * Enhanced Push Notification Toggle Button
 * Uses the PushNotificationProvider context
 */
export default function NotificationToggleButton({ className = '' }) {
  const { 
    isSupported, 
    isSubscribed, 
    isLoading, 
    permission, 
    subscribe, 
    unsubscribe 
  } = usePushNotifications();

  // Don't render if not supported
  if (!isSupported) {
    return null;
  }

  const handleClick = async () => {
    if (isSubscribed) {
      await unsubscribe();
    } else {
      await subscribe();
    }
  };

  // Determine button state and styling
  const getButtonContent = () => {
    if (isLoading) {
      return (
        <>
          <Loader2 className="h-5 w-5 animate-spin" />
          <span className="ml-2">Processing...</span>
        </>
      );
    }

    if (isSubscribed) {
      return (
        <>
          <BellOff className="h-5 w-5" />
          <span className="ml-2">Disable Notifications</span>
        </>
      );
    }

    return (
      <>
        <Bell className="h-5 w-5" />
        <span className="ml-2">Enable Notifications</span>
      </>
    );
  };

  const getButtonStyle = () => {
    if (isSubscribed) {
      return 'bg-gray-600 hover:bg-gray-700';
    }
    return 'bg-blue-600 hover:bg-blue-700';
  };

  return (
    <button
      onClick={handleClick}
      disabled={isLoading || permission === 'denied'}
      className={`
        ${getButtonStyle()}
        disabled:bg-gray-500 disabled:cursor-not-allowed
        text-white font-medium py-2 px-4 rounded-lg
        transition-all duration-200 
        flex items-center justify-center
        shadow-md hover:shadow-lg
        ${className}
      `}
      title={
        permission === 'denied' 
          ? 'Notification permission denied. Please enable it in your browser settings.' 
          : isSubscribed 
          ? 'Click to disable push notifications' 
          : 'Click to enable push notifications'
      }
    >
      {getButtonContent()}
    </button>
  );
}

/**
 * Compact notification icon button (for navbar, etc.)
 */
export function NotificationIconButton({ className = '' }) {
  const { 
    isSupported, 
    isSubscribed, 
    isLoading, 
    subscribe, 
    unsubscribe 
  } = usePushNotifications();

  if (!isSupported) {
    return null;
  }

  const handleClick = async () => {
    if (isSubscribed) {
      await unsubscribe();
    } else {
      await subscribe();
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={isLoading}
      className={`
        relative p-2 rounded-full
        ${isSubscribed ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-600 hover:bg-gray-700'}
        text-white transition-all duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
      title={isSubscribed ? 'Notifications enabled' : 'Enable notifications'}
    >
      {isLoading ? (
        <Loader2 className="h-5 w-5 animate-spin" />
      ) : isSubscribed ? (
        <>
          <Bell className="h-5 w-5" />
          <span className="absolute top-0 right-0 h-3 w-3 bg-green-500 rounded-full border-2 border-white"></span>
        </>
      ) : (
        <BellOff className="h-5 w-5" />
      )}
    </button>
  );
}

/**
 * Notification status badge
 */
export function NotificationStatusBadge() {
  const { isSupported, isSubscribed, permission } = usePushNotifications();

  if (!isSupported) {
    return (
      <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-200 text-gray-800">
        <span className="mr-1">❌</span>
        Not Supported
      </div>
    );
  }

  if (permission === 'denied') {
    return (
      <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
        <span className="mr-1">🚫</span>
        Permission Denied
      </div>
    );
  }

  if (isSubscribed) {
    return (
      <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
        <span className="mr-1">✅</span>
        Enabled
      </div>
    );
  }

  return (
    <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
      <span className="mr-1">⚠️</span>
      Disabled
    </div>
  );
}
