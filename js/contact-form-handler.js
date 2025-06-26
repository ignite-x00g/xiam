// js/contact-form-handler.js
document.addEventListener('DOMContentLoaded', () => {
    const contactForm = document.getElementById('contact-form');
    const contactModal = document.getElementById('contact-us-modal');
    const errorMessageContainer = document.getElementById('contact-form-error-message');

    if (contactForm && contactModal && errorMessageContainer) {
        contactForm.addEventListener('submit', (event) => {
            event.preventDefault(); // Prevent default form submission

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
            // Assumes a global closeModal function is available (e.g., from dynamic-modal-manager.js)
            if (window.closeModal) {
                window.closeModal(contactModal);
            } else {
                // Fallback if global closeModal is not found
                contactModal.style.display = 'none';
                const backdrop = document.getElementById('modal-backdrop');
                if (backdrop) {
                    backdrop.style.display = 'none';
                }
                document.body.classList.remove('modal-open');
                console.warn('Global closeModal function not found. Used fallback to hide modal.');
            }
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
