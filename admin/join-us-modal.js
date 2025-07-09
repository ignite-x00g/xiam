let currentLang = 'en';

const modal = document.getElementById('join-modal');
document.getElementById('close-modal-btn').onclick = () => modal.style.display = 'none';
modal.onclick = (e) => { if (e.target === modal) modal.style.display = 'none'; };

const sections = [
  { key: 'Skills', en: 'Skills', es: 'Habilidades' },
  { key: 'Education', en: 'Education', es: 'Educación' },
  { key: 'Continued Education', en: 'Continued Education', es: 'Educación Continua' },
  { key: 'Certification', en: 'Certification', es: 'Certificación' },
  { key: 'Hobbies', en: 'Hobbies', es: 'Pasatiempos' },
];

const sectionContainer = document.getElementById('sections');

sections.forEach(({ key, en, es }) => {
  const wrapper = document.createElement('div');
  wrapper.className = 'form-section';
  wrapper.setAttribute('data-section', key);
  wrapper.innerHTML = `
    <div class="section-header">
      <h2 data-en="${en}" data-es="${es}">${en}</h2>
      <div>
        <button type="button" class="circle-btn add">+</button>
        <button type="button" class="circle-btn remove">−</button>
      </div>
    </div>
    <div class="inputs"></div>
    <button type="button" class="accept-btn" data-en="Accept" data-es="Aceptar">Accept</button>
    <button type="button" class="edit-btn" data-en="Edit" data-es="Editar" style="display:none;">Edit</button>
  `;
  sectionContainer.appendChild(wrapper);
});

function updateLang() {
  document.querySelectorAll('[data-en]').forEach(el => {
    el.textContent = el.getAttribute(`data-${currentLang}`);
  });
  document.querySelectorAll('[data-placeholder-en]').forEach(el => {
    el.placeholder = el.getAttribute(`data-placeholder-${currentLang}`);
  });
  document.querySelectorAll('[data-aria-label-en]').forEach(el => {
    el.setAttribute('aria-label', el.getAttribute(`data-aria-label-${currentLang}`));
  });
  document.title = document.querySelector('title').getAttribute(`data-${currentLang}`);
}

updateLang(); // Initialize language on load

document.querySelectorAll('.form-section').forEach(section => {
  const addBtn = section.querySelector('.add');
  const removeBtn = section.querySelector('.remove');
  const acceptBtn = section.querySelector('.accept-btn');
  const editBtn = section.querySelector('.edit-btn');
  const inputs = section.querySelector('.inputs');
  const title = section.querySelector('h2');

  addBtn.onclick = () => {
    const input = document.createElement('input');
    const en = `Enter ${title.getAttribute('data-en')} info`;
    const es = `Ingresa ${title.getAttribute('data-es')} info`;
    input.setAttribute('data-placeholder-en', en);
    input.setAttribute('data-placeholder-es', es);
    input.placeholder = currentLang === 'es' ? es : en;
    inputs.appendChild(input);
  };

  removeBtn.onclick = () => {
    const all = inputs.querySelectorAll('input');
    if (all.length) inputs.removeChild(all[all.length - 1]);
  };

  acceptBtn.onclick = () => {
    if (!inputs.querySelector('input')) {
      alert(currentLang === 'es' ? 'Agrega al menos una entrada.' : 'Please add at least one entry.');
      return;
    }
    inputs.querySelectorAll('input').forEach(input => input.disabled = true);
    acceptBtn.style.display = 'none';
    editBtn.style.display = 'inline-block';
    section.classList.add('completed');
  };

  editBtn.onclick = () => {
    inputs.querySelectorAll('input').forEach(input => input.disabled = false);
    acceptBtn.style.display = 'inline-block';
    editBtn.style.display = 'none';
    section.classList.remove('completed');
  };
});

document.getElementById('join-form').addEventListener('submit', function(e) {
  e.preventDefault();
  alert(currentLang === 'es' ? 'Formulario enviado.' : 'Form submitted.');
});

// Example function to toggle language (can be triggered by a button not shown in the modal HTML)
// function toggleSiteLanguage() {
//   currentLang = currentLang === 'en' ? 'es' : 'en';
//   updateLang();
// }
// Make sure this is called if you have a language toggle button outside this specific modal script
// For example, if your global language toggle should also affect this modal
// document.getElementById('global-language-toggle-button-id').addEventListener('click', toggleSiteLanguage);
