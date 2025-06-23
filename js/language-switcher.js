// js/language-switcher.js
document.addEventListener('DOMContentLoaded', () => {
    const desktopLangToggle = document.getElementById('language-toggle-button');
    const mobileLangToggle = document.getElementById('mobile-language-toggle');

    let currentLanguage = localStorage.getItem('language') || 'en';

    // Refactored translation function for robustness
    function applyTranslations(language) {
        document.querySelectorAll('[data-en], [data-es]').forEach(el => {
            const textKey = `data-${language}`;
            const placeholderKey = `data-placeholder-${language}`;
            const ariaLabelKey = `data-aria-label-${language}`;

            let newText = el.getAttribute(textKey);

            // Ensure newText is not null before proceeding
            if (newText === null) {
                // If primary language key is missing, skip this element for this language
                // console.warn(`Element ${el.id || el.className} missing ${textKey}`);
                return;
            }

            // 1. Handle Placeholders
            if (el.hasAttribute(placeholderKey)) {
                const placeholderText = el.getAttribute(placeholderKey);
                if (placeholderText !== null) {
                    el.placeholder = placeholderText;
                }
            // 2. Handle ARIA labels
            } else if (el.hasAttribute(ariaLabelKey)) {
                const ariaLabelText = el.getAttribute(ariaLabelKey);
                if (ariaLabelText !== null) {
                    el.setAttribute('aria-label', ariaLabelText);
                }
                 // If the element also has direct text (e.g. a button with aria-label and text)
                // let it fall through to the general text setting logic,
                // but only if `newText` from `data-${language}` is explicitly set for its content.
                // If `data-${language}` is not set, but `data-aria-label-${language}` is,
                // we shouldn't try to set textContent from a potentially missing `data-${language}`.
                if (el.getAttribute(textKey) === null) return; // Stop if no direct text to set
            }

            // 3. Handle specific element types or structures
            // Buttons or submit inputs (value attribute for submit, textContent for button)
            if (el.tagName === 'BUTTON' || (el.tagName === 'INPUT' && el.type === 'submit')) {
                // For buttons that might contain icons + text in a span (e.g., FABs, mobile nav)
                const textSpan = el.querySelector('span:not(.sr-only):not([class*="icon"])'); // More specific selector for text span
                if (textSpan && !el.classList.contains('header-toggle-btn')) { // header-toggle-btn text is set separately
                    textSpan.textContent = newText;
                } else if (!el.children.length || el.classList.contains('header-toggle-btn')) {
                    // If no children (simple button) or it's a header toggle, set textContent directly
                    el.textContent = newText;
                }
                // If it's a submit input, its text is usually in 'value'
                if (el.tagName === 'INPUT' && el.type === 'submit') {
                    el.value = newText;
                }
            // Option elements in select
            } else if (el.tagName === 'OPTION') {
                el.textContent = newText;
            // General case: Prefer textContent, use innerHTML only for specific known cases (e.g. footer copyright)
            } else {
                // Example: if you know a specific element needs HTML (like footer for &copy;)
                if (el.closest('footer') && el.innerHTML.includes('&copy;')) {
                    el.innerHTML = newText; // Allow HTML for specific cases like copyright
                } else {
                    // Default to textContent for safety
                    // If element has children, try to find a text node to update,
                    // or a specific span meant for text.
                    let updated = false;
                    // Prioritize updating a specific text span if one exists and is clearly for text
                    const directTextSpan = el.querySelector('span.translatable-text'); // Hypothetical class for explicit text part
                    if (directTextSpan) {
                        directTextSpan.textContent = newText;
                        updated = true;
                    } else if (el.children.length > 0) {
                        // Attempt to update only the primary text node of an element with children
                        // This is heuristic, better to wrap text in spans.
                        for (let i = 0; i < el.childNodes.length; i++) {
                            const childNode = el.childNodes[i];
                            if (childNode.nodeType === Node.TEXT_NODE && childNode.textContent.trim().length > 0) {
                                childNode.textContent = newText;
                                updated = true;
                                break; // Update only the first significant text node
                            }
                        }
                    }

                    if (!updated) {
                        // Fallback for elements with no children or if text node update wasn't suitable
                        el.textContent = newText;
                    }
                }
            }
        });

      // Update toggle button texts (specific handling as they don't use data-en/es for their own text)
        const desktopLangToggleText = language === 'en' ? 'EN' : 'ES'; // Corrected text for desktop
        const mobileLangToggleText = language === 'en' ? 'EN' : 'ES';

        if (desktopLangToggle) desktopLangToggle.textContent = desktopLangToggleText;
        if (mobileLangToggle) { // Mobile toggle might be just icon or icon + text
            const mobileToggleSpan = mobileLangToggle.querySelector('span');
            if (mobileToggleSpan) { // If it has a span for text (like Home, Services)
                 // This is not for the language text itself but for items that might be language buttons
            } else { // If it's the EN/ES button itself
                mobileLangToggle.textContent = mobileLangToggleText;
            }
        }

        // Special handling for Join Us modal input placeholders (dynamic inputs)
        // This part seems specific and might be better handled by the component itself if possible
        // For now, keep it but ensure it's robust.
        const joinUsModal = document.getElementById('join-us-modal');
        if (joinUsModal) {
            joinUsModal.querySelectorAll('.form-section').forEach(section => {
                // Ensure section is a valid element before proceeding
                if (!section || typeof section.querySelector !== 'function' || typeof section.querySelectorAll !== 'function' || !section.dataset) {
                    console.warn('[language-switcher] Invalid section element encountered in join-us-modal processing:', section);
                    return; // Skip this iteration
                }

                const sectionTitleElement = section.querySelector('h2');
                let sectionNameForPlaceholder = section.dataset.section; // Default to data-section value

                // Try to get translated section name for placeholder from h2 if available
                if (sectionTitleElement) {
                    const translatedTitle = sectionTitleElement.getAttribute(`data-${language}`) || sectionTitleElement.textContent;
                    if (translatedTitle) sectionNameForPlaceholder = translatedTitle;
                }

                section.querySelectorAll('.inputs input[type="text"]').forEach(input => {
                    // Generic placeholders, consider using data-attributes on these inputs too if complex
                    const placeholderText = language === 'es'
                        ? `Ingresa ${sectionNameForPlaceholder}`
                        : `Enter ${sectionNameForPlaceholder}`;
                    input.placeholder = placeholderText;
                });
            });
        }

        localStorage.setItem('language', language);
        document.documentElement.lang = language;
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
