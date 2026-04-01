/**
 * Blog.property.test.tsx — Property-based tests for the Blog section component.
 *
 * Uses fast-check to generate random blog post data and verify two key invariants:
 *
 * Property 2 (Blog Card Rendering Completeness): For any blog post, the rendered
 *   card contains an image element (or placeholder), date, title, excerpt, and
 *   "Read More" link. No required element may be missing. (Validates: Req 5.5)
 *
 * Property 3 (Most Recent Published Post is Featured): For any set of published
 *   blog posts with distinct publishedAt dates, the featured article displays
 *   the post with the most recent publishedAt value. (Validates: Req 5.8, 15.5)
 *
 * @see design.md — Correctness Properties 2 and 3
 */

import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, within, cleanup } from '@testing-library/react';
import fc from 'fast-check';
import Blog, { formatDate } from '../Blog';
import type { BlogPost } from '@/lib/types';

/**
 * Mock ScrollReveal — replaces the IntersectionObserver-based component
 * with a simple pass-through div. jsdom doesn't support IntersectionObserver,
 * and we only need to verify the rendered content, not the scroll animation.
 */
vi.mock('@/components/ScrollReveal', () => ({
  default: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="scroll-reveal" className={className}>
      {children}
    </div>
  ),
}));

/**
 * Ensure the DOM is fully cleaned between each test to prevent
 * leftover nodes from previous fast-check iterations causing
 * "found multiple elements" errors.
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
 * @param hasImage - Whether to include a mainImage
 * @returns A fully populated BlogPost object
 */
function makeBlogPost(index: number, date: string, hasImage: boolean): BlogPost {
  return {
    _id: `post-${index}`,
    title: `Test Post Title ${index}`,
    slug: { current: `test-post-${index}` },
    publishedAt: date,
    excerpt: `This is the excerpt for test post number ${index}.`,
    mainImage: hasImage
      ? {
          asset: { url: 'https://cdn.sanity.io/images/test/production/test-image.jpg' },
          alt: `Image alt for post ${index}`,
        }
      : undefined,
    body: [],
    published: true,
  };
}


/**
 * Property 2: Blog Card Rendering Completeness
 *
 * For any blog post returned by the CMS, the rendered blog card must contain:
 * 1. An image element (either the post's mainImage or a placeholder span)
 * 2. A date label with the formatted publishedAt date
 * 3. The post title
 * 4. The post excerpt
 * 5. A "Read More →" link pointing to /blog/[slug]
 *
 * We render the Blog component with a fixed featured post (first) plus the
 * randomly generated test post as a card (second), then verify all required
 * elements are present within the card using scoped `within()` queries.
 *
 * Validates: Requirement 5.5
 */
