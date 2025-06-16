# Technical Details

This document provides technical setup, configuration, and implementation details for the Ops Online Solutions website.

---
*(Further content will be added by relocating sections from README.md)*
---

## Configuration Details

  This project uses the following configuration:

ReCAPTCHA: For secure form submission.

  Service Workers: To cache important assets and provide offline functionality.

CORS: Configured to ensure cross-origin requests are handled properly.

  Content Security Policy (CSP): Ensures only authorized scripts and resources are loaded.

### Cloudflare Worker Environment

The form handlers (`contact-us-worker.js` and `join-us-worker.js`) rely on environment variables defined in `cloudflare/wrangler.toml`:

```
[vars]
ALLOWED_ORIGIN             = "<your site>"
APPS_SCRIPT_CONTACT_US_URL = "<Google Apps Script URL for contact form>"
APPS_SCRIPT_JOIN_US_URL    = "<Google Apps Script URL for join form>"
```

Set these values with `wrangler secret` or in your deployment environment to avoid hard‑coding sensitive URLs.

---

## Feature Implementation Details

*   **Offline Support:** Service Worker for Offline Support: Caches essential files to allow offline browsing.
*   **Secure Forms:** ReCAPTCHA is implemented to protect forms from abuse.

---

## Accessibility Implementation

  Added ARIA labels to buttons and links for better screen reader support.

  Form inputs are correctly labeled, ensuring better navigation for users with disabilities.

---

## Performance Optimizations (from README)

  Caching with Service Workers for faster load times.

  Images are optimized for performance.

  Lazy loading for images that appear off-screen initially.

---
