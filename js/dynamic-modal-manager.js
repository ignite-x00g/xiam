// js/dynamic-modal-manager.js
console.log('[DMM] dynamic-modal-manager.js: Script start');

document.addEventListener('DOMContentLoaded', () => {
    console.log('[DMM] DOMContentLoaded event fired.');
    const modalBackdrop = document.getElementById('modal-backdrop');
    if (!modalBackdrop) {
        console.warn('[DMM] Modal backdrop element (#modal-backdrop) not found.');
    }
    let openModal = null; // Keep track of the currently open modal
    let lastFocusedElement = null; // To restore focus

    // Helper: Get focusable elements
    if (!window.getFocusableElements) {
        window.getFocusableElements = function(parentElement) {
            if (!parentElement) return [];
            return Array.from(
                parentElement.querySelectorAll(
                    'a[href]:not([disabled]), button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
                )
            ).filter(el => el.offsetParent !== null && !el.closest('[style*="display: none"]'));
        };
    }

    function openModalHandler(modalId, triggerElement) {
        const modal = document.getElementById(modalId);
        if (!modal) {
            console.error(`[DMM] Modal with ID ${modalId} not found.`);
            return;
        }
        console.log(`[DMM] openModalHandler called for modalId: ${modalId}. Modal element:`, modal);

        if (openModal) { // Close any already open modal
            closeModalHandler(openModal);
        }

        lastFocusedElement = triggerElement || document.activeElement;
        modal.style.display = 'flex'; // Or 'block' if using .modal-overlay as the flex container
        if (modalBackdrop) modalBackdrop.style.display = 'block'; // Show backdrop
        document.body.style.overflow = 'hidden'; // Prevent background scrolling

        // Focus trap
        const focusableElements = window.getFocusableElements(modal);
        if (focusableElements.length > 0) {
            focusableElements[0].focus();
        } else {
            modal.setAttribute('tabindex', '-1'); // Make modal focusable if no interactive elements
            modal.focus();
        }

        openModal = modal;
        modal.addEventListener('keydown', trapFocus);
        // Apply translations if the modal is being opened for the first time or language changed
        if (window.applyTranslations && window.getCurrentLanguage) {
            window.applyTranslations(window.getCurrentLanguage());
        }
    }

    function closeModalHandler(modalToClose, sourceEvent = null) {
        console.log('[DMM] closeModalHandler called. Modal to close:', modalToClose, 'Source event:', sourceEvent);
        if (sourceEvent && sourceEvent.target) {
            console.log('[DMM] closeModalHandler - event target:', sourceEvent.target);
        }
        try {
            throw new Error('[DMM] Stack trace for closeModalHandler');
        } catch (e) {
            console.log(e.stack);
        }

        if (!modalToClose && openModal) {
            console.log('[DMM] modalToClose was null, defaulting to openModal:', openModal);
            modalToClose = openModal;
        }

        if (!modalToClose) {
            console.log('[DMM] closeModalHandler: No modal to close, returning.');
            return;
        }

        console.log(`[DMM] Closing modal: ${modalToClose.id}`);
        modalToClose.style.display = 'none';
        if (modalBackdrop) {
            console.log('[DMM] Hiding modal backdrop.');
            modalBackdrop.style.display = 'none';
        }
        document.body.style.overflow = '';
        console.log('[DMM] Body overflow restored.');

        modalToClose.removeEventListener('keydown', trapFocus);
        if (lastFocusedElement && typeof lastFocusedElement.focus === 'function') {
            console.log('[DMM] Restoring focus to:', lastFocusedElement);
            lastFocusedElement.focus();
        }
        openModal = null;
        console.log('[DMM] openModal variable set to null.');
    }

    function trapFocus(event) {
        if (event.key !== 'Tab' || !openModal) return;

        const focusableElements = window.getFocusableElements(openModal);
        if (focusableElements.length === 0) {
            event.preventDefault();
            return;
        }
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (event.shiftKey) { // Shift + Tab
            if (document.activeElement === firstElement) {
                lastElement.focus();
                event.preventDefault();
            }
        } else { // Tab
            if (document.activeElement === lastElement) {
                firstElement.focus();
                event.preventDefault();
            }
        }
    }

    // Event listeners for modal triggers
    const modalTriggers = document.querySelectorAll('[data-modal-target]');
    console.log(`[DMM] Found ${modalTriggers.length} modal triggers with [data-modal-target].`);

    modalTriggers.forEach(trigger => {
        console.log(`[DMM] Attaching click listener to:`, trigger);
        trigger.addEventListener('click', (event) => {
            const modalId = trigger.dataset.modalTarget;
            console.log(`[DMM] Clicked on trigger for modalId: ${modalId}. Trigger element:`, trigger);
            if (trigger.id === 'fab-contact') {
                console.log('[DMM] Contact Us FAB (fab-contact) clicked!');
            }
            openModalHandler(modalId, trigger);
        });
    });

    // Event listeners for service navigation items (main desktop nav)
    document.querySelectorAll('.services-navigation .service-nav-item[data-service-target]').forEach(trigger => {
        trigger.addEventListener('click', (event) => {
            const modalId = trigger.dataset.serviceTarget;
            openModalHandler(modalId, trigger);
        });
    });

    // Event listeners for mobile services panel items
    document.querySelectorAll('.mobile-services-menu button[data-service-target]').forEach(trigger => {
        trigger.addEventListener('click', (event) => {
            const modalId = trigger.dataset.serviceTarget;
            openModalHandler(modalId, trigger);
            // Optionally close the mobile services panel if it's open
            const mobileMenuPanel = document.getElementById('mobile-services-panel');
            if (mobileMenuPanel && mobileMenuPanel.classList.contains('open')) {
                if(window.toggleMobileServicesMenu) window.toggleMobileServicesMenu(false); // Assuming function exists in mobile-menu.js
            }
        });
    });


    // Event listeners for close buttons
    document.querySelectorAll('[data-close-modal]').forEach(button => {
        button.addEventListener('click', (event) => { // Added event
            const modalToCloseId = button.dataset.closeModal;
            const modalToClose = document.getElementById(modalToCloseId);
            closeModalHandler(modalToClose, event); // Pass event
        });
    });

    // Close modal on backdrop click
    if (modalBackdrop) {
        modalBackdrop.addEventListener('click', (event) => { // Added event
            if (openModal) closeModalHandler(openModal, event); // Pass event
        });
    }
    // Also handle clicks on .modal-overlay itself if it's the direct parent and not the content
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', (event) => {
            if (event.target === overlay && openModal && openModal.id === overlay.id) { // Ensure it's the correct overlay for the open modal
                closeModalHandler(openModal, event); // Pass event
            }
        });
    });


    // Close modal on ESC key
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && openModal) {
            closeModalHandler(openModal, event); // Pass event
        }
    });

    // Expose to global scope if needed by other scripts
    window.openModal = openModalHandler;
    window.closeModal = closeModalHandler;
});
