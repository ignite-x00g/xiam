// js/join-us.js for the new redesigned modal

document.addEventListener('DOMContentLoaded', () => {
    const joinModal = document.getElementById('join-modal'); // The main overlay
    const fabJoinBtn = document.getElementById('fab-join');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const joinForm = document.getElementById('join-form');

    // --- MODAL DISPLAY LOGIC ---
    if (fabJoinBtn && joinModal) {
        fabJoinBtn.onclick = () => {
            joinModal.style.display = 'flex'; // Show the modal overlay
            // Ensure modal content is translated on open by calling global update
            if (window.loadTranslations) { // Assuming language-switcher.js exposes loadTranslations
                window.loadTranslations();
            }
            // Initial state for in-modal toggles might also need update here
            updateInModalLangToggleText();
            updateInModalThemeToggleDisplay();
        };
    }

    if (closeModalBtn && joinModal) {
        closeModalBtn.onclick = () => {
            joinModal.style.display = 'none';
        };
    }

    if (joinModal) {
        joinModal.addEventListener('click', (event) => {
            if (event.target === joinModal) { // Clicked on the overlay background
                joinModal.style.display = 'none';
            }
        });
    }

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && joinModal && joinModal.style.display === 'flex') {
            joinModal.style.display = 'none';
        }
    });

    // --- LANGUAGE AND THEME TOGGLE INTEGRATION (within the new modal) ---
    const modalLangToggle = document.querySelector('#join-modal .lang-toggle');
    const modalThemeToggle = document.querySelector('#join-modal #theme-toggle');

    if (modalLangToggle) {
        modalLangToggle.onclick = () => {
            const globalLangBtn = document.getElementById('language-toggle-button');
            if (globalLangBtn) {
                globalLangBtn.click(); // Simulate click on the global button
            } else {
                console.warn('Global language toggle button not found.');
            }
        };
    }

    if (modalThemeToggle) {
        modalThemeToggle.onclick = () => {
            const globalThemeBtn = document.getElementById('theme-toggle-button');
            if (globalThemeBtn) {
                globalThemeBtn.click(); // Simulate click on the global button
            } else {
                console.warn('Global theme toggle button not found.');
            }
        };
    }

    function updateInModalLangToggleText() {
        if (modalLangToggle && window.getCurrentLanguage) {
            const currentGlobalLang = window.getCurrentLanguage();
            // Example: Set text based on current language, or to indicate next language
            modalLangToggle.textContent = currentGlobalLang === 'en' ? 'Español' : 'English';
        }
    }

    function updateInModalThemeToggleDisplay() {
        if (modalThemeToggle) {
            const bodyClasses = document.body.classList;
            if (bodyClasses.contains('light-theme')) {
                modalThemeToggle.textContent = 'Dark'; // Text to switch to Dark
            } else {
                modalThemeToggle.textContent = 'Light'; // Text to switch to Light
            }
        }
    }

    // Initial state for in-modal toggles
    updateInModalLangToggleText();
    updateInModalThemeToggleDisplay();

    // Listen to global changes
    document.addEventListener('languageChanged', updateInModalLangToggleText);
    // Assuming global theme switcher dispatches 'themeChanged' or similar,
    // or we can observe body class changes. For now, let's make it simpler:
    // theme-switcher.js will update its own button text, and we try to match that.
    // A more robust way is a custom event 'themeChanged'.
    if (window.MutationObserver && document.getElementById('theme-toggle-button')) {
        const observer = new MutationObserver(updateInModalThemeToggleDisplay);
        observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    }


    // --- DYNAMIC SECTIONS LOGIC ---
    document.querySelectorAll('#join-modal .form-section').forEach(section => {
        const addBtn = section.querySelector('.add');
        const removeBtn = section.querySelector('.remove');
        const acceptBtn = section.querySelector('.accept-btn');
        const editBtn = section.querySelector('.edit-btn');
        const inputsContainer = section.querySelector('.inputs');
        const sectionTitleElement = section.querySelector('.section-header h2'); // Corrected selector

        if (addBtn && removeBtn && acceptBtn && editBtn && inputsContainer && sectionTitleElement) {
            addBtn.onclick = () => {
                const input = document.createElement('input');
                input.type = 'text';
                const currentGlobalLang = window.getCurrentLanguage ? window.getCurrentLanguage() : 'en';

                const titleEn = sectionTitleElement.getAttribute('data-en') || sectionTitleElement.textContent;
                const titleEs = sectionTitleElement.getAttribute('data-es') || titleEn; // Fallback to English title

                const placeholderBase = currentGlobalLang === 'es' ? titleEs : titleEn;
                const placeholderText = currentGlobalLang === 'es' ? `Ingresa ${placeholderBase}` : `Enter ${placeholderBase}`;

                input.placeholder = placeholderText;
                // Store both for potential language switch while modal is open, though not explicitly handled here
                input.setAttribute('data-placeholder-en', `Enter ${titleEn}`);
                input.setAttribute('data-placeholder-es', `Ingresa ${titleEs}`);
                inputsContainer.appendChild(input);
            };

            removeBtn.onclick = () => {
                const allInputs = inputsContainer.querySelectorAll('input[type="text"]'); // More specific
                if (allInputs.length) {
                    inputsContainer.removeChild(allInputs[allInputs.length - 1]);
                }
            };

            acceptBtn.onclick = () => {
                const allInputs = inputsContainer.querySelectorAll('input[type="text"]');
                if (allInputs.length === 0 && inputsContainer.children.length === 0) { // Check if any input was ever added
                    const currentGlobalLang = window.getCurrentLanguage ? window.getCurrentLanguage() : 'en';
                    const msgKey = 'joinModal.alert.addEntry';
                    const fallbackMsg = currentGlobalLang === 'es' ? 'Agrega al menos una entrada.' : 'Please add at least one entry.';
                    alert(window.getTranslatedText ? window.getTranslatedText(msgKey) : fallbackMsg);
                    return;
                }
                allInputs.forEach(input => input.disabled = true);
                addBtn.style.display = 'none'; // Hide add/remove when accepted
                removeBtn.style.display = 'none';
                acceptBtn.style.display = 'none';
                editBtn.style.display = 'inline-block';
                section.classList.add('completed');
            };

            editBtn.onclick = () => {
                inputsContainer.querySelectorAll('input[type="text"]').forEach(input => input.disabled = false);
                addBtn.style.display = 'inline-block'; // Show add/remove again
                removeBtn.style.display = 'inline-block';
                acceptBtn.style.display = 'inline-block';
                editBtn.style.display = 'none';
                section.classList.remove('completed');
            };
        }
    });

    // --- FORM SUBMISSION ---
    if (joinForm) {
        joinForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const currentGlobalLang = window.getCurrentLanguage ? window.getCurrentLanguage() : 'en';
            const msgKey = 'joinModal.alert.formSubmittedNew';
            const fallbackMsg = currentGlobalLang === 'es' ? 'Formulario enviado (nueva versión).' : 'Form submitted (new version).';
            alert(window.getTranslatedText ? window.getTranslatedText(msgKey) : fallbackMsg);

            if (joinModal) joinModal.style.display = 'none';
        });
    }

    // Ensure translations are applied when the modal might become visible.
    // This is a general call; specific updates for dynamic content might be needed elsewhere.
    if (window.loadTranslations) {
        window.loadTranslations();
    }
});
