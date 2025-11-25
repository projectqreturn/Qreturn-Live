'use client';

import { useUser } from '@clerk/nextjs';
import { useState, useEffect } from 'react';
import { usePushNotifications } from '@/app/lib/notification/PushNotificationProvider';

export default function PushTestPage() {
  const { user } = useUser();
  const { isSupported, isSubscribed, permission, subscribe } = usePushNotifications();
  const [testResult, setTestResult] = useState('');
  const [logs, setLogs] = useState([]);

  const addLog = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, { timestamp, message, type }]);
    console.log(`[${timestamp}] ${message}`);
  };

  useEffect(() => {
    addLog('Page loaded');
    addLog(`Browser supported: ${isSupported}`);
    addLog(`Notification permission: ${permission}`);
    addLog(`Is subscribed: ${isSubscribed}`);
    
    // Auto-prompt for permission if not asked yet
    if (isSupported && permission === 'default' && !isSubscribed) {
      addLog('Permission not yet requested - click Subscribe button to enable', 'warning');
    }
  }, [isSupported, permission, isSubscribed]);

  const handleSubscribe = async () => {
    addLog('Attempting to subscribe...', 'info');
    try {
      const result = await subscribe();
      addLog(`Subscribe result: ${result}`, 'success');
    } catch (error) {
      addLog(`Subscribe error: ${error.message}`, 'error');
    }
  };

  const handleTestNotification = async () => {
    if (!user) {
      addLog('No user logged in', 'error');
      return;
    }

    addLog('Sending test notification...', 'info');
    setTestResult('Sending...');

    try {
      const response = await fetch('/api/push/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          title: 'Test Notification 🔔',
          body: 'This is a test push notification!',
          url: '/push-test'
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        addLog(`Success: ${data.message}`, 'success');
        setTestResult(`✅ ${data.message}`);
      } else {
        addLog(`Error: ${data.error}`, 'error');
        setTestResult(`❌ ${data.error}`);
      }
    } catch (error) {
      addLog(`Fetch error: ${error.message}`, 'error');
      setTestResult(`❌ ${error.message}`);
    }
  };

  const handleBrowserNotification = () => {
    addLog('Showing browser notification...', 'info');
    
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Browser Test', {
        body: 'This is a direct browser notification',
        icon: '/icons/192.png',
        badge: '/icons/100.png'
      });
      addLog('Browser notification shown', 'success');
    } else {
      addLog('Notification permission not granted', 'error');
    }
  };

  const handleCheckServiceWorker = async () => {
    addLog('Checking service workers...', 'info');
    
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      addLog(`Found ${registrations.length} service worker(s)`, 'info');
      
      registrations.forEach((reg, i) => {
        addLog(`SW ${i + 1}: ${reg.active?.scriptURL || 'inactive'}`, 'info');
      });

      const ready = await navigator.serviceWorker.ready;
      const subscription = await ready.pushManager.getSubscription();
      addLog(`Push subscription: ${subscription ? 'Active' : 'None'}`, subscription ? 'success' : 'warning');
      
      if (subscription) {
        addLog(`Endpoint: ${subscription.endpoint.substring(0, 50)}...`, 'info');
      }
    } else {
      addLog('Service Worker not supported', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Push Notification Test</h1>

        {/* Status Panel */}
        <div className="bg-gray-800 rounded-lg p-6 mb-6 border border-gray-700">
          <h2 className="text-xl font-semibold text-white mb-4">Status</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatusCard label="Supported" value={isSupported ? '✅' : '❌'} />
            <StatusCard label="Permission" value={permission} />
            <StatusCard label="Subscribed" value={isSubscribed ? '✅' : '❌'} />
            <StatusCard label="User" value={user ? '✅' : '❌'} />
          </div>
        </div>

        {/* Actions */}
        <div className="bg-gray-800 rounded-lg p-6 mb-6 border border-gray-700">
          <h2 className="text-xl font-semibold text-white mb-4">Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={handleSubscribe}
              disabled={!isSupported || isSubscribed}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-medium py-3 px-4 rounded-lg"
            >
              Subscribe to Push
            </button>
            
            <button
              onClick={handleTestNotification}
              disabled={!user || !isSubscribed}
              className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white font-medium py-3 px-4 rounded-lg"
            >
              Send Test Notification
            </button>
            
            <button
              onClick={handleBrowserNotification}
              disabled={permission !== 'granted'}
              className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white font-medium py-3 px-4 rounded-lg"
            >
              Show Browser Notification
            </button>
            
            <button
              onClick={handleCheckServiceWorker}
              className="bg-yellow-600 hover:bg-yellow-700 text-white font-medium py-3 px-4 rounded-lg"
            >
              Check Service Workers
            </button>
          </div>
          
          {testResult && (
            <div className="mt-4 p-4 bg-gray-700 rounded-lg text-white">
              {testResult}
            </div>
          )}
        </div>

        {/* Logs */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-white">Logs</h2>
            <button
              onClick={() => setLogs([])}
              className="text-sm text-gray-400 hover:text-white"
            >
              Clear
            </button>
          </div>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {logs.length === 0 ? (
              <p className="text-gray-400 text-sm">No logs yet...</p>
            ) : (
              logs.map((log, i) => (
                <div
                  key={i}
                  className={`text-sm font-mono p-2 rounded ${
                    log.type === 'error' ? 'bg-red-900/30 text-red-300' :
                    log.type === 'success' ? 'bg-green-900/30 text-green-300' :
                    log.type === 'warning' ? 'bg-yellow-900/30 text-yellow-300' :
                    'bg-gray-700 text-gray-300'
                  }`}
                >
                  <span className="text-gray-500">[{log.timestamp}]</span> {log.message}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-6 bg-blue-900/30 border border-blue-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-2">Instructions:</h3>
          <ol className="list-decimal list-inside text-blue-200 space-y-1 text-sm">
            <li>Click "Subscribe to Push" and accept browser permission</li>
            <li>Click "Send Test Notification" to send a push notification</li>
            <li>Check the logs for any errors</li>
            <li>Try "Show Browser Notification" to test browser notifications directly</li>
            <li>Use "Check Service Workers" to verify service worker status</li>
          </ol>
        </div>
      </div>
    </div>
  );
}

function StatusCard({ label, value }) {
  return (
    <div className="bg-gray-700 rounded-lg p-3">
      <div className="text-gray-400 text-xs mb-1">{label}</div>
      <div className="text-white font-semibold text-lg">{value}</div>
    </div>
  );
}
