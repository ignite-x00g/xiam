// sw.js - Service Worker for OPS Online Support

const CACHE_VERSION = 'v1';
const CACHE_NAME = `ops-cache-${CACHE_VERSION}`;

// Core assets that are pre-cached during installation
const CORE_ASSETS = [
  '/',
  '/index.html',
  '/assets/css/global.css',
  '/assets/css/mobile-fabs.css',
  '/assets/css/modal.css',
  '/assets/css/chatbot.css',
  '/assets/js/global-app.js',
  '/assets/js/sw-register.js',
  '/components/join-us/join-us.html',
  '/components/service-modals/professionals.html',
  '/components/service-modals/it-support.html',
  '/components/service-modals/business-operations.html',
  '/components/service-modals/contact-center.html',
  '/components/contact-us/contact-us.html',
  '/components/chatbot/chatbot.html'
];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(CORE_ASSETS))
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const { request } = event;

  // Only handle GET requests from our origin
  if (request.method !== 'GET' || new URL(request.url).origin !== location.origin) {
    return;
  }

  event.respondWith(
    caches.match(request).then(cachedResponse => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(request)
        .then(networkResponse => {
          // Cache the fetched response for future use
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(request, responseClone));
          return networkResponse;
        })
        .catch(() => {
          // Fallback to the cached index.html for navigation requests when offline
          if (request.mode === 'navigate') {
            return caches.match('/index.html');
          }
        });
    })
  );
});
