document.addEventListener('DOMContentLoaded', () => {
    // --- THEME SWITCHER ---
    const themeToggle = document.getElementById('theme-toggle');
    const body = document.body;

    // Load saved theme
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        body.classList.add(savedTheme);
        themeToggle.textContent = savedTheme === 'dark-theme' ? 'Light' : 'Dark';
    } else {
        // Default to light theme if nothing is saved
        body.classList.add('light-theme');
        themeToggle.textContent = 'Dark';
    }

    themeToggle.addEventListener('click', () => {
        if (body.classList.contains('light-theme')) {
            body.classList.remove('light-theme');
            body.classList.add('dark-theme');
            themeToggle.textContent = 'Light';
            localStorage.setItem('theme', 'dark-theme');
        } else {
            body.classList.remove('dark-theme');
            body.classList.add('light-theme');
            themeToggle.textContent = 'Dark';
            localStorage.setItem('theme', 'light-theme');
        }
    });

    // --- LANGUAGE SWITCHER (Placeholder) ---
    const langToggle = document.getElementById('lang-toggle');
    // This will be expanded in a later step
    const translations = {
        en: {
            // Header
            "skipToMain": "Skip to main content",
            "siteTitle": "OPS Online Support™",
            "themeButtonDark": "Dark",
            "themeButtonLight": "Light",
            "langButtonEN": "EN",
            "langButtonES": "ES",
            // Services
            "ourServicesTitle": "Our Services",
            "bizOpsButton": "Business Operations",
            "contactCenterButton": "Contact Center",
            "itSupportButton": "IT Support",
            "professionalsButton": "Professionals",
            // FABs
            "joinUsFab": "Join Us",
            "contactUsFab": "Contact Us",
            "chatbotFab": "Chatbot",
            // Modals - Titles
            "joinUsModalTitle": "Join Us",
            "contactUsModalTitle": "Contact Us",
            "bizOpsModalTitle": "Business Operations",
            "contactCenterModalTitle": "Contact Center",
            "itSupportModalTitle": "IT Support",
            "professionalsModalTitle": "Professionals",
            "chatbotModalTitle": "Chatbot",
            // Modals - Common
            "modalCloseLabel": "Close",
            "formSubmitButton": "Submit",
            "formSendButton": "Send",
            // Join Us Modal
            "joinNameLabel": "Name",
            "joinEmailLabel": "Email",
            "joinPhoneLabel": "Phone",
            "skillsTitle": "Skills",
            "educationTitle": "Education",
            "contEduTitle": "Continued Education",
            "certificationTitle": "Certification",
            "hobbiesTitle": "Hobbies",
            "acceptButton": "Accept",
            "editButton": "Edit",
            "joinAboutLabel": "Tell us about yourself",
            // Contact Us Modal
            "contactNameLabel": "Name",
            "contactEmailLabel": "Email",
            "contactPhoneLabel": "Contact Number",
            "contactDateLabel": "Preferred Date",
            "contactTimeLabel": "Preferred Time",
            "contactInterestLabel": "What are you interested about?",
            "selectOptionDefault": "Select an option...",
            "contactCommentsLabel": "Comments",
            // Service Modals - Content (Placeholders for now)
            "bizOpsModalContent": "Content for Business Operations...",
            "contactCenterModalContent": "Content for Contact Center...",
            "itSupportModalContent": "Content for IT Support...",
            "professionalsModalContent": "Content for Professionals...",
            "chatbotModalContent": "Chatbot interface will go here...",
            // Footer
            "footerCopyright": "© 2025 OPS Online Support",
            "footerHomeLink": "Home",
            "footerServicesLink": "Services",
            "footerChatLink": "Chat"
        },
        es: {
            // Header
            "skipToMain": "Saltar al contenido principal",
            "siteTitle": "OPS Soporte en Línea™",
            "themeButtonDark": "Oscuro",
            "themeButtonLight": "Claro",
            "langButtonEN": "EN",
            "langButtonES": "ES",
            // Services
            "ourServicesTitle": "Nuestros Servicios",
            "bizOpsButton": "Operaciones de Negocio",
            "contactCenterButton": "Centro de Contacto",
            "itSupportButton": "Soporte TI",
            "professionalsButton": "Profesionales",
            // FABs
            "joinUsFab": "Únete",
            "contactUsFab": "Enlázate",
            "chatbotFab": "Chatbot",
            // Modals - Titles
            "joinUsModalTitle": "Únete",
            "contactUsModalTitle": "Enlázate",
            "bizOpsModalTitle": "Operaciones de Negocio",
            "contactCenterModalTitle": "Centro de Contacto",
            "itSupportModalTitle": "Soporte TI",
            "professionalsModalTitle": "Profesionales",
            "chatbotModalTitle": "Chatbot",
            // Modals - Common
            "modalCloseLabel": "Cerrar",
            "formSubmitButton": "Enviar",
            "formSendButton": "Enviar",
             // Join Us Modal
            "joinNameLabel": "Nombre",
            "joinEmailLabel": "Correo Electrónico",
            "joinPhoneLabel": "Teléfono",
            "skillsTitle": "Habilidades",
            "educationTitle": "Educación",
            "contEduTitle": "Educación Continua",
            "certificationTitle": "Certificación",
            "hobbiesTitle": "Pasatiempos",
            "acceptButton": "Aceptar",
            "editButton": "Editar",
            "joinAboutLabel": "Cuéntanos sobre ti",
            // Contact Us Modal
            "contactNameLabel": "Nombre",
            "contactEmailLabel": "Correo Electrónico",
            "contactPhoneLabel": "Número de Contacto",
            "contactDateLabel": "Fecha Preferida",
            "contactTimeLabel": "Hora Preferida",
            "contactInterestLabel": "¿Sobre qué estás interesado?",
            "selectOptionDefault": "Selecciona una opción...",
            "contactCommentsLabel": "Comentarios",
            // Service Modals - Content (Placeholders for now)
            "bizOpsModalContent": "Contenido para Operaciones de Negocio...",
            "contactCenterModalContent": "Contenido para Centro de Contacto...",
            "itSupportModalContent": "Contenido para Soporte TI...",
            "professionalsModalContent": "Contenido para Profesionales...",
            "chatbotModalContent": "La interfaz del chatbot irá aquí...",
            // Footer
            "footerCopyright": "© 2025 OPS Soporte en Línea",
            "footerHomeLink": "Inicio",
            "footerServicesLink": "Servicios",
            "footerChatLink": "Chat"
        }
    };

    let currentLang = 'en'; // Default language

    function setLanguage(lang) {
        currentLang = lang;
        localStorage.setItem('language', lang);
        updateTextContent();
        langToggle.textContent = lang.toUpperCase();
    }

    function updateTextContent() {
        document.querySelectorAll('[data-translate-key]').forEach(el => {
            const key = el.getAttribute('data-translate-key');
            if (translations[currentLang] && translations[currentLang][key]) {
                if (el.tagName === 'INPUT' && el.type === 'submit') {
                    el.value = translations[currentLang][key];
                } else if (el.tagName === 'TEXTAREA' && el.placeholder) {
                     el.placeholder = translations[currentLang][key]; // For placeholder text
                } else if (el.tagName === 'BUTTON' && el.getAttribute('aria-label') && el.classList.contains('modal-close')) {
                    el.setAttribute('aria-label', translations[currentLang][key]);
                } else if (el.tagName === 'BUTTON' && el.classList.contains('fab')) {
                     el.setAttribute('aria-label', translations[currentLang][key]); // For FAB aria-labels
                     el.textContent = translations[currentLang][key]; // For FAB text content
                }
                else {
                    el.textContent = translations[currentLang][key];
                }
            }
        });
        // Update theme button text based on current language and theme state
        const currentTheme = body.classList.contains('dark-theme') ? 'themeButtonLight' : 'themeButtonDark';
        themeToggle.textContent = translations[currentLang][currentTheme];
    }


    // Load saved language
    const savedLang = localStorage.getItem('language');
    if (savedLang && (savedLang === 'en' || savedLang === 'es')) {
        setLanguage(savedLang);
    } else {
        setLanguage('en'); // Default to English
    }

    langToggle.addEventListener('click', () => {
        setLanguage(currentLang === 'en' ? 'es' : 'en');
    });


    // --- MODAL HANDLING ---
    const modalTriggers = document.querySelectorAll('[data-modal-target]');
    const modals = document.querySelectorAll('.modal');
    const modalCloseButtons = document.querySelectorAll('.modal-close');

    modalTriggers.forEach(trigger => {
        trigger.addEventListener('click', () => {
            const modalId = trigger.getAttribute('data-modal-target');
            const modal = document.getElementById(modalId);
            if (modal) {
                modal.style.display = 'block';
                // When modal opens, ensure its text content is up-to-date with the current language
                // This is a bit redundant if updateTextContent is comprehensive, but good for robustness
                modal.querySelectorAll('[data-translate-key]').forEach(el => {
                    const key = el.getAttribute('data-translate-key');
                    if (translations[currentLang] && translations[currentLang][key]) {
                         if (el.tagName === 'INPUT' && el.type === 'submit') {
                            el.value = translations[currentLang][key];
                        } else if (el.tagName === 'TEXTAREA' && el.placeholder) {
                             el.placeholder = translations[currentLang][key];
                        } else {
                            el.textContent = translations[currentLang][key];
                        }
                    }
                });
            }
        });
    });

    modalCloseButtons.forEach(button => {
        button.addEventListener('click', ()_ => {
            const modal = button.closest('.modal');
            if (modal) {
                modal.style.display = 'none';
            }
        });
    });

    // Dismiss modal on backdrop click
    modals.forEach(modal => {
        modal.addEventListener('click', (event) => {
            if (event.target === modal) { // Clicked on the backdrop itself
                modal.style.display = 'none';
            }
        });
    });

    // --- Initialize text content on load ---
    // Add data-translate-key attributes to HTML elements that need translation.
    // This will be done in the next step by modifying index.html.
    // For now, this ensures that if keys are present, they get updated.
    updateTextContent();
});

