# Hero Mobile Video Fix — Bugfix Design

<!-- Design document for the hero mobile video bugfix.
     Defines the bug condition, fix approach, correctness properties,
     and testing strategy for conditionally rendering video vs fallback
     image based on viewport width in the Hero component. -->

## Overview

The Hero section currently renders a `<video>` element on all viewports, including mobile (≤768px). Mobile browsers frequently block autoplay on large video files, and the 3.1MB download is excessive for mobile connections. The fix conditionally renders the video element based on viewport width using `window.matchMedia`, replacing it with a lightweight fallback image (`hero-fallback.jpg`, 46KB) on mobile. This prevents the video download entirely on mobile while preserving the full desktop video experience.

The approach leverages the fact that `Hero.tsx` is already a Client Component (`'use client'`), so we can use React hooks (`useState`, `useEffect`) and `window.matchMedia` without architectural changes.

The SSR strategy uses a mobile-first default: the `useIsMobile` hook initializes state to `true`, so the server-rendered HTML contains only the fallback image (no `<video>` element). On hydration, `useEffect` detects the actual viewport via `matchMedia` and swaps to the video element on desktop viewports (>768px). This ensures mobile users never receive a `<video>` tag in the initial HTML, preventing the 3.1MB download entirely.

## Glossary

- **Bug_Condition (C)**: The viewport width is at or below 768px, causing the video element to be rendered on a mobile device where it wastes bandwidth and may fail to autoplay
- **Property (P)**: On mobile viewports, the video element is absent from the DOM and a fallback image is displayed instead, covering the full hero area
- **Preservation**: On desktop viewports (>768px), the video continues to autoplay, loop, and display with the poster fallback and navy overlay exactly as before
- **`Hero.tsx`**: The Client Component in `src/components/Hero.tsx` that renders the full-viewport hero section with video background, overlay, heading, subtitle, and CTA buttons
- **`useIsMobile`**: A custom React hook (to be created) that wraps `window.matchMedia` to reactively track whether the viewport is at or below 768px, enabling conditional rendering
- **768px threshold**: The mobile breakpoint defined in Req 11 AC 4, used consistently across the site for responsive behavior

## Bug Details

### Bug Condition

The bug manifests when a visitor loads the page on a mobile device (viewport ≤768px). The `Hero.tsx` component unconditionally renders a `<video>` element with a `<source>` pointing to `/hero_video.mp4` (3.1MB). Mobile browsers either block autoplay (resulting in a blank/broken hero) or download the full video file unnecessarily, degrading page load performance.

**Formal Specification:**
```
FUNCTION isBugCondition(input)
  INPUT: input of type { viewportWidth: number }
  OUTPUT: boolean

  RETURN input.viewportWidth <= 768
         AND videoElementExistsInDOM()
         AND videoSourcePointsTo("/hero_video.mp4")
END FUNCTION
```

### Examples

- **Mobile phone (375px viewport)**: Expected: fallback image displayed, no video download. Actual: 3.1MB video downloaded, autoplay blocked by browser, hero section blank or shows only poster.
- **Tablet portrait (768px viewport)**: Expected: fallback image displayed, no video download. Actual: video element rendered, 3.1MB download initiated.
- **Desktop (1024px viewport)**: Expected: video autoplays normally. Actual: video autoplays normally (no bug).
- **Resize from 1024px → 600px**: Expected: video removed from DOM, fallback image shown dynamically. Actual: video remains in DOM, continues playing or stalls.

## Expected Behavior

### Preservation Requirements

