/**
 * Newsletter.tsx — Navy CTA section with external subscribe link.
 *
 * Server Component — no client-side JS needed. All content is static.
 *
 * Renders a navy background section with:
 *   - "Stay Ahead of the Curve" heading (italic serif, white)
 *   - Description paragraph (light white, opacity 0.7)
 *   - Three benefit items with checkmark (✓) prefixes
 *   - "Subscribe" pill button linking to external newsletter signup
 *
 * The Subscribe button is an `<a>` element (not a `<button>`) that opens
 * the external newsletter URL in a new tab with `rel="noopener noreferrer"`
 * for security (Req 7.6). There is no inline email form — the button is
 * a direct external link only (Req 7.7).
 *
 * @module Newsletter
 * @requirements 7.1–7.7
 * @see design.md — Newsletter component specification
 */

import { newsletterUrl } from '@/data/siteConfig';
import styles from './Newsletter.module.css';

/**
 * Three subscriber benefits displayed with checkmark prefixes.
 * Content matches the prototype newsletter section exactly (Req 7.4).
 */
const BENEFITS = [
  'Practical wealth-building strategies',
  'Market updates and economic insights',
  'Tips for smarter financial decisions',
] as const;

/**
 * Newsletter section component.
 *
 * Renders a navy-background CTA encouraging visitors to subscribe
 * to Keanu's newsletter via an external signup page. No form fields
 * are rendered — the "Subscribe" button links directly to the
 * external newsletter URL from siteConfig.
 *
 * @returns {JSX.Element} The Newsletter section with heading, description, benefits, and subscribe link
 */
export default function Newsletter() {
  return (
    <section id="newsletter" className={styles.newsletter}>
      {/*
       * BUG-077 fix: Added .container wrapper for horizontal padding.
       *
       * The prototype wraps newsletter content in a .container div (see
       * prototype/index.html #newsletter section) which provides 24px
       * horizontal padding via globals.css. Without this wrapper, the
       * newsletter content can touch viewport edges on narrow screens.
       */}
      <div className="container">
        {/* Constrained content wrapper — max 560px centred (design doc spec) */}
        <div className={styles.newsletterContent}>
          {/* Section heading — italic serif, white (Req 7.2) */}
          <h2 className={styles.heading}>Stay Ahead of the Curve</h2>

        {/* Value proposition paragraph — light white at 70% opacity (Req 7.3) */}
        <p className={styles.description}>
          Join my newsletter for weekly financial insights, market commentary,
          planning tips and exclusive content — delivered straight to your inbox.
        </p>

        {/* Benefit list — three inline items with checkmark prefixes (Req 7.4) */}
        <ul className={styles.benefits}>
          {BENEFITS.map((benefit) => (
            <li key={benefit} className={styles.benefit}>
              {/* Checkmark prefix — aria-hidden since it's decorative */}
              <span className={styles.checkmark} aria-hidden="true">
                ✓
              </span>
              {benefit}
            </li>
          ))}
        </ul>

        {/*
         * Subscribe button — external link opening in a new tab (Req 7.5, 7.6).
         * Uses the .btn-newsletter class from globals.css for pill-shaped white
         * outlined styling on the navy background.
         * No email input — direct link only (Req 7.7).
         * target="_blank" + rel="noopener noreferrer" for security.
         */}
        <a
          href={newsletterUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-newsletter"
          data-testid="newsletter-subscribe"
        >
          Subscribe
        </a>
        </div>{/* end .newsletterContent */}
      </div>{/* end .container — BUG-077 fix */}
    </section>
  );
}
