/**
 * Static social media link data for the Social Feed section.
 *
 * Each entry renders as a clickable card with platform-specific styling
 * (badge colour, preview area, CTA text). Cards open in a new tab with
 * `rel="noopener noreferrer"` for security (Req 6.7).
 *
 * Content and URLs are sourced from the approved prototype (prototype/index.html).
 * This data is static and not CMS-managed (Req 17 is out of scope).
 *
 * @module socialLinks
 * @requirements 6.3 (one card per platform), 6.4 (YouTube card), 6.5 (LinkedIn card), 6.6 (Instagram card)
 */

import type { SocialLink } from '@/lib/types';

/**
 * Social media feed cards displayed in the "Latest Content" section.
 *
 * Order: YouTube → LinkedIn → Instagram (matches the prototype's
 * three-column grid layout from left to right).
 */
export const socialLinks: SocialLink[] = [
  {
    // YouTube card — red (#ff0000) badge, thumbnail preview with centred play button overlay (Req 6.4)
    platform: 'youtube',
    url: 'https://www.youtube.com/watch?v=yQ_eeDbcUIo&t=2s',
    title: 'R50K Post Retirement Income Strategy For a 25 Year Old South African',
    description:
      'Want to retire with R50,000 net monthly income from age 65 to 100? In this video, I break down a powerful long-term wealth strategy for a 25-year-old South African tax resident earning under R32,000 per month (26% tax bracket).',
    ctaText: 'Watch on YouTube \u2192',
  },
  {
    // LinkedIn card — blue (#0077b5) badge, italic serif quote on grey background (Req 6.5)
    platform: 'linkedin',
    url: 'https://www.linkedin.com/in/keanu-le-roux-5a4b7a282/',
    title: 'Thought Leadership Post',
    description:
      'Sharing insights on why goal-based planning outperforms reactive decision-making.',
    ctaText: 'Read on LinkedIn \u2192',
  },
  {
    // Instagram card — pink (#e4405f) badge, gradient preview (gold→pink→purple) (Req 6.6)
    platform: 'instagram',
    url: 'https://www.instagram.com/keanu.leroux01/',
    title: 'Behind the Scenes',
    description:
      'A look at the day-to-day of building a financial advisory practice and serving clients.',
    ctaText: 'View on Instagram \u2192',
  },
];
