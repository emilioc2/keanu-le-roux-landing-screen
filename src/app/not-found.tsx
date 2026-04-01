/**
 * Custom 404 Page — Server Component rendered when a route is not found.
 *
 * Displays a clean, centred "Page Not Found" message with a pill-shaped
 * "Back to Home" button linking to the landing page. The Navbar is rendered
 * in its permanent scrolled (white) state via the `alwaysScrolled` prop,
 * matching the blog detail page pattern.
 *
 * This is a Server Component — no client-side state or interactivity needed.
 * The page follows the same responsive breakpoints and design tokens as
 * the rest of the site.
 *
 * @module NotFoundPage
 * @requirements BUG-045
 * @see .kiro/specs/keanu-financial-advisor-website/design.md — 404 page spec
 */

import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import styles from './not-found.module.css';

/**
 * NotFound — renders the custom 404 page with Navbar, centred content, and Footer.
 *
 * Layout:
 *   - Navbar in permanent scrolled state (white bg, navy text)
 *   - Centred content area with heading, message, and CTA button
 *   - Standard site Footer
 *
 * The top padding (120px) accounts for the fixed Navbar height so content
 * doesn't sit behind it.
 *
 * @returns JSX for the 404 page
 */
export default function NotFound() {
  return (
    <>
      {/* Navbar in permanent scrolled state — white background, navy text.
       * Links use /#section format to navigate back to landing page sections. */}
      <Navbar alwaysScrolled />

      {/* Centred 404 content — constrained to max-width via .container */}
      <section className={styles.notFound}>
        <div className="container">
          <div className={styles.content}>
            {/* Heading in Playfair Display — matches the site's heading style */}
            <h1 className={styles.heading}>Page Not Found</h1>

            {/* Friendly message explaining the situation */}
            <p className={styles.message}>
              The page you&apos;re looking for doesn&apos;t exist or has been moved.
            </p>

            {/* Pill-shaped CTA button using the global .btn class.
             * Links back to the landing page root. */}
            <Link href="/" className="btn">
              Back to Home
            </Link>
          </div>
        </div>
      </section>

      {/* Standard site footer — same as all other pages */}
      <Footer />
    </>
  );
}
