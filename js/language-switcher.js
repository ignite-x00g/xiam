// js/language-switcher.js
document.addEventListener('DOMContentLoaded', () => {
    const languageToggleCheckbox = document.getElementById('language-toggle-checkbox');
    let currentLanguage = 'en'; // Default language

    const translations = {
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
            // Dynamic content keys (will be accessed by glow-effects.js)
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
            "modal.fabContact.description": "Get in touch with OPS for support or inquiries. <br><br> Email: contact@opsonlinesupport.com <br> Phone: 1-800-OPS-HELP <br><br> [Placeholder for a contact form]",
            "modal.fabChatbot.title": "AI Chatbot Assistant",
            "modal.fabChatbot.description": "Our AI Chatbot is here to help you with common questions. <br><br> [Placeholder for Chatbot UI or initiation button]",
            // Contact Form translations - EN
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
            "form.contact.submissionSuccess": "Data prepared (logged to console). Thank you!"
        },
        es: {
            "header.main": "SPO", // Assuming OPS translates to SPO or similar
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
            // Dynamic content keys - Spanish
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
            "modal.fabContact.description": "Póngase en contacto con SPO para soporte o consultas. <br><br> Correo: contacto@opsonlinesupport.com <br> Teléfono: 1-800-OPS-HELP <br><br> [Espacio para formulario de contacto]",
            "modal.fabChatbot.title": "Asistente Chatbot IA",
            "modal.fabChatbot.description": "Nuestro Chatbot IA está aquí para ayudarle con preguntas comunes. <br><br> [Espacio para UI de Chatbot o botón de inicio]",
            // Contact Form translations - ES
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
            "form.contact.submissionSuccess": "Datos preparados (registrados en consola). ¡Gracias!"
        }
    };

    // Expose a function to get translations for the current language
    // This will be used by glow-effects.js for dynamic content
    window.getTranslatedText = function(key) {
        return translations[currentLanguage][key] || key; // Return key if translation not found
    };

    // Expose current language for other scripts if needed (e.g. for modal content)
    window.getCurrentLanguage = function() {
        return currentLanguage;
    };

    function loadTranslations() {
        document.querySelectorAll('[data-translate-key]').forEach(element => {
            const key = element.getAttribute('data-translate-key');
            // Use innerHTML for keys that might contain HTML entities like &copy; or &trade;
            if (key.includes("footer.copy") || key.includes("header.sub")) {
                element.innerHTML = translations[currentLanguage][key] || element.innerHTML;
            } else {
                element.textContent = translations[currentLanguage][key] || element.textContent;
            }
        });
        // After static translations, dynamic content (modals) needs to be aware.
        // Modals will fetch on demand using getTranslatedText when they are created/shown.
    }

    function setLanguage(lang) {
        currentLanguage = lang;
        if (languageToggleCheckbox) languageToggleCheckbox.checked = (lang === 'es');
        loadTranslations();
        localStorage.setItem('language', lang);
        // Dispatch a custom event that other scripts can listen to if they need to update
        document.dispatchEvent(new CustomEvent('languageChanged', { detail: { language: currentLanguage } }));
    }

    // Load saved language or default
    const savedLanguage = localStorage.getItem('language');
    if (savedLanguage) {
        setLanguage(savedLanguage);
    } else {
        setLanguage('en'); // Default to English
    }

    if (languageToggleCheckbox) {
        languageToggleCheckbox.addEventListener('change', () => {
            if (languageToggleCheckbox.checked) {
                setLanguage('es');
            } else {
                setLanguage('en');
            }
        });
    } else {
        console.warn('Language toggle checkbox #language-toggle-checkbox not found.');
    }
});
