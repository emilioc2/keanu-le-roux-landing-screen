/**
 * Testimonials.tsx — Server Component rendering client testimonial cards.
 *
 * Displays 3 static testimonial cards in a responsive grid (3→2→1 columns).
 * Positioned between Newsletter and Partners in page.tsx to build trust
 * before showing institutional partner logos.
 *
 * Each card is wrapped in ScrollReveal for fade-up animation on viewport entry.
 * The component uses the shared .section-heading class from globals.css for
 * consistent heading typography across sections.
 *
 * NO 'use client' directive — this is a Server Component. ScrollReveal is a
 * Client Component imported as a child, which is valid in the RSC model
 * (Server Components can render Client Components as children).
 *
 * @module Testimonials
 * @requires ScrollReveal — Client Component for fade-up scroll animation
 * @requires Testimonials.module.css — Grid, card, quote, and client styles
 *
 * Requirements: Req 5 AC 1–10
 * Visual source: prototype/index.html #testimonials section
 */

import ScrollReveal from '@/components/ScrollReveal';
import styles from './Testimonials.module.css';

/**
 * Shape of a single testimonial entry.
 * Used for the static inline data array — not exported because
 * testimonial data is section-specific and not shared elsewhere.
 */
interface Testimonial {
  /** The client's testimonial quote text */
  quote: string;
  /** Client display name (e.g. "Sarah M.") */
  name: string;
  /** Client role or tenure descriptor (e.g. "Client since 2023", "Business Owner") */
  role: string;
}

/**
 * Static testimonial data — defined inline rather than in siteConfig
 * because this content is section-specific and not shared elsewhere.
 * Follows the same inline-data pattern as BENEFITS in Newsletter and
 * LINKEDIN_QUOTE in SocialFeed.
 *
 * Content matches Req 5 AC 6 exactly — 3 testimonials with specific
 * names, roles, and quote text from the requirements.
 */
const testimonials: Testimonial[] = [
  {
    /* Card 1: Family/individual client — emphasises understanding and clarity */
    quote:
      'Keanu took the time to truly understand our family\u2019s goals. His advice gave us clarity and confidence in our financial future.',
    name: 'Sarah M.',
    role: 'Client since 2023',
  },
  {
    /* Card 2: Business owner client — emphasises simplification and results */
    quote:
      'Working with Keanu has been a game-changer for my business finances. He simplified what felt overwhelming and built a plan that actually works.',
    name: 'James T.',
    role: 'Business Owner',
  },
  {
    /* Card 3: Retirement planning client — emphasises transparency and control */
    quote:
      'I finally feel in control of my retirement planning. Keanu\u2019s transparent, no-pressure approach is exactly what I was looking for.',
    name: 'Priya N.',
    role: 'Client since 2024',
  },
];

/**
 * Testimonials — renders a section of client testimonial cards with
 * fade-up scroll animations. Uses an off-white background to alternate
 * with the navy newsletter section above and white partners section below.
 *
 * Structure:
 * 1. Section heading: "What My Clients Say" + subtitle (shared .section-heading)
 * 2. 3-column responsive grid of testimonial cards
 * 3. Each card: decorative quote icon, italic blockquote, client attribution
 *
 * @returns The testimonials section JSX element
 */
export default function Testimonials() {
  return (
    <section id="testimonials" className={styles.testimonials}>
      <div className="container">
        {/* Section heading — uses shared .section-heading class from globals.css
         * for consistent Playfair Display heading at 3rem across all sections.
         * Matches the same pattern used by Services, Blog, SocialFeed, Partners */}
        <div className="section-heading">
          <h2>What My Clients Say</h2>
          <p>
            Real feedback from people I&apos;ve had the privilege of working
            with.
          </p>
        </div>

        {/* Responsive testimonial card grid — 3 columns on desktop,
         * 2 columns at ≤900px, 1 column at ≤768px */}
        <div className={styles.testimonialsGrid}>
          {testimonials.map((testimonial) => (
            /* ScrollReveal wraps each card for fade-up animation on viewport entry.
             * Key uses client name since it's unique across the static dataset.
             * ScrollReveal is a Client Component — valid as a child of this Server Component */
            <ScrollReveal key={testimonial.name}>
              <article className={styles.testimonialCard}>
                {/* Decorative open-quote mark — aria-hidden since it's purely visual
                 * and should not be read by screen readers. Uses left double quotation
                 * mark (U+201C) in steel-blue (#7a9bb5) matching the prototype */}
                <span className={styles.quoteIcon} aria-hidden="true">
                  {'\u201C'}
                </span>

                {/* Italic blockquote with the client's testimonial text.
                 * flex:1 in CSS ensures this fills available space, pushing
                 * client attribution to the bottom for consistent card heights */}
                <blockquote className={styles.quote}>
                  {testimonial.quote}
                </blockquote>

                {/* Client attribution — name in semi-bold navy for emphasis,
                 * role in muted grey (--gray-600) for visual hierarchy */}
                <div className={styles.client}>
                  <span className={styles.clientName}>{testimonial.name}</span>
                  <span className={styles.clientRole}>{testimonial.role}</span>
                </div>
              </article>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
