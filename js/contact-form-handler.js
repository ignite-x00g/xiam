// js/contact-form-handler.js

const CFORM_STRINGS = {
    errRequiredFields: {
        en: 'Please fill in all required fields.',
        es: 'Por favor, complete todos los campos requeridos.'
    },
    successMessage: {
        en: 'Thank you for contacting us. Your message has been sent (simulated).',
        es: 'Gracias por contactarnos. Su mensaje ha sido enviado (simulado).'
    }
};

/**
 * Gets a localized string.
 * @param {string} key - The key of the string to retrieve.
 * @param {string} lang - The current language ('en' or 'es').
 * @returns {string} - The localized string.
 */
function getLocalizedString(key, lang) {
    const stringsForKey = CFORM_STRINGS[key];
    if (stringsForKey) {
        return stringsForKey[lang] || stringsForKey['en']; // Fallback to English if lang not found
    }
    console.warn(`[Contact Form] Localization key not found: ${key}`);
    return `[${key}]`; // Return key as a fallback
}

/**
 * Closes the provided modal element.
 * It first tries to use a global `closeModal` function if available.
 * Otherwise, it falls back to manually hiding the modal and a potential backdrop.
 * @param {HTMLElement} modalElement - The modal element to close.
 */
function closeContactModal(modalElement) {
    if (window.closeModal && typeof window.closeModal === 'function') {
        window.closeModal(modalElement);
    } else {
        // Fallback if global closeModal is not found or not a function
        modalElement.style.display = 'none';

        // Attempt to find and hide a backdrop
        // First, look for a backdrop specifically linked by ID if the modal has one (e.g. data-backdrop-id)
        // For now, we'll stick to the existing 'modal-backdrop' ID as a common case
        const backdrop = document.getElementById('modal-backdrop');
        if (backdrop) {
            backdrop.style.display = 'none';
        }

        document.body.classList.remove('modal-open'); // Ensure body class is removed
        console.warn('[Contact Form] window.closeModal function not found or not a function. Used fallback to hide modal.');
    }
}

/**
 * Validates the contact form and displays/clears error messages.
 * @param {HTMLFormElement} form - The form element to validate.
 * @param {string} lang - The current language ('en' or 'es').
 * @returns {boolean} - True if the form is valid, false otherwise.
 */
function validateForm(form, lang) {
    let isValid = true;
    const errorMessageElement = form.querySelector('#contact-form-error-message'); // Assumes this element exists

    const requiredFields = form.querySelectorAll('[required]');
    requiredFields.forEach(field => {
        if (!field.value.trim()) {
            isValid = false;
            field.style.borderColor = 'red';
        } else {
            field.style.borderColor = ''; // Reset border color if valid
        }
    });

    if (errorMessageElement) {
        if (!isValid) {
            errorMessageElement.textContent = getLocalizedString('errRequiredFields', lang);
        } else {
            errorMessageElement.textContent = ''; // Clear error message if form is valid
        }
    } else if (!isValid) {
        // Fallback to alert if error message element is not found
        console.warn('[Contact Form] Error message element (#contact-form-error-message) not found in the form. Using alert as fallback.');
        alert(getLocalizedString('errRequiredFields', lang));
    }
    return isValid;
}

/**
 * Initializes the contact form handler after the DOM is fully loaded.
 * Sets up event listeners for form submission and input field changes.
 */
document.addEventListener('DOMContentLoaded', () => {
    const contactForm = document.getElementById('contact-form');
    const contactModal = document.getElementById('contact-us-modal');
    const errorMessageContainer = document.getElementById('contact-form-error-message');

    if (contactForm && contactModal && errorMessageContainer) {
        contactForm.addEventListener('submit', (event) => {
            event.preventDefault(); // Prevent default form submission
            const currentLang = (window.getCurrentLanguage && window.getCurrentLanguage()) || 'en';
            // Clear previous error messages
            errorMessageContainer.textContent = '';
            errorMessageContainer.classList.remove('visible');

            // Basic validation: Check if all required fields are filled
            let isValid = true;
            let firstInvalidField = null;
            const requiredFields = contactForm.querySelectorAll('[required]');

            requiredFields.forEach(field => {
                if (!field.value.trim()) {
                    isValid = false;
                    field.classList.add('form-field-invalid');
                    field.setAttribute('aria-invalid', 'true');
                    if (!firstInvalidField) {
                        firstInvalidField = field;
                    }
                } else {
                    field.classList.remove('form-field-invalid');
                    field.removeAttribute('aria-invalid');
                }
            });

            if (!isValid) {
                const currentLang = (window.getCurrentLanguage && window.getCurrentLanguage()) || 'en';
                errorMessageContainer.textContent = currentLang === 'es' ? 'Por favor, complete todos los campos requeridos.' : 'Please fill in all required fields.';
                errorMessageContainer.classList.add('visible');
                if (firstInvalidField) {
                    firstInvalidField.focus();
                }
                return;
            }

            // Simulate form submission
            // const currentLang = (window.getCurrentLanguage && window.getCurrentLanguage()) || 'en'; // No longer needed for alert
            // alert(currentLang === 'es' ? 'Gracias por contactarnos. Su mensaje ha sido enviado (simulado).' : 'Thank you for contacting us. Your message has been sent (simulated).'); // Removed success alert

            // Reset form fields
            contactForm.reset();
            requiredFields.forEach(field => {
                field.classList.remove('form-field-invalid');
                field.removeAttribute('aria-invalid');
            });

            // Close the modal
            closeContactModal(contactModal);
        });
       // Optional: Reset border colors and aria-invalid when user starts typing in a field
        contactForm.querySelectorAll('[required]').forEach(field => {
            field.addEventListener('input', () => {
                // If field has content, remove invalid class and aria-attribute
                if (field.value.trim()) {
                    field.classList.remove('form-field-invalid');
                    field.removeAttribute('aria-invalid');
                }
                // No need for an 'else' here, as the submit validation will catch empty/invalid fields.
                // This listener primarily serves to remove the error state as the user types.
            });
        });
    } else {
        if (!contactForm) console.warn('Contact form (#contact-form) not found.');
        if (!contactModal) console.warn('Contact modal (#contact-us-modal) not found.');
        if (!errorMessageContainer) console.warn('Error message container (#contact-form-error-message) not found.');
    }
});
