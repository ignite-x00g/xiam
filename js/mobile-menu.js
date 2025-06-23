// js/mobile-menu.js
document.addEventListener('DOMContentLoaded', () => {
    // This is the hamburger icon in the bottom mobile nav bar that toggles the services list.
    const mobileServicesPanelToggle = document.getElementById('mobile-services-toggle');
    const mobileServicesPanel = document.getElementById('mobile-services-panel');

    // This is the old hamburger icon at the top of the page, which we might not need anymore
    // if the bottom nav is the primary mobile navigation.
    // const legacyMobileMenuToggle = document.getElementById('mobile-menu-toggle');
    // const legacyMobileServicesMenu = document.getElementById('mobile-services-menu'); // This was the old placeholder

    function toggleMobileServicesMenu(forceState) {
        if (!mobileServicesPanel || !mobileServicesPanelToggle) return;

        const DURATION = 300; // Animation duration in ms
        let isOpening;

        if (typeof forceState === 'boolean') {
            isOpening = forceState;
        } else {
            isOpening = !mobileServicesPanel.classList.contains('open');
        }

        mobileServicesPanelToggle.setAttribute('aria-expanded', String(isOpening));

        if (isOpening) {
            mobileServicesPanel.style.display = 'block';
            mobileServicesPanel.style.transition = `transform ${DURATION}ms ease-out, opacity ${DURATION}ms ease-out`;
            mobileServicesPanel.style.transform = 'translateY(100%)'; // Start off-screen
            mobileServicesPanel.style.opacity = '0';

            requestAnimationFrame(() => { // Ensure styles are applied before transition starts
                mobileServicesPanel.classList.add('open');
                mobileServicesPanel.style.transform = 'translateY(0)';
                mobileServicesPanel.style.opacity = '1';
            });
        } else {
            mobileServicesPanel.style.transform = 'translateY(0)';
            mobileServicesPanel.style.opacity = '1';

            requestAnimationFrame(() => {
                mobileServicesPanel.style.transform = 'translateY(100%)';
                mobileServicesPanel.style.opacity = '0';
                setTimeout(() => {
                    mobileServicesPanel.classList.remove('open');
                    mobileServicesPanel.style.display = 'none';
                }, DURATION);
            });
        }
    }

    if (mobileServicesPanelToggle && mobileServicesPanel) {
        mobileServicesPanelToggle.addEventListener('click', () => toggleMobileServicesMenu());

        // Close panel when a service button inside it is clicked
        mobileServicesPanel.querySelectorAll('button[data-service-target]').forEach(button => {
            button.addEventListener('click', () => {
                toggleMobileServicesMenu(false); // Force close
                // Modal opening is handled by dynamic-modal-manager.js
            });
        });
    }

    // Make toggleMobileServicesMenu globally available if needed for other scripts to close it
    window.toggleMobileServicesMenu = toggleMobileServicesMenu;

    // Language and Theme toggles within the mobile nav are handled by their respective scripts
    // (language-switcher.js and theme-switcher.js) as they now also listen to the mobile buttons.
    // The mobile chat link is also handled by dynamic-modal-manager.js via data-modal-target.
});
