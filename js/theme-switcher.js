// js/theme-switcher.js
document.addEventListener('DOMContentLoaded', () => {
    const themeToggleButton = document.getElementById('theme-toggle-button');
    const body = document.body;

    function setTheme(theme) {
        // Remove any existing theme class
        body.classList.remove('light-theme', 'dark-theme');

        if (theme === 'light') {
            body.classList.add('light-theme');
            if (themeToggleButton) {
                themeToggleButton.textContent = 'Light'; // Text for when light mode is active
            }
        } else {
            body.classList.add('dark-theme'); // Default to dark theme if not 'light'
            if (themeToggleButton) {
                themeToggleButton.textContent = 'Dark'; // Text for when dark mode is active
            }
        }
        localStorage.setItem('theme', theme);
    }

    // Load saved theme or default to dark
    const currentTheme = localStorage.getItem('theme') || 'dark';
    setTheme(currentTheme);

    if (themeToggleButton) {
        themeToggleButton.addEventListener('click', () => {
            const newTheme = body.classList.contains('light-theme') ? 'dark' : 'light';
            setTheme(newTheme);
        });
    } else {
        console.warn('Theme toggle button #theme-toggle-button not found.');
    }
});
