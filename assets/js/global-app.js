// assets/js/global-app.js

// === Element Utilities ===
const qs = s => document.querySelector(s);
const qsa = s => [...document.querySelectorAll(s)];

// === Modal Loader (Dynamic) ===
qsa('[data-modal]').forEach(btn => {
  btn.addEventListener('click', async e => {
    e.preventDefault();
    const modalId = btn.dataset.modal;
    const src = btn.dataset.modalSource;
    // If modal exists in DOM, just open
    let modal = qs(`#${modalId}`);
    if (!modal && src) {
      const resp = await fetch(src);
      const html = await resp.text();
      document.body.insertAdjacentHTML('beforeend', html);
      modal = qs(`#${modalId}`);
      attachModalHandlers(modal);
    }
    if (modal) modal.classList.add('active');
  });
});

// === Modal Close / Dismiss ===
function attachModalHandlers(modal) {
  // Close via [X] button
  qsa('.close-modal', modal).forEach(btn => {
    btn.onclick = e => {
      e.stopPropagation();
      modal.classList.remove('active');
    };
  });
  // Close via overlay click
  modal.onclick = e => { if (e.target === modal) modal.classList.remove('active'); };
  // Close via Escape key
  window.addEventListener('keydown', e => {
    if (e.key === 'Escape') modal.classList.remove('active');
  });
}

// Attach modal close handlers to any pre-existing modals
qsa('.modal-overlay').forEach(attachModalHandlers);

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
const setLanguage = (lang) => {
  document.documentElement.lang = lang;
  if (languageToggleButton) languageToggleButton.textContent = lang === 'en' ? 'ES' : 'EN';

  // Update text content for elements with data-en/data-es attributes
  qsa('[data-en]').forEach(el => {
    el.textContent = el.dataset[lang] || el.dataset.en; // Fallback to English if translation is missing
  });

  // Update placeholders for elements with data-placeholder-en/data-placeholder-es attributes
  qsa('[data-placeholder-en]').forEach(el => {
    const placeholderKey = `placeholder${lang.charAt(0).toUpperCase() + lang.slice(1)}`;
    el.placeholder = el.dataset[placeholderKey] || el.dataset.placeholderEn; // Fallback to English placeholder
  });

  // Update aria-labels for elements with data-aria-label-en/data-aria-label-es attributes
  qsa('[data-aria-label-en]').forEach(el => {
    const ariaLabelKey = `ariaLabel${lang.charAt(0).toUpperCase() + lang.slice(1)}`;
    el.setAttribute('aria-label', el.dataset[ariaLabelKey] || el.dataset.ariaLabelEn); // Fallback to English aria-label
  });

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
});

// ===== Chatbot Inline Logic (Ops AI – Chattia) =====
document.body.addEventListener('click', function(e) {
  if (e.target.closest('#chatbotModal')) {
    // Only initialize once
    if (!qs('#chatbotModal.__ready')) {
      const modal = qs('#chatbotModal');
      modal.classList.add('__ready');
      chatbotInit(modal);
    }
  }
}, true);

function chatbotInit(modal) {
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
