/**
 * Sanity CMS client configuration and GROQ queries.
 *
 * This module provides the configured Sanity client and all GROQ queries
 * used to fetch blog post data from the CMS. It is consumed by:
 *   - `src/app/page.tsx` — landing page (all published posts)
 *   - `src/app/blog/[slug]/page.tsx` — blog detail page (single post + static params)
 *
 * The client uses environment variables for project configuration so credentials
 * are never hardcoded. CDN is enabled for fast read performance on the public site.
 *
 * @see sanity/schemas/blogPost.ts — the CMS schema these queries target
 * @see src/lib/types.ts — BlogPost interface matching the query projections
 *
 * Requirements: 5.8 (featured post), 15.5 (auto-display newest), 19.12 (CMS-sourced detail)
 */

import { createClient, type SanityClient } from '@sanity/client';

/**
 * Check whether SANITY_PROJECT_ID looks like a real Sanity project ID
 * (lowercase alphanumeric + hyphens only). Placeholders such as
 * "your_project_id" contain underscores and will be rejected by the
 * Sanity client constructor, so we guard against that here.
 *
 * @returns `true` when the env var is present and matches the expected format
 */
export function isSanityConfigured(): boolean {
  const id = process.env.SANITY_PROJECT_ID;
  // Sanity project IDs are lowercase alphanumeric with optional hyphens.
  // Reject empty, missing, or placeholder values (e.g. "your_project_id").
  return typeof id === 'string' && id.length > 0 && /^[a-z0-9-]+$/.test(id);
}

/**
 * Configured Sanity client instance — or `null` when not configured.
 *
 * Only instantiated when the project ID passes the validity check above.
 * When Sanity is not configured (missing, empty, or placeholder value)
 * the client is `null` — callers must check `isSanityConfigured()` or
 * null-check the client before using it.
 *
 * - projectId/dataset: sourced from env vars set in .env.local
 * - apiVersion: pinned to '2024-01-01' for stable query behaviour
 * - useCdn: true for fast cached reads on the public-facing site
 * - token: optional, included for authenticated requests if needed
 */
export const sanityClient: SanityClient | null = isSanityConfigured()
  ? createClient({
      projectId: process.env.SANITY_PROJECT_ID!,
      dataset: process.env.SANITY_DATASET || 'production',
      apiVersion: '2024-01-01',
      useCdn: true,
      token: process.env.SANITY_API_TOKEN,
    })
  : null;

/**
 * GROQ query: Fetch all published blog posts, newest first.
 *
 * Used by the landing page Blog section to populate the featured article
 * and card grid. Projects only the fields needed for cards (no body content)
 * to minimise payload size.
 *
 * The `mainImage { asset->{ url }, alt }` projection dereferences the image
 * asset to get the CDN URL directly, avoiding a second round-trip.
 */
export const allPublishedPostsQuery = `
  *[_type == "blogPost" && published == true] | order(publishedAt desc) {
    _id, title, slug, publishedAt, excerpt,
    mainImage { asset->{ url }, alt }
  }
`;

/**
 * GROQ query: Fetch a single published blog post by its slug.
 *
 * Used by the blog detail page (`/blog/[slug]`). Includes the full `body`
 * field (Portable Text) which is omitted from the list query above.
 * The `[0]` selector returns a single document instead of an array.
 *
 * Expects a `$slug` parameter to be passed when executing the query.
 */
export const postBySlugQuery = `
  *[_type == "blogPost" && slug.current == $slug && published == true][0] {
    _id, title, slug, publishedAt, excerpt, body,
    mainImage { asset->{ url }, alt }
  }
`;

/**
 * GROQ query: Fetch all published post slugs.
 *
 * Used by `generateStaticParams` in the blog detail page route to
 * pre-render all published blog posts at build time (ISR).
 * Returns only the slug field to minimise the response payload.
 */
export const allPostSlugsQuery = `
  *[_type == "blogPost" && published == true] { slug }
`;

/**
 * Builds an optimised Sanity CDN image URL by appending width and quality
 * query parameters. This reduces image payload size for faster page loads
 * without requiring the full @sanity/image-url package.
 *
 * Sanity's CDN supports on-the-fly image transformations via URL params:
 *   - `w` — target width in pixels (images are scaled proportionally)
 *   - `q` — JPEG/WebP quality (1–100, lower = smaller file)
 *
 * Falls back gracefully: if the URL is empty or undefined, returns an
 * empty string so callers don't need null checks.
 *
 * @param url - The raw Sanity CDN image URL from the GROQ query
 * @param width - Target width in pixels (default: 800)
 * @param quality - Image quality 1–100 (default: 75)
 * @returns The URL with `?w=` and `&q=` params appended, or empty string
 *
 * @example
 * ```ts
 * const optimised = sanityImageUrl(post.mainImage.asset.url, 600, 80);
 * // "https://cdn.sanity.io/images/.../image.jpg?w=600&q=80"
 * ```
 *
 * Requirements: 14.1 (optimised image delivery)
 */
export function sanityImageUrl(
  url: string | undefined,
  width: number = 800,
  quality: number = 75
): string {
  /* Return empty string for missing/empty URLs to avoid broken <img> src */
  if (!url) return '';

  /* Determine the correct separator — use '&' if the URL already has query params */
  const separator = url.includes('?') ? '&' : '?';

  return `${url}${separator}w=${width}&q=${quality}`;
}
