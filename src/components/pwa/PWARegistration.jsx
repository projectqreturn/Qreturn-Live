'use client';

import { useEffect } from 'react';

export default function PWARegistration() {
  useEffect(() => {
    if (
      typeof window !== 'undefined' &&
      'serviceWorker' in navigator &&
      window.workbox !== undefined
    ) {
      const wb = window.workbox;

      // Add event listeners for service worker lifecycle
      wb.addEventListener('installed', (event) => {
        console.log('Service Worker installed:', event);
      });

      wb.addEventListener('controlling', (event) => {
        console.log('Service Worker controlling:', event);
      });

      wb.addEventListener('activated', (event) => {
        console.log('Service Worker activated:', event);
      });

      // Register the service worker
      wb.register();
    } else if ('serviceWorker' in navigator) {
      // Fallback manual registration
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js', { scope: '/' })
          .then((registration) => {
            console.log('Service Worker registered:', registration);
            
            // Check for updates periodically
            setInterval(() => {
              registration.update();
            }, 60 * 60 * 1000); // Check every hour
          })
          .catch((error) => {
            console.error('Service Worker registration failed:', error);
          });
      });
    }
  }, []);

  return null; // This component doesn't render anything
}
