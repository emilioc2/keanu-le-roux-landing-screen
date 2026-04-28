/**
 * SocialFeed.tsx — Social Media Content Feed section (Server Component).
 *
 * Renders a three-column grid of clickable platform cards for YouTube,
 * LinkedIn, and Instagram. Each card opens the corresponding external
 * platform URL in a new tab with `rel="noopener noreferrer"` for security.
 *
 * This is a Server Component — all data is static (imported from
 * `src/data/socialLinks.ts`) and no client-side state is needed.
 *
 * Platform-specific preview areas (each with distinct visual treatment):
 *   - YouTube: thumbnail image (/images/youtube-thumbnail.jpg) with centred play button overlay
 *   - LinkedIn: italic serif quote on grey background (hardcoded — BUG-047)
 *   - Instagram: gradient using rgba() values (BUG-010 fix — no element opacity)
 *
 * Cards are wrapped in `<ScrollReveal>` for fade-in animation on scroll entry.
 *
 * Requirements: 6.1–6.9, 12.1, 12.2
 * Visual source: prototype/index.html (Social Media Content Feed section)
 */

import { socialLinks } from '@/data/socialLinks';
import ScrollReveal from '@/components/ScrollReveal';
import styles from './SocialFeed.module.css';
import type { SocialLink } from '@/lib/types';

/**
 * LinkedIn quote text — hardcoded in the component because the SocialLink
 * type doesn't include a quote field. Matches the prototype text exactly.
 * Uses Unicode characters for typographic quotes and em dash.
 */
const LINKEDIN_QUOTE =
  '\u201CThe biggest risk in financial planning isn\u2019t market volatility \u2014 it\u2019s not having a plan at all. Start with your goals, not your fears.\u201D';

/**
 * Renders the platform-specific brand SVG icon for the badge row.
 * Icons are inline SVGs matching the prototype's visual dimensions.
 * All icons use `aria-hidden="true"` since the platform name text
 * provides the accessible label.
 *
 * @param platform - The social media platform identifier
 */
function PlatformIcon({ platform }: { platform: SocialLink['platform'] }) {
  switch (platform) {
    /* YouTube brand icon — red play button logo */
    case 'youtube':
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
        </svg>
      );
    /* LinkedIn brand icon — "in" logo */
    case 'linkedin':
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
        </svg>
      );
    /* Instagram brand icon — camera outline */
    case 'instagram':
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
        </svg>
      );
  }
}

/**
 * External link icon (arrow-up-right) displayed in the badge row.
 * Shared across all platform cards. Uses stroke-based SVG for a
 * clean, minimal appearance matching the prototype's external link indicator.
 *
 * @returns SVG element for the external link arrow icon
 */
function ExternalLinkIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  );
}

/**
 * Renders the platform-specific preview area for each feed card.
 *
 * Each platform has a distinct visual treatment per the design spec:
 *   - YouTube: grey area with a dark semi-transparent play button circle (Req 6.4)
 *   - LinkedIn: grey area with an italic serif blockquote (Req 6.5)
 *   - Instagram: gradient area using rgba() colour values (Req 6.6, BUG-010 fix)
 *
 * @param platform - The social media platform identifier used to select the preview style
 * @returns JSX element for the platform-specific preview area
 */
function FeedPreview({ platform }: { platform: SocialLink['platform'] }) {
  switch (platform) {
    /* YouTube preview: thumbnail image with centred play button overlay */
    case 'youtube':
      return (
        <div className={styles.youtubePreview} data-testid="youtube-preview">
          {/* Thumbnail image — fills the preview area via object-fit: cover (absolutely positioned behind the play button) */}
          <img
            src="/images/youtube-thumbnail.jpg"
            alt="R50K Post Retirement Income Strategy For a 25 Year Old South African"
            className={styles.youtubeThumbnail}
          />
          {/* Play button overlay — dark semi-transparent circle with white play triangle, z-indexed above the thumbnail */}
          <div className={styles.playButton}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="white" aria-hidden="true">
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
          </div>
        </div>
      );

    /* LinkedIn preview: italic serif quote on grey background (min-height 200px) */
    case 'linkedin':
      return (
        <div className={styles.linkedinPreview} data-testid="linkedin-preview">
          {/* Blockquote uses Playfair Display italic via CSS — text is hardcoded (BUG-047) */}
          <blockquote>{LINKEDIN_QUOTE}</blockquote>
        </div>
      );

    /* Instagram preview: gradient using rgba() values — NOT element-level opacity (BUG-010) */
    case 'instagram':
      return (
        <div className={styles.instagramPreview} data-testid="instagram-preview" />
      );
  }
}

