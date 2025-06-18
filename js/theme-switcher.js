// js/theme-switcher.js
document.addEventListener('DOMContentLoaded', () => {
    const themeToggleCheckbox = document.getElementById('theme-toggle-checkbox');
    const bodyElement = document.body;

    // Function to apply theme based on preference
    function applyTheme(theme) {
        if (theme === 'light') {
            bodyElement.classList.add('light-theme');
            if (themeToggleCheckbox) themeToggleCheckbox.checked = true;
        } else {
            bodyElement.classList.remove('light-theme');
            if (themeToggleCheckbox) themeToggleCheckbox.checked = false;
        }
    }

    // Check for saved theme preference in localStorage
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        applyTheme(savedTheme);
    } else {
        // Optional: Check for prefers-color-scheme if no localStorage preference
        // For now, defaults to dark theme (no class on body) if nothing is saved
        applyTheme('dark'); // Explicitly apply default if nothing saved
    }

    // Event listener for the toggle switch
    if (themeToggleCheckbox) {
        themeToggleCheckbox.addEventListener('change', () => {
            if (themeToggleCheckbox.checked) {
                applyTheme('light');
                localStorage.setItem('theme', 'light');
            } else {
                applyTheme('dark');
                localStorage.setItem('theme', 'dark');
            }
        });
    } else {
        console.warn('Theme toggle checkbox #theme-toggle-checkbox not found.');
    }
});
