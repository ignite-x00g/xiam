document.addEventListener('DOMContentLoaded', () => {
    const langBtn = document.getElementById('language-toggle-button'); // Main language toggle in header
    const themeBtn = document.getElementById('theme-toggle-button'); // Main theme toggle in header
    const body = document.body;

    // --- Language Functionality ---
    window.getCurrentLanguage = function() {
        return localStorage.getItem('ops_lang') || 'en'; // Default to English
    }

    window.setCurrentLanguage = function(lang) {
        localStorage.setItem('ops_lang', lang);
    }

    window.applyTranslations = function(lang) {
        // Update elements with data-en/data-es attributes for text content
        document.querySelectorAll('[data-en], [data-es]').forEach(el => {
            const translationKey = lang === 'es' ? 'data-es' : 'data-en';
            const text = el.getAttribute(translationKey);

            if (text !== null) {
                let icon = el.querySelector('i.fas');
                let textNodeToUpdate = null;

                // Find the primary text node, skipping over potential icon nodes or empty text nodes
                for (let i = 0; i < el.childNodes.length; i++) {
                    if (el.childNodes[i].nodeType === Node.TEXT_NODE && el.childNodes[i].textContent.trim().length > 0) {
                        textNodeToUpdate = el.childNodes[i];
                        break;
                    }
                }

                if (el.classList.contains('fab-text') || el.classList.contains('header-toggle-btn') || el.classList.contains('mobile-nav-item') && !icon) {
                    // For simple text buttons or spans, just set textContent
                    el.textContent = text;
                } else if (icon) {
                    // If there's an icon, try to update a text node or append
                    if (textNodeToUpdate) {
                        textNodeToUpdate.textContent = text;
                    } else {
                        // If no suitable text node, create one. Add a space if icon is first.
                        let space = "";
                        if (el.firstChild === icon && icon.nextSibling && icon.nextSibling.nodeType !== Node.TEXT_NODE) {
                           // Add space only if there isn't already a text node (even empty) after icon
                        } else if(el.firstChild !== icon){
                           // If icon is not the first child, text might be before it.
                        }

                        // Heuristic: if it's a button-like element, put text after icon with a space
                        if(el.tagName === 'BUTTON' || el.tagName === 'A'){
                            let existingTextNodes = Array.from(el.childNodes).filter(n => n.nodeType === Node.TEXT_NODE);
                            existingTextNodes.forEach(n => n.remove()); // Remove old text nodes
                            el.appendChild(document.createTextNode(" " + text)); // Add new text after icon
                        } else {
                             el.textContent = text; // Fallback for other cases with icons
                        }
                    }
                } else {
                    // For other elements without icons, directly set textContent
                    el.textContent = text;
                }
            }
        });

        // Update placeholders
        document.querySelectorAll('[data-placeholder-en], [data-placeholder-es]').forEach(el => {
            el.placeholder = el.getAttribute(lang === 'es' ? 'data-placeholder-es' : 'data-placeholder-en') || '';
        });

        // Update ARIA labels
        document.querySelectorAll('[data-aria-label-en], [data-aria-label-es]').forEach(el => {
            const labelText = el.getAttribute(lang === 'es' ? 'data-aria-label-es' : 'data-aria-label-en');
            if (labelText !== null) el.setAttribute('aria-label', labelText);
        });

        // Update title attributes
        document.querySelectorAll('[data-title-en], [data-title-es]').forEach(el => {
            const titleText = el.getAttribute(lang === 'es' ? 'data-title-es' : 'data-title-en');
            if (titleText !== null) el.setAttribute('title', titleText);
        });

        // Update page title
        const titleTag = document.querySelector('title[data-en][data-es]');
        if(titleTag) {
            titleTag.textContent = titleTag.getAttribute(lang === 'es' ? 'data-es' : 'data-en');
        }

        // Sync language toggle button texts (header and mobile)
        document.querySelectorAll('.lang-toggle-btn').forEach(button => {
            button.textContent = lang.toUpperCase();
        });
    }

    window.toggleLanguage = function() {
        const newLang = window.getCurrentLanguage() === 'en' ? 'es' : 'en';
        window.setCurrentLanguage(newLang);
        window.applyTranslations(newLang);
        // Post message to chatbot iframe about language change
        const chatbotPlaceholder = document.getElementById('chatbot-placeholder');
        if (chatbotPlaceholder && chatbotPlaceholder.classList.contains('active')) { // Check if chat placeholder is active
            const chatbotIframe = chatbotPlaceholder.querySelector('iframe');
            if (chatbotIframe && chatbotIframe.contentWindow) {
                try {
                    chatbotIframe.contentWindow.postMessage({ type: 'languageChange', language: newLang }, window.location.origin);
                    console.log(`INFO:GlobalToggles/toggleLanguage: Sent languageChange message to chatbot iframe for lang "${newLang}".`);
                } catch (e) {
                    console.warn("Could not post languageChange message to chatbot iframe.", e);
                }
            }
        }

        const currentTheme = window.getCurrentTheme();
        document.querySelectorAll('.lang-toggle-btn').forEach(btn => {
            const ariaEn = btn.dataset.enLabel || "Switch to English";
            const ariaEs = btn.dataset.esLabel || "Cambiar a Español";
            btn.setAttribute('aria-label', newLang === 'en' ? ariaEs : ariaEn);
        });
        document.querySelectorAll('.theme-toggle-btn').forEach(btn => {
            const enLabel = currentTheme === 'dark' ? (btn.dataset.enLabelLight || "Switch to Light Theme") : (btn.dataset.enLabelDark || "Switch to Dark Theme");
            const esLabel = currentTheme === 'dark' ? (btn.dataset.esLabelLight || "Cambiar a Tema Claro") : (btn.dataset.esLabelDark || "Cambiar a Tema Oscuro");
            btn.setAttribute('aria-label', newLang === 'es' ? esLabel : enLabel);
        });
    }

    // --- Theme Functionality ---
    window.getCurrentTheme = function() {
        return localStorage.getItem('ops_theme') || 'dark';
    }

    window.setCurrentTheme = function(theme) {
        localStorage.setItem('ops_theme', theme);
    }

    window.applyTheme = function(theme) {
        if (theme === 'light') {
            body.classList.remove('dark');
            body.classList.add('light-theme');
        } else {
            body.classList.remove('light-theme');
            body.classList.add('dark');
        }
        document.querySelectorAll('.theme-toggle-btn').forEach(button => {
            button.textContent = theme === 'dark' ? 'Dark' : 'Light';
        });
    }

    window.toggleTheme = function() {
        const newTheme = window.getCurrentTheme() === 'dark' ? 'light' : 'dark';
        window.setCurrentTheme(newTheme);
        window.applyTheme(newTheme);

        // Post message to chatbot iframe about theme change
        const chatbotPlaceholder = document.getElementById('chatbot-placeholder');
        if (chatbotPlaceholder && chatbotPlaceholder.classList.contains('active')) { // Check if chat placeholder is active
            const chatbotIframe = chatbotPlaceholder.querySelector('iframe');
            if (chatbotIframe && chatbotIframe.contentWindow) {
                try {
                    chatbotIframe.contentWindow.postMessage({ type: 'themeChange', theme: newTheme }, window.location.origin);
                    console.log(`INFO:GlobalToggles/toggleTheme: Sent themeChange message to chatbot iframe for theme "${newTheme}".`);
                } catch (e) {
                    console.warn("Could not post themeChange message to chatbot iframe.", e);
                }
            }
        }

        const currentLang = window.getCurrentLanguage();
        document.querySelectorAll('.theme-toggle-btn').forEach(btn => {
            const enLabel = newTheme === 'dark' ? (btn.dataset.enLabelLight || "Switch to Light Theme") : (btn.dataset.enLabelDark || "Switch to Dark Theme");
            const esLabel = newTheme === 'dark' ? (btn.dataset.esLabelLight || "Cambiar a Tema Claro") : (btn.dataset.esLabelDark || "Cambiar a Tema Oscuro");
            btn.setAttribute('aria-label', currentLang === 'es' ? esLabel : enLabel);
        });
    }

    // --- Initialization ---
    const initialLang = window.getCurrentLanguage();
    const initialTheme = window.getCurrentTheme();

    window.applyTheme(initialTheme);
    window.applyTranslations(initialLang);

    document.querySelectorAll('.theme-toggle-btn').forEach(btn => {
        const enLabel = initialTheme === 'dark' ? (btn.dataset.enLabelLight || "Switch to Light Theme") : (btn.dataset.enLabelDark || "Switch to Dark Theme");
        const esLabel = initialTheme === 'dark' ? (btn.dataset.esLabelLight || "Cambiar a Tema Claro") : (btn.dataset.esLabelDark || "Cambiar a Tema Oscuro");
        btn.setAttribute('aria-label', initialLang === 'es' ? esLabel : enLabel);
    });
    document.querySelectorAll('.lang-toggle-btn').forEach(btn => {
        const enAriaLabel = initialLang === 'en' ? (btn.dataset.esLabel || "Switch to Spanish") : (btn.dataset.enLabel || "Switch to English");
        btn.setAttribute('aria-label', enAriaLabel);
    });

    if (themeBtn) {
        themeBtn.addEventListener('click', window.toggleTheme);
    }
    if (langBtn) {
        langBtn.addEventListener('click', window.toggleLanguage);
    }
});
