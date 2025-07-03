// Global state
let currentLang = 'en'; // Default language

// DOM Elements
const themeToggleButton = document.getElementById('theme-toggle');
const languageToggleButton = document.querySelector('.lang-toggle'); // Assuming this is the primary lang toggle
const body = document.body;

// ---------- LANGUAGE TOGGLING ----------
function updateLang() {
  // Update text content for elements with data-en/data-es attributes
  document.querySelectorAll('[data-en]').forEach(el => {
    const translation = el.getAttribute(`data-${currentLang}`);
    if (translation) {
      // Avoid changing text content if element has children that might also be translated
      // This is a simple check; more complex structures might need specific handling
      if (el.childElementCount === 0 || el.classList.contains('lang-toggle') || el.tagName === 'BUTTON' || el.tagName === 'H2' || el.tagName === 'H3' || el.tagName === 'LABEL' || el.tagName === 'P' || el.tagName === 'OPTION' || el.tagName === 'TITLE') {
         if (el.tagName === 'OPTION' && el.value === "") { // Handle select placeholder
            // Do not overwrite value attribute, only text content
         } else {
            el.textContent = translation;
         }
      }
      // Special case for the language toggle button text itself if it's the one being iterated
      if (el.classList.contains('lang-toggle')) {
        el.textContent = currentLang === 'en' ? 'EN | ES' : 'ES | EN';
      }
    }
  });

  // Update placeholders
  document.querySelectorAll('[data-placeholder-en]').forEach(el => {
    el.placeholder = el.getAttribute(`data-placeholder-${currentLang}`);
  });

  // Update ARIA labels
  document.querySelectorAll('[data-aria-label-en]').forEach(el => {
    // Special handling for mobile menu toggle alt text (if ever used, from original script)
    if (el.id === 'mobile-menu-toggle' && el.hasAttribute(`data-aria-label-${currentLang}-alt`)) {
      el.setAttribute('aria-label', el.getAttribute(`data-aria-label-${currentLang}-alt`));
    } else {
      el.setAttribute('aria-label', el.getAttribute(`data-aria-label-${currentLang}`));
    }
  });

  // Update page title
  const titleTag = document.querySelector('title');
  if (titleTag && titleTag.hasAttribute(`data-${currentLang}`)) {
    document.title = titleTag.getAttribute(`data-${currentLang}`);
  }
}

function toggleLang() {
  currentLang = currentLang === 'en' ? 'es' : 'en';
  updateLang();
}

// ---------- THEME TOGGLING ----------
function applyTheme(theme) {
  if (theme === 'dark') {
    body.classList.add('dark-mode');
    if (themeToggleButton) themeToggleButton.textContent = 'Light'; // Or an icon representing light mode
  } else {
    body.classList.remove('dark-mode');
    if (themeToggleButton) themeToggleButton.textContent = 'Dark'; // Or an icon representing dark mode
  }
}

function toggleTheme() {
  const newTheme = body.classList.contains('dark-mode') ? 'light' : 'dark';
  localStorage.setItem('theme', newTheme);
  applyTheme(newTheme);
}

// ---------- FORM SECTION INTERACTIVITY ----------
function initializeFormSections() {
  document.querySelectorAll('.form-section').forEach(section => {
    const addBtn = section.querySelector('.add');
    const removeBtn = section.querySelector('.remove');
    const acceptBtn = section.querySelector('.accept-btn');
    const editBtn = section.querySelector('.edit-btn');
    const inputsContainer = section.querySelector('.inputs'); // Renamed to avoid conflict with 'inputs' variable name
    const titleEl = section.querySelector('h2'); // Renamed to avoid conflict

    if (!addBtn || !removeBtn || !acceptBtn || !editBtn || !inputsContainer || !titleEl) {
      // console.warn('A form section is missing expected elements for initialization:', section);
      return;
    }

    addBtn.onclick = () => {
      const input = document.createElement('input');
      input.type = 'text'; // Defaulting to text, adjust if other types are needed
      const enPlaceholder = `Enter ${titleEl.getAttribute('data-en') || 'info'} here`;
      const esPlaceholder = `Ingresa ${titleEl.getAttribute('data-es') || 'información'} aquí`;
      input.setAttribute('data-placeholder-en', enPlaceholder);
      input.setAttribute('data-placeholder-es', esPlaceholder);
      input.placeholder = currentLang === 'es' ? esPlaceholder : enPlaceholder;
      inputsContainer.appendChild(input);
    };

    removeBtn.onclick = () => {
      const allInputs = inputsContainer.querySelectorAll('input');
      if (allInputs.length) {
        inputsContainer.removeChild(allInputs[allInputs.length - 1]);
      }
    };

    acceptBtn.onclick = () => {
      if (!inputsContainer.querySelector('input')) {
        const msg = currentLang === 'es' ? 'Agrega al menos una entrada.' : 'Please add at least one entry.';
        alert(msg);
        return;
      }
      inputsContainer.querySelectorAll('input').forEach(input => input.disabled = true);
      acceptBtn.style.display = 'none';
      editBtn.style.display = 'inline-block';
      section.classList.add('completed');
    };

    editBtn.onclick = () => {
      inputsContainer.querySelectorAll('input').forEach(input => input.disabled = false);
      acceptBtn.style.display = 'inline-block';
      editBtn.style.display = 'none';
      section.classList.remove('completed');
    };
  });
}

// ---------- INITIALIZATION ----------
document.addEventListener('DOMContentLoaded', () => {
  // Initialize Theme
  const savedTheme = localStorage.getItem('theme');
  const systemPrefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  if (savedTheme) {
    applyTheme(savedTheme);
  } else if (systemPrefersDark) {
    applyTheme('dark');
  } else {
    applyTheme('light'); // Default to light theme
  }

  // Initialize Language
  updateLang(); // Set initial language based on `currentLang` default or saved preference (if implemented)

  // Initialize Form Sections
  initializeFormSections();

  // Setup Event Listeners
  if (themeToggleButton) {
    themeToggleButton.addEventListener('click', toggleTheme);
  } else {
    // console.warn('Theme toggle button #theme-toggle not found.');
  }

  if (languageToggleButton) {
    languageToggleButton.addEventListener('click', toggleLang);
  } else {
    // console.warn('Language toggle button .lang-toggle not found.');
  }

  // Example: Keeping modal specific JS in index.html for now, but could be moved here too.
  // const closeModalButton = document.getElementById('close-modal-btn');
  // if (closeModalButton) {
  //   closeModalButton.onclick = () => {
  //     const joinModal = document.getElementById('join-modal');
  //     if (joinModal) joinModal.style.display = 'none';
  //   };
  // }

  // const joinForm = document.getElementById('join-form');
  // if (joinForm) {
  //   joinForm.addEventListener('submit', function(e) {
  //     e.preventDefault();
  //     alert(currentLang === 'es' ? 'Formulario enviado.' : 'Form submitted.');
  //   });
  // }
});
