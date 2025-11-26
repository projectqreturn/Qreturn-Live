'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';

export default function NotificationTestPage() {
  const { user } = useUser();
  const [logs, setLogs] = useState([]);
  const [subscription, setSubscription] = useState(null);
  const [swStatus, setSwStatus] = useState('checking...');

  const addLog = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, { message, type, timestamp }]);
    console.log(`[${timestamp}] ${message}`);
  };

  useEffect(() => {
    checkServiceWorker();
    checkSubscription();
  }, []);

  const checkServiceWorker = async () => {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.getRegistration();
        if (registration) {
          setSwStatus(`✅ Active: ${registration.active?.scriptURL || 'unknown'}`);
          addLog(`Service worker active: ${registration.active?.scriptURL}`, 'success');
        } else {
          setSwStatus('❌ Not registered');
          addLog('No service worker registered', 'error');
        }
      } catch (error) {
        setSwStatus('❌ Error');
        addLog(`Service worker error: ${error.message}`, 'error');
      }
    } else {
      setSwStatus('❌ Not supported');
      addLog('Service worker not supported', 'error');
    }
  };

  const checkSubscription = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const sub = await registration.pushManager.getSubscription();
      setSubscription(sub);
      if (sub) {
        addLog('Push subscription found', 'success');
      } else {
        addLog('No push subscription', 'warning');
      }
    } catch (error) {
      addLog(`Subscription check error: ${error.message}`, 'error');
    }
  };

  const testPermission = async () => {
    addLog('Checking notification permission...');
    const permission = Notification.permission;
    addLog(`Current permission: ${permission}`, permission === 'granted' ? 'success' : 'warning');
    
    if (permission !== 'granted') {
      addLog('Requesting permission...');
      const result = await Notification.requestPermission();
      addLog(`Permission result: ${result}`, result === 'granted' ? 'success' : 'error');
    }
  };

  const testSubscribe = async () => {
    addLog('Starting subscription process...');
    
    try {
      const registration = await navigator.serviceWorker.ready;
      addLog('Service worker ready', 'success');

      const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!vapidPublicKey) {
        addLog('❌ VAPID public key not found in environment', 'error');
        return;
      }
      addLog(`VAPID key found: ${vapidPublicKey.substring(0, 20)}...`, 'success');

      // Convert VAPID key
      const convertedKey = urlBase64ToUint8Array(vapidPublicKey);
      addLog('VAPID key converted', 'success');

      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedKey,
      });

      addLog('✅ Subscription created!', 'success');
      setSubscription(sub);

      // Send to server
      const response = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscription: sub }),
      });

      const data = await response.json();
      addLog(`Server response: ${JSON.stringify(data)}`, response.ok ? 'success' : 'error');
    } catch (error) {
      addLog(`❌ Subscribe error: ${error.message}`, 'error');
    }
  };

  const testSendNotification = async () => {
    if (!user) {
      addLog('❌ You must be logged in', 'error');
      return;
    }

    addLog('Sending test notification...');
    
    try {
      const response = await fetch('/api/push/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          title: 'Test Notification',
          body: 'This is a test notification from the test page',
          url: '/notification-test',
        }),
      });

      const data = await response.json();
      addLog(`Send result: ${JSON.stringify(data)}`, response.ok ? 'success' : 'error');
      
      if (response.ok) {
        addLog('✅ Check your browser for the notification!', 'success');
      }
    } catch (error) {
      addLog(`❌ Send error: ${error.message}`, 'error');
    }
  };

  const testLocalNotification = async () => {
    addLog('Showing local notification...');
    
    try {
      const registration = await navigator.serviceWorker.ready;
      await registration.showNotification('Local Test', {
        body: 'This is a local test notification',
        icon: '/icons/192.png',
        badge: '/icons/100.png',
        tag: 'test-notification',
      });
      addLog('✅ Local notification shown!', 'success');
    } catch (error) {
      addLog(`❌ Local notification error: ${error.message}`, 'error');
    }
  };

  const clearLogs = () => {
    setLogs([]);
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">🔔 Push Notification Test</h1>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">System Status</h2>
        <div className="space-y-2">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
            <span className="font-medium">Service Worker:</span>
            <span className="text-sm">{swStatus}</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
            <span className="font-medium">Notification Permission:</span>
            <span className="text-sm">{typeof Notification !== 'undefined' ? Notification.permission : 'N/A'}</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
            <span className="font-medium">Push Subscription:</span>
            <span className="text-sm">{subscription ? '✅ Active' : '❌ None'}</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
            <span className="font-medium">User ID:</span>
            <span className="text-sm">{user?.id || 'Not logged in'}</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Test Actions</h2>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={testPermission}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            1. Check Permission
          </button>
          <button
            onClick={testSubscribe}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            2. Subscribe
          </button>
          <button
            onClick={testLocalNotification}
            className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
          >
            3. Test Local Notification
          </button>
          <button
            onClick={testSendNotification}
            className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
          >
            4. Send Push Notification
          </button>
          <button
            onClick={checkServiceWorker}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Refresh Status
          </button>
          <button
            onClick={clearLogs}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Clear Logs
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Console Logs</h2>
        <div className="bg-gray-900 text-gray-100 rounded p-4 h-96 overflow-y-auto font-mono text-sm">
          {logs.length === 0 ? (
            <div className="text-gray-500">No logs yet. Run a test to see logs here.</div>
          ) : (
            logs.map((log, idx) => (
              <div
                key={idx}
                className={`mb-2 ${
                  log.type === 'success' ? 'text-green-400' :
                  log.type === 'error' ? 'text-red-400' :
                  log.type === 'warning' ? 'text-yellow-400' :
                  'text-gray-300'
                }`}
              >
                <span className="text-gray-500">[{log.timestamp}]</span> {log.message}
              </div>
            ))
          )}
        </div>
      </div>

      {subscription && (
        <div className="bg-white rounded-lg shadow-md p-6 mt-6">
          <h2 className="text-xl font-semibold mb-4">Subscription Details</h2>
          <pre className="bg-gray-100 p-4 rounded text-xs overflow-x-auto">
            {JSON.stringify(subscription.toJSON(), null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

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
