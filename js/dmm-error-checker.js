// This file will contain the JavaScript code for the DMM error checking logic.

// --- Configuration for DMM Error Checker ---
/**
 * @typedef {Object} DMMErrorsCheckerConfig
 * @property {'verbose'|'log'|'warn'|'error'|'none'} [logLevel='verbose'] - The level of detail for console logging.
 * @property {boolean} [throwOnError=false] - If true, critical errors will throw JavaScript exceptions.
 * @property {boolean} [useEmoji=true] - Whether to use emojis in console log prefixes.
 * @property {boolean} [groupOutput=true] - Whether to use console.group/groupCollapsed for organizing output.
 */

/** @type {DMMErrorsCheckerConfig} */
const dmmErrorCheckerConfig = {
  logLevel: 'verbose',
  throwOnError: false,
  useEmoji: true,
  groupOutput: true,
};

/**
 * Updates the global configuration for the DMM Error Checker.
 * @param {Partial<DMMErrorsCheckerConfig>} newConfig - An object with configuration properties to update.
 */
function configureDMMErrorsChecker(newConfig) {
  Object.assign(dmmErrorCheckerConfig, newConfig);
  if (dmmErrorCheckerConfig.logLevel !== 'none') {
    // Use dmmLogger for this meta-log, respecting its own emoji setting for this specific message.
    const prefix = dmmErrorCheckerConfig.useEmoji ? "ℹ️ " : "";
    console.log(`${prefix}DMM Error Checker configured:`, JSON.stringify(dmmErrorCheckerConfig));
  }
}

// --- Logger Utility ---
const DMM_LOG_LEVELS = { verbose: 4, log: 3, warn: 2, error: 1, none: 0 };

function dmmLogger(type, message, ...args) {
  const currentLevel = DMM_LOG_LEVELS[dmmErrorCheckerConfig.logLevel] || DMM_LOG_LEVELS.verbose;
  const messageLevel = (type === 'error') ? DMM_LOG_LEVELS.error :
                       (type === 'warn') ? DMM_LOG_LEVELS.warn :
                       DMM_LOG_LEVELS.log; // 'log', 'group', 'groupCollapsed', 'groupEnd' treated as verbose

  if (currentLevel < messageLevel && !(type.startsWith('group') || type === 'groupEnd')) {
    return; // Skip logging if currentLevel is not high enough
  }

  let prefix = "";
  if (dmmErrorCheckerConfig.useEmoji) {
    if (type === 'error') prefix = "❌ ";
    else if (type === 'warn') prefix = "⚠️ ";
    else if (type === 'log') prefix = "✅ "; // Default for positive info
    else if (type === 'info') prefix = "ℹ️ "; // For general info, less "positive" than a checkmark
    else if (type === 'group' || type === 'groupCollapsed') prefix = "🔍 ";
     // groupEnd has no prefix
  }

  const finalMessage = `${prefix}${message}`;

  switch (type) {
    case 'error':
      console.error(finalMessage, ...args);
      if (dmmErrorCheckerConfig.throwOnError) {
        throw new Error(`[DMM ErrorChecker] ${message}`);
      }
      break;
    case 'warn':
      console.warn(finalMessage, ...args);
      break;
    case 'log':
    case 'info': // Treat 'info' like 'log' for now, differentiated by emoji
      console.log(finalMessage, ...args);
      break;
    case 'group':
      if (dmmErrorCheckerConfig.groupOutput) console.group(finalMessage, ...args);
      else console.log(finalMessage, ...args); // Fallback for no grouping
      break;
    case 'groupCollapsed':
      if (dmmErrorCheckerConfig.groupOutput) console.groupCollapsed(finalMessage, ...args);
      else console.log(finalMessage, ...args); // Fallback for no grouping
      break;
    case 'groupEnd':
      if (dmmErrorCheckerConfig.groupOutput && currentLevel >= DMM_LOG_LEVELS.log) console.groupEnd();
      break;
    default:
      console.log(`[DMM Logger Undefined Type: ${type}] ${finalMessage}`, ...args);
  }
}


// --- Check functions ---
// Note: Individual check functions are marked @private as they are primarily intended
// to be called via runAllDMMErrorsChecks. Their return structure is for aggregation.

