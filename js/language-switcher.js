// js/language-switcher.js
document.addEventListener('DOMContentLoaded', () => {
    const languageToggleButton = document.getElementById('language-toggle-button'); // Changed selector
    let currentLanguage = 'en'; // Default language

    const translations = {
        // ... (translations object remains unchanged) ...
        en: {
            "header.main": "OPS",
            "header.sub": "OPS Online Support&trade;",
            "services.title": "Our Services",
            "nav.businessOps": "Business Ops",
            "nav.contactCenter": "Contact Center",
            "nav.itSupport": "IT Support",
            "nav.professionals": "Professionals",
            "fab.join": "Join Us",
            "fab.contact": "Contact Us",
            "fab.chatbot": "Chatbot AI",
            "footer.copy": "&copy; 2023 OPS Online Support",
            "modal.businessOps.title": "Business Operations",
            "modal.businessOps.description": "We optimize your business processes for maximum efficiency and growth. Our services include workflow analysis, automation, and strategic planning.",
            "modal.contactCenter.title": "Contact Center Solutions",
            "modal.contactCenter.description": "Our state-of-the-art contact center services provide your customers with exceptional support, available 24/7 through multiple channels.",
            "modal.itSupport.title": "Comprehensive IT Support",
            "modal.itSupport.description": "Reliable IT support to keep your systems running smoothly. We offer helpdesk services, network management, cybersecurity, and cloud solutions.",
            "modal.professionals.title": "Skilled Professionals",
            "modal.professionals.description": "Access our pool of highly skilled professionals for your project needs. We provide experts in various fields, from project management to software development.",
            "modal.fabJoin.title": "Join Our Team",
            "modal.fabJoin.description": "We're looking for talented individuals to join OPS. Explore current opportunities and learn about our culture. <br><br> [Placeholder for job listings or application form link]",
            "modal.fabContact.title": "Contact Us",
            // Description for fabContact is now the form, handled by glow-effects.js
            "modal.fabChatbot.title": "AI Chatbot Assistant",
            "modal.fabChatbot.description": "Our AI Chatbot is here to help you with common questions. <br><br> [Placeholder for Chatbot UI or initiation button]",
            "form.contact.label.name": "Full Name",
            "form.contact.placeholder.name": "Enter your full name",
            "form.contact.label.email": "Email Address",
            "form.contact.placeholder.email": "your.email@company.com",
            "form.contact.label.bestTime": "Best time to call",
            "form.contact.label.bestDate": "Best date to call",
            "form.contact.label.countryCode": "Country Code",
            "form.contact.placeholder.countryCode": "+1",
            "form.contact.label.phoneNumber": "Phone Number",
            "form.contact.placeholder.phoneNumber": "Enter your phone number",
            "form.contact.label.areaOfInterest": "Area of Interest",
            "form.contact.option.selectArea": "Select an area...",
            "form.contact.label.message": "Message",
            "form.contact.placeholder.message": "How can we help you?",
            "form.contact.button.submit": "Submit",
            "form.validation.required": "This field is required.",
            "form.validation.email.invalid": "Invalid email format.",
            "form.validation.email.noBusiness": "Please use your business email. Free email providers are not accepted.",
            "form.validation.phone.invalid": "Invalid phone number.",
            "form.validation.countryCode.invalid": "Invalid country code.",
            "form.contact.submissionPending": "Preparing your data...",
            "form.contact.submissionSuccess": "Data prepared (logged to console). Thank you!",
            "joinModal.title": "Membership Application",
            "joinModal.section1.title": "Personal Information",
            "joinModal.section1.fullNameLabel": "Full Name:",
            "joinModal.section1.fullNamePlaceholder": "Enter your full name",
            "joinModal.section1.emailLabel": "Email:",
            "joinModal.section1.emailPlaceholder": "Enter your email address",
            "joinModal.button.next": "Next",
            "joinModal.section2.title": "Contact Details",
            "joinModal.section2.phoneLabel": "Phone Number:",
            "joinModal.section2.phonePlaceholder": "Enter your phone number",
            "joinModal.section2.addressLabel": "Address:",
            "joinModal.section2.addressPlaceholder": "Enter your address",
            "joinModal.button.previous": "Previous",
            "joinModal.section3.title": "Membership Preferences",
            "joinModal.section3.membershipTypeLabel": "Membership Type:",
            "joinModal.section3.membershipType.basic": "Basic",
            "joinModal.section3.membershipType.premium": "Premium",
            "joinModal.section3.membershipType.vip": "VIP",
            "joinModal.section3.referralLabel": "How did you hear about us?",
            "joinModal.section3.referralPlaceholder": "Tell us how you found us",
            "joinModal.button.submit": "Submit",
            "joinModal.alert.formSubmittedSuccess": "Form submitted successfully!",
            "joinModal.closeButtonAriaLabel": "Close Join Us Form"
        },
        es: {
            "header.main": "SPO",
            "header.sub": "Soporte en Línea SPO&trade;",
            "services.title": "Nuestros Servicios",
            "nav.businessOps": "Operaciones Comerciales",
            "nav.contactCenter": "Centro de Contacto",
            "nav.itSupport": "Soporte de TI",
            "nav.professionals": "Profesionales",
            "fab.join": "Únete",
            "fab.contact": "Contáctanos",
            "fab.chatbot": "Chatbot IA",
            "footer.copy": "&copy; 2023 Soporte en Línea SPO",
            "modal.businessOps.title": "Operaciones Comerciales",
            "modal.businessOps.description": "Optimizamos sus procesos comerciales para máxima eficiencia y crecimiento. Nuestros servicios incluyen análisis de flujo de trabajo, automatización y planificación estratégica.",
            "modal.contactCenter.title": "Soluciones de Centro de Contacto",
            "modal.contactCenter.description": "Nuestros servicios de centro de contacto de última generación brindan a sus clientes un soporte excepcional, disponible 24/7 a través de múltiples canales.",
            "modal.itSupport.title": "Soporte de TI Integral",
            "modal.itSupport.description": "Soporte de TI confiable para mantener sus sistemas funcionando sin problemas. Ofrecemos servicios de asistencia técnica, gestión de redes, ciberseguridad y soluciones en la nube.",
            "modal.professionals.title": "Profesionales Calificados",
            "modal.professionals.description": "Acceda a nuestro grupo de profesionales altamente calificados para sus necesidades de proyectos. Proveemos expertos en diversos campos, desde gestión de proyectos hasta desarrollo de software.",
            "modal.fabJoin.title": "Únete a Nuestro Equipo",
            "modal.fabJoin.description": "Buscamos personas talentosas para unirse a SPO. Explore oportunidades actuales y conozca nuestra cultura. <br><br> [Espacio para listados de trabajo o enlace a formulario]",
            "modal.fabContact.title": "Contáctanos",
            // Description for fabContact is now the form, handled by glow-effects.js
            "modal.fabChatbot.title": "Asistente Chatbot IA",
            "modal.fabChatbot.description": "Nuestro Chatbot IA está aquí para ayudarle con preguntas comunes. <br><br> [Espacio para UI de Chatbot o botón de inicio]",
            "form.contact.label.name": "Nombre Completo",
            "form.contact.placeholder.name": "Ingrese su nombre completo",
            "form.contact.label.email": "Correo Electrónico",
            "form.contact.placeholder.email": "su.correo@empresa.com",
            "form.contact.label.bestTime": "Mejor hora para llamar",
            "form.contact.label.bestDate": "Mejor fecha para llamar",
            "form.contact.label.countryCode": "Código de País",
            "form.contact.placeholder.countryCode": "+1",
            "form.contact.label.phoneNumber": "Número de Teléfono",
            "form.contact.placeholder.phoneNumber": "Ingrese su número de teléfono",
            "form.contact.label.areaOfInterest": "Área de Interés",
            "form.contact.option.selectArea": "Seleccione un área...",
            "form.contact.label.message": "Mensaje",
            "form.contact.placeholder.message": "¿Cómo podemos ayudarle?",
            "form.contact.button.submit": "Enviar",
            "form.validation.required": "Este campo es obligatorio.",
            "form.validation.email.invalid": "Formato de correo inválido.",
            "form.validation.email.noBusiness": "Por favor, use su correo de empresa. No se aceptan proveedores de correo gratuito.",
            "form.validation.phone.invalid": "Número de teléfono inválido.",
            "form.validation.countryCode.invalid": "Código de país inválido.",
            "form.contact.submissionPending": "Preparando sus datos...",
            "form.contact.submissionSuccess": "Datos preparados (registrados en consola). ¡Gracias!",
            "joinModal.title": "Solicitud de Membresía",
            "joinModal.section1.title": "Información Personal",
            "joinModal.section1.fullNameLabel": "Nombre Completo:",
            "joinModal.section1.fullNamePlaceholder": "Ingrese su nombre completo",
            "joinModal.section1.emailLabel": "Correo Electrónico:",
            "joinModal.section1.emailPlaceholder": "Ingrese su dirección de correo electrónico",
            "joinModal.button.next": "Siguiente",
            "joinModal.section2.title": "Detalles de Contacto",
            "joinModal.section2.phoneLabel": "Número de Teléfono:",
            "joinModal.section2.phonePlaceholder": "Ingrese su número de teléfono",
            "joinModal.section2.addressLabel": "Dirección:",
            "joinModal.section2.addressPlaceholder": "Ingrese su dirección",
            "joinModal.button.previous": "Anterior",
            "joinModal.section3.title": "Preferencias de Membresía",
            "joinModal.section3.membershipTypeLabel": "Tipo de Membresía:",
            "joinModal.section3.membershipType.basic": "Básico",
            "joinModal.section3.membershipType.premium": "Premium",
            "joinModal.section3.membershipType.vip": "VIP",
            "joinModal.section3.referralLabel": "¿Cómo te enteraste de nosotros?",
            "joinModal.section3.referralPlaceholder": "Cuéntanos cómo nos encontraste",
            "joinModal.button.submit": "Enviar",
            "joinModal.alert.formSubmittedSuccess": "¡Formulario enviado con éxito!",
            "joinModal.closeButtonAriaLabel": "Cerrar Formulario Únete"
        }
    };

    window.getTranslatedText = function(key) {
        return translations[currentLanguage]?.[key] || key; // Added optional chaining for safety
    };
    window.getCurrentLanguage = function() {
        return currentLanguage;
    };

    function loadTranslations() {
        document.querySelectorAll('[data-translate-key]').forEach(element => {
            const key = element.getAttribute('data-translate-key');
            const translation = translations[currentLanguage]?.[key]; // Optional chaining
            if (translation !== undefined) {
                if (key.includes("footer.copy") || key.includes("header.sub")) {
                    element.innerHTML = translation;
                } else {
                    element.textContent = translation;
                }
            } else {
                // console.warn(`Translation key not found: ${key} for language: ${currentLanguage}`);
            }
        });

        // Handle placeholders
        document.querySelectorAll('[data-placeholder-translate-key]').forEach(element => {
            const key = element.getAttribute('data-placeholder-translate-key');
            const translation = translations[currentLanguage]?.[key]; // Optional chaining
            if (translation !== undefined) {
                element.setAttribute('placeholder', translation);
            } else {
                // console.warn(`Placeholder translation key not found: ${key} for language: ${currentLanguage}`);
            }
        });

        // Handle aria-labels
        document.querySelectorAll('[data-aria-label-translate-key]').forEach(element => {
            const key = element.getAttribute('data-aria-label-translate-key');
            const translation = translations[currentLanguage]?.[key]; // Optional chaining
            if (translation !== undefined) {
                element.setAttribute('aria-label', translation);
            } else {
                // console.warn(`ARIA label translation key not found: ${key} for language: ${currentLanguage}`);
            }
        });
    }

    function setLanguage(lang) {
        currentLanguage = lang;
        if (languageToggleButton) { // Check if button exists
            languageToggleButton.textContent = lang === 'es' ? '[ES]' : '[EN]'; // Update button text
        }
        loadTranslations();
        localStorage.setItem('language', lang);
        document.dispatchEvent(new CustomEvent('languageChanged', { detail: { language: currentLanguage } }));
    }

    const savedLanguage = localStorage.getItem('language');
    // Set initial language and button text based on saved preference or default
    setLanguage(savedLanguage || 'en');

    if (languageToggleButton) {
        languageToggleButton.addEventListener('click', () => {
            const newLang = currentLanguage === 'en' ? 'es' : 'en';
            setLanguage(newLang);
        });
    } else {
        console.warn('Language toggle button #language-toggle-button not found.');
    }
});
