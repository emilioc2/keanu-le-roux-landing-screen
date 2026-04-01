/**
 * Partners.tsx — Trusted Partners logo section.
 *
 * Server Component — renders the section wrapper, heading, and subtitle.
 * Delegates the logo row to PartnersCarousel (Client Component) which
 * handles carousel interactivity via progressive enhancement.
 *
 * The section retains its visual identity: white background, 80px padding,
 * grey top border, centred heading (Req 4.1, 4.2).
 *
 * Partner data is imported from @/data/siteConfig (static, not CMS-managed).
 *
 * Bug fixes applied:
 *   - BUG-128: Replaced placeholder <div>/<span> elements with real <img> tags
 *   - BUG-123/129/130: siteConfig now has correct file paths, brand names, and all 7 entries
 *
 * @module Partners
 * @requirements 4.1, 4.2, 5.1
 * @see design.md — Partners component specification
 */

import { partnerLogos } from '@/data/siteConfig';
import styles from './Partners.module.css';
import PartnersCarousel from './PartnersCarousel';

/**
 * Partners section component.
 *
 * Displays the "Trusted Partners" heading and delegates logo rendering
 * to PartnersCarousel, which dynamically switches between a centred
 * static layout and an infinite-scrolling carousel based on whether
 * logos fit within the container width.
 *
 * This remains a Server Component — no 'use client' directive needed.
 * The carousel interactivity is encapsulated in the child Client Component.
 *
 * @returns The Partners section with heading and carousel
 */
export default function Partners() {
  return (
    <section id="partners" className={styles.partners}>
      <div className="container">
        {/* Centred heading — uses shared .section-heading from globals.css
         * for consistent section title styling (Req 4.2). */}
        <div className="section-heading">
          <h2>Trusted Partners</h2>
          <p>
            I work with leading financial institutions to deliver the best
            solutions for my clients.
          </p>
        </div>

        {/* Carousel component — handles static/scrolling mode dynamically.
         * In static mode: centred flex row, no carousel features.
         * In scrolling mode: auto-scroll, drag, keyboard, infinite loop. */}
        <PartnersCarousel logos={partnerLogos} />
      </div>
    </section>
  );
}
