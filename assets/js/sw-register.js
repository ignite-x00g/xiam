// assets/js/sw-register.js
// Registers the service worker if sw.js is present
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(err => {
      console.error('ServiceWorker registration failed:', err);
    });
  });
}
