/**
 * Newsletter.property.test.tsx — Property-based test for the Newsletter subscribe button.
 *
 * Property 18: Newsletter subscribe button opens in new tab
 *
 * Uses fast-check to generate random newsletter URLs and verifies that
 * the Subscribe element:
 *   1. Is an `<a>` element (not a `<button>`)
 *   2. Has `target="_blank"` attribute (opens in new tab)
 *   3. Has `rel="noopener noreferrer"` attribute (security — prevents window.opener access)
 *   4. Has a non-empty external `href` attribute
 *
 * This ensures the newsletter CTA always opens safely in a new tab
 * regardless of the configured newsletter URL.
 *
 * Validates: Requirements 7.6
 * @see design.md — Correctness Property 18
 */

import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import fc from 'fast-check';

/**
 * Mutable reference for the newsletter URL.
 * Allows fast-check to inject random URLs per iteration
 * without re-importing the module.
 */
const mockNewsletterUrl = { value: 'https://newsletter.example.com' };

/**
 * Mock the siteConfig module so we can control the newsletterUrl
 * value across fast-check iterations. The getter ensures each
 * render picks up the latest value from mockNewsletterUrl.
 */
vi.mock('@/data/siteConfig', () => ({
  get newsletterUrl() {
    return mockNewsletterUrl.value;
  },
}));

/* Import the component under test after mocks are set up */
import Newsletter from '../Newsletter';

/**
 * Clean up the DOM between each test to prevent leftover nodes
 * from previous fast-check iterations causing query collisions.
 */
afterEach(() => {
  cleanup();
});

describe('Newsletter — Property 18: Subscribe button opens in new tab', () => {
  /**
   * For any random valid external URL, the Subscribe element must be
   * an `<a>` tag with target="_blank", rel="noopener noreferrer",
   * and a non-empty href matching the configured URL.
   *
   * Uses fc.webUrl() to generate realistic external URLs, ensuring
   * the property holds for any plausible newsletter signup destination.
   */
  it('Subscribe element is an <a> with target="_blank", rel="noopener noreferrer", and non-empty external href', () => {
    fc.assert(
      fc.property(
        /* Generate random valid web URLs to simulate different newsletter destinations */
        fc.webUrl(),
        (randomUrl) => {
          /* Override the mocked newsletter URL with the randomly generated one */
          mockNewsletterUrl.value = randomUrl;

          /* Render the Newsletter component with the mocked URL */
          const { unmount, getByTestId } = render(<Newsletter />);

          /* Locate the subscribe element via data-testid */
          const subscribeEl = getByTestId('newsletter-subscribe');

          /**
           * Assertion 1: Element is an `<a>` tag, not a `<button>`.
           * The design spec requires a link element for external navigation (Req 7.6).
           */
          expect(subscribeEl.tagName).toBe('A');

          /**
           * Assertion 2: target="_blank" — ensures the link opens in a new tab
           * so the visitor stays on the site (Req 7.6).
           */
          expect(subscribeEl.getAttribute('target')).toBe('_blank');

          /**
           * Assertion 3: rel="noopener noreferrer" — prevents the opened page
           * from accessing window.opener, a critical security measure for
           * external links (Req 7.6).
           */
          expect(subscribeEl.getAttribute('rel')).toBe('noopener noreferrer');

          /**
           * Assertion 4: href is non-empty and matches the configured URL.
           * Ensures the link actually points somewhere useful (Req 7.6).
           */
          const href = subscribeEl.getAttribute('href');
          expect(href).toBeTruthy();
          expect(href).toBe(randomUrl);

          /* Clean up DOM to prevent memory leaks between fast-check iterations */
          unmount();
        }
      ),
      /* 100 iterations as specified in the task requirements */
      { numRuns: 100 }
    );
  });
});
