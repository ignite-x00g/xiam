// FluidGlow Cursor Effect (replaces/enhances GlowMotion)
document.addEventListener('DOMContentLoaded', () => {
    const glowEffectElement = document.querySelector('.glow-effect');

    if (glowEffectElement) {
        let mouseX = window.innerWidth / 2;
        let mouseY = window.innerHeight / 2;
        let glowX = window.innerWidth / 2;
        let glowY = window.innerHeight / 2;
        const inertia = 0.07; // Adjust for more/less "lag" (0.01 to 0.1 works well)

        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
        });

        function updateGlowPosition() {
            // Calculate the distance to the target
            let dx = mouseX - glowX;
            let dy = mouseY - glowY;

            // Move a fraction of the distance
            glowX += dx * inertia;
            glowY += dy * inertia;

            glowEffectElement.style.setProperty('--x', `${glowX}px`);
            glowEffectElement.style.setProperty('--y', `${glowY}px`);

            requestAnimationFrame(updateGlowPosition);
        }

        // Start the animation loop
        updateGlowPosition();

    } else {
        console.warn('Glow effect element .glow-effect not found.');
    }
});

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
                if (modalContainerMain.querySelector(`.opslight-service-modal[data-service="${serviceKey}"]`)) {
                    // Optional: Bring to front or indicate it's already open
                    // For now, we don't re-open if it exists. User can close and re-open.
                    // Or, per "one next to each other", they just stay.
                    return;
                }

                // Create modal element
                const modalInstance = document.createElement('div');
                modalInstance.className = 'opslight-service-modal';
                modalInstance.setAttribute('data-service', serviceKey);
                modalInstance.innerHTML = `
                    <button class="opslight-modal-close-button" aria-label="Close modal">&times;</button>
                    <h2>${title}</h2>
                    <p>${description}</p>
                `;

                // Append to container and show container
                modalContainerMain.appendChild(modalInstance);
                modalContainerMain.style.display = 'flex';

                // Add event listener to this new modal's close button
                modalInstance.querySelector('.opslight-modal-close-button').addEventListener('click', () => {
                    modalInstance.remove();
                    // If no modals are left, hide the container
                    if (modalContainerMain.children.length === 0) {
                        modalContainerMain.style.display = 'none';
                    }
                });
            });
        });

        // Event listener for backdrop click (to close all modals)
        // This listener is already here from the previous step and will handle closing all modals.
        // No need to duplicate it if it's already correctly placed and functional.
        // Ensure it's outside the serviceCards.forEach loop.
        modalContainerMain.addEventListener('click', (event) => {
            if (event.target === modalContainerMain) { // Clicked on the backdrop itself
                // Remove all modal instances
                while (modalContainerMain.firstChild) {
                    modalContainerMain.removeChild(modalContainerMain.firstChild);
                }
                modalContainerMain.style.display = 'none';
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

                let fabTranslationKeyPrefix = '';
                if (fabId === "fab-join") fabTranslationKeyPrefix = "modal.fabJoin";
                else if (fabId === "fab-contact") fabTranslationKeyPrefix = "modal.fabContact";
                else if (fabId === "fab-chatbot") fabTranslationKeyPrefix = "modal.fabChatbot";
                else {
                    console.warn(`Unknown FAB ID: ${fabId}`);
                    return; // Do not proceed if ID is unknown
                }

                const title = window.getTranslatedText ? window.getTranslatedText(`${fabTranslationKeyPrefix}.title`) : fabId; // Fallback
                const description = window.getTranslatedText ? window.getTranslatedText(`${fabTranslationKeyPrefix}.description`) : "Description unavailable.";


                // Check if modal for this FAB already exists
                if (modalContainerMain.querySelector(`.opslight-service-modal[data-fab-id="${fabId}"]`)) {
                    // Optional: Bring to front or indicate it's already open. For now, do nothing.
                    return;
                }

                // Create modal element
                const modalInstance = document.createElement('div');
                // Using same class as service modals for now, can differentiate if needed
                modalInstance.className = 'opslight-service-modal';
                modalInstance.setAttribute('data-fab-id', fabId); // Unique attribute for FAB modals
                modalInstance.innerHTML = `
                    <button class="opslight-modal-close-button" aria-label="Close modal">&times;</button>
                    <h2>${title}</h2>
                    <p>${description}</p>
                `;

                // Append to container and show container
                modalContainerMain.appendChild(modalInstance);
                modalContainerMain.style.display = 'flex'; // Ensure container is visible

                // Add event listener to this new modal's close button
                modalInstance.querySelector('.opslight-modal-close-button').addEventListener('click', () => {
                    modalInstance.remove();
                    // If no modals are left (neither service nor FAB), hide the container
                    if (modalContainerMain.children.length === 0) {
                        modalContainerMain.style.display = 'none';
                    }
                });
            });
        } else {
            // Log if a FAB element is not found, e.g. console.warn(`FAB element not found for one of [fab-join, fab-contact, fab-chatbot]`);
            // This check is implicitly handled by the forEach loop if an element is null.
        }
    });
});
