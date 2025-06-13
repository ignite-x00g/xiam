const CACHE_NAME = 'ops-solutions-cache-v2'; // Incremented version due to significant changes
const urlsToCache = [
  '/',
  '/index.html',
  '/css/global.css',
  '/css/small-screens.css',
  '/js/main.js'
  // NOTE: Assets like logo, favicon, hero-image are intentionally excluded for now
  // as they are reported to be missing from the repo. They can be added later.
];

// Install event: cache essential assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache: ' + CACHE_NAME);
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        return self.skipWaiting(); // Activate the new service worker immediately
      })
  );
});

// Activate event: clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache: ' + cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      return self.clients.claim(); // Take control of all open clients
    })
  );
});

// Fetch event: serve cached content when available (cache-first strategy for pre-cached assets)
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return response
        if (response) {
          return response;
        }
        // Not in cache - fetch from network
        return fetch(event.request);
        // Optional: Could add logic here to cache new requests dynamically,
        // but for now, we are only serving what was pre-cached on install.
      }
    )
  );
});
