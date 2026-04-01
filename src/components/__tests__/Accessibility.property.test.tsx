/**
 * Accessibility.property.test.tsx — Property-based accessibility tests.
 *
 * Verifies two key accessibility invariants using fast-check:
 *
 * Property 7 (All images have alt attributes): For any rendered page content
 *   with random blog data, every `<img>` element must have a non-empty `alt`
 *   attribute. (Validates: Req 13.2)
 *
 * Property 8 (Icon-only interactive elements have aria-label): For any
 *   interactive element (`<a>` or `<button>`) that contains only SVG icons
 *   and no visible text, the element must have a non-empty `aria-label`.
 *   (Validates: Req 13.3)
 *
 * @see design.md — Correctness Properties 7 and 8
 */

import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import fc from 'fast-check';
import type { BlogPost } from '@/lib/types';
import type { SocialLink } from '@/lib/types';

/**
 * Mock ScrollReveal — replaces the IntersectionObserver-based component
 * with a simple pass-through div. jsdom doesn't support IntersectionObserver,
 * and we only need to verify rendered DOM attributes, not scroll animation.
 */
vi.mock('@/components/ScrollReveal', () => ({
  default: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="scroll-reveal" className={className}>
      {children}
    </div>
  ),
}));

/**
 * Mutable reference for controlling the socialLinks mock data.
 * Allows each fast-check iteration to inject different link subsets
 * without re-registering the mock.
 */
const mockSocialLinks = { value: [] as SocialLink[] };

/** Mock the socialLinks data module so we can control which links are rendered per iteration */
vi.mock('@/data/socialLinks', () => ({
  get socialLinks() {
    return mockSocialLinks.value;
  },
}));

/* Import components after mocks are registered so they pick up the mocked modules */
import Blog from '../Blog';
import SocialFeed from '../SocialFeed';
import Footer from '../Footer';

/**
 * The complete set of social links matching production data.
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
 * Helper: creates a BlogPost with unique, deterministic field values.
 * Uses the index parameter to guarantee no field value collisions
 * between posts, which prevents ambiguous getByText queries.
 *
 * @param index - Unique numeric index for this post
 * @param date - ISO 8601 date string for publishedAt
 * @param hasImage - Whether to include a mainImage with alt text
 * @returns A fully populated BlogPost object
 */
function makeBlogPost(index: number, date: string, hasImage: boolean): BlogPost {
  return {
    _id: `post-${index}`,
    title: `Accessibility Test Post ${index}`,
    slug: { current: `a11y-test-post-${index}` },
    publishedAt: date,
    excerpt: `Excerpt for accessibility test post number ${index}.`,
    mainImage: hasImage
      ? {
          asset: { url: `https://cdn.sanity.io/images/test/production/img-${index}.jpg` },
          alt: `Descriptive alt text for post ${index}`,
        }
      : undefined,
    body: [],
    published: true,
  };
}


/* =========================================================================
 * Property 7: All images have alt attributes
 *
 * For any rendered Blog component with random blog post data, every <img>
 * element in the DOM must have a non-empty `alt` attribute. This covers
 * both posts with mainImage (CMS-provided alt) and posts without mainImage
 * (no <img> rendered — placeholder <span> instead).
 *
 * Validates: Requirement 13.2
 * ========================================================================= */
describe('Accessibility — Property 7: All images have alt attributes', () => {
  it('every <img> element rendered by Blog has a non-empty alt attribute', () => {
    fc.assert(
      fc.property(
        /* Generate 1–5 random blog posts with varying image presence */
        fc.integer({ min: 1, max: 5 }),
        fc.array(
          fc.record({
            /** Random unique index to avoid field collisions between posts */
            index: fc.integer({ min: 1, max: 999999 }),
            /** Random timestamp within a 10-year range for publishedAt */
            timestamp: fc.integer({
              min: new Date('2020-01-01T00:00:00Z').getTime(),
              max: new Date('2029-12-31T23:59:59Z').getTime(),
            }),
            /** Randomly decide whether the post has an image — tests both code paths */
            hasImage: fc.boolean(),
          }),
          { minLength: 1, maxLength: 5 }
        ),
        (_count, postConfigs) => {
          /* Build blog posts from the randomly generated configurations */
          const posts: BlogPost[] = postConfigs.map((config, i) =>
            makeBlogPost(
              config.index + i * 1000000, // ensure unique indices across posts
              new Date(config.timestamp).toISOString(),
              config.hasImage
            )
          );

          /* Sort posts by date descending to match the expected GROQ query order */
          const sorted = [...posts].sort(
            (a, b) =>
              new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
          );

          /* Render the Blog component with the randomly generated posts */
          const { unmount, container } = render(<Blog posts={sorted} />);

          /* Query ALL <img> elements in the rendered output */
          const images = container.querySelectorAll('img');

          /* Verify every <img> has a non-empty alt attribute (Req 13.2) */
          images.forEach((img) => {
            const alt = img.getAttribute('alt');
            /* alt must exist and not be empty or whitespace-only */
            expect(alt).toBeTruthy();
            expect(alt!.trim().length).toBeGreaterThan(0);
          });

          /* Clean up DOM to prevent leaks between fast-check iterations */
          unmount();
        }
      ),
      /* 100 iterations as specified in the task requirements */
      { numRuns: 100 }
    );
  });
});

