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
    const modalContent = modal.querySelector('.modal-content');

    if (modalContent && modalContent.classList.contains('modal-draggable')) {
        bringToFront(modalContent);
        modalContent.addEventListener('mousedown', () => bringToFront(modalContent));
        // Center the modal
        modalContent.style.left = `calc(50% - ${modalContent.offsetWidth / 2}px)`;
        modalContent.style.top = `calc(50% - ${modalContent.offsetHeight / 2}px)`;

        const dragHandle = modalContent.querySelector('.drag-handle') || modalContent;
        makeDraggable(modalContent, dragHandle);

        const resizeHandle = modalContent.querySelector('.resize-handle');
        if (resizeHandle) {
            makeResizable(modalContent, resizeHandle);
        }
    }

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
// Refactored to be more robust and prevent duplicate listeners.

// 1. Centralized handler for closing any active modal
function closeActiveModal() {
  const activeModal = qs('.modal-overlay.active');
  if (activeModal) {
    activeModal.classList.remove('active');
  }
}

// 2. Keydown listener attached once globally
window.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    closeActiveModal();
  }
});

// 3. Click listener on the body to handle all modal closing scenarios
document.body.addEventListener('click', e => {
  // Close via [X] button or any button with [data-close]
  if (e.target.closest('[data-close]')) {
    e.stopPropagation();
    // The button might be inside a modal that isn't the one to close (e.g., a sub-modal's close button)
    // so we find the closest modal overlay to the button and close it.
    const modalToClose = e.target.closest('.modal-overlay');
    if (modalToClose) {
      modalToClose.classList.remove('active');
    } else {
      // Fallback for cases where the structure is unexpected
      closeActiveModal();
    }
  }

  // Close via overlay click
  // Check if the direct click target is a modal overlay
  if (e.target.classList.contains('modal-overlay')) {
    e.target.classList.remove('active');
  }
}, true); // Use capture phase to catch clicks on overlay reliably


