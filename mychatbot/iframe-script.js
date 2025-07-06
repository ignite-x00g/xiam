// components/chatbot/chatbot-widget.js

document.addEventListener('DOMContentLoaded', () => {
    const chatLog = document.getElementById('chat-log');
    const chatForm = document.getElementById('chat-form');
    const chatInput = document.getElementById('chat-input');
    const humanVerificationCheckbox = document.getElementById('human-verification-checkbox');
    const sendButton = document.getElementById('chat-send-button');

    // Disable send button and chat input initially
    if (sendButton) {
        sendButton.disabled = true;
    }
    if (chatInput) {
        chatInput.disabled = true;
    }

    function updateSendButtonState() {
        if (sendButton && chatInput && humanVerificationCheckbox) {
            const isHumanVerified = humanVerificationCheckbox.checked;
            const hasText = chatInput.value.trim() !== '';
            sendButton.disabled = !(isHumanVerified && hasText);
        }
    }

    function updateChatInputState() {
        if (chatInput && humanVerificationCheckbox) {
            const isHumanVerified = humanVerificationCheckbox.checked;
            chatInput.disabled = !isHumanVerified;
            if (isHumanVerified && document.activeElement !== chatInput) {
                 // Only focus if not already focused to avoid annoyance on checkbox click
                // and if the input just became enabled.
                // Check if the focus was on the checkbox itself or if input was previously disabled.
                const chatInputPreviouslyDisabled = chatInput.disabled; // This is before state change
                if (chatInputPreviouslyDisabled || document.activeElement === humanVerificationCheckbox) {
                   // chatInput.focus();
                }
            }
        }
    }


    if (humanVerificationCheckbox && sendButton && chatInput) {
        humanVerificationCheckbox.addEventListener('change', () => {
            updateChatInputState();
            updateSendButtonState();
            // If checkbox is checked and input becomes enabled, focus it.
            if (humanVerificationCheckbox.checked && !chatInput.disabled) {
                chatInput.focus();
            }
        });

        chatInput.addEventListener('input', () => {
            updateSendButtonState();
        });
    }

    if (chatForm && chatInput && chatLog && humanVerificationCheckbox && sendButton) {
        chatForm.addEventListener('submit', (event) => {
            event.preventDefault();
            const userMessage = chatInput.value.trim();

            if (!humanVerificationCheckbox.checked) {
                addMessageToLog('Please verify you are human.', 'bot-message'); // Removed window.parent from here
                // Ensure states are correct if submission fails due to human verification
                chatInput.disabled = true;
                sendButton.disabled = true;
                return;
            }

            // User message check should happen after human verification for clarity of feedback
            if (!userMessage) {
                // Optionally, provide feedback that message is empty
                // sendButton is already managed by input and checkbox state, so no direct disable here unless specific UX desired
                return;
            }

            addMessageToLog(userMessage, 'user-message');
            chatInput.value = '';
            updateSendButtonState(); // After clearing input, update button state
            setTimeout(() => {
                simulateBotResponse(userMessage);
            }, 1000);
        });
    } else {
        console.error('Chatbot UI elements not found in chatbot.html. Needed: chat-form, chat-input, chat-log, human-verification-checkbox, chat-send-button');
    }

    // The actual close button (X) is in the parent modal.
    // If there were a close button *inside* the iframe, it would be:
    // const closeButtonInIframe = document.getElementById('close-chatbot-iframe-button');
    // if (closeButtonInIframe) {
    //     closeButtonInIframe.addEventListener('click', () => {
    //         // Send a message to the parent window to close the modal
    //         if (window.parent) {
    //             window.parent.postMessage({ type: 'ops-chatbot-close-request' }, '*'); // Consider a specific target origin
    //         }
    //     });
    // }

    // Listen for messages from parent (theme/language changes)
    window.addEventListener('message', (event) => {
        // Basic security check for origin if possible
        // Note: For file:// origin or sandboxed iframes, event.origin can be null or tricky.
        // For production, ensure this matches the parent's actual origin.
        // Example: if (event.origin !== 'https://yourparentdomain.com') return;
        // console.log('Chatbot iframe received message:', event.data);

        if (event.data && event.data.type === 'themeChange') {
            const theme = event.data.theme; // 'light' or 'dark'
            document.body.setAttribute('data-theme', theme);
            // console.log('Chatbot iframe theme changed to:', theme);
        } else if (event.data && event.data.type === 'languageChange') {
            const lang = event.data.language;
            // console.log('Chatbot iframe language change requested to:', lang);
            applyChatbotTranslations(lang);
        }
    });

    // Function to apply translations within the chatbot iframe
    function applyChatbotTranslations(lang) {
        // Store current language perhaps in a global scope for the widget if needed elsewhere
        // window.currentChatbotLanguage = lang;

        // Translate text content
        document.querySelectorAll('[data-en], [data-es]').forEach(el => {
            const textKey = (lang === 'es') ? 'data-es' : 'data-en';
            const text = el.getAttribute(textKey);
            if (text !== null) {
                // For messages in chat-log, they are added dynamically.
                // This part will handle static text in the initial HTML of the iframe.
                if (el.classList.contains('message')) { // Don't re-translate existing messages this way
                    // Potentially, re-translate known bot messages if they have keys
                    // Or, ensure new messages are added with correct language from start
                } else {
                     el.textContent = text;
                }
            }
        });

        // Translate placeholders
        const chatInputElement = document.getElementById('chat-input');
        if (chatInputElement) {
            const placeholderKey = (lang === 'es') ? 'data-placeholder-es' : 'data-placeholder-en';
            const placeholderText = chatInputElement.getAttribute(placeholderKey);
            if (placeholderText !== null) {
                chatInputElement.setAttribute('placeholder', placeholderText);
            }
        }

        // Translate ARIA labels and titles if any within the iframe structure
        document.querySelectorAll('[data-aria-label-en], [data-aria-label-es]').forEach(el => {
            const labelKey = (lang === 'es') ? 'data-aria-label-es' : 'data-aria-label-en';
            const labelText = el.getAttribute(labelKey);
            if (labelText !== null) el.setAttribute('aria-label', labelText);
        });

        document.querySelectorAll('[data-title-en], [data-title-es]').forEach(el => {
            const titleKey = (lang === 'es') ? 'data-title-es' : 'data-title-en';
            const titleText = el.getAttribute(titleKey);
            if (titleText !== null) el.setAttribute('title', titleText);
        });

        // If there's an initial bot message in HTML, translate it:
        const initialBotMessage = document.querySelector('.bot-message[data-en][data-es]');
        if(initialBotMessage){
            const textKey = (lang === 'es') ? 'data-es' : 'data-en';
            initialBotMessage.textContent = initialBotMessage.getAttribute(textKey);
        }
    }

    // Apply initial translations based on parent's language if possible (e.g., via a query param or initial message)
    // For now, it will rely on the first 'languageChange' message.
    // Or, try to get it from parent directly on load if allowed and parent functions are ready.
    // This part is tricky due to loading timing and cross-origin policies.
    // The postMessage approach is more reliable for updates.
    // To get initial state, parent could post current lang/theme when iframe signals it's ready,
    // or iframe could try to fetch it.
    // For simplicity, we assume parent will send an initial message or user interaction will trigger it.

});

