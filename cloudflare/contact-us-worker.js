// cloudflare/contact-us-worker.js

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  if (request.method !== 'POST') {
    return new Response('Expected POST request', { status: 405 });
  }

  try {
    const formData = await request.formData();
    const name = formData.get('name');
    const email = formData.get('email');
    const contactNumber = formData.get('contactNumber'); // Matches 'contact-number' from HTML
    const preferredDate = formData.get('preferredDate'); // Matches 'contact-date'
    const preferredTime = formData.get('preferredTime'); // Matches 'contact-time'
    const comments = formData.get('comments');       // Matches 'contact-comments'
    const recaptchaToken = formData.get('g-recaptcha-response');

    // --- 1. Verify ReCAPTCHA ---
    const RECAPTCHA_SECRET_KEY = 'YOUR_RECAPTCHA_SECRET_KEY_PLACEHOLDER';
    const recaptchaVerifyUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${RECAPTCHA_SECRET_KEY}&response=${recaptchaToken}`;

    const recaptchaRes = await fetch(recaptchaVerifyUrl, { method: 'POST' });
    const recaptchaJson = await recaptchaRes.json();

    if (!recaptchaJson.success || recaptchaJson.score < 0.5) { // Adjust score threshold for v3
      return new Response(JSON.stringify({ success: false, message: 'ReCAPTCHA verification failed.', details: recaptchaJson['error-codes'] }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // --- 2. Prepare Data ---
    const dataToStore = {
      name,
      email,
      contactNumber,
      preferredDate,
      preferredTime,
      comments,
      submissionTimestamp: new Date().toISOString(),
    };

    // --- 3. Encrypt Data (Conceptual) ---
    const payloadToSend = JSON.stringify({
      encryptedData: btoa(JSON.stringify(dataToStore)) // Simple Base64 "encryption" for placeholder
    });
    // Replace btoa with actual encryption in production!

    // --- 4. Forward to Google Apps Script ---
    const APPS_SCRIPT_CONTACT_US_URL = 'YOUR_APPS_SCRIPT_CONTACT_US_URL_PLACEHOLDER';

    const appsScriptResponse = await fetch(APPS_SCRIPT_CONTACT_US_URL, {
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

    return new Response(JSON.stringify({ success: true, message: 'Contact form data submitted successfully.' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in Contact Us worker:', error);
    return new Response(JSON.stringify({ success: false, message: 'Internal server error.', error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
