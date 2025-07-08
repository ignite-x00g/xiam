document.addEventListener('DOMContentLoaded', () => {
    const body = document.body;
    // Use classes to select all theme and language toggle buttons
    const allLangBtns = document.querySelectorAll('.lang-toggle-btn');
    const allThemeBtns = document.querySelectorAll('.theme-toggle-btn');

    // --- Language Functionality ---
    // Retrieves the current language preference from localStorage, defaulting to 'en'.
    window.getCurrentLanguage = function() {
        return localStorage.getItem('ops_lang') || 'en'; // Default to English
    }

    window.setCurrentLanguage = function(lang) {
        localStorage.setItem('ops_lang', lang);
        document.documentElement.lang = lang; // Also update the lang attribute on HTML element
    }

    // Applies translations to all elements with relevant data attributes.
    // Handles text content, placeholders, ARIA labels, and titles.
    window.applyTranslations = function(lang) {
        // Update elements with data-en/data-es attributes for text content
        document.querySelectorAll('[data-en], [data-es]').forEach(el => {
            const translationKey = lang === 'es' ? 'data-es' : 'data-en';
            const text = el.getAttribute(translationKey);

            if (text !== null) {
                // More robustly handle elements that might contain icons + text
                if (el.matches('.mobile-nav-item') && el.querySelector('i.fas') && el.querySelector('span')) {
                    const span = el.querySelector('span');
                    if (span) span.textContent = text;
                } else if (el.classList.contains('fab-text') || el.classList.contains('header-toggle-btn') || (el.tagName === 'BUTTON' && !el.querySelector('i.fas'))) {
                    el.textContent = text;
                } else if (el.querySelector('i.fas')) { // Element with icon
                    let textNode = null;
                    for(let child of el.childNodes) {
                        if(child.nodeType === Node.TEXT_NODE && child.textContent.trim() !== '') {
                            textNode = child;
                            break;
                        }
                    }
                    if(textNode) {
                        textNode.textContent = ` ${text}`; // Add space before text if icon is present
                    } else {
                        // If no text node, but it's a button/anchor, append text after icon
                        if((el.tagName === 'BUTTON' || el.tagName === 'A') && el.querySelector('i.fas')){
                             // Remove old text nodes first to prevent duplication
                            Array.from(el.childNodes).filter(n => n.nodeType === Node.TEXT_NODE && n.textContent.trim() !== '').forEach(n => n.remove());
                            el.appendChild(document.createTextNode(` ${text}`));
                        } else {
                            // Fallback for other elements, prefer direct text content if no clear text node
                            // This might overwrite icons if not careful, so specific selectors are better
                        }
                    }
                } else {
                     // For simple elements or those intended to only have text
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

        // Sync all language toggle button texts
        allLangBtns.forEach(button => {
            button.textContent = lang.toUpperCase();
        });

        // Update ARIA labels on all toggle buttons based on the new language
        const currentTheme = window.getCurrentTheme ? window.getCurrentTheme() : 'dark';
        updateAllToggleButtonsAria(newLang = lang, currentTheme);
    }

    // Toggles the language, updates storage, applies translations, and notifies chatbot.
    window.toggleLanguage = function() {
        const newLang = window.getCurrentLanguage() === 'en' ? 'es' : 'en';
        window.setCurrentLanguage(newLang);
        window.applyTranslations(newLang); // This also updates ARIA on buttons

        // Post message to chatbot iframe about language change
        const chatbotIframe = document.querySelector('#iframeChatbotModal iframe'); // Updated selector
        if (chatbotIframe && chatbotIframe.contentWindow) {
            try {
                // Check if the iframe's parent modal is active
                const modalIsActive = chatbotIframe.closest('#iframeChatbotModal.active');
                if(modalIsActive) {
                    chatbotIframe.contentWindow.postMessage({ type: 'languageChange', language: newLang }, window.location.origin);
                    // console.log(`INFO:GlobalToggles/toggleLanguage: Sent languageChange to chatbot iframe for lang "${newLang}".`);
                }
            } catch (e) {
                console.warn("Could not post languageChange message to chatbot iframe.", e);
            }
        }
    }

    // --- Theme Functionality ---
    // Retrieves the current theme preference from localStorage, defaulting to 'dark'.
    window.getCurrentTheme = function() {
        return localStorage.getItem('ops_theme') || 'dark'; // Default to dark
    }

    window.setCurrentTheme = function(theme) {
        localStorage.setItem('ops_theme', theme);
    }

    window.applyTheme = function(theme) {
        if (theme === 'light') {
            body.classList.remove('dark'); // Assuming 'dark' is the class for dark theme from theme.css :root
            body.classList.add('light-theme'); // 'light-theme' is the class that overrides :root
        } else { // 'dark'
            body.classList.remove('light-theme');
            body.classList.add('dark'); // Ensure 'dark' class is present if it drives any specific non-:root dark styles
        }
        // Update text for all theme toggle buttons
        allThemeBtns.forEach(button => {
            // Text content should reflect the current state AFTER change
            const currentLang = window.getCurrentLanguage ? window.getCurrentLanguage() : 'en';
            if (theme === 'dark') {
                button.textContent = currentLang === 'es' ? (button.dataset.textDarkEs || 'Oscuro') : (button.dataset.textDarkEn || 'Dark');
            } else { // light
                button.textContent = currentLang === 'es' ? (button.dataset.textLightEs || 'Claro') : (button.dataset.textLightEn || 'Light');
            }
        });
        const currentLang = window.getCurrentLanguage ? window.getCurrentLanguage() : 'en';
        updateAllToggleButtonsAria(currentLang, newTheme = theme);
    }

    // Toggles the theme, updates storage, applies theme, and notifies chatbot.
    window.toggleTheme = function() {
        const newTheme = window.getCurrentTheme() === 'dark' ? 'light' : 'dark';
        window.setCurrentTheme(newTheme);
        window.applyTheme(newTheme); // This also updates ARIA on buttons

        // Post message to chatbot iframe about theme change
        const chatbotIframe = document.querySelector('#iframeChatbotModal iframe'); // Updated selector
        if (chatbotIframe && chatbotIframe.contentWindow) {
             try {
                const modalIsActive = chatbotIframe.closest('#iframeChatbotModal.active');
                if(modalIsActive){
                    chatbotIframe.contentWindow.postMessage({ type: 'themeChange', theme: newTheme }, window.location.origin);
                    // console.log(`INFO:GlobalToggles/toggleTheme: Sent themeChange message to chatbot iframe for theme "${newTheme}".`);
                }
            } catch (e) {
                console.warn("Could not post themeChange message to chatbot iframe.", e);
            }
        }
    }

    // Helper function to update ARIA labels on all language and theme toggle buttons.
    // This is called internally when language or theme changes.
    function updateAllToggleButtonsAria(currentLang, currentTheme) {
        allLangBtns.forEach(btn => {
            const ariaSwitchTo = currentLang === 'en' ? (btn.dataset.ariaEs || 'Switch to Spanish') : (btn.dataset.ariaEn || 'Switch to English');
            btn.setAttribute('aria-label', ariaSwitchTo);
        });
        allThemeBtns.forEach(btn => {
            const ariaSwitchTo = currentTheme === 'dark' ?
                (currentLang === 'es' ? (btn.dataset.ariaLightEs || 'Switch to Light Theme') : (btn.dataset.ariaLightEn || 'Switch to Light Theme')) :
                (currentLang === 'es' ? (btn.dataset.ariaDarkEs || 'Switch to Dark Theme') : (btn.dataset.ariaDarkEn || 'Switch to Dark Theme'));
            btn.setAttribute('aria-label', ariaSwitchTo);
        });
    }


    // --- Initialization ---
    const initialLang = window.getCurrentLanguage();
    const initialTheme = window.getCurrentTheme();

    window.setCurrentLanguage(initialLang); // Ensure HTML lang attribute is set
    window.applyTheme(initialTheme);    // Applies theme and updates theme button text via updateAllToggleButtonsAria
    window.applyTranslations(initialLang); // Applies translations and updates all button ARIA/text

    // Attach event listeners to all found toggle buttons
    allThemeBtns.forEach(btn => {
        btn.addEventListener('click', window.toggleTheme);
        // Add data attributes for text if not present, for dynamic updates in applyTheme
        if (!btn.dataset.textDarkEn) btn.dataset.textDarkEn = "Dark";
        if (!btn.dataset.textLightEn) btn.dataset.textLightEn = "Light";
        if (!btn.dataset.textDarkEs) btn.dataset.textDarkEs = "Oscuro";
        if (!btn.dataset.textLightEs) btn.dataset.textLightEs = "Claro";
    });
    allLangBtns.forEach(btn => {
        btn.addEventListener('click', window.toggleLanguage);
    });

    // Ensure all buttons have their initial ARIA labels and text correctly set
    updateAllToggleButtonsAria(initialLang, initialTheme);
    allLangBtns.forEach(button => { button.textContent = initialLang.toUpperCase(); });
    allThemeBtns.forEach(button => {
        if (initialTheme === 'dark') {
            button.textContent = initialLang === 'es' ? (button.dataset.textDarkEs || 'Oscuro') : (button.dataset.textDarkEn || 'Dark');
        } else {
            button.textContent = initialLang === 'es' ? (button.dataset.textLightEs || 'Claro') : (button.dataset.textLightEn || 'Light');
        }
    });
});
