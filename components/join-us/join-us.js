// components/join-us/join-us.js

/**
 * Initializes the interactive sections within the Join Us form.
 * This function should be called after the Join Us modal's HTML content,
 * including the form sections, has been loaded into the DOM.
 */
window.initializeJoinUsFormSections = function() {
    const joinUsModal = document.getElementById('join-us-modal');
    if (!joinUsModal) {
        // console.warn("Join Us modal not found when trying to initialize sections.");
        return;
    }

    // console.log("Initializing Join Us form sections' interactivity...");

    const formSections = joinUsModal.querySelectorAll('.form-section');
    if (formSections.length === 0) {
        // console.warn("No .form-section elements found within the Join Us modal.");
        // This might happen if the HTML isn't loaded yet, or if there are no such sections.
    }

    formSections.forEach(section => {
        const addBtn = section.querySelector('.add');
        const removeBtn = section.querySelector('.remove');
        const acceptBtn = section.querySelector('.accept-btn');
        const editBtn = section.querySelector('.edit-btn');
        const inputsContainer = section.querySelector('.inputs');
        const titleElement = section.querySelector('h2'); // Used for placeholder text generation

        if (!addBtn || !removeBtn || !acceptBtn || !editBtn || !inputsContainer || !titleElement) {
            // console.warn("A Join Us form section is missing one or more expected child elements (add, remove, accept, edit, inputs, h2):", section);
            return; // Skip this section if critical elements are missing
        }

        const sectionTitleEn = titleElement.getAttribute('data-en') || 'item';
        const sectionTitleEs = titleElement.getAttribute('data-es') || 'elemento';

        addBtn.addEventListener('click', () => {
            const input = document.createElement('input');
            input.type = 'text';
            input.className = 'form-control'; // Optional: for bootstrap or other global styling

            // Set data attributes for dynamic translation by global-toggles.js
            // These placeholders will be applied by applyTranslations
            input.setAttribute('data-placeholder-en', `Enter ${sectionTitleEn} details`);
            input.setAttribute('data-placeholder-es', `Ingresa detalles de ${sectionTitleEs}`);

            inputsContainer.appendChild(input);

            // Immediately apply translations to the newly added input
            if (window.applyTranslations && window.getCurrentLanguage) {
                window.applyTranslations(window.getCurrentLanguage());
            } else {
                // Fallback if global functions are not available (e.g., script load order issue)
                const lang = localStorage.getItem('ops_lang') || 'en';
                input.placeholder = lang === 'es' ?
                                    input.getAttribute('data-placeholder-es') :
                                    input.getAttribute('data-placeholder-en');
            }
            input.focus(); // Focus the new input
        });

        removeBtn.addEventListener('click', () => {
            const allInputs = inputsContainer.querySelectorAll('input');
            if (allInputs.length > 0) {
                inputsContainer.removeChild(allInputs[allInputs.length - 1]);
            }
        });

        acceptBtn.addEventListener('click', () => {
            const currentInputsInThisSection = inputsContainer.querySelectorAll('input');
            if (currentInputsInThisSection.length === 0) {
                const lang = window.getCurrentLanguage ? window.getCurrentLanguage() : 'en';
                const sectionName = lang === 'es' ? sectionTitleEs : sectionTitleEn;
                alert(lang === 'es' ? `Agrega al menos una entrada en ${sectionName}.` : `Please add at least one entry in ${sectionName}.`);
                return;
            }
            currentInputsInThisSection.forEach(input => input.disabled = true);
            section.classList.add('completed');
            acceptBtn.style.display = 'none';
            editBtn.style.display = 'inline-block';
        });

        editBtn.addEventListener('click', () => {
            const currentInputsInThisSection = inputsContainer.querySelectorAll('input');
            currentInputsInThisSection.forEach(input => {
                input.disabled = false;
            });
            if (currentInputsInThisSection.length > 0) {
                 currentInputsInThisSection[0].focus(); // Focus the first input in the section
            }
            section.classList.remove('completed');
            acceptBtn.style.display = 'inline-block';
            editBtn.style.display = 'none';
        });
    });

    // Handle the main form submission for Join Us (if not handled elsewhere)
    const joinForm = joinUsModal.querySelector('#join-form');
    if (joinForm && !joinForm.dataset.submissionHandlerAttached) { // Avoid double attachment
        joinForm.addEventListener('submit', (event) => {
            event.preventDefault();
            // Perform any final validation if needed
            const lang = window.getCurrentLanguage ? window.getCurrentLanguage() : 'en';
            alert(lang === 'es' ? 'Aplicación enviada (simulación desde join-us.js).' : 'Application submitted (simulated from join-us.js).');

            if (typeof window.closeModal === 'function') {
                window.closeModal(joinUsModal);
            }
            joinForm.reset(); // Reset form fields
            // Reset dynamic sections to initial state
            formSections.forEach(section => {
                section.querySelector('.inputs').innerHTML = ''; // Clear dynamic inputs
                section.classList.remove('completed');
                section.querySelector('.accept-btn').style.display = 'inline-block';
                section.querySelector('.edit-btn').style.display = 'none';
                section.querySelectorAll('input').forEach(inp => inp.disabled = false);
            });


        });
        joinForm.dataset.submissionHandlerAttached = 'true';
    }
};

// Note: Actual initialization (calling window.initializeJoinUsFormSections())
// is expected to be triggered by dynamic-modal-manager.js
// after it loads components/join-us/join-us.html into the modal.
// If the modal's HTML were static within index.html and not loaded dynamically,
// then a DOMContentLoaded listener here would be appropriate to call it.
// Example:
// document.addEventListener('DOMContentLoaded', () => {
//     if (document.getElementById('join-us-modal')) { // If modal is statically in page
//         window.initializeJoinUsFormSections();
//     }
// });
