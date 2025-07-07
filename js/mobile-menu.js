// js/mobile-menu.js
document.addEventListener('DOMContentLoaded', () => {
    const qs = (sel, ctx = document) => ctx.querySelector(sel); // Local qs

    const mobileServicesToggle = qs('#mobile-services-toggle');
    const mobileServicesPanel = qs('#mobile-services-panel');

    if (mobileServicesToggle && mobileServicesPanel) {
        mobileServicesToggle.addEventListener('click', () => {
            const isExpanded = mobileServicesToggle.getAttribute('aria-expanded') === 'true';
            mobileServicesToggle.setAttribute('aria-expanded', String(!isExpanded));
            mobileServicesPanel.classList.toggle('active');
            // CSS for .mobile-services-menu.active should handle display:block
            // and for #mobile-services-panel.active if specific display is needed
        });
    }
});
