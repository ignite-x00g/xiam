// dynamic-modal-manager.js

document.addEventListener('DOMContentLoaded', () => {
    const modalBackdrop = document.getElementById('modal-backdrop');

    // Function to open a modal by its ID (for modals with static content)
    window.openModalById = function(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            if (modalBackdrop) modalBackdrop.style.display = 'block';
            modal.style.display = 'flex';
            if (window.applyTranslations && window.getCurrentLanguage) {
                setTimeout(() => window.applyTranslations(window.getCurrentLanguage()), 0);
            }
            const focusableElements = modal.querySelectorAll(
                'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            );
            if (focusableElements.length > 0) {
                focusableElements[0].focus();
            }
        } else {
            console.warn(`Modal with ID ${modalId} not found.`);
        }
    };

    // Function to fetch HTML content and inject it into a modal, then open it
    window.openModalWithContent = async function(modalId, htmlContentUrl) {
        const modal = document.getElementById(modalId);
        if (!modal) {
            console.error(`Modal element with ID ${modalId} not found.`);
            return;
        }
        const modalBody = modal.querySelector('.modal-body');
        if (!modalBody) {
            console.error(`Modal body for ID ${modalId} not found. Ensure it has a .modal-body element.`);
            // Fallback: try to use modal-content if modal-body is missing
            const modalContent = modal.querySelector('.modal-content');
            if(modalContent && !modalContent.querySelector('.modal-body')){ // only if .modal-body is truly absent
                 console.warn(`Using .modal-content as modalBody for ${modalId} as .modal-body was not found directly.`);
                 // This is a fallback, ideally .modal-body should exist.
            } else if (!modalContent) {
                 console.error(`Neither .modal-body nor .modal-content found for ${modalId}. Cannot inject content.`);
                 return;
            }
            // If we reach here, modalBody is still null, but modalContent might be the target
            // This part of logic is tricky, best to ensure .modal-body exists.
            // For now, we'll proceed assuming modalBody was found or error out.
            // If it was not found, the earlier error would have triggered.
        }

        try {
            const response = await fetch(htmlContentUrl);
            if (!response.ok) {
                throw new Error(`Failed to fetch modal content (${htmlContentUrl}): ${response.status} ${response.statusText}`);
            }
            const htmlText = await response.text();
            (modalBody || modal.querySelector('.modal-content')).innerHTML = htmlText; // Use modal-body, fallback to modal-content

            if (modalBackdrop) modalBackdrop.style.display = 'block';
            modal.style.display = 'flex';

            if (window.applyTranslations && window.getCurrentLanguage) {
                 setTimeout(() => {
                    window.applyTranslations(window.getCurrentLanguage());
                    if (modalId === 'join-us-modal' && typeof window.initializeJoinUsFormSections === 'function') {
                        window.initializeJoinUsFormSections();
                    }
                    if (modalId === 'contact-us-modal' && typeof window.initializeContactForm === 'function') {
                        window.initializeContactForm();
                    }
                }, 0); // Timeout helps ensure content is fully in DOM
            }

            const focusableElements = modal.querySelectorAll(
                'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            );
            if (focusableElements.length > 0) {
                focusableElements[0].focus();
            }

        } catch (error) {
            console.error('Error loading modal content:', error);
            const targetForError = modalBody || modal.querySelector('.modal-content');
            if(targetForError){
                targetForError.innerHTML = `<p data-en="Error loading content. Please try again later." data-es="Error al cargar el contenido. Por favor, inténtelo más tarde.">Error loading content. Please try again later.</p>`;
                if (window.applyTranslations && window.getCurrentLanguage) {
                    window.applyTranslations(window.getCurrentLanguage());
                }
            }
            if (modalBackdrop) modalBackdrop.style.display = 'block'; // Still show modal, but with error
            modal.style.display = 'flex';
        }
    };

    window.closeModal = function(modalOrId) {
        const modal = typeof modalOrId === 'string' ? document.getElementById(modalOrId) : modalOrId;
        if (modal && modal.style.display !== 'none') {
            modal.style.display = 'none';
            if (modalBackdrop) modalBackdrop.style.display = 'none';

            const modalBody = modal.querySelector('.modal-body');
            const modalContent = modal.querySelector('.modal-content'); // Fallback
            const targetForClear = modalBody || modalContent;

            if (modal.dataset.modalSource && targetForClear) {
               targetForClear.innerHTML = `<p data-en="Loading..." data-es="Cargando..."></p>`; // Reset to loading or empty
            }
        }
    };

    document.addEventListener('click', (event) => {
        const trigger = event.target.closest('[data-modal-target]');
        if (trigger) {
            event.preventDefault();
            const modalId = trigger.dataset.modalTarget;
            const modalSourceUrl = trigger.dataset.modalSource;

            if (modalSourceUrl) {
                window.openModalWithContent(modalId, modalSourceUrl);
            } else {
                window.openModalById(modalId);
            }
        }

        const closeButton = event.target.closest('[data-close-modal]');
        if (closeButton) {
            event.preventDefault();
            const modalToClose = closeButton.closest('.modal-overlay') || document.getElementById(closeButton.dataset.closeModal);
            if(modalToClose) window.closeModal(modalToClose);
        }
    });

    if (modalBackdrop) {
        modalBackdrop.addEventListener('click', () => {
            document.querySelectorAll('.modal-overlay').forEach(modal => {
                if (modal.style.display === 'flex' || modal.style.display === 'block') {
                    window.closeModal(modal);
                }
            });
        });
    }

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            let modalIsOpen = false;
            document.querySelectorAll('.modal-overlay').forEach(modal => {
                if (modal.style.display === 'flex' || modal.style.display === 'block') {
                    window.closeModal(modal);
                    modalIsOpen = true;
                }
            });
            if(modalIsOpen && modalBackdrop && modalBackdrop.style.display === 'block'){
                modalBackdrop.style.display = 'none';
            }
        }
    });
});
