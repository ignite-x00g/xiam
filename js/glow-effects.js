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
    const serviceCards = document.querySelectorAll('.service-card'); // Keep this selector

    // Re-use or redefine serviceModalContent if it was removed
    const serviceModalContent = {
        "Business Ops": {
            title: "Business Operations",
            description: "We optimize your business processes for maximum efficiency and growth. Our services include workflow analysis, automation, and strategic planning."
        },
        "Contact Center": {
            title: "Contact Center Solutions",
            description: "Our state-of-the-art contact center services provide your customers with exceptional support, available 24/7 through multiple channels."
        },
        "IT Support": {
            title: "Comprehensive IT Support",
            description: "Reliable IT support to keep your systems running smoothly. We offer helpdesk services, network management, cybersecurity, and cloud solutions."
        },
        "Professionals": {
            title: "Skilled Professionals",
            description: "Access our pool of highly skilled professionals for your project needs. We provide experts in various fields, from project management to software development."
        }
    };

    if (!modalContainerMain) {
        console.warn('Modal container #modal-container-main not found.');
    }

    if (serviceCards.length > 0 && modalContainerMain) {
        serviceCards.forEach(card => {
            card.addEventListener('click', () => {
                const serviceName = card.querySelector('h3').textContent.trim();
                const content = serviceModalContent[serviceName] ||
                                { title: "Service Details", description: "More information about this service." };

                // Check if modal for this service already exists
                if (modalContainerMain.querySelector(`.opslight-service-modal[data-service="${serviceName}"]`)) {
                    // Optional: Bring to front or indicate it's already open
                    // For now, we don't re-open if it exists. User can close and re-open.
                    // Or, per "one next to each other", they just stay.
                    return;
                }

                // Create modal element
                const modalInstance = document.createElement('div');
                modalInstance.className = 'opslight-service-modal';
                modalInstance.setAttribute('data-service', serviceName);
                modalInstance.innerHTML = `
                    <button class="opslight-modal-close-button" aria-label="Close modal">&times;</button>
                    <h2>${content.title}</h2>
                    <p>${content.description}</p>
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
        if (serviceCards.length === 0) console.warn('No service cards with class .service-card found.');
    }

    // FAB Modal Interaction Logic
    const fabJoin = document.getElementById('fab-join');
    const fabContact = document.getElementById('fab-contact');
    const fabChatbot = document.getElementById('fab-chatbot');
    // modalContainerMain is already defined from service card modals.

    const fabModalContent = {
        "fab-join": {
            title: "Join Our Team",
            description: "We're looking for talented individuals to join OPS. Explore current opportunities and learn about our culture. <br><br> [Placeholder for job listings or application form link]"
        },
        "fab-contact": {
            title: "Contact Us",
            description: "Get in touch with OPS for support or inquiries. <br><br> Email: contact@opsonlinesupport.com <br> Phone: 1-800-OPS-HELP <br><br> [Placeholder for a contact form]"
        },
        "fab-chatbot": {
            title: "AI Chatbot Assistant",
            description: "Our AI Chatbot is here to help you with common questions. <br><br> [Placeholder for Chatbot UI or initiation button]"
        }
    };

    const fabs = [fabJoin, fabContact, fabChatbot];

    fabs.forEach(fab => {
        if (fab) {
            fab.addEventListener('click', () => {
                const fabId = fab.id;
                const content = fabModalContent[fabId];

                if (!content) {
                    console.warn(`No modal content defined for FAB ID: ${fabId}`);
                    return;
                }

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
                    <h2>${content.title}</h2>
                    <p>${content.description}</p>
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
