/**
 * PartnersCarousel.tsx — Client Component for the partner logo carousel.
 *
 * Renders the carousel container with ARIA attributes for accessibility,
 * the logo track with translateX-based scrolling, and handles progressive
 * enhancement from native scroll to JS-powered carousel.
 *
 * In scrolling mode: auto-scroll, drag/swipe, keyboard nav, infinite loop.
 * In static mode: centred flex row, no carousel features or ARIA attributes.
 *
 * Progressive enhancement flow:
 * 1. Server renders logos in a natively scrollable container (no-JS fallback)
 * 2. useCarousel hook measures container vs logo widths on hydration
 * 3. If logos overflow → scrolling mode (auto-scroll, drag, keyboard, loop)
 * 4. If logos fit → static mode (centred flex, no carousel behaviour)
 *
 * @module PartnersCarousel
 * @requirements 1.1–1.7, 2.1–2.7, 3.1–3.4, 4.3–4.8, 5.1–5.3, 6.1–6.6, 7.1–7.5, 8.1–8.8
 */
'use client';

import type { PartnerLogo } from '@/lib/types';
import styles from './Partners.module.css';
import { useCarousel } from './hooks/useCarousel';

/**
 * Props for the PartnersCarousel component.
 * Accepts an array of partner logo data — the hook determines whether
 * to render in carousel or static mode based on container width.
 */
interface PartnersCarouselProps {
  /** Array of partner logo data — supports 1 to 32 entries (Req 8.1) */
  logos: PartnerLogo[];
}

/**
 * Partner logo carousel with progressive enhancement.
 *
 * Delegates all carousel logic (auto-scroll, drag, keyboard, infinite loop,
 * fit detection, reduced motion) to the useCarousel hook. This component
 * is a thin rendering layer that applies the hook's state to the DOM.
 *
 * @param props.logos - Array of partner logo data to display
 * @returns Carousel JSX or empty fragment if no logos provided
 */
export default function PartnersCarousel({ logos }: PartnersCarouselProps) {
  /**
   * Destructure all carousel state and handlers from the hook.
   * - containerRef/trackRef: DOM refs for ResizeObserver and transform
   * - offset: current translateX value in px (negative = scrolled left)
   * - isScrolling: true when logos exceed container width (carousel mode active)
   * - isDragging: true during active pointer drag (controls cursor style)
   * - isDuplicated: true when logos are cloned for infinite loop
   * - isReady: true after the first ResizeObserver fit evaluation completes;
   *   prevents applying .staticMode before measurement (which would cause
   *   flex-wrap: wrap and prevent the carousel from activating)
   * - onPointerDown/Move/Up, onKeyDown: event handlers for user interaction
   */
  const {
    containerRef,
    trackRef,
    offset,
    isScrolling,
    isDragging,
    isDuplicated,
    isReady,
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onKeyDown,
  } = useCarousel(logos.length, { gap: 48, logoWidth: 160, speed: 15 });

  // Zero logos — render nothing (Req 8.1 edge case)
  if (logos.length === 0) {
    return <></>;
  }

  /**
   * Build className string for the outer container.
   *
   * Progressive enhancement class application:
   * - Always: .carouselContainer (base with overflow-x: auto no-JS fallback)
   * - Before first measurement (!isReady): NO mode class — base CSS uses
   *   flex-wrap: nowrap so logos overflow horizontally. This is critical because
   *   applying .staticMode before measurement would set flex-wrap: wrap, causing
   *   logos to wrap and fit, which prevents the carousel from ever activating.
   * - After measurement + scrolling: .jsEnhanced (hides scrollbar) + cursor class
   * - After measurement + static: .staticMode (centred flex-wrap layout)
   */
  const containerClasses = [
    styles.carouselContainer,
    /* Apply .jsEnhanced only after measurement confirms logos overflow */
    isReady && isScrolling ? styles.jsEnhanced : '',
    /* Apply .staticMode only after measurement confirms logos fit */
    isReady && !isScrolling ? styles.staticMode : '',
    /* Grab cursor when carousel is idle and hoverable (Req 1.6) */
    isScrolling && !isDragging ? styles.grabCursor : '',
    /* Grabbing cursor during active pointer drag (Req 1.5) */
    isScrolling && isDragging ? styles.grabbingCursor : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      ref={containerRef}
      className={containerClasses}
      /* In scrolling mode: add ARIA carousel landmark attributes (Req 6.1),
       * tabIndex for keyboard focusability, and pointer/keyboard handlers.
       * In static mode: no ARIA carousel attributes or handlers (Req 8.3). */
      {...(isScrolling
        ? {
            role: 'region',
            'aria-roledescription': 'carousel',
            'aria-label': 'Trusted partner logos',
            tabIndex: 0,
            onPointerDown,
            onPointerMove,
            onPointerUp,
            onKeyDown,
          }
        : {})}
    >
      {/* Logo track — receives translateX transform in scrolling mode only.
       * In static mode, no transform is applied so logos render in their
       * natural flex position (centred via CSS). */}
      <div
        ref={trackRef}
        className={styles.logoTrack}
        style={isScrolling ? { transform: `translateX(${offset}px)` } : undefined}
      >
        {/* Original logo set — loading="lazy" for deferred loading since
         * this section is below the fold (Req 7.3) */}
        {logos.map((partner) => (
          <img
            key={partner.name}
            src={partner.src}
            alt={partner.alt}
            className={styles.partnerLogo}
            loading="lazy"
            width={160}
            height={70}
          />
        ))}

        {/* Duplicated set for infinite looping — only rendered when the hook
         * determines logos exceed the container width (isDuplicated = true).
         * Uses loading="eager" because translateX-scrolled images don't
         * reliably trigger the browser's lazy load observer (Req 7.3).
         * aria-hidden="true" prevents screen readers from announcing
         * the duplicate logos a second time (accessibility). */}
        {isDuplicated &&
          logos.map((partner) => (
            <img
              key={`dup-${partner.name}`}
              src={partner.src}
              alt={partner.alt}
              className={styles.partnerLogo}
              loading="eager"
              width={160}
              height={70}
              aria-hidden="true"
            />
          ))}
      </div>
    </div>
  );
}
