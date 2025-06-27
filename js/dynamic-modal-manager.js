// js/dynamic-modal-manager.js

/**
 * @file Manages dynamic modals, including opening, closing, focus trapping,
 * ARIA attribute handling, and global API exposure.
 * @version 1.1.0
 *
 * Improvements in this version:
 * - Enhanced JSDoc comments for better code understanding.
 * - Added a `DMM_PREFIX` for console messages for easier debugging.
 * - Defined `FOCUSABLE_SELECTOR` as a constant.
 * - Renamed internal `getFocusableElements` to `getFocusableElementsInContext` for clarity.
 * - `ensureGlobalGetFocusableElements` now assigns the internal context-aware function.
 * - `openModalHandler`:
 *    - Default `triggerElement` to `document.activeElement`.
 *    - When chaining modal closes (opening a new one while another is open), an internal option `{ isChainedCall: true }`
 *      is passed to `closeModalHandler` to prevent premature focus restoration.
 *    - Ensures `aria-hidden` is removed from the modal itself when opened.
 *    - More robust error handling during display, reverting all changes (including aria-hidden on background elements).
 *    - Checks for `window.applyTranslations` and `window.getCurrentLanguage` existence before calling.
 * - `closeModalHandler`:
 *    - Accepts an `options` object, specifically `isChainedCall`, to control focus restoration.
 *    - Reliably removes `tabindex="-1"` if it was added by the script *only if* no other focusable elements exist within the modal.
 *    - More robust focus restoration: checks if `lastFocusedElement` is still in the DOM and visible.
 *    - Efficiently clears `hiddenElements` array using `length = 0`.
 * - `trapFocusInModal`:
 *    - Improved logic for when modal itself is focused (e.g., via `tabindex="-1"`) and contains no other focusable elements.
 * - `initializeModalEventListeners`:
 *    - Removed `event.stopPropagation()` from open trigger handling as it can have unintended side effects;
 *      alternative solutions should be used if click propagation is an issue for specific layouts.
 *    - Added check for `window.toggleMobileServicesMenu` existence.
 *    - Slightly more robust handling in close button logic if `modalToCloseId` is provided but modal not found.
 * - `exposeGlobalAPI`:
 *    - Warns if `window.openModal` or `window.closeModal` are already defined before overwriting.
 * - `initializeDynamicModalManager` (main function):
 *    - Added warning if `modalBackdrop` element is not found.
 *    - Removed commented-out `console.log` statements, keeping essential warnings/errors.
 */
