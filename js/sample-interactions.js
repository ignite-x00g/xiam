/* ---------- Helper ---------- */
const qs=(sel,ctx=document)=>ctx.querySelector(sel);
const qsa=(sel,ctx=document)=>[...ctx.querySelectorAll(sel)];

/* ---------- Modal open/close ---------- */
// New modal triggers based on data-modal attribute
qsa('[data-modal]').forEach(btn => {
    btn.onclick = () => {
        const modalId = btn.dataset.modal;
        const modal = qs('#' + modalId);
        if (modal) {
            modal.classList.add('active');
            // If using modal-backdrop, show it
            const backdrop = qs('#modal-backdrop');
            if (backdrop) backdrop.style.display = 'flex';
        }
    };
});

// New modal close triggers based on data-close attribute
qsa('[data-close]').forEach(btn => {
    btn.onclick = () => {
        const modalOverlay = btn.closest('.modal-overlay');
        if (modalOverlay) {
            modalOverlay.classList.remove('active');
            // If using modal-backdrop, hide it
            const backdrop = qs('#modal-backdrop');
            if (backdrop && qsa('.modal-overlay.active').length === 0) { // Hide backdrop only if no other modals are active
                backdrop.style.display = 'none';
            }
        }
    };
});

window.addEventListener('click', e => {
    qsa('.modal-overlay.active').forEach(modal => {
        if (e.target === modal) { // Clicked on the overlay itself
            modal.classList.remove('active');
            const backdrop = qs('#modal-backdrop');
            if (backdrop && qsa('.modal-overlay.active').length === 0) {
                backdrop.style.display = 'none';
            }
        }
    });
});

window.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
        qsa('.modal-overlay.active').forEach(modal => {
            modal.classList.remove('active');
        });
        const backdrop = qs('#modal-backdrop');
        if (backdrop && qsa('.modal-overlay.active').length === 0) {
            backdrop.style.display = 'none';
        }
    }
});


/* ---------- Mobile nav + toggles (from sample) ---------- */
const menuToggle = qs('#menuToggle');
const mobileNav = qs('#mobileNav'); // Sample's mobile nav
if (menuToggle && mobileNav) {
    menuToggle.onclick = () => mobileNav.classList.toggle('active');
}

const mobileServicesToggle = qs('#mobile-services-toggle');
const mobileServicesMenu = qs('#mobile-services-menu');
if (mobileServicesToggle && mobileServicesMenu) {
    mobileServicesToggle.onclick = () => {
        const isExpanded = mobileServicesMenu.classList.toggle('active');
        mobileServicesToggle.setAttribute('aria-expanded', isExpanded);
        mobileServicesMenu.setAttribute('aria-hidden', !isExpanded);
    };
}

/* ---------- Join dynamic sections (from sample, scoped) ---------- */
qsa('#join-us-modal .form-section').forEach(section => {
    const inputsContainer = qs('.inputs', section);
    const addBtn = qs('.add', section);
    const rmBtn = qs('.remove', section);
    const accBtn = qs('.accept-btn', section);
    const editBtn = qs('.edit-btn', section);

    if (!addBtn || !inputsContainer) return; // Skip if essential elements are missing

    addBtn.onclick = () => {
        const ip = document.createElement('input');
        ip.type = 'text';
        // Placeholder localization attempt
        const sectionTitleH2 = qs('h2', section);
        let placeholderText = sectionTitleH2 ? sectionTitleH2.textContent.trim() : 'entry';
        const currentLang = document.documentElement.lang || 'en';
        if (sectionTitleH2) {
            placeholderText = (currentLang === 'es' ? sectionTitleH2.dataset.es : sectionTitleH2.dataset.en) || placeholderText;
        }
        ip.placeholder = `Enter ${placeholderText}`;
        inputsContainer.appendChild(ip);
        ip.focus();
    };

    if (rmBtn) {
        rmBtn.onclick = () => inputsContainer.lastElementChild && inputsContainer.removeChild(inputsContainer.lastElementChild);
    }

    if (accBtn && editBtn) {
        accBtn.onclick = () => {
            if (!inputsContainer.children.length) {
                alert(document.documentElement.lang === 'es' ? 'Añada al menos una entrada.' : 'Add at least one entry.');
                return;
            }
            inputsContainer.querySelectorAll('input').forEach(i => i.disabled = true);
            section.classList.add('completed');
            accBtn.style.display = 'none';
            editBtn.style.display = 'inline-block';
        };

        editBtn.onclick = () => {
            inputsContainer.querySelectorAll('input').forEach(i => i.disabled = false);
            section.classList.remove('completed');
            accBtn.style.display = 'inline-block';
            editBtn.style.display = 'none';
            if (inputsContainer.children.length > 0) {
                inputsContainer.lastElementChild.focus();
            }
        };
    }
});

