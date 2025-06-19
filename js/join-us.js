// js/join-us.js
const sections = ['section1', 'section2', 'section3'];
let currentSection = 0;

// Removed local translations object and currentLang variable.
// These are now managed by js/language-switcher.js

/**
 * Updates dynamic content within the Join Us modal that cannot be handled
 * by data-translate-key attributes. For example, dynamically added form fields' placeholders.
 * Currently, all content in this modal is static in index.html and handled by language-switcher.js
 * or data-attributes. This function is a placeholder for future dynamic content.
 */
function updateJoinUsModalLanguage() {
    const currentGlobalLang = window.getCurrentLanguage ? window.getCurrentLanguage() : 'en';
    // console.log(`Join Us Modal: Language changed to ${currentGlobalLang}`);

    // Example for dynamic content (if any):
    // document.querySelectorAll('.dynamic-field').forEach(field => {
    //     const placeholderEn = field.getAttribute('data-placeholder-en');
    //     const placeholderEs = field.getAttribute('data-placeholder-es');
    //     if (currentGlobalLang === 'es' && placeholderEs) {
    //         field.setAttribute('placeholder', placeholderEs);
    //     } else if (placeholderEn) {
    //         field.setAttribute('placeholder', placeholderEn);
    //     }
    // });

    // Static elements are now handled by language-switcher.js using data-translate-key
    // and data-placeholder-translate-key. So, the old updateLang logic is removed.
}

document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('join-modal');
    const fabJoinBtn = document.getElementById('fab-join');
    const closeButton = document.querySelector('#join-modal .close-btn'); // Corrected variable name from span to closeButton

    // Functions for multi-step form navigation
    function showSection(sectionId) {
        sections.forEach(id => {
            const sectionElement = document.getElementById(id);
            if (sectionElement) {
                sectionElement.style.display = (id === sectionId) ? 'block' : 'none';
            }
        });
    }

    function nextJoinSection() {
        currentSection++;
        if (currentSection >= sections.length) {
            currentSection = sections.length - 1; // Stay on the last section if trying to go beyond
        }
        showSection(sections[currentSection]);
    }

    function prevJoinSection() {
        currentSection--;
        if (currentSection < 0) {
            currentSection = 0; // Stay on the first section if trying to go before
        }
        showSection(sections[currentSection]);
    }

    if (modal) {
        updateJoinUsModalLanguage();
        document.addEventListener('languageChanged', updateJoinUsModalLanguage);

        if (fabJoinBtn) {
            fabJoinBtn.onclick = function() {
                modal.style.display = 'block';
                currentSection = 0; // Reset to the first section when opening
                showSection(sections[currentSection]);
            };
        }

        if (closeButton) {
            closeButton.onclick = function() {
                modal.style.display = 'none';
            };
        }

        window.onclick = function(event) {
            if (event.target == modal) {
                modal.style.display = 'none';
            }
        };

        // Attach event listeners to next/prev buttons
        const nextButtons = modal.querySelectorAll('.join-form-next-btn');
        nextButtons.forEach(button => {
            button.addEventListener('click', nextJoinSection);
        });

        const prevButtons = modal.querySelectorAll('.join-form-prev-btn');
        prevButtons.forEach(button => {
            button.addEventListener('click', prevJoinSection);
        });

        showSection(sections[currentSection]); // Initialize the first section
    } else {
        // console.error("Modal with ID 'join-modal' not found in join-us.js.");
    }

    const multiStepForm = document.getElementById('multiStepForm');
    if (multiStepForm) {
        multiStepForm.addEventListener('submit', function(event) {
            event.preventDefault();
            const successMessage = window.getTranslatedText ? window.getTranslatedText('joinModal.alert.formSubmittedSuccess') : 'Form submitted successfully!';
            alert(successMessage);
            if (modal) { // Ensure modal is defined before trying to hide it
                modal.style.display = 'none';
            }
        });
    }
});