**Unchanged Behaviors:**
- Desktop video (>768px) continues to autoplay, loop, muted, with `playsInline` attribute (Req 2 AC 2)
- Navy overlay at `rgba(20, 28, 66, 0.55)` renders on both desktop (over video) and mobile (over fallback image) (Req 2 AC 3)
- Desktop poster fallback (`hero-fallback.jpg`) continues to display when video fails to load (Req 2 AC 5)
- Hero heading, subtitle, and CTA buttons render identically on mobile with existing responsive styles (Req 2 AC 6, 2 AC 8)
- Navy-dark (`#111b42`) background fallback on `.hero` continues to provide immediate paint (Req 14 AC 3)
- The `aria-label` on the video element remains present on desktop for screen reader accessibility (BUG-041)

**Scope:**
All inputs that do NOT involve viewport width at or below 768px should be completely unaffected by this fix. This includes:
- Desktop viewports above 768px (video renders as before)
- All hero content (heading, subtitle, CTAs) on any viewport
- Navy overlay rendering on any viewport
- Navbar, scroll behavior, and all other components

## Hypothesized Root Cause

Based on the bug description, the root cause is straightforward:

1. **Unconditional Video Rendering**: `Hero.tsx` renders the `<video>` element unconditionally — there is no viewport check. The component always outputs the video tag regardless of screen size, causing the browser to initiate the 3.1MB download on all devices.

2. **CSS Cannot Prevent Download**: Even if we added `display: none` at ≤768px via CSS, browsers still parse the `<source>` element and may initiate the video download. The only reliable way to prevent the download is to remove the `<video>` element from the DOM entirely on mobile viewports.

3. **No Fallback Image Path for Mobile**: The current implementation relies solely on the `poster` attribute for fallback, which only activates when the video fails to load — not as a deliberate mobile-first strategy. There is no dedicated mobile fallback rendering path.

4. **No Viewport Detection Logic**: The component has no mechanism to detect viewport width at runtime. Since it's a Client Component, it could use `window.matchMedia`, but this logic is currently absent.

## Correctness Properties

Property 1: Bug Condition — Video Element Absent on Mobile Viewports

_For any_ viewport width at or below 768px, the Hero component SHALL NOT render a `<video>` element in the DOM, and SHALL instead render a fallback `<img>` element with `src="/hero-fallback.jpg"`, `alt=""`, and CSS styling that covers the full hero area (`object-fit: cover`, full width/height) without distortion. Additionally, no network request for `hero_video.mp4` SHALL be initiated on mobile viewports.

**Validates: Requirements 2.1, 2.2, 2.4, 2.5, 2.6**

Property 2: Preservation — Desktop Video Rendering Unchanged

_For any_ viewport width above 768px, the Hero component SHALL render the `<video>` element with `autoPlay`, `muted`, `loop`, `playsInline`, `poster="/hero-fallback.jpg"`, and `aria-label` attributes exactly as before the fix, preserving all existing desktop video behavior. Note: This property validates attribute presence; actual poster display behavior when the video fails to load is covered by a separate integration test (TC-456) for Requirement 3.3.

**Validates: Requirements 3.1, 3.2, 3.3, 3.5**

Property 3: Mobile Overlay Rendering

_For any_ viewport width at or below 768px, the Hero component SHALL render the navy overlay div with background `rgba(20, 28, 66, 0.55)` on top of the fallback image.

**Validates: Requirement 3.4**

Property 4: Mobile Content Preservation

_For any_ viewport width, the Hero component SHALL render the heading 'Your Wealth, Your Legacy.', subtitle paragraph, and both CTA buttons ('Get In Touch' and 'Subscribe to Newsletter') regardless of whether the video or fallback image is displayed.

**Validates: Requirement 3.5**

Property 5: Navy-Dark Fallback on Mobile

_For any_ viewport width at or below 768px, the `.hero` section SHALL have `background: var(--navy-dark)` (`#111b42`) as the base layer, providing a solid colour fallback if the fallback image fails to load.

**Validates: Requirement 3.6**

## Fix Implementation

### Changes Required

Assuming our root cause analysis is correct:

**File**: `src/components/Hero.tsx`

**Specific Changes**:

