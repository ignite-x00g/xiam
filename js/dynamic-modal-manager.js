// js/dynamic-modal-manager.js
// console.log('[DMM] dynamic-modal-manager.js: Script start');

document.addEventListener('DOMContentLoaded', () => {
    // console.log('[DMM] DOMContentLoaded event fired.');
    const modalBackdrop = document.getElementById('modal-backdrop');
    if (!modalBackdrop) {
        // console.warn('[DMM] Modal backdrop element (#modal-backdrop) not found.');
    }
    let openModal = null; // Keep track of the currently open modal
    let lastFocusedElement = null; // To restore focus

    // Helper: Get focusable elements
    if (!window.getFocusableElements) {
        // console.log('[ModalManager] Defining window.getFocusableElements.'); // Log: Helper definition
        window.getFocusableElements = function(parentElement) {
            if (!parentElement) {
                // console.warn('[ModalManager] getFocusableElements: parentElement is null.');
                return [];
            }
            try {
                const focusableSelector = 'a[href]:not([disabled]), button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';
                const elements = Array.from(parentElement.querySelectorAll(focusableSelector));
                // console.log(`[ModalManager-Debug] getFocusableElements: Found ${elements.length} candidates in parent:`, parentElement);

                const visibleElements = elements.filter((el, index) => {
                    const computedStyle = window.getComputedStyle(el);
                    const isOffsetParentNull = el.offsetParent === null;
                    const isVisibilityHidden = computedStyle.visibility === 'hidden';
                    const isDisplayNone = computedStyle.display === 'none'; // Also check computed display

                    // if (index < 5 || elements.length <= 5) { // Log details for first 5 or all if less than 5
                        // console.log(`[ModalManager-Debug] Candidate ${index}: ${el.tagName}${el.id ? '#' + el.id : ''}${el.className ? '.' + el.className.split(' ').join('.') : ''}`);
                        // console.log(`  - offsetParent:`, el.offsetParent);
                        // console.log(`  - computedStyle.display: ${computedStyle.display}`);
                        // console.log(`  - computedStyle.visibility: ${computedStyle.visibility}`);
                        // console.log(`  - el.disabled: ${el.disabled}`);
                        // console.log(`  - el.tabIndex: ${el.tabIndex}`);
                        // console.log(`  - Filtered out? offsetParentNull: ${isOffsetParentNull}, visibilityHidden: ${isVisibilityHidden}`);
                    // }

                    // Original simplified filter condition:
                    // return el.offsetParent !== null && computedStyle.visibility !== 'hidden';
                    // Let's use the more complete original filter for logging, then apply the simplified one
                    // The selector already handles :not([disabled]) and tabindex.
                    // Primary checks are offsetParent and visibility.
                    return !isOffsetParentNull && !isVisibilityHidden;
                });
                // // console.log('[ModalManager] getFocusableElements in parent:', parentElement, 'found:', visibleElements);
                return visibleElements;
            } catch (e) {
                // console.error('[ModalManager] Error in getFocusableElements:', e); // Keep errors for now
                return []; // Return empty array on error
            }
        };
    } else {
        // console.log('[ModalManager] window.getFocusableElements already defined.');
    }

    function openModalHandler(modalId, triggerElement) {
        // console.log(`[ModalManager] openModalHandler called for modalId: "${modalId}"`, 'Trigger:', triggerElement); // Log: Handler start

        const modal = document.getElementById(modalId);
        if (!modal) {
            console.error(`[DMM] Modal with ID ${modalId} not found.`); // Keep error
            return;
        }
        // console.log(`[DMM] openModalHandler called for modalId: ${modalId}. Modal element:`, modal);
        if (openModal && openModal !== modal) {
            // console.log(`[ModalManager] Closing currently open modal: "${openModal.id}" before opening "${modalId}".`);
            closeModalHandler(openModal);
        }

        lastFocusedElement = triggerElement || document.activeElement;
        // console.log('[ModalManager] Last focused element stored:', lastFocusedElement);

        try {
            // Ensure modal object is valid and has a style property
            if (!modal || typeof modal.style === 'undefined') {
                console.error(`[DMM] Modal element for ID "${modalId}" is invalid or has no style property. Cannot display.`);
                return;
            }

            console.log(`[ModalManager] Attempting to display modal "${modalId}" and backdrop.`);
            console.log(`[DMM] Setting ${modal.id}.style.display = 'flex'`);
            modal.style.display = 'flex'; // Or 'block' if using .modal-overlay as the flex container
            console.log(`[DMM] After setting ${modal.id}.style.display:`, modal.style.display);
            // Log computed style for the modal immediately after setting
            const computedModalDisplay = window.getComputedStyle(modal).display;
            console.log(`[ModalManager] Modal "${modalId}" JS set to 'flex'. Computed display: ${computedModalDisplay}.`);

            if (modalBackdrop) {
                console.log(`[DMM] Setting ${modalBackdrop.id}.style.display = 'block'`);
                modalBackdrop.style.display = 'block';
                console.log(`[DMM] After setting ${modalBackdrop.id}.style.display:`, modalBackdrop.style.display);
                // Log computed style for the backdrop immediately after setting
                const computedBackdropDisplay = window.getComputedStyle(modalBackdrop).display;
                console.log(`[ModalManager] Modal backdrop JS set to 'block'. Computed display: ${computedBackdropDisplay}.`);
            } else {
                console.warn('[ModalManager] Modal backdrop element not found.');
            }
            document.body.style.overflow = 'hidden';
            console.log('[ModalManager] Body overflow set to hidden.');

            // Focus trap
            // Defer focus logic to allow browser to process display changes
            setTimeout(() => {
                try {
                    console.log(`[ModalManager] Setting up focus trap for modal "${modalId}" (inside setTimeout).`);
                    const focusableElements = window.getFocusableElements(modal);
                    console.log(`[ModalManager] Focusable elements in modal "${modalId}" (setTimeout):`, focusableElements.length, focusableElements);

                    if (focusableElements.length > 0) {
                        focusableElements[0].focus();
                        console.log(`[ModalManager] Focused first focusable element in modal "${modalId}" (setTimeout):`, focusableElements[0]);
                    } else {
                        console.warn(`[ModalManager] No focusable elements found in modal "${modalId}" (setTimeout). Setting tabindex on modal itself.`);
                        modal.setAttribute('tabindex', '-1'); // Make modal focusable if no interactive elements
                        modal.focus();
                        console.log(`[ModalManager] Focused modal "${modalId}" itself (setTimeout).`);
                    }
                } catch (e) {
                    console.error(`[ModalManager] Error during modal "${modalId}" focus setup (setTimeout):`, e);
                }
            }, 0); // Use setTimeout with 0 delay

        } catch (e) {
            console.error(`[ModalManager] Error during modal "${modalId}" display (before setTimeout):`, e);
            // Optionally, attempt to revert if critical error (though display is already flex)
            // modal.style.display = 'none';
            // if (modalBackdrop) modalBackdrop.style.display = 'none';
            // document.body.style.overflow = '';
            return; // Stop if there was a critical error here
        }

        openModal = modal;
        modal.addEventListener('keydown', trapFocus);
        console.log(`[ModalManager] Modal "${modalId}" is now open. Event listener for keydown (trapFocus) added.`);

        // Apply translations immediately, as they don't depend on focus/layout as much
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
            // Prevent default for anchor tags, though current FABs are buttons
            if (trigger.tagName === 'A' && trigger.getAttribute('href') === '#') {
                event.preventDefault();
            }
            const modalId = trigger.dataset.modalTarget;
            console.log(`[DMM] Clicked on trigger for modalId: ${modalId}. Trigger element:`, trigger);
            if (trigger.id === 'fab-contact') {
                console.log('[DMM] Contact Us FAB (fab-contact) clicked!');
            }
            openModalHandler(modalId, trigger);
            event.stopPropagation(); // Prevent click from bubbling to backdrop/overlay
        });
    });

    // Similar logging can be added to other listener attachment sections if needed (service nav, mobile menu)
    // For brevity, I'll skip adding logs to those for now but the pattern would be the same.

    document.querySelectorAll('.services-navigation .service-nav-item[data-service-target]').forEach(trigger => {
        trigger.addEventListener('click', (event) => {
            const modalId = trigger.dataset.serviceTarget;
            openModalHandler(modalId, trigger);
            event.stopPropagation(); // Prevent click from bubbling to backdrop/overlay
        });
    });

    document.querySelectorAll('.mobile-services-menu button[data-service-target]').forEach(trigger => {
        trigger.addEventListener('click', (event) => {
            const modalId = trigger.dataset.serviceTarget;
            openModalHandler(modalId, trigger);
            event.stopPropagation(); // Prevent click from bubbling to backdrop/overlay
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
    console.log('[ModalManager] Modal manager initialization complete. openModal and closeModal exposed on window.');
});
