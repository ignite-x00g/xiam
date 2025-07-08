/* ---------- Helper ---------- */
const qs = (sel, ctx = document) => ctx.querySelector(sel);
const qsa = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

/* ---------- Generic Modal open/close (Keep this for FABs) ---------- */
// This ensures FABs still open their respective modals
qsa('[data-modal]').forEach(btn => {
  const modalId = btn.dataset.modal;
  const modal = qs('#' + modalId);
  if (modal) {
    btn.onclick = () => modal.classList.add('active');
  } else {
    console.warn(`Modal with ID #${modalId} not found for button:`, btn);
  }
});

qsa('[data-close]').forEach(btn => {
  btn.onclick = () => btn.closest('.modal-overlay').classList.remove('active');
});

// Click outside to close
window.addEventListener('click', e => {
  qsa('.modal-overlay.active').forEach(m => {
    if (e.target === m) m.classList.remove('active');
  });
});
// Escape key to close
window.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    qsa('.modal-overlay.active').forEach(m => m.classList.remove('active'));
  }
});

/* ---------- Mobile nav + Global Page Toggles (from original fab-modal.js) ---------- */
if (qs('#menuToggle')) {
  qs('#menuToggle').onclick = () => {
    const mobileNav = qs('#mobileNav');
    if (mobileNav) mobileNav.classList.toggle('active');
  };
}

if (qs('#mobile-services-toggle')) {
  qs('#mobile-services-toggle').onclick = () => {
    const mobileServicesMenu = qs('#mobile-services-menu');
    if (mobileServicesMenu) mobileServicesMenu.classList.toggle('active');
  };
}

// Global Language Toggle (for main page content via mobile nav)
if (qs('#mobile-language-toggle')) {
  qs('#mobile-language-toggle').onclick = () => {
    const toggleButton = qs('#mobile-language-toggle');
    const isEN = toggleButton.textContent === 'EN';
    const targetLang = isEN ? 'es' : 'en';
    document.documentElement.lang = targetLang; // Set overall page lang

    // Toggle elements with data-en/data-es outside of specific modals
    qsa('body [data-en][data-es]').forEach(el => {
        // Avoid changing elements within modals that have their own toggles
        if (!el.closest('#chatbot-container') && !el.closest('#joinModal .modal-content')) {
            el.textContent = el.dataset[targetLang];
        }
    });
    toggleButton.textContent = isEN ? 'ES' : 'EN';
  };
}

// Global Theme Toggle (for main page via mobile nav)
if (qs('#mobile-theme-toggle')) {
  qs('#mobile-theme-toggle').onclick = () => {
    const toggleButton = qs('#mobile-theme-toggle');
    const isLight = toggleButton.textContent === 'Light';
    document.body.classList.toggle('dark', isLight);
    toggleButton.textContent = isLight ? 'Dark' : 'Light';
    // Potentially sync with local storage if other theme toggles use it
    localStorage.setItem('theme', isLight ? 'dark' : 'light');
  };
}

