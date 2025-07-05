// components/contact-us/contact-us.js

window.initializeContactForm = function() {
    const contactUsModal = document.getElementById('contact-us-modal');
    if (!contactUsModal) return;

    const contactForm = contactUsModal.querySelector('#contact-form'); // Ensure we select the form within this modal
    const errorMessageDiv = contactUsModal.querySelector('#contact-form-error-message'); // Error message div within this modal

    if (contactForm && !contactForm.dataset.handlerInitialized) { // Check if already initialized
        // console.log("Contact form found, attaching event listeners.");
        contactForm.addEventListener('submit', function(event) {
            event.preventDefault();
            let isValid = true;
            const requiredFields = contactForm.querySelectorAll('[required]');

            requiredFields.forEach(field => {
                if (!field.value.trim()) {
                    isValid = false;
                    field.classList.add('form-field-invalid');
                } else {
                    field.classList.remove('form-field-invalid');
                }
            });

            const emailField = contactForm.querySelector('#contact-email'); // Ensure this ID is unique if form is loaded multiple times or use name attribute
            if (emailField && emailField.value.trim() && !isValidEmail(emailField.value.trim())) {
                isValid = false;
                emailField.classList.add('form-field-invalid');
            }

            if (!isValid) {
                if(errorMessageDiv) {
                    const lang = window.getCurrentLanguage ? window.getCurrentLanguage() : 'en';
                    errorMessageDiv.textContent = lang === 'es' ? 'Por favor, corrija los errores en el formulario.' : 'Please correct the errors in the form.';
                    errorMessageDiv.style.display = 'block';
                    errorMessageDiv.setAttribute('role', 'alert');
                }
                return;
            }

            if(errorMessageDiv) {
                errorMessageDiv.style.display = 'none';
            }

            // ***** CONCEPTUAL: Gather form data for API call *****
            // const formData = new FormData(contactForm);
            // const data = Object.fromEntries(formData.entries());
            // console.log("Contact Us Form Data for API:", data);
            // At this point, 'data' would be sent to a Cloudflare Worker.
            // e.g., fetch('/api/submit-contact', { method: 'POST', body: JSON.stringify(data) });
            // For now, the existing alert, reset, and close actions will serve as placeholders.
            // *****************************************************

            const lang = window.getCurrentLanguage ? window.getCurrentLanguage() : 'en';
            alert(lang === 'es' ? 'Formulario de contacto enviado (simulado).' : 'Contact form submitted (simulated).');

            contactForm.reset();
            if (typeof window.closeModal === 'function') {
                window.closeModal(contactUsModal);
            }
        });
        contactForm.dataset.handlerInitialized = 'true'; // Mark as initialized
    }
};

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// The dynamic-modal-manager.js will call initializeContactForm()
// after loading the content for 'contact-us-modal'.
// If this script is loaded via its own <script> tag and the modal content is static,
// a DOMContentLoaded listener would be appropriate here. But for dynamic content,
// the explicit call from the loader is better.
// Example if static:
// document.addEventListener('DOMContentLoaded', () => {
//     if(document.getElementById('contact-us-modal')) { // Check if the modal exists statically
//          window.initializeContactForm();
//     }
// });
