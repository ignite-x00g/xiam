// cloudflare/join-us-worker.js

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

const ALLOWED_ORIGIN = globalThis.ALLOWED_ORIGIN; // Provided via Cloudflare env

function scanForMaliciousContent(data) {
  const pattern = /<script|javascript:|onerror\s*=|onload\s*=|eval\(|<iframe|<img/i;
  for (const [field, value] of Object.entries(data)) {
    if (typeof value === 'string' && pattern.test(value)) {
      return { safe: false, field };
    }
  }
  return { safe: true };
}

async function handleRequest(request) {
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    });
  }

  if (request.method !== 'POST') {
    return new Response('Expected POST request', {
      status: 405,
      headers: { 'Access-Control-Allow-Origin': ALLOWED_ORIGIN }
    });
  }

  const requestOrigin = request.headers.get('Origin');
  if (requestOrigin !== ALLOWED_ORIGIN) {
    return new Response('Unauthorized origin', {
      status: 403,
      headers: { 'Access-Control-Allow-Origin': ALLOWED_ORIGIN }
    });
  }

  try {
    const formData = await request.formData();
    const website = formData.get('website');
    if (website) {
      return new Response(JSON.stringify({ success: false, message: 'Bot detected' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': ALLOWED_ORIGIN },
      });
    }

    const name = formData.get('name');
    const email = formData.get('email');
    const contact = formData.get('contact');
    const date = formData.get('date');
    const time = formData.get('time');
    const comment = formData.get('comment');
    const recaptchaToken = formData.get('g-recaptcha-response'); // Assuming this name from client-side

    // --- 1. Verify ReCAPTCHA ---
    // IMPORTANT: Replace with your actual ReCAPTCHA secret key
    const RECAPTCHA_SECRET_KEY = 'YOUR_RECAPTCHA_SECRET_KEY_PLACEHOLDER';
    const recaptchaVerifyUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${RECAPTCHA_SECRET_KEY}&response=${recaptchaToken}`;

    const recaptchaRes = await fetch(recaptchaVerifyUrl, { method: 'POST' });
    const recaptchaJson = await recaptchaRes.json();

    if (!recaptchaJson.success || recaptchaJson.score < 0.5) { // Adjust score threshold for v3 if used
      // If using v2, just check recaptchaJson.success
      return new Response(JSON.stringify({ success: false, message: 'ReCAPTCHA verification failed.', details: recaptchaJson['error-codes'] }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': ALLOWED_ORIGIN },
      });
    }

    // --- 2. Prepare Data ---
    const dataToStore = {
      name,
      email,
      contact,
      date,
      time,
      comment,
      submissionTimestamp: new Date().toISOString(),
      // Add any other processing or data enrichment here
    };

    const scanResult = scanForMaliciousContent(dataToStore);
    if (!scanResult.safe) {
      return new Response(JSON.stringify({ success: false, message: `Malicious content detected in field ${scanResult.field}` }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': ALLOWED_ORIGIN },
      });
    }

    // --- 3. Encrypt Data (Conceptual) ---
    // In a real scenario, encrypt `dataToStore` before sending.
    // This might involve a shared secret or asymmetric encryption.
    // For this example, we'll send it as JSON, but flag it as needing encryption.
    // const encryptedData = await encryptData(JSON.stringify(dataToStore), ENCRYPTION_KEY);
    const payloadToSend = JSON.stringify({
      encryptedData: btoa(JSON.stringify(dataToStore)) // Simple Base64 "encryption" for placeholder
    });
    // Replace btoa with actual encryption in production!

    // --- 4. Forward to Google Apps Script ---
    // IMPORTANT: Replace with your actual Google Apps Script Web App URL
    const APPS_SCRIPT_JOIN_US_URL = 'YOUR_APPS_SCRIPT_JOIN_US_URL_PLACEHOLDER';

    const appsScriptResponse = await fetch(APPS_SCRIPT_JOIN_US_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: payloadToSend,
    });

    if (!appsScriptResponse.ok) {
      const errorText = await appsScriptResponse.text();
      throw new Error(`Apps Script error: ${appsScriptResponse.status} ${errorText}`);
    }

    const appsScriptJson = await appsScriptResponse.json();
    if (!appsScriptJson.success) {
        throw new Error(`Apps Script processing error: ${appsScriptJson.message || 'Unknown error'}`);
    }

    return new Response(JSON.stringify({ success: true, message: 'Form data submitted successfully.' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': ALLOWED_ORIGIN },
    });

  } catch (error) {
    console.error('Error in Join Us worker:', error);
    return new Response(JSON.stringify({ success: false, message: 'Internal server error.', error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': ALLOWED_ORIGIN },
    });
  }
}

// Conceptual encryption function (replace with actual crypto library)
// async function encryptData(data, key) {
//   // Use Web Crypto API or a library for proper encryption
//   // This is a placeholder!
//   // Example: const iv = crypto.getRandomValues(new Uint8Array(12));
//   // const encodedData = new TextEncoder().encode(data);
//   // const encrypted = await crypto.subtle.encrypt({ name: 'AES-GCM', iv: iv }, key, encodedData);
//   // return { iv: Array.from(iv), data: Array.from(new Uint8Array(encrypted)) };
//   return btoa(data); // Simple Base64 for placeholder ONLY
// }
