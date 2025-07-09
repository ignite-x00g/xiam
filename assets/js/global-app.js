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
const themeToggle = qs('#theme-toggle-button');
const langToggle = qs('#language-toggle-button');
const setTheme = mode => {
  document.body.classList.toggle('dark', mode === 'dark');
  themeToggle.textContent = mode === 'dark' ? 'Light' : 'Dark';
};
const setLang = lang => {
  document.documentElement.lang = lang;
  langToggle.textContent = lang === 'en' ? 'ES' : 'EN';
  qsa('[data-en]').forEach(el => el.textContent = el.dataset[lang]);
  qsa('[data-placeholder-en]').forEach(el => {
    el.placeholder = el.dataset[`placeholder${lang.charAt(0).toUpperCase() + lang.slice(1)}`];
  });
};
themeToggle.onclick = () => setTheme(themeToggle.textContent === 'Dark' ? 'dark' : 'light');
langToggle.onclick = () => setLang(langToggle.textContent === 'EN' ? 'es' : 'en');

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
  // Simple EN/ES & Theme toggles inside chatbot
  const langCtrl = qs('#langCtrl');
  const themeCtrl = qs('#themeCtrl');
  const transNodes = qsa('#chatbotModal [data-en]');
  const phNodes = qsa('#chatbotModal [data-placeholder-en]');
  const humanLab = qs('#human-label');
  langCtrl.onclick = () => {
    const toES = langCtrl.textContent === 'ES';
    document.documentElement.lang = toES ? 'es' : 'en';
    langCtrl.textContent = toES ? 'EN' : 'ES';
    transNodes.forEach(node => node.textContent = toES ? node.dataset.es : node.dataset.en);
    phNodes.forEach(node => node.placeholder = toES ? node.dataset.placeholderEs : node.dataset.placeholderEn);
    if (humanLab) humanLab.textContent = toES ? humanLab.dataset.es : humanLab.dataset.en;
  };
  themeCtrl.onclick = () => {
    const dark = themeCtrl.textContent === 'Dark';
    document.body.classList.toggle('dark', dark);
    themeCtrl.textContent = dark ? 'Light' : 'Dark';
  };

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
