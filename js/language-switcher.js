// js/language-switcher.js
document.addEventListener('DOMContentLoaded', () => {
    const desktopLangToggle = document.getElementById('language-toggle-button');
    const mobileLangToggle = document.getElementById('mobile-language-toggle');

    let currentLanguage = localStorage.getItem('language') || 'en';

    // Simplified translation function using data attributes
    function applyTranslations(language) {
        document.querySelectorAll('[data-en], [data-es]').forEach(el => {
            const text = el.getAttribute(`data-${language}`);
            if (text) {
                // Handle specific elements like inputs or textareas for placeholder
                if (el.hasAttribute(`data-placeholder-${language}`)) {
                    el.placeholder = el.getAttribute(`data-placeholder-${language}`);
                } else if (el.tagName === 'INPUT' && el.type === 'submit' || el.tagName === 'BUTTON') {
                     // For buttons or submit inputs, set textContent if it's not an icon container
                    if (!el.querySelector('i')) { // Avoid overwriting icons
                        el.textContent = text;
                    } else { // For buttons with icons and text (like mobile nav)
                        const textSpan = el.querySelector('span');
                        if (textSpan) textSpan.textContent = text;
                    }
                } else if (el.hasAttribute('aria-label') && el.hasAttribute(`data-aria-label-${language}`)) {
                    el.setAttribute('aria-label', el.getAttribute(`data-aria-label-${language}`));
                }
                else {
                    // For general elements, prefer textContent but use innerHTML if an icon is present
                    // This is a heuristic; more robust would be to wrap text in spans
                    let hasIcon = false;
                    el.childNodes.forEach(node => {
                        if (node.nodeName === "I") hasIcon = true;
                    });

                    if(hasIcon && el.querySelector('span')) { // target span within elements that have icons e.g. FABs
                        el.querySelector('span').innerHTML = text;
                    } else if (el.children.length > 0 && !el.classList.contains('fab-content-wrapper') && !el.classList.contains('mobile-nav-item')) {
                        // If element has children but is not a known container type,
                        // assume text is mixed and try to set only the first text node or a specific span
                        let foundTextNode = false;
                        el.childNodes.forEach(child => {
                            if (child.nodeType === Node.TEXT_NODE && child.textContent.trim() !== '') {
                                child.textContent = text;
                                foundTextNode = true;
                            }
                        });
                        if (!foundTextNode && el.querySelector('span')) { // Fallback to a span if direct text node not found
                           el.querySelector('span').innerHTML = text;
                        } else if (!foundTextNode) {
                            el.innerHTML = text; // Fallback if no specific text node/span found
                        }
                    }
                    else {
                         el.innerHTML = text; // Use innerHTML to handle potential HTML entities like &copy;
                    }
                }
            }
        });

        // Update toggle button texts
        // const langToggleText = language === 'en' ? 'EN/ES' : 'ES/EN'; // No longer needed for desktop
        const mobileLangToggleText = language === 'en' ? 'EN' : 'ES'; // Mobile shows current lang

        // Desktop toggle will now use its data attributes like other elements
        // if (desktopLangToggle) desktopLangToggle.textContent = langToggleText; //This line is handled by the generic translation logic now
        if (mobileLangToggle) mobileLangToggle.textContent = mobileLangToggleText;


        // Special handling for Join Us modal input placeholders (dynamic)
        document.querySelectorAll('#join-us-modal .form-section').forEach(section => {
            const sectionNameKey = section.dataset.section.toLowerCase().replace(/\s+/g, '');
            section.querySelectorAll('.inputs input[type="text"]').forEach(input => {
                const placeholderEn = `Enter ${section.dataset.section} info`;
                const placeholderEs = `Ingresa información de ${section.dataset.section}`; // Simple translation
                input.placeholder = language === 'es' ? placeholderEs : placeholderEn;
            });
        });


        localStorage.setItem('language', language);
        document.documentElement.lang = language; // Set lang attribute on HTML element
        document.dispatchEvent(new CustomEvent('languageChanged', { detail: { language: language } }));
    }

    function toggleLanguage() {
        currentLanguage = currentLanguage === 'en' ? 'es' : 'en';
        applyTranslations(currentLanguage);
    }

    // Initial translation
    applyTranslations(currentLanguage);

    // Event Listeners
    if (desktopLangToggle) {
        desktopLangToggle.addEventListener('click', toggleLanguage);
    }
    if (mobileLangToggle) {
        mobileLangToggle.addEventListener('click', toggleLanguage);
    }

    // Expose for other scripts if needed (e.g., dynamic content)
    window.applyTranslations = applyTranslations;
    window.getCurrentLanguage = () => currentLanguage;
});
