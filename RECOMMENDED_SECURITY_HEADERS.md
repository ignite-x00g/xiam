# Recommended Security Headers

This document outlines recommended HTTP security headers that should be configured at your hosting provider level to enhance the security of your website. Proper implementation of these headers helps protect against various common web vulnerabilities.

**Note on Implementation:** The method for setting these headers varies depending on your hosting platform (e.g., Netlify uses a `_headers` file, Vercel uses `vercel.json`, Cloudflare can set them via Page Rules or Workers, AWS CloudFront via distribution settings, Firebase Hosting via `firebase.json`). Consult your hosting provider's documentation for specific instructions.

---

## 1. Strict-Transport-Security (HSTS)

**Header:**
`Strict-Transport-Security: max-age=31536000; includeSubDomains; preload`

**Description:**
HTTP Strict Transport Security (HSTS) is a web security policy mechanism that helps to protect websites against protocol downgrade attacks and cookie hijacking. It allows web servers to declare that web browsers (or other complying user agents) should only interact with it using secure HTTPS connections, and never via the insecure HTTP protocol.

*   `max-age=31536000`: Tells the browser to remember to enforce HTTPS for one year.
*   `includeSubDomains`: Applies the HSTS rule to all subdomains of the site.
*   `preload`: Indicates your consent to have your domain included in browser HSTS preload lists. This is a powerful feature ensuring that browsers will only ever connect to your site via HTTPS, even on the very first visit. (Ensure your site is fully HTTPS functional before enabling `preload` and submitting to the list).

**Important:** Only enable HSTS and especially `preload` when you are certain that your entire site (including all subdomains that provide services) can be served over HTTPS.

---

## 2. X-Content-Type-Options

**Header:**
`X-Content-Type-Options: nosniff`

**Description:**
This header prevents the browser from trying to MIME-sniff the `Content-Type` of a response away from the one declared by the server. It helps to prevent attacks where a file might be misinterpreted by the browser (e.g., an uploaded text file being treated as HTML or JavaScript).

---

## 3. X-Frame-Options

**Header:**
`X-Frame-Options: DENY`

**Description:**
This header provides clickjacking protection by indicating whether or not a browser should be allowed to render a page in a `<frame>`, `<iframe>`, `<embed>`, or `<object>`.

*   `DENY`: The page cannot be displayed in a frame, regardless of the site attempting to do so.
*   `SAMEORIGIN`: The page can only be displayed in a frame on the same origin as the page itself.

**Note:** The `Content-Security-Policy` header's `frame-ancestors` directive is more modern and flexible. Your current CSP includes `frame-ancestors 'none'`, which is equivalent to `X-Frame-Options: DENY`. Including `X-Frame-Options: DENY` provides an additional layer of defense for older browsers that may not support CSP `frame-ancestors`.

---

## 4. Referrer-Policy

**Header:**
`Referrer-Policy: strict-origin-when-cross-origin`

**Description:**
The `Referrer-Policy` header controls how much referrer information (sent via the `Referer` header) should be included with requests.

*   `strict-origin-when-cross-origin`: Sends the full URL when making a same-origin request, but only sends the origin (scheme, host, port) for cross-origin requests. This is a good balance between functionality and privacy.
*   Other common values include `no-referrer` (no referrer information is sent) or `same-origin` (referrer is sent for same-site, but cross-origin requests will contain no referrer information).

Choose the policy that best fits your site's needs regarding analytics and privacy.

---

## 5. Permissions-Policy (formerly Feature-Policy)

**Header Example:**
`Permissions-Policy: microphone=(), camera=(), geolocation=(), payment=(), usb=(), autoplay=()`

**Description:**
Permissions-Policy is a mechanism that allows web developers to selectively enable, disable, and modify the behavior of certain browser features and APIs on their website. This helps to enhance security and privacy by ensuring that a page can only use the features it needs.

*   Specify features and their allowed origins (e.g., `geolocation=(self "https://trusted.example.com")` allows geolocation for the current site and a trusted domain).
*   `()` (empty parentheses) disables the feature for all origins.
*   `*` allows the feature for all origins (use with extreme caution).

**Recommendation:** List all features your site *does not* use and explicitly disable them. For a static informational site, many features can likely be disabled.
Example for a site that needs no special device access:
`Permissions-Policy: accelerometer=(), ambient-light-sensor=(), autoplay=(), battery=(), camera=(), display-capture=(), document-domain=(), encrypted-media=(), execution-while-not-rendered=(), execution-while-out-of-viewport=(), fullscreen=(), gamepad=(), geolocation=(), gyroscope=(), keyboard-map=(), magnetometer=(), microphone=(), midi=(), navigation-override=(), payment=(), picture-in-picture=(), publickey-credentials-get=(), screen-wake-lock=(), sync-xhr=(), usb=(), xr-spatial-tracking=(), clipboard-write=(self), clipboard-read=()`

Adjust the list based on actual needs. The example above is quite restrictive.

---

## 6. Content-Security-Policy (CSP)

**Header:**
(The value for this header should be the final, refined CSP string developed for your site.)

**Example Placeholder (will be updated):**
`Content-Security-Policy: default-src 'self'; script-src 'self' https://www.google.com/recaptcha/ https://www.gstatic.com/recaptcha/ https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/js/all.min.js https://unpkg.com/openpgp@5.5.0/dist/openpgp.min.js; style-src 'self' 'nonce-DYNAMIC_NONCE_HERE' https://cdnjs.cloudflare.com; img-src 'self' https://trusted-image-cdn.com; font-src 'self' https://cdnjs.cloudflare.com; connect-src 'self' https://join.gabrieloor-cv1.workers.dev/ https://tiny-resonance-110a.gabrieloor-cv1.workers.dev/; frame-ancestors 'none'; object-src 'none'; base-uri 'self'; form-action 'self' https://join.gabrieloor-cv1.workers.dev/ https://tiny-resonance-110a.gabrieloor-cv1.workers.dev/;`

**Description:**
Content Security Policy (CSP) is an added layer of security that helps to detect and mitigate certain types of attacks, including Cross-Site Scripting (XSS) and data injection attacks.

**Important:**
*   It is strongly recommended to deliver your CSP via HTTP headers rather than solely relying on `<meta>` tags. Headers are processed earlier and are generally more robust.
*   The CSP string provided here is a placeholder based on initial analysis. It will be refined as per the improvement plan. Ensure the final version from the plan is used.
*   If dynamic nonces are used, the `DYNAMIC_NONCE_HERE` must be a server-generated, unique value for each request. This is challenging on purely static hosting without edge functions or a backend component.

---

By implementing these headers, you significantly improve your website's resilience against common attacks. Always test thoroughly after applying header changes.
```
