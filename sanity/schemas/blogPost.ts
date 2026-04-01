/**
 * Sanity CMS schema for Blog Post documents.
 *
 * This is the only CMS-managed content type on the site. The Admin_User (Keanu)
 * uses this schema to create, edit, publish, and unpublish blog posts that appear
 * in the Blog/Insights section of the landing page and on individual blog detail
 * pages.
 *
 * Fields follow the design document's Data Models section exactly.
 * The `published` boolean controls visibility — only posts with published: true
 * are fetched by the front-end GROQ queries.
 *
 * @see src/lib/sanity.ts — GROQ queries that consume this schema
 * @see src/lib/types.ts — BlogPost TypeScript interface matching these fields
 *
 * Requirements: 15.2 (CMS fields), 15.4 (publish/unpublish), 5.7 (blog structure)
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- Sanity Rule type unavailable outside Studio
type SanityRule = any;

const blogPost = {
  name: 'blogPost',
  title: 'Blog Post',
  type: 'document',

  fields: [
    /**
     * Post title — displayed as the heading on blog cards and the detail page.
     * Required so every post has a visible, identifiable title.
     */
    {
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule: SanityRule) => Rule.required(),
    },

    /**
     * URL-safe slug derived from the title, used for routing to /blog/[slug].
     * Auto-generated from the title field with a max length of 96 characters
     * to keep URLs clean and SEO-friendly.
     */
    {
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'title', maxLength: 96 },
      validation: (Rule: SanityRule) => Rule.required(),
    },

    /**
     * Publication date — used for chronological sorting (newest first) and
     * display formatting on blog cards and the detail page header.
     * Required to ensure consistent ordering in the Blog section.
     */
    {
      name: 'publishedAt',
      title: 'Published Date',
      type: 'datetime',
      validation: (Rule: SanityRule) => Rule.required(),
    },

    /**
     * Short summary shown on blog cards and as lead text on the detail page.
     * Limited to 3 visible rows in the CMS editor and capped at 300 characters
     * to keep card layouts consistent across the grid.
     */
    {
      name: 'excerpt',
      title: 'Excerpt',
      type: 'text',
      rows: 3,
      validation: (Rule: SanityRule) => Rule.required().max(300),
    },

    /**
     * Hero/featured image for the blog post.
     * Hotspot is enabled so the Admin_User can control the crop focus point.
     * The nested `alt` field is required for accessibility compliance (Req 13.2).
     * When absent, the front-end renders a placeholder image instead.
     */
    {
      name: 'mainImage',
      title: 'Main Image',
      type: 'image',
      options: { hotspot: true },
      fields: [
        {
          name: 'alt',
          title: 'Alt Text',
          type: 'string',
          // Required — ensures every uploaded image has descriptive alt text
          validation: (Rule: SanityRule) => Rule.required(),
        },
      ],
    },

    /**
     * Rich text body content using Sanity's Portable Text format.
     *
     * Supported content types:
     *   - Block styles: Normal paragraphs and H2 subheadings
     *   - Lists: Bullet lists only (no numbered lists per design spec)
     *   - Decorators: Bold (strong) and Italic (em) for inline formatting
     *   - Inline images with optional alt text for in-body illustrations
     *
     * Required field (BUG-040) — every published post must have body content
     * to prevent empty blog detail pages.
     */
    {
      name: 'body',
      title: 'Body',
      type: 'array',
      validation: (Rule: SanityRule) => Rule.required(),
      of: [
        {
          type: 'block',
          // Restrict styles to Normal and H2 — keeps blog content hierarchy clean
          styles: [
            { title: 'Normal', value: 'normal' },
            { title: 'H2', value: 'h2' },
          ],
          // Bullet lists only — numbered lists are not part of the design
          lists: [{ title: 'Bullet', value: 'bullet' }],
          marks: {
            // Bold and Italic are the only inline decorators needed
            decorators: [
              { title: 'Bold', value: 'strong' },
              { title: 'Italic', value: 'em' },
            ],
          },
        },
        {
          // Inline images within body content for mid-article illustrations
          type: 'image',
          options: { hotspot: true },
          fields: [
            {
              name: 'alt',
              title: 'Alt Text',
              type: 'string',
              // Optional for inline body images (unlike mainImage which requires alt)
            },
          ],
        },
      ],
    },

    /**
     * Publish toggle — controls whether the post appears on the public site.
     * Defaults to false so new drafts aren't accidentally visible to visitors.
     * Only posts with published: true are returned by front-end GROQ queries.
     */
    {
      name: 'published',
      title: 'Published',
      type: 'boolean',
      initialValue: false,
    },
  ],

  /**
   * Default ordering in the Sanity Studio document list.
   * Shows newest posts first, matching the front-end display order
   * so the Admin_User sees the same chronological sequence.
   */
  orderings: [
    {
      title: 'Published Date, New',
      name: 'publishedAtDesc',
      by: [{ field: 'publishedAt', direction: 'desc' }],
    },
  ],

  /**
   * Preview configuration for the Sanity Studio document list.
   * Displays the post title as the list item label, the main image
   * as a thumbnail, and the publication date as subtitle context.
   */
  preview: {
    select: {
      title: 'title',
      media: 'mainImage',
      date: 'publishedAt',
    },
  },
};

export default blogPost;