/**
 * @typedef {Object} LogEntry
 * @property {string} message - The log message.
 * @property {Element} [element] - The associated DOM element, if any.
 * @property {string} check - The name of the check function that generated this entry.
 */

/**
 * @typedef {Object} IndividualCheckResult
 * @property {LogEntry[]} errors - Array of error messages from this check.
 * @property {LogEntry[]} warnings - Array of warning messages from this check.
 * @property {LogEntry[]} logs - Array of general log messages from this check.
 * @property {LogEntry[]} infos - Array of informational messages from this check.
 */

/**
 * Checks for [data-modal-target] and [data-service-target] attributes,
 * their values, and the existence of corresponding modal elements in the DOM.
 * Also checks the DOM position of modals relative to their triggers.
 * @returns {IndividualCheckResult} Aggregated results of this check.
 * @private
 */
function checkTriggersAndModals() {
  const results = { errors: [], warnings: [], logs: [], infos: [] };
  const addResult = (type, message, element) => {
    const entry = { message, element, check: 'checkTriggersAndModals' };
    if (type === 'error') results.errors.push(entry);
    else if (type === 'warn') results.warnings.push(entry);
    else if (type === 'log') results.logs.push(entry);
    else if (type === 'info') results.infos.push(entry);
    dmmLogger(type, message, element);
  };

  dmmLogger('groupCollapsed', "[DMM] Checking Triggers & Modal Presence");

  const modalTriggers = document.querySelectorAll('[data-modal-target]');
  const serviceTriggers = document.querySelectorAll('[data-service-target]');
  let foundModalTriggers = false;
  let foundServiceTriggers = false;

  modalTriggers.forEach(trigger => {
    foundModalTriggers = true;
    const targetId = trigger.dataset.modalTarget;
    if (!targetId) {
      addResult('error', "Missing value for data-modal-target:", trigger);
    } else {
      addResult('log', `Found data-modal-target: "${targetId}"`, trigger);
      const modalElement = document.getElementById(targetId);
      if (!modalElement) {
        addResult('error', `Modal with ID '${targetId}' not found for trigger:`, trigger);
      } else {
        addResult('log', `Modal with ID '${targetId}' found.`, modalElement);
        if (trigger.compareDocumentPosition(modalElement) & Node.DOCUMENT_POSITION_FOLLOWING) {
            addResult('info', `Modal ID "${targetId}" appears after its trigger.`, modalElement);
        } else if (trigger.compareDocumentPosition(modalElement) & Node.DOCUMENT_POSITION_PRECEDING) {
            addResult('warn', `Modal ID "${targetId}" appears BEFORE its trigger. This might be an issue if scripts load before the modal.`, modalElement);
        } else {
            if (trigger === modalElement) {
                 addResult('error', `Trigger and modal target '${targetId}' are the same element. This is invalid.`, trigger);
            } else {
                 addResult('info', `Modal ID "${targetId}" and trigger position relation is not directly preceding/following (e.g., different branches). Ensure JS loads after DOM is ready.`, modalElement);
            }
        }
      }
    }
  });

  serviceTriggers.forEach(trigger => {
    foundServiceTriggers = true;
    const targetId = trigger.dataset.serviceTarget;
    if (!targetId) {
      addResult('error', "Missing value for data-service-target:", trigger);
    } else {
      addResult('log', `Found data-service-target: "${targetId}"`, trigger);
      const modalElement = document.getElementById(targetId);
      if (!modalElement) {
        addResult('error', `Service modal with ID '${targetId}' not found for trigger:`, trigger);
      } else {
        addResult('log', `Service modal with ID '${targetId}' found.`, modalElement);
        if (trigger.compareDocumentPosition(modalElement) & Node.DOCUMENT_POSITION_FOLLOWING) {
            addResult('info', `Service modal ID "${targetId}" appears after its trigger.`, modalElement);
        } else if (trigger.compareDocumentPosition(modalElement) & Node.DOCUMENT_POSITION_PRECEDING) {
            addResult('warn', `Service modal ID "${targetId}" appears BEFORE its trigger. This might be an issue if scripts load before the modal.`, modalElement);
        } else {
            if (trigger === modalElement) {
                 addResult('error', `Trigger and service modal target '${targetId}' are the same element. This is invalid.`, trigger);
            } else {
                addResult('info', `Service modal ID "${targetId}" and trigger position relation is not directly preceding/following. Ensure JS loads after DOM is ready.`, modalElement);
            }
        }
      }
    }
  });

  if (!foundModalTriggers) {
    addResult('warn', "No elements found with [data-modal-target].");
  }
  if (!foundServiceTriggers) {
    addResult('warn', "No elements found with [data-service-target].");
  }
  dmmLogger('groupEnd');
  return results;
}

