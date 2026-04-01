<!-- Implementation task list for the Hero Mobile Video Bugfix.
     Follows the bug condition methodology: explore → preserve → fix → validate.
     References design.md correctness properties and bugfix.md requirements. -->

# Implementation Plan

- [x] 1. Write bug condition exploration test
  - **Property 1: Bug Condition** — Mobile Viewport Renders Video Element
  - **CRITICAL**: This test MUST FAIL on unfixed code — failure confirms the bug exists
  - **DO NOT attempt to fix the test or the code when it fails**
  - **NOTE**: This test encodes the expected behavior — it will validate the fix when it passes after implementation
  - **GOAL**: Surface counterexamples that demonstrate the bug exists on mobile viewports
  - **Scoped PBT Approach**: Use `fast-check` to generate random viewport widths in the range 320–768px. For each width, mock `window.matchMedia` to return `matches: true` for `(max-width: 768px)`, render `<Hero />`, and assert:
    - No `<video>` element exists in the DOM
    - A fallback `<img>` element exists with `src="/hero-fallback.jpg"` and `alt=""`
    - The `<img>` element has `object-fit: cover` styling via the `.heroFallbackImage` class
  - Create test file: `src/components/__tests__/Hero.bugcondition.property.test.tsx`
  - Mock `window.matchMedia` to simulate mobile viewports (≤768px) using a helper that returns `{ matches: true, addEventListener, removeEventListener }`
  - Run test on UNFIXED code
  - **EXPECTED OUTCOME**: Test FAILS (this is correct — it proves the bug exists because the unfixed Hero always renders `<video>` and never renders a fallback `<img>`)
  - Document counterexamples found (e.g., "At viewport 375px, `<video>` element is present and no `<img>` fallback exists")
  - Mark task complete when test is written, run, and failure is documented
  - _Requirements: 1.1, 1.2, 2.1, 2.2, 2.4, 2.5_

- [x] 2. Write preservation property tests (BEFORE implementing fix)
  - **Property 2: Preservation** — Desktop Video and Content Unchanged
  - **IMPORTANT**: Follow observation-first methodology
  - **Step 1 — Observe**: Render `<Hero />` on UNFIXED code with `matchMedia` mocked to desktop viewports (>768px). Record:
    - `<video>` element is present with `autoPlay`, `muted`, `loop`, `playsInline`, `poster="/hero-fallback.jpg"`, and `aria-label` containing "Background video"
    - `<source src="/hero_video.mp4" type="video/mp4">` is present inside the video
    - Navy overlay div with class `heroOverlay` is present
    - Heading "Your Wealth, Your Legacy.", subtitle, and both CTA buttons ("Get In Touch", "Subscribe to Newsletter") are present
  - **Step 2 — Write property-based tests** in `src/components/__tests__/Hero.preservation.property.test.tsx`:
    - Use `fast-check` to generate random viewport widths in range 769–2560px. For each, mock `matchMedia` to return `matches: false`, render `<Hero />`, and assert all observed desktop attributes are preserved (Property 2 from design)
    - Use `fast-check` to generate random viewport widths across the FULL range 320–2560px. For each, render `<Hero />` and assert overlay div, heading, subtitle, and both CTAs are always present regardless of viewport (Properties 3, 4 from design)
    - For mobile viewports (320–768px), assert the navy overlay div is present on top of the fallback image (Property 3 from design)
    - For mobile viewports, assert `.hero` section has `background: var(--navy-dark)` as the base layer fallback (Property 5 from design)
  - Run tests on UNFIXED code
  - **EXPECTED OUTCOME**: Tests PASS (confirms baseline behavior to preserve). Note: content/overlay tests pass on unfixed code since those elements already render at all viewports. Structure mobile-specific fallback image assertions to only assert content/overlay presence for the preservation baseline.
  - Mark task complete when tests are written, run, and passing on unfixed code
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_

- [x] 3. Implement the hero mobile video fix

  - [x] 3.1 Add `useIsMobile` hook and conditional rendering in `Hero.tsx`
    - Add inline `useIsMobile` hook at the top of `Hero.tsx` using `useState(true)` (mobile-first SSR default) and `useEffect` with `window.matchMedia('(max-width: 768px)')`
    - Use `matchMedia.addEventListener('change', handler)` for resize/rotation tracking, with cleanup on unmount
    - Replace the unconditional `<video>` block with a conditional: `isMobile ? <img> : <video>`
    - Mobile `<img>`: `src="/hero-fallback.jpg"`, `alt=""` (decorative), `className={styles.heroFallbackImage}`
    - Desktop `<video>`: unchanged from current implementation (autoPlay, muted, loop, playsInline, poster, aria-label)
    - _Bug_Condition: isBugCondition(input) where input.viewportWidth <= 768 AND videoElementExistsInDOM()_
    - _Expected_Behavior: No `<video>` in DOM on mobile; fallback `<img>` with cover sizing displayed instead_
    - _Preservation: Desktop video renders identically with all original attributes; overlay, heading, subtitle, CTAs unchanged at all viewports_
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_

  - [x] 3.2 Add `.heroFallbackImage` CSS class in `Hero.module.css`
    - Add `.heroFallbackImage` with `position: absolute`, `top: 0`, `left: 0`, `width: 100%`, `height: 100%`, `object-fit: cover`, `z-index: 0`
    - The existing `.hero` background of `var(--navy-dark)` already provides the solid colour fallback if the image fails to load (Req 3.6)
    - _Requirements: 2.4, 3.6_

  - [x] 3.3 Verify bug condition exploration test now passes
    - **Property 1: Expected Behavior** — Mobile Viewport Renders Fallback Image
    - **IMPORTANT**: Re-run the SAME test from task 1 — do NOT write a new test
    - The test from task 1 encodes the expected behavior (no `<video>`, fallback `<img>` present on mobile)
    - When this test passes, it confirms the expected behavior is satisfied
    - Run `Hero.bugcondition.property.test.tsx` from step 1
    - **EXPECTED OUTCOME**: Test PASSES (confirms bug is fixed)
    - _Requirements: 2.1, 2.2, 2.4, 2.5_

  - [x] 3.4 Verify preservation tests still pass
    - **Property 2: Preservation** — Desktop Video and Content Unchanged
    - **IMPORTANT**: Re-run the SAME tests from task 2 — do NOT write new tests
    - Run `Hero.preservation.property.test.tsx` from step 2
    - **EXPECTED OUTCOME**: Tests PASS (confirms no regressions)
    - Confirm all preservation properties hold after fix (desktop video, overlay, content, navy-dark fallback)

- [x] 4. Checkpoint — Ensure all tests pass
  - Run full test suite: `npx vitest --run`
  - Verify `Hero.bugcondition.property.test.tsx` passes (bug is fixed)
  - Verify `Hero.preservation.property.test.tsx` passes (no regressions)
  - Verify existing `Hero.unit.test.tsx` still passes (existing tests unbroken — note: some existing tests may need `matchMedia` mocking since the hook now runs on render)
  - If any existing tests fail due to the new `matchMedia` dependency, update the test setup to mock `matchMedia` for desktop viewport by default
  - Ask the user if questions arise
