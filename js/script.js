document.addEventListener('DOMContentLoaded', () => {
    const modalContainerMain = document.getElementById('modal-container-main');

    // --- "Join Us" Modal Specific Functionality ---
    const fabJoinButton = document.getElementById('fab-join');
    const joinModal = document.getElementById('join-modal'); // This is the specific modal panel
    const joinModalCloseButton = joinModal ? joinModal.querySelector('.close-modal') : null;

    // Store the reference to the keydown listener for joinModal focus trapping
    // so it can be removed when the modal is closed.
    let joinModalKeydownListener = null;

    if (fabJoinButton && joinModal && modalContainerMain) {
        fabJoinButton.addEventListener('click', () => {
            joinModal.triggerElement = document.activeElement; // Store trigger element

            modalContainerMain.style.display = 'flex'; // Show the main container
            joinModal.style.display = 'block'; // Show the specific "Join Us" modal panel
            document.body.style.overflow = 'hidden';

            joinModal.setAttribute('tabindex', '-1'); // Ensure modal can be focused if no focusable elements

            const focusableElements = window.getFocusableElements(joinModal);
            if (focusableElements.length > 0) {
                focusableElements[0].focus();
            } else {
                joinModal.focus(); // Fallback to modal itself
            }

            // Add focus trapping
            if (joinModalKeydownListener) { // Remove any old listener first
                joinModal.removeEventListener('keydown', joinModalKeydownListener);
            }
            joinModalKeydownListener = (event) => {
                if (event.key === 'Tab') {
                    const currentFocusableElements = window.getFocusableElements(joinModal);
                    if (currentFocusableElements.length === 0) {
                        event.preventDefault();
                        return;
                    }
                    const firstElement = currentFocusableElements[0];
                    const lastElement = currentFocusableElements[currentFocusableElements.length - 1];

                    if (event.shiftKey && document.activeElement === firstElement) {
                        event.preventDefault();
                        lastElement.focus();
                    } else if (!event.shiftKey && document.activeElement === lastElement) {
                        event.preventDefault();
                        firstElement.focus();
                    }
                }
            };
            joinModal.addEventListener('keydown', joinModalKeydownListener);
            // Make it accessible for global escape handler in dynamic-modal-manager.js
            joinModal.modalKeydownListener = joinModalKeydownListener;
        });
    }

    if (joinModalCloseButton && joinModal && modalContainerMain) {
        joinModalCloseButton.addEventListener('click', () => {
            joinModal.style.display = 'none'; // Hide the specific "Join Us" modal panel
            document.body.style.overflow = '';

            if (joinModal.modalKeydownListener) { // Use the consistent property name
                joinModal.removeEventListener('keydown', joinModal.modalKeydownListener);
                joinModal.modalKeydownListener = null; // Clear it
                joinModalKeydownListener = null; // Also clear the local variable if used elsewhere
            }

            if (joinModal.triggerElement && typeof joinModal.triggerElement.focus === 'function') {
                joinModal.triggerElement.focus();
            }

            // Check if other modals are visible in the container
            const otherModals = modalContainerMain.querySelectorAll('.opslight-service-modal:not(#join-modal)');
            let isOtherModalVisible = false;
            otherModals.forEach(modal => {
                // Check the computed style or if style.display is explicitly set to something other than 'none'
                if (modal.style.display && modal.style.display !== 'none') {
                    isOtherModalVisible = true;
                }
            });

            // If no other modals are visible, hide the main container
            if (!isOtherModalVisible) {
                modalContainerMain.style.display = 'none';
            }
        });
    }

    // --- "Join Us" Modal - Internal Dropdown Functionality ---

    const setupDropdownToggle = (toggleButtonId, contentElementId, doneButtonId) => {
        const toggleButton = document.getElementById(toggleButtonId);
        const contentElement = document.getElementById(contentElementId);
        const doneButton = doneButtonId ? document.getElementById(doneButtonId) : null;

        if (toggleButton && contentElement) {
            // Set initial state based on CSS or explicitly hide
            contentElement.style.display = 'none'; // Ensure it's hidden initially
            toggleButton.setAttribute('aria-expanded', 'false');

            toggleButton.addEventListener('click', (e) => {
                e.preventDefault(); // Prevent any default action if it's a button in a form
                const isExpanded = contentElement.style.display === 'block' || contentElement.style.display === 'grid' || contentElement.style.display === 'flex';
                contentElement.style.display = isExpanded ? 'none' : 'block'; // Basic toggle, consider specific display types if needed
                toggleButton.setAttribute('aria-expanded', String(!isExpanded));
            });

            if (doneButton) {
                doneButton.addEventListener('click', (e) => {
                    e.preventDefault();
                    contentElement.style.display = 'none';
                    toggleButton.setAttribute('aria-expanded', 'false');
                });
            }
        }
    };

    // Employment Type Dropdown (in "Join Us" modal)
    setupDropdownToggle('employment-type-toggle', 'employment-type-checkboxes', 'employment-done');

    // Areas of Interest Dropdown (in "Join Us" modal)
    setupDropdownToggle('join-areas-trigger', 'join-areas-options', 'areas-done');


    // --- Form Submission Handling (Basic) ---
    // Specific to #join-modal
    const joinForm = document.getElementById('join-form');
    if (joinForm) {
        joinForm.addEventListener('submit', (event) => {
            event.preventDefault();
            console.log('Join form submitted (data prevented from sending)');
            // Optionally, close the modal after submission attempt
            // const modalToClose = document.getElementById('join-modal'); // Or joinForm.closest('.modal')
            // if (modalToClose) {
            //      modalToClose.style.display = 'none';
            //      document.body.style.overflow = '';
            // }
        });
    }

    // Note: contactForm logic is removed as per unifying modal handling.
    // If 'contact-form' is part of a dynamic modal from glow-effects.js, its submission
    // and closing logic will be handled there or as part of that dynamic modal's lifecycle.
    // const contactForm = document.getElementById('contact-form');
    // if (contactForm) {
    //     contactForm.addEventListener('submit', (event) => {
    //         event.preventDefault();
    //         console.log('Contact form submitted (data prevented from sending)');
    //         const modal = contactForm.closest('.modal-overlay');
    //         if (modal) {
    //             modal.style.display = 'none';
    //             document.body.style.overflow = '';
    //         }
    //     });
    // }

});
