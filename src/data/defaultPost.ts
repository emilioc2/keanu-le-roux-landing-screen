/**
 * defaultPost.ts — Placeholder blog post used when Sanity CMS is not configured.
 *
 * This shared data file is consumed by:
 *   - `src/components/Blog.tsx` — landing page Blog section fallback
 *   - `src/app/blog/[slug]/page.tsx` — blog detail page fallback
 *
 * Exports a `defaultPosts` array containing only the featured
 * "Gold, Oil, & Your Portfolio" post so the blog section renders a
 * featured article even without a live Sanity connection (Req 5 AC 9).
 * The card grid will not render since there are no remaining posts.
 *
 * Content mirrors the prototype (`prototype/index.html` and `prototype/blog-post.html`)
 * so the site looks complete even without CMS credentials.
 */

import type { BlogPost } from '@/lib/types';

/**
 * Array of placeholder blog posts displayed when Sanity CMS returns no posts.
 *
 * Contains only the featured "Gold, Oil, & Your Portfolio" post with a
 * complete Portable Text body (19 blocks: 4 h2 subheadings + 15 normal
 * paragraphs) matching the full article from the prototype.
 *
 * The array format is preserved (rather than a single object) so consumers
 * (`Blog.tsx`, `blog/[slug]/page.tsx`) can use it consistently without
 * wrapping logic. The card grid simply won't render since `remaining` is empty.
 *
 * Portable Text `_key` values use the `gold-oil-` prefix for debuggability.
 * They are stable strings (not random UUIDs) since this is static placeholder data.
 */
