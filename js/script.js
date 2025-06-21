// js/script.js
document.addEventListener('DOMContentLoaded', () => {
    const fabJoin = document.getElementById('fab-join');
    const modalContainerMain = document.getElementById('modal-container-main');

    let joinModal = null; // Will hold the #join-modal DOM element
    let joinModalTriggerElement = null; // To store the element that opened the modal
    let currentJoinModalSection = 'join-modal-section-1'; // To track current visible section

    // Helper: Get focusable elements
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

    function createJoinModalStructure() {
        // Returns the HTML string for the modal.
        // This allows easy recreation if the modal is removed from DOM by another script.
        return `
            <div id="join-modal" class="standard-modal" role="dialog" aria-modal="true" aria-labelledby="join-modal-title" style="display: none;" tabindex="-1">
                <div class="standard-modal-overlay" data-modal-close></div>
                <div class="standard-modal-dialog" role="document">
                    <header class="standard-modal-header">
                        <h2 class="standard-modal-title" id="join-modal-title" data-translate-key="modal.fabJoin.title">Join Our Team</h2>
                        <button class="standard-modal-close" aria-label="Close Join Us Form" data-modal-close>&times;</button>
                    </header>
                    <section class="standard-modal-content">
                        <!-- Section 1: Full Name & Email -->
                        <section id="join-modal-section-1" class="join-modal-section" style="display: block;">
                            <div class="form-field">
                                <label for="join-fullName" data-translate-key="joinModal.section1.fullNameLabel">Full Name:</label>
                                <input type="text" id="join-fullName" name="fullName" data-placeholder-translate-key="joinModal.section1.fullNamePlaceholder" placeholder="Enter your full name">
                            </div>
                            <div class="form-field">
                                <label for="join-email" data-translate-key="joinModal.section1.emailLabel">Email:</label>
                                <input type="email" id="join-email" name="email" data-placeholder-translate-key="joinModal.section1.emailPlaceholder" placeholder="Enter your email address">
                            </div>
                            <!-- Footer for this section will be part of standard-modal-footer if we adapt fully -->
                        </section>

                        <!-- Section 2: Contact Details -->
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

                        <!-- Section 3: Membership Preferences -->
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
                        <!-- Buttons will be dynamically shown/hidden by JS based on current section -->
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
                console.error('Modal container #modal-container-main not found. Cannot create Join Us modal.');
                return false;
            }
            modalContainerMain.insertAdjacentHTML('beforeend', createJoinModalStructure());
            joinModal = document.getElementById('join-modal');

            if (!joinModal) {
                console.error('Failed to create #join-modal in DOM.');
                return false;
            }

            // Attempt to translate its content if translation functions are available
            if (window.loadTranslations) { // This is the preferred way if language-switcher.js exposes it
                window.loadTranslations(); // Assumes loadTranslations handles newly added content by re-querying the DOM
            } else if (window.getTranslatedText) { // Fallback for individual elements
                joinModal.querySelectorAll('[data-translate-key]').forEach(element => {
                    const key = element.getAttribute('data-translate-key');
                    // For placeholders
                    if (element.hasAttribute('data-placeholder-translate-key')) {
                         const placeholderKey = element.getAttribute('data-placeholder-translate-key');
                         element.setAttribute('placeholder', window.getTranslatedText(placeholderKey));
                    }
                    // For text content of specific tags
                    if (['BUTTON', 'LABEL', 'H2', 'H3', 'OPTION'].includes(element.tagName)) {
                        element.textContent = window.getTranslatedText(key);
                    }
                });
                // Specifically translate the close button's aria-label for #join-modal
                const closeButtonAria = joinModal.querySelector('.standard-modal-close'); // Updated selector
                if(closeButtonAria) {
                    closeButtonAria.setAttribute('aria-label', window.getTranslatedText('joinModal.closeButtonAriaLabel') || 'Close Join Us Form');
                }
            }
            attachJoinModalListeners(); // Attach listeners since it's newly created
        }
        return true;
    }

    function attachJoinModalListeners() {
        if (!joinModal) return;

        const closeButton = joinModal.querySelector('.standard-modal-close'); // Updated selector
        // Use .onclick to ensure only one listener, replaces previous if any on this specific element instance
        if (closeButton) closeButton.onclick = () => closeJoinModal();

        // Attach to buttons in the new footer
        const prevButton = joinModal.querySelector('.standard-modal-footer .join-modal-prev');
        const nextButton = joinModal.querySelector('.standard-modal-footer .join-modal-next');
        const submitButtonFooter = joinModal.querySelector('.standard-modal-footer .join-modal-submit');

        if (prevButton) {
            prevButton.onclick = (e) => {
                // Determine current section and find previous. This logic might need to be smarter.
                // For now, assuming data attributes on sections or a direct way to find target.
                // This is simplified, actual target section logic needs to be robust.
                if (currentJoinModalSection === 'join-modal-section-3') showJoinModalSection('join-modal-section-2');
                else if (currentJoinModalSection === 'join-modal-section-2') showJoinModalSection('join-modal-section-1');
            };
        }
        if (nextButton) {
            nextButton.onclick = (e) => {
                if (currentJoinModalSection === 'join-modal-section-1') showJoinModalSection('join-modal-section-2');
                else if (currentJoinModalSection === 'join-modal-section-2') showJoinModalSection('join-modal-section-3');
            };
        }

        if (submitButtonFooter) {
            submitButtonFooter.onclick = (event) => {
                event.preventDefault();
                console.log('Join Us Form submitted (placeholder).');
                const statusMsg = joinModal.querySelector('#join-modal-submission-status');
                if (statusMsg) {
                    statusMsg.textContent = (window.getTranslatedText && window.getTranslatedText('joinModal.alert.formSubmittedSuccess')) || 'Form submitted successfully!';
                }
            };
        }
    }

    function displayJoinModal() {
        if (!ensureJoinModalInDOM()) { // This function now ensures joinModal is valid and listeners are attached.
            console.error("Join modal could not be ensured in DOM. Aborting display.");
            return;
        }

        // Set triggerElement for dynamic-modal-manager.js Escape key integration
        // This property is read by dynamic-modal-manager.js
        if (joinModal) joinModal.triggerElement = joinModalTriggerElement;

        showJoinModalSection('join-modal-section-1'); // Reset to the first section
        joinModal.style.display = 'flex';
        document.body.style.overflow = 'hidden'; // Prevent background scrolling

        // Focus management: focus first element in the current section or modal itself
        const currentSectionElement = joinModal.querySelector(`#${currentJoinModalSection}`);
        const focusableElements = window.getFocusableElements(currentSectionElement || joinModal);
        if (focusableElements.length > 0) {
            focusableElements[0].focus();
        } else {
            joinModal.focus(); // Fallback to modal itself
        }

        // Add keydown listener for Tab trapping and Escape, remove previous to avoid duplication
        joinModal.removeEventListener('keydown', joinModalKeydownListener);
        joinModal.addEventListener('keydown', joinModalKeydownListener);
    }

    function closeJoinModal() {
        if (!joinModal) return;
        joinModal.style.display = 'none';
        document.body.style.overflow = '';
        joinModal.removeEventListener('keydown', joinModalKeydownListener);

        // Restore focus to the element that opened the modal
        if (joinModal.triggerElement && typeof joinModal.triggerElement.focus === 'function') {
            joinModal.triggerElement.focus();
        }
        // Clear submission status if any
        const statusMsg = joinModal.querySelector('#join-modal-submission-status');
        if (statusMsg) statusMsg.textContent = '';
    }

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
            if (focusableInSection.length > 0) {
                focusableInSection[0].focus();
            } else {
                 sectionToShow.setAttribute('tabindex', '-1');
                 sectionToShow.focus();
            }

            // Update button visibility in the footer
            const prevButton = joinModal.querySelector('.standard-modal-footer .join-modal-prev');
            const nextButton = joinModal.querySelector('.standard-modal-footer .join-modal-next');
            const submitButton = joinModal.querySelector('.standard-modal-footer .join-modal-submit');

            if (prevButton && nextButton && submitButton) {
                prevButton.style.display = 'none';
                nextButton.style.display = 'none';
                submitButton.style.display = 'none';

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
        if (!joinModal || joinModal.style.display === 'none') return; // Only act if modal is visible

        if (event.key === 'Escape') {
            closeJoinModal();
        }
        if (event.key === 'Tab') {
            // Get focusable elements only from the currently visible section
            const currentSectionElement = joinModal.querySelector(`#${currentJoinModalSection}`);
            const focusableElements = window.getFocusableElements(currentSectionElement || joinModal);

            if (focusableElements.length === 0) { // Should not happen if modal/section is focusable
                event.preventDefault();
                return;
            }
            const firstElement = focusableElements[0];
            const lastElement = focusableElements[focusableElements.length - 1];

            if (event.shiftKey && document.activeElement === firstElement) { // Shift+Tab on first element
                event.preventDefault();
                lastElement.focus(); // Wrap to last
            } else if (!event.shiftKey && document.activeElement === lastElement) { // Tab on last element
                event.preventDefault();
                firstElement.focus(); // Wrap to first
            }
        }
    };

    // Attach event listener to the FAB Join button
    if (fabJoin) {
        fabJoin.addEventListener('click', (event) => {
            joinModalTriggerElement = event.currentTarget; // Store the button that was clicked
            displayJoinModal();
        });
    } else {
        console.warn('FAB with ID #fab-join not found.');
    }
});
