// This file will contain the JavaScript code for the DMM error checking logic.

function checkDataAttributes() {
  console.log("--- Checking Data Attributes ---");
  const modalTriggers = document.querySelectorAll('[data-modal-target]');
  const serviceTriggers = document.querySelectorAll('[data-service-target]');

  modalTriggers.forEach(trigger => {
    if (!trigger.dataset.modalTarget) {
      console.error("Error: Element has 'data-modal-target' attribute but no value.", trigger);
    } else {
      console.log(`OK: Found data-modal-target: "${trigger.dataset.modalTarget}"`, trigger);
    }
  });

  serviceTriggers.forEach(trigger => {
    if (!trigger.dataset.serviceTarget) {
      console.error("Error: Element has 'data-service-target' attribute but no value.", trigger);
    } else {
      console.log(`OK: Found data-service-target: "${trigger.dataset.serviceTarget}"`, trigger);
    }
  });

  if (modalTriggers.length === 0) {
    console.warn("Warning: No elements found with 'data-modal-target'.");
  }
  if (serviceTriggers.length === 0) {
    console.warn("Warning: No elements found with 'data-service-target'.");
  }
  console.log("--- Data Attributes Check Complete ---");
}

function checkModalsInDOM() {
  console.log("--- Checking Modals in DOM ---");
  const modalTriggers = document.querySelectorAll('[data-modal-target]');
  const serviceTriggers = document.querySelectorAll('[data-service-target]');

  modalTriggers.forEach(trigger => {
    const targetId = trigger.dataset.modalTarget;
    if (targetId) {
      const modalElement = document.getElementById(targetId);
      if (!modalElement) {
        console.error(`Error: Modal with ID "${targetId}" not found for trigger:`, trigger);
      } else {
        console.log(`OK: Modal with ID "${targetId}" found for trigger:`, trigger);
        // Check if modal is after trigger in DOM (basic check)
        if (trigger.compareDocumentPosition(modalElement) & Node.DOCUMENT_POSITION_FOLLOWING) {
            console.log(`OK: Modal ID "${targetId}" appears after its trigger.`, modalElement);
        } else if (trigger.compareDocumentPosition(modalElement) & Node.DOCUMENT_POSITION_PRECEDING) {
            console.warn(`Warning: Modal ID "${targetId}" appears BEFORE its trigger. This might be an issue if scripts load before the modal.`, modalElement);
        } else {
            console.log(`Info: Modal ID "${targetId}" and trigger are not directly preceding/following (e.g., siblings or in different branches). Ensure JS loads after DOM is ready.`, modalElement);
        }
      }
    }
  });

  serviceTriggers.forEach(trigger => {
    const targetId = trigger.dataset.serviceTarget;
    if (targetId) {
      const modalElement = document.getElementById(targetId);
      if (!modalElement) {
        console.error(`Error: Service modal with ID "${targetId}" not found for trigger:`, trigger);
      } else {
        console.log(`OK: Service modal with ID "${targetId}" found for trigger:`, trigger);
         if (trigger.compareDocumentPosition(modalElement) & Node.DOCUMENT_POSITION_FOLLOWING) {
            console.log(`OK: Service modal ID "${targetId}" appears after its trigger.`, modalElement);
        } else if (trigger.compareDocumentPosition(modalElement) & Node.DOCUMENT_POSITION_PRECEDING) {
            console.warn(`Warning: Service modal ID "${targetId}" appears BEFORE its trigger. This might be an issue if scripts load before the modal.`, modalElement);
        } else {
            console.log(`Info: Service modal ID "${targetId}" and trigger are not directly preceding/following. Ensure JS loads after DOM is ready.`, modalElement);
        }
      }
    }
  });
  console.log("--- Modals in DOM Check Complete ---");
}

function checkScriptLoading() {
  console.log("--- Checking Script Loading ---");
  const scripts = document.querySelectorAll('script[src*="dynamic-modal-manager.js"]');
  if (scripts.length === 0) {
    console.warn("Warning: 'dynamic-modal-manager.js' script tag not found.");
  } else {
    scripts.forEach(script => {
      if (script.defer) {
        console.log("OK: 'dynamic-modal-manager.js' script tag has 'defer' attribute.", script);
      } else {
        console.warn("Warning: 'dynamic-modal-manager.js' script tag does not have 'defer' attribute. Ensure it's placed at the end of <body>.", script);
      }
      // Check if script is at the end of body (basic check)
      if (script.parentElement === document.body && script.nextElementSibling === null) {
        console.log("OK: 'dynamic-modal-manager.js' script is the last element in <body>.", script);
      } else if (!script.defer) {
        console.warn("Warning: 'dynamic-modal-manager.js' is not the last element in <body> and does not have 'defer'. This could lead to issues if it relies on DOM elements not yet loaded.", script);
      }
    });
  }
  console.log("--- Script Loading Check Complete ---");
}

function verifyMainSelectors() {
  console.log("--- Verifying Main Selectors ---");
  let count = 0;
  try {
    const modalTargets = document.querySelectorAll('[data-modal-target]');
    console.log(`OK: Selector '[data-modal-target]' found ${modalTargets.length} elements.`);
    modalTargets.forEach(el => console.log("  >", el));
    count += modalTargets.length;
  } catch (e) {
    console.error("Error with selector '[data-modal-target]':", e);
  }

  try {
    const serviceNavItems = document.querySelectorAll('.services-navigation .service-nav-item[data-service-target]');
    console.log(`OK: Selector '.services-navigation .service-nav-item[data-service-target]' found ${serviceNavItems.length} elements.`);
    serviceNavItems.forEach(el => console.log("  >", el));
    count += serviceNavItems.length;
  } catch (e) {
    console.error("Error with selector '.services-navigation .service-nav-item[data-service-target]':", e);
  }

  if (count === 0) {
    console.warn("Warning: Main selectors did not find any relevant elements. This might be expected if no such elements exist on the page, or it could indicate a problem with the page structure or the selectors themselves.");
  }
  console.log("--- Main Selectors Verification Complete ---");
}

// Function to run all checks
function runAllDMMErrorsChecks() {
  console.log("===== Running DMM Error Checks =====");
  checkDataAttributes();
  checkModalsInDOM();
  checkScriptLoading();
  verifyMainSelectors();
  console.log("===== DMM Error Checks Complete. Review console for details. =====");
}

// Example of how to run the checks:
// Call runAllDMMErrorsChecks() when the DOM is fully loaded.
// document.addEventListener('DOMContentLoaded', runAllDMMErrorsChecks);
// Or, you can call it directly from the console for debugging specific pages.
