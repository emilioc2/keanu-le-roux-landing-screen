/**
 * BlogPostDetail.unit.test.tsx — Unit tests for the BlogPostDetail component.
 *
 * Verifies the key behaviours specified in Requirements 19.1–19.12:
 *   - Back link href points to /#blog (Req 19.3)
 *   - Author bio contains name "Keanu Le Roux" and title "Financial Advisor" (Req 19.8)
 *   - CTA button href points to /#contact (Req 19.7)
 *   - Portable Text body content is rendered via mock (Req 19.6)
 *   - Post title, date, and excerpt are displayed in the header (Req 19.4)
 *   - Post image rendering with and without mainImage (Req 19.5)
 *
 * PortableText is mocked because the real @portabletext/react renderer
 * requires a full Sanity context that isn't available in jsdom.
 *
 * Addresses: BUG-082 (missing unit tests for BlogPostDetail)
 *
 * @module BlogPostDetail.unit.test
 * @requirements 19.1–19.12
 */

import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import BlogPostDetail, { formatDate } from '../BlogPostDetail';
import type { BlogPost } from '@/lib/types';
import type { PortableTextBlock } from '@portabletext/react';

/**
 * Mock @portabletext/react — replaces the real PortableText renderer
 * with a simple div that extracts and renders text from block children.
 * This lets us verify body content is passed through without needing
 * the full Sanity Portable Text rendering pipeline.
 */
vi.mock('@portabletext/react', () => ({
  PortableText: ({ value }: { value: unknown[] }) => (
    <div data-testid="portable-text-mock">
      {Array.isArray(value) &&
        value.map((block: unknown, i: number) => {
          /** Extract text from Portable Text block children if available */
          const b = block as Record<string, unknown>;
          const children = b.children as Array<{ text?: string }> | undefined;
          const text =
            children?.map((child) => child.text || '').join('') ||
            JSON.stringify(block);
          return <p key={i}>{text}</p>;
        })}
    </div>
  ),
}));

afterEach(() => {
  /** Clean up rendered DOM between tests to prevent node leaks */
  cleanup();
});

/**
 * Creates a complete mock BlogPost for testing.
 *
 * Includes all required fields with realistic test data,
 * including a Portable Text body block with extractable text.
 * Used as the baseline post for most tests — individual tests
 * override specific fields when needed.
 *
 * @returns A fully populated BlogPost object
 */
function createMockPost(): BlogPost {
  return {
    _id: 'test-post-1',
    title: 'Test Blog Post Title',
    slug: { current: 'test-blog-post' },
    publishedAt: '2026-03-25T00:00:00Z',
    excerpt: 'This is the test excerpt for the blog post.',
    mainImage: {
      asset: { url: 'https://cdn.sanity.io/images/test/production/test.jpg' },
      alt: 'Test image alt text',
    },
    /** Single Portable Text block with extractable text for mock rendering */
    body: [
      {
        _type: 'block',
        _key: 'block1',
        style: 'normal',
        markDefs: [],
        children: [
          { _type: 'span', _key: 'span1', text: 'This is the body content.', marks: [] },
        ],
      },
    ] as unknown as PortableTextBlock[],
    published: true,
  };
}

/* =====================================================================
 * Back link href (Req 19.3)
 *
 * The "← Back to Insights" link must navigate to the Blog section
 * on the landing page via /#blog.
 * ===================================================================== */
describe('BlogPostDetail — Back link', () => {
  it('renders "← Back to Insights" link pointing to /#blog', () => {
    render(<BlogPostDetail post={createMockPost()} />);
    const backLink = screen.getByText('← Back to Insights');

    /** Back link navigates to the Blog/Insights section on the landing page */
    expect(backLink.getAttribute('href')).toBe('/#blog');
  });
});

/* =====================================================================
 * Author bio content (Req 19.8)
 *
 * The author bio section must display the author's name, title,
 * and a circular portrait image with descriptive alt text.
 * ===================================================================== */
describe('BlogPostDetail — Author bio', () => {
  it('displays author name "Keanu Le Roux"', () => {
    render(<BlogPostDetail post={createMockPost()} />);
    /** Author name must be visible in the bio section */
    expect(screen.getByText('Keanu Le Roux')).toBeTruthy();
  });

  it('displays author title "Financial Advisor"', () => {
    render(<BlogPostDetail post={createMockPost()} />);
    /** Author title appears below the name in italic serif */
    expect(screen.getByText('Financial Advisor')).toBeTruthy();
  });

  it('renders author portrait image with alt text', () => {
    const { container } = render(<BlogPostDetail post={createMockPost()} />);

    /** Find the author portrait by its static src path */
    const authorImg = container.querySelector('img[src="/keanu.jpg"]');
    expect(authorImg).not.toBeNull();
    /** Alt text must describe the person in the image */
    expect(authorImg!.getAttribute('alt')).toBe('Keanu Le Roux');
  });
});

