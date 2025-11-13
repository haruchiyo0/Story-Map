importScripts('https://storage.googleapis.com/workbox-cdn/releases/7.3.0/workbox-sw.js');

workbox.setConfig({ debug: false });

const { precacheAndRoute } = workbox.precaching;
const { registerRoute } = workbox.routing;
const { NetworkFirst, CacheFirst, StaleWhileRevalidate } = workbox.strategies;
const { CacheableResponsePlugin } = workbox.cacheableResponse;
const { ExpirationPlugin } = workbox.expiration;

precacheAndRoute([
  { url: '/', revision: '1.0.0' },
  { url: '/index.html', revision: '1.0.0' },
  { url: '/manifest.json', revision: '1.0.0' },
  { url: '/favicon.png', revision: '1.0.0' },
  { url: '/logo.png', revision: '1.0.0' }
]);

registerRoute(
  ({ url }) => url.pathname.includes('/stories') || url.hostname.includes('story-api.dicoding.dev'),
  new NetworkFirst({
    cacheName: 'api-stories-v1',
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 60 * 60 * 24 
      })
    ],
  })
);

registerRoute(
  ({ request }) => request.destination === 'image',
  new StaleWhileRevalidate({
    cacheName: 'images-cache-v1',
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
      new ExpirationPlugin({
        maxEntries: 100,
        maxAgeSeconds: 60 * 60 * 24 * 30 
      })
    ],
  })
);

registerRoute(
  ({ url }) => 
    url.origin === 'https://tile.openstreetmap.org' || 
    url.hostname.includes('openstreetmap') ||
    url.pathname.includes('/tile/'),
  new CacheFirst({
    cacheName: 'map-tiles-v1',
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
      new ExpirationPlugin({
        maxEntries: 200,
        maxAgeSeconds: 60 * 60 * 24 * 365 
      })
    ],
  })
);

registerRoute(
  ({ request }) => 
    request.destination === 'font' || 
    request.destination === 'style' ||
    request.destination === 'script',
  new CacheFirst({
    cacheName: 'static-resources-v1',
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
      new ExpirationPlugin({
        maxEntries: 60,
        maxAgeSeconds: 60 * 60 * 24 * 365 
      })
    ],
  })
);

const OFFLINE_PAGE = '/index.html';
const CACHE_NAME = 'offline-page-v1';

self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.add(OFFLINE_PAGE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName.includes('-v') && !cacheName.includes('-v1')) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('push', (event) => {
  console.log('[SW] 🔔 Push notification received');
  
  const showNotification = async () => {
    let notificationData;
    
    try {
      if (event.data) {
        notificationData = event.data.json();
      } else {
        notificationData = {
          title: 'StoryMap Update',
          body: 'Check out the latest stories!',
          icon: '/favicon.png',
          badge: '/favicon.png'
        };
      }
    } catch (e) {
      console.error('[SW] Error parsing push data:', e);
      notificationData = {
        title: 'StoryMap Update',
        body: 'New content available',
        icon: '/favicon.png',
        badge: '/favicon.png'
      };
    }
    
    const title = notificationData.title || 'StoryMap';
    const options = {
      body: notificationData.body || notificationData.message || 'New content available',
      icon: notificationData.icon || '/favicon.png',
      badge: '/favicon.png',
      vibrate: [200, 100, 200],
      tag: 'storymap-notification',
      requireInteraction: false,
      actions: [
        { action: 'view', title: '👀 View Stories', icon: '/favicon.png' },
        { action: 'close', title: '❌ Close', icon: '/favicon.png' }
      ],
      data: {
        url: notificationData.url || '/#/home',
        storyId: notificationData.storyId,
        timestamp: Date.now()
      }
    };
    
    await self.registration.showNotification(title, options);
  };
  
  event.waitUntil(showNotification());
});

self.addEventListener('notificationclick', (event) => {
  console.log('[SW] 🖱️ Notification clicked:', event.action);
  
  event.notification.close();
  
  const urlToOpen = event.notification.data?.url || '/#/home';
  
  if (event.action === 'view' || !event.action) {
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true })
        .then((clientList) => {
          for (const client of clientList) {
            if (client.url.includes(self.registration.scope) && 'focus' in client) {
              client.focus();
              client.postMessage({
                type: 'NAVIGATE',
                url: urlToOpen
              });
              return;
            }
          }
          if (clients.openWindow) {
            return clients.openWindow(urlToOpen);
          }
        })
    );
  }
});

self.addEventListener('sync', (event) => {
  console.log('[SW] 🔄 Background sync triggered:', event.tag);
  
  if (event.tag === 'sync-stories') {
    event.waitUntil(syncOfflineStories());
  }
});

async function syncOfflineStories() {
  console.log('[SW] 📤 Syncing offline stories...');
  
  try {
    const db = await openIndexedDB();
    const pendingStories = await getAllPendingStories(db);
    
    if (pendingStories.length === 0) {
      console.log('[SW] ✅ No stories to sync');
      return;
    }
    
    console.log(`[SW] 📦 Found ${pendingStories.length} stories to sync`);
    
    for (const story of pendingStories) {
      try {
        const response = await fetch('https://story-api.dicoding.dev/v1/stories', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${story.token}`
          },
          body: createFormData(story)
        });
        
        if (response.ok) {
          await deletePendingStory(db, story.tempId);
          console.log(`[SW] ✅ Story ${story.tempId} synced successfully`);
        }
      } catch (error) {
        console.error(`[SW] ❌ Failed to sync story ${story.tempId}:`, error);
      }
    }
    
    console.log('[SW] ✅ Sync completed');
  } catch (error) {
    console.error('[SW] ❌ Sync process failed:', error);
  }
}

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  
  if (event.request.url.startsWith('chrome-extension')) return;
  
  event.respondWith(
    fetch(event.request).catch(async () => {
      if (event.request.headers.get('accept').includes('text/html')) {
        const cache = await caches.open(CACHE_NAME);
        return cache.match(OFFLINE_PAGE);
      }
      
      return caches.match(event.request);
    })
  );
});

function openIndexedDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('storymap', 1);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function getAllPendingStories(db) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['pending-stories'], 'readonly');
    const store = transaction.objectStore('pending-stories');
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function deletePendingStory(db, tempId) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['pending-stories'], 'readwrite');
    const store = transaction.objectStore('pending-stories');
    const request = store.delete(tempId);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

function createFormData(story) {
  const formData = new FormData();
  formData.append('description', `${story.name}: ${story.description}`);
  formData.append('lat', story.lat);
  formData.append('lon', story.lon);
  
  if (story.photo) {
    const blob = base64ToBlob(story.photo);
    formData.append('photo', blob, 'story-photo.jpg');
  }
  
  return formData;
}

function base64ToBlob(base64String) {
  const parts = base64String.split(',');
  const contentType = parts[0].split(':')[1].split(';')[0];
  const raw = atob(parts[1]);
  const rawLength = raw.length;
  const uInt8Array = new Uint8Array(rawLength);
  
  for (let i = 0; i < rawLength; i++) {
    uInt8Array[i] = raw.charCodeAt(i);
  }
  
  return new Blob([uInt8Array], { type: contentType });
}

console.log('[SW] ✅ Service Worker loaded successfully');