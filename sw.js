const CACHE_NAME = 'ops-cache-v4'; // Incremented cache name version due to significant changes
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/style.css', // Root style.css
  '/css/theme.css',
  '/components/join-us/join-us.css', // Was in index.html, should be cached

  // Core JS
  '/js/global-app.js',
  '/js/global-toggles.js',
  '/js/dynamic-modal-manager.js',
  '/js/sw-register.js', // Should be cached to register the SW itself if offline first

  // Component HTML (modal content)
  '/components/join-us/join-us.html',
  '/components/contact-us/contact-us.html',
  '/components/chatbot/chatbot.html', // New iframe source
  '/components/service-modals/business-operations.html',
  '/components/service-modals/contact-center.html',
  '/components/service-modals/it-support.html',
  '/components/service-modals/professionals.html',

  // Component JS (loaded by DMM, but good to cache if they are static assets)
  '/components/join-us/join-us.js',
  '/components/contact-us/contact-us.js',

  // Assets (FontAwesome is CDN, but local assets like webfonts if any are used by it)
  // assets/fontawesome/css/all.min.css (if preferring local copy over CDN)
  // assets/fontawesome/webfonts/* (if local FA is used)
  // For now, keeping FA as CDN as per index.html.

  // Main font awesome CSS is CDN. Local assets folder exists.
  // Local assets like images if any critical ones existed would go here.
  // e.g. '/assets/logo.png'
];

// Add a new event listener for 'activate' to clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.filter(cacheName => {
          // Check if this cache name is not the current one
          return cacheName.startsWith('ops-cache-') && cacheName !== CACHE_NAME;
        }).map(cacheName => {
          // Delete the old cache
          console.log('Service Worker: Deleting old cache:', cacheName);
          return caches.delete(cacheName);
        })
      );
    })
  );
});

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => response || fetch(event.request))
  );
});
