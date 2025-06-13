const CACHE_NAME = 'ops-solutions-cache-v1'; // Keep the same cache name for consistency for now
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/css/global.css',
  '/css/small-screens.css',
  '/js/main.js', // main.js is essential for site functionality
  '/assets/logo.png',
  '/assets/hero-image.jpg',
  '/assets/favicon.ico'
  // Add other critical assets if any were missed
];

// Install event: cache core assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
  self.skipWaiting(); // Force the waiting service worker to become the active service worker
});

// Activate event: clean up old caches if any
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  return self.clients.claim(); // Take control of uncontrolled clients
});

// Fetch event: serve from cache, fallback to network
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return response
        if (response) {
          return response;
        }
        // Not in cache - fetch from network
        return fetch(event.request).then(
          networkResponse => {
            // Check if we received a valid response
            if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
              return networkResponse;
            }

            // IMPORTANT: Clone the response. A response is a stream
            // and because we want the browser to consume the response
            // as well as the cache consuming the response, we need
            // to clone it so we have two streams.
            const responseToCache = networkResponse.clone();

            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });

            return networkResponse;
          }
        );
      })
      .catch(error => {
        // Fallback for specific routes or asset types if needed, e.g., an offline page
        console.error('Fetching failed:', error);
        // For example, you could return a custom offline page:
        // if (event.request.mode === 'navigate') {
        //   return caches.match('/offline.html');
        // }
        throw error;
      })
  );
});
