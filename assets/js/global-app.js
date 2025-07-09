// assets/js/global-app.js

// === Element Utilities ===
const qs = s => document.querySelector(s);
const qsa = s => [...document.querySelectorAll(s)];

// === Modal Open Function ===
async function openModal(modalId, src) {
  let modal = qs(`#${modalId}`);
  if (!modal && src) {
    try {
      const resp = await fetch(src);
      if (!resp.ok) throw new Error(`Failed to fetch modal: ${src} (${resp.status})`);
      const html = await resp.text();
      document.body.insertAdjacentHTML('beforeend', html);
      modal = qs(`#${modalId}`);
      if (modal) {
        attachModalHandlers(modal);
        // Potentially initialize specific modal content if needed
        if (modalId === 'joinModal') initJoinForm(modal);
        // Chatbot is initialized on click, so not here
      } else {
        console.error(`Modal HTML for ${modalId} loaded, but ID not found in fetched content.`);
        return;
      }
    } catch (error) {
      console.error(`Error fetching modal content for ${modalId} from ${src}:`, error);
      return; // Don't try to activate a modal that failed to load
    }
  } else if (modal && !src) {
    // Modal already in DOM, no source provided (e.g. sub-modal)
    // Ensure handlers are attached if it was hidden and re-shown
    attachModalHandlers(modal);
  } else if (!modal && !src) {
    console.error(`Modal ${modalId} not found in DOM and no source URL provided.`);
    return;
  }

  if (modal) {
    modal.classList.add('active');
    // Re-apply language settings to newly loaded modal content
    const currentLang = document.documentElement.lang || 'en';
    updateTextContent(modal, currentLang);
    updatePlaceholders(modal, currentLang);
    updateAriaLabels(modal, currentLang);
  }
}

// === Global Modal Trigger Setup ===
// Use event delegation on the body for dynamically added modal triggers
document.body.addEventListener('click', e => {
  const trigger = e.target.closest('[data-modal-target], [data-modal]');
  if (trigger) {
    e.preventDefault();
    const modalId = trigger.dataset.modalTarget || trigger.dataset.modal;
    const src = trigger.dataset.modalSource; // Will be undefined if only data-modal is used for existing DOM modal
    if (modalId) {
      openModal(modalId, src);
    }
  }
});

// === Modal Close / Dismiss ===
function attachModalHandlers(modal) {
  if (!modal) return;
  // Close via [X] button or any button with data-close
  qsa('.close-modal, [data-close]', modal).forEach(btn => { // MODIFIED SELECTOR
    // Remove old listener before adding new one to prevent duplicates if called multiple times
    const newBtn = btn.cloneNode(true);
    btn.parentNode.replaceChild(newBtn, btn);
    newBtn.addEventListener('click', e => {
      e.stopPropagation();
      modal.classList.remove('active');
    });
  });

  // Close via overlay click (only if the modal itself is the direct target)
  // Ensure this listener is only added once or is idempotent
  if (!modal.dataset.overlayListenerAttached) {
    modal.addEventListener('click', e => {
      if (e.target === modal) modal.classList.remove('active');
    });
    modal.dataset.overlayListenerAttached = 'true';
  }

  // Close via Escape key - this is a window listener, should be managed carefully
  // To prevent multiple listeners, we can name it and remove/re-add, or use a flag.
  // For simplicity, we'll assume it's okay for now, but in a larger app, manage this.
  window.addEventListener('keydown', e => {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
      modal.classList.remove('active');
    }
  });
}

// Attach modal close handlers to any pre-existing modals on initial load
// qsa('.modal-overlay').forEach(attachModalHandlers); // This might be redundant if openModal handles it

// ===== Theme/Language Toggles =====
const themeToggleButton = qs('#theme-toggle-button');
const languageToggleButton = qs('#language-toggle-button');

// Function to set the theme
const setTheme = (theme) => {
  document.body.classList.toggle('dark', theme === 'dark');
  if (themeToggleButton) themeToggleButton.textContent = theme === 'dark' ? 'Light' : 'Dark';
  localStorage.setItem('theme', theme); // Save theme preference
};

