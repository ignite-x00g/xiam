// js/script.js
document.addEventListener('DOMContentLoaded', function() {
    console.log("Main script loaded.");

    // Initialize Theme (from theme-switcher.js logic)
    const themeToggleButtonDesktop = document.getElementById('theme-toggle-desktop');
    const themeToggleButtonMobile = document.getElementById('mobile-theme-toggle');
    const currentTheme = localStorage.getItem('theme') || 'light';
    document.body.setAttribute('data-theme', currentTheme);
    updateThemeToggleIcon(currentTheme);

    function updateThemeToggleIcon(theme) {
        const iconDesktop = themeToggleButtonDesktop ? themeToggleButtonDesktop.querySelector('i') || document.createElement('i') : null;
        const textDesktop = themeToggleButtonDesktop ? themeToggleButtonDesktop.querySelector('span') : null;
        const iconMobile = themeToggleButtonMobile ? themeToggleButtonMobile.querySelector('i') : null;
        const textMobile = themeToggleButtonMobile ? themeToggleButtonMobile.querySelector('span') : null;

        if (theme === 'dark') {
            if (iconDesktop) {
                iconDesktop.className = 'fas fa-sun'; // Sun icon for dark theme (to switch to light)
                if (!themeToggleButtonDesktop.contains(iconDesktop)) themeToggleButtonDesktop.prepend(iconDesktop);
            }
            if (textDesktop) textDesktop.textContent = 'Light';

            if (iconMobile) iconMobile.className = 'fas fa-sun';
            // Mobile text span already has data-en/data-es, so JS might not need to set text directly
            // Or, it could update a specific part if the span is structured for it.
            // For now, assume CSS/HTML handles "Theme" text, icon shows state.
        } else {
            if (iconDesktop) {
                iconDesktop.className = 'fas fa-moon'; // Moon icon for light theme (to switch to dark)
                if (!themeToggleButtonDesktop.contains(iconDesktop)) themeToggleButtonDesktop.prepend(iconDesktop);
            }
            if (textDesktop) textDesktop.textContent = 'Dark';

            if (iconMobile) iconMobile.className = 'fas fa-moon';
        }
    }

    function toggleTheme() {
        let currentTheme = document.body.getAttribute('data-theme');
        let newTheme = currentTheme === 'light' ? 'dark' : 'light';
        document.body.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeToggleIcon(newTheme);
        console.log(`Theme switched to ${newTheme}`);
    }

    if (themeToggleButtonDesktop) {
        themeToggleButtonDesktop.addEventListener('click', toggleTheme);
    }
    if (themeToggleButtonMobile) {
        themeToggleButtonMobile.addEventListener('click', toggleTheme);
    }
    // Initial icon update
    updateThemeToggleIcon(document.body.getAttribute('data-theme'));


    // Initialize Language (from language-switcher.js logic)
    const languageToggleButtonDesktop = document.getElementById('language-toggle-desktop');
    const languageToggleButtonMobile = document.getElementById('mobile-language-toggle');
    let currentLanguage = localStorage.getItem('language') || 'en';
    console.log(`Initial language: ${currentLanguage}`);
    updateLanguageToggleText(currentLanguage);
    applyTranslations(currentLanguage);


    function updateLanguageToggleText(lang) {
        if (languageToggleButtonDesktop) {
            const textDesktop = languageToggleButtonDesktop.querySelector('span') || languageToggleButtonDesktop;
            textDesktop.textContent = lang === 'en' ? 'ES' : 'EN';
        }
        // Mobile button text is handled by data-en/data-es and applyTranslations
        // but we can update its active display if needed
        if (languageToggleButtonMobile) {
            const mobileSpan = languageToggleButtonMobile.querySelector('span');
            if(mobileSpan) {
                // This ensures the button itself shows the *other* language as the action
                // The actual "Lang" text is translated by applyTranslations
            }
        }
    }

    function applyTranslations(lang) {
        console.log(`Applying translations for: ${lang}`);
        document.querySelectorAll('[data-en], [data-es]').forEach(el => {
            const text = el.getAttribute(`data-${lang}`);
            if (text) {
                if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                    if (el.placeholder !== undefined && (el.hasAttribute('data-en') || el.hasAttribute('data-es'))) {
                         // Check if this specific element is meant to have its placeholder translated
                        el.placeholder = text;
                    }
                } else {
                    el.textContent = text;
                }
            } else {
                console.warn('No translation found for element:', el, `in language: ${lang}`);
            }
        });
        document.documentElement.lang = lang; // Update HTML lang attribute
        // After applying translations, ensure the mobile language toggle text is correct
        // (e.g., if its own span was translated from "Lang" to "Idioma")
        // This is tricky, as applyTranslations would have just set it.
        // The visual cue of which language is *next* is more important.
    }


    function toggleLanguage() {
        currentLanguage = currentLanguage === 'en' ? 'es' : 'en';
        localStorage.setItem('language', currentLanguage);
        applyTranslations(currentLanguage);
        updateLanguageToggleText(currentLanguage);
        console.log(`Language switched to ${currentLanguage}`);
    }

    if (languageToggleButtonDesktop) {
        languageToggleButtonDesktop.addEventListener('click', toggleLanguage);
    }
    if (languageToggleButtonMobile) {
        languageToggleButtonMobile.addEventListener('click', toggleLanguage);
    }
    // Initial translation application
    applyTranslations(currentLanguage);


    // Modal Functionality (from dynamic-modal-manager.js and other modal logic)
    const modalContainer = document.getElementById('modal-container-main');
    const fabContainer = document.querySelector('.fab-container'); // Used to hide FABs when modal is open

    function openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'flex'; // Using flex for centering
            if (fabContainer) fabContainer.style.display = 'none'; // Hide FABs
            // Focus management can be added here
            const firstFocusableElement = modal.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
            if (firstFocusableElement) {
                firstFocusableElement.focus();
            }
        }
    }

    function closeModal(modal) {
        if (modal) {
            modal.style.display = 'none';
            if (fabContainer) fabContainer.style.display = 'flex'; // Show FABs again
        }
    }

    // Event delegation for opening modals
    document.body.addEventListener('click', function(event) {
        // For FABs or any element that specifies a modal to open
        let target = event.target.closest('[data-modal]');
        if (target) {
            const modalId = target.getAttribute('data-modal');
            if (modalId === 'join-modal') { // Specific handling for join modal
                openModal('join-modal');
            } else if (modalId === 'contact-modal') { // Placeholder for contact modal
                console.log('Contact modal to be implemented/opened');
                // Example: openModal('contact-form-modal-id');
            }
            // Add more conditions if other elements should open modals
        }

        // For closing modals
        if (event.target.classList.contains('close-modal')) {
            closeModal(event.target.closest('.opslight-service-modal'));
        }
    });

    // Close modal if backdrop is clicked
    window.addEventListener('click', function(event) {
        document.querySelectorAll('.opslight-service-modal').forEach(modal => {
            if (event.target === modal) {
                closeModal(modal);
            }
        });
    });

    // Keyboard accessibility for modals
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            document.querySelectorAll('.opslight-service-modal').forEach(modal => {
                if (modal.style.display === 'flex') {
                    closeModal(modal);
                }
            });
        }
    });

    // Specific button listeners for FABs (if not covered by data-modal)
    const joinFab = document.getElementById('fab-join');
    const contactFab = document.getElementById('fab-contact'); // Assuming this will trigger a contact modal

    if (joinFab) {
        joinFab.setAttribute('data-modal', 'join-modal'); // Ensure it works with the generic opener
    }
    if (contactFab) {
        // Example: contactFab.setAttribute('data-modal', 'contact-modal-id');
        contactFab.addEventListener('click', () => {
            // For now, let's just log it. Later, this will open the actual contact modal.
            console.log("Contact FAB clicked - to implement contact modal opening.");
            // openModal('contact-form-modal-id'); // When contact modal is ready
        });
    }


    // Mobile Services Menu Toggle
    const mobileServicesToggle = document.getElementById('mobile-services-toggle');
    const mobileServicesMenu = document.getElementById('mobile-services-menu');

    if (mobileServicesToggle && mobileServicesMenu) {
        mobileServicesToggle.addEventListener('click', function(event) {
            event.preventDefault();
            const isActive = mobileServicesMenu.classList.toggle('active');
            mobileServicesToggle.setAttribute('aria-expanded', isActive ? 'true' : 'false');
            if(isActive) {
                mobileServicesMenu.style.display = 'block'; // Make sure it's block before animation
                setTimeout(() => { // Allow display property to take effect
                    mobileServicesMenu.style.opacity = '1';
                    mobileServicesMenu.style.transform = 'translateY(0)';
                }, 10);
            } else {
                mobileServicesMenu.style.opacity = '0';
                mobileServicesMenu.style.transform = 'translateY(20px)';
                setTimeout(() => { // After animation
                    mobileServicesMenu.style.display = 'none';
                }, 300); // Match transition duration
            }
        });

        // Close menu if clicking outside
        document.addEventListener('click', function(event) {
            if (!mobileServicesMenu.contains(event.target) && !mobileServicesToggle.contains(event.target) && mobileServicesMenu.classList.contains('active')) {
                mobileServicesMenu.classList.remove('active');
                mobileServicesToggle.setAttribute('aria-expanded', 'false');
                mobileServicesMenu.style.opacity = '0';
                mobileServicesMenu.style.transform = 'translateY(20px)';
                setTimeout(() => {
                    mobileServicesMenu.style.display = 'none';
                }, 300);
            }
        });
         // Close menu when a link inside it is clicked
        mobileServicesMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                mobileServicesMenu.classList.remove('active');
                mobileServicesToggle.setAttribute('aria-expanded', 'false');
                mobileServicesMenu.style.opacity = '0';
                mobileServicesMenu.style.transform = 'translateY(20px)';
                setTimeout(() => {
                    mobileServicesMenu.style.display = 'none';
                }, 300);
            });
        });
    }


    // Join Us Form Submission (Example, adapt from contact-form.js or new logic)
    const joinForm = document.getElementById('join-form');
    if (joinForm) {
        joinForm.addEventListener('submit', function(event) {
            event.preventDefault();
            console.log('Join form submitted. Data processing placeholder.');
            // In a real scenario, collect data: new FormData(joinForm)
            // Then submit via fetch/AJAX.
            alert('Application submitted (simulated)!'); // Placeholder
            closeModal(joinForm.closest('.opslight-service-modal'));
            joinForm.reset(); // Reset form fields
            // Reset custom dropdowns to their initial state
            resetDropdown('employment-type-toggle', 'employment-type-checkboxes');
            resetDropdown('join-areas-trigger', 'join-areas-options');

        });
    }
    function resetDropdown(toggleId, contentId) {
        const toggleButton = document.getElementById(toggleId);
        const contentDiv = document.getElementById(contentId);
        if (toggleButton && contentDiv) {
            // Reset checkboxes within the dropdown
            contentDiv.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
                checkbox.checked = false;
            });
            // Update the toggle button text to its default
            // This assumes the default text is stored in data-en/data-es or is the initial textContent
            // For simplicity, let's assume it needs to revert to what language switcher sets
            const defaultTextKey = toggleButton.getAttribute(`data-${currentLanguage}`) || toggleButton.getAttribute('data-en'); // Fallback to 'en'
            if (defaultTextKey) {
                 // If the button text itself is translated:
                toggleButton.childNodes.forEach(node => {
                    if (node.nodeType === Node.TEXT_NODE) {
                        node.textContent = defaultTextKey + " "; // Add space for the arrow
                        return;
                    }
                });
                // If text is in a span:
                // const textSpan = toggleButton.querySelector('span.button-text-label'); // Need a class to target
                // if(textSpan) textSpan.textContent = defaultTextKey;

            }
            // Close the dropdown visually
            toggleButton.setAttribute('aria-expanded', 'false');
            contentDiv.classList.remove('show');
            contentDiv.style.display = 'none'; // Ensure it's hidden

            console.log(`Dropdown ${toggleId} reset.`);
        }
    }


    // Dropdown Checkbox Group (for Join Us form)
    function setupDropdownCheckboxGroup(toggleId, contentId, doneButtonId) {
        const toggleButton = document.getElementById(toggleId);
        const contentDiv = document.getElementById(contentId);
        const doneButton = document.getElementById(doneButtonId);

        if (!toggleButton || !contentDiv || !doneButton) {
            // console.warn(`Dropdown elements not found for ${toggleId}`);
            return;
        }

        toggleButton.addEventListener('click', function() {
            const isExpanded = toggleButton.getAttribute('aria-expanded') === 'true';
            toggleButton.setAttribute('aria-expanded', !isExpanded);
            contentDiv.style.display = isExpanded ? 'none' : 'block'; // Simple toggle
            contentDiv.classList.toggle('show',!isExpanded);
        });

        doneButton.addEventListener('click', function() {
            toggleButton.setAttribute('aria-expanded', 'false');
            contentDiv.style.display = 'none';
            contentDiv.classList.remove('show');

            // Update toggle button text with selected items
            const selectedLabels = [];
            contentDiv.querySelectorAll('input[type="checkbox"]:checked').forEach(checkbox => {
                // Find the text associated with the checkbox, usually in a sibling span or parent label
                let labelElement = checkbox.nextElementSibling; // Common: <input><label> or <input><span>
                if (labelElement && labelElement.tagName === 'SPAN') {
                    selectedLabels.push(labelElement.textContent.trim());
                } else {
                     // Try parent label's text content, excluding the input itself
                    labelElement = checkbox.closest('label');
                    if (labelElement) {
                       // Clone the label and remove the checkbox to get only the text
                        const clone = labelElement.cloneNode(true);
                        clone.querySelector('input[type="checkbox"]').remove();
                        selectedLabels.push(clone.textContent.trim());
                    }
                }
            });

            // Update the main part of the button text, keeping the arrow
            const arrowNode = toggleButton.querySelector('.dropdown-arrow') || document.createElement('span'); // Assuming an arrow element exists or create one
            arrowNode.className = 'dropdown-arrow'; // Ensure it has a class if created
            arrowNode.innerHTML = ' &#9662;'; // Down arrow, or use class for FontAwesome

            let newText = "";
            const originalText = toggleButton.getAttribute(`data-${currentLanguage}`) || toggleButton.getAttribute('data-en');

            if (selectedLabels.length > 0) {
                newText = selectedLabels.join(', ');
            } else {
                newText = originalText || "Select Options"; // Fallback to original or generic
            }

            // Clear existing text nodes, preserve arrow if it's a child element
            Array.from(toggleButton.childNodes).forEach(child => {
                if (child.nodeType === Node.TEXT_NODE) {
                    toggleButton.removeChild(child);
                }
            });
             // Prepend new text
            toggleButton.prepend(document.createTextNode(newText + " "));
            // Ensure arrow is still there if it was part of original markup, or re-add if needed
            // This part is tricky without knowing exact HTML structure of button
            // For simplicity, assuming the original text node is what we replace:
            // toggleButton.childNodes[0].textContent = newText + " "; // Might break if icon is first

        });
    }

    setupDropdownCheckboxGroup('employment-type-toggle', 'employment-type-checkboxes', 'employment-done');
    setupDropdownCheckboxGroup('join-areas-trigger', 'join-areas-options', 'areas-done');


    // Service Worker Registration
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', function() {
            navigator.serviceWorker.register('/js/service-worker.js')
                .then(function(registration) {
                    console.log('ServiceWorker registration successful with scope: ', registration.scope);
                })
                .catch(function(error) {
                    console.log('ServiceWorker registration failed: ', error);
                });
        });
    }

    console.log("Main script fully initialized.");
});

// Placeholder for dynamic content loading if needed later
// function loadServiceDetails(serviceName) {
// console.log(`Load details for ${serviceName}`);
// Add AJAX/fetch calls to load content into a modal or section
// }
