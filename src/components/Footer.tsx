/**
 * Footer — Server Component rendering the site footer.
 *
 * Displays centred branding (logo + tagline), social media icon links,
 * a mailto: email link, and a details block with phone number,
 * authorisation statement, and dynamic copyright year.
 *
 * This is a Server Component — all content is static and sourced from
 * `@/data/siteConfig`. No client-side state or interactivity is needed.
 *
 * @requirements 10.1–10.5, 13.3
 * @see prototype/index.html — footer section
 * @see prototype/styles.css — .footer, .footer-logo, .footer-tagline, etc.
 */

import { contactInfo, socialProfileUrls } from '@/data/siteConfig';
import styles from './Footer.module.css';

/**
 * YouTube brand icon (20×20px) — matches the prototype footer SVG.
 * Uses `aria-hidden` because the parent `<a>` carries the `aria-label`
 * for screen reader accessibility (Req 13.3).
 */
function YouTubeIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}

/**
 * Instagram brand icon (20×20px) — camera outline logo.
 * Uses `aria-hidden` because the parent `<a>` carries the `aria-label`.
 */
function InstagramIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
    </svg>
  );
}

/**
 * LinkedIn brand icon (20×20px) — "in" logo.
 * Uses `aria-hidden` because the parent `<a>` carries the `aria-label`
 * for screen reader accessibility (Req 13.3).
 */
function LinkedInIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

/**
 * Footer component — renders the site-wide footer with branding,
 * social links, email contact, and legal details.
 *
 * This is a Server Component (no 'use client' directive) since all content
 * is static and imported from siteConfig data. No client-side state needed.
 *
 * Layout: all content is centred within a max-width container.
 * Order matches the prototype: logo → tagline → social icons → email → details.
 *
 * @returns The `<footer>` element with centred branding and contact info
 */
export default function Footer() {
  /** Dynamic copyright year — updates automatically each calendar year */
  const currentYear = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        {/* Brand logo text — uppercase, letter-spaced, matching Navbar logo style */}
        <div className={styles.footerLogo}>KEANU LE ROUX</div>

        {/* Tagline — italic serif, grey. "Independent Wealth Manager" per prototype. */}
        <p className={styles.footerTagline}>Independent Wealth Manager</p>

        {/* Social icon row — YouTube, Instagram, LinkedIn (Req 10.2, 10.3, 10.4)
            Each link opens in a new tab with noopener noreferrer for security.
            aria-label on each <a> provides accessible names for icon-only links (Req 13.3). */}
        <div className={styles.footerSocial}>
          <a
            href={socialProfileUrls.youtube}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="YouTube"
          >
            <YouTubeIcon />
          </a>
          <a
            href={socialProfileUrls.instagram}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
          >
            <InstagramIcon />
          </a>
          <a
            href={socialProfileUrls.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="LinkedIn"
          >
            <LinkedInIcon />
          </a>
        </div>

        {/* Email mailto: link — opens default email client (Req 10.5).
            Display text uses mixed-case branding per prototype; mailto href stays lowercase. */}
        <div className={styles.footerEmail}>
          <a
            href={`mailto:${contactInfo.email}`}
            className={styles.footerEmailLink}
          >
            Keanu@TheWealthRoom.com
          </a>
        </div>

        {/* Details block — phone, authorisation statement, copyright (Req 10.2).
            Phone prefixed with "T" matching the prototype format. */}
        <div className={styles.footerDetails}>
          <p>T {contactInfo.phone}</p>
          <p>An Authorised Financial Services Representative</p>
          {/* Copyright — "All Rights Reserved" capitalisation matches prototype */}
          <p>&copy; {currentYear} Keanu Le Roux. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
}
