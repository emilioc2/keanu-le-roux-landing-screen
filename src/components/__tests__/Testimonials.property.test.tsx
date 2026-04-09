/**
 * Testimonials.property.test.tsx — Property-based test for testimonial card
 * rendering completeness.
 *
 * Property 17: Testimonial card rendering completeness
 *
 * Renders the Testimonials component and verifies that every testimonial card
 * contains all required structural elements:
 *   1. A decorative quote icon (aria-hidden="true")
 *   2. A <blockquote> element with non-empty text
 *   3. A client name element with non-empty text
 *   4. A client role element with non-empty text
 *
 * Uses fast-check with a constant arbitrary since the component takes no props
 * — the property must hold on every render regardless of external conditions.
 *
 * ScrollReveal is mocked as a pass-through div because jsdom doesn't support
 * IntersectionObserver.
 *
 * Validates: Req 5 AC 7
 * @see design.md — Correctness Property 17
 *
 * @module Testimonials.property.test
 * @requirements Req 5 AC 7
 */

import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import fc from 'fast-check';

/**
 * Mock ScrollReveal — replaces the IntersectionObserver-based component
 * with a simple pass-through div. jsdom doesn't support IntersectionObserver,
 * and we only need to verify the rendered content structure, not scroll animation.
 *
 * The mock preserves the children and className props so the rendered DOM
 * structure matches what the real component would produce (minus animation).
 */
vi.mock('@/components/ScrollReveal', () => ({
  default: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="scroll-reveal" className={className}>
      {children}
    </div>
  ),
}));

/* Import the component under test — Server Component with static testimonial data */
import Testimonials from '../Testimonials';

/**
 * Clean up the DOM between each test to prevent leftover nodes
 * from previous fast-check iterations causing query collisions.
 */
afterEach(() => {
  cleanup();
});

describe('Testimonials — Property 17: Card rendering completeness', () => {
  /**
   * Property 17: Every testimonial card contains all required structural elements.
   *
   * For any render of the Testimonials component, each card SHALL contain:
   *   - A decorative quote icon (aria-hidden="true") with the open-quote character
   *   - A <blockquote> element with non-empty testimonial text
   *   - A client name span (.clientName) with non-empty text
   *   - A client role span (.clientRole) with non-empty text
   *
   * Uses fc.constant(null) since the component is deterministic (no props).
   * The property must hold unconditionally on every render.
   *
   * @validates Req 5 AC 7 — Each card shows quote icon, quote text, name, role
   */
  it('every testimonial card contains quote icon, blockquote, client name, and client role', () => {
    fc.assert(
      fc.property(
        /* Constant arbitrary — component takes no props, so no input variation needed */
        fc.constant(null),
        () => {
          const { container, unmount } = render(<Testimonials />);

          /* Query all testimonial card <article> elements by CSS Module class substring.
           * CSS Modules mangles class names (e.g. "testimonialCard" → "Testimonials_testimonialCard__abc"),
           * but the base name is always present as a substring in the test environment. */
          const cards = Array.from(container.querySelectorAll('article')).filter(
            (el) => el.className.includes('testimonialCard')
          );

          /* There must be exactly 3 testimonial cards per Req 5 AC 6 */
          expect(cards.length).toBe(3);

          /* Verify each card contains all four required structural elements */
          cards.forEach((card) => {
            /* 1. Decorative quote icon — aria-hidden="true" element with U+201C open-quote.
             *    This is purely visual and hidden from screen readers (Req 5 AC 7). */
            const quoteIcon = card.querySelector('[aria-hidden="true"]');
            expect(quoteIcon).not.toBeNull();
            expect(quoteIcon!.textContent).toBe('\u201C');

            /* 2. Blockquote — contains the client's testimonial text.
             *    Must be non-empty to provide meaningful social proof content. */
            const blockquote = card.querySelector('blockquote');
            expect(blockquote).not.toBeNull();
            expect(blockquote!.textContent!.trim().length).toBeGreaterThan(0);

            /* 3. Client name — span with .clientName class containing the client's display name.
             *    Semi-bold navy text for visual emphasis in the card attribution area. */
            const clientName = Array.from(card.querySelectorAll('span')).find(
              (el) => el.className.includes('clientName')
            );
            expect(clientName).toBeDefined();
            expect(clientName!.textContent!.trim().length).toBeGreaterThan(0);

            /* 4. Client role — span with .clientRole class containing the client's role/tenure.
             *    Muted grey text providing context about the client relationship. */
            const clientRole = Array.from(card.querySelectorAll('span')).find(
              (el) => el.className.includes('clientRole')
            );
            expect(clientRole).toBeDefined();
            expect(clientRole!.textContent!.trim().length).toBeGreaterThan(0);
          });

          /* Clean up between fast-check iterations to prevent DOM leaks */
          unmount();
        }
      ),
      /* 10 iterations — component is deterministic with no props, so fewer runs suffice.
       * Each iteration verifies all 3 cards × 4 assertions = 12 checks per run. */
      { numRuns: 10 }
    );
  });

  /**
   * Supplementary property: The testimonials section has the correct id attribute
   * for anchor navigation from the Navbar "Testimonials" link (#testimonials).
   *
   * @validates Req 5 AC 1 — Section renders with id="testimonials"
   */
  it('renders a section with id="testimonials" for anchor navigation', () => {
    fc.assert(
      fc.property(
        fc.constant(null),
        () => {
          const { container, unmount } = render(<Testimonials />);

          /* The section must have id="testimonials" so the Navbar anchor link resolves */
          const section = container.querySelector('section#testimonials');
          expect(section).not.toBeNull();

          unmount();
        }
      ),
      { numRuns: 10 }
    );
  });
});
