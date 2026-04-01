/**
 * BlogPostDetail — Server Component for rendering a full blog post.
 *
 * Displays the complete blog post content on the detail page (/blog/[slug]).
 * Receives a pre-fetched BlogPost object from the page route and renders:
 *   - "← Back to Insights" navigation link
 *   - Post header: date label, h1 title, excerpt as lead text
 *   - Full-width hero image (if present, with descriptive alt text)
 *   - Rich text body via PortableText (paragraphs, h2, ul)
 *   - CTA block with motivational text and "Get In Touch" button
 *   - Author bio with circular portrait, name, and title
 *
 * This is a Server Component — no 'use client' directive needed.
 * All content is passed as props from the page route which handles
 * the Sanity CMS data fetch.
 *
 * @module BlogPostDetail
 * @requirements 19.3–19.9
 * @see prototype/blog-post.html — visual source of truth
 * @see prototype/styles.css — .blog-post-* classes
 */

import { PortableText } from '@portabletext/react';
/**
 * BUG-097 fix: Import Next.js Link for client-side navigation on internal routes.
 * Using Link instead of <a> enables prefetching and avoids full page reloads
 * when navigating back to the landing page sections (/#blog, /#contact).
 */
import Link from 'next/link';
import type { BlogPost } from '@/lib/types';
/**
 * BUG-105 fix: Import sanityImageUrl to apply width/quality optimisation
 * parameters to CMS-hosted images, reducing payload size for faster loads.
 */
import { sanityImageUrl } from '@/lib/sanity';
import styles from './BlogPostDetail.module.css';

/**
 * Props for the BlogPostDetail component.
 *
 * @property post - The full blog post object fetched from Sanity CMS,
 *   including body content in Portable Text format.
 */
interface BlogPostDetailProps {
  post: BlogPost;
}

/**
 * Formats an ISO 8601 date string into a human-readable format.
 * Example: "2026-03-25T00:00:00Z" → "March 25, 2026"
 *
 * Uses the same format as the Blog section's formatDate for consistency.
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
 * Custom Portable Text serializers for rendering Sanity rich text content.
 *
 * Maps Portable Text block types to semantic HTML elements with the
 * appropriate CSS Module classes. Supports:
 *   - Normal paragraphs → <p>
 *   - H2 subheadings → <h2> (Playfair Display, navy)
 *   - Bullet lists → <ul> with disc markers
 *   - List items → <li>
 *
 * These serializers ensure the rendered body content matches the
 * prototype's .blog-post-body typography (Req 19.6).
 */
const portableTextComponents = {
  block: {
    /** Normal paragraphs — default body text styling */
    normal: ({ children }: { children?: React.ReactNode }) => <p>{children}</p>,
    /** H2 subheadings — Playfair Display, navy, with top margin */
    h2: ({ children }: { children?: React.ReactNode }) => <h2>{children}</h2>,
  },
  list: {
    /** Bullet lists — disc markers with left padding */
    bullet: ({ children }: { children?: React.ReactNode }) => <ul>{children}</ul>,
  },
  listItem: {
    /** Bullet list items — same typography as body paragraphs */
    bullet: ({ children }: { children?: React.ReactNode }) => <li>{children}</li>,
  },
};

/**
 * BlogPostDetail — renders the full content of a single blog post.
 *
 * Layout order matches the prototype (blog-post.html):
 * 1. Back link → /#blog
 * 2. Header: date, h1 title, excerpt
 * 3. Full-width image (conditional — only if post has mainImage)
 * 4. Body content via PortableText
 * 5. CTA block: motivational text + "Get In Touch" button → /#contact
 * 6. Author bio: circular portrait, name "Keanu Le Roux", title "Financial Advisor"
 *
 * @param props.post - The full BlogPost object from Sanity CMS
 * @returns JSX for the blog post detail article
 */
export default function BlogPostDetail({ post }: BlogPostDetailProps) {
  return (
    <article className={styles.blogPost}>
      <div className="container">
        {/* BUG-097 fix: Use Next.js Link for internal navigation back to the
         * landing page Blog section. Link enables client-side transitions
         * and prefetching instead of a full page reload (Req 19.3). */}
        <Link href="/#blog" className={styles.blogPostBack}>
          ← Back to Insights
        </Link>

        {/* Post header — date label, title, and excerpt lead text (Req 19.4) */}
        <header className={styles.blogPostHeader}>
          {/* Date label — uppercase, small, grey text matching prototype .blog-date */}
          <span className={styles.blogDate}>{formatDate(post.publishedAt)}</span>
          {/* Post title — Playfair Display h1, the primary heading for the page */}
          <h1>{post.title}</h1>
          {/* Excerpt — styled as lead text below the title */}
          <p className={styles.blogPostExcerpt}>{post.excerpt}</p>
        </header>

        {/* Full-width post image — only rendered when the post has a mainImage (Req 19.5).
         * BUG-105 fix: Uses sanityImageUrl() to append ?w=1200&q=80 to the Sanity CDN URL,
         * optimising image delivery for the full-width detail page layout (Req 14.1).
         * Uses loading="lazy" for performance (Req 14.5) and descriptive alt text (Req 13.2). */}
        {post.mainImage && (
          <div className={styles.blogPostImage}>
            <img
              src={sanityImageUrl(post.mainImage.asset.url, 1200, 80)}
              alt={post.mainImage.alt || post.title}
              loading="lazy"
            />
          </div>
        )}

        {/* Rich text body — rendered via PortableText with custom serializers (Req 19.6).
         * Supports paragraphs, h2 subheadings, and bullet lists. */}
        <div className={styles.blogPostBody} data-testid="blog-post-body">
          <PortableText value={post.body} components={portableTextComponents} />

          {/* CTA block — motivational paragraph + "Get In Touch" pill button (Req 19.7).
           * Links to the contact section on the landing page using /#contact. */}
          <div className={styles.blogPostCta}>
            <p>Ready to take the first step? I&apos;d love to help you build a plan that works for your life and goals.</p>
            {/* BUG-097 fix: Use Next.js Link for internal navigation to the
             * landing page contact section instead of a plain <a> tag. */}
            <Link href="/#contact" className="btn">Get In Touch</Link>
          </div>
        </div>

        {/* Author bio — circular portrait with name and title (Req 19.8).
         * Uses the static keanu.jpg image from /public. */}
        <div className={styles.blogPostAuthor}>
          <img
            src="/keanu.jpg"
            alt="Keanu Le Roux"
            className={styles.blogPostAuthorImg}
            loading="lazy"
          />
          <div>
            <span className={styles.blogPostAuthorName}>Keanu Le Roux</span>
            <span className={styles.blogPostAuthorTitle}>Financial Advisor</span>
          </div>
        </div>
      </div>
    </article>
  );
}
