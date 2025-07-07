// js/mobile-fab-nav.js
document.addEventListener('DOMContentLoaded', () => {
    const qs = (sel, ctx = document) => ctx.querySelector(sel); // Local qs
    const qsa = (sel, ctx = document) => [...ctx.querySelectorAll(sel)]; // Local qsa

    const newFabToggle = qs('#newFabToggle');
    const newMobileNav = qs('#newMobileNav');

    if (newFabToggle && newMobileNav) {
        newFabToggle.addEventListener('click', () => {
            const isExpanded = newMobileNav.classList.contains('active'); // Check nav's class
            newFabToggle.setAttribute('aria-expanded', String(!isExpanded));
            newMobileNav.classList.toggle('active');
            // CSS for #newMobileNav.active should handle the transform: scaleY(1);
        });
    }

    const newMobileServicesToggle = qs('#newMobileServicesToggle');
    const newMobileServicesMenu = qs('#newMobileServicesMenu');

    if (newMobileServicesToggle && newMobileServicesMenu) {
        newMobileServicesToggle.addEventListener('click', () => {
            const isExpanded = newMobileServicesToggle.getAttribute('aria-expanded') === 'true';
            newMobileServicesToggle.setAttribute('aria-expanded', String(!isExpanded));
            newMobileServicesMenu.classList.toggle('active');
            // CSS for .mobile-services-menu.active handles display
        });
    }

    const newMobileLanguageToggle = qs('#newMobileLanguageToggle');
    if (newMobileLanguageToggle) {
        newMobileLanguageToggle.addEventListener('click', () => {
            const currentLangIsEN = newMobileLanguageToggle.textContent.trim() === 'EN';
            const targetLang = currentLangIsEN ? 'es' : 'en';
            const currentDisplayLang = currentLangIsEN ? 'ES' : 'EN';

            document.documentElement.lang = targetLang;
            newMobileLanguageToggle.textContent = currentDisplayLang;

            // Update desktop language toggle button if it exists
            const desktopLanguageToggle = qs('#language-toggle-button');
            if (desktopLanguageToggle) {
                desktopLanguageToggle.textContent = currentDisplayLang;
            }

            // Update text content for elements with data-en/data-es
            qsa('[data-en][data-es]').forEach(el => {
                if (el.dataset.en && el.dataset.es) {
                    el.textContent = currentLangIsEN ? el.dataset.es : el.dataset.en;
                }
            });

            // Update aria-labels and titles for elements with data-en-label/data-es-label
            qsa('[data-en-label][data-es-label]').forEach(el => {
                const newLabel = currentLangIsEN ? el.dataset.esLabel : el.dataset.enLabel;
                el.setAttribute('aria-label', newLabel);
                if (el.title) { // Check if title attribute exists
                    el.setAttribute('title', newLabel);
                }
            });

            // Update theme toggle button text and labels based on new language and current theme
            const currentThemeIsDark = document.body.classList.contains('dark') || document.body.dataset.theme === 'dark';
            const themeToggles = qsa('.theme-toggle-btn'); // Desktop and mobile

            themeToggles.forEach(button => {
                const enLabel = currentThemeIsDark ? button.dataset.enLabelDark : button.dataset.enLabelLight;
                const esLabel = currentThemeIsDark ? button.dataset.esLabelDark : button.dataset.esLabelLight;
                const newLabel = currentLangIsEN ? esLabel : enLabel;
                const newText = currentLangIsEN ? (currentThemeIsDark ? 'Oscuro' : 'Claro') : (currentThemeIsDark ? 'Dark' : 'Light');


                button.textContent = newText;
                if (newLabel) { // Ensure label data attributes exist
                    button.setAttribute('aria-label', newLabel);
                    if (button.title) {
                         button.setAttribute('title', newLabel);
                    }
                }
            });
        });
    }

    const newMobileThemeToggle = qs('#newMobileThemeToggle');
    if (newMobileThemeToggle) {
        newMobileThemeToggle.addEventListener('click', () => {
            const isCurrentlyDark = document.body.classList.contains('dark');
            document.body.classList.toggle('dark', !isCurrentlyDark);
            document.body.classList.toggle('light', isCurrentlyDark);
            document.body.setAttribute('data-theme', !isCurrentlyDark ? 'dark' : 'light');

            const currentLangIsEN = (qs('#newMobileLanguageToggle') ? qs('#newMobileLanguageToggle').textContent.trim() : 'EN') === 'EN';

            // Update text and aria-label for all theme toggle buttons
            const themeToggles = qsa('.theme-toggle-btn'); // Desktop and mobile
            themeToggles.forEach(button => {
                const newThemeIsDark = document.body.classList.contains('dark');
                const enLabel = newThemeIsDark ? button.dataset.enLabelDark : button.dataset.enLabelLight;
                const esLabel = newThemeIsDark ? button.dataset.esLabelDark : button.dataset.enLabelLight;
                const newLabel = currentLangIsEN ? enLabel : esLabel;
                const newText = currentLangIsEN ? (newThemeIsDark ? 'Dark' : 'Light') : (newThemeIsDark ? 'Oscuro' : 'Claro');

                button.textContent = newText;
                if (newLabel) {
                    button.setAttribute('aria-label', newLabel);
                     if (button.title) {
                        button.setAttribute('title', newLabel);
                    }
                }
            });
        });
    }
});
