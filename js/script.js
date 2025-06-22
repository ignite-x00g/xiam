// js/script.js

document.addEventListener('DOMContentLoaded', () => {
    const fabJoin = document.getElementById('fab-join');
    const modalContainerMain = document.getElementById('modal-container-main');

    let joinModal = null; // #join-modal DOM element
    let joinModalTriggerElement = null; // Button that opened the modal
    let currentJoinModalSection = 'join-modal-section-1';

    // Fallback: Get focusable elements helper
    if (!window.getFocusableElements) {
        window.getFocusableElements = function(parentElement) {
            if (!parentElement) return [];
            return Array.from(
                parentElement.querySelectorAll(
                    'a[href]:not([disabled]), button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
                )
            ).filter(el => el.offsetParent !== null && !el.closest('[style*="display: none"]'));
        };
    }

    // --- Modal Creation ---
    function createJoinModalStructure() {
        return `
            <div id="join-modal" class="standard-modal" role="dialog" aria-modal="true" aria-labelledby="join-modal-title" style="display: none;" tabindex="-1">
                <div class="standard-modal-dialog" role="document">
                    <header class="standard-modal-header">
                        <h2 class="standard-modal-title" id="join-modal-title" data-translate-key="modal.fabJoin.title">Join Our Team</h2>
                        <button class="standard-modal-close" aria-label="Close Join Us Form" data-modal-close>&times;</button>
                    </header>
                    <section class="standard-modal-content">
                        <section id="join-modal-section-1" class="join-modal-section" style="display: block;">
                            <div class="form-field">
                                <label for="join-fullName" data-translate-key="joinModal.section1.fullNameLabel">Full Name:</label>
                                <input type="text" id="join-fullName" name="fullName" data-placeholder-translate-key="joinModal.section1.fullNamePlaceholder" placeholder="Enter your full name">
                            </div>
                            <div class="form-field">
                                <label for="join-email" data-translate-key="joinModal.section1.emailLabel">Email:</label>
                                <input type="email" id="join-email" name="email" data-placeholder-translate-key="joinModal.section1.emailPlaceholder" placeholder="Enter your email address">
                            </div>
                        </section>
                        <section id="join-modal-section-2" class="join-modal-section" style="display: none;">
                            <h3 data-translate-key="joinModal.section2.title">Contact Details</h3>
                            <div class="form-field">
                                <label for="join-phone" data-translate-key="joinModal.section2.phoneLabel">Phone Number:</label>
                                <input type="tel" id="join-phone" name="phone" data-placeholder-translate-key="joinModal.section2.phonePlaceholder" placeholder="Enter your phone number">
                            </div>
                            <div class="form-field">
                                <label for="join-address" data-translate-key="joinModal.section2.addressLabel">Address:</label>
                                <textarea id="join-address" name="address" rows="3" data-placeholder-translate-key="joinModal.section2.addressPlaceholder" placeholder="Enter your address"></textarea>
                            </div>
                        </section>
                        <section id="join-modal-section-3" class="join-modal-section" style="display: none;">
                            <h3 data-translate-key="joinModal.section3.title">Membership Preferences</h3>
                            <div class="form-field">
                                <label for="join-membershipType" data-translate-key="joinModal.section3.membershipTypeLabel">Membership Type:</label>
                                <select id="join-membershipType" name="membershipType">
                                    <option value="basic" data-translate-key="joinModal.section3.membershipType.basic">Basic</option>
                                    <option value="premium" data-translate-key="joinModal.section3.membershipType.premium">Premium</option>
                                    <option value="vip" data-translate-key="joinModal.section3.membershipType.vip">VIP</option>
                                </select>
                            </div>
                            <div class="form-field">
                                <label for="join-referral" data-translate-key="joinModal.section3.referralLabel">How did you hear about us?</label>
                                <input type="text" id="join-referral" name="referral" data-placeholder-translate-key="joinModal.section3.referralPlaceholder" placeholder="Tell us how you found us">
                            </div>
                        </section>
                        <div id="join-modal-submission-status" class="submission-status-message" style="margin-top: 10px;"></div>
                    </section>
                    <footer class="standard-modal-footer">
                        <button class="button-secondary join-modal-prev" data-translate-key="joinModal.button.previous" style="display: none;">Previous</button>
                        <button class="button-primary join-modal-next" data-translate-key="joinModal.button.next" style="display: inline-block;">Next</button>
                        <button type="submit" class="button-primary join-modal-submit" data-translate-key="joinModal.button.submit" style="display: none;">Submit</button>
                    </footer>
                </div>
            </div>
        `;
    }

    function ensureJoinModalInDOM() {
        joinModal = document.getElementById('join-modal');
        if (!joinModal) {
            if (!modalContainerMain) {
                console.error('Modal container #modal-container-main not found.');
                return false;
            }
            modalContainerMain.insertAdjacentHTML('beforeend', createJoinModalStructure());
            joinModal = document.getElementById('join-modal');
            if (!joinModal) {
                console.error('Failed to create #join-modal.');
                return false;
            }
            // Translate modal content
            if (window.loadTranslations) window.loadTranslations();
            else if (window.getTranslatedText) {
                joinModal.querySelectorAll('[data-translate-key]').forEach(element => {
                    const key = element.getAttribute('data-translate-key');
                    if (element.hasAttribute('data-placeholder-translate-key')) {
                        const placeholderKey = element.getAttribute('data-placeholder-translate-key');
                        element.setAttribute('placeholder', window.getTranslatedText(placeholderKey));
                    }
                    if (['BUTTON', 'LABEL', 'H2', 'H3', 'OPTION'].includes(element.tagName)) {
                        element.textContent = window.getTranslatedText(key);
                    }
                });
                const closeButton = joinModal.querySelector('.standard-modal-close');
                if (closeButton) {
                    closeButton.setAttribute('aria-label', window.getTranslatedText('joinModal.closeButtonAriaLabel') || 'Close Join Us Form');
                }
            }
            attachJoinModalListeners();
        }
        return true;
    }

    function attachJoinModalListeners() {
        if (!joinModal) return;
        // Close modal by close button
        joinModal.addEventListener('click', function(event) {
            if (event.target.closest('[data-modal-close]')) closeJoinModal();
        });
        // Footer nav buttons
        const prevButton = joinModal.querySelector('.join-modal-prev');
        const nextButton = joinModal.querySelector('.join-modal-next');
        const submitButton = joinModal.querySelector('.join-modal-submit');
        if (prevButton) prevButton.onclick = () => {
            if (currentJoinModalSection === 'join-modal-section-3') showJoinModalSection('join-modal-section-2');
            else if (currentJoinModalSection === 'join-modal-section-2') showJoinModalSection('join-modal-section-1');
        };
        if (nextButton) nextButton.onclick = () => {
            if (currentJoinModalSection === 'join-modal-section-1') showJoinModalSection('join-modal-section-2');
            else if (currentJoinModalSection === 'join-modal-section-2') showJoinModalSection('join-modal-section-3');
        };
        if (submitButton) submitButton.onclick = (event) => {
            event.preventDefault();
            const statusMsg = joinModal.querySelector('#join-modal-submission-status');
            if (statusMsg) {
                statusMsg.textContent = (window.getTranslatedText && window.getTranslatedText('joinModal.alert.formSubmittedSuccess')) || 'Form submitted successfully!';
            }
        };
    }

    function displayJoinModal() {
        if (!ensureJoinModalInDOM()) return;
        if (joinModal) joinModal.triggerElement = joinModalTriggerElement;
        showJoinModalSection('join-modal-section-1');
        if (modalContainerMain) modalContainerMain.style.display = 'flex';
        joinModal.style.display = 'flex';
        const currentSectionElement = joinModal.querySelector(`#${currentJoinModalSection}`);
        const focusableElements = window.getFocusableElements(currentSectionElement || joinModal);
        if (focusableElements.length > 0) focusableElements[0].focus();
        else joinModal.focus();
        joinModal.removeEventListener('keydown', joinModalKeydownListener);
        joinModal.addEventListener('keydown', joinModalKeydownListener);
    }

    function closeJoinModal() {
        if (!joinModal) return;
        joinModal.style.display = 'none';
        joinModal.removeEventListener('keydown', joinModalKeydownListener);
        if (joinModal.triggerElement && typeof joinModal.triggerElement.focus === 'function') {
            joinModal.triggerElement.focus();
        }
        const statusMsg = joinModal.querySelector('#join-modal-submission-status');
        if (statusMsg) statusMsg.textContent = '';
    }
    window.closeJoinModal = closeJoinModal;

    function showJoinModalSection(sectionId) {
        if (!joinModal) return;
        joinModal.querySelectorAll('.join-modal-section').forEach(section => {
            section.style.display = 'none';
        });
        const sectionToShow = joinModal.querySelector(`#${sectionId}`);
        if (sectionToShow) {
            sectionToShow.style.display = 'block';
            currentJoinModalSection = sectionId;
            const focusableInSection = window.getFocusableElements(sectionToShow);
            if (focusableInSection.length > 0) focusableInSection[0].focus();
            else { sectionToShow.setAttribute('tabindex', '-1'); sectionToShow.focus(); }
            // Update button visibility
            const prevButton = joinModal.querySelector('.join-modal-prev');
            const nextButton = joinModal.querySelector('.join-modal-next');
            const submitButton = joinModal.querySelector('.join-modal-submit');
            if (prevButton && nextButton && submitButton) {
                prevButton.style.display = 'none'; nextButton.style.display = 'none'; submitButton.style.display = 'none';
                if (sectionId === 'join-modal-section-1') {
                    nextButton.style.display = 'inline-block';
                } else if (sectionId === 'join-modal-section-2') {
                    prevButton.style.display = 'inline-block';
                    nextButton.style.display = 'inline-block';
                } else if (sectionId === 'join-modal-section-3') {
                    prevButton.style.display = 'inline-block';
                    submitButton.style.display = 'inline-block';
                }
            }
        }
    }

    const joinModalKeydownListener = (event) => {
        if (!joinModal || joinModal.style.display === 'none') return;
        if (event.key === 'Escape') {
            event.stopPropagation();
            closeJoinModal();
        }
        if (event.key === 'Tab') {
            const currentSectionElement = joinModal.querySelector(`#${currentJoinModalSection}`);
            const focusableElements = window.getFocusableElements(currentSectionElement || joinModal);
            if (focusableElements.length === 0) { event.preventDefault(); return; }
            const firstElement = focusableElements[0];
            const lastElement = focusableElements[focusableElements.length - 1];
            if (event.shiftKey && document.activeElement === firstElement) {
                event.preventDefault(); lastElement.focus();
            } else if (!event.shiftKey && document.activeElement === lastElement) {
                event.preventDefault(); firstElement.focus();
            }
        }
    };

    if (fabJoin) {
        fabJoin.addEventListener('click', (event) => {
            joinModalTriggerElement = event.currentTarget;
            displayJoinModal();
        });
    } else {
        console.warn('FAB with ID #fab-join not found.');
    }

    window.displayJoinModal = displayJoinModal;
});

