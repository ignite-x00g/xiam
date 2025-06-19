// js/service-worker.js
const CACHE_NAME = 'ops-online-support-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/css/style.css',
  '/css/theme.css', // Assuming theme.css is also critical
  '/css/glow-effects.css',
  '/js/script.js',
  // '/js/cursor-glow-effect.js', // Already part of script.js or replace if distinct
  // '/js/dynamic-modal-manager.js', // Merged into script.js
  // '/js/theme-switcher.js', // Merged into script.js
  // '/js/language-switcher.js', // Merged into script.js
  // '/js/contact-form.js', // Merged or to be merged into script.js
  '/images/logo.png', // Add any critical images, e.g., company logo
  // Add other important assets like fonts, icons if not CDN hosted
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css' // Example CDN asset
];

// Install event: opens the cache and adds main assets to it
self.addEventListener('install', function(event) {
  console.log('[ServiceWorker] Install');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('[ServiceWorker] Caching app shell');
        return cache.addAll(urlsToCache);
      })
      .catch(function(error) {
        console.error('[ServiceWorker] Failed to cache app shell:', error);
      })
  );
});

// Activate event: cleans up old caches
self.addEventListener('activate', function(event) {
  console.log('[ServiceWorker] Activate');
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (cacheName !== CACHE_NAME) {
            console.log('[ServiceWorker] Removing old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  return self.clients.claim(); // Ensures the SW takes control of the page ASAP
});

// Fetch event: serves assets from cache or network
self.addEventListener('fetch', function(event) {
  console.log('[ServiceWorker] Fetching:', event.request.url);
  // For navigation requests, try network first, then cache (Network-first strategy)
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then(function(response) {
          // Check if we received a valid response
          if (response && response.status === 200 && response.type === 'basic') {
            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then(function(cache) {
                cache.put(event.request, responseToCache);
              });
          }
          return response;
        })
        .catch(function() {
          // Network failed, try to serve from cache
          return caches.match(event.request)
            .then(function(response) {
              return response || caches.match('/index.html'); // Fallback to index.html
            });
        })
    );
  } else {
    // For non-navigation requests (CSS, JS, images), use Cache-first strategy
    event.respondWith(
      caches.match(event.request)
        .then(function(response) {
          // Cache hit - return response
          if (response) {
            return response;
          }
          // Not in cache - fetch from network
          return fetch(event.request).then(
            function(response) {
              // Check if we received a valid response
              if(!response || response.status !== 200 || response.type !== 'basic') {
                return response;
              }
              // IMPORTANT: Clone the response. A response is a stream
              // and because we want the browser to consume the response
              // as well as the cache consuming the response, we need
              // to clone it so we have two streams.
              var responseToCache = response.clone();
              caches.open(CACHE_NAME)
                .then(function(cache) {
                  cache.put(event.request, responseToCache);
                });
              return response;
            }
          );
        })
        .catch(function(error) {
            console.error('[ServiceWorker] Error fetching data:', error);
            // Optionally, provide a fallback page or resource here
            // For example, if it's an image request, return a placeholder image
            // if (event.request.destination === 'image') {
            //   return caches.match('/images/fallback-placeholder.png');
            // }
        })
    );
  }
});

// Optional: Listen for messages from client pages
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
