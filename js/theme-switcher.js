// js/theme-switcher.js
document.addEventListener('DOMContentLoaded', () => {
    const themeToggleButton = document.getElementById('theme-toggle-button');
    const body = document.body;

    // Helper for translated button text and aria-labels
    function getThemeButtonText(theme, lang) {
        if (window.getTranslatedText) {
            if (theme === 'light') return lang === 'es' ? 'Claro' : 'Light';
            return lang === 'es' ? 'Oscuro' : 'Dark';
        }
        // Fallback
        return theme === 'light' ? 'Light' : 'Dark';
    }
    function getThemeButtonAriaLabel(theme, lang) {
        if (window.getTranslatedText) {
            if (theme === 'light') return lang === 'es' ? 'Cambiar a modo oscuro' : 'Switch to dark mode';
            return lang === 'es' ? 'Cambiar a modo claro' : 'Switch to light mode';
        }
        return theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode';
    }

    function getCurrentLang() {
        return (window.getCurrentLanguage && window.getCurrentLanguage()) || 'en';
    }

    function setTheme(theme) {
        body.classList.remove('light-theme', 'dark-theme');
        if (theme === 'light') {
            body.classList.add('light-theme');
        } else {
            body.classList.add('dark-theme');
            theme = 'dark'; // Normalize for any bad values
        }
        localStorage.setItem('theme', theme);

        // Set toggle button label/text/aria
        if (themeToggleButton) {
            const lang = getCurrentLang();
            themeToggleButton.textContent = getThemeButtonText(theme, lang);
            themeToggleButton.setAttribute('aria-label', getThemeButtonAriaLabel(theme, lang));
            themeToggleButton.setAttribute('aria-pressed', theme === 'light' ? 'false' : 'true');
        }
    }

    // Initialize theme from storage
    const savedTheme = localStorage.getItem('theme') || 'dark';
    setTheme(savedTheme);

    // Handle click
    if (themeToggleButton) {
        themeToggleButton.addEventListener('click', () => {
            const isLight = body.classList.contains('light-theme');
            const newTheme = isLight ? 'dark' : 'light';
            setTheme(newTheme);
        });
    } else {
        console.warn('Theme toggle button #theme-toggle-button not found.');
    }

    // Listen for language changes
    document.addEventListener('languageChanged', () => {
        // Refresh button label to match new language
        const theme = body.classList.contains('light-theme') ? 'light' : 'dark';
        setTheme(theme);
    });
});