/* ---------- CHATBOT LOGIC (New - from user snippet) ---------- */
// Ensure selectors are scoped if needed, or use the chatbot container as context
const chatbotContainer = qs('#chatbot-container');
if (chatbotContainer) {
  const langCtrlChat = qs('#langCtrl', chatbotContainer); // Scoped to chatbot
  const themeCtrlChat = qs('#themeCtrl', chatbotContainer); // Scoped to chatbot
  const chatLog = qs('#chat-log', chatbotContainer);
  const chatForm = qs('#chatbot-input-row', chatbotContainer); // This is the form
  const chatInput = qs('#chatbot-input', chatbotContainer);
  const chatSendBtn = qs('#chatbot-send', chatbotContainer);
  const humanCheck = qs('#human-check', chatbotContainer);
  const humanLabelChat = qs('#human-label', chatbotContainer); // for lang toggle
  const titleChat = qs('#title', chatbotContainer); // for lang toggle

  if (langCtrlChat) {
    langCtrlChat.onclick = () => {
      const toES = langCtrlChat.textContent === 'ES';
      // Chatbot's own language state, doesn't affect global page lang
      langCtrlChat.textContent = toES ? 'EN' : 'ES';
      const targetLang = toES ? 'es' : 'en';

      // Toggle text nodes within chatbot
      if (titleChat) titleChat.textContent = titleChat.dataset[targetLang];
      if (humanLabelChat) humanLabelChat.textContent = humanLabelChat.dataset[targetLang];

      // Toggle placeholders within chatbot
      if (chatInput) chatInput.placeholder = chatInput.dataset[toES ? 'esPh' : 'enPh'];
    };
  }

  if (themeCtrlChat) {
    themeCtrlChat.onclick = () => {
      const dark = themeCtrlChat.textContent === 'Dark';
      document.body.classList.toggle('dark', dark); // This toggles global body theme
      themeCtrlChat.textContent = dark ? 'Light' : 'Dark';
      localStorage.setItem('theme', dark ? 'dark' : 'light'); // Sync with localStorage
      // Also update global theme button if it exists
      const globalThemeToggle = qs('#mobile-theme-toggle');
      if (globalThemeToggle) globalThemeToggle.textContent = dark ? 'Dark' : 'Light';
    };
  }

  if (humanCheck) {
    humanCheck.onchange = () => {
        if(chatSendBtn) chatSendBtn.disabled = !humanCheck.checked;
    }
  }

  function addChatMsg(txt, cls) {
    if (!chatLog) return;
    const div = document.createElement('div');
    div.className = 'chat-msg ' + cls; // Ensure .chat-msg.user or .chat-msg.bot
    div.textContent = txt;
    chatLog.appendChild(div);
    chatLog.scrollTop = chatLog.scrollHeight;
  }

  if (chatForm) {
    chatForm.onsubmit = async e => {
      e.preventDefault();
      if (!humanCheck || !humanCheck.checked) return;
      if (!chatInput || !chatSendBtn) return;

      const msg = chatInput.value.trim();
      if (!msg) return;
      addChatMsg(msg, 'user');
      chatInput.value = '';
      // chatSendBtn.disabled = true; // Disabling while waiting for reply could be good UX
      addChatMsg('…', 'bot');

      try {
        // const r = await fetch('https://your-cloudflare-worker.example.com/chat', { // Placeholder URL
        const r = await fetch('https://ops-ai-chatbot-worker.carlos-arias.workers.dev/chat', { // Actual Worker URL
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: msg })
        });
        const d = await r.json();
        if (chatLog.lastChild) {
            chatLog.lastChild.textContent = d.reply || 'No reply.';
        }
      } catch (err) {
        console.error("Chatbot fetch error:", err);
        if (chatLog.lastChild) {
            chatLog.lastChild.textContent = 'Error: Can’t reach AI.';
        }
      }
      // chatSendBtn.disabled = !humanCheck.checked; // Re-enable based on human check
    };
  }
}


