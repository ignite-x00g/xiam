// js/main-mobile-navigation.js
// Handles the primary mobile navigation menu (#mobileNav) and its services submenu (#mobileServicesMenu)

document.addEventListener('DOMContentLoaded', () => {
    // Helper function qs, qsa can be defined locally or assumed from global-app.js
    // For encapsulation, defining locally is safer if global-app.js load order isn't guaranteed.
    const qs = (sel, ctx = document) => ctx.querySelector(sel);
    // const qsa = (sel, ctx = document) => [...ctx.querySelectorAll(sel)]; // Not used in this snippet

    const menuToggle = qs('#menuToggle');
    const mobileNav = qs('#mobileNav');

    if (menuToggle && mobileNav) {
        menuToggle.addEventListener('click', () => {
            const isActive = mobileNav.classList.toggle('active');
            menuToggle.setAttribute('aria-expanded', String(isActive));
            // Optional: Add aria-hidden to mobileNav if it should be hidden from screen readers when not active
            // mobileNav.setAttribute('aria-hidden', String(!isActive));
        });
    }

    const mobileServicesToggle = qs('#mobile-services-toggle');
    const mobileServicesMenu = qs('#mobile-services-menu');

    if (mobileServicesToggle && mobileServicesMenu) {
        // Initial ARIA state based on HTML (assuming it's hidden by default)
        const initiallyExpanded = mobileServicesMenu.classList.contains('active');
        mobileServicesToggle.setAttribute('aria-expanded', String(initiallyExpanded));
        mobileServicesMenu.setAttribute('aria-hidden', String(!initiallyExpanded));

        mobileServicesToggle.addEventListener('click', () => {
            const isExpanded = mobileServicesMenu.classList.toggle('active');
            mobileServicesToggle.setAttribute('aria-expanded', String(isExpanded));
            mobileServicesMenu.setAttribute('aria-hidden', String(!isExpanded));
        });
    }

    // Logic for closing mobile menus when a modal is opened via mobile services menu items
    // This was previously hinted at in sample-interactions.js DOMContentLoaded.
    // DMM handles opening modals. This script can listen for modal opening or just handle its own menu closing.
    // For simplicity, if a service link inside #mobileServicesMenu is clicked, we can close the menus.
    // This assumes service links are `<a>` or `<button>` elements that trigger DMM.
    if (mobileServicesMenu) {
        const serviceLinks = mobileServicesMenu.querySelectorAll('a[data-modal-target], button[data-modal-target]');
        serviceLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (mobileServicesMenu.classList.contains('active')) {
                    mobileServicesMenu.classList.remove('active');
                    mobileServicesToggle.setAttribute('aria-expanded', 'false');
                    mobileServicesMenu.setAttribute('aria-hidden', 'true');
                }
                if (mobileNav && mobileNav.classList.contains('active')) { // Also close main mobile nav
                    mobileNav.classList.remove('active');
                    if(menuToggle) menuToggle.setAttribute('aria-expanded', 'false');
                }
            });
        });
    }

    // Also, if a direct chat button inside #mobileNav is clicked
    if (mobileNav) {
        const chatButton = mobileNav.querySelector('[data-modal-target="iframeChatbotModal"]');
        if (chatButton) {
            chatButton.addEventListener('click', () => {
                 if (mobileNav.classList.contains('active')) {
                    mobileNav.classList.remove('active');
                    if(menuToggle) menuToggle.setAttribute('aria-expanded', 'false');
                }
            });
        }
    }

});
