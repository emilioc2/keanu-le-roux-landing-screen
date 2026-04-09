/**
 * Newsletter.property.test.tsx — Property-based tests for the Newsletter component.
 *
 * Tests the inline email subscription form behaviour after the rewrite
 * from Server Component (external link) to Client Component (inline form):
 *   1. Subscribe button is a <button> element (not an <a> link)
 *   2. Email input has correct accessibility attributes
 *   3. Honeypot field is present and hidden from users
 *   4. Benefits list renders all three items with checkmarks
 *
 * Validates: Req 4 AC 1–6, AC 13, AC 14, AC 17
 * @see design.md — Newsletter component specification (Section 4.3)
 */

import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup, screen } from '@testing-library/react';
import fc from 'fast-check';

/* Import the component under test — now a Client Component with form */
import Newsletter from '../Newsletter';

/**
 * Clean up the DOM between each test to prevent leftover nodes
 * from previous fast-check iterations causing query collisions.
 */
afterEach(() => {
  cleanup();
});

describe('Newsletter — Inline form properties', () => {
  /**
   * Property: The Subscribe element is a <button> with type="submit",
   * not an external <a> link. This validates the rewrite from external
   * link to inline form submission (Req 4 AC 1, AC 4).
   */
  it('Subscribe element is a <button> with type="submit"', () => {
    fc.assert(
      fc.property(
        /* Use a constant arbitrary since the component takes no props */
        fc.constant(null),
        () => {
          const { unmount } = render(<Newsletter />);

          /* Locate the subscribe element via data-testid */
          const subscribeEl = screen.getByTestId('newsletter-subscribe');

          /* Must be a <button>, not an <a> — form submission, not navigation */
          expect(subscribeEl.tagName).toBe('BUTTON');

          /* Must be type="submit" for form submission */
          expect(subscribeEl.getAttribute('type')).toBe('submit');

          /* Button text should be "Subscribe" in idle state */
          expect(subscribeEl.textContent).toBe('Subscribe');

          unmount();
        }
      ),
      { numRuns: 10 }
    );
  });

  /**
   * Property: The email input has the correct accessibility attributes
   * for screen readers and assistive technology (Req 4 AC 14).
   */
  it('Email input has aria-label, type="email", required, and placeholder', () => {
    fc.assert(
      fc.property(
        fc.constant(null),
        () => {
          const { unmount } = render(<Newsletter />);

          /* Find the email input by its data-testid */
          const emailInput = screen.getByTestId('newsletter-email');

          /* aria-label for screen readers (Req 4 AC 14) */
          expect(emailInput.getAttribute('aria-label')).toBe('Email address for newsletter');

          /* type="email" for browser-native validation */
          expect(emailInput.getAttribute('type')).toBe('email');

          /* required attribute for HTML5 validation */
          expect(emailInput.hasAttribute('required')).toBe(true);

          /* Placeholder text matches spec (Req 4 AC 2) */
          expect(emailInput.getAttribute('placeholder')).toBe('Enter your email address');

          unmount();
        }
      ),
      { numRuns: 10 }
    );
  });

  /**
   * Property: The honeypot field is present in the DOM but hidden
   * from real users via aria-hidden and off-screen positioning (Req 4 AC 17).
   */
  it('Honeypot field is present and hidden from users', () => {
    fc.assert(
      fc.property(
        fc.constant(null),
        () => {
          const { unmount, container } = render(<Newsletter />);

          /* Find the honeypot input by name attribute */
          const honeypotInput = container.querySelector('input[name="honeypot"]');
          expect(honeypotInput).not.toBeNull();

          /* tabIndex -1 prevents keyboard focus so real users can't tab to it */
          expect(honeypotInput?.getAttribute('tabindex')).toBe('-1');

          /* autoComplete off prevents browser autofill from revealing the field */
          expect(honeypotInput?.getAttribute('autocomplete')).toBe('off');

          /* Parent wrapper has aria-hidden to hide from screen readers */
          const honeypotWrapper = honeypotInput?.closest('[aria-hidden="true"]');
          expect(honeypotWrapper).not.toBeNull();

          unmount();
        }
      ),
      { numRuns: 10 }
    );
  });

  /**
   * Property: All three benefit items render with non-empty text
   * and checkmark prefixes (Req 4 AC 13).
   */
  it('Benefits list renders all three items with checkmarks', () => {
    fc.assert(
      fc.property(
        fc.constant(null),
        () => {
          const { unmount, container } = render(<Newsletter />);

          /* Query all benefit list items — should be exactly 3 */
          const benefitItems = container.querySelectorAll('li');
          expect(benefitItems.length).toBe(3);

          /* Each item should have non-empty text content */
          benefitItems.forEach((item) => {
            expect(item.textContent?.trim().length).toBeGreaterThan(0);
          });

          /* Each item should contain a decorative checkmark span (✓) */
          const checkmarkSpans = Array.from(
            container.querySelectorAll('span[aria-hidden="true"]')
          ).filter((el) => el.textContent === '✓');
          expect(checkmarkSpans.length).toBe(3);

          unmount();
        }
      ),
      { numRuns: 10 }
    );
  });
});
