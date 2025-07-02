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
        if (theme === 'light') {
            body.classList.remove('dark'); // Remove .dark if it exists
            body.classList.add('light-theme'); // Add .light-theme for light mode styles
            if (themeBtn) themeBtn.textContent = 'Light';
            const mobileThemeBtn = document.getElementById('newMobileThemeToggle');
            if (mobileThemeBtn) mobileThemeBtn.textContent = 'Light';
        } else { // 'dark'
            body.classList.remove('light-theme'); // Remove .light-theme
            body.classList.add('dark'); // Add .dark for dark mode (even if :root is dark, for consistency)
            if (themeBtn) themeBtn.textContent = 'Dark';
            const mobileThemeBtn = document.getElementById('newMobileThemeToggle');
            if (mobileThemeBtn) mobileThemeBtn.textContent = 'Dark';
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
    applyTranslations(initialLang); // This updates general text & main langBtn text
    applyTheme(initialTheme);       // This updates body class & main themeBtn text
    // Update ARIA labels for theme buttons on init
    const isInitiallyDark = initialTheme === 'dark';
    document.querySelectorAll('.theme-toggle-btn').forEach(btn => {
        const enLabel = isInitiallyDark ? btn.dataset.enLabelLight : btn.dataset.enLabelDark;
        const esLabel = isInitiallyDark ? btn.dataset.esLabelLight : btn.dataset.esLabelDark;
        btn.setAttribute('aria-label', initialLang === 'es' ? esLabel : enLabel);
        btn.textContent = isInitiallyDark ? 'Dark' : 'Light'; // Ensure button text is also correct
    });

    // ===== HANDLE TOGGLES - Using Event Delegation =====
    // Attach listeners to a static parent, e.g., document.body or a specific header container if stable.
    // Using document.body for broadness, but '.site-header' might be more performant if guaranteed static.
    const headerElement = document.querySelector('.site-header');

    if (headerElement) {
        // Initialize button texts directly if buttons exist, as event listeners won't set them before a click
        if (langBtn) langBtn.textContent = initialLang === 'es' ? 'ES' : 'EN';
        if (themeBtn) themeBtn.textContent = initialTheme === 'light' ? 'Light' : 'Dark';

        headerElement.addEventListener('click', (event) => {
            const targetLangBtn = event.target.closest('#language-toggle-button');
            const targetThemeBtn = event.target.closest('#theme-toggle-button');

            if (targetLangBtn) {
                console.log('[DELEGATED DEBUG] Language toggle clicked. Event Target:', event.target, 'Actual Clicked Element (langBtn):', targetLangBtn);
                // If manual debugging: debugger;
                const newLang = getCurrentLanguage() === 'en' ? 'es' : 'en';
                setCurrentLanguage(newLang);
                applyTranslations(newLang); // This will update langBtn.textContent too
            }

            if (targetThemeBtn) {
                console.log('[DELEGATED DEBUG] Theme toggle clicked. Event Target:', event.target, 'Actual Clicked Element (themeBtn):', targetThemeBtn);
                // If manual debugging: debugger;
                const newTheme = getCurrentTheme() === 'dark' ? 'light' : 'dark';
                setCurrentTheme(newTheme);
                applyTheme(newTheme); // This will update themeBtn.textContent too
            }
        }, true); // Use capture phase for delegation as well, to catch early
        console.log('[DEBUG] Delegated event listener attached to .site-header (capture phase).');

        // Log if the original buttons were not found by getElementById, even though delegation might still work if they appear later with these IDs.
        if (!langBtn) {
            console.warn('[DEBUG] Language toggle button (#language-toggle-button) was not found by getElementById at listener setup time.');
        }
        if (!themeBtn) {
            console.warn('[DEBUG] Theme toggle button (#theme-toggle-button) was not found by getElementById at listener setup time.');
        }

    } else {
        console.error('[DEBUG] .site-header element not found. Cannot attach delegated event listeners for toggles.');
        // Fallback or further error handling if header is crucial and missing
        // For now, this means toggles won't work if header isn't there for delegation.
    }

    // ====== EXPOSE GLOBALLY FOR OTHER SCRIPTS ======
    // window.getCurrentLanguage, window.applyTranslations, window.getCurrentTheme, window.applyTheme are already exposed.
    // window.toggleTheme and window.toggleLanguage are now also globally defined.
});
