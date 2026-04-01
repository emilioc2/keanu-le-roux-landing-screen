# Implementation Plan: Partner Carousel

<!--
  This task list converts the design document into discrete, incremental coding steps
  for implementing the partner logo carousel feature. Each task builds on the previous
  one, starting with CSS foundations, then hook logic, then component wiring, and
  finally tests. Property-based test tasks reference specific correctness properties
  from the design document.

  Language: TypeScript / TSX (matches existing codebase)
  Test framework: Vitest + @testing-library/react + fast-check v4
-->

## Overview

<!-- Implementation approach: bottom-up, CSS → hook → component → wiring → tests -->
Convert the Trusted Partners section from a static flex row into an infinite-scrolling
horizontal carousel. Build incrementally: CSS styles first, then the `useCarousel` hook
(all carousel logic), then the `PartnersCarousel` client component, then wire it into
the existing `Partners.tsx` server component, and finally write unit and property-based tests.

## Tasks

- [x] 1. [Developer] Update Partners.module.css with carousel styles
  - [x] 1.1 Replace existing CSS with carousel-enhanced styles
    - Replace the current `.partnersGrid` and `.partnerLogo` rules with the new carousel class structure
    - Add `.carouselContainer` with `overflow-x: auto` base (no-JS fallback) and `min-height: 70px` for CLS prevention
    - Add `.jsEnhanced` modifier: `overflow: hidden`, `scrollbar-width: none` (Firefox), `::-webkit-scrollbar { display: none }` (Chrome/Safari/Edge)
    - Add `.logoTrack` with `display: flex; align-items: center; gap: 48px; flex-wrap: nowrap`
    - Add `.staticMode .logoTrack` override: `flex-wrap: wrap; justify-content: center`
    - Add `.jsEnhanced .logoTrack` override: `justify-content: flex-start; will-change: transform`
    - Add `.grabCursor` (`cursor: grab`) and `.grabbingCursor` (`cursor: grabbing`)
    - Update `.partnerLogo`: add `flex-shrink: 0`, hover opacity `0.7`, remove `border-radius`
    - Add `@media (prefers-reduced-motion: reduce)` disabling transitions on `.logoTrack` and `.partnerLogo`
    - Keep `@media (max-width: 768px)` targeting `.logoTrack` gap to `24px`
    - Keep `.partners` section wrapper unchanged (white bg, 80px padding, grey border)
    - _Requirements: 4.1, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8, 5.1, 5.2, 6.3, 7.2, 7.5_

- [x] 2. [Developer] Create the useCarousel custom hook
  - [x] 2.1 Create `src/components/hooks/useCarousel.ts` with core hook structure and fit detection
    - Export `useCarousel(logoCount, options)` hook with `UseCarouselOptions` and `UseCarouselReturn` interfaces
    - Return `{ containerRef, trackRef, offset, isScrolling, isDragging, isDuplicated }`
    - Implement fit detection via `ResizeObserver` on `containerRef`: compare `logoCount * logoWidth + (logoCount - 1) * gap` against container width
    - Debounce ResizeObserver callback at 150ms
    - Read current gap from computed style of track element on each callback (handles 48px ↔ 24px breakpoint)
    - When `isScrolling` transitions: reset offset to 0, toggle `isDuplicated`
    - _Requirements: 8.2, 8.3, 8.5, 8.6, 8.7, 8.8_

  - [x] 2.2 Add auto-scroll logic using requestAnimationFrame
    - Implement rAF loop advancing offset by `speed * deltaTime` each frame (leftward = negative direction)
    - Cap deltaTime at 100ms to prevent large jumps after tab switches
    - Pause when: hovering, dragging, page hidden, reduced motion active, or static mode
    - Resume from current offset (no jump) when pause condition ends
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 7.4_

  - [x] 2.3 Add infinite loop position reset logic
    - Compute `oneSetWidth = logoCount * (logoWidth + gap)`
    - When `offset <= -oneSetWidth`: reset `offset += oneSetWidth`
    - When `offset > 0`: reset `offset -= oneSetWidth`
    - Reset within the same rAF frame for invisible transition
    - _Requirements: 3.1, 3.2, 3.3, 3.4_

  - [x] 2.4 Add drag/swipe handling via pointer events
    - `onPointerDown`: record start X, set `isDragging = true`, call `setPointerCapture`
    - `onPointerMove`: if dragging, compute deltaX, update offset, reset startX
    - `onPointerUp`: set `isDragging = false`, call `releasePointerCapture`
    - `preventDefault()` on pointer move during drag to prevent text selection
    - Return pointer event handlers from the hook for the component to attach
    - _Requirements: 1.2, 1.3, 1.4, 1.5, 1.6, 1.7_

  - [x] 2.5 Add keyboard navigation
    - Listen for `keydown` on the carousel container (`tabIndex={0}`)
    - ArrowRight: `offset -= (logoWidth + gap)` (scroll content left)
    - ArrowLeft: `offset += (logoWidth + gap)` (scroll content right)
    - Without reduced motion: apply 300ms ease CSS transition, remove after transition ends
    - With reduced motion: instant offset change, no transition
    - `event.preventDefault()` for ArrowLeft/ArrowRight to prevent page scroll
    - Do not trap focus — Tab moves to next focusable element naturally
    - _Requirements: 6.2, 6.4, 6.6_

  - [x] 2.6 Add reduced motion and visibility detection
    - Use `window.matchMedia('(prefers-reduced-motion: reduce)')` on mount, listen for `change` event
    - When active: disable auto-scroll, instant position changes for drag/keyboard (no transitions)
    - Listen for `document.visibilitychange`: pause rAF when hidden, resume when visible
    - _Requirements: 6.3, 6.4, 2.6, 2.7_

  - [x] 2.7 Add cleanup for all side effects on unmount
    - Disconnect `ResizeObserver`
    - Cancel `requestAnimationFrame`
    - Remove `visibilitychange` listener
    - Remove `matchMedia` change listener
    - Clear debounce timeout
    - _Requirements: 7.4_

