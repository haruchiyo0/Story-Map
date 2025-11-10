importScripts('https://storage.googleapis.com/workbox-cdn/releases/6.4.1/workbox-sw.js');

workbox.precaching.precacheAndRoute([]);

workbox.routing.registerRoute(
  new RegExp('/api/'),
  new workbox.strategies.NetworkFirst()
);

workbox.routing.registerRoute(
  /\.(?:png|jpg|jpeg|svg|gif)$/,
  new workbox.strategies.CacheFirst({
    cacheName: 'images',
    plugins: [
      new workbox.expiration.ExpirationPlugin({
        maxEntries: 60,
        maxAgeSeconds: 30 * 24 * 60 * 60,
      }),
    ],
  })
);

self.addEventListener('push', (event) => {
  console.log('Service worker pushing...');
  async function chainPromise() {
    let data;
    try {
      data = await event.data.json();
    } catch (e) {
      data = { title: 'Test Notification', options: { body: 'Test push message' } };
    }
    await self.registration.showNotification(data.title, {
      body: data.options.body,
      icon: '/icon-192x192.png',
      actions: [{ action: 'view', title: 'View Story' }]
    });
  }
  event.waitUntil(chainPromise());
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  if (event.action === 'view') {
    clients.openWindow('/#/home');
  }
});