/* ---------- Simple submit stubs (from sample, scoped) ---------- */
const joinForm = qs('#joinForm');
if (joinForm) {
    joinForm.onsubmit = e => {
        e.preventDefault();
        alert(document.documentElement.lang === 'es' ? 'Formulario de Únete enviado' : 'Join form submitted');
        const joinModal = qs('#join-us-modal');
        if (joinModal) joinModal.classList.remove('active');
        const backdrop = qs('#modal-backdrop');
        if (backdrop && qsa('.modal-overlay.active').length === 0) backdrop.style.display = 'none';
    };
}

const contactForm = qs('#contactForm');
if (contactForm) {
    contactForm.onsubmit = e => {
        e.preventDefault();
        alert(document.documentElement.lang === 'es' ? 'Formulario de contacto enviado' : 'Contact form submitted');
        const contactModal = qs('#contact-us-modal');
        if (contactModal) contactModal.classList.remove('active');
        const backdrop = qs('#modal-backdrop');
        if (backdrop && qsa('.modal-overlay.active').length === 0) backdrop.style.display = 'none';
    };
}

/* ---------- Chatbot (from sample, with checks) ---------- */
const chatLog = qs('#chat-log');
const chatInput = qs('#chatbot-input');
const chatBotForm = qs('#chatbot-input-row'); // Renamed from sample's 'chatForm'
const chatSendBtn = qs('#chatbot-send'); // Corrected variable name
const humanChk = qs('#human-check');

if (chatLog && chatInput && chatBotForm && chatSendBtn && humanChk) {
    humanChk.onchange = () => chatSendBtn.disabled = !humanChk.checked;

    function addChatMsg(text, cls) { // Renamed from addMsg to avoid conflicts
        const d = document.createElement('div');
        d.className = `chat-msg ${cls}`;
        d.textContent = text;
        chatLog.appendChild(d);
        chatLog.scrollTop = chatLog.scrollHeight;
    }

    chatBotForm.onsubmit = async e => {
        e.preventDefault();
        if (!humanChk.checked) return;
        const msg = chatInput.value.trim();
        if (!msg) return;
        addChatMsg(msg, 'user');
        chatInput.value = '';
        addChatMsg('…', 'bot'); // Thinking indicator
        try {
            // Using a placeholder URL as the sample did. Replace with actual endpoint.
            const r = await fetch('https://example.com/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: msg })
            });
            if (!r.ok) throw new Error(`HTTP error! status: ${r.status}`);
            const d = await r.json();
            chatLog.lastChild.textContent = d.reply || (document.documentElement.lang === 'es' ? 'No hay respuesta del servidor.' : 'No reply from server.');
        } catch (err) {
            console.error("Chatbot API error:", err);
            chatLog.lastChild.textContent = document.documentElement.lang === 'es' ? "Error: No se puede conectar con la IA. Revise la consola." : "Error: Can't reach AI. Check console for details.";
        }
    };
}

/* ---------- Language and Theme Toggle Logic (Adapted from sample and existing global-toggles.js) ---------- */
// This section aims to consolidate and enhance the toggle logic.
// It should ideally replace the listeners in global-toggles.js for theme and language if this script is loaded.

