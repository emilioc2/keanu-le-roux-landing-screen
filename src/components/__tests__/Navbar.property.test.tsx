/**
 * Navbar.property.test.tsx — Property-based test for Navbar scroll state transition.
 *
 * Feature: keanu-financial-advisor-website, Property 19: Navbar scroll state transition
 *
 * Uses fast-check to generate random scroll positions and verifies:
 *   - scrollY > 50px  → white background (scrolled class) + navy text
 *   - scrollY ≤ 50px  → transparent background (no scrolled class) + white text
 *
 * The test simulates scroll events by setting window.scrollY and dispatching
 * a scroll event, then inspects the rendered Navbar's CSS classes to determine
 * which visual state is active.
 *
 * Validates: Requirements 1.2, 1.3, 12.4
 * @see design.md — Correctness Property 19
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, act, cleanup } from '@testing-library/react';
import fc from 'fast-check';
import Navbar from '../Navbar';

/**
 * CSS Module class names are transformed at build time, but in the test
 * environment (jsdom + vitest), CSS Modules return an identity proxy
 * where `styles.scrolled` === 'scrolled'. We rely on checking whether
 * the `scrolled` class name is present in the rendered className string.
 */

/** The CSS module class name for the scrolled state */
const SCROLLED_CLASS = 'scrolled';

/**
 * Helper: simulates a scroll to a given Y position.
 * Sets window.scrollY (via defineProperty since jsdom doesn't support
 * direct assignment) and dispatches a native scroll event.
 *
 * @param y - The target scrollY value in pixels
 */
function simulateScroll(y: number): void {
  Object.defineProperty(window, 'scrollY', {
    value: y,
    writable: true,
    configurable: true,
  });
  window.dispatchEvent(new Event('scroll'));
}

describe('Navbar — Property 19: Scroll state transition', () => {
  beforeEach(() => {
    /* Reset scrollY to 0 before each test run to ensure clean state */
    Object.defineProperty(window, 'scrollY', {
      value: 0,
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    /* Clean up rendered components between property iterations */
    cleanup();
    vi.restoreAllMocks();
  });

  it('displays scrolled state (white bg, navy text) when scrollY > 50px, transparent state when ≤ 50px', () => {
    fc.assert(
      fc.property(
        /**
         * Generate random scroll positions between 0 and 5000px.
         * This covers the full range of realistic scroll values including
         * the boundary at 50px.
         */
        fc.integer({ min: 0, max: 5000 }),
        (scrollPosition) => {
          /* Reset scroll to 0 before rendering to start from a known state */
          Object.defineProperty(window, 'scrollY', {
            value: 0,
            writable: true,
            configurable: true,
          });

          /* Render the Navbar in default (landing page) mode */
          const { unmount } = render(<Navbar />);

          /* Find the nav element by test ID */
          const navElement = document.querySelector('[data-testid="navbar"]');
          expect(navElement).not.toBeNull();

          /* Simulate scrolling to the random position inside act() to flush state updates */
          act(() => {
            simulateScroll(scrollPosition);
          });

          /**
           * Verify the correct visual state based on the scroll threshold.
           * - Above 50px: scrolled class should be present (white bg, navy text)
           * - At or below 50px: scrolled class should be absent (transparent bg, white text)
           */
          const hasScrolledClass = navElement!.className.includes(SCROLLED_CLASS);

          if (scrollPosition > 50) {
            /* Scrolled state: white background with navy text */
            expect(hasScrolledClass).toBe(true);
          } else {
            /* Transparent state: clear background with white text */
            expect(hasScrolledClass).toBe(false);
          }

          /* Clean up to avoid DOM leaks between property runs */
          unmount();
        }
      ),
      { numRuns: 100 }
    );
  });

  it('always shows scrolled state when alwaysScrolled prop is true, regardless of scroll position', () => {
    fc.assert(
      fc.property(
        /**
         * Generate random scroll positions — the alwaysScrolled prop
         * should override all of them to show the scrolled state.
         */
        fc.integer({ min: 0, max: 5000 }),
        (scrollPosition) => {
          /* Set initial scroll position before render */
          Object.defineProperty(window, 'scrollY', {
            value: scrollPosition,
            writable: true,
            configurable: true,
          });

          /* Render with alwaysScrolled=true (blog post page mode) */
          const { unmount } = render(<Navbar alwaysScrolled />);

          const navElement = document.querySelector('[data-testid="navbar"]');
          expect(navElement).not.toBeNull();

          /**
           * Regardless of scroll position, the navbar should always
           * have the scrolled class when alwaysScrolled is true.
           * This validates Req 19 AC 2.
           */
          expect(navElement!.className.includes(SCROLLED_CLASS)).toBe(true);

          /* Clean up to avoid DOM leaks between property runs */
          unmount();
        }
      ),
      { numRuns: 100 }
    );
  });
});
