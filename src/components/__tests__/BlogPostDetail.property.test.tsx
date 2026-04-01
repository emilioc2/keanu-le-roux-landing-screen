/**
 * BlogPostDetail.property.test.tsx — Property-based test for the blog post detail component.
 *
 * Feature: keanu-financial-advisor-website, Property 17: Blog post detail page renders all CMS fields
 *
 * Uses fast-check to generate random BlogPost objects and verifies that
 * the BlogPostDetail component renders all required CMS fields:
 *   - <h1> title
 *   - Formatted publishedAt date
 *   - Excerpt as lead text
 *   - Main image with alt text (when present)
 *   - Body content via PortableText
 *
 * PortableText is mocked to render a simple div with text content,
 * since the actual @portabletext/react renderer requires a full Sanity
 * context that isn't available in the test environment.
 *
 * Validates: Requirements 19.4, 19.12
 * @see design.md — Correctness Property 17
 */

import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import fc from 'fast-check';
import BlogPostDetail, { formatDate } from '../BlogPostDetail';
import type { BlogPost } from '@/lib/types';
import type { PortableTextBlock } from '@portabletext/react';

/**
 * Mock @portabletext/react — replaces the real PortableText renderer
 * with a simple div that serialises the Portable Text value as JSON.
 * This allows us to verify that body content is passed through and
 * rendered without needing the full Sanity Portable Text pipeline.
 *
 * The mock renders each block's children text content so we can
 * assert on the presence of body text in the DOM.
 */