// Store current language for the chatbot, default to 'en'
let currentChatbotLanguage = 'en';

// Function to apply translations within the chatbot iframe
function applyChatbotTranslations(lang) {
    currentChatbotLanguage = lang; // Update the script's current language state
    // Store current language perhaps in a global scope for the widget if needed elsewhere
    // window.currentChatbotLanguage = lang;
    currentChatbotLanguage = lang; // Update the script's current language state for dynamic messages

    // Translate text content
    document.querySelectorAll('[data-en], [data-es]').forEach(el => {
        const textKey = (lang === 'es') ? 'data-es' : 'data-en';
        const text = el.getAttribute(textKey);
        if (text !== null) {
            // For messages in chat-log, they are added dynamically.
            // This part will handle static text in the initial HTML of the iframe.
            if (el.classList.contains('message')) { // Don't re-translate existing messages this way
                // Potentially, re-translate known bot messages if they have keys
                // Or, ensure new messages are added with correct language from start
            } else {
                 el.textContent = text;
            }
        }
    });

    // Translate placeholders
    const chatInputElement = document.getElementById('chat-input');
    if (chatInputElement) {
        const placeholderKey = (lang === 'es') ? 'data-placeholder-es' : 'data-placeholder-en';
        const placeholderText = chatInputElement.getAttribute(placeholderKey);
        if (placeholderText !== null) {
            chatInputElement.setAttribute('placeholder', placeholderText);
        }
    }

    // Translate ARIA labels and titles if any within the iframe structure
    document.querySelectorAll('[data-aria-label-en], [data-aria-label-es]').forEach(el => {
        const labelKey = (lang === 'es') ? 'data-aria-label-es' : 'data-aria-label-en';
        const labelText = el.getAttribute(labelKey);
        if (labelText !== null) el.setAttribute('aria-label', labelText);
    });

    document.querySelectorAll('[data-title-en], [data-title-es]').forEach(el => {
        const titleKey = (lang === 'es') ? 'data-title-es' : 'data-title-en';
        const titleText = el.getAttribute(titleKey);
        if (titleText !== null) el.setAttribute('title', titleText);
    });

    // If there's an initial bot message in HTML, translate it:
    const initialBotMessage = document.querySelector('.bot-message[data-en][data-es]');
    if(initialBotMessage){
        const textKey = (lang === 'es') ? 'data-es' : 'data-en';
        initialBotMessage.textContent = initialBotMessage.getAttribute(textKey);
    }
}