/**
 * Checks the loading of the 'dynamic-modal-manager.js' script tag.
 * Verifies its presence, count, and attributes like 'defer', 'async', and its position in the DOM.
 * @returns {IndividualCheckResult} Aggregated results of this check.
 * @private
 */
function checkScriptLoading() {
  const results = { errors: [], warnings: [], logs: [], infos: [] };
  const addResult = (type, message, element) => {
    const entry = { message, element, check: 'checkScriptLoading' };
    if (type === 'error') results.errors.push(entry); // Though this check mainly warns/logs
    else if (type === 'warn') results.warnings.push(entry);
    else if (type === 'log') results.logs.push(entry);
    else if (type === 'info') results.infos.push(entry);
    dmmLogger(type, message, element);
  };

  dmmLogger('groupCollapsed', "[DMM] Checking 'dynamic-modal-manager.js' Script Tag");
  const scripts = document.querySelectorAll('script[src*="dynamic-modal-manager.js"]');

  if (scripts.length === 0) {
    addResult('warn', "'dynamic-modal-manager.js' script tag not found on the page.");
  } else {
    if (scripts.length > 1) {
      addResult('warn', `Found ${scripts.length} instances of 'dynamic-modal-manager.js'. Typically, there should only be one.`, scripts);
    }

    scripts.forEach((script, index) => {
      addResult('info', `Analyzing script instance ${index + 1}:`, script);
      const hasDefer = script.defer;
      const isAsync = script.async;
      const parentIsBody = script.parentElement === document.body;
      const isLastInBody = parentIsBody && script.nextElementSibling === null;

      if (hasDefer) {
        addResult('log', "Script has 'defer' attribute. This is good practice.");
      } else if (isAsync) {
        addResult('info', "Script has 'async' attribute. Ensure you understand its implications for DOM interaction and script execution order.");
      }

      if (isLastInBody) {
        addResult('log', "Script is the last element in <body>.");
      }

      if (!hasDefer && !isAsync && !isLastInBody) {
        addResult('warn', "Script does not have 'defer' or 'async' and is not the last element in <body>. This could lead to issues if it expects the full DOM to be ready. Consider adding 'defer' or moving it to the end of the <body>.");
      } else if (!hasDefer && !isAsync && parentIsBody && !isLastInBody) {
        addResult('warn', "Script is in <body> but not the last element, and lacks 'defer' or 'async'. This might be problematic.");
      } else if (!hasDefer && !isAsync && !parentIsBody) {
         addResult('warn', "Script is not in <body> (e.g. in <head>) and lacks 'defer' or 'async'. This is highly likely to cause issues. Use 'defer'.");
      }
    });
  }
  dmmLogger('groupEnd');
  return results;
}

/**
 * Verifies the presence of core DMM-related element patterns, such as specific
 * service navigation item selectors and general trigger attributes.
 * @returns {IndividualCheckResult} Aggregated results of this check.
 * @private
 */