// Function to set the language
const updateTextContent = (container, lang) => {
  qsa('[data-en]', container).forEach(el => {
    el.textContent = el.dataset[lang] || el.dataset.en;
  });
};

const updatePlaceholders = (container, lang) => {
  qsa('[data-placeholder-en]', container).forEach(el => {
    const placeholderKey = `placeholder${lang.charAt(0).toUpperCase() + lang.slice(1)}`;
    el.placeholder = el.dataset[placeholderKey] || el.dataset.placeholderEn;
  });
};

const updateAriaLabels = (container, lang) => {
  qsa('[data-aria-label-en]', container).forEach(el => {
    const ariaLabelKey = `ariaLabel${lang.charAt(0).toUpperCase() + lang.slice(1)}`;
    el.setAttribute('aria-label', el.dataset[ariaLabelKey] || el.dataset.ariaLabelEn);
  });
};

const setLanguage = (lang) => {
  document.documentElement.lang = lang;
  if (languageToggleButton) languageToggleButton.textContent = lang === 'en' ? 'ES' : 'EN';

  // Update all relevant attributes in the entire document
  updateTextContent(document, lang);
  updatePlaceholders(document, lang);
  updateAriaLabels(document, lang);

  localStorage.setItem('language', lang); // Save language preference
};

// Event listeners for global toggle buttons
if (themeToggleButton) {
  themeToggleButton.onclick = () => {
    const currentTheme = document.body.classList.contains('dark') ? 'light' : 'dark';
    setTheme(currentTheme);
  };
}

if (languageToggleButton) {
  languageToggleButton.onclick = () => {
    const currentLang = document.documentElement.lang === 'en' ? 'es' : 'en';
    setLanguage(currentLang);
  };
}

// Initialize theme and language from localStorage or defaults
document.addEventListener('DOMContentLoaded', () => {
  const savedTheme = localStorage.getItem('theme') || 'light'; // Default to light theme
  const savedLang = localStorage.getItem('language') || 'en';   // Default to English
  setTheme(savedTheme);
  setLanguage(savedLang);

  // Initialize any modals that are already in the DOM and active (e.g. if page was reloaded with a modal hash)
  // qsa('.modal-overlay.active').forEach(attachModalHandlers); // Covered by openModal if they are re-triggered
});


// ===== Form Handling =====

// --- Join Us Form ---
function initJoinForm(modal) {
  const form = modal.querySelector('#joinForm');
  if (!form) return;

  // Handle dynamic field additions
  qsa('.circle-btn.add', form).forEach(addBtn => {
    addBtn.addEventListener('click', () => {
      const inputsContainer = addBtn.previousElementSibling; // Should be a div with class .inputs
      if (inputsContainer && inputsContainer.classList.contains('inputs')) {
        const newInput = document.createElement('input');
        newInput.type = 'text';
        // Could make placeholder more specific based on section if needed
        newInput.placeholder = 'Enter detail';
        newInput.name = `${inputsContainer.parentElement.dataset.section || 'additional'}_${inputsContainer.children.length + 1}`;
        inputsContainer.appendChild(newInput);
      }
    });
  });

  form.addEventListener('submit', e => {
    e.preventDefault();
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    console.log('Join Us Form Submitted:', data);
    alert('Thank you for your interest! (Data logged to console)');
    // Potentially close modal and reset form
    // modal.classList.remove('active');
    // form.reset();
  });
}

// --- Contact Us Form ---
// Attaching to body via event delegation for forms loaded dynamically
document.body.addEventListener('submit', e => {
  if (e.target.id === 'contactForm') {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    console.log('Contact Us Form Submitted:', data);
    alert('Thank you for contacting us! (Data logged to console)');
    // Potentially close modal and reset form
    // const modal = form.closest('.modal-overlay');
    // if (modal) modal.classList.remove('active');
    // form.reset();
  }
});


