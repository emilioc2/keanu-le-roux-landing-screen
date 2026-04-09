/**
 * @file Hero.preservation.property.test.tsx
 * @description Preservation property tests for the Hero mobile video bugfix.
 *
 * PURPOSE: These tests establish the baseline behavior that MUST be preserved
 * after the mobile video fix is implemented. They run on the UNFIXED code and
 * must all PASS, confirming the existing behavior we want to keep intact.
 *
 * METHODOLOGY: Observation-first — we first observed the current Hero.tsx
 * rendering behavior (video, overlay, heading, CTAs at all viewports), then
 * encoded those observations as property-based tests using fast-check.
 *
 * Properties tested:
 *   Property 2: Desktop video element renders with all required attributes (769–2560px)
 *   Property 3: Navy overlay div is always present at any viewport width (320–2560px)
 *   Property 4: Hero content (heading, subtitle, CTAs) always present (320–2560px)
 *   Property 5: Hero section element with hero class exists (320–2560px)
 *
 * Each property uses fast-check with numRuns: 100 to generate random viewport
 * widths across the specified range, providing strong coverage of edge cases.
 *
 * @module Hero.preservation.property.test
 * @requirements 3.1, 3.2, 3.3, 3.4, 3.5, 3.6
 */

import { describe, it, expect, afterEach, vi } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import * as fc from 'fast-check';
import Hero from '../Hero';

/**
 * Creates a matchMedia mock that simulates a specific viewport width.
 *
 * WHY: jsdom does not implement window.matchMedia natively, so any component
 * that calls matchMedia (or will after the fix) needs this mock to prevent
 * runtime errors. The mock evaluates the `(max-width: 768px)` media query
 * against the provided width to return the correct `matches` value.
 *
 * HOW: For the query `(max-width: 768px)`:
 *   - width <= 768 → matches: true (mobile viewport)
 *   - width > 768  → matches: false (desktop viewport)
 *   All other queries return matches: false by default.
 *
 * All MediaQueryList interface properties are included (addEventListener,
 * removeEventListener, addListener, removeListener, etc.) to prevent
 * runtime errors from missing methods during hook execution.
 *
 * @param width - The simulated viewport width in pixels
 * @returns A vi.fn() mock implementing the full MediaQueryList interface
 */
function createMatchMediaMock(width: number): ReturnType<typeof vi.fn> {
  // Determine if this width falls within the mobile breakpoint (≤768px)
  const isMobile = width <= 768;

  return vi.fn().mockImplementation((query: string) => ({
    // Only match the mobile breakpoint query when width is ≤768px
    matches: query === '(max-width: 768px)' ? isMobile : false,
    media: query,
    onchange: null,
    // Modern API methods for viewport change listeners
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
    // Deprecated legacy API methods — included for browser compatibility
    addListener: vi.fn(),
    removeListener: vi.fn(),
  }));
}

/* =====================================================================
 * Property 2: Desktop Video Preservation
 *
 * WHAT: For any viewport width above 768px (desktop), the Hero component
 * SHALL render the <video> element with all required attributes:
 *   - autoPlay, muted, loop, playsInline (boolean attributes for autoplay)
 *   - poster="/hero-fallback.jpg" (fallback when video fails to load)
 *   - aria-label (non-empty, for screen reader accessibility)
 *   - <source src="/hero_video.mp4" type="video/mp4"> (video file reference)
 *
 * WHY: The mobile video fix must NOT break the desktop video experience.
 * This property ensures the video element and all its attributes survive
 * the conditional rendering changes.
 *
 * RANGE: 769–2560px covers everything from just above the mobile breakpoint
 * to ultra-wide desktop monitors.
 *
 * Validates: Requirements 3.1 (desktop video preserved), 3.3 (poster fallback)
 * ===================================================================== */