/* =========================================================================
 * Property 8: Icon-only interactive elements have aria-label
 *
 * For any rendered Footer and SocialFeed components, every interactive
 * element (<a> or <button>) that contains only SVG icons and no visible
 * text content must have a non-empty `aria-label` attribute.
 *
 * "Icon-only" is defined as: the element's direct text content (excluding
 * child element text) is empty or whitespace-only, AND the element contains
 * at least one <svg> child.
 *
 * Validates: Requirement 13.3
 * ========================================================================= */
describe('Accessibility — Property 8: Icon-only interactive elements have aria-label', () => {
  it('every icon-only <a> and <button> in Footer has a non-empty aria-label', () => {
    fc.assert(
      fc.property(
        /* Use a constant arbitrary since Footer has no variable data.
         * The iteration count still exercises the assertion 100 times
         * to satisfy the numRuns requirement and catch any flaky behaviour. */
        fc.constant(null),
        () => {
          /* Render the Footer component which contains icon-only social links */
          const { unmount, container } = render(<Footer />);

          /* Query all interactive elements: anchors and buttons */
          const interactiveElements = container.querySelectorAll('a, button');

          interactiveElements.forEach((el) => {
            /* Check if this element contains SVG icons */
            const hasSvg = el.querySelectorAll('svg').length > 0;

            if (!hasSvg) return; // skip elements without SVGs — not icon-only

            /**
             * Determine if the element is "icon-only" by checking whether it
             * has any visible text content beyond its child elements' text.
             * We check the element's direct childNodes for text nodes.
             */
            let hasVisibleText = false;
            el.childNodes.forEach((node) => {
              /* Text nodes (nodeType 3) with non-whitespace content count as visible text */
              if (node.nodeType === Node.TEXT_NODE && node.textContent?.trim()) {
                hasVisibleText = true;
              }
              /* Element children that are NOT SVGs and have text content count as visible text */
              if (
                node.nodeType === Node.ELEMENT_NODE &&
                (node as Element).tagName !== 'svg' &&
                (node as Element).tagName !== 'SVG' &&
                node.textContent?.trim()
              ) {
                hasVisibleText = true;
              }
            });

            /* If the element is icon-only (SVGs but no visible text), it MUST have aria-label */
            if (!hasVisibleText) {
              const ariaLabel = el.getAttribute('aria-label');
              expect(ariaLabel).toBeTruthy();
              expect(ariaLabel!.trim().length).toBeGreaterThan(0);
            }
          });

          /* Clean up DOM between iterations */
          unmount();
        }
      ),
      /* 100 iterations as specified in the task requirements */
      { numRuns: 100 }
    );
  });

  it('every icon-only <a> and <button> in SocialFeed has a non-empty aria-label or visible text', () => {
    fc.assert(
      fc.property(
        /**
         * Generate a random non-empty subset of social links.
         * This tests all possible platform combinations across iterations.
         */
        fc.shuffledSubarray(ALL_SOCIAL_LINKS, { minLength: 1, maxLength: 3 }),
        (subset) => {
          /* Override the mocked socialLinks with the randomly generated subset */
          mockSocialLinks.value = subset;

          /* Render the SocialFeed component with the mocked data */
          const { unmount, container } = render(<SocialFeed />);

          /* Query all interactive elements: anchors and buttons */
          const interactiveElements = container.querySelectorAll('a, button');

          interactiveElements.forEach((el) => {
            /* Check if this element contains SVG icons */
            const hasSvg = el.querySelectorAll('svg').length > 0;

            if (!hasSvg) return; // skip elements without SVGs

            /**
             * Determine if the element is "icon-only" by checking for visible
             * text content in direct child nodes (excluding SVG elements).
             */
            let hasVisibleText = false;
            el.childNodes.forEach((node) => {
              /* Text nodes with non-whitespace content count as visible text */
              if (node.nodeType === Node.TEXT_NODE && node.textContent?.trim()) {
                hasVisibleText = true;
              }
              /* Non-SVG element children with text content count as visible text */
              if (
                node.nodeType === Node.ELEMENT_NODE &&
                (node as Element).tagName !== 'svg' &&
                (node as Element).tagName !== 'SVG' &&
                node.textContent?.trim()
              ) {
                hasVisibleText = true;
              }
            });

            /**
             * Icon-only elements (SVGs present, no visible text) MUST have aria-label.
             * Elements with visible text alongside SVGs are NOT icon-only and don't
             * need aria-label — the text itself provides the accessible name.
             */
            if (!hasVisibleText) {
              const ariaLabel = el.getAttribute('aria-label');
              expect(ariaLabel).toBeTruthy();
              expect(ariaLabel!.trim().length).toBeGreaterThan(0);
            }
          });

          /* Clean up DOM between fast-check iterations */
          unmount();
        }
      ),
      /* 100 iterations as specified in the task requirements */
      { numRuns: 100 }
    );
  });
});
