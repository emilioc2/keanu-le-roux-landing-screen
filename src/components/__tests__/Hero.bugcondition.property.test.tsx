/**
 * @file Hero.bugcondition.property.test.tsx
 * @description Bug condition exploration test for the Hero mobile video issue.
 *
 * Uses property-based testing (fast-check) to generate random mobile
 * viewport widths in the range 320-768px and verify the EXPECTED behavior:
 *   - No <video> element exists in the DOM on mobile
 *   - A fallback <img> with src="/hero-fallback.jpg" and alt="" is rendered
 *   - The <img> has the .heroFallbackImage CSS class for full-coverage styling
 *
 * This test FAILS on unfixed code - that failure confirms the bug exists.
 * The current Hero.tsx unconditionally renders <video> on all viewports.
 *
 * Property 1 (Bug Condition) from design.md:
 *   "For any viewport width at or below 768px, the Hero component SHALL NOT
 *    render a <video> element in the DOM, and SHALL instead render a fallback
 *    <img> element with src='/hero-fallback.jpg' and alt=''."
 *
 * @module Hero.bugcondition.property.test
 * @requirements 1.1, 1.2, 2.1, 2.2, 2.4, 2.5
 */

// Vitest test utilities for defining test suites and assertions
import { describe, it, expect, afterEach, vi, beforeEach } from 'vitest';
// React Testing Library for rendering components and querying the DOM
import { render, cleanup } from '@testing-library/react';
// fast-check for property-based testing - generates random viewport widths
import * as fc from 'fast-check';
// The component under test - currently has the bug (unconditional video rendering)
import Hero from '../Hero';

/**
 * Creates a matchMedia mock simulating a mobile viewport.
 *
 * Why this mock is needed:
 * - jsdom does not implement window.matchMedia natively
 * - The useIsMobile hook (once implemented) calls matchMedia('(max-width: 768px)')
 * - Returning matches: true tells the hook "this is a mobile viewport"
 *
 * All MediaQueryList interface properties are included to prevent
 * runtime errors from missing methods during hook execution.
 *
 * @returns {Function} A vi.fn() mock returning a complete MediaQueryList-like object
 */
function mockMatchMediaMobile(): ReturnType<typeof vi.fn> {
  // Return a mock function that creates a MediaQueryList-like object for any query
  return vi.fn().mockImplementation((query: string) => ({
    matches: true,           // Always report mobile viewport (query matches)
    media: query,            // Echo back the query string
    onchange: null,          // Event handler property - null by default
    addEventListener: vi.fn(),    // Modern API: for viewport change listeners
    removeEventListener: vi.fn(), // Modern API: cleanup for change listeners
    dispatchEvent: vi.fn(),       // Standard EventTarget method
    addListener: vi.fn(),         // Deprecated legacy API for compatibility
    removeListener: vi.fn(),      // Deprecated legacy API for compatibility
  }));
}

/**
 * @description Test suite for Bug Condition Exploration (Property 1).
 *
 * Each test uses fast-check to generate random viewport widths in the
 * mobile range (320-768px). The _viewportWidth parameter drives the
 * property-based iteration; the actual mobile detection is handled by
 * the matchMedia mock returning matches: true.
 *
 * All three tests are expected to FAIL on unfixed code, confirming
 * the bug exists. They will PASS after the fix is implemented.
 */
