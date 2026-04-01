/**
 * SocialFeed.property.test.tsx — Property-based test for feed card external link safety.
 *
 * Property 4: Feed card external link safety and structure
 *
 * Uses fast-check to generate random subsets of social links and verifies
 * that for each rendered feed card:
 *   1. The wrapping `<a>` element has `target="_blank"` attribute
 *   2. The wrapping `<a>` element has `rel="noopener noreferrer"` attribute
 *   3. The card contains a badge row with:
 *      - A platform icon (SVG element)
 *      - A platform name text
 *      - An external link icon (SVG element)
 *
 * This ensures external links are safe (no window.opener access) and
 * structurally complete regardless of which subset of platforms is rendered.
 *
 * Validates: Requirements 6.7, 6.9
 * @see design.md — Correctness Property 4
 */

import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, within, cleanup } from '@testing-library/react';
import fc from 'fast-check';

/**
 * Mock ScrollReveal — replaces the IntersectionObserver-based component
 * with a simple pass-through div. jsdom doesn't support IntersectionObserver,
 * and we only need to verify the rendered content structure, not scroll animation.
 */
vi.mock('@/components/ScrollReveal', () => ({
  default: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="scroll-reveal" className={className}>
      {children}
    </div>
  ),
}));

/**
 * Mock the socialLinks data module so we can control which links are rendered.
 * The actual mock value is overridden per test iteration using the mutable reference.
 */
const mockSocialLinks = { value: [] as import('@/lib/types').SocialLink[] };

vi.mock('@/data/socialLinks', () => ({
  get socialLinks() {
    return mockSocialLinks.value;
  },
}));

import SocialFeed from '../SocialFeed';
import type { SocialLink } from '@/lib/types';

/**
 * The full set of social links matching the production data.
 * Used as the source pool for generating random subsets via fast-check.
 */
const ALL_SOCIAL_LINKS: SocialLink[] = [
  {
    platform: 'youtube',
    url: 'https://www.youtube.com/channel/UCx1K9NdhRghMU_TWBDNCC6g',
    title: 'How to Build Wealth in Your 20s',
    description: 'My latest breakdown on the habits and strategies that set you up for long-term financial success.',
    ctaText: 'Watch on YouTube \u2192',
  },
  {
    platform: 'linkedin',
    url: 'https://www.linkedin.com/in/keanu-le-roux-5a4b7a282/',
    title: 'Thought Leadership Post',
    description: 'Sharing insights on why goal-based planning outperforms reactive decision-making.',
    ctaText: 'Read on LinkedIn \u2192',
  },
  {
    platform: 'instagram',
    url: 'https://www.instagram.com/keanu.leroux01/',
    title: 'Behind the Scenes',
    description: 'A look at the day-to-day of building a financial advisory practice and serving clients.',
    ctaText: 'View on Instagram \u2192',
  },
];


/**
 * Clean up the DOM between each test to prevent leftover nodes from
 * previous fast-check iterations causing query collisions.
 */
afterEach(() => {
  cleanup();
});

/**
 * Property 4: Feed card external link safety and structure.
 *
 * For any random non-empty subset of social links, every rendered feed card must:
 *   1. Have `target="_blank"` on the wrapping `<a>` (opens in new tab)
 *   2. Have `rel="noopener noreferrer"` on the wrapping `<a>` (security)
 *   3. Contain a badge row with platform icon SVG, platform name, and external link icon SVG
 *
 * Uses fast-check's shuffledSubarray to generate random subsets of the
 * three platform links, ensuring all combinations are tested.
 */
describe('SocialFeed — Property 4: Feed card external link safety and structure', () => {
  it('every feed card has target="_blank", rel="noopener noreferrer", and a complete badge row', () => {
    fc.assert(
      fc.property(
        /**
         * Generate a random non-empty subset of the social links array.
         * minLength: 1 ensures at least one card is always rendered.
         * maxLength: 3 covers the full set. This tests all possible
         * platform combinations across 100 iterations.
         */
        fc.shuffledSubarray(ALL_SOCIAL_LINKS, { minLength: 1, maxLength: 3 }),
        (subset) => {
          /* Override the mocked socialLinks with the randomly generated subset */
          mockSocialLinks.value = subset;

          /* Render the SocialFeed component with the mocked data */
          const { unmount, getAllByTestId } = render(<SocialFeed />);

          /* Find all rendered feed cards via data-testid */
          const cards = getAllByTestId('feed-card');

          /* Verify the number of rendered cards matches the subset size */
          expect(cards.length).toBe(subset.length);

          /* Verify each card's external link safety attributes and badge structure */
          cards.forEach((card, index) => {
            const link = subset[index];

            /**
             * Assertion 1: target="_blank" — ensures the link opens in a new tab
             * so the user doesn't navigate away from the site (Req 6.7).
             */
            expect(card.getAttribute('target')).toBe('_blank');

            /**
             * Assertion 2: rel="noopener noreferrer" — prevents the opened page
             * from accessing window.opener, a critical security measure for
             * external links (Req 6.7).
             */
            expect(card.getAttribute('rel')).toBe('noopener noreferrer');

            /**
             * Assertion 3: Badge row completeness (Req 6.9).
             * The badge must contain: platform icon, platform name, external link icon.
             */
            const badge = within(card).getByTestId('feed-badge');
            expect(badge).toBeTruthy();

            /* 3a. Platform name text — capitalised first letter of the platform name */
            const badgeName = within(card).getByTestId('feed-badge-name');
            const expectedName = link.platform.charAt(0).toUpperCase() + link.platform.slice(1);
            expect(badgeName.textContent).toBe(expectedName);

            /* 3b. Platform icon — verify SVGs exist within the badge (platform + external) */
            const badgeSvgs = badge.querySelectorAll('svg');
            /* Badge should contain at least 2 SVGs: one for platform icon, one for external link */
            expect(badgeSvgs.length).toBeGreaterThanOrEqual(2);

            /* 3c. External link icon — verify the dedicated span contains an SVG */
            const externalIcon = within(card).getByTestId('feed-external-icon');
            expect(externalIcon).toBeTruthy();
            const externalSvg = externalIcon.querySelector('svg');
            expect(externalSvg).not.toBeNull();
          });

          /* Clean up DOM to prevent memory leaks between fast-check iterations */
          unmount();
        }
      ),
      /* 100 iterations as specified in the task requirements */
      { numRuns: 100 }
    );
  });
});
