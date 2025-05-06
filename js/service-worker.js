const CACHE_NAME = 'ops-solutions-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/css/global.css',
  '/css/small-screens.css',
  '/js/main.js',
   '/js/service-worker.js',
  '/assets/logo.png',
  '/assets/hero-image.jpg',
  '/assets/favicon.ico',
  '/assets/images/hero-image.jpg',
];

// Install Service Worker and Cache Files
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Caching files');
      return cache.addAll(urlsToCache);
    })
  );
});

// Fetch Files from Cache or Network
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // Return cached file if available, else fetch from network
      return cachedResponse || fetch(event.request);
    })
  );
});

// Activate Service Worker and Update Cache
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // Delete old caches not in the whitelist
          if (!cacheWhitelist.includes(cacheName)) {
            console.log('Deleting outdated cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
