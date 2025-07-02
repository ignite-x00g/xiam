// js/global-toggles.js
document.addEventListener('DOMContentLoaded', () => {
    const langBtn = document.getElementById('language-toggle-button');
    const themeBtn = document.getElementById('theme-toggle-button');
    const body = document.body;

    // ===== LANGUAGE TOGGLE =====
    // Default to English; save to localStorage
    function getCurrentLanguage() {
        return localStorage.getItem('ops_lang') || 'en';
    }
    function setCurrentLanguage(lang) {
        localStorage.setItem('ops_lang', lang);
    }
    function applyTranslations(lang) {
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
            body.classList.add('light-theme');
            if (themeBtn) themeBtn.textContent = 'Light';
        } else {
            body.classList.remove('light-theme');
            if (themeBtn) themeBtn.textContent = 'Dark';
        }
    }

    // ===== INIT STATE =====
    const initialLang = getCurrentLanguage();
    const initialTheme = getCurrentTheme();
    applyTranslations(initialLang);
    applyTheme(initialTheme);

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
    window.getCurrentLanguage = getCurrentLanguage;
    window.applyTranslations = applyTranslations;
    window.getCurrentTheme = getCurrentTheme;
    window.applyTheme = applyTheme;
});