// ===== Chatbot Inline Logic (Ops AI – Chattia) =====
// Chatbot initialization is triggered when its modal is opened and interacted with.
// The openModal function now calls attachModalHandlers, which is sufficient for basic setup.
// Chatbot-specific JS (like its toggles, message sending) is in chatbotInit.

document.body.addEventListener('click', function(e) {
  const chatbotModalContent = e.target.closest('#chatbotModal .modal-content'); // Check click is inside chatbot content
  if (chatbotModalContent) {
    const modal = chatbotModalContent.closest('#chatbotModal');
    if (modal && !modal.classList.contains('__ready')) { // Initialize only once
      modal.classList.add('__ready');
      chatbotInit(modal);
    }
  }
}, true);


function chatbotInit(modal) { // modal here is the #chatbotModal element
  // Chatbot-specific toggles can now leverage global functions
  const chatbotLangToggle = modal.querySelector('#langCtrl'); // Assuming #langCtrl is inside the chatbot modal
  const chatbotThemeToggle = modal.querySelector('#themeCtrl'); // Assuming #themeCtrl is inside the chatbot modal

  if (chatbotLangToggle) {
    chatbotLangToggle.onclick = () => {
      const currentLang = document.documentElement.lang === 'en' ? 'es' : 'en';
      setLanguage(currentLang); // Call global function
      // The global setLanguage will update the button text if languageToggleButton is the same as chatbotLangToggle
      // If they are different buttons, update chatbotLangToggle text specifically:
      chatbotLangToggle.textContent = currentLang === 'en' ? 'ES' : 'EN';
    };
    // Sync chatbot toggle text with global language on init
    chatbotLangToggle.textContent = document.documentElement.lang === 'en' ? 'ES' : 'EN';
  }

  if (chatbotThemeToggle) {
    chatbotThemeToggle.onclick = () => {
      const currentTheme = document.body.classList.contains('dark') ? 'light' : 'dark';
      setTheme(currentTheme); // Call global function
      // Sync chatbot toggle text:
      chatbotThemeToggle.textContent = currentTheme === 'dark' ? 'Light' : 'Dark';
    };
    // Sync chatbot toggle text with global theme on init
    chatbotThemeToggle.textContent = document.body.classList.contains('dark') ? 'Light' : 'Dark';
  }

  // Chatbot logic
  const log = qs('#chat-log');
  const form = qs('#chatbot-input-row');
  const input = qs('#chatbot-input');
  const send = qs('#chatbot-send');
  const guard = qs('#human-check');
  if (!log || !form || !input || !send || !guard) return;
  guard.onchange = () => send.disabled = !guard.checked;
  function addMsg(txt, cls) {
    const div = document.createElement('div');
    div.className = 'chat-msg ' + cls;
    div.textContent = txt;
    log.appendChild(div);
    log.scrollTop = log.scrollHeight;
  }
  form.onsubmit = async e => {
    e.preventDefault();
    if (!guard.checked) return;
    const msg = input.value.trim();
    if (!msg) return;
    addMsg(msg, 'user');
    input.value = '';
    send.disabled = true;
    addMsg('…', 'bot');
    try {
      // TODO: Replace URL with your actual Cloudflare Worker endpoint
      const r = await fetch('https://your-cloudflare-worker.example.com/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg })
      });
      const d = await r.json();
      log.lastChild.textContent = d.reply || 'No reply.';
    } catch {
      log.lastChild.textContent = 'Error: Can’t reach AI.';
    }
    send.disabled = false;
  };
}

// ===== Mobile Menu, Mobile Services =====
const menuToggle = qs('#menuToggle');
const mobileNav = qs('.mobile-nav');
const mobileServicesToggle = qs('#mobile-services-toggle');
const mobileServicesMenu = qs('.mobile-services-menu');
if (menuToggle && mobileNav) {
  menuToggle.onclick = () => mobileNav.classList.toggle('active');
}
if (mobileServicesToggle && mobileServicesMenu) {
  mobileServicesToggle.onclick = () => mobileServicesMenu.classList.toggle('active');
}

// ===== Register Service Worker (optional) =====
// If your project uses service workers for offline/notifications,
// include sw-register.js and write registration logic there.
