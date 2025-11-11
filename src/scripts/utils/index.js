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
    return null;
  }

  try {
    // Unregister existing service workers first (untuk development)
    const registrations = await navigator.serviceWorker.getRegistrations();
    for (const registration of registrations) {
      await registration.unregister();
      console.log('Unregistered old service worker');
    }

    // Wait a bit for cleanup
    await sleep(100);

    // Register new service worker
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/',
      updateViaCache: 'none'
    });

    console.log('✅ Service Worker registered successfully');
    console.log('Scope:', registration.scope);
    console.log('State:', registration.installing || registration.waiting || registration.active);

    // Wait for service worker to be ready
    await navigator.serviceWorker.ready;
    console.log('✅ Service Worker is ready');

    // Handle updates
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing;
      console.log('🔄 New Service Worker found, installing...');

      newWorker.addEventListener('statechange', () => {
        console.log('Service Worker state:', newWorker.state);
        
        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
          // New version available
          if (confirm('New version available! Reload to update?')) {
            newWorker.postMessage({ type: 'SKIP_WAITING' });
            window.location.reload();
          }
        }
      });
    });

    // Listen for controlling service worker changes
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      console.log('Controller changed, reloading...');
      window.location.reload();
    });

    // Check for updates periodically (every hour)
    setInterval(() => {
      registration.update();
      console.log('Checking for Service Worker updates...');
    }, 60 * 60 * 1000);

    return registration;

  } catch (error) {
    console.error('❌ Service Worker registration failed:', error);
    return null;
  }
}

// Helper untuk mengecek koneksi online/offline
export function isOnline() {
  return navigator.onLine;
}

// Event listeners untuk online/offline status
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    console.log('🌐 App is online');
    hideOfflineIndicator();
    
    // Trigger sync jika ada data offline
    if (isServiceWorkerAvailable()) {
      navigator.serviceWorker.ready.then(registration => {
        if ('sync' in registration) {
          registration.sync.register('sync-stories');
        }
      });
    }
  });

  window.addEventListener('offline', () => {
    console.log('📡 App is offline');
    showOfflineIndicator();
  });

  // Check initial state
  if (!navigator.onLine) {
    showOfflineIndicator();
  }
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
    background: linear-gradient(135deg, #e74c3c, #c0392b);
    color: white;
    padding: 12px;
    text-align: center;
    z-index: 10000;
    font-weight: bold;
    box-shadow: 0 2px 10px rgba(0,0,0,0.2);
    animation: slideDown 0.3s ease;
  `;
  indicator.textContent = '📡 You are offline - Some features may be limited';
  document.body.appendChild(indicator);
}

function hideOfflineIndicator() {
  const indicator = document.getElementById('offline-indicator');
  if (indicator) {
    indicator.style.animation = 'slideUp 0.3s ease';
    setTimeout(() => indicator.remove(), 300);
  }
}

// Add CSS animations
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideDown {
      from {
        transform: translateY(-100%);
      }
      to {
        transform: translateY(0);
      }
    }
    
    @keyframes slideUp {
      from {
        transform: translateY(0);
      }
      to {
        transform: translateY(-100%);
      }
    }

    @keyframes slideIn {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }

    @keyframes slideOut {
      from {
        transform: translateX(0);
        opacity: 1;
      }
      to {
        transform: translateX(100%);
        opacity: 0;
      }
    }
  `;
  document.head.appendChild(style);
}