// Helper function to add data-translate-key to elements (example)
// This is more of a guide for the next step of modifying index.html
function assignTranslationKeys() {
    // Header
    document.getElementById('skip-to-main')?.setAttribute('data-translate-key', 'skipToMain');
    document.querySelector('header h1')?.setAttribute('data-translate-key', 'siteTitle');
    // themeToggle is handled by its own logic for text content
    // langToggle is handled by its own logic

    // Services
    document.querySelector('#services h2')?.setAttribute('data-translate-key', 'ourServicesTitle');
    document.querySelector('[data-modal-target="modal-biz-ops"]')?.setAttribute('data-translate-key', 'bizOpsButton');
    document.querySelector('[data-modal-target="modal-contact-center"]')?.setAttribute('data-translate-key', 'contactCenterButton');
    document.querySelector('[data-modal-target="modal-it-support"]')?.setAttribute('data-translate-key', 'itSupportButton');
    document.querySelector('[data-modal-target="modal-professionals"]')?.setAttribute('data-translate-key', 'professionalsButton');

    // FABs - also update their text content if they have visible text
    const joinUsFab = document.querySelector('[data-modal-target="modal-join-us"].fab');
    if(joinUsFab) {
        joinUsFab.setAttribute('data-translate-key', 'joinUsFab');
        joinUsFab.textContent = translations[currentLang]?.joinUsFab || 'Join Us'; // Initial text
    }
    const contactUsFab = document.querySelector('[data-modal-target="modal-contact-us"].fab');
    if(contactUsFab) {
        contactUsFab.setAttribute('data-translate-key', 'contactUsFab');
        contactUsFab.textContent = translations[currentLang]?.contactUsFab || 'Contact Us'; // Initial text
    }
    const chatbotFab = document.querySelector('[data-modal-target="modal-chatbot"].fab');
    if(chatbotFab) {
        chatbotFab.setAttribute('data-translate-key', 'chatbotFab');
        chatbotFab.textContent = translations[currentLang]?.chatbotFab || 'Chatbot'; // Initial text
    }


    // Modals Titles
    document.querySelector('#modal-join-us h3')?.setAttribute('data-translate-key', 'joinUsModalTitle');
    document.querySelector('#modal-contact-us h3')?.setAttribute('data-translate-key', 'contactUsModalTitle');
    document.querySelector('#modal-biz-ops h3')?.setAttribute('data-translate-key', 'bizOpsModalTitle');
    document.querySelector('#modal-contact-center h3')?.setAttribute('data-translate-key', 'contactCenterModalTitle');
    document.querySelector('#modal-it-support h3')?.setAttribute('data-translate-key', 'itSupportModalTitle');
    document.querySelector('#modal-professionals h3')?.setAttribute('data-translate-key', 'professionalsModalTitle');
    document.querySelector('#modal-chatbot h3')?.setAttribute('data-translate-key', 'chatbotModalTitle');

    // Modal Close Buttons (aria-label)
    document.querySelectorAll('.modal-close').forEach(btn => btn.setAttribute('data-translate-key', 'modalCloseLabel'));

    // Join Us Modal Form
    document.querySelector('label[for="join-name"]')?.setAttribute('data-translate-key', 'joinNameLabel');
    document.querySelector('label[for="join-email"]')?.setAttribute('data-translate-key', 'joinEmailLabel');
    document.querySelector('label[for="join-phone"]')?.setAttribute('data-translate-key', 'joinPhoneLabel');
    document.querySelector('#modal-join-us form h4:nth-of-type(1)')?.setAttribute('data-translate-key', 'skillsTitle');
    // ... and so on for other labels, buttons, and text within modals.
    // This is illustrative; the actual HTML modification will be more comprehensive.

    // Footer
    document.querySelector('footer p')?.setAttribute('data-translate-key', 'footerCopyright');
    document.querySelector('footer nav a[href="index.html"]')?.setAttribute('data-translate-key', 'footerHomeLink');
    document.querySelector('footer nav .dropbtn')?.setAttribute('data-translate-key', 'footerServicesLink');
    // ... and for dropdown items if they are static text
    document.querySelector('footer nav a[href="#modal-chatbot"]')?.setAttribute('data-translate-key', 'footerChatLink');
}

// Call assignTranslationKeys once after DOM is ready if you want to do it from JS,
// but it's better to add data-translate-key attributes directly in the HTML.
// document.addEventListener('DOMContentLoaded', assignTranslationKeys);
// For now, ensure updateTextContent is called to apply any existing keys.
document.addEventListener('DOMContentLoaded', () => {
    // ... (other initializations)
    if (typeof updateTextContent === "function") {
        updateTextContent();
    }
});