describe('Blog — Property 2: Blog Card Rendering Completeness', () => {
  it('every blog card contains image/placeholder, date, title, excerpt, and "Read More" link', () => {
    fc.assert(
      fc.property(
        /* Generate a random unique index for the test post to avoid field collisions */
        fc.integer({ min: 100, max: 999999 }),
        /* Generate a random timestamp within a 10-year range.
         * Using integer timestamps avoids NaN date issues with fc.date() in fast-check v4. */
        fc.integer({
          min: new Date('2020-01-01T00:00:00Z').getTime(),
          max: new Date('2029-12-31T23:59:59Z').getTime(),
        }),
        /* Randomly decide whether the post has an image — tests both code paths */
        fc.boolean(),
        (index, timestamp, hasImage) => {
          /**
           * Create a fixed featured post that always appears first in the array.
           * This ensures the randomly generated test post renders as a card
           * in the grid, not as the featured article. Uses index 0 to avoid
           * field value collisions with the test post.
           */
          const featuredPost = makeBlogPost(0, '2030-12-31T23:59:59Z', true);

          /* Create the randomly generated test post using the arbitrary values */
          const testPost = makeBlogPost(index, new Date(timestamp).toISOString(), hasImage);

          /* Render Blog with featured post first, then the test post as a card */
          const { unmount, getAllByTestId } = render(
            <Blog posts={[featuredPost, testPost]} />
          );

          /* Find all blog cards (not the featured article) using data-testid */
          const cards = getAllByTestId('blog-card');
          expect(cards.length).toBeGreaterThanOrEqual(1);

          /* The last card corresponds to our randomly generated test post */
          const card = cards[cards.length - 1];

          /* 1. Verify image or placeholder is present in the card.
           * Posts with mainImage render an <img> element.
           * Posts without mainImage render a <span> with placeholder text. */
          if (hasImage) {
            const img = within(card).getByRole('img');
            expect(img).toBeTruthy();
          } else {
            /* Placeholder text "Blog Image" is rendered when no mainImage exists */
            expect(within(card).getByText('Blog Image')).toBeTruthy();
          }

          /* 2. Verify date label is rendered with the correctly formatted date string */
          const formattedDate = formatDate(testPost.publishedAt);
          expect(within(card).getByText(formattedDate)).toBeTruthy();

          /* 3. Verify the post title is rendered in the card */
          expect(within(card).getByText(testPost.title)).toBeTruthy();

          /* 4. Verify the post excerpt is rendered in the card */
          expect(within(card).getByText(testPost.excerpt)).toBeTruthy();

          /* 5. Verify "Read More →" link is present and points to the correct slug URL */
          const readMoreLink = within(card).getByText('Read More →');
          expect(readMoreLink).toBeTruthy();
          expect(readMoreLink.getAttribute('href')).toBe(`/blog/${testPost.slug.current}`);

          /* Clean up DOM to prevent leaks between fast-check iterations */
          unmount();
        }
      ),
      { numRuns: 100 }
    );
  });
});

/**
 * Property 3: Most Recent Published Post is Featured
 *
 * For any set of published blog posts with distinct publishedAt dates,
 * the featured article displayed in the Blog section must be the post
 * with the most recent publishedAt value.
 *
 * The test generates N posts with unique dates, sorts them by publishedAt
 * descending (mirroring the GROQ query behaviour), passes them to Blog,
 * and verifies the featured article's title matches the most recent post.
 *
 * Validates: Requirements 5.8, 15.5
 */
describe('Blog — Property 3: Most Recent Published Post is Featured', () => {
  it('the featured article always displays the most recent published post', () => {
    fc.assert(
      fc.property(
        /* Generate 2–6 unique timestamps within a 10-year range.
         * Using integer timestamps avoids NaN date issues that can occur
         * with fc.date(). Timestamps are converted to ISO strings for posts. */
        fc.uniqueArray(
          fc.integer({
            min: new Date('2020-01-01T00:00:00Z').getTime(),
            max: new Date('2030-12-31T23:59:59Z').getTime(),
          }),
          {
            minLength: 2,
            maxLength: 6,
          }
        ),
        (timestamps: number[]) => {
          /* Create posts with unique indices and the generated unique dates */
          const posts: BlogPost[] = timestamps.map((ts: number, i: number) =>
            makeBlogPost(i + 1, new Date(ts).toISOString(), true)
          );

          /**
           * Sort posts by publishedAt descending — this mirrors the GROQ query
           * behaviour (`| order(publishedAt desc)`). The Blog component expects
           * posts to arrive pre-sorted this way from page.tsx.
           */
          const sorted = [...posts].sort(
            (a, b) =>
              new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
          );

          /* The most recent post (sorted[0]) should become the featured article */
          const expectedFeatured = sorted[0];

          /* Render the Blog component with the sorted posts */
          const { unmount, getByTestId } = render(<Blog posts={sorted} />);

          /* Find the featured article section using data-testid */
          const featured = getByTestId('blog-featured');

          /* Verify the featured article displays the most recent post's title */
          expect(within(featured).getByText(expectedFeatured.title)).toBeTruthy();

          /* Verify the featured article displays the most recent post's excerpt */
          expect(within(featured).getByText(expectedFeatured.excerpt)).toBeTruthy();

          /* Verify the "Read Full Article →" link points to the correct slug */
          const readFullLink = within(featured).getByText('Read Full Article →');
          expect(readFullLink.getAttribute('href')).toBe(
            `/blog/${expectedFeatured.slug.current}`
          );

          /* Clean up DOM between fast-check iterations to prevent memory leaks */
          unmount();
        }
      ),
      { numRuns: 100 }
    );
  });
});