function updateAllToggleButtonsText(isDark, lang) {
    qsa('.theme-toggle-btn').forEach(btn => {
        const label = lang === 'es' ?
            (isDark ? btn.dataset.esLabelLight : btn.dataset.esLabelDark) :
            (isDark ? btn.dataset.enLabelLight : btn.dataset.enLabelDark);
        if (label) {
            btn.textContent = label;
            btn.title = label;
            btn.setAttribute('aria-label', label);
        }
    });
    qsa('.lang-toggle-btn').forEach(btn => {
        btn.textContent = lang.toUpperCase();
        const label = lang === 'es' ? btn.dataset.esLabel : btn.dataset.enLabel;
         if(label) {
            btn.title = label;
            btn.setAttribute('aria-label', label);
         }
    });
}

function translatePage(lang) {
    document.documentElement.lang = lang;
    qsa('[data-en], [data-es]').forEach(el => {
        let text = lang === 'es' ? (el.dataset.es || el.dataset.en) : (el.dataset.en || el.dataset.es);
        let enPlaceholder = el.dataset.enPlaceholder;
        let esPlaceholder = el.dataset.esPlaceholder;
        let currentPlaceholder = lang === 'es' ? esPlaceholder : enPlaceholder;

        if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
            if (el.placeholder && (enPlaceholder || esPlaceholder)) {
                 el.placeholder = currentPlaceholder || text;
            }
        } else if (el.title && (el.dataset.enTitle || el.dataset.esTitle || el.dataset.enLabel || el.dataset.esLabel)) {
            const titleText = lang === 'es' ? (el.dataset.esTitle || el.dataset.esLabel) : (el.dataset.enTitle || el.dataset.enLabel);
            if (titleText) el.title = titleText;
            // Some buttons might have text content that also needs updating
            if (el.classList.contains('mobile-nav-item') && el.querySelector('span')) {
                 const span = el.querySelector('span');
                 const spanText = lang === 'es' ? span.dataset.es : span.dataset.en;
                 if(spanText) span.textContent = spanText;
            } else if (text && !el.querySelector('i')) { // Avoid replacing icon-only buttons
                 el.textContent = text;
            }
        } else if (text) {
            // Handle elements that directly contain text, like <p>, <span>, <h2> etc.
            // Check if the element contains only text and no other elements (like icons)
            let onlyText = true;
            el.childNodes.forEach(node => {
                if (node.nodeType === Node.ELEMENT_NODE && node.tagName !== 'SPAN' && node.tagName !== 'I') { // Allow spans if they are for text, ignore icons
                    // A bit more complex: if span has data-en/es, it will be handled separately.
                } else if (node.nodeType === Node.ELEMENT_NODE && node.tagName === 'I') {
                    onlyText = false; // Contains an icon
                }
            });
            if(onlyText || el.tagName === 'SPAN' || el.tagName === 'H1' || el.tagName === 'H2' || el.tagName === 'H3' || el.tagName === 'P' || el.tagName === 'BUTTON' && !el.querySelector('i')) {
                 // If it's a button without an icon, or a text element, set its text content
                 // This is a broad rule, ensure child elements with their own data-xx attributes are handled or this might overwrite them.
                 // For buttons in .fab-stack, they usually only have icons, so textContent change is not desired.
                 if(!el.closest('.fab-stack')) { // Don't change text content of FABs directly
                    el.textContent = text;
                 }
            }
        }
    });

    // Special update for service buttons in #services and #mobile-services-menu
    // as their text content is set directly and they don't have data-en/es on the button itself for text.
    // The sample HTML for mobile-services-menu buttons now includes data-en/data-es
    // For #services .service-nav-item, they already have data-en/es.

    const isDark = document.body.classList.contains('dark');
    updateAllToggleButtonsText(isDark, lang);
}

// Mobile Nav Language Toggle
const mobileLangToggle = qs('#mobile-language-toggle');
if (mobileLangToggle) {
    mobileLangToggle.onclick = () => {
        const newLang = document.documentElement.lang === 'en' ? 'es' : 'en';
        translatePage(newLang);
        // Potentially trigger storage save if global-toggles.js does that
        localStorage.setItem('preferredLanguage', newLang);
    };
}

