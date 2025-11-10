import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { NetworkFirst, CacheFirst, StaleWhileRevalidate } from 'workbox-strategies';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';

// Precache semua aset yang di-generate oleh build tool
precacheAndRoute(self.__WB_MANIFEST || []);

// Runtime Caching untuk API Stories (NetworkFirst)
// Prioritas: Network dulu, fallback ke cache jika offline
registerRoute(
  ({ url }) => url.pathname.includes('/stories'),
  new NetworkFirst({
    cacheName: 'api-stories',
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
    ],
  })
);

// Runtime Caching untuk Gambar dari API (StaleWhileRevalidate)
// Tampilkan dari cache, update di background
registerRoute(
  ({ request }) => request.destination === 'image',
  new StaleWhileRevalidate({
    cacheName: 'images-cache',
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
    ],
  })
);

// Cache untuk Leaflet tiles (CacheFirst)
registerRoute(
  ({ url }) => url.origin === 'https://tile.openstreetmap.org' || 
               url.hostname.includes('openstreetmap'),
  new CacheFirst({
    cacheName: 'map-tiles',
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
    ],
  })
);

// Cache untuk font dan CSS external (CacheFirst)
registerRoute(
  ({ request }) => 
    request.destination === 'font' || 
    request.destination === 'style',
  new CacheFirst({
    cacheName: 'static-resources',
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
    ],
  })
);

// Push notification handler
self.addEventListener('push', (event) => {
  console.log('Service worker pushing...');
  
  const showNotification = async () => {
    let data;
    try {
      data = event.data ? event.data.json() : {};
    } catch (e) {
      data = { 
        title: 'New Story Update', 
        options: { 
          body: 'Check out the latest stories on StoryMap',
          icon: '/favicon.png',
          badge: '/favicon.png'
        } 
      };
    }
    
    await self.registration.showNotification(data.title || 'StoryMap', {
      body: data.options?.body || 'New content available',
      icon: data.options?.icon || '/favicon.png',
      badge: '/favicon.png',
      vibrate: [200, 100, 200],
      actions: [
        { action: 'view', title: 'View Stories' },
        { action: 'close', title: 'Close' }
      ],
      data: data.options?.data
    });
  };
  
  event.waitUntil(showNotification());
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.action === 'view') {
    event.waitUntil(
      clients.openWindow('/#/home')
    );
  }
});

// Background sync untuk offline submissions (jika ada)
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-stories') {
    event.waitUntil(syncOfflineStories());
  }
});

async function syncOfflineStories() {
  // Logic untuk sync data offline ke server
  console.log('Syncing offline stories...');
}