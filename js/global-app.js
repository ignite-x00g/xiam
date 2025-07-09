// js/global-app.js

const qs = (sel, ctx = document) => ctx.querySelector(sel);
const qsa = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

// Other global app logic can be added here.

/**
 * Initializes the iframe chatbot modal.
 * This function is expected to be called by the Dynamic Modal Manager (DMM)
 * when the modal with ID 'iframeChatbotModal' is opened.
 * @param {HTMLElement} modalElement - The modal element itself.
 */
window.init_iframeChatbotModal = function(modalElement) {
    const placeholder = qs('#chatbot-iframe-placeholder', modalElement);
    if (!placeholder) {
        console.error('Chatbot iframe placeholder not found in modal:', modalElement);
        return;
    }

    // Check if an iframe already exists to prevent duplicates
    if (qs('iframe', placeholder)) {
        // console.log('Chatbot iframe already exists.');
        // Optionally, re-focus or send a message to the existing iframe
        return;
    }

    const iframe = document.createElement('iframe');
    iframe.setAttribute('src', 'components/chatbot/chatbot.html');
    iframe.setAttribute('frameborder', '0');
    iframe.setAttribute('width', '100%'); // Fit placeholder width
    iframe.setAttribute('height', '100%'); // Fit placeholder height
    iframe.setAttribute('title', 'Chatbot AI Assistant'); // Accessibility
    // Potentially add sandbox attributes if needed for security, e.g., iframe.sandbox = "allow-scripts allow-same-origin";

    // Clear placeholder content (e.g., loading message) before appending iframe
    placeholder.innerHTML = '';
    placeholder.appendChild(iframe);

    iframe.onload = () => {
        // console.log('Chatbot iframe loaded successfully.');
        // Post initial theme and language to the iframe once loaded
        if (window.getCurrentTheme && window.getCurrentLanguage && iframe.contentWindow) {
            const currentTheme = window.getCurrentTheme();
            const currentLang = window.getCurrentLanguage();
            try {
                iframe.contentWindow.postMessage({ type: 'themeChange', theme: currentTheme }, window.location.origin);
                iframe.contentWindow.postMessage({ type: 'languageChange', language: currentLang }, window.location.origin);
                // console.log(`Initial theme (${currentTheme}) and lang (${currentLang}) sent to chatbot iframe.`);
            } catch (e) {
                console.warn("Could not post initial theme/language message to chatbot iframe.", e);
            }
        }
    };

    iframe.onerror = () => {
        console.error('Chatbot iframe failed to load.');
        placeholder.innerHTML = '<p>Error loading chatbot. Please try again later.</p>'; // Show error in placeholder
    };
};
