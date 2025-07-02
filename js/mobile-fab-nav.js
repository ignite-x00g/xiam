// js/mobile-fab-nav.js
document.addEventListener('DOMContentLoaded', () => {
    const fabToggle = document.getElementById('newFabToggle');
    const mobileNav = document.getElementById('newMobileNav');
    const servicesToggle = document.getElementById('newMobileServicesToggle');
    const servicesMenu = document.getElementById('newMobileServicesMenu');
    const langToggleBtn = document.getElementById('newMobileLanguageToggle');
    const themeToggleBtn = document.getElementById('newMobileThemeToggle');
    const chatLauncherBtn = document.getElementById('newMobileChatLauncher');

    // Toggle mobile nav visibility
    if (fabToggle && mobileNav) {
        fabToggle.addEventListener('click', () => {
            mobileNav.classList.toggle('active');
            // If nav is closed, also ensure services menu is closed
            if (!mobileNav.classList.contains('active') && servicesMenu && servicesMenu.classList.contains('active')) {
                servicesMenu.classList.remove('active');
                servicesToggle.setAttribute('aria-expanded', 'false');
                servicesMenu.setAttribute('aria-hidden', 'true');
            }
        });
    }

    // Toggle services menu visibility
    if (servicesToggle && servicesMenu) {
        servicesToggle.addEventListener('click', () => {
            servicesMenu.classList.toggle('active');
            const isExpanded = servicesMenu.classList.contains('active');
            servicesToggle.setAttribute('aria-expanded', isExpanded);
            servicesMenu.setAttribute('aria-hidden', !isExpanded);
        });
    }

    // Close menus if clicking outside
    document.addEventListener('click', (event) => {
        // Close mobileNav if click is outside fabToggle and mobileNav itself
        if (mobileNav && mobileNav.classList.contains('active') &&
            !fabToggle.contains(event.target) &&
            !mobileNav.contains(event.target)) {
            mobileNav.classList.remove('active');
            // Also close servicesMenu if it's open
            if (servicesMenu && servicesMenu.classList.contains('active')) {
                servicesMenu.classList.remove('active');
                servicesToggle.setAttribute('aria-expanded', 'false');
                servicesMenu.setAttribute('aria-hidden', 'true');
            }
        }
        // Close servicesMenu if click is outside servicesToggle and servicesMenu itself,
        // but only if the mobileNav is already active (otherwise it's hidden)
        else if (mobileNav && mobileNav.classList.contains('active') &&
                 servicesMenu && servicesMenu.classList.contains('active') &&
                 !servicesToggle.contains(event.target) &&
                 !servicesMenu.contains(event.target) &&
                 !fabToggle.contains(event.target) /* fabToggle click is handled above */ ) {
            servicesMenu.classList.remove('active');
            servicesToggle.setAttribute('aria-expanded', 'false');
            servicesMenu.setAttribute('aria-hidden', 'true');
        }
    });


    // Language Toggle Functionality
    if (langToggleBtn) {
        langToggleBtn.addEventListener('click', () => {
            // This assumes global `window.toggleLanguage` and `window.getCurrentLanguage` exist
            // from global-toggles.js or a similar script.
            if (window.toggleLanguage) {
                window.toggleLanguage(); // Call the global language toggle function

                // Update button text based on the new current language
                // The global-toggles.js should ideally handle updating all lang buttons
                // But if not, we can update this specific button here.
                // For now, assume global-toggles.js handles this button's text update.
                // If direct update is needed:
                // const currentLang = window.getCurrentLanguage ? window.getCurrentLanguage() : 'en';
                // langToggleBtn.textContent = currentLang.toUpperCase();
            } else {
                console.warn('Global language toggle function (window.toggleLanguage) not found.');
            }
        });
    }

    // Theme Toggle Functionality
    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            // This assumes global `window.toggleTheme` exists from global-toggles.js or similar.
            if (window.toggleTheme) {
                window.toggleTheme(); // Call the global theme toggle function

                // Update button text (e.g., "Light" / "Dark")
                // The global-toggles.js should ideally handle updating all theme buttons
                // For now, assume global-toggles.js handles this button's text update.
                // If direct update needed:
                // const isDark = document.body.classList.contains('dark');
                // themeToggleBtn.textContent = isDark ? 'Dark' : 'Light';
            } else {
                console.warn('Global theme toggle function (window.toggleTheme) not found.');
            }
        });
    }

    // Chat Launcher Functionality
    // The chat launcher button has `data-modal-target="chatbot-modal"`.
    // This should be automatically handled by `js/dynamic-modal-manager.js`.
    // No specific JS is needed here for that, unless custom behavior is required
    // before or after the modal opens.
    if (chatLauncherBtn) {
        chatLauncherBtn.addEventListener('click', () => {
            // Example: If we needed to do something before dynamic-modal-manager opens it
            // console.log('Mobile FAB chat launcher clicked. Modal should open via dynamic-modal-manager.');
            // Close the FAB menu itself if it's open
            if (mobileNav && mobileNav.classList.contains('active')) {
                mobileNav.classList.remove('active');
            }
            if (servicesMenu && servicesMenu.classList.contains('active')) {
                servicesMenu.classList.remove('active');
                if(servicesToggle) servicesToggle.setAttribute('aria-expanded', 'false');
            }
        });
    }

    // Service item click handling (for items within newMobileServicesMenu)
    // These also have `data-service-target` which should be handled by dynamic-modal-manager.js
    // if they are buttons.
    if (servicesMenu) {
        const serviceButtons = servicesMenu.querySelectorAll('button[data-service-target]');
        serviceButtons.forEach(button => {
            button.addEventListener('click', () => {
                // Close the FAB menu and services panel when a service is chosen
                if (mobileNav && mobileNav.classList.contains('active')) {
                    mobileNav.classList.remove('active');
                }
                if (servicesMenu.classList.contains('active')) {
                    servicesMenu.classList.remove('active');
                    if(servicesToggle) servicesToggle.setAttribute('aria-expanded', 'false');
                }
                // Modal opening itself is handled by dynamic-modal-manager.js
            });
        });
    }

    // Ensure correct initial states for ARIA attributes
    if (mobileNav) {
        mobileNav.classList.remove('active'); // Start closed
    }
    if (servicesMenu && servicesToggle) {
        servicesMenu.classList.remove('active'); // Start closed
        servicesToggle.setAttribute('aria-expanded', 'false');
        servicesMenu.setAttribute('aria-hidden', 'true');
    }
});
