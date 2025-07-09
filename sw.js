const CACHE_NAME = 'ops-cache-v2'; // Increment cache name version
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/style.css',
  '/css/theme.css',
  '/css/small-screen.css',

  '/js/global-app.js',
  '/js/config.js',
  '/js/global-toggles.js',
  '/js/dynamic-modal-manager.js',
  '/js/main-mobile-navigation.js',
  '/components/join-us/join-us.js',
  '/components/contact-us/contact-us.js',
  '/mychatbot/loader.js',
  '/js/main_script.js',
  // Not caching sw-register.js itself typically

  // Chatbot iframe assets - assuming iframe-content.html is the entry point for the iframe
  '/mychatbot/iframe-content.html',
  // If iframe-content.html uses iframe-style.css and iframe-script.js, they should be cached too.
  // The current iframe-content.html is not in the file listing, but chatbot.html has inline css/js.
  // For robustness, let's assume iframe-content.html exists and might link to external files.
  // If iframe-script.js and iframe-style.css are separate and used by iframe-content.html:
  '/mychatbot/iframe-script.js',
  '/mychatbot/iframe-style.css', // This was grepped earlier, so it exists

  // Main font awesome CSS is CDN, but if local webfonts are used by it, they are under assets/
  // However, the primary CSS is CDN. For simplicity, not caching FontAwesome assets via SW.
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