/* ---------- JOIN US MODAL LOGIC (New - from user snippet) ---------- */
const joinModal = qs('#joinModal');
if (joinModal) {
  let currentLangJoin = 'en'; // Language state specific to Join Us modal

  const closeModalBtnJoin = qs('#close-modal-btn', joinModal);
  const joinForm = qs('#join-form', joinModal);
  const themeToggleJoin = qs('#theme-toggle', joinModal); // Specific theme toggle for Join Us
  const langToggleJoin = qs('.lang-toggle', joinModal); // Specific lang toggle for Join Us

  if (closeModalBtnJoin) {
    closeModalBtnJoin.onclick = () => { // This is redundant if data-close is used, but harmless
      joinModal.classList.remove('active');
    };
  }

  if (joinForm) {
    joinForm.addEventListener('submit', function(e) {
      e.preventDefault();
      alert(currentLangJoin === 'es' ? 'Formulario de Únete enviado.' : 'Join Us form submitted.');
      joinModal.classList.remove('active'); // Close modal on submit
    });
  }

  function updateLangJoin() {
    // Title of the modal
    const modalTitleJoin = qs('#joinModalSTitle', joinModal);
    if(modalTitleJoin) modalTitleJoin.textContent = modalTitleJoin.dataset[currentLangJoin];

    // Other elements with data-en/data-es within Join Us modal
    qsa('[data-en]', joinModal).forEach(el => {
      const translation = el.getAttribute(`data-${currentLangJoin}`);
      if (translation) {
        if (el.matches('input[type="button"]') || el.matches('button')) { // For buttons
             if(el.matches('.lang-toggle')) {
                el.textContent = currentLangJoin === 'en' ? 'EN | ES' : 'ES | EN';
             } else {
                el.textContent = translation;
             }
        } else if (el.tagName === 'H2' || el.tagName === 'H3' || el.tagName === 'LABEL' || el.tagName === 'SPAN' || el.tagName === 'P' || el.tagName === 'OPTION') {
            if (!el.classList.contains('lang-toggle')) { // Don't re-translate the toggle button itself if it has data-en
                 el.textContent = translation;
            }
        }
      }
    });

    qsa('[data-placeholder-en]', joinModal).forEach(el => {
      el.placeholder = el.getAttribute(`data-placeholder-${currentLangJoin}`);
    });

    qsa('[data-aria-label-en]', joinModal).forEach(el => {
      el.setAttribute('aria-label', el.getAttribute(`data-aria-label-${currentLangJoin}`));
    });

    // Update document title if this modal is for a full page (not applicable here as it's a modal)
    // const pageTitle = qs('title');
    // if (pageTitle && pageTitle.dataset[currentLangJoin]) {
    //    document.title = pageTitle.dataset[currentLangJoin];
    // }
  }

  if (langToggleJoin) {
    langToggleJoin.onclick = () => {
      currentLangJoin = currentLangJoin === 'en' ? 'es' : 'en';
      updateLangJoin();
    };
  }


  function applyThemeJoin(theme) { // Theme function specific to Join Us modal's context if needed
                                // but the new Join Us snippet toggles global 'dark-mode' class on body
    if (theme === 'dark') {
      document.body.classList.add('dark'); // Uses 'dark' to match global CSS
      if (themeToggleJoin) themeToggleJoin.textContent = '☀️'; // Light icon for dark mode
    } else {
      document.body.classList.remove('dark');
      if (themeToggleJoin) themeToggleJoin.textContent = '🌓'; // Dark icon for light mode
    }
     // Sync with global mobile nav theme button
    const globalThemeToggle = qs('#mobile-theme-toggle');
    if (globalThemeToggle) globalThemeToggle.textContent = theme === 'dark' ? 'Dark' : 'Light';
  }

  if (themeToggleJoin) {
    themeToggleJoin.addEventListener('click', () => {
      let newTheme = document.body.classList.contains('dark') ? 'light' : 'dark';
      localStorage.setItem('theme', newTheme);
      applyThemeJoin(newTheme);
    });
  }

  // Initial theme and lang setup for Join Us modal when page loads
  // This was in DOMContentLoaded in the snippet, running it directly here.
  const savedThemeJoin = localStorage.getItem('theme');
  const systemPrefersDarkJoin = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  if (savedThemeJoin) {
    applyThemeJoin(savedThemeJoin);
  } else if (systemPrefersDarkJoin) {
    applyThemeJoin('dark');
  } else {
    applyThemeJoin('light'); // Default to light
  }
  // updateLangJoin(); // Call to set initial language strings if needed when modal becomes visible or on page load.
                      // Better to call this when the modal is opened.
  const joinModalObserver = new MutationObserver((mutationsList, observer) => {
    for(const mutation of mutationsList) {
      if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
        if (joinModal.classList.contains('active')) {
          updateLangJoin(); // Update language when modal becomes active
        }
      }
    }
  });
  joinModalObserver.observe(joinModal, { attributes: true });


  qsa('.form-section', joinModal).forEach(section => {
    const addBtn = qs('.add', section);
    const removeBtn = qs('.remove', section);
    const acceptBtn = qs('.accept-btn', section);
    const editBtn = qs('.edit-btn', section);
    const inputsDiv = qs('.inputs', section); // Corrected selector
    const titleEl = qs('h2', section); // Corrected selector

    if (!addBtn || !removeBtn || !acceptBtn || !editBtn || !inputsDiv || !titleEl) return;

    addBtn.onclick = () => {
      const input = document.createElement('input');
      input.type = 'text'; // Default type
      const placeholderEn = `Enter ${titleEl.dataset.en || 'info'}`;
      const placeholderEs = `Ingresa ${titleEl.dataset.es || 'información'}`;
      input.setAttribute('data-placeholder-en', placeholderEn);
      input.setAttribute('data-placeholder-es', placeholderEs);
      input.placeholder = currentLangJoin === 'es' ? placeholderEs : placeholderEn;
      inputsDiv.appendChild(input);
      input.focus();
    };

    removeBtn.onclick = () => {
      if (inputsDiv.lastElementChild && inputsDiv.lastElementChild.tagName === 'INPUT') {
        inputsDiv.removeChild(inputsDiv.lastElementChild);
      }
    };

    acceptBtn.onclick = () => {
      if (!inputsDiv.children.length || !qs('input', inputsDiv)) { // Check if any input exists
        alert(currentLangJoin === 'es' ? 'Agrega al menos una entrada.' : 'Please add at least one entry.');
        return;
      }
      inputsDiv.querySelectorAll('input').forEach(input => input.disabled = true);
      acceptBtn.style.display = 'none';
      editBtn.style.display = 'inline-block';
      section.classList.add('completed');
    };

    editBtn.onclick = () => {
      inputsDiv.querySelectorAll('input').forEach(input => input.disabled = false);
      acceptBtn.style.display = 'inline-block';
      editBtn.style.display = 'none';
      section.classList.remove('completed');
      if(inputsDiv.querySelector('input')) inputsDiv.querySelector('input').focus();
    };
  });
}


