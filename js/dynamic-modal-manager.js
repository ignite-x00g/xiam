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

    // Handle opening modals via data-modal-target
    qsa('[data-modal-target]').forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault(); // Prevent default action if it's an <a> or <button type="submit">
            const modalId = button.dataset.modalTarget;
            openModal(modalId);
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

    // Chatbot specific trigger (placeholder toggle)
    // loader.js is expected to handle the iframe and more complex interactions.
    // This is a basic show/hide for the placeholder div.
    const chatbotFabTrigger = qs('#chatbot-fab-trigger');
    const chatbotPlaceholder = qs('#chatbot-placeholder');

    if (chatbotFabTrigger && chatbotPlaceholder) {
        chatbotFabTrigger.addEventListener('click', (e) => {
            e.preventDefault();
            chatbotPlaceholder.classList.add('active');
            chatbotPlaceholder.style.display = 'flex'; // Ensure it's visible
            // Potentially hide FAB via JS if :has selector isn't supported/reliable
            // chatbotFabTrigger.style.display = 'none';
        });
    }

    // Attempt to find a close button that might be injected by loader.js
    // This is speculative as loader.js controls the placeholder's content.
    // A more robust way would be for loader.js to dispatch an event or provide a callback.
    if (chatbotPlaceholder) {
        // This assumes a close button with class 'chatbot-placeholder-close-btn' might be added inside placeholder
        chatbotPlaceholder.addEventListener('click', (e) => {
            if (e.target.matches('.chatbot-placeholder-close-btn')) {
                chatbotPlaceholder.classList.remove('active');
                chatbotPlaceholder.style.display = 'none';
                // Potentially show FAB again via JS
                // if (chatbotFabTrigger) chatbotFabTrigger.style.display = 'flex';
            }
        });
    }
});
