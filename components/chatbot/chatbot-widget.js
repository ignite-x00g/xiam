// components/chatbot/chatbot-widget.js

document.addEventListener('DOMContentLoaded', () => {
    const chatLog = document.getElementById('chat-log');
    const chatForm = document.getElementById('chat-form');
    const chatInput = document.getElementById('chat-input');
    const humanVerificationCheckbox = document.getElementById('human-verification-checkbox');

    // Set initial language - will be 'en' by default, or overwritten by message from parent.
    applyChatbotTranslations(getCurrentChatbotLanguage());


    if (chatForm && chatInput && chatLog && humanVerificationCheckbox) {
        chatForm.addEventListener('submit', (event) => {
            event.preventDefault();
            const userMessage = chatInput.value.trim();

            if (!userMessage) {
                return;
            }

            if (!humanVerificationCheckbox.checked) {
                const lang = getCurrentChatbotLanguage();
                const verifyMsg = lang === 'es' ? "Por favor, verifica que eres humano." : "Please verify you are human.";
                addMessageToLog(verifyMsg, 'bot-message');
                return;
            }

            addMessageToLog(userMessage, 'user-message');
            chatInput.value = '';
            setTimeout(() => {
                simulateBotResponse(userMessage);
            }, 1000);
        });
    } else {
        console.error('Chatbot UI elements not found in chatbot.html');
    }
});

function getCurrentChatbotLanguage() {
    return document.documentElement.lang || 'en';
}

function applyChatbotTranslations(lang) {
    if (!['en', 'es'].includes(lang)) {
        console.warn(`Unsupported language '${lang}' for chatbot, defaulting to 'en'.`);
        lang = 'en';
    }
    document.documentElement.lang = lang; // Store current language

    // Translate static text content
    const elements = document.querySelectorAll('[data-en], [data-es]');
    elements.forEach(el => {
        const translationKey = lang === 'es' ? 'data-es' : 'data-en';
        const text = el.getAttribute(translationKey);
        if (text !== null) {
            // Preserve icons if any - simplistic version for chatbot
            let icon = el.querySelector('i.fas, i.far, i.fab'); // General icon classes
            if (icon) {
                let textNode = null;
                for(let i=0; i < el.childNodes.length; i++){
                    if(el.childNodes[i].nodeType === Node.TEXT_NODE && el.childNodes[i].textContent.trim().length > 0){
                        textNode = el.childNodes[i];
                        break;
                    }
                }
                if(textNode){
                    textNode.textContent = " " + text; // Add space before text if icon is first
                } else {
                     el.appendChild(document.createTextNode(" " + text));
                }
            } else {
                el.textContent = text;
            }
        }
    });

    // Translate placeholders
    const placeholders = document.querySelectorAll('[data-placeholder-en], [data-placeholder-es]');
    placeholders.forEach(el => {
        const placeholderKey = lang === 'es' ? 'data-placeholder-es' : 'data-placeholder-en';
        const text = el.getAttribute(placeholderKey);
        if (text !== null) {
            el.placeholder = text;
        }
    });

    // Translate ARIA labels
    const ariaLabels = document.querySelectorAll('[data-aria-label-en], [data-aria-label-es]');
    ariaLabels.forEach(el => {
        const ariaLabelKey = lang === 'es' ? 'data-aria-label-es' : 'data-aria-label-en';
        const text = el.getAttribute(ariaLabelKey);
        if (text !== null) {
            el.setAttribute('aria-label', text);
        }
    });

    // Translate title attributes
    const titles = document.querySelectorAll('[data-title-en], [data-title-es]');
    titles.forEach(el => {
        const titleKey = lang === 'es' ? 'data-title-es' : 'data-title-en';
        const text = el.getAttribute(titleKey);
        if (text !== null) {
            el.setAttribute('title', text);
        }
    });
}

window.addEventListener('message', (event) => {
    // Basic security: check origin if possible.
    // For file:// origin, event.origin can be "null" which is tricky.
    // if (event.origin !== window.location.origin && event.origin !== "null") {
    //     console.warn("Chatbot: Message ignored from unexpected origin:", event.origin);
    //     return;
    // }

    if (event.data && event.data.type === 'languageChange') {
        const lang = event.data.lang;
        if (lang) {
            applyChatbotTranslations(lang);
        }
    }
});

function addMessageToLog(message, type) {
    const chatLog = document.getElementById('chat-log');
    if (!chatLog) return;

    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', type);
    messageDiv.textContent = message; // Assumes message is already translated or is user input

    chatLog.appendChild(messageDiv);
    chatLog.scrollTop = chatLog.scrollHeight;
}

function simulateBotResponse(userMessage) {
    const lang = getCurrentChatbotLanguage();
    let botResponse;
    const lowerUserMessage = userMessage.toLowerCase();

    // Keywords for matching
    const greetings = { en: ['hello', 'hi'], es: ['hola'] };
    const services = { en: 'services', es: 'servicios' };
    const pricing = { en: ['price', 'pricing'], es: ['precio'] };
    const thanks = { en: 'thank', es: 'gracias' };
    const bye = { en: 'bye', es: ['adiós', 'adios'] };

    // Responses
    const responses = {
        greeting: { en: 'Hello there! How can I assist you today?', es: '¡Hola! ¿Cómo puedo ayudarte hoy?' },
        servicesInfo: { en: 'We offer Business Operations, Contact Center, IT Support, and Professional services. Which one are you interested in?', es: 'Ofrecemos Operaciones Comerciales, Centro de Contacto, Soporte de TI y servicios Profesionales. ¿Cuál te interesa?' },
        pricingInfo: { en: 'For pricing information, please contact our sales team through the Contact Us form.', es: 'Para información de precios, por favor contacta a nuestro equipo de ventas mediante el formulario de Contacto.' },
        thankYouResponse: { en: "You're welcome!", es: 'De nada.' },
        goodbye: { en: "Goodbye! Have a great day.", es: '¡Adiós! Que tengas un buen día.' },
        default: { en: "I'm sorry, I didn't understand that. Can you rephrase?", es: 'Lo siento, no entendí eso. ¿Puedes reformularlo?' }
    };

    if (greetings[lang].some(g => lowerUserMessage.includes(g))) {
        botResponse = responses.greeting[lang];
    } else if (lowerUserMessage.includes(services[lang])) {
        botResponse = responses.servicesInfo[lang];
    } else if (pricing[lang].some(p => lowerUserMessage.includes(p))) {
        botResponse = responses.pricingInfo[lang];
    } else if (lowerUserMessage.includes(thanks[lang])) {
        botResponse = responses.thankYouResponse[lang];
    } else if (bye[lang].some(b => lowerUserMessage.includes(b))) {
        botResponse = responses.goodbye[lang];
    } else {
        botResponse = responses.default[lang];
    }
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