export const defaultPosts: BlogPost[] = [
  /* ──────────────────────────────────────────────────────────────────────────
   * Post 1 (featured): "Gold, Oil, & Your Portfolio"
   * Full article with mainImage and 19 Portable Text body blocks.
   * Matches prototype/blog-post.html content exactly.
   * ────────────────────────────────────────────────────────────────────────── */
  {
    _id: 'placeholder-gold-oil',
    title: 'Gold, Oil, & Your Portfolio',
    slug: { current: 'gold-oil-and-your-portfolio' },
    publishedAt: '2026-04-09T00:00:00Z',
    excerpt:
      'You may have noticed something strange lately: gold prices have fallen sharply even as the Middle East conflict has intensified. Normally, war drives gold up. So, what\'s going on? The short answer is oil.',
    /** Unsplash commodity image — gold bars representing the article topic */
    mainImage: {
      asset: { url: 'https://images.unsplash.com/photo-1610375461246-83df859d849d?w=700&q=75' },
      alt: 'Gold bars and oil barrels representing commodity market dynamics',
    },
    /**
     * Full article body — 19 Portable Text blocks matching prototype/blog-post.html.
     * Block sequence: 4 h2 subheadings interspersed with 15 normal paragraphs.
     * Keys use pattern `gold-oil-{n}` for blocks, `gold-oil-span-{n}` for spans,
     * where n is the 1-based block index.
     */
    body: [
      /** Block 1: Opening hook — gold prices falling despite conflict */
      {
        _type: 'block',
        _key: 'gold-oil-1',
        style: 'normal',
        markDefs: [],
        children: [
          {
            _type: 'span',
            _key: 'gold-oil-span-1',
            text: 'You may have noticed something strange lately: gold prices have fallen sharply even as the Middle East conflict has intensified. Normally, war drives gold up. So, what\u2019s going on?',
            marks: [],
          },
        ],
      },
      /** Block 2: Short answer — oil */
      {
        _type: 'block',
        _key: 'gold-oil-2',
        style: 'normal',
        markDefs: [],
        children: [
          {
            _type: 'span',
            _key: 'gold-oil-span-2',
            text: 'The short answer is oil.',
            marks: [],
          },
        ],
      },
      /** Block 3: Section heading — The Oil-Gold Connection */
      {
        _type: 'block',
        _key: 'gold-oil-3',
        style: 'h2',
        markDefs: [],
        children: [
          {
            _type: 'span',
            _key: 'gold-oil-span-3',
            text: 'The Oil-Gold Connection',
            marks: [],
          },
        ],
      },
      /** Block 4: How oil disruption forces dollar demand and gold liquidation */
      {
        _type: 'block',
        _key: 'gold-oil-4',
        style: 'normal',
        markDefs: [],
        children: [
          {
            _type: 'span',
            _key: 'gold-oil-span-4',
            text: 'The Iran war has disrupted oil flows in one of the world\u2019s most critical regions. Countries like Turkey and several Gulf states rely heavily on imported energy, and they pay for that oil in US dollars. With oil prices spiking, their dollar bills have skyrocketed. At the same time, their oil exports (and therefore their dollar income) have dropped.',
            marks: [],
          },
        ],
      },
      /** Block 5: Transition — tight spot */
      {
        _type: 'block',
        _key: 'gold-oil-5',
        style: 'normal',
        markDefs: [],
        children: [
          {
            _type: 'span',
            _key: 'gold-oil-span-5',
            text: 'That leaves them in a tight spot.',
            marks: [],
          },
        ],
      },
      /** Block 6: Forced gold selling to raise dollars */
      {
        _type: 'block',
        _key: 'gold-oil-6',
        style: 'normal',
        markDefs: [],
        children: [
          {
            _type: 'span',
            _key: 'gold-oil-span-6',
            text: 'To get the dollars they urgently need \u2014 for food, military spending, and to keep their currencies stable \u2014 these countries are being forced to sell gold. Not because they want to, but because they have no other choice.',
            marks: [],
          },
        ],
      },
      /** Block 7: Turkey example — 58 tons liquidated */
      {
        _type: 'block',
        _key: 'gold-oil-7',
        style: 'normal',
        markDefs: [],
        children: [
          {
            _type: 'span',
            _key: 'gold-oil-span-7',
            text: 'For example, Turkey reportedly liquidated around 58 tons of gold in just two weeks. There are also strong indications that other countries may be quietly selling gold reserves to raise liquidity. This kind of forced selling is a major reason why gold has dropped so sharply from its peak.',
            marks: [],
          },
        ],
      },
      /** Block 8: Section heading — Russia's Gold Export Restrictions */
      {
        _type: 'block',
        _key: 'gold-oil-8',
        style: 'h2',
        markDefs: [],
        children: [
          {
            _type: 'span',
            _key: 'gold-oil-span-8',
            text: 'Russia\u2019s Gold Export Restrictions',
            marks: [],
          },
        ],
      },
      /** Block 9: Transition to Russia factor */
      {
        _type: 'block',
        _key: 'gold-oil-9',
        style: 'normal',
        markDefs: [],
        children: [
          {
            _type: 'span',
            _key: 'gold-oil-span-9',
            text: 'And there\u2019s another important factor developing in the background.',
            marks: [],
          },
        ],
      },
      /** Block 10: Russia's new 100g export limit */
      {
        _type: 'block',
        _key: 'gold-oil-10',
        style: 'normal',
        markDefs: [],
        children: [
          {
            _type: 'span',
            _key: 'gold-oil-span-10',
            text: 'Russia, the world\u2019s second-largest gold producer, is introducing new restrictions on gold exports. From May 1, individuals will be limited to taking just 100 grams of gold out of the country, as part of a broader effort to clamp down on capital flight and the shadow economy.',
            marks: [],
          },
        ],
      },
      /** Block 11: Section heading — What Does This Mean for the Gold Price? */
      {
        _type: 'block',
        _key: 'gold-oil-11',
        style: 'h2',
        markDefs: [],
        children: [
          {
            _type: 'span',
            _key: 'gold-oil-span-11',
            text: 'What Does This Mean for the Gold Price?',
            marks: [],
          },
        ],
      },
      /** Block 12: Short-term downward pressure from pre-deadline selling */
      {
        _type: 'block',
        _key: 'gold-oil-12',
        style: 'normal',
        markDefs: [],
        children: [
          {
            _type: 'span',
            _key: 'gold-oil-span-12',
            text: 'In the short term, it could add further downward pressure. With the new rules coming into effect soon, there may be a rush to sell gold before the deadline, increasing supply in the market at exactly the wrong time.',
            marks: [],
          },
        ],
      },
      /** Block 13: Continued volatility expected */
      {
        _type: 'block',
        _key: 'gold-oil-13',
        style: 'normal',
        markDefs: [],
        children: [
          {
            _type: 'span',
            _key: 'gold-oil-span-13',
            text: 'So over the next few weeks, we could continue to see volatility and even further weakness in the gold price.',
            marks: [],
          },
        ],
      },
      /** Block 14: Transition to long-term outlook */
      {
        _type: 'block',
        _key: 'gold-oil-14',
        style: 'normal',
        markDefs: [],
        children: [
          {
            _type: 'span',
            _key: 'gold-oil-span-14',
            text: 'But this is where the longer-term picture becomes important.',
            marks: [],
          },
        ],
      },
      /** Block 15: Long-term reversal — central banks rebuilding reserves */
      {
        _type: 'block',
        _key: 'gold-oil-15',
        style: 'normal',
        markDefs: [],
        children: [
          {
            _type: 'span',
            _key: 'gold-oil-span-15',
            text: 'Once the immediate pressures of the war ease, the dynamic is likely to reverse. Central banks and governments that have been forced to sell gold will need to rebuild their reserves. At the same time, structural drivers like high global debt, persistent inflation, and currency uncertainty remain firmly in place.',
            marks: [],
          },
        ],
      },
      /** Block 16: Historical pattern — bull runs follow forced selling */
      {
        _type: 'block',
        _key: 'gold-oil-16',
        style: 'normal',
        markDefs: [],
        children: [
          {
            _type: 'span',
            _key: 'gold-oil-span-16',
            text: 'That combination \u2014 reduced forced selling and renewed institutional buying \u2014 has historically led to strong bull runs in gold.',
            marks: [],
          },
        ],
      },
      /** Block 17: Section heading — What Does This Mean for You? */
      {
        _type: 'block',
        _key: 'gold-oil-17',
        style: 'h2',
        markDefs: [],
        children: [
          {
            _type: 'span',
            _key: 'gold-oil-span-17',
            text: 'What Does This Mean for You?',
            marks: [],
          },
        ],
      },
      /** Block 18: Practical takeaway — volatility creates entry points */
      {
        _type: 'block',
        _key: 'gold-oil-18',
        style: 'normal',
        markDefs: [],
        children: [
          {
            _type: 'span',
            _key: 'gold-oil-span-18',
            text: 'If you have exposure to gold \u2014 whether through physical gold, gold ETFs, or mining shares \u2014 this volatility cuts both ways. In the short term, prices may remain under pressure. But for long-term investors, periods like this have often created attractive entry points.',
            marks: [],
          },
        ],
      },
      /** Block 19: Closing summary — gold setting up for next move higher */
      {
        _type: 'block',
        _key: 'gold-oil-19',
        style: 'normal',
        markDefs: [],
        children: [
          {
            _type: 'span',
            _key: 'gold-oil-span-19',
            text: 'In simple terms: gold may be under pressure now, but it could be setting up for its next major move higher.',
            marks: [],
          },
        ],
      },
    ],
    /** Post is published and visible in the blog section */
    published: true,
  },
];
