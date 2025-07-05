// js/mobile-fab-nav.js
// Handles the new FAB-based mobile navigation

document.addEventListener('DOMContentLoaded', () => {
    const fabToggle = document.getElementById('newFabToggle');
    const mobileNav = document.getElementById('newMobileNav');
    const servicesToggle = document.getElementById('newMobileServicesToggle');
    const servicesMenu = document.getElementById('newMobileServicesMenu');

    if (fabToggle && mobileNav) {
        // console.log("New FAB mobile nav elements found.");
        fabToggle.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent document click listener from closing it immediately
            mobileNav.classList.toggle('active');
            const isExpanded = mobileNav.classList.contains('active');
            fabToggle.setAttribute('aria-expanded', isExpanded);
            const icon = fabToggle.querySelector('i');
            if (icon) {
                icon.classList.toggle('fa-bars', !isExpanded);
                icon.classList.toggle('fa-times', isExpanded);
            }
            if (!isExpanded && servicesMenu && servicesMenu.classList.contains('active')) {
                servicesMenu.classList.remove('active');
                servicesMenu.setAttribute('aria-hidden', 'true');
                if(servicesToggle) servicesToggle.setAttribute('aria-expanded', 'false');
            }
        });
    } else {
        // console.warn("FAB Toggle (#newFabToggle) or Mobile Nav (#newMobileNav) not found.");
    }

    if (servicesToggle && servicesMenu) {
        // console.log("New FAB mobile services menu elements found.");
        servicesToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            const isExpanded = servicesMenu.classList.toggle('active');
            servicesMenu.setAttribute('aria-hidden', !isExpanded);
            servicesToggle.setAttribute('aria-expanded', isExpanded);
        });

        servicesMenu.querySelectorAll('button[data-service-target]').forEach(button => {
            button.addEventListener('click', () => {
                 if (servicesMenu.classList.contains('active')) {
                    servicesMenu.classList.remove('active');
                    servicesMenu.setAttribute('aria-hidden', 'true');
                    if(servicesToggle) servicesToggle.setAttribute('aria-expanded', 'false');
                 }
                 // dynamic-modal-manager will open the service modal
            });
        });

    } else {
        // console.warn("Mobile Services Toggle (#newMobileServicesToggle) or Menu (#newMobileServicesMenu) not found.");
    }

    const mobileLangToggle = document.getElementById('newMobileLanguageToggle');
    const mobileThemeToggle = document.getElementById('newMobileThemeToggle');

    if (mobileLangToggle && typeof window.toggleLanguage === 'function') {
        mobileLangToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            window.toggleLanguage();
        });
    }
    if (mobileThemeToggle && typeof window.toggleTheme === 'function') {
        mobileThemeToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            window.toggleTheme();
        });
    }

    // Close FAB menus if clicking outside
    document.addEventListener('click', (event) => {
        const isMobileNavActive = mobileNav && mobileNav.classList.contains('active');
        const isServicesMenuActive = servicesMenu && servicesMenu.classList.contains('active');

        // Close main FAB nav if click is outside nav and toggle
        if (isMobileNavActive) {
            const clickedInsideNav = mobileNav.contains(event.target);
            const clickedOnFabToggle = fabToggle && fabToggle.contains(event.target);

            if (!clickedInsideNav && !clickedOnFabToggle) {
                // console.log('[MFN] Clicked outside main mobile nav and its toggle. Closing main nav.'); // Cleanup
                mobileNav.classList.remove('active');
                if (fabToggle) {
                    fabToggle.setAttribute('aria-expanded', 'false');
                    const icon = fabToggle.querySelector('i');
                    if (icon) {
                        icon.classList.remove('fa-times');
                        icon.classList.add('fa-bars');
                    }
                }
                // If main FAB nav is closed, also ensure services menu is closed
                if (servicesMenu && servicesMenu.classList.contains('active')) {
                    servicesMenu.classList.remove('active');
                    servicesMenu.setAttribute('aria-hidden', 'true');
                    if(servicesToggle) servicesToggle.setAttribute('aria-expanded', 'false');
                }
            }
        }
        // Separately, close services menu if click is outside services menu and its toggle
        // This logic should consider if the click was inside the main mobileNav, as servicesMenu is often triggered from within mobileNav
        if (isServicesMenuActive) {
            const clickedInsideServicesMenu = servicesMenu.contains(event.target);
            const clickedOnServicesToggle = servicesToggle && servicesToggle.contains(event.target);

            // If the click is outside the services menu itself AND outside its toggle button
            if (!clickedInsideServicesMenu && !clickedOnServicesToggle) {
                // Further check: if the main mobile nav is still open and the click was inside it,
                // the services menu might not need to close, depending on desired UX.
                // For now, if click is outside services menu & its toggle, it closes.
                // console.log('[MFN] Clicked outside services menu and its toggle. Closing services menu.'); // Cleanup
                servicesMenu.classList.remove('active');
                servicesMenu.setAttribute('aria-hidden', 'true');
                if (servicesToggle) servicesToggle.setAttribute('aria-expanded', 'false');
            }
        }
    });

    // Add ESC key listener for closing mobile FAB nav and its sub-menu
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            const isMobileNavActive = mobileNav && mobileNav.classList.contains('active');
            const isServicesMenuActive = servicesMenu && servicesMenu.classList.contains('active');

            if (isMobileNavActive || isServicesMenuActive) {
                // Check if a modal is open. If so, let the modal's ESC handler take precedence.
                const anyModalOpen = Array.from(document.querySelectorAll('.modal-overlay')).some(
                    modal => modal.style.display === 'flex' || modal.style.display === 'block'
                );

                if (!anyModalOpen) {
                    if (isServicesMenuActive) {
                        servicesMenu.classList.remove('active');
                        servicesMenu.setAttribute('aria-hidden', 'true');
                        if (servicesToggle) servicesToggle.setAttribute('aria-expanded', 'false');
                        // Typically, closing a submenu should not automatically close its parent menu
                        // unless that's the desired UX. Here, we allow the main nav to remain.
                        // If the main nav should also close, additional logic is needed.
                        // For now, ESC will close the topmost active FAB menu element.
                    } else if (isMobileNavActive) { // Only close main nav if service menu wasn't the target
                        mobileNav.classList.remove('active');
                        if (fabToggle) {
                            fabToggle.setAttribute('aria-expanded', 'false');
                            const icon = fabToggle.querySelector('i');
                            if (icon) {
                                icon.classList.remove('fa-times');
                                icon.classList.add('fa-bars');
                            }
                        }
                        // If services menu was open INSIDE mobileNav, it's already handled by the click-outside logic
                        // or if we want explicit close:
                        // if (servicesMenu && servicesMenu.classList.contains('active')) {
                        //     servicesMenu.classList.remove('active');
                        //     servicesMenu.setAttribute('aria-hidden', 'true');
                        //     if(servicesToggle) servicesToggle.setAttribute('aria-expanded', 'false');
                        // }
                    }
                }
            }
        }
    });

    // Add ESC key listener for closing mobile FAB nav and its sub-menu
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            const isMobileNavActive = mobileNav && mobileNav.classList.contains('active');
            const isServicesMenuActive = servicesMenu && servicesMenu.classList.contains('active');

            if (isMobileNavActive || isServicesMenuActive) {
                // Check if a modal is open. If so, let the modal's ESC handler take precedence.
                const anyModalOpen = Array.from(document.querySelectorAll('.modal-overlay')).some(
                    modal => modal.style.display === 'flex' || modal.style.display === 'block'
                );

                if (!anyModalOpen) {
                    if (isServicesMenuActive) {
                        servicesMenu.classList.remove('active');
                        servicesMenu.setAttribute('aria-hidden', 'true');
                        if (servicesToggle) servicesToggle.setAttribute('aria-expanded', 'false');
                        // Typically, closing a submenu should not automatically close its parent menu
                        // unless that's the desired UX. Here, we allow the main nav to remain.
                        // If the main nav should also close, additional logic is needed.
                        // For now, ESC will close the topmost active FAB menu element.
                    } else if (isMobileNavActive) { // Only close main nav if service menu wasn't the target
                        mobileNav.classList.remove('active');
                        if (fabToggle) {
                            fabToggle.setAttribute('aria-expanded', 'false');
                            const icon = fabToggle.querySelector('i');
                            if (icon) {
                                icon.classList.remove('fa-times');
                                icon.classList.add('fa-bars');
                            }
                        }
                        // If services menu was open INSIDE mobileNav, it's already handled by the click-outside logic
                        // or if we want explicit close:
                        // if (servicesMenu && servicesMenu.classList.contains('active')) {
                        //     servicesMenu.classList.remove('active');
                        //     servicesMenu.setAttribute('aria-hidden', 'true');
                        //     if(servicesToggle) servicesToggle.setAttribute('aria-expanded', 'false');
                        // }
                    }
                }
            }
        }
    });
});
