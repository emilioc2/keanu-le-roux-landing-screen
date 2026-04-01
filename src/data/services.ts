/**
 * Static service data for the Services section accordion.
 *
 * Each entry maps to one accordion item in the Services section.
 * Content is sourced from the approved prototype (prototype/index.html)
 * and uses client-friendly language without financial jargon (Req 4.6).
 *
 * This data is static and not CMS-managed — changes require a code deploy.
 *
 * @module services
 * @requirements 4.3 (7 service items in accordion), 4.6 (client-friendly descriptions)
 */

import type { ServiceItem } from '@/lib/types';

/**
 * The 7 financial advisory services displayed in the Services accordion.
 *
 * Order matters — the first item ("Integrated Wealth Planning") is expanded
 * by default when the page loads (Req 4.4). Descriptions are taken verbatim
 * from the prototype to ensure content parity.
 */
export const services: ServiceItem[] = [
  {
    // Keanu's flagship offering — holistic financial planning
    title: 'Integrated Wealth Planning',
    description:
      'A holistic view of your entire financial life brought into one clear, personalised plan. By aligning your goals, lifestyle, cash flow, investments, protection and long-term strategies, I help you answer the most important question: how much is enough?',
  },
  {
    // Income, family, and asset protection against life events
    title: 'Risk Protection',
    description:
      'Protecting your income, family and assets against life\u2019s uncertainties. Through carefully structured risk solutions, I ensure that illness, disability or unexpected events don\u2019t derail your long-term financial plan.',
  },
  {
    // Medical aid and healthcare cover structuring
    title: 'Healthcare Planning',
    description:
      'Choosing and structuring the right healthcare solutions for your needs and stage of life, with a focus on affordability, appropriate cover and long-term sustainability.',
  },
  {
    // Goal-driven investment and savings strategies
    title: 'Investments & Savings',
    description:
      'Disciplined, goal-driven investment and savings strategies aligned to your objectives, timeframes and risk profile. Focused on long-term growth, diversification and consistency.',
  },
  {
    // Retirement savings, income planning, and strategy
    title: 'Retirement Planning',
    description:
      'Planning for a financially secure and fulfilling retirement with a clear roadmap \u2014 from structuring your savings and investment strategy to income planning so you can retire with confidence.',
  },
  {
    // Business owner financial planning and succession
    title: 'Business Planning',
    description:
      'Integrated planning for business owners that connects business strategy to personal wealth outcomes \u2014 from cash flow and succession to risk and investment planning.',
  },
  {
    // Estate structuring, beneficiaries, and legacy preservation
    title: 'Estate Planning',
    description:
      'Structuring your estate to protect your loved ones and preserve your legacy. Coordinating beneficiaries, estate structures and long-term intentions so your wealth is transferred according to your wishes.',
  },
];
