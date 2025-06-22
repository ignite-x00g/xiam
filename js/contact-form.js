// js/contact-form.js

// List of common free email domains for validation
const freeEmailDomains = [
    'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'aol.com',
    'icloud.com', 'mail.com', 'zoho.com', 'yandex.com', 'protonmail.com'
    // Add more as needed
];

// Main initialization function to be called when the contact form is added to the DOM
window.initContactForm = function(formElement) {
    if (!formElement) return;

    // Get form fields
    const nameField = formElement.querySelector('#contact-name');
    const emailField = formElement.querySelector('#contact-email');
    const timeField = formElement.querySelector('#contact-best-time');
    const dateField = formElement.querySelector('#contact-best-date');
    const countryCodeField = formElement.querySelector('#contact-country-code');
    const phoneField = formElement.querySelector('#contact-phone');
    const areaOfInterestField = formElement.querySelector('#contact-area-of-interest');
    const messageField = formElement.querySelector('#contact-message');
    const submitButton = formElement.querySelector('#contact-submit-button');
    const statusMessageElement = formElement.querySelector('#contact-submission-status');

    // --- 1. Populate "Area of Interest" Dropdown & Translate Placeholders ---
    function populateAreaOfInterest() {
        if (!areaOfInterestField) return;
        const areas = ['businessOps', 'contactCenter', 'itSupport', 'professionals'];
        const defaultOptionText = window.getTranslatedText ? window.getTranslatedText('form.contact.option.selectArea') : 'Select an area...';
        areaOfInterestField.innerHTML = `<option value="" disabled selected data-translate-key="form.contact.option.selectArea">${defaultOptionText}</option>`;
        areas.forEach(areaKey => {
            const optionText = window.getTranslatedText ? window.getTranslatedText(`nav.${areaKey}`) : areaKey;
            const option = document.createElement('option');
            option.value = areaKey;
            option.textContent = optionText;
            areaOfInterestField.appendChild(option);
        });
    }

    function translatePlaceholders() {
        formElement.querySelectorAll('[data-placeholder-translate-key]').forEach(el => {
            const key = el.getAttribute('data-placeholder-translate-key');
            if (window.getTranslatedText) {
                el.setAttribute('placeholder', window.getTranslatedText(key));
            }
        });
    }

    // Populate and translate initially
    populateAreaOfInterest();
    translatePlaceholders();

    // Listen for language changes
    document.addEventListener('languageChanged', () => {
        if (document.body.contains(formElement)) {
            populateAreaOfInterest();
            translatePlaceholders();
            // Translate labels and button text
            formElement.querySelectorAll('[data-translate-key]').forEach(el => {
                const key = el.getAttribute('data-translate-key');
                if (['BUTTON', 'LABEL'].includes(el.tagName) && window.getTranslatedText) {
                    el.textContent = window.getTranslatedText(key);
                }
            });
            clearAllValidationMessages();
        }
    });

    // --- 2. Validation Logic ---
    function displayValidationMessage(fieldId, messageKey) {
        const el = formElement.querySelector(`[data-validation-for="${fieldId}"]`);
        if (el) {
            el.textContent = window.getTranslatedText ? window.getTranslatedText(messageKey) : messageKey;
        }
    }
    function clearValidationMessage(fieldId) {
        const el = formElement.querySelector(`[data-validation-for="${fieldId}"]`);
        if (el) el.textContent = '';
    }
    function clearAllValidationMessages() {
        formElement.querySelectorAll('.validation-message').forEach(el => el.textContent = '');
        if (statusMessageElement) statusMessageElement.textContent = '';
    }
    function validateField(field, fieldId, requiredKey, validationFn, invalidKey) {
        if (!field.value.trim()) {
            displayValidationMessage(fieldId, requiredKey);
            return false;
        }
        if (validationFn && !validationFn(field.value)) {
            displayValidationMessage(fieldId, invalidKey);
            return false;
        }
        clearValidationMessage(fieldId);
        return true;
    }
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    function isBusinessEmail(email) {
        if (!isValidEmail(email)) return true; // Skip if format already invalid
        const domain = email.substring(email.lastIndexOf("@") + 1).toLowerCase();
        return !freeEmailDomains.includes(domain);
    }
    function isValidPhoneNumber(phone) {
        return /^[0-9\s+()-]+$/.test(phone) && phone.length > 5;
    }
    function isValidCountryCode(code) {
        return /^\+[0-9]{1,3}$/.test(code.trim()) || /^[0-9]{1,4}$/.test(code.trim());
    }

    // --- 3. Submit Handler ---
    if (submitButton) {
        submitButton.addEventListener('click', (event) => {
            event.preventDefault();
            clearAllValidationMessages();
            let isFormValid = true;

            // Name
            if (!validateField(nameField, 'contact-name', 'form.validation.required')) isFormValid = false;

            // Email
            if (!validateField(emailField, 'contact-email', 'form.validation.required', isValidEmail, 'form.validation.email.invalid')) {
                isFormValid = false;
            } else if (!isBusinessEmail(emailField.value)) {
                displayValidationMessage('contact-email', 'form.validation.email.noBusiness');
                isFormValid = false;
            } else {
                clearValidationMessage('contact-email');
            }

            // Country code (optional)
            if (countryCodeField.value.trim() && !isValidCountryCode(countryCodeField.value)) {
                displayValidationMessage('contact-country-code', 'form.validation.countryCode.invalid');
                isFormValid = false;
            } else {
                clearValidationMessage('contact-country-code');
            }

            // Phone (optional)
            if (phoneField.value.trim() && !isValidPhoneNumber(phoneField.value)) {
                displayValidationMessage('contact-phone', 'form.validation.phone.invalid');
                isFormValid = false;
            } else {
                clearValidationMessage('contact-phone');
            }

            // Area of Interest
            if (!validateField(areaOfInterestField, 'contact-area-of-interest', 'form.validation.required')) isFormValid = false;

            // Message
            if (!validateField(messageField, 'contact-message', 'form.validation.required')) isFormValid = false;

            // Best Time/Date are optional; no extra validation for now

            if (isFormValid) {
                const formData = {
                    name: nameField.value.trim(),
                    email: emailField.value.trim(),
                    bestTime: timeField.value,
                    bestDate: dateField.value,
                    countryCode: countryCodeField.value.trim(),
                    phone: phoneField.value.trim(),
                    areaOfInterest: areaOfInterestField.value,
                    message: messageField.value.trim()
                };
                console.log("Contact Form Data:", formData);
                if (statusMessageElement) statusMessageElement.textContent = window.getTranslatedText
                    ? window.getTranslatedText('form.contact.submissionSuccess')
                    : 'Data prepared.';
                // Optionally reset form: formElement.reset();
            } else {
                if (statusMessageElement) statusMessageElement.textContent = '';
            }
        });
    }
};
