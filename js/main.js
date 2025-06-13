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
      if (typeof grecaptcha === 'undefined' || typeof grecaptcha.execute === 'undefined') {
          console.error('ReCAPTCHA not loaded yet.');
          alert('ReCAPTCHA is not ready. Please try again in a moment.');
          return;
      }
      grecaptcha.ready(() => {
        grecaptcha.execute('6LfFOV0rAAAAAP2NYL8f1hPyfpsc-MiPx9n02THp', { action: 'join_us_submit' }).then((token) => {
          console.log('Join Us ReCAPTCHA token:', token);

          const name = sanitizeInput(document.getElementById("join-name").value);
          const email = sanitizeInput(document.getElementById("join-email").value);
          const contact = sanitizeInput(document.getElementById("join-contact").value);
          const date = document.getElementById("join-date").value;
          const time = document.getElementById("join-time").value;
          const comment = sanitizeInput(document.getElementById("join-comment").value);

          const selectedInterests = [];
          document.querySelectorAll('input[name="join_interest"]:checked').forEach(checkbox => {
            selectedInterests.push(checkbox.value);
          });

          const formData = new FormData();
          formData.append('name', name);
          formData.append('email', email);
          formData.append('contact', contact);
          formData.append('date', date);
          formData.append('time', time);
          formData.append('comment', comment);
          if (selectedInterests.length > 0) {
            formData.append('interests', selectedInterests.join(','));
          }
          formData.append('g-recaptcha-response', token);

          console.log("Submitting Join Us Form Data:", { name, email, contact, date, time, comment, interests: selectedInterests.join(',') }); // Token is not directly logged here but sent

          fetch('https://tiny-resonance-041b.gabrieloor-cv1.workers.dev/', {
            method: 'POST',
            body: formData
          })
          .then(response => response.json())
          .then(data => {
            if (data.success) {
              alert('Form submitted successfully! Message: ' + data.message);
              joinForm.reset();
              document.getElementById('join-modal').classList.remove('active');
            } else {
              alert('Submission failed: ' + (data.message || 'Unknown error') + (data.details ? ' Details: ' + JSON.stringify(data.details) : ''));
            }
          })
          .catch(error => {
            console.error('Error submitting Join Us form:', error);
            alert('An error occurred while submitting the Join Us form. Please try again.');
          });
        }).catch(error => {
          console.error("Error executing reCAPTCHA for Join Us:", error);
          alert("Error with reCAPTCHA. Please try again.");
        });
      });
    });
  }

  // Contact Us Form
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      if (typeof grecaptcha === 'undefined' || typeof grecaptcha.execute === 'undefined') {
          console.error('ReCAPTCHA not loaded yet.');
          alert('ReCAPTCHA is not ready. Please try again in a moment.');
          return;
      }
      grecaptcha.ready(() => {
        grecaptcha.execute('6LfAOV0rAAAAAPBGgn2swZWj5SjANoQ4rUH6XIMz', { action: 'contact_us_submit' }).then((token) => {
          console.log('Contact Us ReCAPTCHA token:', token);

          const name = sanitizeInput(document.getElementById("contact-name").value);
          const email = sanitizeInput(document.getElementById("contact-email").value);
          const contactNumber = sanitizeInput(document.getElementById("contact-number").value);
          const preferredDate = document.getElementById("contact-date").value;
          const preferredTime = document.getElementById("contact-time").value;
          const comments = sanitizeInput(document.getElementById("contact-comments").value);

          const formData = new FormData();
          formData.append('name', name);
          formData.append('email', email);
          formData.append('contactNumber', contactNumber);
          formData.append('preferredDate', preferredDate);
          formData.append('preferredTime', preferredTime);
          formData.append('comments', comments);
          formData.append('g-recaptcha-response', token);

          console.log("Submitting Contact Us Form Data:", { name, email, contactNumber, preferredDate, preferredTime, comments }); // Token sent, not logged here

          fetch('https://contact.gabrieloor-cv1.workers.dev/', {
            method: 'POST',
            body: formData
          })
          .then(response => response.json())
          .then(data => {
            if (data.success) {
              alert('Form submitted successfully! Message: ' + data.message);
              contactForm.reset();
              document.getElementById('contact-modal').classList.remove('active');
            } else {
              alert('Submission failed: ' + (data.message || 'Unknown error') + (data.details ? ' Details: ' + JSON.stringify(data.details) : ''));
            }
          })
          .catch(error => {
            console.error('Error submitting Contact Us form:', error);
            alert('An error occurred while submitting the Contact Us form. Please try again.');
          });
        }).catch(error => {
          console.error("Error executing reCAPTCHA for Contact Us:", error);
          alert("Error with reCAPTCHA. Please try again.");
        });
      });
    });
  }

  // Collapsible Areas of Interest for Join Us form
  const areasTrigger = document.getElementById('join-areas-trigger');
  const areasOptions = document.getElementById('join-areas-options');
  if (areasTrigger && areasOptions) {
    areasTrigger.addEventListener('click', () => {
      const isExpanded = areasTrigger.getAttribute('aria-expanded') === 'true';
      areasTrigger.setAttribute('aria-expanded', !isExpanded);
      areasOptions.style.display = isExpanded ? 'none' : 'block';
      const arrow = areasTrigger.querySelector('.arrow-down');
      if (arrow) {
        arrow.textContent = isExpanded ? '▼' : '▲';
      }
    });
  }
});

