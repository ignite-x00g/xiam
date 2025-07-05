// dynamic-modal-manager.js

document.addEventListener('DOMContentLoaded', () => {
    const modalBackdrop = document.getElementById('modal-backdrop');
    // console.log('[DMM] Modal Backdrop Element:', modalBackdrop); // Cleanup

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

    // Direct modalBackdrop click listener is commented out as overlay click logic is preferred.
    // if (modalBackdrop) {
    //     modalBackdrop.addEventListener('click', () => {
    //         document.querySelectorAll('.modal-overlay').forEach(modal => {
    //             if (modal.style.display === 'flex' || modal.style.display === 'block') {
    //                 window.closeModal(modal);
    //             }
    //         });
    //     });
    // }

    document.addEventListener('click', (event) => {
        const trigger = event.target.closest('[data-modal-target]');
        if (trigger) {
            event.preventDefault();
            const modalId = trigger.dataset.modalTarget;
            const modalSourceUrl = trigger.dataset.modalSource;
            // console.log(`[DMM] Modal trigger clicked for target: ${modalId}, source: ${modalSourceUrl || 'none'}`); // Cleanup

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
            if(modalToClose) {
                // console.log(`[DMM] Close button clicked for modal: ${modalToClose.id}`); // Cleanup
                window.closeModal(modalToClose);
            } else {
                // console.warn(`[DMM] Close button clicked, but no modal found for selector: ${closeButton.dataset.closeModal}`); // Cleanup
            }
        }

        // New logic for clicking on overlay to close
        const clickedOverlay = event.target.closest('.modal-overlay');
        // Check if the event target is the overlay itself (i.e., not a child element like modal-content)
        if (clickedOverlay && event.target === clickedOverlay) {
            if (clickedOverlay.style.display === 'flex' || clickedOverlay.style.display === 'block') {
                // console.log(`[DMM] Clicked directly on overlay ${clickedOverlay.id}. Closing.`); // Cleanup
                window.closeModal(clickedOverlay);
            }
        }

        const serviceSendButton = event.target.closest('.service-modal-send-button');
        if (serviceSendButton) {
            event.preventDefault(); // Prevent any default button action if it were, e.g., a submit type in a form
            const modalToClose = serviceSendButton.closest('.modal-overlay');
            if (modalToClose) {
                // console.log(`[DMM] Service modal Send button clicked in modal: ${modalToClose.id}.`); // Cleanup
                // Placeholder for actual data gathering and sending logic
                // console.log('[DMM] Placeholder: Perform data gathering, security checks, and send to Cloudflare worker here.'); // Cleanup
                window.closeModal(modalToClose);
            } else {
                // console.warn('[DMM] Service modal Send button clicked, but could not find parent modal to close.'); // Cleanup
            }
        }
    });


    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            // console.log('[DMM] Escape key pressed.'); // Cleanup
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

    // Add listener for messages from iframes (e.g., chatbot)
    window.addEventListener('message', (event) => {
        // console.log('[DMM] Message received from iframe/window:', event.data, 'from origin:', event.origin); // Cleanup
        // Consider checking event.origin for security if the source is known e.g.
        // if (event.origin !== window.location.origin) return; // Be careful with cross-origin iframes if URL isn't static
        if (event.data === 'closeChatbotModal') {
            // console.log('[DMM] "closeChatbotModal" message received. Attempting to close chatbot-modal.'); // Cleanup
            const chatbotModal = document.getElementById('chatbot-modal');
            // Check if the modal exists and is currently displayed
            if (chatbotModal && (chatbotModal.style.display === 'flex' || chatbotModal.style.display === 'block')) {
                // console.log('[DMM] Chatbot modal found and is visible. Closing it.'); // Cleanup
                window.closeModal(chatbotModal);
            } else {
                // console.warn('[DMM] Chatbot modal not found or not visible. Cannot close.'); // Cleanup
            }
        }
    });
});
