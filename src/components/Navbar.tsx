'use client';

/**
 * Navbar — Fixed top navigation bar with scroll-aware styling.
 *
 * This is a Client Component because it relies on:
 *   - `window.scroll` listener for transparent ↔ scrolled state transitions
 *   - `useState` for mobile hamburger menu toggle
 *
 * Two visual states:
 *   1. Transparent: clear background, white logo + links (over hero)
 *   2. Scrolled: white background, box shadow, navy logo + links
 *
 * The `alwaysScrolled` prop forces the scrolled state permanently,
 * used on the blog post detail page (Req 19 AC 2).
 *
 * Bug fixes applied:
 *   - BUG-018: Nav link text uses full white (#ffffff), not semi-transparent
 *   - BUG-050: Hamburger button includes aria-label="Toggle navigation menu"
 *   - BUG-008/019: :focus-visible outlines inherited from globals.css
 *
 * @module Navbar
 * @requirements 1.1–1.8, 11.4, 12.4, 13.3
 */

import { useState, useEffect, useCallback } from 'react';
/**
 * BUG-099 fix: Import Next.js Link component for internal route navigation.
 *
 * On the blog detail page (alwaysScrolled=true), the logo links to "/" and
 * nav links point to "/#section" — both are internal routes. Using Link
 * instead of <a> enables client-side transitions and prefetching, which is
 * the Next.js best practice for internal navigation.
 *
 * On the landing page (alwaysScrolled=false), links are hash-only anchors
 * (e.g. "#about") for same-page scrolling — these remain as plain <a> tags
 * since Link is unnecessary for in-page anchor navigation.
 */
import Link from 'next/link';
import { navLinks } from '@/data/siteConfig';
import styles from './Navbar.module.css';

/**
 * Props for the Navbar component.
 *
 * @property alwaysScrolled - When true, navbar stays in scrolled (white) state
 *   regardless of scroll position. Used on blog post page (Req 19 AC 2).
 */
interface NavbarProps {
  alwaysScrolled?: boolean;
}

/** Scroll threshold in pixels — above this, navbar switches to scrolled state */
const SCROLL_THRESHOLD = 50;

/**
 * Navbar component — renders the fixed top navigation bar.
 *
 * On the landing page (alwaysScrolled=false), links use anchor hrefs (#section).
 * On the blog page (alwaysScrolled=true), links prefix with "/" (/#section)
 * so they navigate back to the landing page sections.
 *
 * @param props - NavbarProps
 * @returns JSX element for the navigation bar
 */
export default function Navbar({ alwaysScrolled = false }: NavbarProps) {
  /**
   * Whether the navbar is in the "scrolled" visual state.
   * Starts as true if alwaysScrolled is set (blog page).
   */
  const [isScrolled, setIsScrolled] = useState(alwaysScrolled);

  /** Whether the mobile dropdown menu is open */
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  /**
   * Scroll handler — updates isScrolled based on window.scrollY.
   * Only runs when alwaysScrolled is false (landing page).
   * Uses useCallback to maintain a stable reference for the event listener.
   */
  const handleScroll = useCallback(() => {
    setIsScrolled(window.scrollY > SCROLL_THRESHOLD);
  }, []);

  /**
   * Attach/detach scroll listener on mount/unmount.
   * Skipped entirely when alwaysScrolled is true — the navbar
   * stays in scrolled state permanently on the blog page.
   * Initial scroll position is checked synchronously before paint
   * via the initializer in useState above.
   */
  useEffect(() => {
    /* No scroll listener needed when always in scrolled state (blog page) */
    if (alwaysScrolled) return;

    /* Check current scroll position on mount (handles mid-page refresh) */
    const initialCheck = () => setIsScrolled(window.scrollY > SCROLL_THRESHOLD);
    initialCheck();

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [alwaysScrolled, handleScroll]);

  /** Toggle mobile hamburger menu open/closed */
  const toggleMenu = () => setIsMenuOpen((prev) => !prev);

  /**
   * Close mobile dropdown when a nav link is clicked.
   * Ensures smooth UX — user taps a link, menu closes, page scrolls.
   */
  const handleLinkClick = () => setIsMenuOpen(false);

  /**
   * Resolve the href for each nav link based on page context.
   * Landing page: "#section" (anchor scroll)
   * Blog page: "/#section" (navigate back to landing page + anchor)
   */
  const resolveHref = (href: string): string => {
    if (alwaysScrolled && href.startsWith('#')) {
      return `/${href}`;
    }
    return href;
  };

  /* Build the CSS class string for the <nav> element */
  const navClassName = [
    styles.navbar,
    isScrolled ? styles.scrolled : '',
  ]
    .filter(Boolean)
    .join(' ');

  /* Build the CSS class string for the <ul> links container */
  const linksClassName = [
    styles.navLinks,
    isMenuOpen ? styles.open : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <nav className={navClassName} data-testid="navbar">
      <div className={styles.navContainer}>
        {/*
         * Logo — links to top of landing page.
         *
         * BUG-099 fix: Conditionally render Next.js Link vs plain <a> based
         * on page context. When alwaysScrolled is true (blog detail page),
         * the logo navigates to "/" which is an internal route — Link enables
         * client-side navigation and prefetching. When alwaysScrolled is false
         * (landing page), the logo scrolls to "#hero" via a hash anchor —
         * plain <a> is appropriate for same-page anchor navigation.
         */}
        {alwaysScrolled ? (
          <Link href="/" className={styles.logo}>
            KEANU LE ROUX
          </Link>
        ) : (
          <a href="#hero" className={styles.logo}>
            KEANU LE ROUX
          </a>
        )}

        {/* Hamburger toggle — visible only at ≤768px via CSS.
            aria-label satisfies BUG-050 and Req 13.3 */}
        <button
          className={styles.navToggle}
          onClick={toggleMenu}
          aria-label="Toggle navigation menu"
          type="button"
        >
          <span />
          <span />
          <span />
        </button>

        {/*
         * Navigation links — inline on desktop, dropdown on mobile.
         *
         * BUG-099 fix: Conditionally render Next.js <Link> vs plain <a>
         * based on page context:
         *
         * - alwaysScrolled=true (blog detail page): Links resolve to internal
         *   routes like "/#about". Next.js Link provides client-side navigation
         *   with prefetching, avoiding full page reloads when returning to the
         *   landing page.
         *
         * - alwaysScrolled=false (landing page): Links are hash-only anchors
         *   like "#about" for same-page smooth scrolling. Plain <a> tags are
         *   appropriate here since no route change occurs.
         */}
        <ul className={linksClassName}>
          {navLinks.map((link) => (
            <li key={link.href}>
              {alwaysScrolled ? (
                <Link
                  href={resolveHref(link.href)}
                  className={styles.navLink}
                  onClick={handleLinkClick}
                >
                  {link.label}
                </Link>
              ) : (
                <a
                  href={resolveHref(link.href)}
                  className={styles.navLink}
                  onClick={handleLinkClick}
                >
                  {link.label}
                </a>
              )}
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
