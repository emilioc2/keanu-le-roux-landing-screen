/**
 * Site-wide configuration data used across multiple components.
 *
 * Centralises navigation links, contact details, partner logos,
 * newsletter URL, and footer social links so they can be updated
 * in one place rather than scattered across components.
 *
 * All values are sourced from the approved prototype (prototype/index.html).
 * This data is static and not CMS-managed.
 *
 * @module siteConfig
 * @requirements
 *   1.4 (nav links: logo + 5 section links)
 *   7.6 (external newsletter URL)
 *   8.3 (5 partner logo placeholders)
 *   10.2 (footer contact info + social links)
 */

import type { NavLink, PartnerLogo } from '@/lib/types';

/**
 * Primary navigation links rendered in the Navbar.
 *
 * On the landing page these resolve as anchor links (#section).
 * On the blog detail page, the Navbar component prefixes them
 * with "/" (e.g. /#about) so they navigate back to the landing page.
 *
 * Order matches the prototype: Home, About, Services, Insights,
 * Testimonials, Get In Touch. The last item uses `isCta: true` to
 * render as a steel-blue pill button in the navbar (Req 3 AC 1–6).
 */
export const navLinks: NavLink[] = [
  { label: 'Home', href: '#hero' },
  { label: 'About', href: '#about' },
  { label: 'Services', href: '#services' },
  { label: 'Insights', href: '#blog' },
  /* Testimonials link added for the new social proof section (ENH-1, Req 3 AC 3) */
  { label: 'Testimonials', href: '#testimonials' },
  /* CTA pill button — isCta triggers .navCta.navCtaBlue styling in Navbar (ENH-2, Req 3 AC 1) */
  { label: 'Get In Touch', href: '#contact', isCta: true },
];

/**
 * Contact information displayed in the Footer component.
 *
 * - `email` renders as a clickable `mailto:` link (Req 10.5)
 * - `phone` is displayed as static text in the footer details block
 *
 * Values taken verbatim from the prototype footer section.
 */
export const contactInfo = {
  /** Keanu's professional email — used for the mailto: link in the footer */
  email: 'keanu@thewealthroom.com',
  /** South African mobile number — updated per client request (ENH-11, Req 1 AC 1) */
  phone: '+27 65 572 3909',
} as const;

/**
 * 5 trusted partner brand logos for the Partners section (Req 8.3).
 *
 * Each entry maps to a real logo image in public/images/partners/.
 * These are static assets, not CMS-managed — updated via code deploy.
 *
 * Display: 160×70px per logo, flex layout with 48px gap (24px on mobile).
 *
 * Ashburton and Sygnia were removed — only 5 active partners remain.
 */
export const partnerLogos: PartnerLogo[] = [
  /** Allan Grey — South African asset management firm */
  {
    name: 'Allan Grey',
    src: '/images/partners/Allangrey-300x167.png',
    alt: 'Allan Grey logo',
  },
  /** BrightRock — needs-matched life insurance provider */
  {
    name: 'BrightRock',
    src: '/images/partners/Brightrock-300x167.png',
    alt: 'BrightRock logo',
  },
  /** Discovery — financial services and health group */
  {
    name: 'Discovery',
    src: '/images/partners/Discovery-300x167.png',
    alt: 'Discovery logo',
  },
  /** Momentum — insurance and investment provider */
  {
    name: 'Momentum',
    src: '/images/partners/momentum-300x167.png',
    alt: 'Momentum logo',
  },
  /** Ninety One — global investment manager */
  {
    name: 'Ninety One',
    src: '/images/partners/ninetyone-300x167.png',
    alt: 'Ninety One logo',
  },
];

/**
 * External newsletter signup page URL (Req 7.6).
 *
 * The Newsletter section's "Subscribe" button links here in a new tab.
 * There is no inline email form — the button is a direct external link
 * with target="_blank" and rel="noopener noreferrer" (Req 7.7).
 */
export const newsletterUrl = 'https://newsletter.example.com';

/**
 * Social media profile URLs used in the Footer icon row (Req 10.2).
 *
 * Each link opens in a new tab with rel="noopener noreferrer".
 * Icons display in navy and transition to accent blue on hover (Req 10.3).
 *
 * Order in the footer: YouTube, Instagram, LinkedIn (matches prototype).
 */
export const socialProfileUrls = {
  /** Keanu's YouTube channel */
  youtube: 'https://www.youtube.com/channel/UCx1K9NdhRghMU_TWBDNCC6g',
  /** Keanu's Instagram profile */
  instagram: 'https://www.instagram.com/keanu.leroux01/',
  /** Keanu's LinkedIn profile */
  linkedin: 'https://www.linkedin.com/in/keanu-le-roux-5a4b7a282/',
} as const;