1. **Add `useIsMobile` hook (defined inline within `Hero.tsx`)**: Create a hook that uses `window.matchMedia('(max-width: 768px)')` to track whether the viewport is mobile. The hook should be defined inline within `Hero.tsx` since it is only used by that component; if it is needed elsewhere later, it can be extracted to a shared hooks directory. The hook should:
   - Initialize state to `true` (mobile-first SSR default — render fallback image by default, ensuring no `<video>` element appears in server-rendered HTML)
   - Attach a `matchMedia` listener in `useEffect` to detect the actual viewport and update state accordingly
   - Clean up the listener on unmount
   - Use `matchMedia.addEventListener('change', handler)` (modern API) for resize tracking

2. **Conditional video rendering**: Replace the unconditional `<video>` block with a conditional:
   - If `isMobile` is `true`: render an `<img>` element with `src="/hero-fallback.jpg"`, `alt=""` (decorative), and a CSS class for full-coverage styling
   - If `isMobile` is `false`: render the existing `<video>` element unchanged

3. **Accessibility on mobile**: The fallback `<img>` uses `alt=""` because it is decorative (same role as the background video). The video element is completely removed from the DOM on mobile, so screen readers won't encounter it.

4. **SSR hydration strategy (mobile-first)**: Since `window.matchMedia` is unavailable during SSR, the `useIsMobile` hook initializes to `true` (mobile-first default). This means the server-rendered HTML contains only the fallback image — no `<video>` element is present in the initial HTML payload. On hydration, the `useEffect` fires and detects the actual viewport via `matchMedia`:
   - If desktop (>768px): state updates to `false`, swapping the fallback image for the video element. The navy-dark (`#111b42`) background on `.hero` provides visual continuity during this brief image-to-video transition.
   - If mobile (≤768px): state remains `true`, so no swap occurs — the fallback image stays in place with zero layout shift.
   This mobile-first approach ensures that mobile users NEVER see a `<video>` element in the HTML, preventing the browser from parsing a `<source>` tag and initiating the 3.1MB video download. The trade-off is a brief visual transition on desktop (fallback image → video), which is masked by the navy-dark background colour.

**File**: `src/components/Hero.module.css`

**Specific Changes**:

5. **Add fallback image styles**: Add a `.heroFallbackImage` class with:
   - `position: absolute`, `top: 0`, `left: 0`, `width: 100%`, `height: 100%`
   - `object-fit: cover` (no distortion, covers full area)
   - `z-index: 0` (same layer as the video)
   - The existing `.hero` background of `var(--navy-dark)` already provides the fallback if the image fails to load (Req 3.6)

## Testing Strategy

### Validation Approach

The testing strategy follows a two-phase approach: first, surface counterexamples that demonstrate the bug on unfixed code, then verify the fix works correctly and preserves existing behavior.

### Exploratory Bug Condition Checking

**Goal**: Surface counterexamples that demonstrate the bug BEFORE implementing the fix. Confirm or refute the root cause analysis. If we refute, we will need to re-hypothesize.

**Test Plan**: Write tests that render the Hero component with a mocked `matchMedia` returning a mobile viewport (≤768px) and assert that the `<video>` element is present in the DOM (demonstrating the bug). Run these tests on the UNFIXED code to observe failures and understand the root cause.

**Test Cases**:
1. **Mobile Viewport Video Present**: Render Hero with matchMedia mocked to 375px — assert `<video>` is in the DOM (will pass on unfixed code, confirming the bug)
2. **768px Boundary — Bug Exists at Threshold**: Render Hero with matchMedia mocked to 768px (which IS mobile, since ≤768px is the mobile threshold) — assert no `<img>` fallback exists (will pass on unfixed code, confirming the bug exists at the boundary value)
3. **Video Source Always Present**: Render Hero at any viewport — assert `<source src="/hero_video.mp4">` is in the DOM (will pass on unfixed code, confirming unconditional download)

