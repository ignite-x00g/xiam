// js/mobile-menu.js
// For the original top hamburger menu system if any part of it is still used.
// The new FAB based mobile nav is in mobile-fab-nav.js

document.addEventListener('DOMContentLoaded', () => {
    const mobileMenuToggle = document.getElementById('mobile-menu-toggle'); // Top hamburger
    const mobileServicesPanel = document.getElementById('mobile-services-panel'); // Panel it controls

    if (mobileMenuToggle && mobileServicesPanel) {
        // console.log("Old mobile menu system elements found.");
        mobileMenuToggle.addEventListener('click', () => {
            const isExpanded = mobileMenuToggle.getAttribute('aria-expanded') === 'true' || false;
            mobileMenuToggle.setAttribute('aria-expanded', !isExpanded);
            mobileServicesPanel.classList.toggle('open');
            // console.log("Old mobile menu toggled.");
        });

        // Example: Service buttons within this old panel might also need to close it
        mobileServicesPanel.querySelectorAll('button[data-service-target]').forEach(button => {
            button.addEventListener('click', () => {
                 if (mobileServicesPanel.classList.contains('open')) {
                    mobileMenuToggle.setAttribute('aria-expanded', 'false');
                    mobileServicesPanel.classList.remove('open');
                 }
                 // The dynamic-modal-manager will handle opening the actual service modal
            });
        });

    } else {
        // console.log("Old mobile menu system elements (mobile-menu-toggle or mobile-services-panel) not found.");
    }
});