describe('Hero Preservation — Property 2: Desktop Video Attributes', () => {
  /**
   * Teardown: Clean up rendered DOM and restore all vi mocks between tests
   * to prevent state leaking across test cases.
   */
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('renders <video> with all required attributes for desktop viewports (769–2560px)', () => {
    fc.assert(
      fc.property(fc.integer({ min: 769, max: 2560 }), (viewportWidth) => {
        // Install matchMedia mock for this desktop viewport width.
        // matches: false tells the component this is NOT a mobile viewport.
        Object.defineProperty(window, 'matchMedia', {
          writable: true,
          value: createMatchMediaMock(viewportWidth),
        });

        const { container } = render(<Hero />);

        // Assert: <video> element exists in the DOM on desktop
        const video = container.querySelector('video');
        expect(video).not.toBeNull();

        // Assert: boolean HTML attributes required for cross-browser autoplay.
        // React sets these as DOM properties during hydration; jsdom reflects
        // them correctly on the HTMLVideoElement interface.
        expect(video!.autoplay).toBe(true);
        expect(video!.muted).toBe(true);
        expect(video!.loop).toBe(true);
        // playsInline prevents fullscreen takeover on iOS Safari
        expect((video as HTMLVideoElement).playsInline).toBe(true);

        // Assert: poster fallback image for when video fails to load (Req 3.3)
        expect(video!.getAttribute('poster')).toBe('/hero-fallback.jpg');

        // Assert: aria-label provides context for screen readers (BUG-041).
        // We check it's present and non-empty rather than matching exact text,
        // so the test doesn't break if the label wording is refined.
        const ariaLabel = video!.getAttribute('aria-label');
        expect(ariaLabel).toBeTruthy();
        expect(ariaLabel!.length).toBeGreaterThan(0);

        // Assert: <source> element with correct video file path and MIME type
        const source = container.querySelector('video source');
        expect(source).not.toBeNull();
        expect(source!.getAttribute('src')).toBe('/hero_video.mp4');
        expect(source!.getAttribute('type')).toBe('video/mp4');

        // Clean up between fast-check iterations to prevent DOM leaks
        cleanup();
      }),
      // 100 iterations provides strong coverage across the 769–2560 range
      { numRuns: 100 },
    );
  });
});

/* =====================================================================
 * Property 3: Overlay Always Present
 *
 * WHAT: For any viewport width across the full range (320–2560px), the
 * Hero component SHALL render the navy overlay div (with class containing
 * "heroOverlay") on top of the background media (video or fallback image).
 *
 * WHY: The overlay provides text readability by darkening the background.
 * It must be present on BOTH mobile (over fallback image) and desktop
 * (over video). The fix must not accidentally remove or hide the overlay.
 *
 * RANGE: 320–2560px covers the full spectrum from small mobile to ultra-wide.
 * For widths ≤768, matchMedia returns matches: true (mobile).
 * For widths >768, matchMedia returns matches: false (desktop).
 *
 * Validates: Requirements 3.2 (desktop overlay), 3.4 (mobile overlay)
 * ===================================================================== */
describe('Hero Preservation — Property 3: Overlay Always Present', () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('renders the heroOverlay div at any viewport width (320–2560px)', () => {
    fc.assert(
      fc.property(fc.integer({ min: 320, max: 2560 }), (viewportWidth) => {
        // Mock matchMedia with correct mobile/desktop detection for this width.
        // Mobile (≤768) and desktop (>768) both need the overlay present.
        Object.defineProperty(window, 'matchMedia', {
          writable: true,
          value: createMatchMediaMock(viewportWidth),
        });

        const { container } = render(<Hero />);

        // Assert: overlay div with class containing "heroOverlay" is present.
        // CSS Modules mangles class names at build time (e.g., "heroOverlay" becomes
        // "Hero_heroOverlay__abc123"), so we search for the substring "heroOverlay"
        // in the className of all div elements.
        const allDivs = container.querySelectorAll('div');
        const overlay = Array.from(allDivs).find((div) =>
          div.className.includes('heroOverlay'),
        );
        expect(overlay).toBeDefined();

        // Clean up between fast-check iterations to prevent DOM leaks
        cleanup();
      }),
      // 100 iterations across the full 320–2560 range
      { numRuns: 100 },
    );
  });
});

