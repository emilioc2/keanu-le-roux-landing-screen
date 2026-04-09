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
      /* Updated content: 3 paragraphs covering personal finance philosophy,
       * behavioural coaching with Advisor's Alpha framework (1.5% net returns),
       * and clarity/education/long-term thinking focus. */
      <>
        <p>
          As the saying goes, &apos;personal finance is more personal than it is
          finance.&apos; Every conversation begins with understanding your
          life—your values, family, and ambitions—before shaping a strategy
          aligned to what matters most to you.
        </p>
        <p>
          My approach emphasises behavioural coaching, recognising that long-term
          success is driven as much by disciplined decision-making as by investment
          selection. Research, including the &apos;Advisor&apos;s Alpha&apos;
          framework, shows that effective guidance can add up to 1.5% per year in
          net returns by helping clients avoid costly, emotionally-driven decisions.
        </p>
        <p>
          I focus on clarity, education, and long-term thinking—providing objective
          guidance without unnecessary complexity or pressure, so you remain
          confident, informed, and committed through every stage of your financial
          journey.
        </p>
      </>
    ),
  },
  {
    title: 'Qualifications & experience',
    content: (
      /* Updated content: 3 paragraphs detailing specific qualifications (B.Th from
       * SA Theological Seminary, PGDip from Stellenbosch, CFP® in progress),
       * RE5/Class of Business credentials with specialisation areas, and career
       * progression from Discovery → The Wealth Room → Independent Wealth Manager. */
      <>
        <p>
          I hold a Bachelor of Theology from the South African Theological Seminary
          and a Postgraduate Diploma in Business Management from Stellenbosch
          Business School, and I am preparing to complete my CFP&reg; certification.
        </p>
        <p>
          As an authorised Financial Services Representative (RE5 and Class of
          Business certified), I specialise in private wealth management, investment
          strategy, risk protection, retirement planning, and estate structuring.
        </p>
        <p>
          I began my career at Discovery, completed my supervision at The Wealth
          Room, and now operate as an Independent Wealth Manager, delivering
          bespoke, holistic solutions tailored to each client&apos;s long-term goals.
        </p>
      </>
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
            {/* Professional headshot — alt text uses "Independent Wealth Manager" branding per prototype.
             * Lazy loaded since it's below the fold (Req 14.5). */}
            <img
              src="/keanu.jpg"
              alt="Keanu Le Roux, Independent Wealth Manager"
              loading="lazy"
            />
          </div>

          <div className={styles.introBlock}>
            {/* Section heading — Playfair Display, 2.4rem (Req 3.2) */}
            <h2>Financial Guidance You Can Trust.</h2>

            {/* Bio paragraphs — 4 paragraphs covering: (1) Independent Wealth Manager
             * positioning, (2) objective/holistic approach free from conflicts of interest,
             * (3) FSP licensing with Category I and II licences, (4) fiduciary duty
             * commitment. Content matches updated prototype exactly (Req 3.3). */}
            <p>
              I&apos;m Keanu Le Roux, an Independent Wealth Manager focused on helping
              individuals, families, and business owners build and protect long-term
              wealth with clarity and confidence.
            </p>
            <p>
              I provide objective, unbiased financial advice that is free from conflicts
              of interest, grounded in a holistic approach to financial planning. By
              considering all aspects of your financial position, I develop integrated
              strategies tailored to your unique goals and evolving needs.
            </p>
            <p>
              I am contracted to a licensed Financial Services Provider (FSP) holding
              both Category I and Category II licences, enabling the provision of
              comprehensive advice alongside discretionary investment management solutions.
            </p>
            <p>
              My approach is underpinned by a fiduciary duty to act in your best interests
              at all times—ensuring transparency, ongoing review, and that you remain
              informed, confident, and in control of your financial future.
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
