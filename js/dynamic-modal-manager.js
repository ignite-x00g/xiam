// js/dynamic-modal-manager.js

/**
 * Initializes and manages dynamic modals within the application.
 * Handles opening, closing, focus trapping, and global API exposure.
 */
function initializeDynamicModalManager() {
    const modalBackdrop = document.getElementById('modal-backdrop');
    // if (!modalBackdrop) {
    //     console.warn('[DMM] Modal backdrop element (#modal-backdrop) not found.');
    // }
    let openModal = null; // Tracks the currently active modal element
    let lastFocusedElement = null; // Stores the element that had focus before modal opened
    const hiddenElements = []; // Stores elements hidden with aria-hidden when a modal is open

    /**
     * Ensures `window.getFocusableElements` is defined.
     * This function retrieves focusable elements within a given parent.
     * If not already defined, it creates a default implementation.
     */
    function ensureGlobalGetFocusableElements() {
        if (!window.getFocusableElements) {
            // console.log('[ModalManager] Defining window.getFocusableElements.');
            window.getFocusableElements = function(parentElement) {
                if (!parentElement) {
                    // console.warn('[ModalManager] getFocusableElements: parentElement is null.');
                    return [];
                }
                try {
                    // Standard focusable elements selector
                    const focusableSelector = 'a[href]:not([disabled]), button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';
                    const elements = Array.from(parentElement.querySelectorAll(focusableSelector));

                    // Filter for elements that are actually visible and interactive
                    return elements.filter(el => {
                        const computedStyle = window.getComputedStyle(el);
                        // Element must have an offsetParent (not be display:none or detached)
                        // and must not be visibility:hidden
                        return el.offsetParent !== null &&
                               computedStyle.visibility !== 'hidden' &&
                               computedStyle.display !== 'none'; // Explicitly check computed display
                    });
                } catch (e) {
                    console.error('[ModalManager] Error in getFocusableElements:', e);
                    return []; // Return empty array on error
                }
            };
        } else {
            // console.log('[ModalManager] window.getFocusableElements already defined.');
        }
    }

    /**
     * Opens a modal dialog by its ID.
     * Manages focus, displays the modal and backdrop, and prevents body scrolling.
     * @param {string} modalId - The ID of the modal HTML element to open.
     * @param {HTMLElement} [triggerElement] - The element that triggered the modal opening, used to restore focus.
     */
    function openModalHandler(modalId, triggerElement) {
        // console.log(`[ModalManager] openModalHandler called for modalId: "${modalId}"`, 'Trigger:', triggerElement);

        const modal = document.getElementById(modalId);
        if (!modal) {
            console.error(`[DMM] Modal with ID ${modalId} not found.`);
            return;
        }

        // If another modal is already open, close it first
        if (openModal && openModal !== modal) {
            // console.log(`[ModalManager] Closing currently open modal: "${openModal.id}" before opening "${modalId}".`);
            closeModalHandler(openModal);
        }

        lastFocusedElement = triggerElement || document.activeElement;
        // console.log('[ModalManager] Last focused element stored:', lastFocusedElement);

        try {
            // Basic check for modal.style property
            if (typeof modal.style === 'undefined') {
                console.error(`[DMM] Modal element for ID "${modalId}" is invalid or has no style property. Cannot display.`);
                return;
            }

            // console.log(`[ModalManager] Attempting to display modal "${modalId}" and backdrop.`);
            modal.style.display = 'flex'; // Use 'flex' for modern centering; adjust if CSS expects 'block'
            modal.setAttribute('aria-modal', 'true');

            // Accessibility: Check for role and accessible name (non-blocking warnings)
            if (!modal.getAttribute('role') || !['dialog', 'alertdialog'].includes(modal.getAttribute('role'))) {
                console.warn(`[DMM] Accessibility: Modal #${modal.id} should have a role of 'dialog' or 'alertdialog'.`);
            }
            if (!modal.getAttribute('aria-labelledby') && !modal.getAttribute('aria-label')) {
                console.warn(`[DMM] Accessibility: Modal #${modal.id} should have an accessible name via 'aria-labelledby' or 'aria-label'.`);
            }

            if (modalBackdrop) {
                modalBackdrop.style.display = 'block';
            }
            document.body.style.overflow = 'hidden'; // Prevent scrolling of the page content behind the modal

            // Accessibility: Hide background content from assistive technologies
            Array.from(document.body.children).forEach(child => {
                if (child !== modal && child !== modalBackdrop && child.tagName !== 'SCRIPT' && child.tagName !== 'STYLE') {
                    if (child.getAttribute('aria-hidden') !== 'true') {
                        child.setAttribute('aria-hidden', 'true');
                        hiddenElements.push(child);
                    }
                }
            });

            // Defer focus logic:
            // This allows the browser to complete rendering updates (display changes)
            // before attempting to move focus into the modal.
            setTimeout(() => {
                try {
                    // console.log(`[ModalManager] Setting up focus trap for modal "${modalId}" (inside setTimeout).`);
                    const focusableElements = window.getFocusableElements(modal);
                    if (focusableElements.length > 0) {
                        focusableElements[0].focus(); // Focus the first interactive element
                    } else {
                        // If no interactive elements, make the modal itself focusable and focus it.
                        modal.setAttribute('tabindex', '-1');
                        modal.focus();
                    }
                } catch (e) {
                    console.error(`[ModalManager] Error during modal "${modalId}" focus setup (setTimeout):`, e);
                }
            }, 0); // Zero delay setTimeout executes after current rendering pass

        } catch (e) {
            console.error(`[ModalManager] Error during modal "${modalId}" display (before setTimeout):`, e);
            // Attempt to revert style changes in case of an error during the display setup
            modal.style.display = 'none';
            if (modalBackdrop) modalBackdrop.style.display = 'none';
            document.body.style.overflow = '';
            return; // Stop further execution if a critical error occurred
        }

        openModal = modal; // Set the currently open modal
        modal.addEventListener('keydown', trapFocusInModal); // Add focus trapping

        // Apply translations if global translation functions are available
        try {
            if (window.applyTranslations && window.getCurrentLanguage) {
                // console.log(`[ModalManager] Attempting to apply translations for modal "${modalId}".`);
                window.applyTranslations(window.getCurrentLanguage());
            }
        } catch (e) {
            console.error(`[ModalManager] Error applying translations for modal "${modalId}":`, e);
        }
    }

    /**
     * Closes the specified modal (or the currently open one).
     * Restores focus to the element that had focus before the modal was opened.
     * @param {HTMLElement} [modalToCloseParam] - The modal element to close. Defaults to `openModal`.
     * @param {Event} [sourceEvent] - The event that triggered the close (for logging/debugging).
     */
    function closeModalHandler(modalToCloseParam, sourceEvent = null) {
        const modalToClose = modalToCloseParam || openModal; // Default to the currently open modal

        if (!modalToClose) {
            // console.log('[DMM] closeModalHandler: No modal to close, returning.');
            return;
        }

        modalToClose.style.display = 'none';
        modalToClose.removeAttribute('aria-modal');

        if (modalBackdrop) {
            modalBackdrop.style.display = 'none';
        }
        document.body.style.overflow = ''; // Restore body scrolling

        // Accessibility: Restore visibility of background content
        while(hiddenElements.length > 0) {
            const el = hiddenElements.pop();
            el.removeAttribute('aria-hidden');
        }

        modalToClose.removeEventListener('keydown', trapFocusInModal);

        // Restore focus to the last focused element before the modal opened
        if (lastFocusedElement && typeof lastFocusedElement.focus === 'function') {
            lastFocusedElement.focus();
        }

        if (openModal === modalToClose) {
            openModal = null; // Clear the reference if this was the active modal
        }
    }

    /**
     * Traps keyboard focus within the currently open modal.
     * Allows tabbing through focusable elements, wrapping around from last to first and vice-versa.
     * @param {KeyboardEvent} event - The keydown event object.
     */
    function trapFocusInModal(event) {
        if (event.key !== 'Tab' || !openModal) {
            return; // Only act on Tab key presses when a modal is open
        }

        const focusableElements = window.getFocusableElements(openModal);
        if (focusableElements.length === 0) {
            event.preventDefault(); // No focusable elements, prevent tabbing out
            return;
        }

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];
        const currentActiveElement = document.activeElement;

        if (event.shiftKey) { // Shift + Tab (moving backwards)
            if (currentActiveElement === firstElement) {
                lastElement.focus(); // Wrap to the last element
                event.preventDefault();
            }
        } else { // Tab (moving forwards)
            if (currentActiveElement === lastElement) {
                firstElement.focus(); // Wrap to the first element
                event.preventDefault();
            }
        }
    }

    /**
     * Initializes all delegated event listeners for modal interactions.
     * This includes triggers for opening, closing, backdrop clicks, and ESC key.
     */
    function initializeModalEventListeners() {
        // Delegated click listener for all modal interactions
        document.addEventListener('click', (event) => {
            const target = event.target;

            // --- Modal Open Triggers ---
            const openTrigger = target.closest('[data-modal-target]') ||
                                target.closest('.services-navigation .service-nav-item[data-service-target]') ||
                                target.closest('.mobile-services-menu button[data-service-target]');
            if (openTrigger) {
                if (openTrigger.tagName === 'A' && openTrigger.getAttribute('href') === '#') {
                    event.preventDefault(); // Prevent anchor jump for placeholder links
                }
                // Ensure dataset exists and the specific target attributes are present
                const modalId = openTrigger.dataset && (openTrigger.dataset.modalTarget || openTrigger.dataset.serviceTarget);
                if (modalId) {
                    openModalHandler(modalId, openTrigger);
                    event.stopPropagation(); // Stop event from bubbling up, e.g., to a backdrop click

                    // Special case: if opening from mobile services menu, close that menu
                    if (target.closest('.mobile-services-menu button[data-service-target]')) {
                        const mobileMenuPanel = document.getElementById('mobile-services-panel');
                        if (mobileMenuPanel && mobileMenuPanel.classList.contains('open') && window.toggleMobileServicesMenu) {
                            window.toggleMobileServicesMenu(false); // Assumes this function exists
                        }
                    }
                } else {
                    // console.warn('[DMM] Delegated click: Open trigger found, but modalId is missing.', openTrigger);
                }
                return; // Action taken, no need to check other triggers
            }

            // --- Modal Close Triggers (Buttons) ---
            const closeButton = target.closest('[data-close-modal]');
            if (closeButton) {
                // Ensure dataset exists before trying to access its properties
                const modalToCloseId = closeButton.dataset ? closeButton.dataset.closeModal : null;
                let modalToClose = openModal; // Default: close the currently open modal

                if (modalToCloseId) { // If a specific modal ID is provided by the button
                    const specificModal = document.getElementById(modalToCloseId);
                    if (specificModal) {
                        modalToClose = specificModal;
                    } else {
                        // console.warn(`[DMM] Delegated click: Modal with ID "${modalToCloseId}" for data-close-modal not found.`);
                    }
                }

                if (modalToClose) {
                    closeModalHandler(modalToClose, event);
                } else if (!modalToCloseId) { // No specific ID, and no modal was globally open
                     // console.log('[DMM] Delegated click: Close button (general) clicked, but no modal is currently open.');
                }
                return; // Action taken
            }

            // --- Backdrop Click ---
            if (modalBackdrop && target === modalBackdrop && openModal) {
                closeModalHandler(openModal, event);
                return; // Action taken
            }

            // --- Modal Overlay Click (if modal element itself acts as overlay) ---
            if (target.classList.contains('modal-overlay') && openModal && target.id === openModal.id) {
                closeModalHandler(openModal, event);
            }
        });

        // ESC Key to Close Modal
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && openModal) {
                closeModalHandler(openModal, event);
            }
        });
    }

    /**
     * Exposes modal control functions (`openModal`, `closeModal`) on the global `window` object,
     * allowing them to be called from other scripts or inline event handlers if necessary.
     */
    function exposeGlobalAPI() {
        window.openModal = openModalHandler;
        window.closeModal = closeModalHandler;
        // console.log('[ModalManager] Modal manager initialization complete.');
    }

    // --- Initialization Sequence ---
    ensureGlobalGetFocusableElements(); // Define helper if not present
    initializeModalEventListeners();   // Set up all event listeners
    exposeGlobalAPI();                 // Make open/close functions globally available
}

// Wait for the DOM to be fully loaded before initializing the modal manager
document.addEventListener('DOMContentLoaded', initializeDynamicModalManager);
