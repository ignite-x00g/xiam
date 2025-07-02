// js/global-toggles.js
document.addEventListener('DOMContentLoaded', () => {
    console.log('[DEBUG] global-toggles.js: DOMContentLoaded event fired.');

    const langBtn = document.getElementById('language-toggle-button');
    const themeBtn = document.getElementById('theme-toggle-button');
    const body = document.body;

    console.log('[DEBUG] langBtn found:', langBtn);
    console.log('[DEBUG] themeBtn found:', themeBtn);
    console.log('[DEBUG] body found:', body);


    // ===== LANGUAGE TOGGLE =====
    // Default to English; save to localStorage
    function getCurrentLanguage() {
        return localStorage.getItem('ops_lang') || 'en';
    }
    function setCurrentLanguage(lang) {
        localStorage.setItem('ops_lang', lang);
    }
    function applyTranslations(lang) {
        console.log('[DEBUG] applyTranslations called with lang:', lang);
        // All elements with data-en or data-es
        document.querySelectorAll('[data-en], [data-es]').forEach(el => {
            const text = el.getAttribute(lang === 'es' ? 'data-es' : 'data-en');
            if (text !== null) el.textContent = text;
        });
        // All placeholders with data-placeholder-en / es
        document.querySelectorAll('[data-placeholder-en], [data-placeholder-es]').forEach(el => {
            el.placeholder = el.getAttribute(lang === 'es' ? 'data-placeholder-es' : 'data-placeholder-en') || '';
        });
        // All options inside <select> for Contact Us
        document.querySelectorAll('option[data-en][data-es]').forEach(opt => {
            opt.textContent = opt.getAttribute(lang === 'es' ? 'data-es' : 'data-en');
        });
        // All aria-labels with data-aria-label-en / es
        document.querySelectorAll('[data-aria-label-en], [data-aria-label-es]').forEach(el => {
            const labelText = el.getAttribute(lang === 'es' ? 'data-aria-label-es' : 'data-aria-label-en');
            if (labelText !== null) el.setAttribute('aria-label', labelText);
        });
        // Sync button text
        if (langBtn) langBtn.textContent = lang === 'es' ? 'ES' : 'EN';
    }

    // ===== THEME TOGGLE =====
    function getCurrentTheme() {
        return localStorage.getItem('ops_theme') || 'dark';
    }
    function setCurrentTheme(theme) {
        localStorage.setItem('ops_theme', theme);
    }
    function applyTheme(theme) {
        console.log('[DEBUG] applyTheme called with theme:', theme);
        if (theme === 'light') {
            body.classList.add('light-theme');
            if (themeBtn) themeBtn.textContent = 'Light';
        } else {
            body.classList.remove('light-theme');
            if (themeBtn) themeBtn.textContent = 'Dark';
        }
    }

    // Global function to be called by theme togglers
    window.toggleTheme = function() {
        const newTheme = getCurrentTheme() === 'dark' ? 'light' : 'dark';
        setCurrentTheme(newTheme);
        applyTheme(newTheme); // This will now update body.dark and relevant button texts

        // Explicitly update ARIA labels for all theme toggle buttons
        const isDark = newTheme === 'dark';
        document.querySelectorAll('.theme-toggle-btn').forEach(btn => {
            const enLabel = isDark ? btn.dataset.enLabelLight : btn.dataset.enLabelDark;
            const esLabel = isDark ? btn.dataset.esLabelLight : btn.dataset.esLabelDark;
            const currentLang = getCurrentLanguage();
            btn.setAttribute('aria-label', currentLang === 'es' ? esLabel : enLabel);
            // Also update title attribute if used similarly
            // Example: btn.title = currentLang === 'es' ? esLabel : enLabel;
        });
    };

    window.toggleLanguage = function() {
        const newLang = getCurrentLanguage() === 'en' ? 'es' : 'en';
        setCurrentLanguage(newLang);
        applyTranslations(newLang); // applyTranslations updates the main langBtn text

        // Explicitly update text and ARIA for all language buttons
        document.querySelectorAll('.lang-toggle-btn').forEach(btn => {
            btn.textContent = newLang.toUpperCase();
            // Update ARIA labels based on new language for these buttons
            const enLabel = btn.dataset.enLabel; // e.g., "Switch to Spanish"
            const esLabel = btn.dataset.esLabel; // e.g., "Cambiar a Inglés"
            // The labels should describe the action for the *next* click
            // So if current lang is ES, button shows ES, label says "Switch to English"
            btn.setAttribute('aria-label', newLang === 'en' ? esLabel : enLabel);
             // Also update title attribute if used similarly
            // Example: btn.title = newLang === 'en' ? esLabel : enLabel;
        });
    };


    // ===== INIT STATE =====
    console.log('[DEBUG] Initializing toggle states...');
    const initialLang = getCurrentLanguage();
    const initialTheme = getCurrentTheme();
    applyTranslations(initialLang);
    applyTheme(initialTheme);
    console.log('[DEBUG] Toggle states initialized.');
    // ===== HANDLE TOGGLES (event listeners for main header buttons) =====
    if (langBtn) {
        langBtn.textContent = initialLang === 'es' ? 'ES' : 'EN'; // Set initial text based on loaded lang
        langBtn.addEventListener('click', () => {
            console.log('[DEBUG] Language toggle button clicked');
            const newLang = getCurrentLanguage() === 'en' ? 'es' : 'en';
            setCurrentLanguage(newLang);
            applyTranslations(newLang);
        });
        console.log('[DEBUG] Language toggle event listener attached.');
    } else {
        console.warn('[DEBUG] Language toggle button (langBtn) not found. Listener not attached.');
    }

    if (themeBtn) {
        themeBtn.textContent = initialTheme === 'light' ? 'Light' : 'Dark'; // Set initial text based on loaded theme
        themeBtn.addEventListener('click', () => {
            console.log('[DEBUG] Theme toggle button clicked');
            const newTheme = getCurrentTheme() === 'dark' ? 'light' : 'dark';
            setCurrentTheme(newTheme);
            applyTheme(newTheme);
        });
        console.log('[DEBUG] Theme toggle event listener attached.');
    } else {
        console.warn('[DEBUG] Theme toggle button (themeBtn) not found. Listener not attached.');
    }

    // ====== EXPOSE GLOBALLY FOR OTHER SCRIPTS ======
    window.getCurrentLanguage = getCurrentLanguage;
    window.applyTranslations = applyTranslations;
    window.getCurrentTheme = getCurrentTheme;
    window.applyTheme = applyTheme;
    console.log('[DEBUG] Global toggle functions exposed on window object.');
});
