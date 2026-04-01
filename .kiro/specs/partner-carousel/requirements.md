# Requirements Document

## Introduction

<!-- 
  This document defines the requirements for converting the Trusted Partners section 
  from a static flex row of logos into an infinite-scrolling horizontal carousel.
  It replaces Req 8 AC 3-4 of the main spec while preserving the section's visual identity.
-->

<!-- BUG-135: Auto-scroll changed from optional to always-on when carousel is active -->
This document defines the requirements for converting the Trusted Partners section from a static flex row of logos into an infinite-scrolling horizontal carousel. The carousel replaces the existing static layout (Req 8 AC 3–4 of the main spec) while preserving the section's visual identity (white background, 80px padding, grey top border, centred heading). It supports click/drag on desktop, swipe on mobile/tablet, always-on auto-scroll with hover-pause, and infinite looping. The implementation prioritises progressive enhancement, accessibility, and lightweight performance — no heavy carousel libraries.

## Glossary

- **Carousel**: The horizontally scrolling container within the Partners_Section that displays partner logos in a continuous loop
- **Partners_Section**: The "Trusted Partners" section of the landing page, identified by `id="partners"`
- **Logo_Track**: The inner scrollable element containing the partner logo items, which translates horizontally to create the scrolling effect
<!-- Auto_Scroll is always active when carousel is in scrolling mode, not optional or configurable -->
- **Auto_Scroll**: The behaviour where the Logo_Track advances automatically at a slow, constant speed without user input. Auto_Scroll is always active when the carousel is in scrolling mode (logos exceed viewport width) and is not user-configurable
- **Drag_Scroll**: A desktop interaction where the Visitor clicks and drags the Logo_Track to scroll horizontally
- **Visitor**: Any person viewing the public-facing Website in a browser
- **Reduced_Motion**: The operating system or browser setting `prefers-reduced-motion: reduce`, indicating the Visitor has requested minimal animation

## Requirements

### Requirement 1: Horizontal Scroll Behaviour

**User Story:** As a Visitor, I want to scroll horizontally through partner logos, so that I can see all of Keanu's trusted partners without the layout wrapping or taking up excessive vertical space.

#### Acceptance Criteria

1. THE Carousel SHALL display partner logos in a single horizontal row that scrolls left and right within the Partners_Section.
2. WHEN a Visitor clicks and drags the Logo_Track on a desktop device, THE Carousel SHALL scroll horizontally in the direction of the drag.
3. WHEN a Visitor swipes left or right on a touch device, THE Carousel SHALL scroll horizontally in the direction of the swipe.
4. THE Carousel SHALL loop infinitely so that scrolling in either direction continues without reaching a hard stop or empty space.
5. WHILE the Carousel is being dragged, THE Carousel SHALL apply a `cursor: grabbing` style to indicate the active drag state.
6. WHILE the Carousel is idle and hoverable, THE Carousel SHALL apply a `cursor: grab` style to indicate that dragging is available.
7. THE Carousel SHALL use pointer events (rather than separate mouse and touch event listeners) to support click/drag and swipe interactions simultaneously on hybrid devices (e.g., Surface Pro, iPad with trackpad).

### Requirement 2: Auto-Scroll

**User Story:** As a Visitor, I want the carousel to scroll automatically at a subtle speed, so that I notice the partner logos without needing to interact.

#### Acceptance Criteria

<!-- BUG-135: Auto-scroll is always active when carousel is in scrolling mode, not conditionally toggled -->
1. THE Carousel SHALL always enable Auto_Scroll when logos exceed the viewport width (i.e., the carousel is in scrolling mode). THE Carousel SHALL advance the Logo_Track continuously to the left at a slow, subtle speed of approximately 15 pixels per second. Auto_Scroll is not user-configurable. WHILE all logos fit within the viewport width, Auto_Scroll SHALL be disabled (see Requirement 8 AC 3).
2. WHEN a Visitor hovers over the Carousel on a desktop device, THE Auto_Scroll SHALL pause.
3. WHEN the Visitor moves the pointer away from the Carousel, THE Auto_Scroll SHALL resume from the current scroll position.
4. WHEN a Visitor begins a drag or swipe interaction, THE Auto_Scroll SHALL pause for the duration of the interaction.
5. WHEN the drag or swipe interaction ends, THE Auto_Scroll SHALL resume from the current scroll position.
6. WHEN the page is not visible (document.visibilityState is 'hidden'), THE Auto_Scroll SHALL pause to conserve CPU and battery.
7. WHEN the page becomes visible again (document.visibilityState changes to 'visible'), THE Auto_Scroll SHALL resume from the current scroll position.

### Requirement 3: Infinite Loop

**User Story:** As a Visitor, I want the carousel to loop seamlessly, so that I can continue scrolling without encountering a dead end.

#### Acceptance Criteria

1. WHEN enough logos are provided to exceed the viewport width, THE Carousel SHALL duplicate the set of partner logos so that the Logo_Track contains enough content to fill the viewport and enable seamless looping.
2. WHEN the Logo_Track scroll position reaches the end of the first set of logos, THE Carousel SHALL reset the scroll position to the beginning without a visible jump or flicker.
3. WHEN the Logo_Track scroll position reaches the beginning while scrolling in reverse, THE Carousel SHALL reset the scroll position to the end of the duplicated set without a visible jump or flicker.
4. THE seamless loop reset SHALL occur within a single animation frame so that the Visitor perceives continuous, uninterrupted motion.

### Requirement 4: Responsive Layout

**User Story:** As a Visitor on any device, I want the carousel to display correctly, so that I have a consistent experience on desktop, tablet, and mobile.

#### Acceptance Criteria