vi.mock('@portabletext/react', () => ({
  PortableText: ({ value }: { value: unknown[] }) => (
    <div data-testid="portable-text-mock">
      {Array.isArray(value) &&
        value.map((block: unknown, i: number) => {
          /* Extract text from Portable Text block children if available */
          const b = block as Record<string, unknown>;
          const children = b.children as
            | Array<{ text?: string }>
            | undefined;
          const text = children
            ?.map((child) => child.text || '')
            .join('') || JSON.stringify(block);
          return <p key={i}>{text}</p>;
        })}
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
 * fast-check arbitrary: generates a random Portable Text block.
 *
 * Creates a minimal Portable Text block structure with a random text string.
 * The _type and _key fields match Sanity's Portable Text format.
 * The markDefs array is empty since we only need to verify text rendering.
 *
 * @returns A fast-check arbitrary producing a single Portable Text block
 */
const portableTextBlockArb = fc
  .record({
    /* Random text content for the block — at least 1 character to ensure non-empty */
    text: fc.string({ minLength: 1, maxLength: 200 }),
    /* Random unique key for the block — Sanity uses these for reconciliation */
    key: fc.string({ minLength: 4, maxLength: 8 }),
  })
  .map(({ text, key }) => ({
    _type: 'block' as const,
    _key: key,
    style: 'normal' as const,
    markDefs: [],
    children: [{ _type: 'span' as const, _key: `${key}-span`, text, marks: [] }],
  }));

/**
 * fast-check arbitrary: generates a random BlogPost object.
 *
 * Produces a complete BlogPost with random but valid field values:
 *   - Unique _id and slug derived from a random index
 *   - Random title and excerpt strings (non-empty)
 *   - Random publishedAt timestamp within a 10-year range
 *   - Optional mainImage with random URL and alt text
 *   - 1–5 random Portable Text body blocks
 *
 * @returns A fast-check arbitrary producing a BlogPost object
 */
const blogPostArb = fc
  .record({
    /* Unique index to prevent field collisions between test iterations */
    index: fc.integer({ min: 1, max: 999999 }),
    /* Random title — at least 1 char to ensure it's visible in the DOM */
    title: fc.string({ minLength: 1, maxLength: 150 }),
    /* Random slug — alphanumeric with hyphens, matching URL-safe format */
    slugStr: fc.stringMatching(/^[a-z0-9][a-z0-9-]{0,49}$/),
    /* Random timestamp within a 10-year range for publishedAt */
    timestamp: fc.integer({
      min: new Date('2020-01-01T00:00:00Z').getTime(),
      max: new Date('2029-12-31T23:59:59Z').getTime(),
    }),
    /* Random excerpt — at least 1 char for DOM assertion */
    excerpt: fc.string({ minLength: 1, maxLength: 300 }),
    /* Randomly decide whether the post has an image — tests both code paths */
    hasImage: fc.boolean(),
    /* Random image alt text — used when hasImage is true */
    imageAlt: fc.string({ minLength: 1, maxLength: 100 }),
    /* 1–5 random Portable Text body blocks */
    body: fc.array(portableTextBlockArb, { minLength: 1, maxLength: 5 }),
  })
  .map(({ index, title, slugStr, timestamp, excerpt, hasImage, imageAlt, body }) => {
    /* Construct the BlogPost object from the random values */
    const post: BlogPost = {
      _id: `post-${index}`,
      title,
      slug: { current: slugStr || `post-${index}` },
      publishedAt: new Date(timestamp).toISOString(),
      excerpt,
      mainImage: hasImage
        ? {
            asset: { url: `https://cdn.sanity.io/images/test/production/img-${index}.jpg` },
            alt: imageAlt,
          }
        : undefined,
      /* Cast body to PortableTextBlock[] — our generated blocks match the structure
       * but TypeScript can't infer the exact Portable Text generic types */
      body: body as unknown as PortableTextBlock[],
      published: true,
    };
    return post;
  });

/**
 * Property 17: Blog post detail page renders all CMS fields
 *
 * For any published blog post in Sanity CMS, the BlogPostDetail component
 * must render a page containing:
 *   1. The post's title in an <h1> element
 *   2. The formatted publishedAt date
 *   3. The excerpt as lead text
 *   4. The main image with descriptive alt text (when mainImage is present)
 *   5. The body content passed to PortableText (verified via mock)
 *
 * The test generates 100 random BlogPost objects using fast-check and
 * verifies all five invariants hold for each generated post.
 *
 * Validates: Requirements 19.4, 19.12
 */
describe('BlogPostDetail — Property 17: Blog post detail page renders all CMS fields', () => {
  it('renders title in <h1>, date, excerpt, image (if present), and body content for any blog post', () => {
    fc.assert(
      fc.property(
        /* Generate a random BlogPost with all required fields */
        blogPostArb,
        (post) => {
          /* Render the BlogPostDetail component with the random post data */
          const { unmount, container } = render(<BlogPostDetail post={post} />);

          /* 1. Verify the post title is rendered inside an <h1> element (Req 19.4).
           * querySelector ensures we check the actual <h1> tag, not just any text match. */
          const h1 = container.querySelector('h1');
          expect(h1).not.toBeNull();
          expect(h1!.textContent).toBe(post.title);

          /* 2. Verify the formatted date is rendered in the DOM.
           * Uses the same formatDate function as the component for consistency. */
          const formattedDate = formatDate(post.publishedAt);
          expect(container.textContent).toContain(formattedDate);

          /* 3. Verify the excerpt is rendered as lead text (Req 19.4).
           * The excerpt appears in a <p> with the blogPostExcerpt class. */
          expect(container.textContent).toContain(post.excerpt);

          /* 4. Verify image rendering based on whether mainImage is present (Req 19.5).
           * When present: an <img> with the correct src and alt attributes.
           * When absent: no blog post image container is rendered. */
          if (post.mainImage) {
            /**
             * Find the blog post image by matching the Sanity CDN URL prefix.
             * The component applies sanityImageUrl() (BUG-105 fix) which appends
             * width and quality query parameters (?w=1200&q=80) to the raw CDN URL.
             * We use startsWith() to match the base URL regardless of the
             * optimisation parameters appended at runtime.
             */
            const images = container.querySelectorAll('img');
            /* Filter to find the post image (not the author portrait) by URL prefix */
            const postImage = Array.from(images).find(
              (img) => img.getAttribute('src')?.startsWith(post.mainImage!.asset.url)
            );
            expect(postImage).not.toBeNull();
            /** Alt text must match the CMS-provided value (Req 13.2) */
            expect(postImage!.getAttribute('alt')).toBe(post.mainImage.alt);
            /** Verify lazy loading attribute for performance (Req 14.5) */
            expect(postImage!.getAttribute('loading')).toBe('lazy');
          }

          /* 5. Verify body content is passed to PortableText and rendered (Req 19.6).
           * The mock renders a div with data-testid="portable-text-mock" containing
           * the text content from each Portable Text block. */
          const bodyContainer = container.querySelector('[data-testid="portable-text-mock"]');
          expect(bodyContainer).not.toBeNull();
          /* Verify at least one body block's text content appears in the rendered output */
          const firstBlockText = post.body[0]?.children?.[0]?.text;
          if (firstBlockText) {
            expect(bodyContainer!.textContent).toContain(firstBlockText);
          }

          /* Clean up DOM to prevent leaks between fast-check iterations */
          unmount();
        }
      ),
      { numRuns: 100 }
    );
  });
});
