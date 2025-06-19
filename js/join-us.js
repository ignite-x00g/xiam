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
    const span = document.querySelector('#join-modal .close-btn');

    if (modal) {
        // Initial language setup for any dynamic elements (if any)
        updateJoinUsModalLanguage();

        // Listen for language changes from the global switcher
        document.addEventListener('languageChanged', updateJoinUsModalLanguage);

        if (fabJoinBtn) {
            fabJoinBtn.onclick = function() {
                modal.style.display = 'block';
            }
        }

        if (span) {
            span.onclick = function() {
                modal.style.display = 'none';
            }
        }

        window.onclick = function(event) {
            if (event.target == modal) {
                modal.style.display = 'none';
            }
        }
        showSection(sections[currentSection]); // Initialize the first section if modal exists
    } else {
        // console.error("Modal with ID 'join-modal' not found in join-us.js.");
    }
});

function showSection(sectionId) {
    sections.forEach(id => {
        document.getElementById(id).style.display = (id === sectionId) ? 'block' : 'none';
    });
}

function nextSection(sectionId) {
    currentSection = sections.indexOf(sectionId);
    if (currentSection < sections.length) {
        showSection(sectionId);
    }
}

function prevSection(sectionId) {
    currentSection = sections.indexOf(sectionId);
    if (currentSection >= 0) {
        showSection(sectionId);
    }
}

document.getElementById('multiStepForm').addEventListener('submit', function(event) {
    event.preventDefault();
    // Form submission logic here
    const successMessage = window.getTranslatedText ? window.getTranslatedText('joinModal.alert.formSubmittedSuccess') : 'Form submitted successfully!';
    alert(successMessage);
    const modalToClose = document.getElementById('join-modal');
    if (modalToClose) {
        modalToClose.style.display = 'none';
    }
});
