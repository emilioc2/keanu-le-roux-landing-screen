/**
 * Blog.tsx — Blog / Insights section for the landing page.
 *
 * Server Component that receives pre-fetched blog posts from page.tsx.
 * Displays a featured article (most recent post) in a two-column layout,
 * followed by remaining posts in a card grid with scroll-reveal animations.
 *
 * If no posts are available from the CMS, a placeholder/default post is shown
 * so the section is never empty (Req 5 AC 9).
 *
 * Requirements: 5.1–5.9, 12.1, 12.2, 14.5
 * Visual source: prototype/index.html (.blog section)
 */

import type { BlogPost } from '@/lib/types';
/**
 * BUG-105 fix: Import sanityImageUrl to optimise CMS images with width/quality
 * parameters, reducing payload size for faster page loads.
 */
import { sanityImageUrl } from '@/lib/sanity';
/**
 * BUG-119 fix: Import Next.js Link component for client-side navigation
 * to blog detail pages (/blog/[slug]). Using Link instead of plain <a>
 * enables route prefetching and avoids full page reloads when navigating
 * between the landing page and individual blog posts.
 */
import Link from 'next/link';
/**
 * Shared placeholder post data — used as fallback when Sanity CMS returns
 * no posts, ensuring the Blog section is never visually empty (Req 5 AC 9).
 * Extracted to a shared module so the blog detail page can reuse the same
 * data when Sanity is not configured.
 */
/* Copy-changes: import plural defaultPosts array (was singular defaultPost) */
import { defaultPosts } from '@/data/defaultPost';
import ScrollReveal from '@/components/ScrollReveal';
import styles from './Blog.module.css';

/**
 * Props passed from page.tsx after Sanity CMS fetch.
 * Posts are pre-sorted by publishedAt descending (newest first).
 */
export interface BlogSectionProps {
  /** Array of published blog posts, sorted by publishedAt descending */
  posts: BlogPost[];
}

/**
 * Formats an ISO 8601 date string into a human-readable format.
 * Example: "2026-03-25T00:00:00Z" → "March 25, 2026"
 *
 * @param dateStr - ISO 8601 datetime string from Sanity CMS
 * @returns Formatted date string in "Month Day, Year" format
 */
export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Blog — Landing page Insights section (Server Component).
 *
 * Renders the featured article (posts[0], the most recent published post)
 * in a prominent two-column layout, then displays remaining posts as cards
 * in a responsive grid. Each card is wrapped in ScrollReveal for fade-in
 * animation on scroll entry (Req 12 AC 1).
 *
 * This is a Server Component — no 'use client' directive needed. It receives
 * posts as props from page.tsx which handles the Sanity CMS data fetch.
 *
 * @param props.posts - Published blog posts sorted by publishedAt descending
 * @returns JSX for the Blog / Insights section
 */
export default function Blog({ posts }: BlogSectionProps) {
  /**
   * Fall back to a default placeholder post if CMS returns no posts.
   * This ensures the section is never visually empty (Req 5 AC 9).
   */
  /* Fall back to the full defaultPosts array (3 posts) instead of wrapping
   * a single post in an array — provides featured + 2 card posts (Req 5 AC 9). */
  const displayPosts = posts.length > 0 ? posts : defaultPosts;

  /**
   * The featured article is always the first (most recent) post.
   * Posts arrive pre-sorted by publishedAt desc from the GROQ query,
   * so posts[0] is guaranteed to be the most recent (Req 5 AC 8).
   */
  const featured = displayPosts[0];

  /** Remaining posts displayed in the card grid below the featured article */
  const remaining = displayPosts.slice(1);

  return (
    <section id="blog" className={styles.blog}>
      <div className="container">
        {/* Section heading — uses shared .section-heading class from globals.css.
         * BUG-067 fix: subtitle text now matches the prototype exactly (Req 5 AC 1). */}
        <div className="section-heading">
          <h2>Latest Insights</h2>
          <p>Thoughts, tips and updates from my desk to yours.</p>
        </div>

        {/* Featured article — two-column layout: image left, content right (Req 5 AC 2, AC 3).
         * data-testid enables targeted querying in property tests. */}
        <article className={styles.blogFeatured} data-testid="blog-featured">
          <div className={styles.blogFeaturedImage}>
            {featured.mainImage ? (
              /*
               * BUG-105 fix: Use sanityImageUrl() for optimised CMS image delivery.
               * Featured images use 1200px width and 80% quality for high-fidelity
               * rendering in the prominent two-column layout. This appends ?w=1200&q=80
               * to the Sanity CDN URL, reducing payload without visible quality loss.
               * Also applies descriptive alt text (Req 13.2) and lazy loading (Req 14.5).
               */
              <img
                src={sanityImageUrl(featured.mainImage.asset.url, 1200, 80)}
                alt={featured.mainImage.alt || featured.title}
                loading="lazy"
              />
            ) : (
              /* Grey placeholder background shown when post has no mainImage.
               * The parent div already has background: var(--gray-100). */
              <span>Featured Image</span>
            )}
          </div>
          <div className={styles.blogFeaturedContent}>
            {/* Date label — uppercase, small, grey text (Req 5 AC 3) */}
            <span className={styles.blogDate}>{formatDate(featured.publishedAt)}</span>
            <h3>{featured.title}</h3>
            <p>{featured.excerpt}</p>
            {/*
             * BUG-119 fix: Use Next.js Link for internal /blog/[slug] route
             * navigation instead of plain <a> tag. Link enables prefetching
             * and client-side transitions to the blog detail page, which is
             * the Next.js best practice for all internal routes.
             */}
            <Link href={`/blog/${featured.slug.current}`} className={styles.blogLink}>
              Read Full Article →
            </Link>
          </div>
        </article>

        {/* Blog card grid — remaining posts in 2-column layout (Req 5 AC 4).
         * Only rendered when there are posts beyond the featured one. */}
        {remaining.length > 0 && (
          <div className={styles.blogGrid}>
            {remaining.map((post) => (
              /* Each card wrapped in ScrollReveal for fade-in animation (Req 12 AC 1).
               * Key uses Sanity document _id for stable React reconciliation. */
              <ScrollReveal key={post._id}>
                <article className={styles.blogCard} data-testid="blog-card">
                  {/* Card image — 200px tall with grey fallback for missing images */}
                  <div className={styles.blogCardImage}>
                    {post.mainImage ? (
                      /* BUG-105 fix: optimise CMS card images at 800px/75% quality */
                      <img
                        src={sanityImageUrl(post.mainImage.asset.url, 800, 75)}
                        alt={post.mainImage.alt || post.title}
                        loading="lazy"
                      />
                    ) : (
                      /* Placeholder text shown when post has no mainImage.
                       * Parent div provides the grey background. */
                      <span>Blog Image</span>
                    )}
                  </div>
                  {/* Card content: date, title, excerpt, read more link (Req 5 AC 5) */}
                  <div className={styles.blogCardContent}>
                    <span className={styles.blogDate}>{formatDate(post.publishedAt)}</span>
                    <h4>{post.title}</h4>
                    <p>{post.excerpt}</p>
                    {/*
                     * BUG-119 fix: Use Next.js Link for internal /blog/[slug]
                     * route navigation instead of plain <a> tag. Link enables
                     * route prefetching and client-side transitions, avoiding
                     * full page reloads when navigating to blog detail pages.
                     */}
                    <Link href={`/blog/${post.slug.current}`} className={styles.blogLink}>
                      Read More →
                    </Link>
                  </div>
                </article>
              </ScrollReveal>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
