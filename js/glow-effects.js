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

// OpsLight Interactive Tiles - Modal Interaction
document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('opslight-modal');
    const closeModalButton = document.querySelector('.modal-close-button');
    const serviceCards = document.querySelectorAll('.service-card');
    const modalTitle = document.getElementById('modal-title');
    const modalDescription = document.getElementById('modal-description');

    // Predefined content for modals (can be expanded or fetched dynamically)
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

    if (modal && closeModalButton && serviceCards.length > 0) {
        serviceCards.forEach(card => {
            card.addEventListener('click', () => {
                const serviceName = card.querySelector('h3').textContent.trim();
                const content = serviceModalContent[serviceName] ||
                                { title: "Service Details", description: "More information about this service." };

                if (modalTitle) modalTitle.textContent = content.title;
                if (modalDescription) modalDescription.textContent = content.description;

                modal.classList.remove('modal-hidden');
                modal.classList.add('modal-visible');
                // Optional: Add backdrop blur
                // modal.classList.add('modal-backdrop-blur');
            });
        });

        closeModalButton.addEventListener('click', () => {
            modal.classList.remove('modal-visible');
            modal.classList.add('modal-hidden');
            // Optional: Remove backdrop blur
            // modal.classList.remove('modal-backdrop-blur');
        });

        // Close modal if user clicks outside of the modal content
        window.addEventListener('click', (event) => {
            if (event.target === modal) {
                modal.classList.remove('modal-visible');
                modal.classList.add('modal-hidden');
                // Optional: Remove backdrop blur
                // modal.classList.remove('modal-backdrop-blur');
            }
        });

    } else {
        if (!modal) console.warn('Modal element #opslight-modal not found.');
        if (!closeModalButton) console.warn('Modal close button .modal-close-button not found.');
        if (serviceCards.length === 0) console.warn('No service cards with class .service-card found.');
    }
});
