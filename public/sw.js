importScripts('https://storage.googleapis.com/workbox-cdn/releases/7.3.0/workbox-sw.js');

const { precacheAndRoute } = workbox.precaching;
const { registerRoute } = workbox.routing;
const { NetworkFirst, CacheFirst, StaleWhileRevalidate } = workbox.strategies;
const { CacheableResponsePlugin } = workbox.cacheableResponse;

precacheAndRoute(self.__WB_MANIFEST || []);

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

self.addEventListener('push', (event) => {
  console.log('🔔 Service worker received push event');
  
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
      console.error('Error parsing push data:', e);
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
  console.log('🖱️ Notification clicked:', event.action);
  
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
  console.log('🔄 Background sync triggered:', event.tag);
  
  if (event.tag === 'sync-stories') {
    event.waitUntil(syncOfflineStories());
  }
});

async function syncOfflineStories() {
  console.log('📤 Syncing offline stories...');
  
  try {
    const db = await openIndexedDB();
    const pendingStories = await getAllPendingStories(db);
    
    if (pendingStories.length === 0) {
      console.log('✅ No stories to sync');
      return;
    }
    
    console.log(`📦 Found ${pendingStories.length} stories to sync`);
    
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
          console.log(`✅ Story ${story.tempId} synced successfully`);
        }
      } catch (error) {
        console.error(`❌ Failed to sync story ${story.tempId}:`, error);
      }
    }
    
    console.log('✅ Sync completed');
  } catch (error) {
    console.error('❌ Sync process failed:', error);
  }
}

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

console.log('✅ Service Worker loaded successfully');