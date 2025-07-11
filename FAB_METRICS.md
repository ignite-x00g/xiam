# FAB and Pop-up Metrics

This document outlines the positioning and dimension metrics for Floating Action Buttons (FABs) and their associated pop-ups as of the last review.

# FAB and Pop-up Metrics

This document outlines the positioning and dimension metrics for Floating Action Buttons (FABs) and their associated pop-ups. Many of these values are controlled by CSS variables defined in `assets/css/global.css` for easier configuration.

## 1. Global CSS Variables (from `assets/css/global.css`)
- **`--fab-size`**: `56px` (Controls general width/height of FABs)
- **`--fab-stack-inset-right`**: `22px`
- **`--fab-stack-inset-bottom`**: `25px`
- **`--fab-stack-gap`**: `12px`
- **`--chatbot-width`**: `310px`
- **`--chatbot-height`**: `540px`
- **`--chatbot-inset-bottom`**: `35px` (Base offset for the chatbot panel. FAB stack uses `calc(var(--chatbot-inset-bottom) - 5px)` when open)
- **`--chatbot-horizontal-offset-from-fab-stack`**: `3px`
- **`--mobile-nav-inset-bottom`**: `22px`
- **`--mobile-nav-base-offset`**: `38px` (Used in `calc(var(--fab-size) + var(--mobile-nav-base-offset))` for `right` positioning of mobile nav)
- **`--modal-max-width`**: `600px`
- **`--modal-max-height`**: `90vh`
- **`--modal-width-vw`**: `96vw`
- **`--modal-small-screen-max-width-vw`**: `98vw`

## 2. Main FAB Stack (`.fab-stack`)
- **Description:** Container for FABs, typically bottom-right on mobile.
- **File:** `assets/css/mobile-fabs.css`
- **Positioning Context:** `position: fixed;`
- **`right`:** `var(--fab-stack-inset-right)` (resolves to `22px`)
- **`bottom`:** `var(--fab-stack-inset-bottom)` (resolves to `25px`)
    - *Dynamic Behavior:* JavaScript sets `.fab-stack` `bottom` to `calc(var(--chatbot-inset-bottom) - 5px)` when the Chatbot AI panel opens, keeping the stack slightly above the panel.
- **Spacing between FABs:** `gap: var(--fab-stack-gap);` (resolves to `12px`)

## 3. Individual FAB Buttons (General Styling)
- **Selector:** `.fab-btn`
- **Applies to:** "Join Us", "Contact Us", "Chatbot AI", "Menu Toggle" FABs.
- **File:** `assets/css/mobile-fabs.css`
- **`width`:** `var(--fab-size)` (resolves to `56px`)
- **`height`:** `var(--fab-size)` (resolves to `56px`)

## 4. "Join Us" Pop-up (Modal)
- **Triggered by:** "Join Us" FAB.
- **Files:** HTML: `components/join-us/join-us.html`, CSS: `assets/css/modal.css`
- **Positioning:** Centered via Flexbox on `.modal-overlay`.
- **`right` / `bottom` margin/offset:** Not applicable (centered).
- **`width` (of `.modal-content`):**
    - Default: `var(--modal-width-vw)` (resolves to `96vw`)
    - Constraint: `max-width: var(--modal-max-width);` (resolves to `600px`)
    - Small screens (`@media (max-width: 600px)`): `max-width: var(--modal-small-screen-max-width-vw);` (resolves to `98vw`)
- **`height` (of `.modal-content`):**
    - Constraint: `max-height: var(--modal-max-height);` (resolves to `90vh`)
    - Behavior: Content-driven, `overflow-y: auto;`.

## 5. "Contact Us" Pop-up (Modal)
- **Triggered by:** "Contact Us" FAB.
- **Files:** HTML: `components/contact-us/contact-us.html`, CSS: `assets/css/modal.css`
- **Positioning:** Centered (same as "Join Us" pop-up).
- **`right` / `bottom` margin/offset:** Not applicable (centered).
- **`width` (of `.modal-content`):**
    - Default: `var(--modal-width-vw)`
    - Constraint: `max-width: var(--modal-max-width);`
    - Small screens (`@media (max-width: 600px)`): `max-width: var(--modal-small-screen-max-width-vw);`
- **`height` (of `.modal-content`):**
    - Constraint: `max-height: var(--modal-max-height);`
    - Behavior: Content-driven, `overflow-y: auto;`.

## 6. "Chatbot AI" Pop-up (Panel)
- **Triggered by:** "Chatbot AI" FAB.
- **Files:** HTML: `index.html` (`<div id="chatbot-container">`), CSS: `assets/css/chatbot.css`
- **Positioning Context:** `position: fixed;`
- **`right`:** `calc(var(--fab-stack-inset-right) + var(--fab-size) + var(--chatbot-horizontal-offset-from-fab-stack))`
    - Resolves to: `calc(22px + 56px + 3px) = 81px`
- **`bottom`:** `var(--chatbot-inset-bottom)` (resolves to `35px`)
- **`width` (of `#chatbot-container`):**
    - Default: `var(--chatbot-width)` (resolves to `310px`)
    - Small screens (`@media (max-width: 480px)`): `width: 98vw;` (This specific value is not currently variable-driven but could be if needed)
- **`height` (of `#chatbot-container`):**
    - Default: `var(--chatbot-height)` (resolves to `540px`)
    - Small screens (`@media (max-width: 480px)`): `height: 74vh; min-height: 340px;` (Not currently variable-driven)

## 7. "Horizontal Nav menu bar" Pop-up (`.mobile-nav`)
- **Triggered by:** "Menu Toggle" FAB.
- **Files:** HTML: `index.html` (`<nav class="mobile-nav">`), CSS: `assets/css/mobile-fabs.css`
- **Positioning Context:** `position: fixed;`
- **`right`:** `calc(var(--fab-size) + var(--mobile-nav-base-offset))`
    - Resolves to: `calc(56px + 38px) = 94px`
- **`bottom`:** `var(--mobile-nav-inset-bottom)` (resolves to `22px`)
- **`width` / `height`:** Not explicitly set by variables; determined by content and padding.

This document provides the requested description of the FABs and their associated pop-ups, highlighting the use of CSS variables for easier configuration.