**Expected Counterexamples**:
- The `<video>` element with `<source src="/hero_video.mp4">` is present in the DOM at all viewport widths
- No fallback `<img>` element exists at any viewport width
- Possible cause: unconditional rendering of the video element with no viewport detection

### Fix Checking

**Goal**: Verify that for all inputs where the bug condition holds (viewport ≤768px), the fixed component produces the expected behavior.

**Pseudocode:**
```
FOR ALL input WHERE isBugCondition(input) DO
  result := renderHero_fixed(input.viewportWidth)
  ASSERT videoElementNotInDOM(result)
  ASSERT fallbackImageInDOM(result)
  ASSERT fallbackImage.src == "/hero-fallback.jpg"
  ASSERT fallbackImage.alt == ""
  ASSERT fallbackImage.style.objectFit == "cover"
END FOR
```

### Preservation Checking

**Goal**: Verify that for all inputs where the bug condition does NOT hold (viewport >768px), the fixed component produces the same result as the original component.

**Pseudocode:**
```
FOR ALL input WHERE NOT isBugCondition(input) DO
  ASSERT renderHero_original(input) == renderHero_fixed(input)
  ASSERT videoElementInDOM(result)
  ASSERT videoElement.autoPlay == true
  ASSERT videoElement.muted == true
  ASSERT videoElement.loop == true
  ASSERT videoElement.playsInline == true
  ASSERT videoElement.poster == "/hero-fallback.jpg"
  ASSERT videoElement.ariaLabel != ""
END FOR
```

**Testing Approach**: Property-based testing is recommended for preservation checking because:
- It generates many viewport widths above 768px to verify the video element is always present
- It catches edge cases around the 768px boundary
- It provides strong guarantees that desktop behavior is unchanged

**Test Plan**: Observe behavior on UNFIXED code first for desktop viewports, then write property-based tests capturing that behavior.

**Test Cases**:
1. **Desktop Video Attributes Preserved**: Render Hero at viewport >768px, verify video element has all original attributes (autoPlay, muted, loop, playsInline, poster, aria-label)
2. **Navy Overlay Preserved**: Verify the overlay div renders on both mobile and desktop viewports
3. **Hero Content Preserved**: Verify heading, subtitle, and CTA buttons render identically regardless of viewport width
4. **Navy-Dark Background Preserved**: Verify the `.hero` section retains `background: var(--navy-dark)` as the ultimate fallback

### Unit Tests

- Test that `useIsMobile` hook returns `true` for viewports ≤768px and `false` for viewports >768px
- Test that Hero renders `<video>` on desktop and `<img>` on mobile
- Test that the fallback image has `alt=""` and `src="/hero-fallback.jpg"`
- Test that the video element is completely absent from the DOM on mobile (not just hidden)
- Test the 768px boundary: 768px → mobile, 769px → desktop
- Test that `matchMedia` change events trigger re-render (simulating resize/rotation)

### Property-Based Tests

- Generate random viewport widths from 320–767px and verify no `<video>` element in DOM and `<img>` fallback present
- Generate random viewport widths from 769–2560px and verify `<video>` element present with all original attributes
- Generate random viewport widths and verify overlay div and hero content (heading, subtitle, CTAs) are always present regardless of viewport

### Integration Tests

- Test full Hero rendering at mobile viewport with fallback image visible and no video download initiated
- Test viewport resize from desktop to mobile: video removed, fallback image appears
- Test viewport resize from mobile to desktop: fallback image removed, video appears and autoplays
- Test that navy-dark background is visible when fallback image `src` is broken on mobile

### Test Case Alignment Notes

- **TC-452**: This test case checks for `aria-hidden` on a hidden video element on mobile. However, the design removes the `<video>` element from the DOM entirely on mobile rather than hiding it. TC-452 should be updated to verify DOM absence of the `<video>` element instead of checking for `aria-hidden` on a hidden element.
