// js/dynamic-modal-manager.js

document.addEventListener('DOMContentLoaded', () => {
    // Assuming qs and qsa are available globally (e.g., from global-app.js)
    // If not, define them here:
    // const qs = (sel, ctx = document) => ctx.querySelector(sel);
    // const qsa = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

    const backdrop = qs('#modal-backdrop');

    function openModal(modalId) {
        const modal = qs('#' + modalId);
        if (modal) {
            // TODO: Implement dynamic content loading if modal-source is present
            // const source = button.dataset.modalSource; (if button is passed)
            // For now, just activating the modal.
            modal.classList.add('active');
            modal.style.display = 'flex'; // Or 'block' depending on modal styling
            if (backdrop) backdrop.style.display = 'block';
        } else {
            console.warn(`Modal with ID "${modalId}" not found.`);
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
                    openModal(modalId);
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
