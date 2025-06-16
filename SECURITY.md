# Security Enhancements

This document outlines recommended security enhancements for the Ops Online Solutions website.

## 1. Content Security Policy (CSP) via HTTP Headers

Currently, the Content Security Policy (CSP) is implemented using a `<meta>` tag in `index.html`.

**Recommendation:** Move the CSP from a `<meta>` tag to an HTTP response header (e.g., `Content-Security-Policy`). This is generally more robust and offers additional capabilities, such as reporting violations using the `report-uri` or `report-to` directives.

**Current Meta Tag CSP:**
`default-src 'self'; script-src 'self' https://www.google.com/recaptcha/ https://www.gstatic.com/recaptcha/ https://cdnjs.cloudflare.com; style-src 'self' https://cdnjs.cloudflare.com; img-src 'self' data: https://trusted-image-cdn.com; font-src 'self' https://cdnjs.cloudflare.com; connect-src 'self'; frame-src 'self' https://www.google.com/recaptcha/ https://recaptcha.google.com/; frame-ancestors 'none'; object-src 'none'; base-uri 'self'; form-action 'self';`

**Example HTTP Header (should be tailored and tested):**
`Content-Security-Policy: default-src 'self'; script-src 'self' https://www.google.com/recaptcha/ https://www.gstatic.com/recaptcha/ https://cdnjs.cloudflare.com/ajax/libs/font-awesome/ ; style-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com/ajax/libs/font-awesome/ ; img-src 'self' data: https://trusted-image-cdn.com; font-src 'self' https://cdnjs.cloudflare.com/ajax/libs/font-awesome/ ; connect-src 'self'; frame-src 'self' https://www.google.com/recaptcha/ https://recaptcha.google.com/; frame-ancestors 'none'; object-src 'none'; base-uri 'self'; form-action 'self'; report-uri /csp-violation-report-endpoint;`

*(Note: The example above might need adjustments, especially if inline styles/scripts are used that are not covered. 'unsafe-inline' for styles is often needed for compatibility but should be reviewed. The `report-uri` directive requires a backend endpoint to collect reports.)*

## 2. HTTP Strict Transport Security (HSTS)

HSTS is a web security policy mechanism that helps to protect websites against protocol downgrade attacks and cookie hijacking. It tells web browsers to only interact with the website using HTTPS connections.

**Recommendation:** Implement HSTS by adding the `Strict-Transport-Security` HTTP response header.

**Example HSTS Header:**
`Strict-Transport-Security: max-age=31536000; includeSubDomains; preload`

*   `max-age=31536000`: Tells the browser to remember to enforce HTTPS for one year.
*   `includeSubDomains`: Applies the HSTS policy to all subdomains.
*   `preload`: Indicates consent to be included in browser preload lists, which can further enhance security. (Submission to a preload list is a separate step).

**Implementation Note:** HSTS should only be enabled when you are confident that all parts of your site can be served over HTTPS.

---

*This document will be updated as more security measures are implemented.*

## 3. Subresource Integrity (SRI)

Subresource Integrity (SRI) is a security feature that enables browsers to verify that resources they fetch (for example, from a CDN) are delivered without unexpected manipulation. It works by allowing you to provide a cryptographic hash that a fetched resource must match.

**Action:** SRI attributes should be added to all externally hosted scripts and stylesheets.

**Current Status:**
*   For FontAwesome CSS (`https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css`), the `integrity` attribute has been added to `index.html` with a placeholder hash:
    ```html
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css" integrity="sha384-PLACEHOLDER_HASH_PLEASE_CALCULATE_MANUALLY" crossorigin="anonymous">
    ```
    **Manual step required:** The `sha384-PLACEHOLDER_HASH_PLEASE_CALCULATE_MANUALLY` needs to be replaced with the actual Base64-encoded SHA-384 hash of the CSS file's content. This is due to limitations in calculating the hash automatically in the current environment. You can generate the hash using online tools or command-line utilities like OpenSSL. For example:
    `curl -sL "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css" | openssl dgst -sha384 -binary | openssl base64 -A`

*   For Google ReCAPTCHA (`https://www.google.com/recaptcha/api.js?...`), SRI is generally not applied directly to the main `api.js` script because its content can be dynamic or act as a loader for other versioned scripts. Google manages the integrity of these scripts.

Ensure `crossorigin="anonymous"` is also present on the `<link>` or `<script>` tags when SRI is used for resources loaded from a different origin.
---

## 4. Cookie Security Attributes

While the current backend scripts (Cloudflare Workers and Google Apps Scripts for form handling) do not appear to set any custom cookies, if cookies are introduced in the future, or are set by other platform services, they **must** be configured securely.

**Recommendations for All Cookies:**

*   **`Secure` Attribute:** Ensure the `Secure` attribute is set for all cookies. This prevents the cookie from being transmitted over unencrypted HTTP connections.
    *   Example: `Set-Cookie: id=a3fWa; Secure; HttpOnly; SameSite=Strict`
*   **`HttpOnly` Attribute:** Set the `HttpOnly` attribute for all cookies that do not need to be accessed by client-side JavaScript. This helps mitigate the risk of cross-site scripting (XSS) attacks stealing cookies.
    *   Example: `Set-Cookie: sessionID=xyz; Secure; HttpOnly; SameSite=Strict`
*   **`SameSite` Attribute:** Set the `SameSite` attribute to control whether cookies are sent with cross-origin requests. This helps protect against cross-site request forgery (CSRF) attacks.
    *   `SameSite=Strict`: The cookie will only be sent in a first-party context. This is the most restrictive and secure option.
    *   `SameSite=Lax`: The cookie will be sent with top-level navigations and will be sent along with GET requests initiated by third-party websites. This is a reasonable default for many cases.
    *   `SameSite=None`: The cookie will be sent in all contexts, including cross-origin requests. If `SameSite=None` is used, the `Secure` attribute **must** also be set. This is typically for cookies intended for cross-site usage.
    *   Example: `Set-Cookie: preferences=abc; Secure; HttpOnly; SameSite=Lax`

**Verification:**
Regularly audit any services or code that might set cookies to ensure these attributes are correctly applied. Browser developer tools can be used to inspect cookie attributes.

---

## Additional Security Notes (from README)

  All form data is validated both on the client and server side.

  Content Security Policy (CSP) to avoid cross-site scripting (XSS) attacks.

---
