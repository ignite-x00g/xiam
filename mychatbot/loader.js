// mychatbot/loader.js - Iframe Loader for the new chatbot system, integrated with DMM

(function() { // IIFE to scope variables
    let chatbotIframe = null;
    let iframeLoaded = false;
    let themeObserver = null;
    const chatbotRelativeUrl = 'mychatbot/iframe-content.html'; // Relative to project root

    // Function to apply theme to iframe (called by observer and on load)
    function applyThemeToIframe(theme) {
        if (chatbotIframe && chatbotIframe.contentWindow && chatbotIframe.contentWindow.document && chatbotIframe.contentWindow.document.body) {
            chatbotIframe.contentWindow.document.body.setAttribute('data-theme', theme);
            // console.log(`INFO:ChatbotLoader/applyThemeToIframe: Applied theme "${theme}" to chatbot iframe.`);
        } else {
            // console.warn('WARN:ChatbotLoader/applyThemeToIframe: Chatbot iframe content not fully accessible yet for themeing.');
        }
    }

    // Function to send initial config (API URL, language) to iframe
    function sendInitialConfigToIframe() {
        if (!chatbotIframe || !chatbotIframe.contentWindow) return;

        const initialLang = typeof window.getCurrentLanguage === 'function' ? window.getCurrentLanguage() : 'en';
        const apiUrl = window.CHAT_API_URL || null; // Get from global scope (config.js)

        try {
            chatbotIframe.contentWindow.postMessage({ type: 'languageChange', language: initialLang }, window.location.origin);
            if (apiUrl) {
                chatbotIframe.contentWindow.postMessage({ type: 'configUpdate', apiUrl: apiUrl }, window.location.origin);
            }
            // console.log(`INFO:ChatbotLoader/sendInitialConfig: Sent initial lang "${initialLang}" and API URL to iframe.`);
        } catch (e) {
            console.warn("Could not post initial config to chatbot iframe.", e);
        }
    }

    // Function to set up theme synchronization via MutationObserver
    function setupThemeSync() {
        if (!document.body || !chatbotIframe) return;

        if (themeObserver) themeObserver.disconnect();

        themeObserver = new MutationObserver((mutationsList) => {
            for (const mutation of mutationsList) {
                // Using 'class' attribute for theme changes (body.dark / body.light-theme)
                if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                    const newTheme = document.body.classList.contains('light-theme') ? 'light' : 'dark';
                    applyThemeToIframe(newTheme);
                     if (chatbotIframe && chatbotIframe.contentWindow) {
                        chatbotIframe.contentWindow.postMessage({ type: 'themeChange', theme: newTheme }, window.location.origin);
                    }
                }
            }
        });
        themeObserver.observe(document.body, { attributes: true, attributeFilter: ['class'] });
        // console.log('INFO:ChatbotLoader/setupThemeSync: MutationObserver set up for theme changes on parent body class.');

        // Apply current theme immediately
        const currentTheme = document.body.classList.contains('light-theme') ? 'light' : 'dark';
        applyThemeToIframe(currentTheme);
    }

    // This function will be called by DMM when the 'iframeChatbotModal' is opened.
    window.init_iframeChatbotModal = function(modalElement) {
        const placeholder = modalElement.querySelector('#chatbot-iframe-placeholder');
        if (!placeholder) {
            console.error('ERROR:ChatbotLoader/init_iframeChatbotModal: #chatbot-iframe-placeholder not found in modal.');
            return;
        }

        if (!iframeLoaded) {
            iframeLoaded = true; // Set early to prevent multiple loads if modal is rapidly closed/opened

            chatbotIframe = document.createElement('iframe');
            // Correct path: Assuming loader.js is in mychatbot/, and iframe-content.html is also in mychatbot/
            // If DMM loads this script from project root, then path needs to be 'mychatbot/iframe-content.html'
            // The `chatbotRelativeUrl` is defined relative to project root.
            chatbotIframe.src = chatbotRelativeUrl;
            chatbotIframe.title = 'Chat Support'; // TODO: Localize?
            chatbotIframe.style.width = '100%';
            chatbotIframe.style.height = '100%';
            chatbotIframe.style.border = 'none';

            chatbotIframe.onload = () => {
                // console.log('INFO:ChatbotLoader/iframe.onload: Chatbot iframe content loaded.');
                sendInitialConfigToIframe();
                setupThemeSync(); // Setup observer after iframe confirms load and can receive messages
            };

            placeholder.innerHTML = ''; // Clear placeholder
            placeholder.appendChild(chatbotIframe);
            // console.log('INFO:ChatbotLoader/init_iframeChatbotModal: Chatbot iframe created and appended.');

        } else if (chatbotIframe && chatbotIframe.contentWindow) {
            // If iframe already exists, ensure it has the latest config and theme.
            // This might happen if the modal was closed and reopened without a page reload.
            // console.log('INFO:ChatbotLoader/init_iframeChatbotModal: Chatbot iframe already loaded, re-sending config/theme.');
            sendInitialConfigToIframe();
            setupThemeSync(); // Re-establish observer if needed (e.g. if disconnected on modal close)
        }
    };

    // Cleanup when modal is closed (optional, DMM doesn't have explicit close callback)
    // If we need to disconnect observer when modal is not visible:
    // 1. DMM would need to provide a close event/callback.
    // 2. Or, this script could observe the modal's 'active' class.
    // For now, observer remains active. It's low overhead.

})();
// console.log('INFO:ChatbotLoader: mychatbot/loader.js script loaded.');
