'use client';

/**
 * ScrollReveal.tsx — IntersectionObserver wrapper that fades in and slides up
 * child elements as they enter the viewport.
 *
 * Used to wrap blog cards and social feed cards for entrance animations.
 * Fixes BUG-001: the prototype targeted wrong CSS classes (.process-col);
 * this component is applied directly to the correct card wrappers.
 *
 * Animation: opacity 0 → 1, translateY(20px) → 0, 0.6s ease transition.
 * Observer config: threshold 0.1, rootMargin '0px 0px -40px 0px'.
 *
 * No CSS Module needed — uses inline styles for the animation since the
 * styles are simple and tightly coupled to the observer logic.
 *
 * Requirements: 12.1
 * Visual source: prototype/script.js (scroll reveal section)
 */

import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';

/** Props accepted by the ScrollReveal component */
export interface ScrollRevealProps {
  /** Content to wrap with the reveal animation */
  children: ReactNode;
  /** Optional additional CSS class name for the wrapper div */
  className?: string;
}

/**
 * ScrollReveal — wraps children in a div that starts invisible and slides up
 * when it enters the viewport, using IntersectionObserver.
 *
 * The animation fires once (observer disconnects after reveal) to avoid
 * re-triggering on scroll-back.
 *
 * @param props.children - React content to animate on scroll
 * @param props.className - Optional CSS class for the wrapper element
 */
export default function ScrollReveal({ children, className }: ScrollRevealProps) {
  /* Ref to the wrapper div that the IntersectionObserver watches */
  const ref = useRef<HTMLDivElement>(null);

  /* Track whether the element has been revealed (entered viewport) */
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    /**
     * IntersectionObserver callback — when the element enters the viewport
     * (isIntersecting), mark it as visible and stop observing.
     * threshold: 0.1 means 10% of the element must be visible.
     * rootMargin: '-40px' on bottom triggers slightly before full entry.
     */
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          /* Unobserve after reveal — animation is one-shot */
          observer.unobserve(element);
        }
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -40px 0px',
      }
    );

    observer.observe(element);

    /* Cleanup: disconnect observer on unmount to prevent memory leaks */
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        /* Start hidden and shifted down 20px; transition to visible and in-place */
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
        /* 0.6s ease matches the prototype's transition timing exactly */
        transition: 'opacity 0.6s ease, transform 0.6s ease',
      }}
    >
      {children}
    </div>
  );
}
