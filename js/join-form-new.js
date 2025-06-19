// Modal Close: X and click outside
const modalOverlay = document.getElementById('join-modal');
const modalContent = document.getElementById('modal-content');
// Ensure elements exist before attaching event listeners
if (document.getElementById('close-modal-btn')) {
    document.getElementById('close-modal-btn').onclick = () => {
        if (modalOverlay) modalOverlay.style.display = 'none';
    };
}
if (modalOverlay) {
    modalOverlay.onclick = (e) => {
      if (e.target === modalOverlay) modalOverlay.style.display = 'none';
    };
}

// Language toggle and translation
let currentLang = 'en'; // Default language

function updateTranslations() {
    document.querySelectorAll('[data-en], [data-es]').forEach(el => {
        const textKey = `data-${currentLang}`;
        const placeholderKey = `data-placeholder-${currentLang}`;

        if (el.hasAttribute(placeholderKey) && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA')) {
            el.placeholder = el.getAttribute(placeholderKey);
        } else if (el.hasAttribute(textKey)) {
            // Avoid changing text content of inputs/textareas that are only meant for placeholder translation
            if (!(el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') || !el.hasAttribute('data-placeholder-en')) {
                 el.textContent = el.getAttribute(textKey);
            }
        }
    });
    // Update title of the page
    const pageTitle = document.querySelector('title');
    if(pageTitle && pageTitle.hasAttribute(`data-${currentLang}`)){
        pageTitle.textContent = pageTitle.getAttribute(`data-${currentLang}`);
    }
    // Update lang toggle button text
    const langToggleButton = document.querySelector('.lang-toggle');
    if (langToggleButton) {
        langToggleButton.textContent = currentLang === 'en' ? 'EN | ES' : 'ES | EN';
    }
    // Set HTML lang attribute
    document.documentElement.lang = currentLang;
}

function toggleLang() {
  currentLang = currentLang === 'en' ? 'es' : 'en';
  updateTranslations();
}

// Setup language toggle button if it exists
const langToggleButton = document.querySelector('.lang-toggle');
if (langToggleButton) {
    langToggleButton.onclick = toggleLang;
}

// Initial language setup on load
updateTranslations();


// Dynamic Sections
document.querySelectorAll('.form-section').forEach(section => {
  const addBtn = section.querySelector('.add');
  const removeBtn = section.querySelector('.remove');
  const acceptBtn = section.querySelector('.accept-btn');
  const editBtn = section.querySelector('.edit-btn');
  const inputsContainer = section.querySelector('.inputs');
  const sectionName = section.dataset.section; // The English name from data-section attribute

  // Dynamically get translated section name for placeholder
  const sectionTitleElement = section.querySelector('.section-header h2');
  let translatedSectionName = sectionName; // Default to English
  if (sectionTitleElement) {
    // Check current language and get translated name if available
    translatedSectionName = sectionTitleElement.getAttribute(`data-${currentLang}`) || sectionName;
  }


  if (!addBtn || !removeBtn || !acceptBtn || !editBtn || !inputsContainer) return;

  addBtn.addEventListener('click', () => {
    const input = document.createElement('input');
    input.type = 'text';
    // Use the (potentially) translated section name for the placeholder
    const currentSectionNameDisplay = sectionTitleElement.textContent.replace(/ ✅$/, '').trim();
    input.placeholder = currentLang === 'es'
      ? `Ingresa información de ${currentSectionNameDisplay}`
      : `Enter ${currentSectionNameDisplay} info`;
    inputsContainer.appendChild(input);
  });

  removeBtn.addEventListener('click', () => {
    const inputs = inputsContainer.querySelectorAll('input');
    if (inputs.length > 0) {
      inputsContainer.removeChild(inputs[inputs.length - 1]);
    }
  });

  acceptBtn.addEventListener('click', () => {
    const inputs = inputsContainer.querySelectorAll('input');
    // Use the (potentially) translated section name for the alert
    const currentSectionNameDisplay = sectionTitleElement.textContent.replace(/ ✅$/, '').trim();
    if (inputs.length === 0) {
      alert(currentLang === 'es'
        ? `Agrega al menos una entrada en ${currentSectionNameDisplay}.`
        : `Please add at least one ${currentSectionNameDisplay} entry.`);
      return;
    }
    inputs.forEach(input => input.disabled = true);
    section.classList.add('completed');
    acceptBtn.style.display = 'none';
    if (editBtn) editBtn.style.display = 'inline-block';
  });

  editBtn.addEventListener('click', () => {
    const inputs = inputsContainer.querySelectorAll('input');
    inputs.forEach(input => input.disabled = false);
    section.classList.remove('completed');
    acceptBtn.style.display = 'inline-block';
    editBtn.style.display = 'none';
  });
});

// Optional: Prevent form submit default (custom logic goes here)
const joinFormNew = document.getElementById('join-form');
if (joinFormNew) {
    joinFormNew.addEventListener('submit', function(e) {
      e.preventDefault();
      alert(currentLang === 'es' ? 'Formulario enviado (simulado).' : 'Form submitted (simulated).');
      // Potentially close modal after submission
      if (modalOverlay) modalOverlay.style.display = 'none';
    });
}

console.log("join-form-new.js loaded and initialized.");
