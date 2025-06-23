// js/theme-switcher.js
document.addEventListener('DOMContentLoaded', () => {
    const desktopThemeToggle = document.getElementById('theme-toggle-button');
    const mobileThemeToggle = document.getElementById('mobile-theme-toggle');
    const body = document.body;

    let currentTheme = localStorage.getItem('theme') || 'dark'; // 'dark' or 'light'

    function applyTheme(theme) {
        body.classList.remove('light-theme', 'dark-theme');
        body.classList.add(theme === 'light' ? 'light-theme' : 'dark-theme');
        localStorage.setItem('theme', theme);

        // Update button texts based on the new theme and current language
        updateButtonTexts(theme);
        document.dispatchEvent(new CustomEvent('themeChanged', { detail: { theme: theme } }));
    }

    function updateButtonTexts(theme) {
        const lang = (window.getCurrentLanguage && window.getCurrentLanguage()) || 'en';
        let desktopBaseText, mobileCurrentThemeText, ariaLabel;

        // Desktop button base text
        desktopBaseText = lang === 'es' ? 'Tema' : 'Theme';

        if (theme === 'light') {
            mobileCurrentThemeText = lang === 'es' ? 'Claro' : 'Light';
            ariaLabel = lang === 'es' ? 'Cambiar a tema oscuro' : 'Switch to dark theme';
        } else { // dark theme
            mobileCurrentThemeText = lang === 'es' ? 'Oscuro' : 'Dark';
            ariaLabel = lang === 'es' ? 'Cambiar a tema claro' : 'Switch to light theme';
        }

        if (desktopThemeToggle) {
            desktopThemeToggle.textContent = desktopBaseText; // Only "Theme" or "Tema"
            desktopThemeToggle.setAttribute('aria-label', ariaLabel);
            desktopThemeToggle.setAttribute('aria-pressed', theme === 'dark' ? 'true' : 'false');
        }
        if (mobileThemeToggle) {
            mobileThemeToggle.textContent = mobileCurrentThemeText; // e.g., "Light" or "Dark"
            mobileThemeToggle.setAttribute('aria-label', ariaLabel); // Same aria-label as desktop for action
            mobileThemeToggle.setAttribute('aria-pressed', theme === 'dark' ? 'true' : 'false');
        }
    }

    function toggleTheme() {
        currentTheme = body.classList.contains('light-theme') ? 'dark' : 'light';
        applyTheme(currentTheme);
    }

    // Initial theme application
    applyTheme(currentTheme);

    // Event Listeners
    if (desktopThemeToggle) {
        desktopThemeToggle.addEventListener('click', toggleTheme);
    }
    if (mobileThemeToggle) {
        mobileThemeToggle.addEventListener('click', toggleTheme);
    }

    // Listen for language changes to update button texts
    document.addEventListener('languageChanged', () => {
        updateButtonTexts(currentTheme);
    });

    // Expose for other scripts if needed
    window.getCurrentTheme = () => currentTheme;
});