function initializeDynamicModalManager() {
    const DMM_PREFIX = '[DMM]'; // For console messages

    // --- DOM Elements & State ---
    const modalBackdrop = document.getElementById('modal-backdrop');
    let openModal = null; // Tracks the currently active modal element
    let lastFocusedElement = null; // Stores the element that had focus before modal opened
    const hiddenElements = []; // Stores elements that were hidden with aria-hidden

    // --- Constants ---
    const FOCUSABLE_SELECTOR = 'a[href]:not([disabled]), button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

    // --- Helper Functions ---

    /**
     * Retrieves focusable elements within a given parent element.
     * Filters for elements that are visible and interactive.
     * @param {HTMLElement} parentElement - The element to search within.
     * @returns {HTMLElement[]} An array of focusable HTML elements.
     */
    function getFocusableElementsInContext(parentElement) {
        if (!parentElement) {
            // This case should ideally not be reached if checks are done prior to calling.
            console.warn(`${DMM_PREFIX} getFocusableElementsInContext: parentElement is null or undefined.`);
            return [];
        }
        try {
            const elements = Array.from(parentElement.querySelectorAll(FOCUSABLE_SELECTOR));
            return elements.filter(el => {
                const computedStyle = window.getComputedStyle(el);
                return el.offsetParent !== null && // Element is part of the layout
                       computedStyle.visibility !== 'hidden' &&
                       computedStyle.display !== 'none';
            });
        } catch (e) {
            console.error(`${DMM_PREFIX} Error in getFocusableElementsInContext for parent:`, parentElement, e);
            return [];
        }
    }

    /**
     * Ensures `window.getFocusableElements` is available globally.
     * If not already defined by another script, it assigns `getFocusableElementsInContext`.
     * This provides a consistent API for other scripts that might expect this global function.
     * @private
     */
    function ensureGlobalGetFocusableElements() {
        if (typeof window.getFocusableElements !== 'function') {
            window.getFocusableElements = getFocusableElementsInContext;
        }
    }


    // --- Core Modal Logic ---

    /**
     * Opens a modal dialog by its ID.
     * Manages focus, displays the modal and backdrop, updates ARIA attributes,
     * and prevents body scrolling.
     * @param {string} modalId - The ID of the modal HTML element to open.
     * @param {HTMLElement} [triggerElement=document.activeElement] - The element that triggered the modal opening; used to restore focus.
     * @public
     */
    function openModalHandler(modalId, triggerElement = document.activeElement) {
        if (!modalId) {
            console.error(`${DMM_PREFIX} openModalHandler: modalId was not provided.`);
            return;
        }
        const modal = document.getElementById(modalId);
        if (!modal) {
            console.error(`${DMM_PREFIX} Modal with ID "${modalId}" not found.`);
            return;
        }

        // If another modal is already open, close it first.
        // Pass an option to prevent focus restoration since a new modal is opening immediately.
        if (openModal && openModal !== modal) {
            closeModalHandler(openModal, null, { isChainedCall: true });
        }

        lastFocusedElement = triggerElement;

        try {
            if (typeof modal.style === 'undefined') {
                console.error(`${DMM_PREFIX} Modal element for ID "${modalId}" is invalid (no style property). Cannot display.`);
                return;
            }

            modal.style.display = 'flex'; // Use 'flex' for modern centering; adjust if CSS expects 'block'
            modal.style.visibility = 'visible';
            modal.style.opacity = '1';
            modal.setAttribute('aria-modal', 'true');
            modal.removeAttribute('aria-hidden'); // Ensure modal itself is not hidden

            // Accessibility checks (non-blocking warnings)
            if (!modal.getAttribute('role') || !['dialog', 'alertdialog'].includes(modal.getAttribute('role'))) {
                console.warn(`${DMM_PREFIX} Accessibility: Modal #${modal.id} should have a role of 'dialog' or 'alertdialog'.`);
            }
            if (!modal.getAttribute('aria-labelledby') && !modal.getAttribute('aria-label')) {
                console.warn(`${DMM_PREFIX} Accessibility: Modal #${modal.id} should have an accessible name via 'aria-labelledby' or 'aria-label'.`);
            }

            if (modalBackdrop) {
                modalBackdrop.style.display = 'block';
                modalBackdrop.style.visibility = 'visible';
                modalBackdrop.style.opacity = '1'; // Assuming backdrop also uses opacity for transitions/visibility
            }
            document.body.style.overflow = 'hidden'; // Prevent scrolling of the page content

            // Accessibility: Hide background content from assistive technologies
            // Clear previous hidden elements first to handle chained modal calls correctly
            hiddenElements.forEach(el => el.removeAttribute('aria-hidden'));
            hiddenElements.length = 0;

            Array.from(document.body.children).forEach(child => {
                if (child !== modal && child !== modalBackdrop && child.tagName !== 'SCRIPT' && child.tagName !== 'STYLE') {
                    if (child.getAttribute('aria-hidden') !== 'true') {
                        child.setAttribute('aria-hidden', 'true');
                        hiddenElements.push(child);
                    }
                }
            });

            // Defer focus logic to allow the browser to complete rendering updates
            setTimeout(() => {
                try {
                    const focusableElements = getFocusableElementsInContext(modal);
                    if (focusableElements.length > 0) {
                        focusableElements[0].focus();
                    } else {
                        // If no interactive elements, make the modal itself focusable and focus it.
                        modal.setAttribute('tabindex', '-1');
                        modal.focus();
                    }
                } catch (e) {
                    console.error(`${DMM_PREFIX} Error during modal "${modalId}" focus setup (setTimeout):`, e);
                }
            }, 0); // Zero delay setTimeout executes after current rendering pass

        } catch (e) {
            console.error(`${DMM_PREFIX} Error during modal "${modalId}" display (before setTimeout):`, e);
            // Attempt to revert style and ARIA changes in case of an error
            modal.style.display = 'none';
            modal.removeAttribute('aria-modal');
            if (modalBackdrop) modalBackdrop.style.display = 'none';
            document.body.style.overflow = '';
            hiddenElements.forEach(el => el.removeAttribute('aria-hidden'));
            hiddenElements.length = 0;
            return; // Stop further execution
        }

        openModal = modal; // Set the currently open modal
        modal.addEventListener('keydown', trapFocusInModal); // Add focus trapping

        // Apply translations if global translation functions are available
        if (typeof window.applyTranslations === 'function' && typeof window.getCurrentLanguage === 'function') {
            try {
                window.applyTranslations(window.getCurrentLanguage());
            } catch (e) {
                console.error(`${DMM_PREFIX} Error applying translations for modal "${modalId}":`, e);
            }
        }
    }

    /**
     * Closes the specified modal or the currently open one.
     * Restores focus to the element that had focus before the modal was opened,
     * unless this close is part of a chained modal operation.
     * @param {HTMLElement} [modalToCloseParam=openModal] - The modal element to close. Defaults to the currently open modal.
     * @param {Event} [sourceEvent=null] - The event that triggered the close (for context or logging).
     * @param {object} [options={}] - Internal options for controlling behavior.
     * @param {boolean} [options.isChainedCall=false] - If true, indicates this close is immediately followed by opening another modal, so focus restoration is skipped.
     * @public
     */
    function closeModalHandler(modalToCloseParam, sourceEvent = null, options = {}) {
        const modalToClose = modalToCloseParam || openModal;

        if (!modalToClose) {
            return;
        }

        modalToClose.style.display = 'none';
        modalToClose.removeAttribute('aria-modal');

        // Remove tabindex if it was added by this script for a modal with no other focusable elements.
        // This check ensures we only remove tabindex if we likely added it.
        if (modalToClose.getAttribute('tabindex') === '-1') {
            const focusableInModal = getFocusableElementsInContext(modalToClose);
            if (focusableInModal.length === 0) {
                modalToClose.removeAttribute('tabindex');
            }
        }

        if (modalBackdrop) {
            modalBackdrop.style.display = 'none';
        }
        document.body.style.overflow = ''; // Restore body scrolling

        // Accessibility: Restore visibility of background content
        hiddenElements.forEach(el => el.removeAttribute('aria-hidden'));
        hiddenElements.length = 0; // Efficiently clear the array

        modalToClose.removeEventListener('keydown', trapFocusInModal);

        // Restore focus to the last focused element, unless this is a chained call
        if (!options.isChainedCall && lastFocusedElement && typeof lastFocusedElement.focus === 'function') {
            // Check if lastFocusedElement is still part of the document and visible/focusable
            if (document.body.contains(lastFocusedElement) && lastFocusedElement.offsetParent !== null) {
                lastFocusedElement.focus();
            } else {
                // Fallback focus to body or a known safe element if lastFocusedElement is gone.
                document.body.focus();
            }
        }

        if (openModal === modalToClose) {
            openModal = null; // Clear the reference if this was the active modal
        }
    }

    /**
     * Traps keyboard focus (Tab key) within the currently open modal.
     * Allows tabbing through focusable elements, wrapping around from last to first and vice-versa.
     * @param {KeyboardEvent} event - The keydown event object.
     * @private
     */
    function trapFocusInModal(event) {
        if (event.key !== 'Tab' || !openModal) {
            return; // Only act on Tab key presses when a modal is open
        }

        const focusableElements = getFocusableElementsInContext(openModal);
        const currentActiveElement = document.activeElement;

        if (focusableElements.length === 0) {
            // If there are no focusable elements, but the modal itself might be focused (e.g., via tabindex="-1").
            // Prevent tabbing out of the modal container.
            if (openModal.contains(currentActiveElement) || currentActiveElement === openModal) {
                 event.preventDefault();
            }
            return;
        }

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (event.shiftKey) { // Shift + Tab (moving backwards)
            // If focus is on the first element or the modal container itself (when it's the only focus target)
            if (currentActiveElement === firstElement || currentActiveElement === openModal) {
                lastElement.focus(); // Wrap to the last element
                event.preventDefault();
            }
        } else { // Tab (moving forwards)
            // If focus is on the last element or the modal container itself (when it's the only focus target)
            if (currentActiveElement === lastElement || (currentActiveElement === openModal && !focusableElements.includes(currentActiveElement))) {
                firstElement.focus(); // Wrap to the first element
                event.preventDefault();
            }
        }
    }


    // --- Event Listener Initialization ---

    /**
     * Initializes all delegated event listeners for modal interactions.
     * This includes triggers for opening, closing, backdrop clicks, and ESC key.
     * @private
     */
    function initializeModalEventListeners() {
        document.addEventListener('click', (event) => {
            const target = event.target;

            // --- Modal Open Triggers ---
            // Combined selector for various types of open triggers
            const openTrigger = target.closest('[data-modal-target], .services-navigation .service-nav-item[data-service-target], .mobile-services-menu button[data-service-target]');
            if (openTrigger) {
                if (openTrigger.tagName === 'A' && openTrigger.getAttribute('href') === '#') {
                    event.preventDefault(); // Prevent anchor jump for placeholder links
                }
                const modalId = openTrigger.dataset.modalTarget || openTrigger.dataset.serviceTarget;
                if (modalId) {
                    openModalHandler(modalId, openTrigger);
                    // Note: Deliberately avoiding event.stopPropagation() here unless a clear need arises.
                    // It can sometimes interfere with other global listeners or analytics.

                    // Special case: if opening from mobile services menu, attempt to close that menu
                    if (target.closest('.mobile-services-menu button[data-service-target]')) {
                        const mobileMenuPanel = document.getElementById('mobile-services-panel');
                        if (mobileMenuPanel && mobileMenuPanel.classList.contains('open')) {
                            if (typeof window.toggleMobileServicesMenu === 'function') {
                                window.toggleMobileServicesMenu(false);
                            } else {
                                console.warn(`${DMM_PREFIX} window.toggleMobileServicesMenu function not found, cannot close mobile services menu.`);
                            }
                        }
                    }
                } else {
                    console.warn(`${DMM_PREFIX} Delegated click: Open trigger found, but modalId (data-modal-target or data-service-target) is missing. Trigger:`, openTrigger);
                }
                return; // Action taken for opening modal
            }

            // --- Modal Close Triggers (Buttons) ---
            const closeButton = target.closest('[data-close-modal]');
            if (closeButton) {
                const modalToCloseId = closeButton.dataset.closeModal; // Can be empty for a generic close button for the active modal
                let modalToCloseInstance = openModal; // Default to closing the currently active modal

                if (modalToCloseId) { // If a specific modal ID is provided by the button
                    const specificModal = document.getElementById(modalToCloseId);
                    if (specificModal) {
                        modalToCloseInstance = specificModal;
                    } else {
                        console.warn(`${DMM_PREFIX} Delegated click: Modal with ID "${modalToCloseId}" for data-close-modal not found. Will attempt to close the currently active modal if any.`);
                        // If specific modal not found, modalToCloseInstance remains `openModal` (or null if none are open)
                    }
                }

                if (modalToCloseInstance) {
                    closeModalHandler(modalToCloseInstance, event);
                } else if (!modalToCloseId) {
                    // This case implies: no specific modal ID on button, AND no modal is currently open.
                    // No action needed if no modal to close.
                }
                return; // Action taken for closing modal
            }

            // --- Backdrop Click to Close ---
            if (modalBackdrop && target === modalBackdrop && openModal) {
                closeModalHandler(openModal, event);
                return; // Action taken
            }

            // --- Modal Overlay Click to Close (if modal element itself acts as overlay/backdrop) ---
            // This handles cases where the modal container itself is clicked, not its content.
            if (target.classList.contains('modal-overlay') && openModal && target.id === openModal.id) {
                // Check if the click was directly on the overlay (e.target === overlay).
                // The current check `target.id === openModal.id` implies that `target` is the modal element itself.
                closeModalHandler(openModal, event);
            }
        });

        // --- ESC Key to Close Modal ---
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && openModal) {
                closeModalHandler(openModal, event);
            }
        });
    }

    // --- Global API Exposure ---

    /**
     * Exposes `openModal` and `closeModal` functions on the global `window` object.
     * Warns if these properties are already defined by other scripts.
     * @global
     * @private
     */
    function exposeGlobalAPI() {
        const functionsToExpose = {
            openModal: openModalHandler,
            closeModal: closeModalHandler
        };

        for (const funcName in functionsToExpose) {
            if (Object.prototype.hasOwnProperty.call(functionsToExpose, funcName)) {
                if (typeof window[funcName] !== 'undefined' && window[funcName] !== functionsToExpose[funcName]) {
                    console.warn(`${DMM_PREFIX} window.${funcName} is already defined and will be overwritten by Dynamic Modal Manager.`);
                }
                window[funcName] = functionsToExpose[funcName];
            }
        }
    }

    // --- Initialization Sequence ---
    if (!modalBackdrop) {
        console.warn(`${DMM_PREFIX} Modal backdrop element (#modal-backdrop) not found. Backdrop click-to-close and visual overlay might not function as expected.`);
    }

    ensureGlobalGetFocusableElements(); // Define or confirm global getFocusableElements helper
    initializeModalEventListeners();    // Set up all event listeners
    exposeGlobalAPI();                  // Make open/close functions globally available
}

// Wait for the DOM to be fully loaded before initializing the modal manager
document.addEventListener('DOMContentLoaded', initializeDynamicModalManager);
