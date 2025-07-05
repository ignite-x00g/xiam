// components/chatbot/chatbot-widget.js

document.addEventListener('DOMContentLoaded', () => {
    const chatLog = document.getElementById('chat-log');
    const chatForm = document.getElementById('chat-form');
    const chatInput = document.getElementById('chat-input');
    const humanVerificationCheckbox = document.getElementById('human-verification-checkbox');
    // Attempt to apply theme from parent if possible (e.g. if theme.css is linked and body vars are set)
    // This is a simple example; more robust would be PostMessage API or localStorage observation.
    // For now, chatbot.css defines its own defaults that can be overridden if global theme vars are accessible.
  // console.log("Chatbot widget JS loaded.");
    if (chatForm && chatInput && chatLog && humanVerificationCheckbox) {
        chatForm.addEventListener('submit', (event) => {
            event.preventDefault();
            const userMessage = chatInput.value.trim();

            if (!userMessage) {
                return; // Don't send empty messages
            }

            if (!humanVerificationCheckbox.checked) {
                addMessageToLog('Please verify you are human.', 'bot-message', window.parent); // Pass window.parent for translation
                return;
            }

            addMessageToLog(userMessage, 'user-message');
            chatInput.value = ''; // Clear input

            // Simulate bot response
            setTimeout(() => {
                simulateBotResponse(userMessage);
            }, 1000);
        });
    } else {
        console.error('Chatbot UI elements not found in chatbot.html');
    }
});

function addMessageToLog(message, type, contextWindow = window) {
    const chatLog = document.getElementById('chat-log');
    if (!chatLog) return;

    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', type);

    // Basic translation attempt if contextWindow and its functions are available
    let translatedMessage = message;
    if (type === 'bot-message' && contextWindow.getCurrentLanguage && contextWindow.applyTranslations) {
        // This is a simplified example. Real translation would need keys or more complex logic.
        const lang = contextWindow.getCurrentLanguage();
        if (message.toLowerCase().includes("how can i help")) {
            translatedMessage = lang === 'es' ? "¡Hola! ¿En qué puedo ayudarte?" : "Hello! How can I help you?";
        } else if (message.toLowerCase().includes("you are human")) {
             translatedMessage = lang === 'es' ? "Por favor, verifica que eres humano." : "Please verify you are human.";
        }
        // Add more specific translations as needed
    }
    messageDiv.textContent = translatedMessage;
    chatLog.appendChild(messageDiv);
    chatLog.scrollTop = chatLog.scrollHeight; // Scroll to the bottom
}

function simulateBotResponse(userMessage) {
    let botResponse = "I'm sorry, I didn't understand that. Can you rephrase?";
    const lowerUserMessage = userMessage.toLowerCase();

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
    addMessageToLog(botResponse, 'bot-message', window.parent); // Pass window.parent for potential translation
}

// Example of how the iframe could listen for theme changes from the parent
// This requires the parent page to send a message when its theme changes.
// window.addEventListener('message', (event) => {
//    // Ensure the message is from a trusted source if implementing this
//    // if (event.origin !== 'expected-parent-origin') return;
//
//    if (event.data && event.data.type === 'themeChange') {
//        const theme = event.data.theme; // 'light' or 'dark'
//        document.body.setAttribute('data-theme', theme); // Assuming chatbot.css uses this
//        console.log('Chatbot iframe received theme change:', theme);
//        // Potentially re-apply some styles or trigger JS updates if needed
//    }
// });

// To make the chatbot translatable by parent's global-toggles.js (if not using iframe approach or if iframe links parent's JS)
// This would be more complex if it's a separate iframe document.
// The current addMessageToLog has a very basic attempt.
// For full translation, the chatbot would need its own data-en/es attributes on templated messages,
// and its own applyTranslations function or a way to call the parent's.
// If chatbot.html links to global-toggles.js and theme.css from parent, it could work more seamlessly.
// Example: if chatbot.html included <script src="../../js/global-toggles.js" defer></script>
// then window.applyTranslations would be available directly.
// However, this creates tighter coupling.
// For now, the chatbot's internal text is mostly static or simple responses.
// The "I am human" text is in its HTML and can have data-en/es.
document.addEventListener('DOMContentLoaded', () => {
    if (typeof window.applyTranslations === 'function' && typeof window.getCurrentLanguage === 'function') {
        // If global translation functions are available (e.g. parent scripts somehow affect iframe, or scripts are shared)
        // This is unlikely for a simple iframe src load without more setup.
        // window.applyTranslations(window.getCurrentLanguage());
    } else if (window.parent && typeof window.parent.applyTranslations === 'function' && typeof window.parent.getCurrentLanguage === 'function') {
        // Try to use parent's translation functions
        // This might have cross-origin issues if domains differ.
        try {
            // window.parent.applyTranslations(window.parent.getCurrentLanguage());
            // console.log("Applied parent's translations to chatbot iframe.");
        } catch (e) {
            // console.warn("Could not apply parent's translations to chatbot iframe due to security restrictions or functions not available.");
        }
    }
});
