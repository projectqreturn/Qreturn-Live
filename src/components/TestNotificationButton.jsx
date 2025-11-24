'use client';

import { createNotification, NOTIFICATION_TYPES } from '@/app/lib/notification/notification';
import { useUser } from '@clerk/nextjs';
import { useState } from 'react';

export default function TestNotificationButton() {
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const sendTestNotification = async () => {
    if (!user?.id) {
      setMessage('Please sign in first');
      return;
    }

    setLoading(true);
    try {
      const notifId = await createNotification({
        userId: user.id,
        type: NOTIFICATION_TYPES.SYSTEM,
        title: 'Test Notification',
        message: 'This is a test notification to verify the system works!',
        priority: 'high',
        link: '/notifications'
      });

      setMessage(`✅ Notification created! ID: ${notifId}`);
      console.log('Test notification created:', notifId);
    } catch (error) {
      setMessage(`❌ Error: ${error.message}`);
      console.error('Error creating test notification:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-white p-4 rounded-lg shadow-lg border-2 border-blue-500">
      <h3 className="text-sm font-bold mb-2">Test Notification System</h3>
      <button
        onClick={sendTestNotification}
        disabled={loading}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-sm"
      >
        {loading ? 'Sending...' : 'Send Test Notification'}
      </button>
      {message && (
        <p className="mt-2 text-xs text-gray-700">{message}</p>
      )}
      <p className="text-xs text-gray-500 mt-2">User: {user?.id || 'Not signed in'}</p>
    </div>
  );
}
