document.addEventListener('DOMContentLoaded', () => {
    const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
    const mobileServicesMenu = document.getElementById('mobile-services-menu');
    const mainSiteHeader = document.querySelector('.site-header'); // To manage its z-index

    if (mobileMenuToggle && mobileServicesMenu) {
        mobileMenuToggle.addEventListener('click', () => {
            const isExpanded = mobileServicesMenu.classList.toggle('open');
            mobileMenuToggle.setAttribute('aria-expanded', String(isExpanded));

            const currentGlobalLang = window.getCurrentLanguage ? window.getCurrentLanguage() : 'en';

            if (isExpanded) {
                mobileMenuToggle.innerHTML = '&times;'; // Close icon
                // Use alt aria-label text
                const ariaLabelCloseEn = mobileMenuToggle.getAttribute('data-aria-label-en-alt') || 'Close menu';
                const ariaLabelCloseEs = mobileMenuToggle.getAttribute('data-aria-label-es-alt') || 'Cerrar menú';
                mobileMenuToggle.setAttribute('aria-label', currentGlobalLang === 'es' ? ariaLabelCloseEs : ariaLabelCloseEn);

                if(mainSiteHeader) mainSiteHeader.style.zIndex = '9999'; // Ensure header is below open menu overlay (overlay is 10000)
            } else {
                mobileMenuToggle.innerHTML = '☰'; // Hamburger icon
                // Revert to original aria-label (which should be handled by language switcher via data-aria-label-translate-key)
                const originalAriaLabelEn = mobileMenuToggle.getAttribute('data-aria-label-en') || 'Open menu';
                const originalAriaLabelEs = mobileMenuToggle.getAttribute('data-aria-label-es') || 'Abrir menú';
                mobileMenuToggle.setAttribute('aria-label', currentGlobalLang === 'es' ? originalAriaLabelEs : originalAriaLabelEn);

                if(mainSiteHeader) mainSiteHeader.style.zIndex = ''; // Reset header z-index
            }
        });

        // Close mobile menu if a link inside it is clicked (example for future use)
        mobileServicesMenu.addEventListener('click', (event) => {
            if (event.target.tagName === 'A' || event.target.closest('A')) {
                mobileServicesMenu.classList.remove('open');
                mobileMenuToggle.setAttribute('aria-expanded', 'false');
                mobileMenuToggle.innerHTML = '☰';
                const currentGlobalLang = window.getCurrentLanguage ? window.getCurrentLanguage() : 'en';
                const originalAriaLabelEn = mobileMenuToggle.getAttribute('data-aria-label-en') || 'Open menu';
                const originalAriaLabelEs = mobileMenuToggle.getAttribute('data-aria-label-es') || 'Abrir menú';
                mobileMenuToggle.setAttribute('aria-label', currentGlobalLang === 'es' ? originalAriaLabelEs : originalAriaLabelEn);
                if(mainSiteHeader) mainSiteHeader.style.zIndex = '';
            }
        });
    }

    // Function to update aria-labels on language change if menu is open and using alt labels
    function updateMobileMenuAriaLabelOnLangChange() {
        if (mobileMenuToggle && mobileServicesMenu && mobileServicesMenu.classList.contains('open')) {
            const currentGlobalLang = window.getCurrentLanguage ? window.getCurrentLanguage() : 'en';
            const ariaLabelCloseEn = mobileMenuToggle.getAttribute('data-aria-label-en-alt') || 'Close menu';
            const ariaLabelCloseEs = mobileMenuToggle.getAttribute('data-aria-label-es-alt') || 'Cerrar menú';
            mobileMenuToggle.setAttribute('aria-label', currentGlobalLang === 'es' ? ariaLabelCloseEs : ariaLabelCloseEn);
        } else if (mobileMenuToggle) {
            // If menu is closed, the main aria-label is handled by the global language switcher via data-aria-label-translate-key
            // However, we might need to trigger its update if it was missed.
            // For now, assume global switcher handles the default state.
            // To be safe, explicitly set it if languageSwitcher's loadTranslations doesn't re-evaluate aria-labels post-hoc
            const globalLangBtn = document.getElementById('language-toggle-button'); // to check if lang switcher is active
            if (globalLangBtn && window.loadTranslations) { // Check if global language switcher is likely active
                 // If window.loadTranslations is available, trigger it for the specific element
                 // or rely on the global call. For simplicity, the global call handles it.
                 // A more targeted update would be:
                 // if (window.updateElementTranslations) window.updateElementTranslations(mobileMenuToggle);
            }
        }
    }

    document.addEventListener('languageChanged', updateMobileMenuAriaLabelOnLangChange);
});
