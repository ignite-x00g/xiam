// js/main_script.js
// General script, specific component logic is in component files.

document.addEventListener('DOMContentLoaded', () => {
    const fabJoin = document.getElementById('fab-join'); // Trigger for Join Us modal

    // Ensure translations are applied when the Join Us modal becomes visible,
    // as its content is loaded dynamically.
    if (fabJoin) {
        fabJoin.addEventListener('click', () => {
            // dynamic-modal-manager will handle opening the modal
            // and loading components/join-us/join-us.html.
            // components/join-us/join-us.js (specifically window.initializeJoinUsFormSections)
            // will be called by dynamic-modal-manager to handle its internal interactivity.

            // We ensure translations are fresh if language changed while modal was hidden.
            // This should ideally be triggered after the modal content is confirmed to be loaded
            // and initialized. A small timeout helps, but a callback or event system
            // from dynamic-modal-manager would be more robust for this.
            if (window.applyTranslations && window.getCurrentLanguage) {
                setTimeout(() => {
                    // Check if the modal and its form content are actually in the DOM
                    // This is a safeguard to ensure translations are applied to existing elements.
                    const joinUsModal = document.getElementById('join-us-modal');
                    if (joinUsModal && joinUsModal.style.display !== 'none') {
                        const joinForm = joinUsModal.querySelector('#join-form');
                        if (joinForm) {
                            // console.log("Applying translations to Join Us modal content after fab click.");
                            window.applyTranslations(window.getCurrentLanguage());
                        }
                    }
                }, 150); // Timeout to allow modal content to be loaded and JS initialized.
            }
        });
    }

    // Other global initializations that might belong in main_script.js can go here.
});
