'use client';

/**
 * About.tsx — About section component for the landing page.
 *
 * Displays Keanu's professional portrait, bio text, an accordion with
 * three expandable items (approach, qualifications, why work with me),
 * and a "Get Started" CTA button linking to the contact section.
 *
 * This is a Client Component because it renders the Accordion component,
 * which manages expand/collapse state on the client.
 *
 * Layout: Two-column grid on desktop (320px portrait + text), stacks
 * to single column on tablet/mobile (≤900px).
 *
 * Requirements: 3.1–3.9
 * Visual source: prototype/index.html #about section
 */

import Accordion from '@/components/Accordion';
import type { AccordionItem } from '@/components/Accordion';
import styles from './About.module.css';

/**
 * Accordion items for the About section — content sourced directly
 * from the prototype's #aboutAccordion markup.
 * "My approach" is index 0 and opens by default (Req 3.5).
 */
const aboutAccordionItems: AccordionItem[] = [
  {
    title: 'My approach',
    content: (
      <>
        <p>
          I believe financial planning should feel empowering, not overwhelming.
          Every conversation starts with your goals — your lifestyle, your family,
          your ambitions — and from there we build a strategy that&apos;s as unique
          as you are.
        </p>
        <p>
          I focus on education, clarity and long-term thinking. No jargon, no
          pressure, just honest guidance you can trust.
        </p>
      </>
    ),
  },
  {
    title: 'Qualifications & experience',
    content: (
      <p>
        I hold relevant industry qualifications and am an authorised financial
        services representative. My areas of expertise include wealth planning,
        risk protection, investment management, retirement planning and estate
        structuring.
      </p>
    ),
  },
  {
    title: 'Why work with me',
    content: (
      <p>
        You get a dedicated advisor who genuinely cares about your outcomes. I
        take the time to understand your full picture, communicate clearly, and
        stay with you as your life and goals evolve. Your success is my success.
      </p>
    ),
  },
];

/**
 * About — renders the About section of the landing page.
 *
 * Structure:
 * 1. Portrait row: two-column grid with photo + heading/bio text
 * 2. Accordion: three expandable items below the portrait row
 * 3. CTA: centred "Get Started" pill button → #contact
 *
 * @returns The About section JSX element with id="about"
 */
export default function About() {
  return (
    <section className={styles.about} id="about">
      <div className="container">
        {/* Portrait row — 320px image left, text column right (Req 3.1) */}
        <div className={styles.portraitRow}>
          <div className={styles.portrait}>
            {/* Professional headshot — lazy loaded since it's below the fold (Req 14.5) */}
            <img
              src="/keanu.jpg"
              alt="Keanu Le Roux — Financial Advisor"
              loading="lazy"
            />
          </div>

          <div className={styles.introBlock}>
            {/* Section heading — Playfair Display, 2.4rem (Req 3.2) */}
            <h2>Financial Guidance You Can Trust.</h2>

            {/* Bio paragraphs — content matches prototype exactly (Req 3.3) */}
            <p>
              I&apos;m Keanu Le Roux, a qualified financial advisor dedicated to
              helping individuals, families and business owners take control of
              their financial futures. My approach is built on trust, transparency
              and a genuine commitment to understanding your unique goals.
            </p>
            <p>
              With experience across financial planning, wealth management,
              retirement strategy and risk protection, I work alongside you to
              build a plan that evolves with your life. Great advice starts with
              listening — and I&apos;m here to make sure you always feel informed,
              confident and in control.
            </p>
          </div>
        </div>

        {/* Accordion — 3 items, "My approach" open by default (Req 3.4, 3.5, 3.6, 3.7) */}
        <Accordion items={aboutAccordionItems} defaultOpenIndex={0} />

        {/* CTA button — centred pill linking to contact section (Req 3.8) */}
        <div className={styles.cta}>
          <a href="#contact" className="btn">
            Get Started
          </a>
        </div>
      </div>
    </section>
  );
}
