/**
 * useCarousel — Custom hook encapsulating all carousel state and side effects.
 *
 * Manages: auto-scroll (rAF), drag/swipe (pointer events), keyboard nav,
 * infinite loop (position reset), fit detection (ResizeObserver),
 * reduced motion (matchMedia), and visibility pausing.
 *
 * Progressive enhancement: the hook enhances a natively scrollable container
 * with JS-powered carousel behaviour. When logos fit within the container,
 * the hook stays in static mode (no carousel features).
 *
 * Architecture: mutable refs are used for values read inside the rAF loop
 * (offset, isDragging, isHovering, etc.) to avoid stale closures. React
 * state is used only for values that need to trigger component re-renders
 * (isScrolling, isDuplicated, offset for transform, isDragging for cursor).
 *
 * @param logoCount - Number of logos in the original (non-duplicated) set
 * @param options   - Configuration for gap, logo width, and scroll speed
 * @returns Refs, state, event handlers, and computed values for the carousel component
 *
 * @module useCarousel
 * @requirements 1.2–1.7, 2.1–2.7, 3.1–3.4, 6.2–6.4, 6.6, 7.2, 7.4, 8.2–8.8
 */

'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

/* ------------------------------------------------------------------ */
/*  Public interfaces                                                  */
/* ------------------------------------------------------------------ */

/**
 * Configuration options for the carousel hook.
 * These values control layout calculations and animation speed.
 */
export interface UseCarouselOptions {
  /** Gap between logos in px — 48px desktop, 24px mobile (Req 4.4, 4.5) */
  gap: number;
  /** Width of each logo in px — fixed at 160px (Req 4.3) */
  logoWidth: number;
  /** Auto-scroll speed in px/s — approximately 15 (Req 2.1) */
  speed: number;
}

/**
 * Return type of the useCarousel hook.
 * Provides refs for DOM attachment, reactive state for rendering,
 * and event handlers for user interaction.
 */
export interface UseCarouselReturn {
  /** Ref to attach to the outer carousel container div */
  containerRef: React.RefObject<HTMLDivElement | null>;
  /** Ref to attach to the inner logo track div */
  trackRef: React.RefObject<HTMLDivElement | null>;
  /** Current translateX offset in px (negative = scrolled left) */
  offset: number;
  /** Whether the carousel is in scrolling mode (logos exceed container) */
  isScrolling: boolean;
  /** Whether a pointer drag is currently active */
  isDragging: boolean;
  /** Whether the logo set has been duplicated for infinite looping */
  isDuplicated: boolean;
  /**
   * Whether the hook has completed its first fit evaluation via ResizeObserver.
   * Before this is true, the component should NOT apply .staticMode (which sets
   * flex-wrap: wrap and can cause logos to wrap, preventing correct width
   * measurement). The base CSS (flex-wrap: nowrap with overflow-x: auto)
   * serves as the no-JS fallback until the first measurement completes.
   */
  isReady: boolean;
  /** Pointer down handler — attach to carousel container (Req 1.7) */
  onPointerDown: (e: React.PointerEvent) => void;
  /** Pointer move handler — attach to carousel container (Req 1.7) */
  onPointerMove: (e: React.PointerEvent) => void;
  /** Pointer up handler — attach to carousel container (Req 1.7) */
  onPointerUp: (e: React.PointerEvent) => void;
  /** Keyboard handler — attach to carousel container (Req 6.2) */
  onKeyDown: (e: React.KeyboardEvent) => void;
}

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

/**
 * Maximum deltaTime in ms to prevent large offset jumps.
 * After a tab switch or long frame drop, the elapsed time can be huge.
 * Capping at 100ms ensures the carousel never jumps more than ~1.5px
 * at the default 15px/s speed (Req 2.6, 2.7).
 */
const MAX_DELTA_MS = 100;

