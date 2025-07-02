document.addEventListener("DOMContentLoaded", () => {

  // ================================================================
  // LANGUAGE TOGGLE (Desktop & Mobile)
  // =================================================================

  let currentLanguage = localStorage.getItem("language") || "en";
  const langToggleDesktop = document.getElementById("language-toggle-desktop");
  const langToggleMobile  = document.getElementById("language-toggle-mobile");

  function updateLanguage(lang) {
    const translatableElements = document.querySelectorAll("[data-en]");
    translatableElements.forEach((el) => {
      el.textContent = (lang === "en")
        ? el.getAttribute("data-en")
        : el.getAttribute("data-es");
    });
  }

  // Initialize language on load
  document.body.setAttribute("lang", currentLanguage);
  updateLanguage(currentLanguage);

  // Set initial button labels
  function setLanguageButtonLabels() {
    if (langToggleDesktop) {
      langToggleDesktop.textContent = (currentLanguage === "en") ? "ES" : "EN";
    }
    if (langToggleMobile) {
      const mobileSpan = langToggleMobile.querySelector("span") || langToggleMobile;
      mobileSpan.textContent = (currentLanguage === "en") ? "ES" : "EN";
    }
  }
  setLanguageButtonLabels();

  function toggleLanguage() {
    currentLanguage = (currentLanguage === "en") ? "es" : "en";
    localStorage.setItem("language", currentLanguage);
    document.body.setAttribute("lang", currentLanguage);
    updateLanguage(currentLanguage);
    setLanguageButtonLabels();
  }

  // Event listeners for language toggles
  if (langToggleDesktop) {
    langToggleDesktop.addEventListener("click", toggleLanguage);
  }
  if (langToggleMobile) {
    langToggleMobile.addEventListener("click", toggleLanguage);
  }

  // ================================================================
  // THEME TOGGLE (Desktop & Mobile)
  // =================================================================

  const themeToggleDesktop = document.getElementById("theme-toggle-desktop");
  const themeToggleMobile  = document.getElementById("theme-toggle-mobile");
  const bodyElement = document.body;
  const savedTheme = localStorage.getItem("theme") || "light";

  // Apply the saved theme on load
  bodyElement.setAttribute("data-theme", savedTheme);

  // Helper to set up a single theme button
  function setupThemeToggle(button) {
    if (!button) return;

    button.textContent = (savedTheme === "light") ? "Dark" : "Light";

    button.addEventListener("click", () => {
      const currentTheme = bodyElement.getAttribute("data-theme");
      if (currentTheme === "light") {
        bodyElement.setAttribute("data-theme", "dark");
        button.textContent = "Light";
        localStorage.setItem("theme", "dark");
      } else {
        bodyElement.setAttribute("data-theme", "light");
        button.textContent = "Dark";
        localStorage.setItem("theme", "light");
      }
    });
  }

  setupThemeToggle(themeToggleDesktop);
  setupThemeToggle(themeToggleMobile);

  // ================================================================
  // Right-Side Main Menu: Open/Close
  // =================================================================
  const menuOpenBtn = document.getElementById('menu-open');
  const menuCloseBtn = document.getElementById('menu-close');
  const rightSideMenu = document.getElementById('rightSideMenu');

  if (menuOpenBtn && menuCloseBtn && rightSideMenu) {
    menuOpenBtn.addEventListener('click', () => {
      rightSideMenu.classList.add('open');
    });
    menuCloseBtn.addEventListener('click', () => {
      rightSideMenu.classList.remove('open');
    });
  }

  // ================================================================
  // Services Sub-Menu: Slide Up
  // =================================================================
  const servicesTrigger = document.querySelector('.services-trigger button');
  const servicesSubMenu = document.getElementById('servicesSubMenu');

  if (servicesTrigger && servicesSubMenu) {
    servicesTrigger.addEventListener('click', (e) => {
      e.stopPropagation();
      servicesSubMenu.classList.toggle('open');
    });

    document.addEventListener('click', (evt) => {
      const clickInsideTrigger = servicesTrigger.contains(evt.target);
      const clickInsideSubMenu = servicesSubMenu.contains(evt.target);
      if (!clickInsideTrigger && !clickInsideSubMenu) {
        servicesSubMenu.classList.remove('open');
      }
    });
  }

  // ================================================================
  // Modals (Join Us & Contact Us)
  // =================================================================
  const modalOverlays = document.querySelectorAll('.modal-overlay');
  const closeModalButtons = document.querySelectorAll('[data-close]');
  const floatingIcons = document.querySelectorAll('.floating-icon');

  // Open modals
  floatingIcons.forEach(icon => {
    icon.addEventListener('click', () => {
      const modalId = icon.getAttribute('data-modal');
      const targetModal = document.getElementById(modalId);
      if (targetModal) {
        targetModal.classList.add('active');
      }
    });
  });

  // Close modals via close button
  closeModalButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const parentModal = btn.closest('.modal-overlay');
      if (parentModal) {
        parentModal.classList.remove('active');
      }
    });
  });

  // Close modal by clicking outside or pressing ESC
  modalOverlays.forEach(overlay => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        overlay.classList.remove('active');
      }
    });
    overlay.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        overlay.classList.remove('active');
      }
    });
  });
  
  // Helper function to update the Employment Type toggle button's visual state
  function updateEmploymentToggleButton(buttonElement, newExpandedState, currentLang) {
    const buttonTextSpan = buttonElement.querySelector('span');
    if (buttonTextSpan) {
      if (newExpandedState) { // If it is now expanded
        buttonTextSpan.setAttribute('data-en', 'Hide Options');
        buttonTextSpan.setAttribute('data-es', 'Ocultar Opciones');
      } else { // If it is now collapsed
        buttonTextSpan.setAttribute('data-en', 'Show Options');
        buttonTextSpan.setAttribute('data-es', 'Mostrar Opciones');
      }
      buttonTextSpan.textContent = buttonTextSpan.getAttribute(currentLang === 'en' ? 'data-en' : 'data-es');
    }
    buttonElement.setAttribute('aria-expanded', newExpandedState);
  }

  // ================================================================
  // Employment Type Toggle for Join Us Form
  // ================================================================
  const employmentTypeToggle = document.getElementById('employment-type-toggle');
  const employmentTypeCheckboxes = document.getElementById('employment-type-checkboxes');

  if (employmentTypeToggle && employmentTypeCheckboxes) {
    employmentTypeToggle.addEventListener('click', () => {
      const wasExpanded = employmentTypeToggle.getAttribute('aria-expanded') === 'true';
      const nowExpanded = !wasExpanded; // The new state after toggle

      employmentTypeCheckboxes.style.display = nowExpanded ? 'block' : 'none'; // Or 'grid' if it's a grid container
      // Call the helper function with the *new* state
      updateEmploymentToggleButton(employmentTypeToggle, nowExpanded, currentLanguage);
    });

    // Initial setup of the button visuals based on its default (collapsed) state
    // The 'aria-expanded' attribute is expected to be 'false' in the HTML initially.
    const initiallyExpanded = employmentTypeToggle.getAttribute('aria-expanded') === 'true';
    updateEmploymentToggleButton(employmentTypeToggle, initiallyExpanded, currentLanguage);
  }

  // =======================================================================================
  // Sanitize input function Form Submissions: Alert + Reset + Input Sanitization
  // =======================================================================================
  function sanitizeInput(input) {
    if (typeof input !== 'string') {
      // Handle non-string inputs, e.g., by returning them as is or an empty string
      // For form inputs, they are typically strings, but good to be safe.
      return '';
    }
    const output = input.replace(/</g, "&lt;")
                        .replace(/>/g, "&gt;")
                        .replace(/&/g, "&amp;")
                        .replace(/"/g, "&quot;")
                        .replace(/'/g, "&#x27;") // Alternatively, use &#39;
                        // .replace(/\//g, "&#x2F;") // Forward slash, less critical but sometimes included
                        .trim();
    return output;
  }

  // Join Us Form
  const joinForm = document.getElementById('join-form');
  if (joinForm) {
    joinForm.addEventListener('submit', (e) => {
      e.preventDefault();

      // Sanitize input fields
      const name = sanitizeInput(document.getElementById("join-name").value);
      const email = sanitizeInput(document.getElementById("join-email").value);
      const contact = sanitizeInput(document.getElementById("join-contact").value);
      const comment = sanitizeInput(document.getElementById("join-comment").value);

      // Collect selected employment types
      const selectedEmploymentTypes = [];
      const employmentCheckboxes = document.querySelectorAll('input[name="employment_type"]:checked');
      employmentCheckboxes.forEach(checkbox => {
        selectedEmploymentTypes.push(checkbox.value);
      });

      console.log("Sanitized Join Form Submission →", {
        name,
        email,
        contact,
        comment,
        employmentTypes: selectedEmploymentTypes
      });

      alert('Thank you for joining us! Your information has been safely received.');
      joinForm.reset();
      document.getElementById('join-modal').classList.remove('active');
    });
  }

  // Contact Us Form
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      // Sanitize input fields
      const contactName = sanitizeInput(document.getElementById("contact-name").value);
      const contactEmail = sanitizeInput(document.getElementById("contact-email").value);
    const contactMessage = sanitizeInput(document.getElementById("contact-comments").value);

      console.log("Sanitized Contact Form Submission →", { contactName, contactEmail, contactMessage });

      alert('Thank you for contacting us! We will get back to you soon.');
      contactForm.reset();
      document.getElementById('contact-modal').classList.remove('active');
    });
  }

});

