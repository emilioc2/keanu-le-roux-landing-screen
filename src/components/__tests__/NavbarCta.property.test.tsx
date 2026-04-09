/**
 * NavbarCta.property.test.tsx — Property-based test for the Nav CTA blue variant
 * retaining its fill styling in the scrolled navbar state.
 *
 * Property 20: Nav CTA blue retains fill in scrolled state
 *
 * Renders the Navbar with `alwaysScrolled={true}` (simulating the scrolled state)
 * and verifies that the "Get In Touch" CTA link has both `.navCta` and `.navCtaBlue`
 * CSS Module classes applied. This ensures the steel-blue pill button does NOT
 * degrade to a transparent/navy-outline style when the navbar transitions to
 * its scrolled (white background) state.
 *
 * Uses fast-check with a constant arbitrary since the component behaviour is
 * deterministic when alwaysScrolled is true.
 *
 * Validates: Req 3 AC 14
 * @see design.md — Correctness Property 20
 *
 * @module NavbarCta.property.test
 * @requirements Req 3 AC 14
 */

import { describe, it, expect, afterEach, vi } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import fc from 'fast-check';

/* Import the component under test — Client Component with scroll-aware styling */
import Navbar from '../Navbar';

/**
 * Clean up the DOM and restore mocks between each test to prevent
 * leftover state from previous fast-check iterations causing query collisions.
 */
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe('Navbar — Property 20: Nav CTA blue retains fill in scrolled state', () => {
  /**
   * Property 20: When the navbar is in scrolled state, the "Get In Touch" CTA
   * link SHALL have both `.navCta` and `.navCtaBlue` CSS Module classes applied.
   *
   * WHY: The design spec requires the steel-blue (#7a9bb5) fill to be retained
   * in the scrolled navbar state. Without `.navCtaBlue`, the base `.scrolled .navCta`
   * styles would switch the button to a transparent background with navy border,
   * which is incorrect for this CTA variant.
   *
   * HOW: We use `alwaysScrolled={true}` to force the scrolled state without
   * needing to simulate scroll events — this is the same prop used on the blog
   * detail page (Req 19 AC 2).
   *
   * CSS Module class names in the test environment (vitest + jsdom) are
   * identity-mapped, meaning `styles.navCta` resolves to the string 'navCta'.
   * We check for these substrings in the element's className attribute.
   *
   * @validates Req 3 AC 14 — CTA retains steel-blue fill in scrolled state
   */
  it('"Get In Touch" link has both .navCta and .navCtaBlue classes when navbar is scrolled', () => {
    fc.assert(
      fc.property(
        /* Constant arbitrary — alwaysScrolled is a fixed boolean prop, no input variation needed.
         * The property must hold unconditionally on every render in scrolled state. */
        fc.constant(null),
        () => {
          const { unmount } = render(<Navbar alwaysScrolled={true} />);

          /* Find the "Get In Touch" CTA link — this is the last nav item with isCta: true
           * as configured in siteConfig.ts navLinks array (Req 3 AC 1) */
          const ctaLink = screen.getByText('Get In Touch');
          expect(ctaLink).toBeTruthy();

          /* Verify the navbar is in scrolled state (white bg, navy text).
           * The alwaysScrolled prop forces this state regardless of scroll position. */
          const nav = screen.getByTestId('navbar');
          expect(nav.className).toContain('scrolled');

          /* Assert: CTA link has the base .navCta class for pill styling.
           * This class provides border-radius: 40px, padding, and transition properties
           * that form the pill button shape (Req 3 AC 7). */
          expect(ctaLink.className).toContain('navCta');

          /* Assert: CTA link has the .navCtaBlue modifier class for steel-blue fill.
           * This class overrides the base .navCta scrolled styles to retain the
           * #7a9bb5 background instead of switching to transparent + navy border.
           * Without this class, the CTA would lose its distinctive blue appearance
           * when the navbar enters scrolled state (Req 3 AC 14). */
          expect(ctaLink.className).toContain('navCtaBlue');

          /* Clean up between fast-check iterations to prevent DOM leaks */
          unmount();
        }
      ),
      /* 10 iterations — component is deterministic with fixed props, fewer runs suffice.
       * Each iteration verifies the same structural property holds consistently. */
      { numRuns: 10 }
    );
  });

  /**
   * Supplementary property: The CTA link also has the base .navLink class,
   * ensuring it inherits the standard nav link typography and spacing.
   *
   * The Navbar implementation applies all three classes simultaneously:
   * `navLink navCta navCtaBlue` — this test verifies the full class chain.
   *
   * @validates Req 3 AC 4 — CTA uses navLink as base class for typography inheritance
   */
  it('"Get In Touch" link retains the base .navLink class alongside CTA classes', () => {
    fc.assert(
      fc.property(
        /* Constant arbitrary — no input variation needed for this deterministic check */
        fc.constant(null),
        () => {
          const { unmount } = render(<Navbar alwaysScrolled={true} />);

          /* Find the CTA link element by its visible text content */
          const ctaLink = screen.getByText('Get In Touch');

          /* Assert: base navLink class is present for standard typography inheritance.
           * This ensures the CTA inherits font-size, text-transform, and letter-spacing
           * from the .navLink base class before the CTA-specific overrides apply. */
          expect(ctaLink.className).toContain('navLink');

          /* Assert: all three classes are present simultaneously —
           * navLink (base typography) + navCta (pill shape) + navCtaBlue (steel-blue fill).
           * This triple-class pattern is set in Navbar.tsx's link rendering loop
           * when link.isCta is true (Req 3 AC 4). */
          expect(ctaLink.className).toContain('navCta');
          expect(ctaLink.className).toContain('navCtaBlue');

          /* Clean up between iterations */
          unmount();
        }
      ),
      /* 10 iterations for consistency verification */
      { numRuns: 10 }
    );
  });
});