/**
 * Debounce delay for ResizeObserver callback.
 * Prevents excessive recalculation during window resize drag (Req 8.6).
 */
const RESIZE_DEBOUNCE_MS = 150;

/**
 * Duration of the smooth CSS transition applied during keyboard navigation.
 * Only used when reduced motion is NOT active (Req 6.2, 6.4).
 */
const KEYBOARD_TRANSITION_MS = 300;

/* ------------------------------------------------------------------ */
/*  Hook implementation                                                */
/* ------------------------------------------------------------------ */

/**
 * Custom hook that manages all carousel behaviour for the Partners section.
 *
 * The hook follows a progressive enhancement pattern:
 * - On mount, a ResizeObserver measures whether logos fit the container
 * - If they fit → static mode (centred flex, no carousel features)
 * - If they overflow → scrolling mode (auto-scroll, drag, keyboard, infinite loop)
 * - On resize, the mode is re-evaluated dynamically (Req 8.6–8.8)
 *
 * @param logoCount - Number of original logos (0 = early return, no carousel)
 * @param options   - Layout and animation configuration
 * @returns Object with refs, state, and event handlers for the component
 */
export function useCarousel(
  logoCount: number,
  options: UseCarouselOptions
): UseCarouselReturn {
  const { logoWidth, speed } = options;

  /* ---- DOM refs ---- */
  /** Ref for the outer carousel container — observed by ResizeObserver */
  const containerRef = useRef<HTMLDivElement | null>(null);
  /** Ref for the inner logo track — receives translateX transform */
  const trackRef = useRef<HTMLDivElement | null>(null);

  /* ---- Reactive state (triggers re-renders for the component) ---- */
  /** Current translateX offset — drives the track transform style */
  const [offset, setOffset] = useState(0);
  /** Whether logos exceed container width — controls carousel vs static mode */
  const [isScrolling, setIsScrolling] = useState(false);
  /** Whether a pointer drag is active — controls cursor style */
  const [isDragging, setIsDragging] = useState(false);
  /** Whether logos are duplicated for infinite loop — controls render count */
  const [isDuplicated, setIsDuplicated] = useState(false);
  /**
   * Tracks whether the first ResizeObserver fit evaluation has completed.
   * Starts false so the component renders with base CSS only (flex-wrap: nowrap,
   * overflow-x: auto) — the no-JS fallback. This prevents .staticMode's
   * flex-wrap: wrap from causing logos to wrap and fit within the container
   * before the hook can measure whether they actually overflow. Once the first
   * evaluateFit call runs, this becomes true and the correct mode class is applied.
   */
  const [isReady, setIsReady] = useState(false);

  /* ---- Mutable refs (read inside rAF loop without stale closures) ---- */
  /** Tracks pointer hover state — pauses auto-scroll on hover (Req 2.2) */
  const isHoveringRef = useRef(false);
  /** Mirrors isDragging state for rAF loop access without re-render dependency */
  const isDraggingRef = useRef(false);
  /** Tracks document visibility — pauses rAF when tab is hidden (Req 2.6) */
  const isPageVisibleRef = useRef(true);
  /** Tracks OS reduced motion preference — disables auto-scroll (Req 6.3) */
  const reducedMotionRef = useRef(false);
  /** Mirrors isScrolling state for rAF loop and event handler access */
  const isScrollingRef = useRef(false);

  /* ---- Drag tracking refs ---- */
  /** X coordinate at drag start — used to compute deltaX on each move */
  const dragStartXRef = useRef(0);

  /* ---- Animation frame tracking ---- */
  /** Current rAF ID for cancellation on cleanup */
  const rafIdRef = useRef<number | null>(null);
  /**
   * Timestamp of the last animation frame.
   * Set to null when paused so the first frame after resume doesn't
   * produce a huge deltaTime (Req 2.3, 2.5, 2.7).
   */
  const lastFrameTimeRef = useRef<number | null>(null);

  /**
   * Mutable offset mirror for the rAF loop.
   * The rAF callback reads this instead of the state value to avoid
   * stale closures — state updates are batched by React and may not
   * be visible inside the same frame.
   */
  const offsetRef = useRef(0);

  /**
   * Current gap between logos in px.
   * Read from computed style on each ResizeObserver callback to handle
   * the 48px ↔ 24px breakpoint change at 768px (Req 4.4, 4.5).
   */
  const currentGapRef = useRef(options.gap);

  /* ---- Timer and observer refs for cleanup ---- */
  /** ResizeObserver debounce timer — cleared on unmount (Task 2.7) */
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  /** ResizeObserver instance — disconnected on unmount (Task 2.7) */
  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  /** matchMedia query list — listener removed on unmount (Task 2.7) */
  const mediaQueryRef = useRef<MediaQueryList | null>(null);
  /** Keyboard transition timer — cleared after transition ends or on unmount */
  const keyboardTransitionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* ================================================================ */
  /*  Task 2.1: Fit detection logic                                   */
  /*                                                                   */
  /*  Compares total logo width against container width to determine   */
  /*  whether the carousel should be in scrolling or static mode.      */
  /*  Called from the debounced ResizeObserver callback.                */
  /*  Reads the current gap from computed style to handle responsive   */
  /*  breakpoint changes (48px → 24px at ≤768px).                     */
  /* ================================================================ */

  /**
   * Evaluates whether logos fit within the container and toggles mode.
   *
   * Formula: totalLogosWidth = logoCount * logoWidth + (logoCount - 1) * gap
   * If totalLogosWidth > containerWidth → scrolling mode (Req 8.5)
   * If totalLogosWidth ≤ containerWidth → static mode (Req 8.2–8.4)
   *
   * On mode transition: resets offset to 0 and toggles isDuplicated.
   *
   * @param containerWidth - Current width of the carousel container in px
   */
  const evaluateFit = useCallback(
    (containerWidth: number) => {
      if (logoCount <= 0) return;

      // Read current gap from computed style of track element.
      // This is necessary because the CSS gap changes at the 768px breakpoint
      // (48px desktop → 24px mobile), and the fit calculation must use the
      // actual rendered gap, not the initial prop value.
      const track = trackRef.current;
      if (track) {
        const computedGap = parseFloat(getComputedStyle(track).gap);
        if (!isNaN(computedGap)) {
          currentGapRef.current = computedGap;
        }
      }

      const gap = currentGapRef.current;
      // Total width needed to display all logos in a single row
      const totalLogosWidth = logoCount * logoWidth + (logoCount - 1) * gap;

      const shouldScroll = totalLogosWidth > containerWidth;

      // Only update scrolling state if mode actually changed — avoids unnecessary
      // re-renders and offset resets during normal resize within the same mode
      if (shouldScroll !== isScrollingRef.current) {
        isScrollingRef.current = shouldScroll;
        // Reset offset to 0 on mode transition so the carousel starts
        // from a clean position (Req 8.7, 8.8)
        offsetRef.current = 0;
        setOffset(0);
        setIsScrolling(shouldScroll);
        setIsDuplicated(shouldScroll);
        // Reset rAF timing so auto-scroll starts fresh after mode change
        lastFrameTimeRef.current = null;
      }

      // Signal that the first fit evaluation is complete. The component uses
      // this to know when it's safe to apply .staticMode or .jsEnhanced.
      // Before this, the base CSS (nowrap + overflow-x: auto) is used to
      // ensure logos don't wrap during the initial measurement.
      setIsReady(true);
    },
    [logoCount, logoWidth]
  );

  /* ================================================================ */
  /*  Task 2.6: Reduced motion and visibility detection               */
  /*                                                                   */
  /*  Sets up two browser API listeners:                               */
  /*  1. matchMedia for prefers-reduced-motion — disables auto-scroll  */
  /*     and enables instant snapping (Req 6.3, 6.4)                   */
  /*  2. visibilitychange — pauses rAF when tab is hidden to conserve  */
  /*     CPU and battery (Req 2.6, 2.7)                                */
  /* ================================================================ */

  useEffect(() => {
    if (logoCount <= 0) return;

    // --- Reduced motion detection (Req 6.3) ---
    // Check the OS-level motion preference and listen for runtime changes
    // (e.g., user toggles "Reduce motion" in system settings while page is open)
    const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
    mediaQueryRef.current = mql;
    reducedMotionRef.current = mql.matches;

    /** Updates the reduced motion ref when the OS preference changes at runtime */
    const handleMotionChange = (e: MediaQueryListEvent) => {
      reducedMotionRef.current = e.matches;
    };
    mql.addEventListener('change', handleMotionChange);

    // --- Visibility detection (Req 2.6, 2.7) ---
    // Pause the rAF loop when the tab is hidden to save CPU/battery.
    // On resume, lastFrameTime is reset to null so the first frame
    // doesn't produce a huge deltaTime jump.
    /** Pauses/resumes auto-scroll based on tab visibility */
    const handleVisibility = () => {
      const visible = document.visibilityState === 'visible';
      isPageVisibleRef.current = visible;
      if (visible) {
        // Reset frame time to prevent a large deltaTime on the first
        // frame after the tab becomes visible again (Req 2.7)
        lastFrameTimeRef.current = null;
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    // Task 2.7: Cleanup — remove both listeners on unmount
    return () => {
      mql.removeEventListener('change', handleMotionChange);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [logoCount]);

  /* ================================================================ */
  /*  Task 2.1 (cont): ResizeObserver setup                          */
  /*                                                                   */
  /*  Observes the carousel container width and calls evaluateFit      */
  /*  on each change, debounced at 150ms to avoid excessive            */
  /*  recalculation during window resize drag (Req 8.6).               */
  /* ================================================================ */

  useEffect(() => {
    if (logoCount <= 0) return;

    const container = containerRef.current;
    if (!container) return;

    /**
     * ResizeObserver callback — debounced to prevent excessive
     * mode evaluation during rapid window resizing (Req 8.6).
     * Uses the contentRect width from the first entry.
     */
    const observer = new ResizeObserver((entries) => {
      // Clear any pending debounce timer before scheduling a new one
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      debounceTimerRef.current = setTimeout(() => {
        const entry = entries[0];
        if (entry) {
          const containerWidth = entry.contentRect.width;
          evaluateFit(containerWidth);
        }
      }, RESIZE_DEBOUNCE_MS);
    });

    resizeObserverRef.current = observer;
    observer.observe(container);

    // Task 2.7: Cleanup — disconnect observer and clear debounce timer
    return () => {
      observer.disconnect();
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [logoCount, evaluateFit]);

  /* ================================================================ */
  /*  Task 2.2: Auto-scroll via requestAnimationFrame                 */
  /*  Task 2.3: Infinite loop position reset                          */
  /*                                                                   */
  /*  The rAF loop runs continuously but only advances the offset      */
  /*  when all pause conditions are false. This avoids the complexity  */
  /*  of starting/stopping the loop and ensures smooth resume.         */
  /*                                                                   */
  /*  The loop also handles infinite loop resets within the same       */
  /*  frame to prevent visible jumps (Req 3.4).                        */
  /* ================================================================ */

  useEffect(() => {
    if (logoCount <= 0) return;

    /**
     * Animation frame callback — advances offset by speed * deltaTime.
     *
     * Pause conditions (any one pauses auto-scroll):
     * - isHoveringRef: pointer is over the carousel (Req 2.2)
     * - isDraggingRef: active pointer drag (Req 2.4)
     * - !isPageVisibleRef: tab is hidden (Req 2.6)
     * - reducedMotionRef: OS reduced motion preference (Req 6.3)
     * - !isScrollingRef: static mode, logos fit container (Req 8.3)
     *
     * @param timestamp - High-resolution timestamp from requestAnimationFrame
     */
    const animate = (timestamp: number) => {
      // Schedule next frame first — ensures the loop continues even if
      // we return early due to pause conditions
      rafIdRef.current = requestAnimationFrame(animate);

      // Don't advance in static mode — no carousel behaviour needed
      if (!isScrollingRef.current) {
        lastFrameTimeRef.current = null;
        return;
      }

      // Check all pause conditions — if any is true, pause auto-scroll
      // but keep the loop running so we can resume instantly
      const shouldPause =
        isHoveringRef.current ||
        isDraggingRef.current ||
        !isPageVisibleRef.current ||
        reducedMotionRef.current;

      if (shouldPause) {
        // Reset lastFrameTime so the first frame after resume doesn't
        // produce a huge deltaTime (Req 2.3, 2.5, 2.7)
        lastFrameTimeRef.current = null;
        return;
      }

      // First frame after resume — record timestamp, don't advance yet
      if (lastFrameTimeRef.current === null) {
        lastFrameTimeRef.current = timestamp;
        return;
      }

      // Calculate time elapsed since last frame
      let deltaMs = timestamp - lastFrameTimeRef.current;
      lastFrameTimeRef.current = timestamp;

      // Cap deltaTime to prevent large jumps after frame drops or
      // brief visibility changes that slip through (Task 2.2)
      if (deltaMs > MAX_DELTA_MS) {
        deltaMs = MAX_DELTA_MS;
      }

      const deltaSec = deltaMs / 1000;

      // Advance offset leftward (negative direction) at configured speed
      let newOffset = offsetRef.current - speed * deltaSec;

      // --- Task 2.3: Infinite loop position reset ---
      // When the offset crosses a set boundary, reset it to the equivalent
      // position in the other set. This happens within the same rAF frame
      // so the user sees continuous, uninterrupted motion (Req 3.4).
      const gap = currentGapRef.current;
      const oneSetWidth = logoCount * (logoWidth + gap);

      // Scrolled past the end of the first set → jump back to start
      if (newOffset <= -oneSetWidth) {
        newOffset += oneSetWidth;
      }
      // Scrolled past the beginning (e.g., from drag) → jump to end
      else if (newOffset > 0) {
        newOffset -= oneSetWidth;
      }

      offsetRef.current = newOffset;
      setOffset(newOffset);
    };

    // Start the animation loop
    rafIdRef.current = requestAnimationFrame(animate);

    // Task 2.7: Cleanup — cancel the animation frame on unmount
    return () => {
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
    };
  }, [logoCount, logoWidth, speed]);

  /* ================================================================ */
  /*  Task 2.4: Drag/swipe via pointer events                        */
  /*                                                                   */
  /*  Uses pointer events for unified mouse/touch/pen handling on      */
  /*  hybrid devices like Surface Pro (Req 1.7).                       */
  /*  setPointerCapture ensures move/up events are received even if    */
  /*  the pointer leaves the carousel container during a drag.         */
  /* ================================================================ */

  /**
   * Handles pointer down — initiates a drag interaction.
   * Records the starting X position and captures the pointer so that
   * subsequent move/up events are delivered even outside the element.
   *
   * @param e - React pointer event from the carousel container
   */
  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      // Only handle drag in scrolling mode with valid logo count
      if (logoCount <= 0 || !isScrollingRef.current) return;

      dragStartXRef.current = e.clientX;
      isDraggingRef.current = true;
      setIsDragging(true);

      // Capture pointer to receive move/up events even if pointer
      // leaves the carousel container during drag (Req 1.7)
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    },
    [logoCount]
  );

  /**
   * Handles pointer move — updates offset during an active drag.
   * Computes the horizontal delta from the last recorded position,
   * applies it to the offset, and resets the start position for
   * incremental tracking.
   *
   * Calls preventDefault to suppress text selection and native
   * scroll interference during drag.
   *
   * @param e - React pointer event from the carousel container
   */
  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isDraggingRef.current) return;

      // Prevent text selection and native scroll during drag
      e.preventDefault();

      // Compute horizontal movement since last recorded position
      const deltaX = e.clientX - dragStartXRef.current;
      // Reset start position for incremental delta tracking
      dragStartXRef.current = e.clientX;

      // Apply delta to offset with infinite loop reset
      const gap = currentGapRef.current;
      const oneSetWidth = logoCount * (logoWidth + gap);

      let newOffset = offsetRef.current + deltaX;

      // Infinite loop reset during drag (Task 2.3) — keeps offset
      // within bounds so the visual position stays consistent
      if (newOffset <= -oneSetWidth) {
        newOffset += oneSetWidth;
      } else if (newOffset > 0) {
        newOffset -= oneSetWidth;
      }

      offsetRef.current = newOffset;
      setOffset(newOffset);
    },
    [logoCount, logoWidth]
  );

  /**
   * Handles pointer up — ends a drag interaction.
   * Clears the dragging state and releases pointer capture.
   * Resets the rAF frame time so auto-scroll resumes smoothly
   * from the current position without a jump (Req 2.5).
   *
   * @param e - React pointer event from the carousel container
   */
  const onPointerUp = useCallback(
    (e: React.PointerEvent) => {
      if (!isDraggingRef.current) return;

      isDraggingRef.current = false;
      setIsDragging(false);

      // Release pointer capture (paired with setPointerCapture in onPointerDown)
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);

      // Reset rAF timing so auto-scroll resumes smoothly from
      // the current position without a large deltaTime jump (Req 2.5)
      lastFrameTimeRef.current = null;
    },
    []
  );

  /* ================================================================ */
  /*  Task 2.5: Keyboard navigation                                   */
  /*                                                                   */
  /*  Arrow keys scroll by exactly one logo width + gap, matching the  */
  /*  visual rhythm of the carousel (Req 6.2).                         */
  /*  With reduced motion: instant offset change, no CSS transition.   */
  /*  Without reduced motion: 300ms ease transition for smooth step.   */
  /*  Tab does not trap focus — it moves naturally (Req 6.6).          */
  /* ================================================================ */

  /**
   * Handles keyboard navigation on the carousel container.
   *
   * ArrowRight: scrolls content right (offset decreases by one step)
   * ArrowLeft: scrolls content left (offset increases by one step)
   * Step size = logoWidth + current gap (Req 6.2)
   *
   * Applies a brief CSS transition for visual smoothness unless
   * reduced motion is active, in which case the change is instant (Req 6.4).
   *
   * @param e - React keyboard event from the carousel container
   */
  const onKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      // Only handle keyboard in scrolling mode with valid logo count
      if (logoCount <= 0 || !isScrollingRef.current) return;

      // Only handle arrow keys — let all other keys pass through
      // (Tab moves focus out naturally, Req 6.6)
      if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;

      // Prevent default page scroll for arrow keys
      e.preventDefault();

      const gap = currentGapRef.current;
      const stepSize = logoWidth + gap;
      const oneSetWidth = logoCount * (logoWidth + gap);

      let newOffset: number;
      if (e.key === 'ArrowRight') {
        // ArrowRight: scroll content rightward → offset becomes more negative
        newOffset = offsetRef.current - stepSize;
      } else {
        // ArrowLeft: scroll content leftward → offset becomes more positive
        newOffset = offsetRef.current + stepSize;
      }

      // Infinite loop reset for keyboard steps
      if (newOffset <= -oneSetWidth) {
        newOffset += oneSetWidth;
      } else if (newOffset > 0) {
        newOffset -= oneSetWidth;
      }

      const track = trackRef.current;

      // Apply smooth transition for keyboard step unless reduced motion
      // is active — in that case, the offset change is instant (Req 6.4)
      if (!reducedMotionRef.current && track) {
        // Apply a brief CSS transition for visual smoothness
        track.style.transition = `transform ${KEYBOARD_TRANSITION_MS}ms ease`;

        // Clear any existing keyboard transition timer to prevent stacking
        if (keyboardTransitionTimerRef.current) {
          clearTimeout(keyboardTransitionTimerRef.current);
        }

        // Remove the transition after it completes so it doesn't interfere
        // with the rAF-driven auto-scroll (which needs instant transform updates)
        keyboardTransitionTimerRef.current = setTimeout(() => {
          if (track) {
            track.style.transition = '';
          }
          keyboardTransitionTimerRef.current = null;
        }, KEYBOARD_TRANSITION_MS);
      }

      offsetRef.current = newOffset;
      setOffset(newOffset);
    },
    [logoCount, logoWidth]
  );

  /* ================================================================ */
  /*  Hover tracking (for auto-scroll pause/resume)                   */
  /*                                                                   */
  /*  Uses native DOM events (pointerenter/pointerleave) rather than   */
  /*  React synthetic events because the hover state needs to be       */
  /*  tracked in a ref for the rAF loop, not as React state.           */
  /*  Pauses auto-scroll on hover (Req 2.2), resumes on leave (2.3).  */
  /* ================================================================ */

  useEffect(() => {
    if (logoCount <= 0) return;

    const container = containerRef.current;
    if (!container) return;

    /** Sets hover flag to pause auto-scroll (Req 2.2) */
    const handlePointerEnter = () => {
      isHoveringRef.current = true;
    };

    /**
     * Clears hover flag to resume auto-scroll (Req 2.3).
     * Resets lastFrameTime so the first frame after resume doesn't
     * produce a large deltaTime jump.
     */
    const handlePointerLeave = () => {
      isHoveringRef.current = false;
      // Reset frame time for smooth resume from current position
      lastFrameTimeRef.current = null;
    };

    container.addEventListener('pointerenter', handlePointerEnter);
    container.addEventListener('pointerleave', handlePointerLeave);

    // Task 2.7: Cleanup — remove hover listeners on unmount
    return () => {
      container.removeEventListener('pointerenter', handlePointerEnter);
      container.removeEventListener('pointerleave', handlePointerLeave);
    };
  }, [logoCount]);

  /* ================================================================ */
  /*  Task 2.7: Cleanup on unmount                                    */
  /*                                                                   */
  /*  All major cleanup is handled in the return functions of          */
  /*  individual useEffect hooks above:                                */
  /*  - ResizeObserver: disconnected in its useEffect cleanup          */
  /*  - requestAnimationFrame: cancelled in its useEffect cleanup      */
  /*  - visibilitychange listener: removed in its useEffect cleanup    */
  /*  - matchMedia change listener: removed in its useEffect cleanup   */
  /*  - Debounce timeout: cleared in ResizeObserver useEffect cleanup  */
  /*  - Hover listeners: removed in hover useEffect cleanup            */
  /*                                                                   */
  /*  This additional effect handles the keyboard transition timer     */
  /*  which may outlive the keyboard event handler.                    */
  /* ================================================================ */

  useEffect(() => {
    // Cleanup keyboard transition timer on unmount
    return () => {
      if (keyboardTransitionTimerRef.current) {
        clearTimeout(keyboardTransitionTimerRef.current);
      }
    };
  }, []);

  /* ================================================================ */
  /*  Return                                                           */
  /* ================================================================ */

  /* Return all state, refs, and handlers for the component to consume */
  return {
    containerRef,
    trackRef,
    offset,
    isScrolling,
    isDragging,
    isDuplicated,
    /** True after the first ResizeObserver fit evaluation — safe to apply mode classes */
    isReady,
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onKeyDown,
  };
}
