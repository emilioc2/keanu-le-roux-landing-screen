/**
 * Performance.property.test.tsx — Property-based tests for performance optimisations.
 *
 * Verifies two key performance invariants using fast-check:
 *
 * Property 13 (Below-fold images use lazy loading): For any rendered Blog
 *   component with random posts, every `<img>` element must have
 *   `loading="lazy"` since Blog is a below-fold section. (Validates: Req 14.5)
 *
 * Property 12 (Scripts use non-blocking loading): For any rendered component
 *   output, no `<script>` tags should exist without `defer` or `async`
 *   attributes. Next.js handles this at build time, so we verify the
 *   structural intent by checking rendered component output. (Validates: Req 14.4)
 *
 * @see design.md — Correctness Properties 12 and 13
 */

import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import fc from 'fast-check';
import type { BlogPost } from '@/lib/types';

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

/* Import Blog after mocks are registered so it picks up the mocked ScrollReveal */
import Blog from '../Blog';

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
    _id: `perf-post-${index}`,
    title: `Performance Test Post ${index}`,
    slug: { current: `perf-test-post-${index}` },
    publishedAt: date,
    excerpt: `Excerpt for performance test post number ${index}.`,
    mainImage: hasImage
      ? {
          asset: { url: `https://cdn.sanity.io/images/test/production/perf-img-${index}.jpg` },
          alt: `Performance test image for post ${index}`,
        }
      : undefined,
    body: [],
    published: true,
  };
}


/* =========================================================================
 * Property 13: Below-fold images use lazy loading
 *
 * For any rendered Blog component with random blog post data, every <img>
 * element must have `loading="lazy"`. The Blog section is always below the
 * fold (below the Hero), so all its images should be lazy-loaded to avoid
 * blocking the initial page paint.
 *
 * We generate random sets of blog posts (with and without images) and verify
 * that every <img> in the rendered output has the lazy loading attribute.
 *
 * Validates: Requirement 14.5
 * ========================================================================= */
describe('Performance — Property 13: Below-fold images use lazy loading', () => {
  it('every <img> in the Blog section has loading="lazy"', () => {
    fc.assert(
      fc.property(
        /**
         * Generate 1–5 random blog post configurations.
         * Each config has a unique index, random timestamp, and random image presence.
         * This ensures we test varying numbers of posts with different image states.
         */
        fc.array(
          fc.record({
            /** Unique index to avoid field collisions between posts */
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
        (postConfigs) => {
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

          /* Query ALL <img> elements in the rendered Blog section */
          const images = container.querySelectorAll('img');

          /**
           * Verify every <img> has loading="lazy" (Req 14.5).
           * Blog is always below the fold, so ALL its images should be lazy-loaded.
           * This prevents below-fold images from blocking the initial page paint.
           */
          images.forEach((img) => {
            expect(img.getAttribute('loading')).toBe('lazy');
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
 * Property 12: Scripts use non-blocking loading
 *
 * For any rendered component output, no <script> tags should exist without
 * `defer` or `async` attributes. In a Next.js App Router application,
 * script loading is handled at build time by the framework, so individual
 * components should not inject blocking <script> tags.
 *
 * This structural test verifies that the Blog component (and its children)
 * do not introduce any <script> elements into the DOM. If any <script> tags
 * were present, they would need `defer` or `async` to avoid blocking
 * initial content rendering.
 *
 * Validates: Requirement 14.4
 * ========================================================================= */
describe('Performance — Property 12: Scripts use non-blocking loading', () => {
  it('no <script> tags without defer or async exist in rendered Blog output', () => {
    fc.assert(
      fc.property(
        /**
         * Generate 1–4 random blog post configurations.
         * We vary the number and content of posts to ensure no code path
         * accidentally injects a blocking script tag.
         */
        fc.array(
          fc.record({
            /** Unique index for deterministic post field values */
            index: fc.integer({ min: 1, max: 999999 }),
            /** Random timestamp for publishedAt date */
            timestamp: fc.integer({
              min: new Date('2020-01-01T00:00:00Z').getTime(),
              max: new Date('2029-12-31T23:59:59Z').getTime(),
            }),
            /** Random image presence to test both code paths */
            hasImage: fc.boolean(),
          }),
          { minLength: 1, maxLength: 4 }
        ),
        (postConfigs) => {
          /* Build blog posts from the randomly generated configurations */
          const posts: BlogPost[] = postConfigs.map((config, i) =>
            makeBlogPost(
              config.index + i * 1000000,
              new Date(config.timestamp).toISOString(),
              config.hasImage
            )
          );

          /* Sort posts by date descending to match expected GROQ query order */
          const sorted = [...posts].sort(
            (a, b) =>
              new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
          );

          /* Render the Blog component with the randomly generated posts */
          const { unmount, container } = render(<Blog posts={sorted} />);

          /* Query ALL <script> elements in the rendered output */
          const scripts = container.querySelectorAll('script');

          /**
           * Verify every <script> tag (if any) has either `defer` or `async`.
           * In practice, React components should not render <script> tags at all —
           * Next.js handles script injection at the framework level. This test
           * catches any accidental inline script injection that could block rendering.
           */
          scripts.forEach((script) => {
            const hasDefer = script.hasAttribute('defer');
            const hasAsync = script.hasAttribute('async');
            /* Every script must use non-blocking loading (Req 14.4) */
            expect(
              hasDefer || hasAsync,
              `Found <script> without defer or async: ${script.outerHTML}`
            ).toBe(true);
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
