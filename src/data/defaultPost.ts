/**
 * defaultPost.ts — Placeholder blog post used when Sanity CMS is not configured.
 *
 * This shared data file is consumed by:
 *   - `src/components/Blog.tsx` — landing page Blog section fallback
 *   - `src/app/blog/[slug]/page.tsx` — blog detail page fallback
 *
 * Ensures the blog section and detail page are never empty when CMS
 * credentials are missing or placeholder values (Req 5 AC 9).
 *
 * Content mirrors the prototype's featured article so the site looks
 * complete even without a live Sanity connection.
 */

import type { BlogPost } from '@/lib/types';

/**
 * Default/placeholder post displayed when no CMS posts are available.
 * Content mirrors the prototype's featured article to ensure the section
 * is never visually empty (Req 5 AC 9).
 *
 * BUG-121 fix: The body array previously was empty (`[]`), which meant
 * clicking "Read Full Article" would navigate to a detail page with no
 * body content rendered by PortableText. Now includes a meaningful
 * Portable Text paragraph block so the detail page shows useful content.
 */
export const defaultPost: BlogPost = {
  _id: 'placeholder',
  title: 'Why Starting Early Is the Best Financial Decision You\'ll Ever Make',
  slug: { current: 'why-starting-early' },
  publishedAt: '2026-03-25T00:00:00Z',
  excerpt:
    'Time is the most powerful tool in wealth building. In this post, I break down why the decisions you make in your 20s and 30s have an outsized impact on your financial future — and what you can do today to set yourself up for success.',
  /* BUG-121 fix: Provide a meaningful body block instead of an empty array.
   * This Portable Text block renders a "coming soon" paragraph on the
   * detail page when no real CMS posts exist yet. */
  body: [
    {
      _type: 'block',
      _key: 'placeholder-body-1',
      style: 'normal',
      markDefs: [],
      children: [
        {
          _type: 'span',
          _key: 'placeholder-span-1',
          text: 'This blog is coming soon. Stay tuned for insights on wealth building, financial planning, and making smarter decisions with your money. In the meantime, feel free to get in touch if you have any questions about your financial future.',
          marks: [],
        },
      ],
    },
  ],
  published: true,
};
