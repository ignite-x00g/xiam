# Ops Online Support

**Current Status:** This project provides a template for a secure, professional website. Please note that visual assets such as the company logo, hero image, and PWA icons are currently placeholders (paths exist in the code but actual files are missing from the repository). These will need to be added for the site to display correctly and for features like Open Graph images and PWA icons to function fully.

## Table of Contents
- [Installation](#installation)
- [Usage](#usage)
- [Configuration](#configuration)
- [Features](#features)
- [SEO & Accessibility Enhancements](#seo--accessibility-enhancements)
- [Security & Performance](#security--performance)
- [Contributing](#contributing)
- [License](#license)
- [Acknowledgments](#acknowledgments)

## Installation
(Details on how to set up and run the project locally would go here if applicable, e.g., if there were build steps or local server requirements. For this static site, it might be as simple as cloning and opening `index.html`.)

## Usage
The Ops Online Support website is designed to be a fully functional and responsive platform. Key interactive features include:

-   **Language Toggle:** Switch between English and Spanish for content and UI elements.
-   **Theme Toggle:** Switch between light and dark visual themes.
-   **Forms:**
    -   **Join Us Modal:** Features a comprehensive application form including:
        -   Basic contact information (name, email, contact number).
        -   Dynamic, user-expandable sections for Experience, Skills, Work Roles (with dates), Education (with dates), Certifications/Licenses (with dates), Continued Education (with dates), and Hobbies. Users can add multiple entries up to a defined limit for each of these.
        -   A multi-select field for "Would like to work" preferences (e.g., Remote, Freelance, Full-Time).
        -   File inputs for Resume and Cover Letter (note: file content PGP encryption is not handled client-side in the current implementation; only filenames are collected).
        -   Large text areas for a typed Cover Letter, "Tell us About Yourself", and "Reason to Hire Yourself".
    -   **Contact Us Modal:** A standard contact form for inquiries.
    -   **Client-Side PGP Encryption:** Data submitted through both the "Join Us" and "Contact Us" forms is PGP-encrypted client-side in `js/main.js` before being prepared for submission.
    -   **ReCAPTCHA v2 Integration:** Both forms are set up to include Google ReCAPTCHA v2 ("I'm not a robot") challenges. This is implemented client-side and requires valid site keys to be configured in `js/main.js`.
    -   **Backend Submission (Placeholder):** Form submissions (encrypted data + ReCAPTCHA token) are intended to be sent to backend Cloudflare Worker endpoints. The specific URLs for these workers are currently placeholders in `js/main.js` and need to be configured.
-   **SEO Optimized:** Includes structured data (JSON-LD), meta tags, and other considerations for search engine visibility.
-   **Mobile Optimization:** Fully responsive design.

## Configuration
To fully utilize and deploy this project, the following configurations are essential:

-   **ReCAPTCHA Keys:**
    -   Valid Google ReCAPTCHA v2 (Checkbox "I'm not a robot") site keys are required.
    -   These keys must be inserted into `js/main.js` by replacing the placeholder string `=============== YOUR_RECAPTCHA_SITE_KEY_HERE ===============`.
-   **PGP Encryption:**
    -   A PGP public key is embedded at the top of `js/main.js` (`PGP_PUBLIC_KEY` constant). This key is used for client-side encryption of form data.
    -   The corresponding PGP private key is required by your backend service (e.g., Cloudflare Worker, Google Apps Script) to decrypt the submitted data.
-   **Cloudflare Worker Endpoints (or other backend):**
    -   The `fetch` URLs for form submissions in `js/main.js` are placeholders (e.g., `=============== YOUR_CLOUDFLARE_WORKER_URL_JOIN ===============` and `=============== YOUR_CLOUDFLARE_WORKER_URL_CONTACT ===============`).
    -   These must be replaced with your actual backend endpoint URLs that are capable of receiving the JSON payload (containing encrypted data and ReCAPTCHA token) and processing it (including PGP decryption).
-   **Content Security Policy (CSP):**
    -   A restrictive CSP is implemented via `<meta>` tags in `index.html`.
    -   It is **strongly recommended** to implement this CSP (and other security headers) via HTTP response headers at your hosting provider or server level for better protection. Refer to `RECOMMENDED_SECURITY_HEADERS.md` for detailed guidance on essential security headers.
-   **Service Workers:** Caches core assets for offline functionality. The cache version and list of URLs to cache are defined in `js/service-worker.js`.

## Features
-   **Multi-Language Support:** Language toggle (English/Spanish) for UI elements and placeholder texts.
-   **Dynamic Theme Support:** Light and dark mode toggle with persistence via `localStorage`.
-   **Progressive Web App (PWA) Features:**
    -   Includes a Service Worker (`js/service-worker.js`) for offline caching of core application assets (HTML, CSS, JS).
    -   A Web App Manifest (`manifest.json`) is provided to allow users to "Add to Home Screen" on supported devices. (Note: Icon paths in `manifest.json` are placeholders and actual icon files need to be added to `/assets/icons/`).
-   **Forms with PGP Encryption & ReCAPTCHA:**
    -   "Join Us" and "Contact Us" modal forms.
    -   The "Join Us" form features dynamic sections for detailed information input.
    -   Client-side PGP encryption of form data.
    -   Google ReCAPTCHA v2 integration for spam protection.
-   **SEO Optimization:** Structured data (JSON-LD), meta descriptions, and keywords.
-   **Mobile-Friendly:** Fully responsive design for various screen sizes.

## SEO & Accessibility Enhancements
-   **SEO Metadata:**
    -   Optimized `title`, meta `description`, and meta `keywords`.
    -   Open Graph tags for enhanced social media sharing.
    -   Structured Data (JSON-LD) using Schema.org for Organization.
-   **Accessibility Improvements:**
    -   ARIA labels added to interactive elements like buttons and modal triggers.
    -   Form inputs are associated with labels.
    -   Semantic HTML structure.

## Security & Performance
### Security
-   **Client-Side Input Sanitization:** Basic sanitization (`sanitizeInput` function in `js/main.js`) is applied to text inputs as an initial defense against XSS. However, robust server-side validation and sanitization of all submitted data (within your backend service like a Cloudflare Worker or Google Apps Script) is **critical** for security and is assumed to be implemented.
-   **Client-Side PGP Encryption:** Form data from the "Join Us" and "Contact Us" modals is PGP-encrypted client-side before transmission, protecting the data in transit to your backend.
-   **Content Security Policy (CSP):** A strong CSP is defined in `index.html` to mitigate XSS and other injection attacks by restricting the sources of content (scripts, styles, fonts, etc.). It is recommended to deploy these via HTTP headers. See `RECOMMENDED_SECURITY_HEADERS.md`.
-   **Subresource Integrity (SRI):** Used for third-party libraries (Font Awesome, OpenPGP.js) loaded from CDNs to ensure they haven't been tampered with.
-   **Vulnerability Disclosure:** The dedicated `security.html` page has been removed. Security researchers are encouraged to use the contact email provided in the `.well-known/security.txt` file.

### Performance
-   **Caching with Service Workers:** Faster load times and offline access for core assets.
-   **Optimized Assets (Placeholder):** The project is structured for optimized images and other assets, though actual optimized assets need to be added.
-   `async` and `defer` attributes used for scripts to avoid render-blocking.

## Contributing
If you would like to contribute to this project, please follow these steps:
1.  Fork the repository.
2.  Create a new branch (`git checkout -b feature-name`).
3.  Make your changes.
4.  Commit your changes (`git commit -am 'Add new feature'`).
5.  Push to the branch (`git push origin feature-name`).
6.  Create a new Pull Request.

## License
This project is licensed under the MIT License - see the `LICENSE.md` file for details.

## Acknowledgments
-   Google reCAPTCHA for form security.
-   FontAwesome for icons.
-   OpenPGP.js for client-side encryption.
-   General best practices for Service Workers, CSP, and SEO.
