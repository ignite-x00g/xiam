// js/chatbot.js - Iframe Loader for the new chatbot system

document.addEventListener('DOMContentLoaded', () => {
  const chatbotPlaceholder = document.getElementById('chatbot-placeholder');
  const mobileChatLauncher = document.getElementById('mobileChatLauncher');
  const desktopChatFab = document.getElementById('chatbot-fab-trigger');

  const chatbotUrl = 'iframe-content.html'; // Path relative to the loader's location (mychatbot/)
  let iframeLoaded = false;
  let chatbotIframe = null; // Store the iframe element
  let themeObserver = null; // Store the MutationObserver

  // Function to apply theme to iframe
  function applyThemeToIframe(theme) {
    if (chatbotIframe && chatbotIframe.contentWindow && chatbotIframe.contentWindow.document && chatbotIframe.contentWindow.document.body) {
      chatbotIframe.contentWindow.document.body.setAttribute('data-theme', theme);
      console.log(`INFO:ChatbotLoader/applyThemeToIframe: Applied theme "${theme}" to chatbot iframe.`);
    } else {
      console.warn('WARN:ChatbotLoader/applyThemeToIframe: Chatbot iframe content not fully accessible yet.');
    }
  }

  // Function to set up theme synchronization
  function setupThemeSync() {
    if (!chatbotIframe) return;

    // Initial theme application
    const currentTheme = document.body.getAttribute('data-theme') || 'light';

    // Wait for iframe to load its content before trying to access its document
    chatbotIframe.onload = () => {
        console.log('INFO:ChatbotLoader/setupThemeSync: Chatbot iframe "onload" event triggered.');
        applyThemeToIframe(currentTheme);

        // Setup MutationObserver after iframe is loaded and theme initially applied
        if (themeObserver) themeObserver.disconnect(); // Disconnect previous observer if any

        themeObserver = new MutationObserver((mutationsList) => {
          for (const mutation of mutationsList) {
            if (mutation.type === 'attributes' && mutation.attributeName === 'data-theme') {
              const newTheme = document.body.getAttribute('data-theme') || 'light';
              applyThemeToIframe(newTheme);
            }
          }
        });

        themeObserver.observe(document.body, { attributes: true });
        console.log('INFO:ChatbotLoader/setupThemeSync: MutationObserver set up for theme changes on parent body.');
    };
    // If iframe is already loaded (e.g. from cache, or if onload fired before this was attached)
    // and contentDocument is accessible, try applying theme.
     if (chatbotIframe.contentDocument && chatbotIframe.contentDocument.readyState === 'complete') {
        console.log('INFO:ChatbotLoader/setupThemeSync: Chatbot iframe already loaded, applying theme.');
        applyThemeToIframe(currentTheme);
         // Also setup observer here if needed, though onload should ideally handle it.
        if (!themeObserver && chatbotIframe.contentWindow && chatbotIframe.contentWindow.document) {
            if (themeObserver) themeObserver.disconnect();
            themeObserver = new MutationObserver((mutationsList) => {
              for (const mutation of mutationsList) {
                if (mutation.type === 'attributes' && mutation.attributeName === 'data-theme') {
                  const newTheme = document.body.getAttribute('data-theme') || 'light';
                  applyThemeToIframe(newTheme);
                }
              }
            });
            themeObserver.observe(document.body, { attributes: true });
            console.log('INFO:ChatbotLoader/setupThemeSync: MutationObserver set up (iframe already loaded case).');
        }
    }
  }


  function loadAndShowChatbot() {
    if (!chatbotPlaceholder) {
      console.error('ERROR:ChatbotLoader/loadAndShowChatbot: chatbot-placeholder element not found.');
      return;
    }

    if (!chatbotPlaceholder.querySelector('.chatbot-placeholder-close-btn')) {
        const closeButton = document.createElement('button');
        closeButton.innerHTML = '&times;';
        closeButton.className = 'chatbot-placeholder-close-btn';
        closeButton.setAttribute('aria-label', 'Close Chat');
        closeButton.onclick = hideChatbot;
        chatbotPlaceholder.appendChild(closeButton);
    }

    if (!iframeLoaded) {
      const iframe = document.createElement('iframe');
      iframe.src = chatbotUrl;
      iframe.title = 'Live Chat Support';
      // Styling for iframe (width:100%, height:100%, border:none) should be in iframe-chat-wrapper.css
      // Assuming basic iframe styling for now:
      iframe.style.width = '100%';
      iframe.style.height = '100%';
      iframe.style.border = 'none';


      const currentCloseBtn = chatbotPlaceholder.querySelector('.chatbot-placeholder-close-btn');
      // Clear placeholder except for the close button if it exists
      while (chatbotPlaceholder.firstChild && chatbotPlaceholder.firstChild !== currentCloseBtn) {
        chatbotPlaceholder.removeChild(chatbotPlaceholder.firstChild);
      }
      if (currentCloseBtn) { // Ensure close button is the first child if it exists
          chatbotPlaceholder.insertBefore(iframe, chatbotPlaceholder.firstChild.nextSibling);
      } else {
          chatbotPlaceholder.appendChild(iframe);
      }


      chatbotIframe = iframe; // Store the iframe
      iframeLoaded = true;
      console.log('INFO:ChatbotLoader/loadAndShowChatbot: Chatbot iframe created and appended.');
      setupThemeSync(); // Setup theme synchronization
    } else if (chatbotIframe) {
        // If iframe was loaded but maybe hidden and re-shown, ensure theme is current
        const currentTheme = document.body.getAttribute('data-theme') || 'light';
        applyThemeToIframe(currentTheme);
        // Re-ensure observer is active if it was disconnected
        if (!themeObserver || (themeObserver && themeObserver.takeRecords && themeObserver.takeRecords().length === 0 && !document.body.getAttribute('data-theme-observed-by-chatbot'))) {
             console.log('INFO:ChatbotLoader/loadAndShowChatbot: Re-initializing theme sync for existing iframe.');
             setupThemeSync(); // This will re-establish observer if needed
             document.body.setAttribute('data-theme-observed-by-chatbot', 'true'); // Mark that observer is setup
        }
    }


    chatbotPlaceholder.classList.add('active');
    console.log('INFO:ChatbotLoader/loadAndShowChatbot: Chatbot placeholder displayed.');
    const closeBtn = chatbotPlaceholder.querySelector('.chatbot-placeholder-close-btn');
    if(closeBtn) closeBtn.focus();
    else if (chatbotIframe) chatbotIframe.focus();

    // Add event listener for click outside to close
    // Use a timeout to prevent immediate closing if the click that opened it is also outside
    setTimeout(() => {
        document.addEventListener('click', handleClickOutside);
    }, 0);
  }

  function hideChatbot() {
    if (chatbotPlaceholder && chatbotPlaceholder.classList.contains('active')) {
      chatbotPlaceholder.classList.remove('active');
      console.log('INFO:ChatbotLoader/hideChatbot: Chatbot placeholder hidden.');
      document.removeEventListener('click', handleClickOutside);
      // Consider disconnecting observer when hidden if performance is an issue,
      // but for theme changes it's likely low overhead.
      // if (themeObserver) {
      //   themeObserver.disconnect();
      //   themeObserver = null;
      //   document.body.removeAttribute('data-theme-observed-by-chatbot');
      //   console.log('INFO:ChatbotLoader/hideChatbot: Theme observer disconnected.');
      // }
      // Restore focus to the FAB or launcher if they exist
      if (document.activeElement === chatbotIframe || chatbotPlaceholder.contains(document.activeElement)) {
        if (desktopChatFab && window.getComputedStyle(desktopChatFab).display !== 'none') {
            desktopChatFab.focus();
        } else if (mobileChatLauncher && window.getComputedStyle(mobileChatLauncher).display !== 'none') {
            mobileChatLauncher.focus();
        }
      }
    }
  }

  function handleClickOutside(event) {
    if (!chatbotPlaceholder || !chatbotPlaceholder.classList.contains('active')) {
        return;
    }
    // Check if the click is outside the chatbotPlaceholder and not on any known launcher buttons
    const isClickInsideChatbot = chatbotPlaceholder.contains(event.target);
    const isClickOnFab = desktopChatFab && desktopChatFab.contains(event.target);
    const isClickOnMobileLauncher = mobileChatLauncher && mobileChatLauncher.contains(event.target);

    if (!isClickInsideChatbot && !isClickOnFab && !isClickOnMobileLauncher) {
        console.log('INFO:ChatbotLoader/handleClickOutside: Click detected outside chatbot widget. Hiding.');
        hideChatbot();
    }
  }

  function toggleChatbot(event) {
    if(event) event.preventDefault();
    if (!chatbotPlaceholder) return;

    if (chatbotPlaceholder.classList.contains('active')) {
      hideChatbot();
    } else {
      loadAndShowChatbot();
    }
  }

  if (mobileChatLauncher) {
    mobileChatLauncher.addEventListener('click', toggleChatbot);
  } else {
    console.warn('WARN:ChatbotLoader/DOMContentLoaded: Mobile chat launcher (mobileChatLauncher) not found.');
  }

  if (desktopChatFab) {
    desktopChatFab.addEventListener('click', toggleChatbot);
  } else {
    console.warn('WARN:ChatbotLoader/DOMContentLoaded: Desktop chat FAB (chatbot-fab-trigger) not found.');
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && chatbotPlaceholder && chatbotPlaceholder.classList.contains('active')) {
        hideChatbot();
        console.log('EVENT:ChatbotLoader/document#keydown[Escape] - Chatbot placeholder closed via ESC.');
        if(document.activeElement === chatbotPlaceholder || chatbotPlaceholder.contains(document.activeElement)){
            if(desktopChatFab) desktopChatFab.focus();
            else if(mobileChatLauncher) mobileChatLauncher.focus();
        }
    }
  });

  console.log('INFO:ChatbotLoader/DOMContentLoaded: Chatbot loader initialized.');
});