1. THE Partners_Section SHALL retain its white background, 80px vertical padding, and 1-pixel solid grey top border.
2. THE Partners_Section SHALL retain the centred "Trusted Partners" heading and subtitle paragraph.
3. THE Carousel SHALL display partner logos at 160 pixels wide by 70 pixels tall with `object-fit: contain`.
4. WHILE the viewport width is above 768 pixels, THE Carousel SHALL use a 48-pixel gap between logos.
5. WHILE the viewport width is at or below 768 pixels, THE Carousel SHALL use a 24-pixel gap between logos.
<!-- BUG-137: Scrollbar hiding is scoped to JS-enhanced state to avoid conflict with Req 5 AC 2 no-JS fallback -->
6. WHILE JavaScript has enhanced the Carousel (indicated by a CSS class such as `.js-enhanced` on the carousel container), THE Carousel SHALL hide the horizontal scrollbar using CSS so that only the carousel interaction controls scrolling. WHILE JavaScript is not available, the native horizontal scrollbar SHALL remain visible (see Requirement 5 AC 2).
7. THE Carousel SHALL occupy the full width of the Partners_Section container.
8. WHEN a Visitor hovers over an individual partner logo, THE logo SHALL reduce opacity to 0.7 as specified in the main spec Req 8 AC 5. This behaviour is preserved from the existing static implementation.

### Requirement 5: Progressive Enhancement

**User Story:** As a Visitor with JavaScript disabled, I want to still see all partner logos, so that the section remains functional without scripting.

#### Acceptance Criteria

1. WHILE JavaScript is not available, THE Partners_Section SHALL display partner logos in a horizontally scrollable container using native CSS overflow-x scroll behaviour.
2. WHILE JavaScript is not available, THE Partners_Section SHALL display a visible horizontal scrollbar so the Visitor can scroll manually.
3. WHEN JavaScript loads, THE Carousel SHALL enhance the native scroll container with drag support, auto-scroll, and infinite looping.

### Requirement 6: Accessibility

**User Story:** As a Visitor using assistive technology, I want the carousel to be navigable and understandable, so that I can access all partner logos.

#### Acceptance Criteria

1. THE Carousel container SHALL have `role="region"`, `aria-roledescription="carousel"`, and `aria-label="Trusted partner logos"` to identify the carousel landmark for screen readers.
2. THE Carousel SHALL be focusable and operable via keyboard: pressing the Left Arrow key SHALL scroll left by one logo width (160 pixels plus the current gap), and pressing the Right Arrow key SHALL scroll right by one logo width (160 pixels plus the current gap).
3. WHILE the Reduced_Motion preference is active, THE Carousel SHALL disable Auto_Scroll and all CSS transitions or animations related to scrolling.
4. WHILE the Reduced_Motion preference is active, THE Carousel SHALL remain manually scrollable via drag, swipe, or keyboard, and SHALL use instant position snapping (no smooth animated scrolling or transitions) for drag and swipe interactions.
5. THE partner logo images SHALL retain their existing descriptive `alt` attributes sourced from the partner data in `siteConfig.ts`.
6. THE Carousel SHALL not trap keyboard focus — pressing Tab SHALL move focus out of the Carousel to the next focusable element on the page.

### Requirement 7: Performance

**User Story:** As a Visitor, I want the carousel to be lightweight and smooth, so that it does not degrade page load time or scrolling performance.

#### Acceptance Criteria

1. THE Carousel SHALL be implemented without any third-party carousel library.
2. THE Carousel SHALL use CSS `transform: translateX()` for scroll animation to ensure GPU-accelerated rendering and avoid layout thrashing.
3. THE original (non-duplicated) partner logo images SHALL use the `loading="lazy"` attribute for deferred loading. Duplicated logo `<img>` elements created for infinite looping SHALL use `loading="eager"` because `loading="lazy"` does not reliably trigger for elements scrolled into view via CSS `transform: translateX()`.
4. THE Carousel animation loop SHALL use `requestAnimationFrame` for smooth, battery-efficient rendering.
5. THE Carousel SHALL not cause cumulative layout shift (CLS) by reserving the correct height for the logo row before images load.

### Requirement 8: Dynamic Logo Count

**User Story:** As a Visitor, I want the partners section to display correctly regardless of how many partner logos are configured, so that the layout adapts gracefully from a handful of logos to a full carousel.

#### Acceptance Criteria

1. THE Carousel SHALL support a dynamic number of partner logos, from a minimum of 1 to a maximum of 32.
2. IF fewer logos are provided than can fill the viewport width at the current gap and logo size, THEN the Partners_Section SHALL display all logos in a single centred row without scrolling or carousel behaviour.
3. WHILE all logos fit within the viewport width, THE Partners_Section SHALL not display Auto_Scroll, Drag_Scroll, infinite looping, or a scrollbar.
4. WHILE all logos fit within the viewport width, THE Partners_Section SHALL centre the logos horizontally using the same flex layout as the static implementation.
5. IF enough logos are provided to exceed the viewport width, THEN the Carousel SHALL enable scrolling, drag/swipe interaction, Auto_Scroll, and infinite looping as defined in Requirements 1–3.
<!-- BUG-140: Carousel activation/deactivation is dynamic on viewport resize, no page reload required -->
6. THE system SHALL dynamically re-evaluate whether logos exceed the viewport width on every viewport resize event (debounced for performance). This evaluation SHALL occur without requiring a page reload.
7. WHEN the viewport is resized such that logos no longer exceed the viewport width, THE Carousel SHALL deactivate scrolling, Auto_Scroll, Drag_Scroll, and infinite looping, and SHALL display the logos in a centred static row (per AC 2–4).
8. WHEN the viewport is resized such that logos now exceed the viewport width, THE Carousel SHALL activate scrolling, drag/swipe interaction, Auto_Scroll, and infinite looping (per AC 5 and Requirements 1–3).
