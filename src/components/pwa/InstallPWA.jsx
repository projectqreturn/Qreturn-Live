'use client';

import { useState, useEffect } from 'react';
import { FiDownload, FiX } from 'react-icons/fi';

export default function InstallPWA() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if running as PWA
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                        window.navigator.standalone === true;
    setIsStandalone(isStandalone);

    // Detect iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    setIsIOS(iOS);

    // Check if user has dismissed the prompt before
    const hasPromptBeenDismissed = localStorage.getItem('pwa-install-dismissed');
    const dismissedTime = hasPromptBeenDismissed ? parseInt(hasPromptBeenDismissed) : 0;
    const daysSinceDismissal = (Date.now() - dismissedTime) / (1000 * 60 * 60 * 24);

    // Show prompt after 3 days if previously dismissed
    const shouldShowPrompt = !hasPromptBeenDismissed || daysSinceDismissal > 3;

    // Listen for beforeinstallprompt event (Android/Desktop)
    const handleBeforeInstallPrompt = (e) => {
      console.log('beforeinstallprompt event fired');
      e.preventDefault();
      setDeferredPrompt(e);
      
      if (!isStandalone && shouldShowPrompt) {
        // Show install prompt after a short delay
        setTimeout(() => {
          setShowInstallPrompt(true);
        }, 3000);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // For iOS, show custom install instructions if not in standalone mode
    if (iOS && !isStandalone && shouldShowPrompt) {
      setTimeout(() => {
        setShowInstallPrompt(true);
      }, 3000);
    }

    // Listen for app installed event
    const handleAppInstalled = () => {
      console.log('PWA was installed');
      setShowInstallPrompt(false);
      setDeferredPrompt(null);
      localStorage.removeItem('pwa-install-dismissed');
    };

    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt && !isIOS) {
      return;
    }

    if (isIOS) {
      // For iOS, just show the instructions
      return;
    }

    // Show the install prompt
    deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response to the install prompt: ${outcome}`);

    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
      setShowInstallPrompt(false);
    }

    // Clear the deferredPrompt
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowInstallPrompt(false);
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
  };

  if (!showInstallPrompt || isStandalone) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-transparent md:bottom-4 md:left-4 md:right-auto md:max-w-md">
      <div className="bg-gray-800 rounded-lg shadow-2xl border border-gray-700 p-5 relative">
        <button
          onClick={handleDismiss}
          className="absolute top-3 right-3 text-gray-400 hover:text-white transition-colors"
          aria-label="Dismiss"
        >
          <FiX size={20} />
        </button>

        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0 bg-green-500 rounded-full p-3">
            <FiDownload size={24} className="text-white" />
          </div>
          
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-white mb-1">
              Install Qreturn App
            </h3>
            
            {isIOS ? (
              <div className="text-sm text-gray-300 space-y-2">
                <p>Install this app on your iPhone:</p>
                <ol className="list-decimal list-inside space-y-1 text-xs">
                  <li>Tap the Share button <span className="inline-block">📤</span></li>
                  <li>Scroll down and tap "Add to Home Screen"</li>
                  <li>Tap "Add" in the top right corner</li>
                </ol>
              </div>
            ) : (
              <p className="text-sm text-gray-300 mb-3">
                Install our app for a better experience with offline access and push notifications!
              </p>
            )}

            {!isIOS && deferredPrompt && (
              <button
                onClick={handleInstallClick}
                className="mt-3 w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
              >
                <FiDownload size={18} />
                <span>Install Now</span>
              </button>
            )}

            <button
              onClick={handleDismiss}
              className="mt-2 text-xs text-gray-400 hover:text-gray-300 transition-colors"
            >
              Maybe later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
