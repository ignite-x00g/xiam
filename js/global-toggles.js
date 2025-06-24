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

    // ===== HANDLE TOGGLES =====
    if (langBtn) {
        langBtn.textContent = initialLang === 'es' ? 'ES' : 'EN';
        langBtn.addEventListener('click', () => {
            const newLang = getCurrentLanguage() === 'en' ? 'es' : 'en';
            setCurrentLanguage(newLang);
            applyTranslations(newLang);
        });
    }
    if (themeBtn) {
        themeBtn.textContent = initialTheme === 'light' ? 'Light' : 'Dark';
        themeBtn.addEventListener('click', () => {
            const newTheme = getCurrentTheme() === 'dark' ? 'light' : 'dark';
            setCurrentTheme(newTheme);
            applyTheme(newTheme);
        });
    }

    // ====== EXPOSE GLOBALLY FOR OTHER SCRIPTS ======
    window.getCurrentLanguage = getCurrentLanguage;
    window.applyTranslations = applyTranslations;
    window.getCurrentTheme = getCurrentTheme;
    window.applyTheme = applyTheme;
});
