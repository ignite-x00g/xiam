// js/theme-switcher.js
document.addEventListener('DOMContentLoaded', () => {
    const themeToggleButton = document.getElementById('theme-toggle-button');
    const bodyElement = document.body;
    let currentTheme = 'dark'; // Default theme

    // Function to apply theme and update button text
    function applyTheme(theme) {
        currentTheme = theme;
        if (theme === 'light') {
            bodyElement.classList.add('light-theme');
            if (themeToggleButton) themeToggleButton.textContent = '[Light]'; // Update button text
        } else { // 'dark'
            bodyElement.classList.remove('light-theme');
            if (themeToggleButton) themeToggleButton.textContent = '[Dark]'; // Update button text
        }
        localStorage.setItem('theme', theme);
    }

    // Check for saved theme preference in localStorage and apply it
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        applyTheme(savedTheme);
    } else {
        applyTheme('dark'); // Apply default dark theme and set button text
    }

    // Event listener for the toggle button
    if (themeToggleButton) {
        themeToggleButton.addEventListener('click', () => {
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            applyTheme(newTheme);
        });
    } else {
        console.warn('Theme toggle button #theme-toggle-button not found.');
    }
});