- [x] 3. [Developer + QA Engineer] Checkpoint — Verify hook compiles cleanly
  - Ensure all tests pass, ask the user if questions arise.

- [x] 4. [Developer] Create PartnersCarousel client component
  - [x] 4.1 Create `src/components/PartnersCarousel.tsx` as a Client Component
    - Add `'use client'` directive
    - Accept `logos: PartnerLogo[]` prop (supports 1–32 entries)
    - Call `useCarousel(logos.length, { gap, logoWidth: 160, speed: 15 })`
    - Render outer container div with `containerRef` and `.carouselContainer` class
    - In scrolling mode: add `.jsEnhanced`, `.grabCursor`/`.grabbingCursor` based on `isDragging`, ARIA attributes (`role="region"`, `aria-roledescription="carousel"`, `aria-label="Trusted partner logos"`), `tabIndex={0}`, keyboard + pointer event handlers
    - In static mode: add `.staticMode` class, no ARIA carousel attributes, no keyboard/pointer handlers
    - Render inner track div with `trackRef`, `.logoTrack` class, `style={{ transform: \`translateX(${offset}px)\` }}`
    - Render original logos as `<img>` with `loading="lazy"`, `width={160}`, `height={70}`, `className={styles.partnerLogo}`
    - When `isDuplicated`: render second set with `loading="eager"` and `aria-hidden="true"`
    - _Requirements: 1.1, 1.5, 1.6, 3.1, 4.3, 4.6, 5.1, 5.3, 6.1, 6.5, 6.6, 7.2, 7.3, 8.1, 8.2, 8.4_

- [x] 5. [Developer] Update Partners.tsx to delegate to PartnersCarousel
  - [x] 5.1 Modify `src/components/Partners.tsx` to use PartnersCarousel
    - Import `PartnersCarousel` from `./PartnersCarousel`
    - Replace the `<div className={styles.partnersGrid}>...</div>` block with `<PartnersCarousel logos={partnerLogos} />`
    - Keep section wrapper, heading, and subtitle unchanged
    - Partners.tsx remains a Server Component
    - _Requirements: 4.1, 4.2, 5.1_

- [x] 6. [Developer + QA Engineer] Checkpoint — Verify components render without errors
  - Ensure all tests pass, ask the user if questions arise.