function verifyCoreDMMElementPresence() {
  const results = { errors: [], warnings: [], logs: [], infos: [] };
  const addResult = (type, message, element) => {
    const entry = { message, element, check: 'verifyCoreDMMElementPresence' };
    if (type === 'error') results.errors.push(entry);
    else if (type === 'warn') results.warnings.push(entry);
    else if (type === 'log') results.logs.push(entry);
    else if (type === 'info') results.infos.push(entry);
    dmmLogger(type, message, element);
  };

  dmmLogger('groupCollapsed', "[DMM] Verifying Core Element Presence");
  let generalTriggersFound = false;
  let specificServiceTriggersFound = false;

  // Check 1: Specific service navigation items
  try {
    const serviceNavItems = document.querySelectorAll('.services-navigation .service-nav-item[data-service-target]');
    if (serviceNavItems.length > 0) {
      addResult('log', `Found ${serviceNavItems.length} specific service item(s) (.services-navigation .service-nav-item[data-service-target]):`);
      serviceNavItems.forEach(el => addResult('info', "  >", el));
      specificServiceTriggersFound = true;
      generalTriggersFound = true;
    } else {
      addResult('info', "No specific service items (.services-navigation .service-nav-item[data-service-target]) found.");
    }
  } catch (e) {
    addResult('error', "Error checking for specific service items:", e);
  }

  // Check 2: General modal and service triggers (high-level check)
  if (!specificServiceTriggersFound) {
    try {
      const allModalTriggers = document.querySelectorAll('[data-modal-target]');
      const allServiceTriggers = document.querySelectorAll('[data-service-target]');

      if (allModalTriggers.length > 0) {
        addResult('log', `Found ${allModalTriggers.length} general modal trigger(s) ([data-modal-target]).`);
        generalTriggersFound = true;
      } else {
        addResult('info', "No general modal triggers ([data-modal-target]) found.");
      }

      if (allServiceTriggers.length > 0 && !specificServiceTriggersFound) {
        addResult('log', `Found ${allServiceTriggers.length} general service trigger(s) ([data-service-target]).`);
        generalTriggersFound = true;
      } else if (!specificServiceTriggersFound) {
        addResult('info', "No general service triggers ([data-service-target]) found.");
      }

    } catch (e) {
      addResult('error', "Error checking for general triggers:", e);
      if (document.querySelector('[data-modal-target]') || document.querySelector('[data-service-target]')) {
        generalTriggersFound = true;
      }
    }
  }

  if (!generalTriggersFound && !specificServiceTriggersFound) {
    addResult('warn', "No DMM related triggers (general modal/service or specific service items) found on the page. This might be expected if DMM is not used here, or it could indicate a setup issue.");
  }
  dmmLogger('groupEnd');
  return results;
}

/**
 * @typedef {Object} OverallCheckResult
 * @property {LogEntry[]} errors - Aggregated error messages from all checks.
 * @property {LogEntry[]} warnings - Aggregated warning messages from all checks.
 * @property {LogEntry[]} logs - Aggregated general log messages from all checks.
 * @property {LogEntry[]} infos - Aggregated informational messages from all checks.
 * @property {boolean} passed - True if no errors were found across all checks.
 */

/**
 * Runs all DMM error checks and logs them to the console.
 * @param {Partial<DMMErrorsCheckerConfig>} [userConfig] - Optional configuration to override defaults for this run.
 * @returns {OverallCheckResult} An object containing all errors, warnings, and logs from all checks, and an overall pass/fail status.
 */
function runAllDMMErrorsChecks(userConfig) {
  const overallResults = {
    errors: [],
    warnings: [],
    logs: [],
    infos: [],
    passed: true // Will be set to false if any errors are found
  };

  if (userConfig) {
    configureDMMErrorsChecker(userConfig);
  }

  dmmLogger('group', "Running All DMM Error Checks");

  const checksToRun = [
    checkTriggersAndModals,
    checkScriptLoading,
    verifyCoreDMMElementPresence
  ];

  for (const checkFunction of checksToRun) {
    const result = checkFunction();
    overallResults.errors.push(...result.errors);
    overallResults.warnings.push(...result.warnings);
    overallResults.logs.push(...result.logs);
    overallResults.infos.push(...result.infos);
    if (result.errors.length > 0) {
      overallResults.passed = false;
    }
  }

  dmmLogger('groupEnd');
  dmmLogger('info', " umfassende DMM-Fehlerprüfungen abgeschlossen. Überprüfen Sie die Konsole für Details.");
  // Log summary if desired, or it's available in the return object
  if(dmmErrorCheckerConfig.logLevel !== 'none'){
      if(overallResults.passed && overallResults.warnings.length === 0){
          dmmLogger('log', "All DMM checks passed without errors or warnings.");
      } else if (overallResults.passed && overallResults.warnings.length > 0){
          dmmLogger('warn', `DMM checks passed with ${overallResults.warnings.length} warning(s).`);
      }
      else {
          dmmLogger('error', `DMM checks completed with ${overallResults.errors.length} error(s) and ${overallResults.warnings.length} warning(s).`);
      }
  }
  return overallResults;
}

// Example of how to run the checks:
// Call runAllDMMErrorsChecks() when the DOM is fully loaded.
// document.addEventListener('DOMContentLoaded', runAllDMMErrorsChecks);
// Or, you can call it directly from the console for debugging specific pages.
