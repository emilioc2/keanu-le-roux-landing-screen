/**
 * Blog Post Detail Page — Server Component route for /blog/[slug].
 *
 * Fetches a single published blog post from Sanity CMS by its URL slug
 * and renders the full post content using the BlogPostDetail component.
 * Returns a 404 page if the slug doesn't match any published post.
 *
 * Rendering strategy: ISR with 60-second revalidation — balances content
 * freshness with caching performance. Static params are pre-generated
 * at build time via generateStaticParams for all published posts.
 *
 * Page composition matches the prototype (blog-post.html):
 *   Navbar (always scrolled) → BlogPostDetail → Footer
 *
 * @module BlogPostDetailPage
 * @requirements 19.1, 19.2, 19.9, 19.11, 19.12
 * @see prototype/blog-post.html — visual source of truth
 */

import { notFound } from 'next/navigation';
import Navbar from '@/components/Navbar';
import BlogPostDetail from '@/components/BlogPostDetail';
import Footer from '@/components/Footer';
import {
  sanityClient,
  postBySlugQuery,
  allPostSlugsQuery,
  isSanityConfigured,
} from '@/lib/sanity';
import type { BlogPost } from '@/lib/types';
/**
 * Shared placeholder posts — used as fallback when Sanity CMS is not configured
 * (e.g. development environments with placeholder credentials). This ensures
 * the blog detail page renders meaningful content instead of a 404 when the
 * slug matches any of the placeholder posts (Req 5 AC 9).
 */
/* Copy-changes: import plural defaultPosts array to support all 3 placeholder slugs */
import { defaultPosts } from '@/data/defaultPost';

/**
 * ISR revalidation interval in seconds.
 * Blog posts are re-fetched every 60 seconds so CMS edits appear
 * without requiring a full site rebuild (Req 19.12).
 */
export const revalidate = 60;

/**
 * Route segment params type for the dynamic [slug] segment.
 * Next.js App Router passes this to the page component and
 * generateStaticParams returns an array of these objects.
 */
interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

/**
 * generateStaticParams — pre-renders all published blog post pages at build time.
 *
 * Fetches all published post slugs from Sanity CMS and returns them as
 * static params for ISR. If Sanity is not configured (missing or placeholder
 * credentials), returns an empty array so the build doesn't fail.
 *
 * @returns Array of { slug } objects for each published blog post
 */
export async function generateStaticParams(): Promise<{ slug: string }[]> {
  /* Guard: skip Sanity fetch when credentials are missing or invalid */
  if (!isSanityConfigured() || !sanityClient) {
    return [];
  }

  try {
    /* Fetch all published post slugs — minimal payload (slug field only) */
    const posts = await sanityClient.fetch<{ slug: { current: string } }[]>(
      allPostSlugsQuery
    );

    /* Map Sanity slug objects to the { slug: string } format Next.js expects */
    return posts.map((post) => ({
      slug: post.slug.current,
    }));
  } catch {
    /* If the Sanity fetch fails, return empty array — pages will be generated on-demand via ISR */
    return [];
  }
}

/**
 * BlogPostPage — async Server Component that fetches and renders a single blog post.
 *
 * Fetches the post matching the URL slug from Sanity CMS. If the post
 * is not found (invalid slug, unpublished, or CMS error), triggers
 * Next.js's notFound() which renders the custom 404 page.
 *
 * The Navbar receives `alwaysScrolled` to keep it in the white/navy
 * scrolled state permanently on the blog detail page (Req 19.2).
 *
 * @param props.params - Route params containing the blog post slug
 * @returns JSX for the complete blog post detail page
 */
export default async function BlogPostPage({ params }: BlogPostPageProps) {
  /* Await the params promise (Next.js 15 async params pattern) */
  const { slug } = await params;

  /* Guard: if Sanity is not configured, attempt to serve a placeholder post.
   * When the slug matches any of the defaultPosts slugs, render the matched
   * placeholder content so "Read More" links from the landing page work
   * even without a live CMS connection. For any other slug, show 404. */
  if (!isSanityConfigured() || !sanityClient) {
    /* Find matching placeholder post by slug from the defaultPosts array.
     * Supports all three placeholder posts (gold-oil, risk-protection,
     * retirement-30s) rendering on their detail pages without a CMS. */
    const matchedPost = defaultPosts.find((p) => p.slug.current === slug);
    if (matchedPost) {
      return (
        <>
          {/* Navbar in permanent scrolled state — white background, navy text (Req 19.2). */}
          <Navbar alwaysScrolled />

          {/* Render the matched placeholder post through the same detail component */}
          <BlogPostDetail post={matchedPost} />

          {/* Standard site footer — same as landing page (Req 19.9) */}
          <Footer />
        </>
      );
    }
    /* Slug doesn't match the placeholder — no CMS to query, so 404 */
    notFound();
  }

  /** Fetch the single published post matching this slug from Sanity CMS */
  let post: BlogPost | null = null;

  try {
    /* Execute the GROQ query with the slug parameter.
     * The query filters for published == true, so unpublished posts return null. */
    post = await sanityClient.fetch<BlogPost | null>(postBySlugQuery, { slug });
  } catch {
    /* CMS fetch failed — treat as not found so the visitor sees the 404 page */
  }

  /* If no post was found (invalid slug, unpublished, or fetch error), return 404 */
  if (!post) {
    notFound();
  }

  return (
    <>
      {/* Navbar in permanent scrolled state — white background, navy text (Req 19.2).
       * Links use /#section format to navigate back to landing page sections. */}
      <Navbar alwaysScrolled />

      {/* Full blog post content — header, image, body, CTA, author bio */}
      <BlogPostDetail post={post} />

      {/* Standard site footer — same as landing page (Req 19.9) */}
      <Footer />
    </>
  );
}