/**
 * SocialFeed — Server Component rendering the "Latest Content" section.
 *
 * Iterates over the static `socialLinks` data array to render one card per
 * platform (YouTube, LinkedIn, Instagram). Each card is a full `<a>` element
 * with `target="_blank"` and `rel="noopener noreferrer"` for security (Req 6.7).
 *
 * Card structure:
 *   1. Badge row: platform icon + name + external link icon (Req 6.9)
 *   2. Platform-specific preview area
 *   3. Info area: title, description, CTA text
 *
 * Each card is wrapped in `<ScrollReveal>` for entrance animation (Req 12.1).
 *
 * @returns The complete Social Feed section as a `<section>` element
 */
export default function SocialFeed() {
  return (
    <section className={styles.socialFeed} id="feed" data-testid="social-feed">
      <div className="container">
        {/* BUG-071 fix: Centred heading using shared .section-heading class.
         * Subtitle updated from "Follow along for tips, insights and behind-the-scenes
         * content." to match prototype/index.html #feed section text exactly. */}
        <div className="section-heading">
          <h2>Latest Content</h2>
          <p>Catch up on my latest videos, posts and updates across platforms.</p>
        </div>

        {/* Three-column grid of platform cards (single column on mobile ≤900px) */}
        <div className={styles.feedGrid}>
          {socialLinks.map((link) => (
            /* ScrollReveal wraps each card for fade-in animation on viewport entry */
            <ScrollReveal key={link.platform}>
              {/*
               * Full card is a clickable <a> element — opens external platform URL
               * in a new tab with noopener noreferrer for security (Req 6.7).
               */}
              <a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.feedCard}
                data-testid="feed-card"
              >
                {/* Badge row: platform icon + name text + external link icon (Req 6.9) */}
                <div className={styles.feedBadge} data-testid="feed-badge">
                  {/* Platform brand icon — coloured via platform-specific CSS class */}
                  <span
                    className={`${styles.feedBadgeIcon} ${
                      link.platform === 'youtube'
                        ? styles.youtubeIcon
                        : link.platform === 'linkedin'
                          ? styles.linkedinIcon
                          : styles.instagramIcon
                    }`}
                  >
                    <PlatformIcon platform={link.platform} />
                  </span>

                  {/* Platform name — capitalised first letter */}
                  <span className={styles.feedBadgeName} data-testid="feed-badge-name">
                    {link.platform.charAt(0).toUpperCase() + link.platform.slice(1)}
                  </span>

                  {/* Right-aligned external link icon — grey by default, navy on hover */}
                  <span className={styles.feedExternalIcon} data-testid="feed-external-icon">
                    <ExternalLinkIcon />
                  </span>
                </div>

                {/* Platform-specific preview area (YouTube/LinkedIn/Instagram) */}
                <FeedPreview platform={link.platform} />

                {/* Card info: title, description, and platform-specific CTA text */}
                <div className={styles.feedInfo}>
                  <h4>{link.title}</h4>
                  <p>{link.description}</p>
                  {/* CTA text transitions from navy to accent on card hover */}
                  <span className={styles.feedCta}>{link.ctaText}</span>
                </div>
              </a>
            </ScrollReveal>
          ))}
        </div>

        {/*
         * Budget tracker download button (Req 6 AC 1–6, AC 8).
         * URL-encoded href matches the filename with spaces (BUG-181).
         * The `download` attribute triggers a file save dialog instead of
         * navigating to the file. The global `.btn` class provides the
         * standard navy-outlined pill styling from globals.css.
         */}
        <div className={styles.feedDownload}>
          <a
            href="/Tracking%20Budget%202026.xlsx"
            download
            className="btn"
          >
            📥 Download Free Budget Tracker 2026
          </a>
        </div>
      </div>
    </section>
  );
}
