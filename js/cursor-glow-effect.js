// FluidGlow Cursor Effect
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