/* =====================================================================
 * CTA button href (Req 19.7)
 *
 * The "Get In Touch" CTA button at the bottom of the post must
 * link to the contact section on the landing page via /#contact.
 * ===================================================================== */
describe('BlogPostDetail — CTA button', () => {
  it('"Get In Touch" button links to /#contact', () => {
    render(<BlogPostDetail post={createMockPost()} />);
    const ctaButton = screen.getByText('Get In Touch');

    /** CTA navigates back to the landing page contact form */
    expect(ctaButton.getAttribute('href')).toBe('/#contact');
  });
});

/* =====================================================================
 * Portable Text rendering (Req 19.6)
 *
 * The body content must be rendered via PortableText. Our mock
 * renders the text content from each block, so we verify the
 * body text appears in the DOM.
 * ===================================================================== */
describe('BlogPostDetail — Portable Text body', () => {
  it('renders body content via PortableText', () => {
    render(<BlogPostDetail post={createMockPost()} />);

    /** The mock PortableText renders a div with data-testid */
    const bodyContainer = screen.getByTestId('portable-text-mock');
    expect(bodyContainer).toBeTruthy();

    /** Verify the body text content appears in the rendered output */
    expect(bodyContainer.textContent).toContain('This is the body content.');
  });
});

/* =====================================================================
 * Post header content (Req 19.4)
 *
 * The post header must display the title in an <h1>, the formatted
 * date, and the excerpt as lead text.
 * ===================================================================== */
describe('BlogPostDetail — Post header', () => {
  it('renders the post title in an <h1> element', () => {
    const { container } = render(<BlogPostDetail post={createMockPost()} />);
    const h1 = container.querySelector('h1');

    /** The post title must be the primary heading on the page */
    expect(h1).not.toBeNull();
    expect(h1!.textContent).toBe('Test Blog Post Title');
  });

  it('renders the formatted publication date', () => {
    render(<BlogPostDetail post={createMockPost()} />);
    /** formatDate converts ISO string to "Month Day, Year" format */
    const expectedDate = formatDate('2026-03-25T00:00:00Z');

    /** Date label should be formatted consistently with the Blog section */
    expect(screen.getByText(expectedDate)).toBeTruthy();
  });

  it('renders the excerpt text', () => {
    render(<BlogPostDetail post={createMockPost()} />);

    /** Excerpt appears as lead text below the title (Req 19.4) */
    expect(
      screen.getByText('This is the test excerpt for the blog post.')
    ).toBeTruthy();
  });
});

/* =====================================================================
 * Post image (Req 19.5)
 *
 * When a post has a mainImage, it should be rendered with the
 * correct src, alt, and loading attributes. When absent, only
 * the author portrait should remain.
 * ===================================================================== */
describe('BlogPostDetail — Post image', () => {
  it('renders the main image when present with correct attributes', () => {
    const { container } = render(<BlogPostDetail post={createMockPost()} />);

    /**
     * Find the post image by matching the Sanity CDN URL prefix.
     * The component applies sanityImageUrl() (BUG-105 fix) which appends
     * ?w=1200&q=80 query parameters to the raw CDN URL. We use the CSS
     * attribute prefix selector (^=) to match the base URL regardless of
     * the optimisation query params appended at runtime.
     */
    const postImg = container.querySelector(
      'img[src^="https://cdn.sanity.io/images/test/production/test.jpg"]'
    );
    expect(postImg).not.toBeNull();
    /** Alt text must match the CMS-provided value (Req 13.2) */
    expect(postImg!.getAttribute('alt')).toBe('Test image alt text');
    /** Below-fold images must use lazy loading for performance (Req 14.5) */
    expect(postImg!.getAttribute('loading')).toBe('lazy');
  });

  it('does not render image container when mainImage is absent', () => {
    /** Create a post without mainImage to test the conditional rendering path */
    const postWithoutImage = { ...createMockPost(), mainImage: undefined };
    const { container } = render(<BlogPostDetail post={postWithoutImage} />);

    /**
     * When no mainImage exists, the image container div should not
     * be rendered at all. Only the author portrait should remain.
     */
    const images = container.querySelectorAll('img');
    expect(images.length).toBe(1);
    /** The only remaining image should be the author portrait */
    expect(images[0].getAttribute('src')).toBe('/keanu.jpg');
  });
});
