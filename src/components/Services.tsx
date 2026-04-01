'use client';

/**
 * Services.tsx — Services section component for the landing page.
 *
 * Displays the "What I Offer" heading, a three-column image row of
 * service-related landscape photos, and an accordion listing all 7
 * financial advisory services with expandable descriptions.
 *
 * This is a Client Component ('use client') because it renders the
 * Accordion component, which manages expand/collapse state on the client.
 *
 * Layout:
 * - Centred heading + subtitle using the shared .section-heading class
 * - 3-column image grid (collapses to 1 column at ≤900px viewport)
 * - Accordion with 7 items; "Integrated Wealth Planning" (index 0) open by default
 *
 * @module Services
 * @requirements 4.1–4.6
 * @visual-source prototype/index.html #services section
 */

import Accordion from '@/components/Accordion';
import type { AccordionItem } from '@/components/Accordion';
import { services } from '@/data/services';
import styles from './Services.module.css';

/**
 * Service images sourced from the prototype's .services-images section.
 * These are Unsplash URLs with desaturation applied (&sat=-100) to match
 * the prototype's greyscale aesthetic. Each image has a descriptive alt
 * attribute for accessibility (Req 13.2).
 */
const serviceImages = [
  {
    /* Financial planning consultation — first column image */
    src: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600&q=75&sat=-100',
    alt: 'Financial planning consultation',
  },
  {
    /* Investment and savings — second column image */
    src: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=600&q=75&sat=-100',
    alt: 'Investment and savings growth',
  },
  {
    /* Estate and retirement — third column image */
    src: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=600&q=75&sat=-100',
    alt: 'Estate and retirement planning',
  },
];

/**
 * Map service data items to AccordionItem format.
 * Each service's description string is wrapped in a <p> element
 * to match the prototype's accordion body markup structure.
 * The services array order is preserved — index 0 ("Integrated Wealth
 * Planning") will be the default open item (Req 4.4).
 */
const accordionItems: AccordionItem[] = services.map((service) => ({
  title: service.title,
  /* Wrap description in <p> to match prototype's accordion-body-inner markup */
  content: <p>{service.description}</p>,
}));

/**
 * Services — renders the Services section of the landing page.
 *
 * Structure:
 * 1. Section heading: "What I Offer" + subtitle (shared .section-heading class)
 * 2. Image row: 3-column grid of landscape service images (180px tall)
 * 3. Accordion: 7 service items with expandable descriptions
 *
 * @returns The Services section JSX element with id="services"
 */
export default function Services() {
  return (
    <section className={styles.services} id="services">
      <div className="container">
        {/* Section heading — uses shared .section-heading class from globals.css
         * for centred Playfair Display heading at 3rem (Req 4.1) */}
        <div className="section-heading">
          <h2>What I Offer</h2>
          <p>Comprehensive financial services tailored to your unique needs and goals.</p>
        </div>

        {/* Three-column image row — 180px tall, object-fit cover (Req 4.2).
         * Collapses to single column on tablet/mobile (≤900px) via CSS. */}
        <div className={styles.images}>
          {serviceImages.map((image) => (
            <div key={image.alt} className={styles.imageWrapper}>
              {/* loading="lazy" since these images are below the fold (Req 14.5) */}
              <img
                src={image.src}
                alt={image.alt}
                loading="lazy"
              />
            </div>
          ))}
        </div>

        {/* Accordion — 7 service items from services data file.
         * defaultOpenIndex={0} opens "Integrated Wealth Planning" on load (Req 4.4).
         * Only one item can be open at a time (Req 4.5). */}
        <Accordion items={accordionItems} defaultOpenIndex={0} />
      </div>
    </section>
  );
}
