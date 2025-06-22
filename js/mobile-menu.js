// js/mobile-menu.js

document.addEventListener('DOMContentLoaded', () => {
    const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
    const mobileServicesMenu = document.getElementById('mobile-services-menu');
    const mainSiteHeader = document.querySelector('.site-header');

    if (mobileMenuToggle && mobileServicesMenu) {
        mobileMenuToggle.addEventListener('click', () => {
            const isExpanded = mobileServicesMenu.classList.toggle('open');
            mobileMenuToggle.setAttribute('aria-expanded', String(isExpanded));

            const currentGlobalLang = window.getCurrentLanguage ? window.getCurrentLanguage() : 'en';

            if (isExpanded) {
                mobileMenuToggle.innerHTML = '&times;'; // Close icon
                const ariaLabelCloseEn = mobileMenuToggle.getAttribute('data-aria-label-en-alt') || 'Close menu';
                const ariaLabelCloseEs = mobileMenuToggle.getAttribute('data-aria-label-es-alt') || 'Cerrar menú';
                mobileMenuToggle.setAttribute('aria-label', currentGlobalLang === 'es' ? ariaLabelCloseEs : ariaLabelCloseEn);
                if (mainSiteHeader) mainSiteHeader.style.zIndex = '9999';
            } else {
                mobileMenuToggle.innerHTML = '☰'; // Hamburger icon
                const originalAriaLabelEn = mobileMenuToggle.getAttribute('data-aria-label-en') || 'Open menu';
                const originalAriaLabelEs = mobileMenuToggle.getAttribute('data-aria-label-es') || 'Abrir menú';
                mobileMenuToggle.setAttribute('aria-label', currentGlobalLang === 'es' ? originalAriaLabelEs : originalAriaLabelEn);
                if (mainSiteHeader) mainSiteHeader.style.zIndex = '';
            }
        });

        // Close menu on link click (for future links)
        mobileServicesMenu.addEventListener('click', (event) => {
            if (event.target.tagName === 'A' || event.target.closest('A')) {
                mobileServicesMenu.classList.remove('open');
                mobileMenuToggle.setAttribute('aria-expanded', 'false');
                mobileMenuToggle.innerHTML = '☰';
                const currentGlobalLang = window.getCurrentLanguage ? window.getCurrentLanguage() : 'en';
                const originalAriaLabelEn = mobileMenuToggle.getAttribute('data-aria-label-en') || 'Open menu';
                const originalAriaLabelEs = mobileMenuToggle.getAttribute('data-aria-label-es') || 'Abrir menú';
                mobileMenuToggle.setAttribute('aria-label', currentGlobalLang === 'es' ? originalAriaLabelEs : originalAriaLabelEn);
                if (mainSiteHeader) mainSiteHeader.style.zIndex = '';
            }
        });
    }

    // Update aria-label on language change if menu is open (or default if closed)
    function updateMobileMenuAriaLabelOnLangChange() {
        if (mobileMenuToggle && mobileServicesMenu && mobileServicesMenu.classList.contains('open')) {
            const currentGlobalLang = window.getCurrentLanguage ? window.getCurrentLanguage() : 'en';
            const ariaLabelCloseEn = mobileMenuToggle.getAttribute('data-aria-label-en-alt') || 'Close menu';
            const ariaLabelCloseEs = mobileMenuToggle.getAttribute('data-aria-label-es-alt') || 'Cerrar menú';
            mobileMenuToggle.setAttribute('aria-label', currentGlobalLang === 'es' ? ariaLabelCloseEs : ariaLabelCloseEn);
        } else if (mobileMenuToggle) {
            const currentGlobalLang = window.getCurrentLanguage ? window.getCurrentLanguage() : 'en';
            const originalAriaLabelEn = mobileMenuToggle.getAttribute('data-aria-label-en') || 'Open menu';
            const originalAriaLabelEs = mobileMenuToggle.getAttribute('data-aria-label-es') || 'Abrir menú';
            mobileMenuToggle.setAttribute('aria-label', currentGlobalLang === 'es' ? originalAriaLabelEs : originalAriaLabelEn);
        }
    }

    document.addEventListener('languageChanged', updateMobileMenuAriaLabelOnLangChange);
});
