// components/join-us/join-us.js

/**
 * Initializes the Join Us form, including dynamic sections and language updates.
 * This function should be called after the Join Us modal's HTML content
 * has been loaded into the DOM.
 */
window.initializeJoinUsModal = function() {
    const joinUsModal = document.getElementById('join-us-modal');
    if (!joinUsModal) {
        // console.warn("Join Us modal (#join-us-modal) not found. Cannot initialize.");
        return;
    }

    const joinForm = joinUsModal.querySelector('#join-form');
    if (!joinForm) {
        // console.warn("Join Us form (#join-form) not found within the modal. Cannot initialize form sections.");
        return;
    }

    // ----- Language Update Function (adapted from sample) -----
    // This function will be called by the global language switcher when the modal is open,
    // or when the modal is first displayed.
    window.updateJoinUsModalLanguage = function() {
        const currentLang = window.getCurrentLanguage ? window.getCurrentLanguage() : 'en';
        // console.log(`Updating Join Us modal language to: ${currentLang}`);

        joinUsModal.querySelectorAll('[data-en]').forEach(el => {
            const translation = el.getAttribute(`data-${currentLang}`);
            if (translation) {
                // Avoid changing text content if the element is a container for other translated items (e.g. a label for an input)
                // Only change if it's a direct text node or specific elements like buttons, spans, h2 etc.
                // This is a simple check; more robust might be needed if structure is complex.
                let isLeafOrSpecific = true;
                if (el.tagName === 'LABEL' && el.htmlFor) { // Don't change label text if it's for an input that might have its own placeholder
                    isLeafOrSpecific = false;
                }
                // Check if it's a button or a span that should have its text changed
                if (el.tagName === 'BUTTON' || el.tagName === 'SPAN' || el.tagName === 'H2' || el.tagName === 'OPTION' || (el.childElementCount === 0 && isLeafOrSpecific)) {
                   el.textContent = translation;
                }
            }
        });

        joinUsModal.querySelectorAll('input[data-placeholder-en], textarea[data-placeholder-en]').forEach(el => {
            const placeholderText = el.getAttribute(`data-placeholder-${currentLang}`);
            if (placeholderText) {
                el.placeholder = placeholderText;
            }
        });

        joinUsModal.querySelectorAll('[data-aria-label-en]').forEach(el => {
            const ariaLabelText = el.getAttribute(`data-aria-label-${currentLang}`);
            if (ariaLabelText) {
                el.setAttribute('aria-label', ariaLabelText);
            }
        });

        // Update title of the modal if it has data-en/es (it's in index.html shell, so global switcher handles it)
        // Update modal close button aria-label (it's in index.html shell, so global switcher handles it)
    };

    // ----- Dynamic Form Sections Logic (adapted from sample) -----
    joinUsModal.querySelectorAll('.form-section').forEach(section => {
        const addBtn = section.querySelector('.add');
        const removeBtn = section.querySelector('.remove');
        const acceptBtn = section.querySelector('.accept-btn');
        const editBtn = section.querySelector('.edit-btn');
        const inputsContainer = section.querySelector('.inputs'); // Corrected from 'inputs' to '.inputs'
        const titleElement = section.querySelector('h2'); // Corrected from 'title' to 'h2'

        if (!addBtn || !removeBtn || !acceptBtn || !editBtn || !inputsContainer || !titleElement) {
            // console.warn("A Join Us form section is missing one or more expected child elements:", section);
            return;
        }

        addBtn.onclick = () => {
            const input = document.createElement('input');
            input.type = 'text';
            const lang = window.getCurrentLanguage ? window.getCurrentLanguage() : 'en';
            const placeholderEn = `Enter ${titleElement.getAttribute('data-en')} info`;
            const placeholderEs = `Ingresa ${titleElement.getAttribute('data-es')} info`;

            input.setAttribute('data-placeholder-en', placeholderEn);
            input.setAttribute('data-placeholder-es', placeholderEs);
            input.placeholder = lang === 'es' ? placeholderEs : placeholderEn;

            inputsContainer.appendChild(input);
            input.focus();
        };

        removeBtn.onclick = () => {
            const allInputs = inputsContainer.querySelectorAll('input');
            if (allInputs.length) {
                inputsContainer.removeChild(allInputs[allInputs.length - 1]);
            }
        };

        acceptBtn.onclick = () => {
            if (!inputsContainer.querySelector('input')) {
                const lang = window.getCurrentLanguage ? window.getCurrentLanguage() : 'en';
                const msg = lang === 'es' ? 'Agrega al menos una entrada.' : 'Please add at least one entry.';
                alert(msg);
                return;
            }
            inputsContainer.querySelectorAll('input').forEach(input => input.disabled = true);
            acceptBtn.style.display = 'none';
            editBtn.style.display = 'inline-block';
            section.classList.add('completed');
        };

        editBtn.onclick = () => {
            inputsContainer.querySelectorAll('input').forEach(input => {
                input.disabled = false;
            });
            if (inputsContainer.querySelectorAll('input').length > 0) {
                 inputsContainer.querySelectorAll('input')[0].focus();
            }
            acceptBtn.style.display = 'inline-block';
            editBtn.style.display = 'none';
            section.classList.remove('completed');
        };
    });

    // ----- Form Submission (adapted from sample) -----
    if (!joinForm.dataset.submissionHandlerAttached) { // Avoid double attachment
        joinForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const lang = window.getCurrentLanguage ? window.getCurrentLanguage() : 'en';
            alert(lang === 'es' ? 'Aplicación enviada (simulación).' : 'Application submitted (simulated).');

            if (typeof window.closeModal === 'function') {
                window.closeModal(joinUsModal); // Use global closeModal
            }
            joinForm.reset(); // Reset form fields

            // Reset dynamic sections to initial state
            joinUsModal.querySelectorAll('.form-section').forEach(section => {
                const inputsContainer = section.querySelector('.inputs');
                if (inputsContainer) inputsContainer.innerHTML = ''; // Clear dynamic inputs

                section.classList.remove('completed');
                const acceptBtn = section.querySelector('.accept-btn');
                const editBtn = section.querySelector('.edit-btn');
                if (acceptBtn) acceptBtn.style.display = 'inline-block';
                if (editBtn) editBtn.style.display = 'none';

                // Re-enable any inputs that might have been part of the initial HTML within a section (though not typical for these dynamic ones)
                section.querySelectorAll('input').forEach(inp => inp.disabled = false);
            });
        });
        joinForm.dataset.submissionHandlerAttached = 'true';
    }

    // ----- Initial Language Update for the Modal -----
    // Call this once after everything is set up to ensure correct language display
    if (window.updateJoinUsModalLanguage) {
        window.updateJoinUsModalLanguage();
    }

    // console.log("Join Us Modal Initialized.");
};

// The call to window.initializeJoinUsModal() is expected to be made by
// dynamic-modal-manager.js after it loads components/join-us/join-us.html
// into the modal shell and this script is executed.
// Example (in dynamic-modal-manager.js or similar):
// fetch(sourceUrl).then(response => response.text()).then(html => {
//   modalBody.innerHTML = html;
//   if (typeof window.initializeJoinUsModal === 'function') {
//     window.initializeJoinUsModal();
//   }
//   // Potentially load component-specific CSS here too
// });
