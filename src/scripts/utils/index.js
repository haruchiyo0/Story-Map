export function showFormattedDate(date, locale = "en-US", options = {}) {
  return new Date(date).toLocaleDateString(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
    ...options,
  });
}

export function sleep(time = 1000) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

export * from "./mapUtils.js";
export * from "./validation.js";

export function isServiceWorkerAvailable() {
  return 'serviceWorker' in navigator;
}

export async function registerServiceWorker() {
  if (!isServiceWorkerAvailable()) {
    console.log('Service Worker API not supported');
    return;
  }

  try {
    // Unregister old service worker if exists
    const registrations = await navigator.serviceWorker.getRegistrations();
    for (const registration of registrations) {
      await registration.unregister();
    }

    // Register new service worker
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/',
      updateViaCache: 'none'
    });

    console.log('Service Worker registered successfully:', registration.scope);

    // Handle updates
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing;
      console.log('New Service Worker found, installing...');

      newWorker.addEventListener('statechange', () => {
        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
          // New service worker available, notify user
          if (confirm('New version available! Reload to update?')) {
            window.location.reload();
          }
        }
      });
    });

    // Check for updates periodically
    setInterval(() => {
      registration.update();
    }, 60 * 60 * 1000); // Check every hour

    return registration;
  } catch (error) {
    console.error('Service Worker registration failed:', error);
  }
}

// Helper untuk mengecek koneksi online/offline
export function isOnline() {
  return navigator.onLine;
}

// Event listeners untuk online/offline status
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    console.log('App is online');
    // Trigger sync jika ada data offline
    navigator.serviceWorker.ready.then(registration => {
      if ('sync' in registration) {
        registration.sync.register('sync-stories');
      }
    });
  });

  window.addEventListener('offline', () => {
    console.log('App is offline');
    // Show offline indicator
    showOfflineIndicator();
  });
}

function showOfflineIndicator() {
  const existingIndicator = document.getElementById('offline-indicator');
  if (existingIndicator) return;

  const indicator = document.createElement('div');
  indicator.id = 'offline-indicator';
  indicator.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    background: #ff6b6b;
    color: white;
    padding: 10px;
    text-align: center;
    z-index: 10000;
    font-weight: bold;
  `;
  indicator.textContent = '📡 You are offline - Some features may be limited';
  document.body.appendChild(indicator);

  // Remove when online
  window.addEventListener('online', () => {
    indicator.remove();
  }, { once: true });
}