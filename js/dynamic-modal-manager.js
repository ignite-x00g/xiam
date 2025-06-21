// Helper function to get focusable elements
function getFocusableElements(parentElement) {
    if (!parentElement) return [];
    return Array.from(
        parentElement.querySelectorAll(
            'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
        )
    ).filter(el => el.offsetParent !== null && !el.closest('[style*="display: none"]')); // Ensure elements are visible and not within a hidden parent
}
window.getFocusableElements = getFocusableElements; // Make it globally available

// Variable to store the trigger of the last opened dynamic modal for Escape key restoration
let lastOpenedDynamicModalTrigger = null;

// OpsLight Interactive Tiles - Multi-Modal Interaction (NEW)
document.addEventListener('DOMContentLoaded', () => {
    const modalContainerMain = document.getElementById('modal-container-main');
    const serviceNavItems = document.querySelectorAll('.service-nav-item'); // UPDATED selector

    // serviceModalContent object is now removed, content will be fetched via window.getTranslatedText

    if (!modalContainerMain) {
        console.warn('Modal container #modal-container-main not found.');
    }

    function hideModal(modalElement) {
        if (!modalElement) return;
        modalElement.style.display = 'none';
        // If this modal had a specific keydown listener, remove it
        if (modalElement.modalKeydownListener) {
            modalElement.removeEventListener('keydown', modalElement.modalKeydownListener);
            // delete modalElement.modalKeydownListener; // Optional: clean up property
        }
        // Restore focus
        if (modalElement.triggerElement && typeof modalElement.triggerElement.focus === 'function') {
            modalElement.triggerElement.focus();
        }
        // Check if all modals are hidden to hide the main container
        let allHidden = true;
        if (modalContainerMain && modalContainerMain.children.length > 0) {
            for (let i = 0; i < modalContainerMain.children.length; i++) {
                if (modalContainerMain.children[i].style.display !== 'none') {
                    allHidden = false;
                    break;
                }
            }
        }
        if (allHidden && modalContainerMain) {
            modalContainerMain.style.display = 'none';
            document.body.style.overflow = '';
            lastOpenedDynamicModalTrigger = null; // Reset since all dynamic modals are effectively closed
        }
    }

    if (serviceNavItems.length > 0 && modalContainerMain) { // UPDATED variable name
        serviceNavItems.forEach(card => { // UPDATED variable name
            card.addEventListener('click', (event) => { // Added event parameter
                event.preventDefault(); // Prevent default anchor behavior
                const serviceKey = card.dataset.serviceTarget;

                let translationKeyPrefix = '';
                if (serviceKey === "Business Ops") translationKeyPrefix = "modal.businessOps";
                else if (serviceKey === "Contact Center") translationKeyPrefix = "modal.contactCenter";
                else if (serviceKey === "IT Support") translationKeyPrefix = "modal.itSupport";
                else if (serviceKey === "Professionals") translationKeyPrefix = "modal.professionals";
                else {
                    console.warn(`Unknown service key: ${serviceKey}`);
                    return; // Do not proceed if key is unknown
                }

                const title = window.getTranslatedText ? window.getTranslatedText(`${translationKeyPrefix}.title`) : serviceKey; // Fallback to serviceKey if function not ready
                const description = window.getTranslatedText ? window.getTranslatedText(`${translationKeyPrefix}.description`) : "Description unavailable.";

                // Check if modal for this service already exists
                let modalInstance = modalContainerMain.querySelector(`.standard-modal[data-service="${serviceKey}"]`);
                if (modalInstance) {
                    // If it exists but is hidden, just show it
                    if (modalInstance.style.display === 'none') {
                        modalInstance.style.display = 'flex';
                        modalContainerMain.style.display = 'flex'; // Ensure container is visible
                        document.body.style.overflow = 'hidden'; // Prevent background scrolling

                        const focusableElements = window.getFocusableElements(modalInstance);
                        if (focusableElements.length > 0) {
                            focusableElements[0].focus();
                        } else {
                            modalInstance.focus();
                        }
                        // Re-attach keydown listener if needed, or ensure it's managed by hideModal
                        if (modalInstance.modalKeydownListener) {
                             modalInstance.addEventListener('keydown', modalInstance.modalKeydownListener);
                        }
                        lastOpenedDynamicModalTrigger = document.activeElement || card;
                        modalInstance.triggerElement = lastOpenedDynamicModalTrigger;

                    }
                    return; // Already exists and possibly shown, so exit
                }


                // Create modal element
                modalInstance = document.createElement('div');
                modalInstance.className = 'standard-modal opslight-service-modal'; // Updated class
                modalInstance.setAttribute('data-service', serviceKey);
                modalInstance.setAttribute('role', 'dialog');
                modalInstance.setAttribute('aria-modal', 'true');
                modalInstance.style.display = 'none'; // Start hidden, show after setup

                const titleId = `modal-title-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

                modalInstance.innerHTML = `
                    <div class="standard-modal-overlay" data-modal-close></div>
                    <div class="standard-modal-dialog" role="document">
                        <header class="standard-modal-header">
                            <h2 class="standard-modal-title" id="${titleId}">${title}</h2>
                            <button class="standard-modal-close" aria-label="Close modal" data-modal-close>&times;</button>
                        </header>
                        <section class="standard-modal-content">
                            <p>${description}</p>
                        </section>
                        <footer class="standard-modal-footer">
                            <button class="button-secondary" data-modal-close>Close</button>
                        </footer>
                    </div>
                `;

                modalInstance.setAttribute('aria-labelledby', titleId);
                modalInstance.setAttribute('tabindex', '-1'); // For programmatic focus

                const triggerElement = document.activeElement || card; // Fallback to card if no activeElement
                modalInstance.triggerElement = triggerElement; // Store for focus restoration
                lastOpenedDynamicModalTrigger = triggerElement; // For Escape key

                // Append to container
                modalContainerMain.appendChild(modalInstance);

                // Show the modal and container
                modalInstance.style.display = 'flex';
                modalContainerMain.style.display = 'flex';
                document.body.style.overflow = 'hidden'; // Prevent background scrolling


                const focusableElements = window.getFocusableElements(modalInstance);
                if (focusableElements.length > 0) {
                    focusableElements[0].focus();
                } else {
                    modalInstance.focus();
                }

                const modalKeydownListener = (event) => {
                    if (event.key === 'Tab') {
                        const currentFocusableElements = window.getFocusableElements(modalInstance.querySelector('.standard-modal-dialog')); // Search within dialog
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
                    // Escape key will be handled by the global listener or hideModal if specific
                };
                modalInstance.addEventListener('keydown', modalKeydownListener);
                modalInstance.modalKeydownListener = modalKeydownListener; // Store reference for removal

                // Delegated click listener for close actions
                modalInstance.addEventListener('click', function(event) {
                    if (event.target.closest('[data-modal-close]')) {
                        hideModal(this); // 'this' refers to modalInstance
                    }
                });
            });
        });

        // Event listener for backdrop click (to close all modals)
        modalContainerMain.addEventListener('click', (event) => {
            if (event.target === modalContainerMain) { // Clicked on the backdrop itself
                for (let i = 0; i < modalContainerMain.children.length; i++) {
                    const childModal = modalContainerMain.children[i];
                    if (childModal.style.display === 'flex' || childModal.style.display === '') { // Check if visible
                        hideModal(childModal);
                    }
                }
                // hideModal will handle hiding modalContainerMain if all children are hidden.
            }
        });

    } else {
        if (serviceNavItems.length === 0) console.warn('No service nav items with class .service-nav-item found.'); // UPDATED warning
    }

    // FAB Modal Interaction Logic
    const fabJoin = document.getElementById('fab-join');
    const fabContact = document.getElementById('fab-contact');
    const fabChatbot = document.getElementById('fab-chatbot');
    // modalContainerMain is already defined from service card modals.

    // fabModalContent object is now removed, content will be fetched via window.getTranslatedText

    const fabs = [fabJoin, fabContact, fabChatbot];

    fabs.forEach(fab => {
        if (fab) {
            fab.addEventListener('click', () => {
                const fabId = fab.id;

                // The "fab-join" case is now handled by js/script.js for the existing #join-modal.
                // So, we only process other FABs here for dynamic modal creation.
                if (fabId === "fab-join") {
                    // Do nothing here, it's handled by script.js
                    return;
                }

                let fabTranslationKeyPrefix = '';
                // if (fabId === "fab-join") fabTranslationKeyPrefix = "modal.fabJoin"; // This line is effectively removed by the check above
                if (fabId === "fab-contact") fabTranslationKeyPrefix = "modal.fabContact";
                else if (fabId === "fab-chatbot") fabTranslationKeyPrefix = "modal.fabChatbot";
                else {
                    console.warn(`Unknown FAB ID (or already handled): ${fabId}`);
                    return; // Do not proceed if ID is unknown or fab-join
                }

                const title = window.getTranslatedText ? window.getTranslatedText(`${fabTranslationKeyPrefix}.title`) : fabId; // Fallback
                let modalBodyContent = '';

                if (fabId === "fab-contact") {
                    modalBodyContent = `
        <form id="contact-us-form" class="contact-modal-form">
            <div class="form-field">
                <label for="contact-name" data-translate-key="form.contact.label.name">Full Name</label>
                <input type="text" id="contact-name" name="name" required placeholder="Enter your full name" data-placeholder-translate-key="form.contact.placeholder.name">
                <div class="validation-message" data-validation-for="contact-name"></div>
            </div>

            <div class="form-field">
                <label for="contact-email" data-translate-key="form.contact.label.email">Email Address</label>
                <input type="email" id="contact-email" name="email" required placeholder="your.email@company.com" data-placeholder-translate-key="form.contact.placeholder.email">
                <div class="validation-message" data-validation-for="contact-email"></div>
            </div>

            <div class="form-row">
                <div class="form-field">
                    <label for="contact-best-time" data-translate-key="form.contact.label.bestTime">Best time to call</label>
                    <input type="time" id="contact-best-time" name="bestTime">
                    <div class="validation-message" data-validation-for="contact-best-time"></div>
                </div>
                <div class="form-field">
                    <label for="contact-best-date" data-translate-key="form.contact.label.bestDate">Best date to call</label>
                    <input type="date" id="contact-best-date" name="bestDate">
                    <div class="validation-message" data-validation-for="contact-best-date"></div>
                </div>
            </div>

            <div class="form-row">
                <div class="form-field form-field-country-code">
                    <label for="contact-country-code" data-translate-key="form.contact.label.countryCode">Country Code</label>
                    <input type="text" id="contact-country-code" name="countryCode" placeholder="+1" data-placeholder-translate-key="form.contact.placeholder.countryCode">
                    <div class="validation-message" data-validation-for="contact-country-code"></div>
                </div>
                <div class="form-field form-field-phone-number">
                    <label for="contact-phone" data-translate-key="form.contact.label.phoneNumber">Phone Number</label>
                    <input type="tel" id="contact-phone" name="phone" placeholder="Enter your phone number" data-placeholder-translate-key="form.contact.placeholder.phoneNumber">
                    <div class="validation-message" data-validation-for="contact-phone"></div>
                </div>
            </div>

            <div class="form-field">
                <label for="contact-area-of-interest" data-translate-key="form.contact.label.areaOfInterest">Area of Interest</label>
                <select id="contact-area-of-interest" name="areaOfInterest" required>
                    <!-- Options will be populated by JS -->
                </select>
                <div class="validation-message" data-validation-for="contact-area-of-interest"></div>
            </div>

            <div class="form-field">
                <label for="contact-message" data-translate-key="form.contact.label.message">Message</label>
                <textarea id="contact-message" name="message" rows="4" required placeholder="How can we help you?" data-placeholder-translate-key="form.contact.placeholder.message"></textarea>
                <div class="validation-message" data-validation-for="contact-message"></div>
            </div>

            <div class="form-field form-submit-area">
                <button type="submit" id="contact-submit-button" class="form-button" data-translate-key="form.contact.button.submit">Submit</button>
                <div class="submission-status-message" id="contact-submission-status"></div>
            </div>
        </form>
                    `;
                } else {
                    // Default content for other FABs (like Join Us, Chatbot AI)
                    modalBodyContent = `<p>${window.getTranslatedText ? window.getTranslatedText(`${fabTranslationKeyPrefix}.description`) : "Description unavailable."}</p>`;
                }
                // Check if modal for this FAB already exists
                let modalInstance = modalContainerMain.querySelector(`.standard-modal[data-fab-id="${fabId}"]`);
                if (modalInstance) {
                     if (modalInstance.style.display === 'none') {
                        modalInstance.style.display = 'flex';
                        modalContainerMain.style.display = 'flex';
                        document.body.style.overflow = 'hidden';

                        const focusableElements = window.getFocusableElements(modalInstance);
                        if (focusableElements.length > 0) focusableElements[0].focus();
                        else modalInstance.focus();

                        if (modalInstance.modalKeydownListener) {
                             modalInstance.addEventListener('keydown', modalInstance.modalKeydownListener);
                        }
                        lastOpenedDynamicModalTrigger = document.activeElement || fab;
                        modalInstance.triggerElement = lastOpenedDynamicModalTrigger;
                    }
                    return;
                }

                // Create modal element
                modalInstance = document.createElement('div');
                modalInstance.className = 'standard-modal opslight-service-modal'; // Updated class
                if (fabId === "fab-contact") {
                    modalInstance.classList.add('standard-modal--wide');
                }
                if (fabId === "fab-chatbot") {
                    modalInstance.id = 'chatbot-positioned-modal';
                }
                modalInstance.setAttribute('data-fab-id', fabId); // Unique attribute for FAB modals
                modalInstance.setAttribute('role', 'dialog');
                modalInstance.setAttribute('aria-modal', 'true');
                modalInstance.style.display = 'none'; // Start hidden

                const titleId = `modal-title-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

                modalInstance.innerHTML = `
                    <div class="standard-modal-overlay" data-modal-close></div>
                    <div class="standard-modal-dialog" role="document">
                        <header class="standard-modal-header">
                            <h2 class="standard-modal-title" id="${titleId}">${title}</h2>
                            <button class="standard-modal-close" aria-label="Close modal" data-modal-close>&times;</button>
                        </header>
                        <section class="standard-modal-content">
                            ${modalBodyContent}
                        </section>
                        <footer class="standard-modal-footer">
                            ${fabId === 'fab-contact' ? '<!-- Contact form has its own submit button within modalBodyContent -->' : '<button class="button-secondary" data-modal-close>Close</button>'}
                        </footer>
                    </div>
                `;

                modalInstance.setAttribute('aria-labelledby', titleId);
                modalInstance.setAttribute('tabindex', '-1'); // For programmatic focus

                const triggerElement = document.activeElement || fab; // Fallback to fab
                modalInstance.triggerElement = triggerElement; // Store for focus restoration
                lastOpenedDynamicModalTrigger = triggerElement; // For Escape key

                // Append to container
                modalContainerMain.appendChild(modalInstance);

                // Show the modal and container
                modalInstance.style.display = 'flex';
                modalContainerMain.style.display = 'flex'; // Ensure container is visible
                document.body.style.overflow = 'hidden';


                const focusableElements = window.getFocusableElements(modalInstance);
                if (focusableElements.length > 0) {
                    focusableElements[0].focus();
                } else {
                    modalInstance.focus();
                }

                const modalKeydownListener = (event) => {
                    if (event.key === 'Tab') {
                        const currentFocusableElements = window.getFocusableElements(modalInstance.querySelector('.standard-modal-dialog')); // Search in dialog
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
                modalInstance.addEventListener('keydown', modalKeydownListener);
                modalInstance.modalKeydownListener = modalKeydownListener; // Store reference for removal

               // If it's the contact form modal, initialize its JS logic
                if (fabId === "fab-contact") {
                    const formElement = modalInstance.querySelector('#contact-us-form');
                    if (window.initContactForm && formElement) {
                        window.initContactForm(formElement);
                    } else {
                        console.warn('initContactForm function not found or form element missing.');
                    }
                }
                // Delegated click listener for close actions
                modalInstance.addEventListener('click', function(event) {
                    if (event.target.closest('[data-modal-close]')) {
                        hideModal(this); // 'this' refers to modalInstance
                    }
                });
            });
        } else {
            // Log if a FAB element is not found.
        }
    });

    // Global Escape key listener for modals
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            if (modalContainerMain && (modalContainerMain.style.display === 'flex' || modalContainerMain.style.display === '')) {
                // Iterate backwards in case hiding one affects collection or focus logic
                for (let i = modalContainerMain.children.length - 1; i >= 0; i--) {
                    const childModal = modalContainerMain.children[i];
                    // Check if the modal is directly managed by this script (e.g., has triggerElement or is standard-modal)
                    // and is currently visible.
                    // The join-modal is handled by script.js, but if it's a child of modalContainerMain and visible,
                    // script.js's Escape handler should take precedence or be coordinated.
                    // For now, this will hide any visible child modal.
                    if (childModal.style.display !== 'none') {
                         // If it's the #join-modal, its own Escape listener in script.js should handle it.
                         // Check if this modal is the #join-modal AND if it has its own specific Escape handler
                         // (which is now part of its keydown listener in script.js).
                         // If so, let that script handle it to avoid double processing or conflicting focus restoration.
                        if (childModal.id === 'join-modal' && childModal.classList.contains('opslight-service-modal')) {
                            // Assuming join-modal's Escape logic in script.js will correctly hide it and manage focus.
                            // If it doesn't hide itself, this global listener might act as a fallback.
                            // To prevent this global handler from interfering with join-modal's specific Escape logic,
                            // we might need a flag or check if childModal.closeJoinModal exists and call that.
                            // For now, let script.js handle its own Escape for #join-modal.
                            // This global one will hide other dynamic modals.
                            // If we want this to be the SOLE escape handler, then script.js should not have one.
                            // console.log("Global escape: join-modal found, its own handler should take care of it.");
                            // However, if `joinModalKeydownListener` in script.js stops propagation, this won't run for it.
                            // If it doesn't, then this *might* run after. This needs careful testing.
                            // For simplicity, if it's join-modal, we skip hiding it here, assuming its own script does.
                            continue; // Skip join-modal, let its own script handle Escape.
                        }

                        hideModal(childModal); // This will also try to hide modalContainerMain if it becomes empty
                        // If we only want to close one modal per escape press (like typical UI):
                        // break;
                    }
                }
                // hideModal handles focus restoration for each modal it closes.
                // hideModal also handles hiding modalContainerMain and resetting lastOpenedDynamicModalTrigger if all modals become hidden.
            }
        }
    });
});