function addMessageToLog(message, type) { // Removed contextWindow, will use currentChatbotLanguage
    const chatLog = document.getElementById('chat-log');
    if (!chatLog) return;

    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', type);
    messageDiv.textContent = message; // Assumes message is already translated or is user input
    let translatedMessage = message;
    if (type === 'bot-message') {
        // Example: Simple key-based translation for known bot responses
        // This should be expanded or use a more robust i18n system for many messages
        if (message.toLowerCase().includes("hello! how can i help you today?")) {
            translatedMessage = (currentChatbotLanguage === 'es') ? "¡Hola! ¿Cómo puedo ayudarte hoy?" : "Hello! How can I help you today?";
        } else if (message.toLowerCase().includes("please verify you are human.")) {
            translatedMessage = (currentChatbotLanguage === 'es') ? "Por favor, verifica que eres humano." : "Please verify you are human.";
        } else if (message.toLowerCase().includes("i'm sorry, i didn't understand that. can you rephrase?")) {
            translatedMessage = (currentChatbotLanguage === 'es') ? "Lo siento, no entendí eso. ¿Puedes reformularlo?" : "I'm sorry, I didn't understand that. Can you rephrase?";
        } else if (message.toLowerCase().includes("hello there! how can i assist you today?")) {
            translatedMessage = (currentChatbotLanguage === 'es') ? "¡Hola! ¿En qué puedo ayudarte hoy?" : "Hello there! How can I assist you today?";
        } else if (message.toLowerCase().includes("we offer business operations, contact center, it support, and professional services. which one are you interested in?")) {
            translatedMessage = (currentChatbotLanguage === 'es') ? "Ofrecemos servicios de Operaciones Comerciales, Centro de Contacto, Soporte de TI y Profesionales. ¿Cuál te interesa?" : "We offer Business Operations, Contact Center, IT Support, and Professional services. Which one are you interested in?";
        } else if (message.toLowerCase().includes("for pricing information, please contact our sales team through the contact us form.")) {
            translatedMessage = (currentChatbotLanguage === 'es') ? "Para obtener información sobre precios, comunícate con nuestro equipo de ventas a través del formulario Contáctanos." : "For pricing information, please contact our sales team through the Contact Us form.";
        } else if (message.toLowerCase().includes("you're welcome!")) {
            translatedMessage = (currentChatbotLanguage === 'es') ? "¡De nada!" : "You're welcome!";
        } else if (message.toLowerCase().includes("goodbye! have a great day.")) {
            translatedMessage = (currentChatbotLanguage === 'es') ? "¡Adiós que tengas un buen día!" : "Goodbye! Have a great day.";
        }
    }
    messageDiv.textContent = translatedMessage;
    chatLog.appendChild(messageDiv);
    chatLog.scrollTop = chatLog.scrollHeight;
}

function simulateBotResponse(userMessage) {
    let botResponse = "I'm sorry, I didn't understand that. Can you rephrase?"; // Default fallback
    const lowerUserMessage = userMessage.toLowerCase();

    // These are keys for translation, actual response text is now handled in addMessageToLog
    if (lowerUserMessage.includes('hello') || lowerUserMessage.includes('hi')) {
        botResponse = 'Hello there! How can I assist you today?';
    } else if (lowerUserMessage.includes('services')) {
        botResponse = 'We offer Business Operations, Contact Center, IT Support, and Professional services. Which one are you interested in?';
    } else if (lowerUserMessage.includes('price') || lowerUserMessage.includes('pricing')) {
        botResponse = 'For pricing information, please contact our sales team through the Contact Us form.';
    } else if (lowerUserMessage.includes('thank')) {
        botResponse = "You're welcome!";
    } else if (lowerUserMessage.includes('bye')) {
        botResponse = "Goodbye! Have a great day.";
    }
    // Add more sophisticated response logic here
    addMessageToLog(botResponse, 'bot-message');
}

// Attempt to get initial language from parent in case messages are missed or iframe loads late.
// This is a bit of a belt-and-suspenders approach. The parent postMessage on load is preferred.
if (window.parent && window.parent !== window) {
    // Check if parent has getCurrentLanguage (simple check, not foolproof for cross-origin)
    try {
        if (typeof window.parent.getCurrentLanguage === 'function') {
            const parentLang = window.parent.getCurrentLanguage();
            if (parentLang) {
                applyChatbotTranslations(parentLang);
            }
        }
    } catch (e) {
        // console.warn("Cannot directly access parent language. Relying on postMessage.");
    }
}
