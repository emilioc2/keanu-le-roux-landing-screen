/**
 * Blog.unit.test.tsx — Unit tests for the Blog / Insights section component.
 *
 * Verifies the key behaviours specified in Requirements 5.1–5.9:
 *   - Placeholder/default post renders when no CMS posts are available (Req 5.9)
 *   - Featured post is the most recent published post (Req 5.8)
 *   - Blog cards have the correct CSS class for hover effect (Req 5.6)
 *   - Card and featured article links point to correct /blog/[slug] URLs
 *
 * ScrollReveal is mocked because jsdom doesn't support IntersectionObserver.
 *
 * Addresses: BUG-066 (missing unit tests for Blog section)
 *
 * @module Blog.unit.test
 * @requirements 5.1–5.9
 */

import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, within, cleanup } from '@testing-library/react';
import Blog, { formatDate } from '../Blog';
import type { BlogPost } from '@/lib/types';

/**
 * Mock ScrollReveal — replaces the IntersectionObserver-based wrapper
 * with a simple pass-through div. jsdom doesn't support IntersectionObserver,
 * so we bypass the animation logic and only verify rendered content.
 */
vi.mock('@/components/ScrollReveal', () => ({
  default: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="scroll-reveal" className={className}>
      {children}
    </div>
  ),
}));

afterEach(() => {
  /** Clean up rendered DOM between tests to prevent node leaks */
  cleanup();
});

/**
 * Creates a mock BlogPost with deterministic field values.
 * Accepts partial overrides so each test can customise only the
 * fields relevant to its assertion.
 *
 * @param overrides - Partial BlogPost fields to override defaults.
 *   Must include `_id` to ensure unique document identity.
 * @returns A fully populated BlogPost object
 */
function makeBlogPost(overrides: Partial<BlogPost> & { _id: string }): BlogPost {
  return {
    title: 'Default Title',
    slug: { current: 'default-slug' },
    publishedAt: '2026-01-01T00:00:00Z',
    excerpt: 'Default excerpt text.',
    body: [],
    published: true,
    ...overrides,
  };
}

/* =====================================================================
 * Placeholder rendering when no posts (Req 5.9)
 *
 * If the CMS returns no posts, the Blog section must display a
 * default/placeholder post so the section is never visually empty.
 * ===================================================================== */
describe('Blog — Placeholder rendering when no posts', () => {
  it('renders a default placeholder post when posts array is empty', () => {
    render(<Blog posts={[]} />);

    /**
     * The component's internal defaultPost has this title.
     * Verifying it appears confirms the fallback logic works.
     */
    expect(
      screen.getByText(/Why Starting Early Is the Best Financial Decision/)
    ).toBeTruthy();
  });

  it('renders the featured article section even with no CMS posts', () => {
    render(<Blog posts={[]} />);
    const featured = screen.getByTestId('blog-featured');
    /** Featured article must always be present — section is never empty */
    expect(featured).toBeTruthy();
  });
});

/* =====================================================================
 * Featured post is most recent (Req 5.8)
 *
 * The featured article must display the first post in the array,
 * which is the most recent (posts arrive pre-sorted by publishedAt desc
 * from the GROQ query in page.tsx).
 * ===================================================================== */
describe('Blog — Featured post is most recent', () => {
  it('displays the first (most recent) post as the featured article', () => {
    /** Create two posts with distinct dates — newest first in the array */
    const newestPost = makeBlogPost({
      _id: 'newest',
      title: 'Newest Post Title',
      slug: { current: 'newest-post' },
      publishedAt: '2026-06-01T00:00:00Z',
    });
    const olderPost = makeBlogPost({
      _id: 'older',
      title: 'Older Post Title',
      slug: { current: 'older-post' },
      publishedAt: '2026-01-01T00:00:00Z',
    });

    /** Posts are pre-sorted newest first by the GROQ query */
    render(<Blog posts={[newestPost, olderPost]} />);

    const featured = screen.getByTestId('blog-featured');
    /** The featured article should contain the newest post's title */
    expect(within(featured).getByText('Newest Post Title')).toBeTruthy();
  });

  it('shows the featured article link pointing to the correct slug', () => {
    const post = makeBlogPost({
      _id: 'featured-test',
      title: 'Featured Link Test',
      slug: { current: 'featured-link-test' },
    });

    render(<Blog posts={[post]} />);

    const featured = screen.getByTestId('blog-featured');
    const link = within(featured).getByText('Read Full Article →');
    /** Link must route to the blog detail page for this post's slug */
    expect(link.getAttribute('href')).toBe('/blog/featured-link-test');
  });
});

/* =====================================================================
 * Blog card hover class (Req 5.6, Req 12.2)
 *
 * Each blog card must have the CSS Module class that enables the
 * hover lift effect (translateY(-3px) + box-shadow). In the test
 * environment, CSS Module class names are identity-mapped, so
 * "blogCard" appears directly in the className string.
 * ===================================================================== */
describe('Blog — Card hover class', () => {
  it('blog cards have the blogCard CSS class for hover styling', () => {
    /** Two posts: first becomes featured, second becomes a card */
    const posts = [
      makeBlogPost({ _id: 'p1', title: 'Post One', slug: { current: 'post-one' }, publishedAt: '2026-06-01T00:00:00Z' }),
      makeBlogPost({ _id: 'p2', title: 'Post Two', slug: { current: 'post-two' }, publishedAt: '2026-01-01T00:00:00Z' }),
    ];

    render(<Blog posts={posts} />);

    const cards = screen.getAllByTestId('blog-card');
    /** Each card's <article> should have the blogCard class for hover transitions */
    cards.forEach((card) => {
      expect(card.className).toContain('blogCard');
    });
  });
});

/* =====================================================================
 * Link hrefs (Req 5.5)
 *
 * Blog card "Read More →" links must point to /blog/[slug] for
 * navigation to the individual blog post detail page.
 * ===================================================================== */
describe('Blog — Link hrefs', () => {
  it('card "Read More →" links point to /blog/[slug]', () => {
    /** First post is featured; second post renders as a card */
    const posts = [
      makeBlogPost({ _id: 'p1', title: 'Featured', slug: { current: 'featured' }, publishedAt: '2026-06-01T00:00:00Z' }),
      makeBlogPost({ _id: 'p2', title: 'Card Post', slug: { current: 'card-post' }, publishedAt: '2026-01-01T00:00:00Z' }),
    ];

    render(<Blog posts={posts} />);

    const cards = screen.getAllByTestId('blog-card');
    const link = within(cards[0]).getByText('Read More →');
    /** Each card link must route to the individual blog post detail page */
    expect(link.getAttribute('href')).toBe('/blog/card-post');
  });

  it('renders formatted date labels on cards', () => {
    const posts = [
      makeBlogPost({ _id: 'p1', title: 'Featured', slug: { current: 'featured' }, publishedAt: '2026-06-15T00:00:00Z' }),
      makeBlogPost({ _id: 'p2', title: 'Card', slug: { current: 'card' }, publishedAt: '2026-03-25T00:00:00Z' }),
    ];

    render(<Blog posts={posts} />);

    /** Verify the date is formatted using the same formatDate helper as the component */
    const expectedDate = formatDate('2026-03-25T00:00:00Z');
    const cards = screen.getAllByTestId('blog-card');
    expect(within(cards[0]).getByText(expectedDate)).toBeTruthy();
  });
});
