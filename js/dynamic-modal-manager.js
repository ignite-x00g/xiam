// Helper: Get focusable elements in parent (for accessibility)
function getFocusableElements(parentElement) {
    if (!parentElement) return [];
    return Array.from(
        parentElement.querySelectorAll(
            'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
        )
    ).filter(el => el.offsetParent !== null && !el.closest('[style*="display: none"]'));
}
window.getFocusableElements = getFocusableElements;

// Keep track of last opened modal's trigger (for focus restore)
let lastOpenedDynamicModalTrigger = null;

document.addEventListener('DOMContentLoaded', () => {
    const modalContainerMain = document.getElementById('modal-container-main');
    const serviceNavItems = document.querySelectorAll('.service-nav-item');

    if (!modalContainerMain) {
        console.warn('Modal container #modal-container-main not found.');
        return;
    }

    // Hide modal utility
    function hideModal(modalElement) {
        if (!modalElement) return;
        modalElement.style.display = 'none';
        // Remove keydown listener
        if (modalElement.modalKeydownListener) {
            modalElement.removeEventListener('keydown', modalElement.modalKeydownListener);
        }
        // Restore focus to trigger
        if (modalElement.triggerElement && typeof modalElement.triggerElement.focus === 'function') {
            modalElement.triggerElement.focus();
        }
        // Hide container if all modals are hidden
        let allHidden = true;
        for (let i = 0; i < modalContainerMain.children.length; i++) {
            if (modalContainerMain.children[i].style.display !== 'none') {
                allHidden = false;
                break;
            }
        }
        if (allHidden) {
            modalContainerMain.style.display = 'none';
            document.body.style.overflow = '';
            lastOpenedDynamicModalTrigger = null;
        }
    }

    // Service card nav modals
    if (serviceNavItems.length > 0) {
        serviceNavItems.forEach(card => {
            card.addEventListener('click', (event) => {
                event.preventDefault();
                const serviceKey = card.dataset.serviceTarget;
                let translationKeyPrefix = '';
                if (serviceKey === "Business Ops") translationKeyPrefix = "modal.businessOps";
                else if (serviceKey === "Contact Center") translationKeyPrefix = "modal.contactCenter";
                else if (serviceKey === "IT Support") translationKeyPrefix = "modal.itSupport";
                else if (serviceKey === "Professionals") translationKeyPrefix = "modal.professionals";
                else {
                    console.warn(`Unknown service key: ${serviceKey}`);
                    return;
                }
                const title = window.getTranslatedText ? window.getTranslatedText(`${translationKeyPrefix}.title`) : serviceKey;
                const description = window.getTranslatedText ? window.getTranslatedText(`${translationKeyPrefix}.description`) : "Description unavailable.";

                // If modal already exists, show it
                let modalInstance = modalContainerMain.querySelector(`.standard-modal[data-service="${serviceKey}"]`);
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
                        lastOpenedDynamicModalTrigger = document.activeElement || card;
                        modalInstance.triggerElement = lastOpenedDynamicModalTrigger;
                    }
                    return;
                }

                // Create new modal
                modalInstance = document.createElement('div');
                modalInstance.className = 'standard-modal opslight-service-modal';
                modalInstance.setAttribute('data-service', serviceKey);
                modalInstance.setAttribute('role', 'dialog');
                modalInstance.setAttribute('aria-modal', 'true');
                const titleId = `modal-title-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
                modalInstance.setAttribute('aria-labelledby', titleId);
                modalInstance.setAttribute('tabindex', '-1');
                modalInstance.innerHTML = `
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
                const triggerElement = document.activeElement || card;
                modalInstance.triggerElement = triggerElement;
                lastOpenedDynamicModalTrigger = triggerElement;

                modalContainerMain.appendChild(modalInstance);
                modalInstance.style.display = 'flex';
                modalContainerMain.style.display = 'flex';
                document.body.style.overflow = 'hidden';
                const focusableElements = window.getFocusableElements(modalInstance);
                if (focusableElements.length > 0) focusableElements[0].focus();
                else modalInstance.focus();

                const modalKeydownListener = (event) => {
                    if (event.key === 'Tab') {
                        const currentFocusableElements = window.getFocusableElements(modalInstance.querySelector('.standard-modal-dialog'));
                        if (currentFocusableElements.length === 0) {
                            event.preventDefault();
                            return;
                        }
                        const first = currentFocusableElements[0];
                        const last = currentFocusableElements[currentFocusableElements.length - 1];
                        if (event.shiftKey && document.activeElement === first) {
                            event.preventDefault();
                            last.focus();
                        } else if (!event.shiftKey && document.activeElement === last) {
                            event.preventDefault();
                            first.focus();
                        }
                    }
                };
                modalInstance.addEventListener('keydown', modalKeydownListener);
                modalInstance.modalKeydownListener = modalKeydownListener;
                modalInstance.addEventListener('click', function(event) {
                    if (event.target.closest('[data-modal-close]')) {
                        hideModal(this);
                    }
                });
            });
        });

        // Backdrop click closes modal
        modalContainerMain.addEventListener('click', (event) => {
            const clickedElement = event.target;
            if (clickedElement.classList.contains('standard-modal')) {
                if (clickedElement.style.display !== 'none') {
                    if (clickedElement.id === 'join-modal' && typeof window.closeJoinModal === 'function') {
                        window.closeJoinModal();
                    } else {
                        hideModal(clickedElement);
                    }
                }
            } else if (clickedElement === modalContainerMain) {
                for (let i = 0; i < modalContainerMain.children.length; i++) {
                    const childModal = modalContainerMain.children[i];
                    if (childModal.classList.contains('standard-modal') && childModal.style.display !== 'none') {
                        if (childModal.id === 'join-modal' && typeof window.closeJoinModal === 'function') {
                            window.closeJoinModal();
                        } else {
                            hideModal(childModal);
                        }
                    }
                }
            }
        });

    } else {
        console.warn('No service nav items with class .service-nav-item found.');
    }

    // FAB Modal Interaction
    const fabJoin = document.getElementById('fab-join');
    const fabContact = document.getElementById('fab-contact');
    const fabChatbot = document.getElementById('fab-chatbot');
    const fabs = [fabJoin, fabContact, fabChatbot];

    fabs.forEach(fab => {
        if (!fab) return;
        fab.addEventListener('click', () => {
            const fabId = fab.id;
            if (fabId === "fab-join") return; // Join Us is handled elsewhere

            let fabTranslationKeyPrefix = '';
            if (fabId === "fab-contact") fabTranslationKeyPrefix = "modal.fabContact";
            else if (fabId === "fab-chatbot") fabTranslationKeyPrefix = "modal.fabChatbot";
            else {
                console.warn(`Unknown FAB ID: ${fabId}`);
                return;
            }
            const title = window.getTranslatedText ? window.getTranslatedText(`${fabTranslationKeyPrefix}.title`) : fabId;
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
                modalBodyContent = `<p>${window.getTranslatedText ? window.getTranslatedText(`${fabTranslationKeyPrefix}.description`) : "Description unavailable."}</p>`;
            }

            // Check if modal already exists
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

            // Create modal
            modalInstance = document.createElement('div');
            modalInstance.className = 'standard-modal opslight-service-modal';
            if (fabId === "fab-contact") modalInstance.classList.add('standard-modal--wide');
            if (fabId === "fab-chatbot") modalInstance.id = 'chatbot-positioned-modal';
            modalInstance.setAttribute('data-fab-id', fabId);
            modalInstance.setAttribute('role', 'dialog');
            modalInstance.setAttribute('aria-modal', 'true');
            const titleId = `modal-title-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            modalInstance.setAttribute('aria-labelledby', titleId);
            modalInstance.setAttribute('tabindex', '-1');
            modalInstance.innerHTML = `
                <div class="standard-modal-dialog" role="document">
                    <header class="standard-modal-header">
                        <h2 class="standard-modal-title" id="${titleId}">${title}</h2>
                        <button class="standard-modal-close" aria-label="Close modal" data-modal-close>&times;</button>
                    </header>
                    <section class="standard-modal-content">
                        ${modalBodyContent}
                    </section>
                    <footer class="standard-modal-footer">
                        ${fabId === 'fab-contact' ? '<!-- Contact form has its own submit button -->' : '<button class="button-secondary" data-modal-close>Close</button>'}
                    </footer>
                </div>
            `;
            const triggerElement = document.activeElement || fab;
            modalInstance.triggerElement = triggerElement;
            lastOpenedDynamicModalTrigger = triggerElement;

            modalContainerMain.appendChild(modalInstance);
            modalInstance.style.display = 'flex';
            modalContainerMain.style.display = 'flex';
            document.body.style.overflow = 'hidden';
            const focusableElements = window.getFocusableElements(modalInstance);
            if (focusableElements.length > 0) focusableElements[0].focus();
            else modalInstance.focus();

            const modalKeydownListener = (event) => {
                if (event.key === 'Tab') {
                    const currentFocusableElements = window.getFocusableElements(modalInstance.querySelector('.standard-modal-dialog'));
                    if (currentFocusableElements.length === 0) {
                        event.preventDefault();
                        return;
                    }
                    const first = currentFocusableElements[0];
                    const last = currentFocusableElements[currentFocusableElements.length - 1];
                    if (event.shiftKey && document.activeElement === first) {
                        event.preventDefault();
                        last.focus();
                    } else if (!event.shiftKey && document.activeElement === last) {
                        event.preventDefault();
                        first.focus();
                    }
                }
            };
            modalInstance.addEventListener('keydown', modalKeydownListener);
            modalInstance.modalKeydownListener = modalKeydownListener;

            if (fabId === "fab-contact") {
                const formElement = modalInstance.querySelector('#contact-us-form');
                if (window.initContactForm && formElement) {
                    window.initContactForm(formElement);
                } else {
                    console.warn('initContactForm function not found or form element missing.');
                }
            }

            modalInstance.addEventListener('click', function(event) {
                if (event.target.closest('[data-modal-close]')) {
                    hideModal(this);
                }
            });
        });
    });

    // Global Escape closes open modals
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            if (modalContainerMain && (modalContainerMain.style.display === 'flex' || modalContainerMain.style.display === '')) {
                for (let i = modalContainerMain.children.length - 1; i >= 0; i--) {
                    const childModal = modalContainerMain.children[i];
                    if (childModal.style.display !== 'none') {
                        if (childModal.id === 'join-modal') continue; // Let join-modal handle itself
                        hideModal(childModal);
                    }
                }
            }
        }
    });
});