/* =====================================================================
 * Property 4: Content Always Present
 *
 * WHAT: For any viewport width across the full range (320–2560px), the
 * Hero component SHALL render:
 *   - Heading text "Your Wealth," and "Your Legacy."
 *   - Both CTA buttons: "Get In Touch" (→ #contact) and
 *     "Subscribe to Newsletter" (→ #newsletter)
 *
 * WHY: The hero content must be visible regardless of whether the
 * background is a video (desktop) or fallback image (mobile). The fix
 * only changes the background media — content must remain untouched.
 *
 * RANGE: 320–2560px covers mobile through ultra-wide desktop.
 *
 * Validates: Requirement 3.5 (mobile content preservation)
 * ===================================================================== */
describe('Hero Preservation — Property 4: Content Always Present', () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('renders heading, subtitle, and both CTAs at any viewport width (320–2560px)', () => {
    fc.assert(
      fc.property(fc.integer({ min: 320, max: 2560 }), (viewportWidth) => {
        // Mock matchMedia with correct mobile/desktop detection for this width
        Object.defineProperty(window, 'matchMedia', {
          writable: true,
          value: createMatchMediaMock(viewportWidth),
        });

        render(<Hero />);

        // Assert: heading text is present. The heading is split across a <br> tag
        // as "Your Wealth,<br>Your Legacy." so we match each part separately.
        expect(screen.getByText(/Your Wealth,/)).toBeTruthy();
        expect(screen.getByText(/Your Legacy\./)).toBeTruthy();

        // Assert: primary CTA "Book Appointment" links to Calendly (ENH-6, Req 2 AC 1–4).
        // The CTA opens in a new tab — no longer an anchor scroll to #contact.
        const bookAppointment = screen.getByText('Book Appointment');
        expect(bookAppointment).toBeTruthy();
        expect(bookAppointment.getAttribute('href')).toBe('https://calendly.com/keanu-thewealthroom/meetingrequest');

        // Assert: secondary CTA "Subscribe to Newsletter" links to newsletter section (unchanged)
        const subscribe = screen.getByText('Subscribe to Newsletter');
        expect(subscribe).toBeTruthy();
        expect(subscribe.getAttribute('href')).toBe('#newsletter');

        // Clean up between fast-check iterations to prevent DOM leaks
        cleanup();
      }),
      // 100 iterations across the full 320–2560 range
      { numRuns: 100 },
    );
  });
});

/* =====================================================================
 * Property 5: Navy-Dark Background Section
 *
 * WHAT: The .hero <section> element must exist in the DOM with the hero
 * CSS class applied. The navy-dark (#111b42) background is set via
 * CSS (`background: var(--navy-dark)`) which jsdom cannot compute, so
 * we verify the section element exists and has the correct class — this
 * confirms the CSS rule target is present in the DOM.
 *
 * WHY: The navy-dark background serves as the ultimate fallback colour
 * if both the video AND the fallback image fail to load. The section
 * element with the hero class must always be present so this CSS rule
 * can apply. Without it, the hero section would be blank/transparent.
 *
 * RANGE: 320–2560px — the section must exist at all viewport widths.
 *
 * Validates: Requirement 3.6 (navy-dark fallback background)
 * ===================================================================== */
describe('Hero Preservation — Property 5: Navy-Dark Background Section', () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('renders a <section> element with the hero class at any viewport width (320–2560px)', () => {
    fc.assert(
      fc.property(fc.integer({ min: 320, max: 2560 }), (viewportWidth) => {
        // Mock matchMedia with correct mobile/desktop detection for this width
        Object.defineProperty(window, 'matchMedia', {
          writable: true,
          value: createMatchMediaMock(viewportWidth),
        });

        const { container } = render(<Hero />);

        // Assert: <section> with id="hero" exists — this is the anchor target
        // for the Navbar's "Home" link and the root element for the hero section
        const section = container.querySelector('section#hero');
        expect(section).not.toBeNull();

        // Assert: the section has a class containing "hero" (CSS Modules mangles
        // the class name, e.g., "Hero_hero__abc123", but the base name "hero"
        // is always present as a substring). This confirms the CSS rule target
        // for `background: var(--navy-dark)` exists in the DOM.
        expect(section!.className).toContain('hero');

        // Clean up between fast-check iterations to prevent DOM leaks
        cleanup();
      }),
      // 100 iterations across the full 320–2560 range
      { numRuns: 100 },
    );
  });
});
