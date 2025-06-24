document.addEventListener('DOMContentLoaded', () => {
    const contactModal = document.getElementById('contact-modal');
    const openModalButton = document.getElementById('openContactModal');
    const closeModalButton = contactModal.querySelector('.close-modal');
    const contactForm = document.getElementById('contact-form');

    // Function to open the modal
    function openModal() {
        contactModal.classList.add('active');
    }

    // Function to close the modal
    function closeModal() {
        contactModal.classList.remove('active');
    }

    // Event listener for opening the modal
    if (openModalButton) {
        openModalButton.addEventListener('click', openModal);
    }

    // Event listener for closing the modal
    if (closeModalButton) {
        closeModalButton.addEventListener('click', closeModal);
    }

    // Event listener for clicking outside the modal content to close
    if (contactModal) {
        contactModal.addEventListener('click', (event) => {
            if (event.target === contactModal) { // Check if the click is on the overlay itself
                closeModal();
            }
        });
    }

    // Event listener for form submission
    if (contactForm) {
        contactForm.addEventListener('submit', (event) => {
            event.preventDefault(); // Prevent default form submission

            // Basic form validation (check for empty required fields)
            let isValid = true;
            const requiredFields = contactForm.querySelectorAll('[required]');
            requiredFields.forEach(field => {
                if (!field.value.trim()) {
                    isValid = false;
                    // Optionally, add some visual feedback for invalid fields
                    field.style.borderColor = 'red';
                } else {
                    field.style.borderColor = '#ccc'; // Reset border color
                }
            });

            if (!isValid) {
                alert('Please fill in all required fields.');
                return;
            }

            // Collect form data
            const formData = {
                name: document.getElementById('contact-name').value.trim(),
                email: document.getElementById('contact-email').value.trim(),
                contactNumber: document.getElementById('contact-number').value.trim(),
                preferredDate: document.getElementById('contact-date').value,
                preferredTime: document.getElementById('contact-time').value,
                interest: document.getElementById('contact-interest').value,
                comments: document.getElementById('contact-comments').value.trim()
            };

            // Log captured data to the console
            console.log('Form Data Captured:', formData);

            // Placeholder for actual data submission (e.g., using fetch to send to a server)
            // alert('Form submitted successfully! (Data logged to console)');

            // Optionally, clear the form and close the modal
            contactForm.reset(); // Clear form fields
            closeModal(); // Close the modal

            // You might want to show a success message to the user here
        });
    }

    // Optional: Language switcher logic (basic example)
    const langToggleButtons = document.querySelectorAll('[data-lang-toggle]'); // Example button: <button data-lang-toggle="es">Español</button>
    const translatableElements = document.querySelectorAll('[data-en], [data-es]');

    function switchLanguage(lang) {
        translatableElements.forEach(el => {
            if (el.dataset[lang]) {
                if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                    if (el.placeholder) el.placeholder = el.dataset[lang];
                } else if (el.tagName === 'OPTION' && el.value === "") {
                    // Skip placeholder option if needed or handle differently
                } else {
                     el.textContent = el.dataset[lang];
                }
            }
        });
        // Update button states or main lang attribute if necessary
        document.documentElement.lang = lang;
    }

    langToggleButtons.forEach(button => {
        button.addEventListener('click', () => {
            const lang = button.dataset.langToggle;
            switchLanguage(lang);
        });
    });

    // Set initial language based on browser or default
    // const userLang = navigator.language.split('-')[0]; // "en" or "es"
    // if (userLang === "es") {
    //     switchLanguage("es");
    // } else {
    //     switchLanguage("en"); // Default to English
    // }
    // For now, let's default to English as per the initial HTML text
    switchLanguage("en");
});
