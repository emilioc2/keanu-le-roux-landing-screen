/**
 * Partners.tsx — Trusted Partners logo section.
 *
 * Server Component — no client-side JS needed. All content is static.
 *
 * Renders a white background section with:
 *   - Centred "Trusted Partners" heading + subtitle (shared .section-heading)
 *   - Horizontally centred flex row of 7 partner logo images (160×70px)
 *   - Logos reduce opacity on hover via CSS transition (Req 8.5)
 *
 * Partner data is imported from @/data/siteConfig (static, not CMS-managed).
 *
 * Why native <img> instead of Next.js Image:
 *   - Consistent with other non-CMS image components in the project
 *   - loading="lazy" provides deferred loading since this section is below the fold
 *   - Original images are 300×167px but CSS constrains display to 160×70px
 *
 * Bug fixes applied:
 *   - BUG-128: Replaced placeholder <div>/<span> elements with real <img> tags
 *   - BUG-123/129/130: siteConfig now has correct file paths, brand names, and all 7 entries
 *
 * @module Partners
 * @requirements 8.1–8.6
 * @see design.md — Partners component specification
 */

import { partnerLogos } from '@/data/siteConfig';
import styles from './Partners.module.css';

/**
 * Partners section component.
 *
 * Displays a row of trusted partner logo images to build credibility
 * and showcase professional associations. Content is entirely static —
 * partner logos are maintained in the codebase, not managed through
 * the CMS (Req 8.6).
 *
 * @returns The Partners section with heading and logo grid
 */
export default function Partners() {
  return (
    <section id="partners" className={styles.partners}>
      <div className="container">
        {/*
         * Centred heading block — uses shared .section-heading utility
         * class from globals.css for consistent section title styling (Req 8.2).
         *
         * Subtitle matches prototype wording (index.html #partners).
         */}
        <div className="section-heading">
          <h2>Trusted Partners</h2>
          <p>
            I work with leading financial institutions to deliver the best
            solutions for my clients.
          </p>
        </div>

        {/*
         * Logo grid — flex row with 48px gap on desktop, 24px on mobile.
         * Wraps naturally on smaller screens (Req 8.3, 8.4).
         */}
        <div className={styles.partnersGrid}>
          {partnerLogos.map((partner) => (
            /*
             * Render each partner as an <img> element (BUG-128 fix).
             *
             * - width/height attributes set intrinsic size to 160×70px for layout stability
             * - object-fit: contain (via CSS) ensures logos scale without distortion
             * - loading="lazy" defers network requests since this section is below the fold
             * - .partnerLogo class applies the hover opacity transition (Req 8.5)
             * - alt text uses real brand name for screen reader accessibility (Req 13.2)
             */
            <img
              key={partner.name}
              src={partner.src}
              alt={partner.alt}
              className={styles.partnerLogo}
              loading="lazy"
              width={160}
              height={70}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