// Mobile Nav Theme Toggle
const mobileThemeToggle = qs('#mobile-theme-toggle');
if (mobileThemeToggle) {
    mobileThemeToggle.onclick = () => {
        document.body.classList.toggle('dark');
        const isDark = document.body.classList.contains('dark');
        const currentLang = document.documentElement.lang || 'en';
        updateAllToggleButtonsText(isDark, currentLang);
        // Potentially trigger storage save
        localStorage.setItem('preferredTheme', isDark ? 'dark' : 'light');

        // Sync with header theme toggle if it exists
        const headerThemeToggle = qs('#theme-toggle-button');
        if(headerThemeToggle) {
             const label = currentLang === 'es' ?
                (isDark ? headerThemeToggle.dataset.esLabelLight : headerThemeToggle.dataset.esLabelDark) :
                (isDark ? headerThemeToggle.dataset.enLabelLight : headerThemeToggle.dataset.enLabelDark);
            if(label) {
                headerThemeToggle.textContent = label;
                headerThemeToggle.title = label;
                headerThemeToggle.setAttribute('aria-label', label);
            }
        }
    };
}


// Initial page load setup
document.addEventListener('DOMContentLoaded', () => {
    const preferredTheme = localStorage.getItem('preferredTheme');
    const preferredLanguage = localStorage.getItem('preferredLanguage') || document.documentElement.lang || 'en';

    let currentIsDark = document.body.classList.contains('dark'); // Default from body class
    if (preferredTheme) {
        currentIsDark = preferredTheme === 'dark';
        if (currentIsDark) document.body.classList.add('dark');
        else document.body.classList.remove('dark');
    }

    translatePage(preferredLanguage); // Translates and updates button texts
    updateAllToggleButtonsText(currentIsDark, preferredLanguage); // Final sync for all buttons

    // Ensure the mobile services menu items trigger modals correctly
    qsa('#mobile-services-menu button[data-modal-target]').forEach(button => {
        button.addEventListener('click', () => {
            const modalId = button.dataset.modalTarget;
            const modal = qs('#' + modalId);
            if (modal) {
                // This re-uses the dynamic modal manager's logic if it's still active
                // or we can directly activate it here if dmm is being phased out for these.
                // For now, let's assume the new [data-modal] logic will handle it if these buttons also get data-modal attr.
                // Or, if dynamic-modal-manager.js is still the primary loader for these:
                // dynamicModalManager.openModal(modalId, button.dataset.modalSource);

                // For simplicity with the new script, let's make them behave like data-modal buttons:
                modal.classList.add('active');
                const backdrop = qs('#modal-backdrop');
                if (backdrop) backdrop.style.display = 'flex';

                // Close the mobile services panel
                if(mobileServicesMenu) mobileServicesMenu.classList.remove('active');
                if(mobileServicesToggle) mobileServicesToggle.setAttribute('aria-expanded', 'false');
                if(mobileNav && menuToggle) { // Also close main mobile nav if services item is clicked
                    mobileNav.classList.remove('active');
                }

            }
        });
    });

     // Ensure chatbot modal button in new mobile nav works
    const chatButtonMobileNav = qs('#mobileNav button[data-modal="chatbot-modal"]');
    if(chatButtonMobileNav) {
        chatButtonMobileNav.addEventListener('click', () => {
             const modal = qs('#chatbot-modal');
             if(modal) modal.classList.add('active');
             const backdrop = qs('#modal-backdrop');
             if (backdrop) backdrop.style.display = 'flex';
             if(mobileNav && menuToggle) {
                mobileNav.classList.remove('active');
            }
        });
    }
});

// Add data-modal attribute to FABs that should use the new modal logic
document.addEventListener('DOMContentLoaded', () => {
    const fabJoin = qs('#fab-join');
    if (fabJoin) fabJoin.dataset.modal = 'join-us-modal';

    const fabContact = qs('#fab-contact');
    if (fabContact) fabContact.dataset.modal = 'contact-us-modal';

    const fabChatbot = qs('#fab-chatbot');
    if (fabChatbot) fabChatbot.dataset.modal = 'chatbot-modal';
});
