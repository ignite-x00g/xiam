// js/contact-form-handler.js
// Placeholder for Contact Us form specific JavaScript (validation, submission)

document.addEventListener('DOMContentLoaded', () => {
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        // console.log("Contact form found, attaching event listeners.");
        contactForm.addEventListener('submit', function(event) {
            event.preventDefault();
            // Basic validation example (can be expanded)
            let isValid = true;
            const requiredFields = contactForm.querySelectorAll('[required]');
            requiredFields.forEach(field => {
                if (!field.value.trim()) {
                    isValid = false;
                    field.classList.add('form-field-invalid');
                    // console.error(`Field ${field.id || field.name} is required.`);
                } else {
                    field.classList.remove('form-field-invalid');
                }
            });

            const emailField = contactForm.querySelector('#contact-email');
            if (emailField && emailField.value.trim() && !isValidEmail(emailField.value.trim())) {
                isValid = false;
                emailField.classList.add('form-field-invalid');
                // console.error("Invalid email format.");
            }


            const errorMessageDiv = document.getElementById('contact-form-error-message');
            if (!isValid) {
                if(errorMessageDiv) {
                    const lang = window.getCurrentLanguage ? window.getCurrentLanguage() : 'en';
                    errorMessageDiv.textContent = lang === 'es' ? 'Por favor, corrija los errores en el formulario.' : 'Please correct the errors in the form.';
                    errorMessageDiv.style.display = 'block';
                     errorMessageDiv.setAttribute('role', 'alert');
                }
                // console.log("Contact form validation failed.");
                return;
            }

            if(errorMessageDiv) errorMessageDiv.style.display = 'none';

            // If valid, proceed with submission (e.g., AJAX)
            // console.log("Contact form submitted (simulated).");
            const lang = window.getCurrentLanguage ? window.getCurrentLanguage() : 'en';
            alert(lang === 'es' ? 'Formulario de contacto enviado (simulado).' : 'Contact form submitted (simulated).');

            contactForm.reset(); // Reset form fields
            if (typeof window.closeModal === 'function') {
                window.closeModal('contact-us-modal'); // Close the modal
            }
        });
    }
});

function isValidEmail(email) {
    // Basic email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}
