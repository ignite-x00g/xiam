// mychatbot/iframe-script.js
(function() { // IIFE to scope variables
    // Define qs and qsa locally for full encapsulation within the iframe
    const qs = (sel, ctx = document) => ctx.querySelector(sel);
    const qsa = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

    let currentChatbotLanguage = 'en'; // Default language
    let chatAPIEndpoint = null; // To be configured by parent

    // DOM Elements (assuming IDs from a standard internal HTML structure for the iframe)
    // These IDs should match the ones in 'mychatbot/iframe-content.html'
    const chatLog = qs('#chat-log'); // Assuming #chat-log is the ID in iframe-content.html
    const chatForm = qs('#chat-form'); // Assuming #chat-form is the form ID
    const chatInput = qs('#chat-input'); // Assuming #chat-input is the input field ID
    const humanVerificationCheckbox = qs('#human-verification'); // Assuming #human-verification is the checkbox ID
    const sendButton = qs('#chat-send-button'); // Assuming #chat-send-button is the send button ID

    function updateSendButtonState() {
        if (sendButton && chatInput && humanVerificationCheckbox) {
            const isHumanVerified = humanVerificationCheckbox.checked;
            const hasText = chatInput.value.trim() !== '';
            sendButton.disabled = !(isHumanVerified && hasText);
        }
    }

    function updateChatInputState() {
        if (chatInput && humanVerificationCheckbox) {
            chatInput.disabled = !humanVerificationCheckbox.checked;
            if (humanVerificationCheckbox.checked && document.activeElement !== chatInput) {
                 // Optional: focus logic if input just became enabled
            }
        }
    }

    function addMessageToLog(message, type, isUserMessage = false) {
        if (!chatLog) return;
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', type); // e.g., 'user-message' or 'bot-message'

        let displayMessage = message;
        if (!isUserMessage && type === 'bot-message') { // Attempt to translate known bot phrases
            // This is a simplified translation for example. A more robust i18n library would be better.
            const translations = {
                "Hello! How can I help you today?": {
                    "es": "¡Hola! ¿Cómo puedo ayudarte hoy?"
                },
                "Please verify you are human.": {
                    "es": "Por favor, verifica que eres humano."
                },
                "I'm sorry, I didn't understand that. Can you rephrase?": {
                    "es": "Lo siento, no entendí eso. ¿Puedes reformularlo?"
                },
                "Thinking...": {
                    "es": "Pensando..."
                },
                "Error: Could not reach the AI assistant. Please try again later.": {
                    "es": "Error: No se pudo contactar al asistente de IA. Por favor, inténtalo de nuevo más tarde."
                },
                 "No reply from server.": {
                    "es": "No hay respuesta del servidor."
                }
                // Add more known phrases here
            };
            if (translations[message] && translations[message][currentChatbotLanguage]) {
                displayMessage = translations[message][currentChatbotLanguage];
            }
        }
        messageDiv.textContent = displayMessage;
        chatLog.appendChild(messageDiv);
        chatLog.scrollTop = chatLog.scrollHeight;
    }

    async function handleFormSubmit(event) {
        event.preventDefault();
        if (!humanVerificationCheckbox || !humanVerificationCheckbox.checked) {
            addMessageToLog('Please verify you are human.', 'bot-message');
            if(chatInput) chatInput.disabled = true; // Re-disable if verification failed
            if(sendButton) sendButton.disabled = true;
            return;
        }
        if (!chatInput) return;
        const userMessage = chatInput.value.trim();
        if (!userMessage) return;

        addMessageToLog(userMessage, 'user-message', true);
        chatInput.value = '';
        updateSendButtonState();

        addMessageToLog('Thinking...', 'bot-message'); // Thinking indicator

        if (!chatAPIEndpoint) {
            console.error("Chat API endpoint not configured in iframe.");
            addMessageToLog("Error: Chat service not configured.", 'bot-message');
            if (chatLog.lastChild && chatLog.lastChild.textContent === 'Thinking...') {
                 chatLog.removeChild(chatLog.lastChild); // Remove "Thinking..."
            }
            return;
        }

        try {
            const response = await fetch(chatAPIEndpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: userMessage })
            });

            if (chatLog.lastChild && chatLog.lastChild.textContent === 'Thinking...') {
                 chatLog.removeChild(chatLog.lastChild); // Remove "Thinking..."
            }

            if (!response.ok) {
                throw new Error(`API request failed with status ${response.status}`);
            }
            const data = await response.json();
            addMessageToLog(data.reply || "No reply from server.", 'bot-message');

        } catch (error) {
            console.error("Chatbot API error in iframe:", error);
            if (chatLog.lastChild && chatLog.lastChild.textContent === 'Thinking...') {
                 chatLog.removeChild(chatLog.lastChild); // Remove "Thinking..." in case of error too
            }
            addMessageToLog("Error: Could not reach the AI assistant. Please try again later.", 'bot-message');
        } finally {
            if(sendButton && humanVerificationCheckbox) sendButton.disabled = !humanVerificationCheckbox.checked; // Re-evaluate send button
        }
    }

    function applyChatbotTranslations(lang) {
        currentChatbotLanguage = lang;
        document.documentElement.lang = lang; // Set lang for iframe's own document

        // Translate static text content within the iframe
        qsa('[data-en], [data-es]').forEach(el => {
            const textKey = (lang === 'es') ? 'data-es' : 'data-en';
            const text = el.getAttribute(textKey);
            if (text !== null) el.textContent = text;
        });

        // Translate placeholders
        const inputElement = qs('#chat-input'); // Ensure this ID exists in iframe-content.html
        if (inputElement && inputElement.hasAttribute('data-placeholder-en') && inputElement.hasAttribute('data-placeholder-es')) {
            const placeholderKey = (lang === 'es') ? 'data-placeholder-es' : 'data-placeholder-en';
            inputElement.setAttribute('placeholder', inputElement.getAttribute(placeholderKey));
        }

        // Translate aria-labels and titles if any
         qsa('[data-aria-label-en], [data-aria-label-es]').forEach(el => {
            const labelKey = (lang === 'es') ? 'data-aria-label-es' : 'data-aria-label-en';
            const labelText = el.getAttribute(labelKey);
            if (labelText !== null) el.setAttribute('aria-label', labelText);
        });
    }

    // Event listener for messages from parent window
    window.addEventListener('message', (event) => {
        // Add basic origin check for security if your parent origin is fixed
        // if (event.origin !== 'https://your-parent-domain.com') return;

        const data = event.data;
        if (data && data.type) {
            switch (data.type) {
                case 'themeChange':
                    document.body.setAttribute('data-theme', data.theme);
                    // console.log('Chatbot iframe theme changed to:', data.theme);
                    break;
                case 'languageChange':
                    // console.log('Chatbot iframe language change requested to:', data.language);
                    applyChatbotTranslations(data.language);
                    break;
                case 'configUpdate':
                    if (data.apiUrl) {
                        chatAPIEndpoint = data.apiUrl;
                        // console.log('Chatbot iframe API URL configured:', chatAPIEndpoint);
                    }
                    break;
            }
        }
    });

    // Initial setup on DOMContentLoaded within the iframe
    document.addEventListener('DOMContentLoaded', () => {
        if (humanVerificationCheckbox) {
            if(chatInput) chatInput.disabled = true; // Initial state
            if(sendButton) sendButton.disabled = true; // Initial state

            humanVerificationCheckbox.addEventListener('change', () => {
                updateChatInputState();
                updateSendButtonState();
                if (humanVerificationCheckbox.checked && chatInput && !chatInput.disabled) {
                    chatInput.focus();
                }
            });
        }
        if (chatInput) {
            chatInput.addEventListener('input', updateSendButtonState);
        }
        if (chatForm) {
            chatForm.addEventListener('submit', handleFormSubmit);
        } else {
            console.error('Chatbot form (#chat-form) not found in iframe DOM.');
        }

        // Signal to parent that iframe is ready for initial config if needed,
        // though loader.js now sends it on iframe.onload
        // if (window.parent && window.parent !== window) {
        //     window.parent.postMessage({ type: 'ops-chatbot-iframe-ready' }, '*');
        // }
    });

})();
