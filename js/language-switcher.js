// js/language-switcher.js

document.addEventListener('DOMContentLoaded', () => {
    const languageToggleButton = document.getElementById('language-toggle-button');
    let currentLanguage = 'en'; // Default language

    const translations = {
        // ... (your translations, unchanged for brevity, both 'en' and 'es') ...
        // [Keep your provided translation objects here—already complete]
        // Paste your translations here exactly as in your last message
        en: { /* ... */ },
        es: { /* ... */ }
    };

    // Global helpers for i18n
    window.getTranslatedText = function(key) {
        return translations[currentLanguage]?.[key] || key;
    };
    window.getCurrentLanguage = function() {
        return currentLanguage;
    };

    // Translate visible, placeholder, and aria-label text
    function loadTranslations() {
        document.querySelectorAll('[data-translate-key]').forEach(element => {
            const key = element.getAttribute('data-translate-key');
            const translation = translations[currentLanguage]?.[key];
            if (translation !== undefined) {
                // Use innerHTML for content with HTML tags, else use textContent
                if (key.includes("footer.copy") || key.includes("header.sub")) {
                    element.innerHTML = translation;
                } else {
                    element.textContent = translation;
                }
            }
        });
        // Placeholders
        document.querySelectorAll('[data-placeholder-translate-key]').forEach(element => {
            const key = element.getAttribute('data-placeholder-translate-key');
            const translation = translations[currentLanguage]?.[key];
            if (translation !== undefined) {
                element.setAttribute('placeholder', translation);
            }
        });
        // Aria-labels
        document.querySelectorAll('[data-aria-label-translate-key]').forEach(element => {
            const key = element.getAttribute('data-aria-label-translate-key');
            const translation = translations[currentLanguage]?.[key];
            if (translation !== undefined) {
                element.setAttribute('aria-label', translation);
            }
        });
    }

    // Update UI and emit languageChanged event
    function setLanguage(lang) {
        currentLanguage = lang;
        if (languageToggleButton) {
            languageToggleButton.textContent = lang === 'es' ? 'ES' : 'EN';
        }
        loadTranslations();
        localStorage.setItem('language', lang);
        document.dispatchEvent(new CustomEvent('languageChanged', { detail: { language: currentLanguage } }));
    }

    // Init: Set from saved or default
    const savedLanguage = localStorage.getItem('language');
    setLanguage(savedLanguage || 'en');

    // Toggle logic
    if (languageToggleButton) {
        languageToggleButton.addEventListener('click', () => {
            setLanguage(currentLanguage === 'en' ? 'es' : 'en');
        });
    } else {
        console.warn('Language toggle button #language-toggle-button not found.');
    }
});
