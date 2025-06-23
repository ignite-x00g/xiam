// js/script.js
// This script will now primarily handle the Join Us modal logic,
// as other functionalities are delegated to more specific scripts.

document.addEventListener('DOMContentLoaded', () => {
    const joinUsModal = document.getElementById('join-us-modal');
    const fabJoin = document.getElementById('fab-join'); // Trigger for Join Us modal

    if (!joinUsModal) {
        console.warn("Join Us modal structure not found in HTML.");
        return;
    }

    // --- Join Us Modal Specific Logic (adapted from provided example) ---
    const joinForm = document.getElementById('join-form');
    const joinUsLangToggleBtn = document.getElementById('join-us-lang-toggle'); // Specific to Join Us modal

    // Language toggle within Join Us modal (if window.toggleLanguage is available from language-switcher.js)
    if (joinUsLangToggleBtn && window.toggleLanguage) { // window.toggleLanguage is not standard, assuming it's from language-switcher
        joinUsLangToggleBtn.addEventListener('click', () => {
            if(window.applyTranslations && window.getCurrentLanguage) { // Check if global functions exist
                let currentLang = window.getCurrentLanguage();
                currentLang = currentLang === 'en' ? 'es' : 'en';
                window.applyTranslations(currentLang); // This will update the lang toggle text too
            } else {
                console.warn("Global language functions (applyTranslations, getCurrentLanguage) not found.");
            }
        });
    }


    joinUsModal.querySelectorAll('.form-section').forEach(section => {
        const addBtn = section.querySelector('.add');
        const removeBtn = section.querySelector('.remove');
        const acceptBtn = section.querySelector('.accept-btn');
        const editBtn = section.querySelector('.edit-btn');
        const inputsContainer = section.querySelector('.inputs');
        const sectionName = section.dataset.section; // "Skills", "Education", etc.

        if (addBtn) {
            addBtn.addEventListener('click', () => {
                const input = document.createElement('input');
                input.type = 'text';
                const currentLang = (window.getCurrentLanguage && window.getCurrentLanguage()) || 'en';
                // Placeholder translation logic will be handled by language-switcher.js
                // We just need to ensure data-placeholder-en and data-placeholder-es are on the input if needed,
                // or rely on the generic placeholder set here.
                input.placeholder = currentLang === 'es'
                    ? `Ingresa ${sectionName}` // This needs proper translation keys if complex
                    : `Enter ${sectionName} info`;
                inputsContainer.appendChild(input);
                if(window.applyTranslations) window.applyTranslations(currentLang); // Re-apply for new elements if needed
            });
        }

        if (removeBtn) {
            removeBtn.addEventListener('click', () => {
                const inputs = inputsContainer.querySelectorAll('input');
                if (inputs.length > 0) {
                    inputsContainer.removeChild(inputs[inputs.length - 1]);
                }
            });
        }

        if (acceptBtn) {
            acceptBtn.addEventListener('click', () => {
                const inputs = inputsContainer.querySelectorAll('input');
                if (inputs.length === 0) {
                    const currentLang = (window.getCurrentLanguage && window.getCurrentLanguage()) || 'en';
                    alert(currentLang === 'es'
                        ? `Agrega al menos una entrada en ${section.querySelector('h2').textContent}.` // Use translated section title
                        : `Please add at least one ${section.querySelector('h2').textContent} entry.`);
                    return;
                }

                inputs.forEach(input => input.disabled = true);
                section.classList.add('completed');
                acceptBtn.style.display = 'none';
                if(editBtn) editBtn.style.display = 'inline-block';
            });
        }

        if (editBtn) {
            editBtn.addEventListener('click', () => {
                const inputs = inputsContainer.querySelectorAll('input');
                inputs.forEach(input => input.disabled = false);
                section.classList.remove('completed');
                if(acceptBtn) acceptBtn.style.display = 'inline-block';
                editBtn.style.display = 'none';
                if (inputs.length > 0) inputs[0].focus();
            });
        }
    });

    if (joinForm) {
        joinForm.addEventListener('submit', (event) => {
            event.preventDefault();
            // Handle form submission logic here (e.g., validation, AJAX request)
            const currentLang = (window.getCurrentLanguage && window.getCurrentLanguage()) || 'en';
            alert(currentLang === 'es' ? 'Formulario enviado (simulado).' : 'Form submitted (simulated).');
            if (window.closeModal) window.closeModal(joinUsModal); // Close using global modal closer
        });
    }

    // The opening of Join Us modal is handled by dynamic-modal-manager.js
    // via the data-modal-target="join-us-modal" attribute on the FAB.
    // Closing (X button, ESC, backdrop click) is also handled by dynamic-modal-manager.js.

    // Ensure translations are applied when the modal becomes visible,
    // as it's initially display:none
    if (fabJoin) {
        fabJoin.addEventListener('click', () => {
            // dynamic-modal-manager will handle opening.
            // We just ensure translations are fresh if language changed while modal was hidden.
            if (window.applyTranslations && window.getCurrentLanguage) {
                setTimeout(() => { // Ensure modal is visible before applying
                    window.applyTranslations(window.getCurrentLanguage());
                }, 0);
            }
        });
    }
});