/* ---------- CONTACT US MODAL LOGIC ---------- */
// The new Contact Us HTML snippet did not include specific JS.
// We can keep a simple submit alert based on the old form ID if it's still 'contactForm',
// or the new 'contact-form' ID. The new HTML uses 'contact-form'.

const contactForm = qs('#contact-form'); // New ID from the updated HTML
if (contactForm) {
  contactForm.onsubmit = e => {
    e.preventDefault();
    alert('Contact form submitted'); // Simple stub
    const contactModal = qs('#contactModal');
    if (contactModal) contactModal.classList.remove('active'); // Close modal on submit
  };
}

// Ensure theme is applied on initial load based on localStorage or system preference
document.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const globalThemeToggle = qs('#mobile-theme-toggle');
    const chatbotThemeCtrl = qs('#chatbot-container #themeCtrl');
    const joinUsThemeToggle = qs('#joinModal #theme-toggle');

    let currentTheme = 'light'; // Default
    if (savedTheme) {
        currentTheme = savedTheme;
    } else if (systemPrefersDark) {
        currentTheme = 'dark';
    }

    document.body.classList.toggle('dark', currentTheme === 'dark');
    if (globalThemeToggle) globalThemeToggle.textContent = currentTheme === 'dark' ? 'Dark' : 'Light';
    if (chatbotThemeCtrl) chatbotThemeCtrl.textContent = currentTheme === 'dark' ? 'Light' : 'Dark'; // Text implies what it WILL turn into
    if (joinUsThemeToggle) joinUsThemeToggle.textContent = currentTheme === 'dark' ? '☀️' : '🌓';


    // Initial language for Join Us modal if it's visible on load (unlikely but for completeness)
    if (joinModal && joinModal.classList.contains('active')) {
        updateLangJoin();
    }
    // Initial language for Chatbot if visible on load
    const chatbotTitle = qs('#chatbot-container #title');
    const chatbotHumanLabel = qs('#chatbot-container #human-label');
    const chatbotInput = qs('#chatbot-container #chatbot-input');
    if(qs('#chatbot-container #langCtrl') && qs('#chatbot-container #langCtrl').textContent === 'EN') { // currently set to ES to toggle to EN
        if(chatbotTitle) chatbotTitle.textContent = chatbotTitle.dataset.es;
        if(chatbotHumanLabel) chatbotHumanLabel.textContent = chatbotHumanLabel.dataset.es;
        if(chatbotInput) chatbotInput.placeholder = chatbotInput.dataset.esPh;
    } else {
        if(chatbotTitle) chatbotTitle.textContent = chatbotTitle.dataset.en;
        if(chatbotHumanLabel) chatbotHumanLabel.textContent = chatbotHumanLabel.dataset.en;
        if(chatbotInput) chatbotInput.placeholder = chatbotInput.dataset.enPh;
    }

});
