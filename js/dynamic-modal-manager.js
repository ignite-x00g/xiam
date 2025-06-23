// js/dynamic-modal-manager.js

document.addEventListener('DOMContentLoaded', () => {
    console.log('[ModalManager] DOMContentLoaded: Initializing modal manager.'); // Log: Script start

    const modalBackdrop = document.getElementById('modal-backdrop');
    let openModal = null; // Keep track of the currently open modal
    let lastFocusedElement = null; // To restore focus

    // Helper: Get focusable elements
    if (!window.getFocusableElements) {
        console.log('[ModalManager] Defining window.getFocusableElements.'); // Log: Helper definition
        window.getFocusableElements = function(parentElement) {
            if (!parentElement) {
                console.warn('[ModalManager] getFocusableElements: parentElement is null.');
                return [];
            }
            try {
                const focusableSelector = 'a[href]:not([disabled]), button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';
                const elements = Array.from(parentElement.querySelectorAll(focusableSelector));
                const visibleElements = elements.filter(el => {
                    const style = window.getComputedStyle(el);
                    return style.display !== 'none' && style.visibility !== 'hidden' && el.offsetParent !== null && !el.closest('[style*="display: none"]');
                });
                // console.log('[ModalManager] getFocusableElements in parent:', parentElement, 'found:', visibleElements); // Optional: very verbose
                return visibleElements;
            } catch (e) {
                console.error('[ModalManager] Error in getFocusableElements:', e);
                return []; // Return empty array on error
            }
        };
    } else {
        console.log('[ModalManager] window.getFocusableElements already defined.');
    }

    function openModalHandler(modalId, triggerElement) {
        console.log(`[ModalManager] openModalHandler called for modalId: "${modalId}"`, 'Trigger:', triggerElement); // Log: Handler start

        const modal = document.getElementById(modalId);
        if (!modal) {
            console.error(`[ModalManager] Modal with ID "${modalId}" not found.`);
            return;
        }
        console.log(`[ModalManager] Found modal element:`, modal);

        if (openModal && openModal !== modal) {
            console.log(`[ModalManager] Closing currently open modal: "${openModal.id}" before opening "${modalId}".`);
            closeModalHandler(openModal);
        }

        lastFocusedElement = triggerElement || document.activeElement;
        console.log('[ModalManager] Last focused element stored:', lastFocusedElement);

        try {
            console.log(`[ModalManager] Attempting to display modal "${modalId}" and backdrop.`);
            modal.style.display = 'flex'; // Or 'block' if using .modal-overlay as the flex container
            console.log(`[ModalManager] Modal "${modalId}" display style set to flex.`);

            if (modalBackdrop) {
                modalBackdrop.style.display = 'block';
                console.log('[ModalManager] Modal backdrop display style set to block.');
            } else {
                console.warn('[ModalManager] Modal backdrop element not found.');
            }
            document.body.style.overflow = 'hidden';
            console.log('[ModalManager] Body overflow set to hidden.');

            // Focus trap
            console.log(`[ModalManager] Setting up focus trap for modal "${modalId}".`);
            const focusableElements = window.getFocusableElements(modal);
            console.log(`[ModalManager] Focusable elements in modal "${modalId}":`, focusableElements.length, focusableElements);

            if (focusableElements.length > 0) {
                focusableElements[0].focus();
                console.log(`[ModalManager] Focused first focusable element in modal "${modalId}":`, focusableElements[0]);
            } else {
                console.warn(`[ModalManager] No focusable elements found in modal "${modalId}". Setting tabindex on modal itself.`);
                modal.setAttribute('tabindex', '-1'); // Make modal focusable if no interactive elements
                modal.focus();
                console.log(`[ModalManager] Focused modal "${modalId}" itself.`);
            }
        } catch (e) {
            console.error(`[ModalManager] Error during modal "${modalId}" display or focus setup:`, e);
            // Optionally, attempt to revert if critical error (though display is already flex)
            // modal.style.display = 'none';
            // if (modalBackdrop) modalBackdrop.style.display = 'none';
            // document.body.style.overflow = '';
            return; // Stop if there was a critical error here
        }

        openModal = modal;
        modal.addEventListener('keydown', trapFocus);
        console.log(`[ModalManager] Modal "${modalId}" is now open. Event listener for keydown (trapFocus) added.`);

        try {
            if (window.applyTranslations && window.getCurrentLanguage) {
                console.log(`[ModalManager] Attempting to apply translations for modal "${modalId}".`);
                window.applyTranslations(window.getCurrentLanguage());
                console.log(`[ModalManager] Translations applied for modal "${modalId}".`);
            } else {
                console.warn(`[ModalManager] Translation functions (applyTranslations or getCurrentLanguage) not found on window.`);
            }
        } catch (e) {
            console.error(`[ModalManager] Error applying translations for modal "${modalId}":`, e);
        }
    }

    function closeModalHandler(modalToClose) {
        if (!modalToClose) modalToClose = openModal;
        if (!modalToClose) {
            console.warn('[ModalManager] closeModalHandler called but no modal to close.');
            return;
        }
        const modalId = modalToClose.id;
        console.log(`[ModalManager] closeModalHandler called for modalId: "${modalId}"`);

        modalToClose.style.display = 'none';
        if (modalBackdrop) modalBackdrop.style.display = 'none';
        document.body.style.overflow = '';
        console.log(`[ModalManager] Modal "${modalId}" and backdrop hidden. Body overflow restored.`);

        modalToClose.removeEventListener('keydown', trapFocus);
        if (lastFocusedElement && typeof lastFocusedElement.focus === 'function') {
            try {
                lastFocusedElement.focus();
                console.log('[ModalManager] Restored focus to:', lastFocusedElement);
            } catch (e) {
                console.error('[ModalManager] Error restoring focus to lastFocusedElement:', e, lastFocusedElement);
            }
        }
        openModal = null;
        console.log(`[ModalManager] Modal "${modalId}" closed. openModal reset to null.`);
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
    console.log(`[ModalManager] Found ${modalTriggers.length} modal triggers with [data-modal-target].`);
    modalTriggers.forEach(trigger => {
        console.log('[ModalManager] Attaching click listener to trigger for modal:', trigger.dataset.modalTarget, trigger);
        trigger.addEventListener('click', (event) => {
            // Prevent default for anchor tags, though current FABs are buttons
            if (trigger.tagName === 'A' && trigger.getAttribute('href') === '#') {
                event.preventDefault();
            }
            const modalId = trigger.dataset.modalTarget;
            console.log(`[ModalManager] Clicked trigger for modalId: "${modalId}"`, 'Element:', trigger);
            openModalHandler(modalId, trigger);
        });
    });

    // Similar logging can be added to other listener attachment sections if needed (service nav, mobile menu)
    // For brevity, I'll skip adding logs to those for now but the pattern would be the same.

    document.querySelectorAll('.services-navigation .service-nav-item[data-service-target]').forEach(trigger => {
        trigger.addEventListener('click', (event) => {
            const modalId = trigger.dataset.serviceTarget;
            openModalHandler(modalId, trigger);
        });
    });

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
        button.addEventListener('click', () => {
            const modalToCloseId = button.dataset.closeModal;
            const modalToClose = document.getElementById(modalToCloseId);
            closeModalHandler(modalToClose);
        });
    });

    // Close modal on backdrop click
    if (modalBackdrop) {
        modalBackdrop.addEventListener('click', () => {
            if (openModal) closeModalHandler(openModal);
        });
    }
    // Also handle clicks on .modal-overlay itself if it's the direct parent and not the content
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', (event) => {
            if (event.target === overlay && openModal && openModal.id === overlay.id) { // Ensure it's the correct overlay for the open modal
                closeModalHandler(openModal);
            }
        });
    });


    // Close modal on ESC key
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && openModal) {
            closeModalHandler(openModal);
        }
    });

    // Expose to global scope if needed by other scripts
    window.openModal = openModalHandler;
    window.closeModal = closeModalHandler;
    console.log('[ModalManager] Modal manager initialization complete. openModal and closeModal exposed on window.');
});
