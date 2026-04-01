/**
 * Hero.tsx — Full-viewport hero section with looping video background,
 * navy overlay, headline, subtitle, and two CTA buttons.
 *
 * Client Component because the <video> element requires client-side
 * hydration for autoplay/muted/loop/playsInline attributes to work
 * correctly across browsers.
 *
 * Visual source of truth: prototype/index.html #hero + prototype/styles.css .hero
 * Requirements: 2.1–2.12, 13.8, 13.9, 14.3
 */
'use client';

import { useState, useEffect } from 'react';
import styles from './Hero.module.css';

/**
 * useIsMobile — Tracks whether the viewport is at or below 768px.
 *
 * Mobile-first SSR default: initializes to `true` so the server-rendered
 * HTML contains only the fallback image (no <video> element), preventing
 * the browser from parsing a <source> tag and initiating the 3.1MB video
 * download on mobile connections.
 *
 * On hydration, useEffect detects the actual viewport via matchMedia and
 * updates state accordingly. Desktop users see a brief fallback-to-video
 * transition masked by the navy-dark background.
 *
 * @returns {boolean} `true` when viewport width is ≤768px, `false` otherwise
 */
function useIsMobile(): boolean {
  // Mobile-first default — SSR renders fallback image, not <video>
  const [isMobile, setIsMobile] = useState(true);

  useEffect(() => {
    // Detect actual viewport width on the client
    const mediaQuery = window.matchMedia('(max-width: 768px)');
    setIsMobile(mediaQuery.matches);

    // Listen for viewport changes (resize, device rotation)
    const handler = (e: MediaQueryListEvent) => {
      setIsMobile(e.matches);
    };

    mediaQuery.addEventListener('change', handler);

    // Clean up listener on unmount to prevent memory leaks
    return () => {
      mediaQuery.removeEventListener('change', handler);
    };
  }, []);

  return isMobile;
}

/**
 * Hero section component.
 *
 * Renders a full-viewport (100vh) section with:
 * - Looping muted MP4 video background with poster fallback (BUG-029/035)
 * - Navy overlay at rgba(20, 28, 66, 0.55)
 * - Navy-dark fallback background for immediate paint (Req 14.3)
 * - "Your Wealth, Your Legacy." heading in Playfair Display italic
 * - Subtitle paragraph sourced from the prototype
 * - Two CTAs: "Get In Touch" (#contact) and "Subscribe to Newsletter" (#newsletter)
 *
 * The video element includes aria-label for screen reader accessibility (BUG-041).
 */
export default function Hero() {
  /* Determine viewport size to conditionally render background media.
   * Mobile (≤768px) gets a lightweight fallback image instead of the 3.1MB video. */
  const isMobile = useIsMobile();

  return (
    <section id="hero" className={styles.hero}>
      {/* Conditional background media:
        * - Mobile (≤768px): lightweight fallback image (46KB) — prevents the 3.1MB
        *   video download entirely, fixing autoplay failures and bandwidth waste.
        * - Desktop (>768px): full autoplay video experience preserved unchanged. */}
      {isMobile ? (
        /* Decorative fallback image — alt="" because it serves the same purely
         * visual background role as the video (Req 2.6). Styled via
         * .heroFallbackImage to cover the full hero area with object-fit: cover,
         * matching the video's visual coverage on desktop (Req 2.4). */
        <img
          src="/hero-fallback.jpg"
          alt=""
          className={styles.heroFallbackImage}
        />
      ) : (
        /* Background video — autoplay, muted, looping, with poster fallback image.
         * poster="/hero-fallback.jpg" displays while video loads or if it fails (BUG-029/035).
         * aria-label provides context for screen readers (BUG-041, Req 13.8). */
        <video
          className={styles.heroVideo}
          autoPlay
          muted
          loop
          playsInline
          poster="/hero-fallback.jpg"
          aria-label="Background video showing professional financial advisory imagery"
        >
          <source src="/hero_video.mp4" type="video/mp4" />
        </video>
      )}

      {/* Semi-transparent navy overlay — sits between video (z-index 0) and
        * content (z-index 2) to ensure text readability (Req 2.3) */}
      <div className={styles.heroOverlay} />

      {/* Hero content — heading, subtitle, and CTA buttons positioned above overlay */}
      <div className={styles.heroContent}>
        {/* Main heading — Playfair Display italic, 3.8rem desktop / 2rem mobile (Req 2.6) */}
        <h1 className={styles.heroHeading}>
          Your Wealth,<br />Your Legacy.
        </h1>

        {/* Subtitle — light white text (opacity 0.75), max-width 540px (Req 2.7).
          * Text sourced directly from prototype/index.html hero section. */}
        <p className={styles.heroSubtitle}>
          Trusted financial advice to help you plan with confidence, protect
          what matters and build lasting wealth.
        </p>

        {/* CTA buttons — use global .btn classes defined in globals.css.
          * Side by side on desktop, stacked vertically on mobile ≤768px (Req 2.8).
          * Button styles (.btn-hero-primary, .btn-hero-secondary) are NOT redefined
          * in the module CSS — they come from the shared globals. */}
        <div className={styles.heroButtons}>
          {/* Primary CTA — solid steel blue (#7a9bb5) fill with white text.
            * Smooth-scrolls to the contact form section (Req 2.9, 2.11). */}
          <a href="#contact" className="btn btn-hero-primary">
            Get In Touch
          </a>

          {/* Secondary CTA — white outlined, transparent fill.
            * Smooth-scrolls to the newsletter section (Req 2.10, 2.12). */}
          <a href="#newsletter" className="btn btn-hero-secondary">
            Subscribe to Newsletter
          </a>
        </div>
      </div>
    </section>
  );
}
