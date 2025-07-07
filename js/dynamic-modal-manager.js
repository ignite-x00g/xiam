// js/dynamic-modal-manager.js

document.addEventListener('DOMContentLoaded', () => {
    // Assuming qs and qsa are available globally (e.g., from global-app.js)
    // If not, define them here:
    // const qs = (sel, ctx = document) => ctx.querySelector(sel);
    // const qsa = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

    const backdrop = qs('#modal-backdrop');

    async function openModal(modalId, button) { // Accept button element
        const modal = qs('#' + modalId);
        if (!modal) {
            console.warn(`Modal with ID "${modalId}" not found.`);
            return;
        }

        const modalSource = button ? button.dataset.modalSource : null;

        if (modalSource) {
            try {
                const response = await fetch(modalSource);
                if (!response.ok) {
                    throw new Error(`Failed to fetch modal content from ${modalSource}: ${response.status} ${response.statusText}`);
                }
                const content = await response.text();
                const modalBody = modal.querySelector('.modal-body');
                if (modalBody) {
                    modalBody.innerHTML = content;
                } else {
                    console.warn(`Modal with ID "${modalId}" does not have a .modal-body element to inject content into.`);
                    // Fallback: inject into modal directly if no .modal-body, though this is less ideal.
                    // modal.innerHTML = content; // This would overwrite header/close buttons if not careful
                }
            } catch (error) {
                console.error(`Error loading modal content for ${modalId} from ${modalSource}:`, error);
                const modalBody = modal.querySelector('.modal-body');
                if (modalBody) {
                    modalBody.innerHTML = `<p>Error loading content. Please try again later.</p>`;
                }
                // Optionally, don't open the modal if content fails to load, or open with error.
                // For now, we'll proceed to open it with the error message.
            }
        }

        // Activate and display the modal
        modal.classList.add('active');
        modal.style.display = 'flex'; // Or 'block' depending on modal styling
        if (backdrop) backdrop.style.display = 'block';

        // Re-apply translations if global function exists, useful for dynamically loaded content
        if (window.applyTranslations && window.getCurrentLanguage) {
            setTimeout(() => { // Timeout to ensure content is in DOM
                window.applyTranslations(window.getCurrentLanguage(), modal);
            }, 0);
        }
    }

    function closeModal(modalElementOrId) {
        let modalToClose;
        if (typeof modalElementOrId === 'string') {
            modalToClose = qs('#' + modalElementOrId);
        } else if (modalElementOrId instanceof HTMLElement) {
            modalToClose = modalElementOrId;
        }

        if (modalToClose && modalToClose.classList.contains('active')) {
            modalToClose.classList.remove('active');
            modalToClose.style.display = 'none';
            // Check if any other modals are active before hiding backdrop
            if (!qs('.modal-overlay.active')) {
                if (backdrop) backdrop.style.display = 'none';
            }
        }
    }

    // Handle opening/toggling modals via data-modal-target
    qsa('[data-modal-target]').forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            const modalId = button.dataset.modalTarget;
            const modal = qs('#' + modalId); // qs is assumed to be defined globally

            if (modal) {
                if (modal.classList.contains('active')) {
                    // If the modal is already active, close it
                    closeModal(modal); // closeModal can take an element or ID
                } else {
                    // Otherwise, open it
                    // Potentially, ensure other modals are closed before opening a new one, if that's desired behavior.
                    // For now, just opening the targeted one.
                    openModal(modalId, button); // Pass the button element
                }
            } else {
                console.warn(`Modal with ID "${modalId}" not found when toggling.`);
            }
        });
    });

    // Handle closing modals via data-close-modal
    qsa('[data-close-modal]').forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            const modalId = button.dataset.closeModal;
            if (modalId) {
                closeModal(modalId);
            } else { // Fallback for buttons inside a modal without specific target
                const closestModal = button.closest('.modal-overlay');
                if (closestModal) {
                    closeModal(closestModal);
                }
            }
        });
    });
    // Close modal on window click outside (on the backdrop or overlay itself)
    window.addEventListener('click', e => {
        if (e.target.classList.contains('modal-overlay') && e.target.classList.contains('active')) {
            closeModal(e.target);
        } else if (backdrop && e.target === backdrop && qs('.modal-overlay.active')) {
            // If backdrop is clicked and a modal is active, close all active modals.
            qsa('.modal-overlay.active').forEach(activeModal => closeModal(activeModal));
        }
    });

    // Close modal on Escape key
    window.addEventListener('keydown', e => {
        if (e.key === 'Escape') {
            qsa('.modal-overlay.active').forEach(activeModal => closeModal(activeModal));
        }
    });

    // Removed specific JS for old #chatbot-fab-trigger and #chatbot-placeholder.
    // The new #fab-chatbot and other chat links use data-modal-target="chatbot-modal",
    // which is handled by the generic modal opening logic above.
});
