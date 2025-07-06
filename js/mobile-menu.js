// js/mobile-menu.js
// Handles the services panel linked to the bottom mobile navigation bar.
// The new FAB based mobile nav is in mobile-fab-nav.js

document.addEventListener('DOMContentLoaded', () => {
    // Corrected to target 'mobile-services-toggle' from the bottom mobile nav
    const mobileMenuToggle = document.getElementById('mobile-services-toggle');
    const mobileServicesPanel = document.getElementById('mobile-services-panel'); // Panel it controls

    if (mobileMenuToggle && mobileServicesPanel) {
        // console.log("Bottom mobile nav services menu system elements found.");
        mobileMenuToggle.addEventListener('click', () => {
            const isExpanded = mobileMenuToggle.getAttribute('aria-expanded') === 'true' || false;
            mobileMenuToggle.setAttribute('aria-expanded', !isExpanded);
            mobileServicesPanel.classList.toggle('open');
            // console.log("Bottom mobile nav services menu toggled.");
        });

        // Service buttons within this panel should also close it
        mobileServicesPanel.querySelectorAll('button[data-service-target]').forEach(button => {
            button.addEventListener('click', () => {
                 if (mobileServicesPanel.classList.contains('open')) {
                    if (mobileMenuToggle) { // Ensure the toggle button exists before trying to set its attribute
                        mobileMenuToggle.setAttribute('aria-expanded', 'false');
                    }
                    mobileServicesPanel.classList.remove('open');
                 }
                 // The dynamic-modal-manager will handle opening the actual service modal
            });
        });

    } else {
        if (!mobileMenuToggle) {
            // console.warn("Mobile services toggle button ('mobile-services-toggle') not found.");
        }
        if (!mobileServicesPanel) {
            // console.warn("Mobile services panel ('mobile-services-panel') not found.");
        }
        // console.log("Mobile services menu system from bottom nav could not be initialized.");
    }
});
