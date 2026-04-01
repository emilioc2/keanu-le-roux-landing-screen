'use client';

/**
 * Accordion.tsx — Reusable accordion component with single-item-open mutual exclusion.
 *
 * Used by the About section (3 items) and Services section (7 items).
 * Only one item can be open at a time per accordion instance — clicking an
 * open item closes it, clicking a closed item opens it and closes the previous.
 *
 * The "+" icon rotates 45° to form "×" when active, and the content panel
 * animates via max-height transition (0.4s ease).
 *
 * Accessibility: Each header <button> carries aria-expanded reflecting state.
 * Focus-visible outlines are inherited from globals.css (BUG-008 fix).
 *
 * Requirements: 3.6, 3.7, 4.5, 12.3, 13.4
 * Visual source: prototype/styles.css (.accordion-* rules)
 */

import { useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import styles from './Accordion.module.css';

/** Shape of a single accordion item passed via the items prop */
export interface AccordionItem {
  /** Header label displayed on the clickable button */
  title: string;
  /** Content revealed when the item is expanded — supports any React content */
  content: ReactNode;
}

/** Props accepted by the Accordion component */
export interface AccordionProps {
  /** Array of accordion items to render */
  items: AccordionItem[];
  /** Index of the item open on initial render. Defaults to 0 (first item). */
  defaultOpenIndex?: number;
}

/**
 * Large max-height value used when an item is expanded.
 * CSS max-height transition animates from 0 to this value (or vice versa).
 * Using a fixed large value avoids reading refs during render while still
 * producing a smooth animation — the element only grows to its natural height.
 */
const OPEN_MAX_HEIGHT = '500px';

/**
 * Accordion — renders a list of expandable/collapsible items.
 *
 * Enforces mutual exclusion: at most one item is open at any time.
 * Uses a large max-height value approach for smooth CSS animation.
 *
 * @param props.items - Array of { title, content } objects
 * @param props.defaultOpenIndex - Which item starts open (default: 0)
 */
export default function Accordion({ items, defaultOpenIndex = 0 }: AccordionProps) {
  /* Track which item index is currently open; -1 means all collapsed */
  const [openIndex, setOpenIndex] = useState<number>(defaultOpenIndex);

  /**
   * Handle click on an accordion header.
   * If the clicked item is already open, close it (set to -1).
   * Otherwise, open the clicked item (closes any previously open item).
   * This enforces the single-item-open mutual exclusion property.
   */
  const handleToggle = useCallback((index: number) => {
    setOpenIndex((prev) => (prev === index ? -1 : index));
  }, []);

  return (
    <div className={styles.accordion}>
      {items.map((item, index) => {
        /* Determine if this item is the currently expanded one */
        const isOpen = openIndex === index;

        return (
          <div key={index} className={styles.item}>
            {/* Header button — aria-expanded reflects open/closed state (Req 13.4) */}
            <button
              className={styles.header}
              aria-expanded={isOpen}
              onClick={() => handleToggle(index)}
              type="button"
            >
              {item.title}
              {/* "+" icon that rotates 45° to "×" when active (Req 3.7) */}
              <span
                className={`${styles.icon} ${isOpen ? styles.iconActive : ''}`}
                aria-hidden="true"
              >
                +
              </span>
            </button>

            {/* Collapsible content panel — animated via max-height transition.
              * When open, max-height is set to a large value (500px) so the
              * content is fully visible. When closed, max-height is 0. */}
            <div
              className={styles.body}
              style={{ maxHeight: isOpen ? OPEN_MAX_HEIGHT : '0px' }}
            >
              <div className={styles.bodyInner}>
                {item.content}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
