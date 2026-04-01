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

import styles from './Hero.module.css';

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
  return (
    <section id="hero" className={styles.hero}>
      {/* Background video — autoplay, muted, looping, with poster fallback image.
        * poster="/hero-fallback.jpg" displays while video loads or if it fails (BUG-029/035).
        * aria-label provides context for screen readers (BUG-041, Req 13.8). */}
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
