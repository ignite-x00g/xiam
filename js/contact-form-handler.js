// js/contact-form-handler.js
document.addEventListener('DOMContentLoaded', () => {
    const contactForm = document.getElementById('contact-form');
    const contactModal = document.getElementById('contact-us-modal');

    if (contactForm && contactModal) {
        contactForm.addEventListener('submit', (event) => {
            event.preventDefault(); // Prevent default form submission

            // Basic validation: Check if all required fields are filled
            let isValid = true;
            const requiredFields = contactForm.querySelectorAll('[required]');
            requiredFields.forEach(field => {
                if (!field.value.trim()) {
                    isValid = false;
                    // Optionally, add some visual feedback for empty required fields
                    field.style.borderColor = 'red';
                } else {
                    field.style.borderColor = ''; // Reset border color
                }
            });

            if (!isValid) {
                const currentLang = (window.getCurrentLanguage && window.getCurrentLanguage()) || 'en';
                alert(currentLang === 'es' ? 'Por favor, complete todos los campos requeridos.' : 'Please fill in all required fields.');
                return;
            }

            // Simulate form submission
            const currentLang = (window.getCurrentLanguage && window.getCurrentLanguage()) || 'en';
            alert(currentLang === 'es' ? 'Gracias por contactarnos. Su mensaje ha sido enviado (simulado).' : 'Thank you for contacting us. Your message has been sent (simulated).');

            // Reset form fields
            contactForm.reset();
            requiredFields.forEach(field => field.style.borderColor = ''); // Reset borders

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

        // Optional: Reset border colors when user starts typing in a field
        contactForm.querySelectorAll('[required]').forEach(field => {
            field.addEventListener('input', () => {
                if (field.style.borderColor === 'red') {
                    field.style.borderColor = '';
                }
            });
        });
    } else {
        if (!contactForm) console.warn('Contact form (#contact-form) not found.');
        if (!contactModal) console.warn('Contact modal (#contact-us-modal) not found.');
    }
});
