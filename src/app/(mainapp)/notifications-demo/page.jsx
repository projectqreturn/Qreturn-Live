'use client';

import React, { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import NotificationToggleButton, { 
  NotificationIconButton, 
  NotificationStatusBadge 
} from '@/components/notifications/NotificationToggleButton';
import { usePushNotifications } from '@/app/lib/notification/PushNotificationProvider';
import { createNotification, NOTIFICATION_TYPES } from '@/app/lib/notification/notification';
import toast from 'react-hot-toast';

/**
 * Push Notification Demo Page
 * Shows all notification features and how to use them
 */
export default function PushNotificationDemo() {
  const { user } = useUser();
  const { isSupported, isSubscribed, permission } = usePushNotifications();
  const [isSending, setIsSending] = useState(false);

  const sendTestNotification = async (type) => {
    if (!user) {
      toast.error('Please sign in to test notifications');
      return;
    }

    setIsSending(true);
    try {
      const notifications = {
        itemFound: {
          type: NOTIFICATION_TYPES.ITEM_FOUND,
          title: '🎉 Item Found!',
          message: 'Great news! Someone reported finding an item matching your description.',
          link: '/myitems',
          priority: 'high'
        },
        matchFound: {
          type: NOTIFICATION_TYPES.MATCH_FOUND,
          title: '🔍 Potential Match Found',
          message: 'We found a potential match for your lost iPhone 13 Pro',
          link: '/myitems',
          priority: 'high',
          data: { itemId: 'demo-item-123', matchType: 'found' }
        },
        qrScan: {
          type: NOTIFICATION_TYPES.QR_SCAN,
          title: '📍 Your Item Was Scanned!',
          message: 'Someone scanned your QR code at Central Park, New York',
          link: '/protectedqr/demo',
          priority: 'high',
          data: { location: 'Central Park, NYC' }
        },
        message: {
          type: NOTIFICATION_TYPES.MESSAGE,
          title: '💬 New Message',
          message: 'John Doe: Hey, I think I found your item!',
          link: '/chats',
          priority: 'medium',
          data: { chatId: 'demo-chat-123', senderName: 'John Doe' }
        },
        system: {
          type: NOTIFICATION_TYPES.SYSTEM,
          title: '🔔 System Notification',
          message: 'Your account verification is complete. You can now access all features.',
          link: '/profile',
          priority: 'low'
        }
      };

      const selectedNotif = notifications[type];
      
      await createNotification({
        userId: user.id,
        ...selectedNotif
      });

      toast.success('Test notification sent!');
    } catch (error) {
      console.error('Error sending test notification:', error);
      toast.error('Failed to send notification');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            🔔 Push Notifications Demo
          </h1>
          <p className="text-gray-400 text-lg">
            Test and explore the push notification system
          </p>
        </div>

        {/* Status Card */}
        <div className="bg-gray-800 rounded-xl p-6 mb-8 border border-gray-700">
          <h2 className="text-2xl font-semibold text-white mb-4">Status</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-700 rounded-lg p-4">
              <div className="text-gray-400 text-sm mb-2">Browser Support</div>
              <div className="text-xl font-semibold text-white">
                {isSupported ? '✅ Supported' : '❌ Not Supported'}
              </div>
            </div>
            <div className="bg-gray-700 rounded-lg p-4">
              <div className="text-gray-400 text-sm mb-2">Subscription</div>
              <NotificationStatusBadge />
            </div>
            <div className="bg-gray-700 rounded-lg p-4">
              <div className="text-gray-400 text-sm mb-2">Permission</div>
              <div className="text-xl font-semibold text-white capitalize">
                {permission === 'granted' && '✅ Granted'}
                {permission === 'denied' && '❌ Denied'}
                {permission === 'default' && '⚠️ Not Asked'}
              </div>
            </div>
          </div>
        </div>

        {/* Control Buttons */}
        <div className="bg-gray-800 rounded-xl p-6 mb-8 border border-gray-700">
          <h2 className="text-2xl font-semibold text-white mb-4">Controls</h2>
          <div className="flex flex-wrap gap-4">
            <NotificationToggleButton />
            <NotificationIconButton />
          </div>
          {!isSubscribed && (
            <p className="text-yellow-400 text-sm mt-4">
              💡 Enable notifications to receive test notifications
            </p>
          )}
        </div>

        {/* Test Notifications */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h2 className="text-2xl font-semibold text-white mb-4">
            Test Notifications
          </h2>
          <p className="text-gray-400 mb-6">
            Click any button below to send a test notification
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TestNotificationButton
              title="Item Found"
              description="Simulate finding a lost item"
              emoji="🎉"
              onClick={() => sendTestNotification('itemFound')}
              disabled={isSending || !user}
            />
            <TestNotificationButton
              title="Match Found"
              description="Potential match for lost item"
              emoji="🔍"
              onClick={() => sendTestNotification('matchFound')}
              disabled={isSending || !user}
            />
            <TestNotificationButton
              title="QR Code Scan"
              description="Someone scanned your QR code"
              emoji="📍"
              onClick={() => sendTestNotification('qrScan')}
              disabled={isSending || !user}
            />
            <TestNotificationButton
              title="New Message"
              description="Receive a chat message"
              emoji="💬"
              onClick={() => sendTestNotification('message')}
              disabled={isSending || !user}
            />
            <TestNotificationButton
              title="System Notification"
              description="General system update"
              emoji="🔔"
              onClick={() => sendTestNotification('system')}
              disabled={isSending || !user}
            />
          </div>

          {!user && (
            <p className="text-red-400 text-sm mt-4">
              ⚠️ Please sign in to send test notifications
            </p>
          )}
        </div>

        {/* Documentation Links */}
        <div className="mt-8 bg-blue-900 bg-opacity-30 border border-blue-700 rounded-xl p-6">
          <h3 className="text-xl font-semibold text-white mb-3">📚 Documentation</h3>
          <ul className="space-y-2 text-blue-200">
            <li>
              <a href="/PUSH_NOTIFICATIONS_QUICKSTART.md" className="hover:text-blue-100 underline">
                Quick Start Guide
              </a>
            </li>
            <li>
              <a href="/PUSH_NOTIFICATIONS_GUIDE.md" className="hover:text-blue-100 underline">
                Complete Setup Guide
              </a>
            </li>
            <li>
              <a href="/PWA_SETUP_GUIDE.md" className="hover:text-blue-100 underline">
                PWA Setup Guide
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

// Test Notification Button Component
function TestNotificationButton({ title, description, emoji, onClick, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:cursor-not-allowed border border-gray-600 rounded-lg p-4 text-left transition-all duration-200 hover:scale-105 group"
    >
      <div className="flex items-start">
        <span className="text-3xl mr-3 group-hover:scale-110 transition-transform">
          {emoji}
        </span>
        <div>
          <h3 className="text-white font-semibold text-lg mb-1">{title}</h3>
          <p className="text-gray-400 text-sm">{description}</p>
        </div>
      </div>
    </button>
  );
}