function attachModalHandlers(modal) {
  // The global listeners on window and body now handle all closing logic.
  // This function is now primarily for any modal-specific setup
  // that ISN'T related to closing, which in this case is nothing.
  // We keep the function for potential future use and to maintain the call structure in openModal.

  // Example of what could go here:
  // if (modal.id === 'someSpecialModal') {
  //   console.log('Special modal is being set up!');
  // }
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

  // ===== FAB Chatbot Panel Toggle =====
  const chatbotFabButton = qs('#chatbotFabButton');
  const chatbotPanel = qs('#chatbot-container');
  const fabStack = qs('.fab-stack');
  const mobileNavChatButton = qs('#mobileNavChatButton'); // Selector for mobile nav chat button

  function toggleChatbotPanel(event) {
    if (event) event.stopPropagation(); // Prevent click from bubbling

    if (chatbotPanel && fabStack) { // Ensure panel and stack exist
      const isChatbotPanelHidden = chatbotPanel.style.display === 'none' || chatbotPanel.style.display === '';

      if (isChatbotPanelHidden) { // Chatbot is about to be shown
        chatbotPanel.style.display = 'flex';
        // Shift FAB stack upward while chatbot is visible
        // Use CSS variable to maintain consistent spacing
        fabStack.style.bottom = 'calc(var(--chatbot-inset-bottom) - 5px)';
        // Initialize chatbot if not already done for FAB context
        if (!chatbotPanel.classList.contains('__fab_chatbot_ready')) {
          chatbotInit(chatbotPanel);
          chatbotPanel.classList.add('__fab_chatbot_ready');
        }
      } else { // Chatbot is about to be hidden
        chatbotPanel.style.display = 'none';
        // Revert FAB stack position to its default from CSS
        fabStack.style.bottom = '';
      }
    }
  }

  if (chatbotFabButton && chatbotPanel && fabStack) {
    chatbotFabButton.addEventListener('click', toggleChatbotPanel);
  }

  if (mobileNavChatButton && chatbotPanel && fabStack) {
    mobileNavChatButton.addEventListener('click', toggleChatbotPanel);
  }

  // ===== FAB Stack Positioning relative to Footer =====
  const siteFooter = qs('.site-footer');
  // const fabStack = qs('.fab-stack'); // Already defined above if chatbotFabButton exists

  function adjustFabPosition() {
    if (!fabStack || !siteFooter) return;

    // Check if fabStack is displayed (it's hidden on wider screens by CSS)
    const fabStackStyle = window.getComputedStyle(fabStack);
    if (fabStackStyle.display === 'none') {
      // If FABs are not displayed, no need to adjust position.
      // Reset any inline style that might have been applied if it becomes visible again.
      fabStack.style.bottom = '';
      return;
    }

    const footerRect = siteFooter.getBoundingClientRect();
    const bodyRect = document.body.getBoundingClientRect(); // FABs are absolute to body

    // Calculate space from bottom of viewport to top of footer
    // This is how much of the footer is visible or how far it is from bottom of viewport
    const spaceBelowFooter = window.innerHeight - footerRect.top;

    let fabBottomPosition;

    if (footerRect.bottom <= window.innerHeight) {
      // Footer is fully or partially visible at the bottom of the viewport
      // Position FABs 15px above the footer's top edge
      // The 'bottom' style for an absolutely positioned element is relative to its container's (body) bottom padding edge.
      // We want the FABs' bottom edge to be 'window.innerHeight - footerRect.top + 15px' from the body's bottom.
      // This can be simplified: distance from body bottom = (body height - footer top) + 15px
      // fabBottomPosition = (bodyRect.height - footerRect.top) + 15; // This might be too complex

      // Simpler: distance from viewport bottom to where FABs bottom should be:
      // (distance from viewport bottom to footer top) + footer height + 15px
      // fabBottomPosition = (window.innerHeight - footerRect.top) + siteFooter.offsetHeight + 15;

      // Let's try a different approach for absolute positioning:
      // The distance from the bottom of the body to the top of the footer is:
      // body.scrollHeight - footer.offsetTop
      // We want the FABs to be 15px above the footer.
      // So, the bottom of the FABs should be at 'distance from body bottom to footer top' + 15px
      // This means fabStack.style.bottom = (document.body.scrollHeight - siteFooter.offsetTop + 15) + 'px';
      // This is for if fabStack is absolute to a container that has footer as last child.
      // Since fabStack is absolute to body, and footer is also child of body:
      // We want the fabStack's bottom edge to be X pixels from the body's bottom edge.
      // X = (distance from body bottom to footer bottom) + footer height + 15px
      // X = (document.body.scrollHeight - siteFooter.offsetTop - siteFooter.offsetHeight) + siteFooter.offsetHeight + 15
      // X = (document.body.scrollHeight - siteFooter.offsetTop) + 15px;
      // This value is the distance from the bottom of the document.
      // The CSS `bottom` for absolute positioning refers to distance from containing block's bottom edge.
      // If body is the container, and body can scroll, then this is simpler:
      // bottom edge of fab-stack should be window.innerHeight - (footerRect.top - 15) from viewport top.
      // So, fab-stack bottom from container bottom:
      // container_height - (viewport_scroll_Y + footerRect.top - 15)
      // This is getting complicated. Let's use the initial CSS `bottom: 15px` for the fab-stack
      // which means it's 15px from the bottom of the body.
      // The JS should only intervene if this isn't visually 15px from the *top* of the footer.

      // If the footer is at the very bottom of the body, and fab-stack is bottom:15px (CSS),
      // it means it's 15px from the bottom of the footer.
      // To make it 15px from the *top* of the footer, its bottom should be:
      // (CSS bottom relative to body) + footer.offsetHeight + 15px.
      // So, if CSS sets it to 15px from body bottom:
      fabBottomPosition = (15 + siteFooter.offsetHeight + 15) + 'px';
      // This interpretation is: static CSS puts FAB 15px from body bottom.
      // If footer is at body bottom, FAB is 15px from footer bottom.
      // To be 15px from footer *top*, we need to lift it by footer height + another 15px.
      // This seems the most direct interpretation of making the CSS `bottom:15px` (from body)
      // relate to "15px from the top of the footer element".

    } else {
      // Footer is scrolled out of view (above the viewport bottom)
      // In this case, the FABs should probably stick to a minimum distance from viewport bottom,
      // similar to how they were with fixed positioning.
      // Or, they continue to be 15px + footer.offsetHeight + 15px from document bottom.
      // The current CSS `bottom:15px` (absolute to body) will handle this naturally as scrolling occurs.
      // So, the JS adjustment is primarily for when the footer is visible.
      // If footer is not visible at bottom, the CSS `bottom:15px` (relative to body) is fine.
      // The problem is when body is taller than viewport.
      // Let's always calculate based on footer position relative to document.
      // Distance from bottom of document to top of footer: document.body.scrollHeight - siteFooter.offsetTop
      // We want FABs bottom to be 15px above this.
      // So, fabStack.style.bottom = (document.body.scrollHeight - siteFooter.offsetTop + 15) + 'px';
      // This positions bottom of FABs 15px above the footer's top edge, relative to document bottom.
       fabBottomPosition = (document.body.scrollHeight - siteFooter.offsetTop + 15) + 'px';
    }
     // Only apply if fabStack is visible (i.e., on mobile screens)
    if (fabStack.offsetParent !== null) { // A simple check for visibility
        fabStack.style.bottom = fabBottomPosition;
    }
  }

  // Initial adjustment
  adjustFabPosition();

  // Adjust on scroll and resize
  window.addEventListener('scroll', adjustFabPosition);
  window.addEventListener('resize', adjustFabPosition);
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


// ===== Draggable and Resizable Modals =====
let zIndexCounter = 4001;

function bringToFront(modalContent) {
    modalContent.style.zIndex = zIndexCounter++;
}

function makeResizable(modalContent, resizeHandle) {
    let startX, startY, startWidth, startHeight;

    resizeHandle.onmousedown = function(e) {
        e.preventDefault();
        startX = e.clientX;
        startY = e.clientY;
        startWidth = parseInt(document.defaultView.getComputedStyle(modalContent).width, 10);
        startHeight = parseInt(document.defaultView.getComputedStyle(modalContent).height, 10);
        document.onmousemove = doDrag;
        document.onmouseup = stopDrag;
    }

    function doDrag(e) {
        modalContent.style.width = (startWidth + e.clientX - startX) + 'px';
        modalContent.style.height = (startHeight + e.clientY - startY) + 'px';
    }

    function stopDrag(e) {
        document.onmousemove = null;
        document.onmouseup = null;
    }
}

function makeDraggable(modalContent, handle) {
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    handle.onmousedown = dragMouseDown;

    function dragMouseDown(e) {
        e = e || window.event;
        e.preventDefault();
        pos3 = e.clientX;
        pos4 = e.clientY;
        document.onmouseup = closeDragElement;
        document.onmousemove = elementDrag;
    }

    function elementDrag(e) {
        e = e || window.event;
        e.preventDefault();
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;

        let newTop = modalContent.offsetTop - pos2;
        let newLeft = modalContent.offsetLeft - pos1;

        // Constrain to viewport
        if (newTop < 0) newTop = 0;
        if (newLeft < 0) newLeft = 0;
        if (newTop + modalContent.offsetHeight > window.innerHeight) newTop = window.innerHeight - modalContent.offsetHeight;
        if (newLeft + modalContent.offsetWidth > window.innerWidth) newLeft = window.innerWidth - modalContent.offsetWidth;

        modalContent.style.top = newTop + "px";
        modalContent.style.left = newLeft + "px";
    }

    function closeDragElement() {
        document.onmouseup = null;
        document.onmousemove = null;
    }
}

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


function chatbotInit(container) { // container is the chatbot panel or modal overlay
  // Make the chatbot draggable
  const modalContent = container.querySelector('.modal-content');
  const dragHandle = container.querySelector('#chatbot-modal-header');
  if (modalContent && dragHandle) {
    makeDraggable(modalContent, dragHandle);
  }

  // Chatbot-specific toggles can now leverage global functions
  const chatbotLangToggle = container.querySelector('#langCtrl, #chatbot-modal-langCtrl');
  const chatbotThemeToggle = container.querySelector('#themeCtrl, #chatbot-modal-themeCtrl');

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

  // Chatbot logic scoped to the container
  const log = container.querySelector('#chat-log, #chatbot-modal-log');
  const form = container.querySelector('#chatbot-input-row, #chatbot-modal-input-row');
  const input = container.querySelector('#chatbot-input, #chatbot-modal-input');
  const send = container.querySelector('#chatbot-send, #chatbot-modal-send');
  const guard = container.querySelector('#human-check, #chatbot-modal-human-check');
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