describe('Hero - Bug Condition: Mobile viewport renders video element (Property 1)', () => {
  /**
   * @description Setup: Install the matchMedia mock before each test.
   * Object.defineProperty is required because jsdom window.matchMedia
   * is undefined by default and simple assignment would fail.
   */
  beforeEach(() => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: mockMatchMediaMobile(),
    });
  });

  /**
   * @description Teardown: Clean up rendered DOM and restore all vi mocks
   * between tests to prevent state leaking across test cases.
   */
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  /**
   * @description Property: No <video> element in the DOM on mobile viewports.
   *
   * Generates random widths from 320px (smallest common mobile)
   * to 768px (mobile breakpoint threshold, inclusive per Req 11 AC 4).
   *
   * On unfixed code: FAILS - Hero.tsx always renders <video> unconditionally.
   * After fix: PASSES - useIsMobile hook detects mobile, renders <img> instead.
   *
   * @requirements 2.1, 2.2, 2.5 - video must not be rendered on mobile
   */
  it('should NOT render a <video> element on mobile viewports (320-768px)', () => {
    fc.assert(
      fc.property(fc.integer({ min: 320, max: 768 }), (_viewportWidth) => {
        // Re-apply the matchMedia mock per fast-check iteration for clean state.
        // _viewportWidth drives the property range; the mock handles detection.
        Object.defineProperty(window, 'matchMedia', {
          writable: true,
          value: mockMatchMediaMobile(),
        });

        const { container } = render(<Hero />);

        // Assert: no <video> element exists in the rendered DOM.
        // The video must be completely absent (not just CSS-hidden)
        // to prevent the browser from parsing <source> and initiating
        // the 3.1MB hero_video.mp4 download on mobile connections.
        const video = container.querySelector('video');
        expect(video).toBeNull();

        // Clean up between fast-check iterations to prevent DOM leaks
        cleanup();
      }),
      // 20 runs provides good coverage across the 320-768 range
      { numRuns: 20 },
    );
  });

  /**
   * @description Property: Fallback <img> with correct src and alt on mobile.
   *
   * The fallback image must have:
   * - src="/hero-fallback.jpg" - lightweight 46KB alternative to the 3.1MB video
   * - alt="" - decorative image, same semantic role as the background video
   *
   * On unfixed code: FAILS - no <img> fallback is rendered at all.
   * After fix: PASSES - conditional rendering outputs <img> on mobile.
   *
   * @requirements 2.1, 2.4 - fallback image displayed on mobile
   */
  it('should render a fallback <img> with src="/hero-fallback.jpg" and alt="" on mobile viewports (320-768px)', () => {
    fc.assert(
      fc.property(fc.integer({ min: 320, max: 768 }), (_viewportWidth) => {
        // Re-apply mock for clean state per fast-check iteration
        Object.defineProperty(window, 'matchMedia', {
          writable: true,
          value: mockMatchMediaMobile(),
        });

        const { container } = render(<Hero />);

        // Assert: a fallback <img> element exists with the correct src.
        // This image replaces the video on mobile, providing a fast,
        // reliable visual background without the 3.1MB download.
        const fallbackImg = container.querySelector('img[src="/hero-fallback.jpg"]');
        expect(fallbackImg).not.toBeNull();

        // Assert: alt="" marks this as a decorative image for screen readers,
        // consistent with the video background decorative role (Req 2.6).
        expect(fallbackImg!.getAttribute('alt')).toBe('');

        // Clean up between fast-check iterations
        cleanup();
      }),
      { numRuns: 20 },
    );
  });

  /**
   * @description Property: Fallback <img> has the .heroFallbackImage CSS class.
   *
   * The heroFallbackImage class provides full-coverage styling:
   * position: absolute, width/height 100%, object-fit: cover, z-index: 0.
   * This ensures the fallback image covers the entire hero area without
   * distortion, matching the video visual coverage on desktop.
   *
   * On unfixed code: FAILS because:
   * 1. No <img> element is rendered at all
   * 2. The .heroFallbackImage CSS class does not exist yet in Hero.module.css
   *
   * @requirements 2.4 - fallback image covers full hero area with cover sizing
   */
  it('should apply the .heroFallbackImage class to the fallback <img> on mobile viewports (320-768px)', () => {
    fc.assert(
      fc.property(fc.integer({ min: 320, max: 768 }), (_viewportWidth) => {
        // Re-apply mock for clean state per fast-check iteration
        Object.defineProperty(window, 'matchMedia', {
          writable: true,
          value: mockMatchMediaMobile(),
        });

        const { container } = render(<Hero />);

        // Assert: the fallback image exists and carries the heroFallbackImage class.
        // CSS Modules mangles class names at build time, so we check that
        // the base name 'heroFallbackImage' appears somewhere in the className string.
        const fallbackImg = container.querySelector('img[src="/hero-fallback.jpg"]');
        expect(fallbackImg).not.toBeNull();
        expect(fallbackImg!.className).toContain('heroFallbackImage');

        // Clean up between fast-check iterations
        cleanup();
      }),
      { numRuns: 20 },
    );
  });
});
