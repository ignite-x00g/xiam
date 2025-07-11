# OPS Online Support Web App

This repository contains the source code for the **OPS Online Support** website. The project is a static web app written in plain HTML, CSS and JavaScript. It demonstrates responsive service offerings, modal components, theme and language toggles and basic chatbot integration.

## File structure

```
/               Main project root
├─ index.html         Entry point for the website
├─ sw.js              Placeholder service worker
├─ assets/            Stylesheets and JavaScript
│  ├─ css/            Global, modal and chatbot styles
│  └─ js/             Front‑end logic and optional service worker registration
├─ components/        HTML fragments loaded on demand
│  ├─ chatbot/        Chatbot container markup
│  ├─ contact-us/     Contact modal markup
│  ├─ join-us/        Join-us form modal
│  └─ service-modals/ Individual service descriptions
└─ FAB_METRICS.md     Design notes for FAB layout
```

## Serving the site locally

Because the project is entirely static, any HTTP server can host it. When developing locally you can use a simple server such as Python's built‑in module:

```bash
python3 -m http.server 8000
```

Then visit `http://localhost:8000` in your browser.

Alternatively, Node users can run `npx serve` or `npx http-server` for a similar result. No build step is required.

## Optional PWA features

The repository includes a minimal `sw.js` file and a helper script to register it. Include the script tag in `index.html` as shown below to enable service worker registration:

```html
<script src="assets/js/sw-register.js" defer></script>
```

The registration script checks for service worker support and registers `sw.js` on page load:

```javascript
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(err => {
      console.error('ServiceWorker registration failed:', err);
    });
  });
}
```

The current service worker is empty. To turn the site into a Progressive Web App you can extend `sw.js` with caching strategies and add a `manifest.json` describing icons and start URL. The comment in `global-app.js` points to where service worker logic can be expanded:

```javascript
// ===== Register Service Worker (optional) =====
// If your project uses service workers for offline/notifications,
// include sw-register.js and write registration logic there.
```

## Deployment

Since the project is static it can be deployed on any static hosting platform such as GitHub Pages or Netlify. Simply upload the repository contents to your host of choice. Ensure that `sw.js` is served from the site root if you implement PWA features.

## Prerequisites

A modern web browser is all that is needed to view the site. For local development you will want either Python (3.8+) or Node.js (16+) to run a static server. No additional build tools are required.