- [x] 7. [Developer] Write tests
  - [x] 7.1 Write unit tests in `src/components/__tests__/Partners.unit.test.tsx`
    - Test: renders "Trusted Partners" heading and subtitle text (Req 4.2)
    - Test: renders all 7 logos in static mode with wide container — centred, no duplication (Req 8.2, 8.4)
    - Test: applies ARIA attributes in scrolling mode — `role="region"`, `aria-roledescription`, `aria-label` (Req 6.1)
    - Test: no ARIA carousel attributes in static mode (Req 8.3)
    - Test: cursor classes toggle — `.grabCursor` idle, `.grabbingCursor` during drag (Req 1.5, 1.6)
    - Test: Tab does not trap focus (Req 6.6)
    - Test: no-JS fallback has `overflow-x: auto` base CSS (Req 5.1, 5.2)
    - Test: `.jsEnhanced` class applied when carousel mode active (Req 4.6)
    - Test: section retains visual identity — white bg, padding, border, full width (Req 4.1, 4.7)
    - Test: `min-height: 70px` on carousel container (Req 7.5)
    - Test: zero logos renders empty without errors (Req 8.1)
    - Test: single logo renders static — centred, no carousel features (Req 8.1)
    - _Requirements: 1.5, 1.6, 4.1, 4.2, 4.6, 4.7, 5.1, 5.2, 6.1, 6.6, 7.5, 8.1, 8.2, 8.3, 8.4_

  - [ ] 7.2 Write property test: Drag direction matches pointer delta
    - **Property 1: Drag direction matches pointer delta**
    - Generate random start offsets and drag deltas; verify offset changes by exactly deltaX
    - Generators: `fc.integer()` for offset, `fc.integer({min: -500, max: 500})` for delta
    - File: `src/components/__tests__/useCarousel.property.test.ts`
    - **Validates: Requirements 1.2, 1.3**

  - [ ] 7.3 Write property test: Loop reset keeps offset within bounds
    - **Property 2: Loop reset keeps offset within bounds**
    - Generate random offsets outside bounds; verify reset brings within `(-oneSetWidth, 0]`
    - Generators: `fc.integer()` for offset, `fc.integer({min: 1, max: 32})` for logo count
    - File: `src/components/__tests__/useCarousel.property.test.ts`
    - **Validates: Requirements 3.2, 3.3**

  - [ ] 7.4 Write property test: Auto-scroll pauses and resumes from current position
    - **Property 3: Auto-scroll pauses and resumes from current position**
    - Generate random offsets, simulate pause conditions; verify offset unchanged during pause
    - Generators: `fc.integer()` for offset, `fc.constantFrom('hover', 'drag', 'hidden')` for condition
    - File: `src/components/__tests__/useCarousel.property.test.ts`
    - **Validates: Requirements 2.2, 2.3, 2.4, 2.5, 2.6, 2.7**

  - [ ] 7.5 Write property test: Fit detection determines carousel mode
    - **Property 4: Fit detection determines carousel mode**
    - Generate logo counts (1–32) and container widths; verify mode matches formula
    - Generators: `fc.integer({min: 1, max: 32})`, `fc.integer({min: 200, max: 2000})`
    - File: `src/components/__tests__/useCarousel.property.test.ts`
    - **Validates: Requirements 8.2, 8.3, 8.5, 8.6, 8.7, 8.8**

  - [ ] 7.6 Write property test: Logo rendering completeness
    - **Property 5: Logo rendering completeness**
    - Generate random PartnerLogo arrays (1–32); verify all imgs have correct attributes
    - Generators: `fc.array(partnerLogoArb, {minLength: 1, maxLength: 32})`
    - File: `src/components/__tests__/PartnersCarousel.property.test.tsx`
    - **Validates: Requirements 1.1, 4.3, 6.5**

  - [ ] 7.7 Write property test: Logo duplication in scrolling mode
    - **Property 6: Logo duplication in scrolling mode**
    - Generate logo counts in scrolling mode; verify exactly `2 * N` img elements
    - Generators: `fc.integer({min: 1, max: 32})`
    - File: `src/components/__tests__/PartnersCarousel.property.test.tsx`
    - **Validates: Requirements 3.1**

  - [ ] 7.8 Write property test: Auto-scroll advancement rate
    - **Property 7: Auto-scroll advancement rate**
    - Generate elapsed times; verify offset advanced by ~`speed * T` (±2px tolerance)
    - Generators: `fc.float({min: 0.016, max: 2.0})` for deltaTime
    - File: `src/components/__tests__/useCarousel.property.test.ts`
    - **Validates: Requirements 2.1**

  - [ ] 7.9 Write property test: ARIA attributes present in scrolling mode
    - **Property 8: ARIA attributes present in scrolling mode**
    - Generate logo counts and container widths; verify ARIA presence matches scrolling mode
    - Generators: same as P4
    - File: `src/components/__tests__/PartnersCarousel.property.test.tsx`
    - **Validates: Requirements 6.1**

  - [ ] 7.10 Write property test: Keyboard step size
    - **Property 9: Keyboard step size**
    - Generate gaps (24 or 48) and offsets; verify ArrowRight → `-(logoWidth + gap)`, ArrowLeft → `+(logoWidth + gap)`
    - Generators: `fc.constantFrom(24, 48)` for gap, `fc.integer()` for offset
    - File: `src/components/__tests__/useCarousel.property.test.ts`
    - **Validates: Requirements 6.2**

  - [ ] 7.11 Write property test: Reduced motion disables auto-scroll
    - **Property 10: Reduced motion disables auto-scroll**
    - Generate elapsed times with reduced motion on; verify zero offset advancement
    - Generators: `fc.float()` for time
    - File: `src/components/__tests__/useCarousel.property.test.ts`
    - **Validates: Requirements 6.3**

  - [ ] 7.12 Write property test: Reduced motion allows manual interaction with instant snap
    - **Property 11: Reduced motion allows manual interaction with instant snap**
    - Generate drag deltas with reduced motion on; verify offset changes, no CSS transition
    - Generators: `fc.integer()` for delta
    - File: `src/components/__tests__/useCarousel.property.test.ts`
    - **Validates: Requirements 6.4**

  - [ ] 7.13 Write property test: Track transform reflects offset
    - **Property 12: Track transform reflects offset**
    - Generate random offsets; verify track `style.transform === translateX(${offset}px)`
    - Generators: `fc.float({min: -5000, max: 5000})` for offset
    - File: `src/components/__tests__/PartnersCarousel.property.test.tsx`
    - **Validates: Requirements 7.2**

  - [ ] 7.14 Write property test: Lazy/eager loading split
    - **Property 13: Lazy/eager loading split**
    - Generate logo counts in scrolling mode; verify first N imgs `loading="lazy"`, next N `loading="eager"`
    - Generators: `fc.integer({min: 1, max: 32})`
    - File: `src/components/__tests__/PartnersCarousel.property.test.tsx`
    - **Validates: Requirements 7.3**

  - [ ] 7.15 Write property test: Dynamic logo count support
    - **Property 14: Dynamic logo count support**
    - Generate logo counts 1–32; render carousel; verify no errors and correct count
    - Generators: `fc.integer({min: 1, max: 32})`
    - File: `src/components/__tests__/PartnersCarousel.property.test.tsx`
    - **Validates: Requirements 8.1**

  - [ ] 7.16 Write property test: Auto-scroll activates on mode transition
    - **Property 15: Auto-scroll activates on mode transition**
    - Simulate static → scrolling transition via resize; verify auto-scroll activates without user interaction
    - Generators: `fc.integer({min: 1, max: 32})`, `fc.integer({min: 200, max: 2000})`
    - File: `src/components/__tests__/useCarousel.property.test.ts`
    - **Validates: Requirement 2.1**

  - [ ] 7.17 Write property test: Responsive gap breakpoint
    - **Property 16: Responsive gap breakpoint**
    - Generate viewport widths above/below 768px; verify gap is 48px or 24px
    - Generators: `fc.integer({min: 320, max: 2000})` for viewport width
    - File: `src/components/__tests__/PartnersCarousel.property.test.tsx`
    - **Validates: Requirements 4.4, 4.5**

- [x] 8. [Developer + QA Engineer] Final checkpoint — Ensure all tests pass
  - Run `vitest run` to execute all tests (unit + property-based)
  - Ensure all tests pass, ask the user if questions arise.

## Notes

<!-- Implementation guidance for the coding agent -->
- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design document
- Unit tests validate specific examples and edge cases
- The hook (`useCarousel.ts`) contains the bulk of the logic — built incrementally in tasks 2.1–2.7
- The component (`PartnersCarousel.tsx`) is a thin wrapper delegating to the hook
- `Partners.tsx` changes are minimal — swap the logo grid for the carousel component
- Test files: `Partners.unit.test.tsx` (unit), `PartnersCarousel.property.test.tsx` (component properties), `useCarousel.property.test.ts` (hook properties)
