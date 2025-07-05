// dynamic-modal-manager.js

document.addEventListener('DOMContentLoaded', () => {
    const modalBackdrop = document.getElementById('modal-backdrop');

    // Function to open a modal by its ID (for modals with static content)
    window.openModalById = function(modalId) {
        console.log(`[DMM] openModalById called for modalId: ${modalId}`);
        const modal = document.getElementById(modalId);
        console.log(`[DMM] Attempting to get modal element by ID: ${modalId}`, modal);
        if (modal) {
            console.log(`[DMM] Modal ${modalId} found. Attempting to display.`);
            if (modalBackdrop) {
                console.log(`[DMM] Setting backdrop display to block !important for ${modalId}`);
                modalBackdrop.style.setProperty('display', 'block', 'important');
                console.log(`[DMM] Backdrop display after set: ${modalBackdrop.style.display}`);
            }
            console.log(`[DMM] Setting modal ${modalId} display to flex !important`);
            modal.style.setProperty('display', 'flex', 'important');
            console.log(`[DMM] Modal ${modalId} display after set: ${modal.style.display}`);
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
            console.warn(`[DMM] Modal with ID ${modalId} not found.`);
        }
    };

    // Function to fetch HTML content and inject it into a modal, then open it
    window.openModalWithContent = async function(modalId, htmlContentUrl) {
        console.log(`[DMM] openModalWithContent called for modalId: ${modalId}, htmlContentUrl: ${htmlContentUrl}`);
        const modal = document.getElementById(modalId);
        console.log(`[DMM] Attempting to get modal element by ID: ${modalId}`, modal);
        if (!modal) {
            console.error(`[DMM] Modal element with ID ${modalId} not found. Aborting.`);
            return;
        }
        const modalBody = modal.querySelector('.modal-body');
        console.log(`[DMM] Modal body for ${modalId}:`, modalBody);
        if (!modalBody) {
            console.error(`[DMM] Modal body for ID ${modalId} not found. Ensure it has a .modal-body element.`);
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
            console.log(`[DMM] Fetching content for ${modalId} from ${htmlContentUrl}`);
            const response = await fetch(htmlContentUrl);
            console.log(`[DMM] Fetch response for ${modalId}:`, response);
            if (!response.ok) {
                console.error(`[DMM] Fetch failed for ${modalId}. Status: ${response.status} ${response.statusText}`);
                throw new Error(`Failed to fetch modal content (${htmlContentUrl}): ${response.status} ${response.statusText}`);
            }
            const htmlText = await response.text();
            console.log(`[DMM] Content fetched for ${modalId}. Length: ${htmlText.length}. Injecting into modal body.`);
            (modalBody || modal.querySelector('.modal-content')).innerHTML = htmlText; // Use modal-body, fallback to modal-content
            console.log(`[DMM] Content injected for ${modalId}.`);
            console.log(`[DMM] Attempting to display modal ${modalId} and backdrop after content injection.`);
            if (modalBackdrop) {
                console.log(`[DMM] Setting backdrop display to block !important for ${modalId}`);
                modalBackdrop.style.setProperty('display', 'block', 'important');
                console.log(`[DMM] Backdrop display after set: ${modalBackdrop.style.display}`);
            }
            console.log(`[DMM] Setting modal ${modalId} display to flex !important`);
            modal.style.setProperty('display', 'flex', 'important');
            console.log(`[DMM] Modal ${modalId} display after set: ${modal.style.display}`);
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
            console.error('[DMM] Error loading modal content:', error);
            const targetForError = modalBody || modal.querySelector('.modal-content');
            if(targetForError){
                targetForError.innerHTML = `<p data-en="Error loading content. Please try again later." data-es="Error al cargar el contenido. Por favor, inténtelo más tarde.">Error loading content. Please try again later.</p>`;
                if (window.applyTranslations && window.getCurrentLanguage) {
                    window.applyTranslations(window.getCurrentLanguage());
                }
            }
            console.log(`[DMM] Attempting to display modal ${modalId} and backdrop after CATCHING error.`);
            if (modalBackdrop) {
                console.log(`[DMM] Setting backdrop display to block !important for ${modalId} (in catch)`);
                modalBackdrop.style.setProperty('display', 'block', 'important'); // Still show modal, but with error
                console.log(`[DMM] Backdrop display after set (in catch): ${modalBackdrop.style.display}`);
            }
            console.log(`[DMM] Setting modal ${modalId} display to flex !important (in catch)`);
            modal.style.setProperty('display', 'flex', 'important');
            console.log(`[DMM] Modal ${modalId} display after set (in catch): ${modal.style.display}`);
        }
    };

    window.closeModal = function(modalOrId) {
        const modalIdForLog = typeof modalOrId === 'string' ? modalOrId : (modalOrId ? modalOrId.id : 'Unknown modal object');
        console.log(`[DMM] closeModal called for: ${modalIdForLog}`);
        const modal = typeof modalOrId === 'string' ? document.getElementById(modalOrId) : modalOrId;
        if (modal && (modal.style.display === 'flex' || modal.style.display === 'block')) { // Check against flex or block
            console.log(`[DMM] Closing modal ${modalIdForLog}. Current display: ${modal.style.display}`);
            modal.style.setProperty('display', 'none', 'important'); // Also use important for closing
            if (modalBackdrop) modalBackdrop.style.setProperty('display', 'none', 'important'); // Also use important for closing
            console.log(`[DMM] Modal ${modalIdForLog} display after close set: ${modal.style.display}`);
            if (modalBackdrop) console.log(`[DMM] Backdrop display after close set: ${modalBackdrop.style.display}`);
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
