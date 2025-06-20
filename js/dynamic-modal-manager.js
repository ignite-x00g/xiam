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
                const existingModal = modalContainerMain.querySelector(`.opslight-service-modal[data-service="${serviceKey}"]`);
                if (existingModal) {
                    modalContainerMain.style.display = 'flex'; // Ensure container is visible

                    // Hide other service modals (those with 'data-service')
                    const otherServiceModals = modalContainerMain.querySelectorAll('.opslight-service-modal[data-service]');
                    otherServiceModals.forEach(m => {
                        if (m !== existingModal) {
                            m.style.display = 'none';
                        }
                    });
                    // Also hide any FAB modals (those with 'data-fab-id')
                    const fabModals = modalContainerMain.querySelectorAll('.opslight-service-modal[data-fab-id]');
                    fabModals.forEach(m => {
                        m.style.display = 'none';
                    });


                    existingModal.style.display = ''; // Remove inline 'display:none', reverting to CSS display

                    const focusableElements = window.getFocusableElements(existingModal);
                    if (focusableElements.length > 0) {
                        focusableElements[0].focus();
                    } else {
                        existingModal.focus(); // Modal itself should have tabindex="-1"
                    }
                    lastOpenedDynamicModalTrigger = card; // 'card' is the serviceNavItems[i] element
                    return; // Modal shown, no need to create a new one
                }

                // If creating a new service modal, hide any open FAB modals
                const fabModalsToHide = modalContainerMain.querySelectorAll('.opslight-service-modal[data-fab-id]');
                fabModalsToHide.forEach(m => {
                    m.style.display = 'none';
                });


                // Create modal element
                const modalInstance = document.createElement('div');
                modalInstance.className = 'opslight-service-modal';
                modalInstance.setAttribute('data-service', serviceKey);
                modalInstance.setAttribute('role', 'dialog');
                modalInstance.setAttribute('aria-modal', 'true');

                const titleId = `modal-title-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

                modalInstance.innerHTML = `
                    <button class="opslight-modal-close-button" aria-label="Close modal">&times;</button>
                    <h2 id="${titleId}">${title}</h2>
                    <p>${description}</p>
                `;

                modalInstance.setAttribute('aria-labelledby', titleId);
                modalInstance.setAttribute('tabindex', '-1'); // For programmatic focus if no focusable elements inside

                const triggerElement = document.activeElement;
                modalInstance.triggerElement = triggerElement; // Store for focus restoration
                lastOpenedDynamicModalTrigger = triggerElement; // For Escape key

                // Append to container and show container
                modalContainerMain.appendChild(modalInstance);
                modalContainerMain.style.display = 'flex';

                const focusableElements = window.getFocusableElements(modalInstance);
                if (focusableElements.length > 0) {
                    focusableElements[0].focus();
                } else {
                    modalInstance.focus();
                }

                const modalKeydownListener = (event) => {
                    if (event.key === 'Tab') {
                        const currentFocusableElements = window.getFocusableElements(modalInstance);
                        if (currentFocusableElements.length === 0) { // Should not happen if modal itself is focusable
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

                // Add event listener to this new modal's close button
                modalInstance.querySelector('.opslight-modal-close-button').addEventListener('click', () => {
                    modalInstance.removeEventListener('keydown', modalInstance.modalKeydownListener);
                    modalInstance.remove();
                    if (modalInstance.triggerElement && typeof modalInstance.triggerElement.focus === 'function') {
                        modalInstance.triggerElement.focus();
                    }
                    // If no modals are left, hide the container
                    if (modalContainerMain.children.length === 0) {
                        modalContainerMain.style.display = 'none';
                        document.body.style.overflow = '';
                        lastOpenedDynamicModalTrigger = null; // Reset
                    }
                });
            });
        });

        // Event listener for backdrop click (to close all modals)
        modalContainerMain.addEventListener('click', (event) => {
            if (event.target === modalContainerMain) { // Clicked on the backdrop itself
                let focusedTrigger = null; // To store the trigger of the last modal removed this way
                while (modalContainerMain.firstChild) {
                    const childModal = modalContainerMain.firstChild;
                    if (childModal.modalKeydownListener) { // Remove listener if dynamically added
                        childModal.removeEventListener('keydown', childModal.modalKeydownListener);
                    }
                     // For dynamic modals, store the trigger of the last one being removed
                    if (childModal.triggerElement) {
                        focusedTrigger = childModal.triggerElement;
                    }
                    modalContainerMain.removeChild(childModal);
                }
                modalContainerMain.style.display = 'none';
                document.body.style.overflow = '';
                if (focusedTrigger && typeof focusedTrigger.focus === 'function') {
                     focusedTrigger.focus(); // Try to focus the trigger of the last removed modal
                } else if (lastOpenedDynamicModalTrigger && typeof lastOpenedDynamicModalTrigger.focus === 'function') {
                    lastOpenedDynamicModalTrigger.focus(); // Fallback
                }
                lastOpenedDynamicModalTrigger = null; // Reset
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
                const existingModal = modalContainerMain.querySelector(`.opslight-service-modal[data-fab-id="${fabId}"]`);
                if (existingModal) {
                    modalContainerMain.style.display = 'flex'; // Ensure container is visible

                    // Make all modals display:none first, then display the target one
                    // This ensures only one modal is active if they are not stacked by design.
                    const allModalsInContainer = modalContainerMain.querySelectorAll('.opslight-service-modal');
                    allModalsInContainer.forEach(m => {
                        // Don't hide the #join-modal if it's the one being managed by its own script for display
                        if (m.id !== 'join-modal') {
                            m.style.display = 'none';
                        }
                    });

                    existingModal.style.display = ''; // Remove inline 'display:none', reverting to CSS display (e.g., flex/block)

                    // Re-focus the first focusable element or the modal itself
                    const focusableElements = window.getFocusableElements(existingModal);
                    if (focusableElements.length > 0) {
                        focusableElements[0].focus();
                    } else {
                        existingModal.focus(); // Modal itself should have tabindex="-1"
                    }

                    // Update lastOpenedDynamicModalTrigger for Escape key behavior
                    // fab is the button that was clicked to open this modal.
                    lastOpenedDynamicModalTrigger = fab;
                    return; // Modal shown, no need to create a new one
                }

                // Create modal element
                const modalInstance = document.createElement('div');
                // Using same class as service modals for now, can differentiate if needed
                modalInstance.className = 'opslight-service-modal';
                modalInstance.setAttribute('data-fab-id', fabId); // Unique attribute for FAB modals
                modalInstance.setAttribute('role', 'dialog');
                modalInstance.setAttribute('aria-modal', 'true');

                const titleId = `modal-title-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

                modalInstance.innerHTML = `
                    <button class="opslight-modal-close-button" aria-label="Close modal">&times;</button>
                    <h2 id="${titleId}">${title}</h2>
                    ${modalBodyContent}`;

                modalInstance.setAttribute('aria-labelledby', titleId);
                modalInstance.setAttribute('tabindex', '-1'); // For programmatic focus

                const triggerElement = document.activeElement;
                modalInstance.triggerElement = triggerElement; // Store for focus restoration
                lastOpenedDynamicModalTrigger = triggerElement; // For Escape key

                // Append to container and show container
                modalContainerMain.appendChild(modalInstance);
                modalContainerMain.style.display = 'flex'; // Ensure container is visible

                const focusableElements = window.getFocusableElements(modalInstance);
                if (focusableElements.length > 0) {
                    focusableElements[0].focus();
                } else {
                    modalInstance.focus();
                }

                const modalKeydownListener = (event) => {
                    if (event.key === 'Tab') {
                        const currentFocusableElements = window.getFocusableElements(modalInstance);
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
                // Add event listener to this new modal's close button
                modalInstance.querySelector('.opslight-modal-close-button').addEventListener('click', () => {
                    modalInstance.removeEventListener('keydown', modalInstance.modalKeydownListener);
                    modalInstance.remove();
                     if (modalInstance.triggerElement && typeof modalInstance.triggerElement.focus === 'function') {
                        modalInstance.triggerElement.focus();
                    }
                    // If no modals are left (neither service nor FAB), hide the container
                    if (modalContainerMain.children.length === 0) {
                        modalContainerMain.style.display = 'none';
                        document.body.style.overflow = '';
                        lastOpenedDynamicModalTrigger = null; // Reset
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
            if (modalContainerMain && modalContainerMain.style.display === 'flex') {
                let joinModalNeedsFocusRestore = false;
                let joinModalTrigger = null;

                const modals = modalContainerMain.querySelectorAll('.opslight-service-modal');
                modals.forEach(modal => {
                    if(modal.id === 'join-modal' && modal.style.display !== 'none') {
                        if (modal.triggerElement) {
                             joinModalNeedsFocusRestore = true;
                             joinModalTrigger = modal.triggerElement;
                        }
                    }
                    // For dynamically added modals, remove their specific keydown listener
                    if (modal.modalKeydownListener) {
                        modal.removeEventListener('keydown', modal.modalKeydownListener);
                    }
                    modal.style.display = 'none';
                });

                modalContainerMain.style.display = 'none';
                document.body.style.overflow = '';

                if (joinModalNeedsFocusRestore && joinModalTrigger && typeof joinModalTrigger.focus === 'function') {
                    // Prioritize join-modal's trigger if it was open.
                    joinModalTrigger.focus();
                } else if (lastOpenedDynamicModalTrigger && typeof lastOpenedDynamicModalTrigger.focus === 'function') {
                    // Fallback to the last opened dynamic modal's trigger.
                    lastOpenedDynamicModalTrigger.focus();
                }
                lastOpenedDynamicModalTrigger = null; // Reset
            }
        }
    });
});
