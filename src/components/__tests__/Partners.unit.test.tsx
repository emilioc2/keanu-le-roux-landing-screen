/**
 * Partners.unit.test.tsx — Unit tests for the Partners section and PartnersCarousel component.
 *
 * These 12 tests verify specific rendering scenarios and edge cases for the
 * Trusted Partners carousel feature. They cover heading/subtitle rendering,
 * static vs scrolling mode behaviour, ARIA accessibility attributes, cursor
 * class toggling, progressive enhancement fallback, and dynamic logo count
 * edge cases (zero and single logo).
 *
 * Mock strategy:
 * - `window.matchMedia` is mocked because the useCarousel hook uses it for
 *   reduced motion detection, and jsdom doesn't provide a real implementation.
 * - `ResizeObserver` is mocked because jsdom doesn't support it — the hook
 *   uses it to measure container width for fit detection (static vs scrolling).
 * - `requestAnimationFrame` / `cancelAnimationFrame` are mocked because the
 *   hook's auto-scroll rAF loop would run indefinitely in tests otherwise.
 * - Fake timers are used to flush the 150ms debounce in the ResizeObserver
 *   callback, ensuring the hook's fit detection runs synchronously in tests.
 *
 * Test index:
 *   1. Renders heading and subtitle (Req 4.2)
 *   2. Renders all 7 logos in static mode — centred, no duplication (Req 8.2, 8.4)
 *   3. Applies ARIA attributes in scrolling mode (Req 6.1)
 *   4. No ARIA carousel attributes in static mode (Req 8.3)
 *   5. Cursor classes toggle on drag (Req 1.5, 1.6)
 *   6. Tab does not trap focus (Req 6.6)
 *   7. No-JS fallback has overflow-x: auto base CSS (Req 5.1, 5.2)
 *   8. jsEnhanced class applied in scrolling mode (Req 4.6)
 *   9. Section retains visual identity (Req 4.1, 4.7)
 *  10. min-height on carousel container (Req 7.5)
 *  11. Zero logos renders empty without errors (Req 8.1)
 *  12. Single logo renders static — centred, no carousel features (Req 8.1)
 *
 * @module Partners.unit.test
 * @requirements 1.5, 1.6, 4.1, 4.2, 4.6, 4.7, 5.1, 5.2, 6.1, 6.6, 7.5, 8.1, 8.2, 8.3, 8.4
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, cleanup, fireEvent, act } from '@testing-library/react';
import type { PartnerLogo } from '@/lib/types';
import Partners from '../Partners';
import PartnersCarousel from '../PartnersCarousel';

/* ------------------------------------------------------------------ */
/*  Test data                                                          */
/* ------------------------------------------------------------------ */

/**
 * 5 partner logos matching the production siteConfig data.
 * Used by most tests to simulate the real-world logo set.
 * Ashburton and Sygnia removed — only 5 active partners remain.
 * Total width at 48px gap: 5 * 160 + 4 * 48 = 992px.
 */
const fiveLogos: PartnerLogo[] = [
  { name: 'Allan Grey', src: '/images/partners/Allangrey-300x167.png', alt: 'Allan Grey logo' },
  { name: 'BrightRock', src: '/images/partners/Brightrock-300x167.png', alt: 'BrightRock logo' },
  { name: 'Discovery', src: '/images/partners/Discovery-300x167.png', alt: 'Discovery logo' },
  { name: 'Momentum', src: '/images/partners/momentum-300x167.png', alt: 'Momentum logo' },
  { name: 'Ninety One', src: '/images/partners/ninetyone-300x167.png', alt: 'Ninety One logo' },
];

/**
 * Single logo for edge case testing.
 * At 160px wide, this always fits in any reasonable container → static mode.
 */
const singleLogo: PartnerLogo[] = [
  { name: 'Allan Grey', src: '/images/partners/Allangrey-300x167.png', alt: 'Allan Grey logo' },
];

/* ------------------------------------------------------------------ */
/*  Mock helpers                                                       */
/* ------------------------------------------------------------------ */

/**
 * Factory that creates a MockResizeObserver class which immediately invokes
 * its callback with a simulated contentRect of the given width.
 *
 * The useCarousel hook uses ResizeObserver to measure the carousel container
 * and determine whether logos fit (static mode) or overflow (scrolling mode).
 * jsdom doesn't provide ResizeObserver, so we mock it to control the
 * container width seen by the hook.
 *
 * - Wide width (e.g. 2000px): logos fit → static mode (no carousel)
 * - Narrow width (e.g. 500px): logos overflow → scrolling mode (carousel active)
 *
 * @param width - Simulated container width in pixels
 * @returns A MockResizeObserver class to assign to window.ResizeObserver
 */
function createMockResizeObserver(width: number) {
  return class MockResizeObserver {
    /** Stored callback — invoked immediately on observe() */
    callback: ResizeObserverCallback;

    constructor(callback: ResizeObserverCallback) {
      this.callback = callback;
    }

    /**
     * Simulates observing an element by immediately calling the callback
     * with a mock entry containing the configured width.
     * @param target - The DOM element being observed
     */
    observe(target: Element) {
      this.callback(
        [
          {
            contentRect: { width } as DOMRectReadOnly,
            target,
            borderBoxSize: [],
            contentBoxSize: [],
            devicePixelContentBoxSize: [],
          },
        ],
        this as unknown as ResizeObserver
      );
    }

    /** No-op — unobserve is not needed in tests */
    unobserve() {}

    /** No-op — disconnect is not needed in tests */
    disconnect() {}
  };
}

/* ------------------------------------------------------------------ */
/*  Global mocks — set up before each test, torn down after           */
/* ------------------------------------------------------------------ */

beforeEach(() => {
  /**
   * Mock window.matchMedia — the useCarousel hook queries
   * '(prefers-reduced-motion: reduce)' on mount and listens for changes.
   * Default: matches = false (no reduced motion preference).
   */
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    configurable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });

  /**
   * Mock requestAnimationFrame — the hook's auto-scroll loop uses rAF.
   * jsdom doesn't define rAF on window, so we assign it directly rather
   * than using vi.spyOn (which requires the property to already exist).
   * We use setTimeout(0) so it fires once without blocking, preventing
   * infinite rAF loops in tests while still allowing the hook's
   * useEffect to initialise.
   */
  window.requestAnimationFrame = vi.fn((cb: FrameRequestCallback) => {
    return setTimeout(() => cb(performance.now()), 0) as unknown as number;
  });

  /**
   * Mock cancelAnimationFrame — paired with the rAF mock above.
   * Clears the timeout to prevent callbacks after cleanup.
   */
  window.cancelAnimationFrame = vi.fn((id: number) => {
    clearTimeout(id);
  });
});

afterEach(() => {
  /** Clean up rendered DOM to prevent test leakage */
  cleanup();
  /** Restore all mocked functions to their original implementations */
  vi.restoreAllMocks();
  /** Switch back to real timers if fake timers were enabled */
  vi.useRealTimers();
});

/* ================================================================== */
/*  Test 1: Renders heading and subtitle                              */
/*  Verifies the Partners section displays the correct heading and    */
/*  subtitle text as specified in Req 4.2.                            */
/* ================================================================== */

describe('Partners — Renders heading and subtitle', () => {
  it('renders "Trusted Partners" heading and subtitle text', async () => {
    // Use wide container so the carousel stays in static mode (simpler render)
    window.ResizeObserver = createMockResizeObserver(2000) as unknown as typeof ResizeObserver;
    vi.useFakeTimers();

    render(<Partners />);

    // Flush the 150ms debounce in the ResizeObserver callback
    await act(async () => {
      vi.advanceTimersByTime(200);
    });

    /** Verify the h2 heading contains the expected text */
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Trusted Partners');

    /** Verify the subtitle paragraph is present */
    expect(
      screen.getByText(
        /I work with leading financial institutions to deliver the best solutions for my clients/
      )
    ).toBeInTheDocument();
  });
});

/* ================================================================== */
/*  Test 2: Renders all 7 logos in static mode (wide container)       */
/*  With a 2000px container, 7 logos at 1408px total fit → static.    */
/*  Verifies no duplication occurs and all logos are rendered.         */
/*  Req 8.2, 8.4                                                      */
/* ================================================================== */

describe('Partners — Static mode with 7 logos', () => {
  it('renders exactly 7 img elements with no duplication in a wide container', async () => {
    // 2000px container > 1408px total logo width → logos fit → static mode
    window.ResizeObserver = createMockResizeObserver(2000) as unknown as typeof ResizeObserver;
    vi.useFakeTimers();

    render(<PartnersCarousel logos={sevenLogos} />);

    // Flush debounce so fit detection runs
    await act(async () => {
      vi.advanceTimersByTime(200);
    });

    /** Exactly 7 images — no duplication in static mode */
    const images = screen.getAllByRole('img');
    expect(images).toHaveLength(7);

    /** Each logo's alt text should be present in the DOM */
    sevenLogos.forEach((logo) => {
      expect(screen.getByAltText(logo.alt)).toBeInTheDocument();
    });
  });
});

/* ================================================================== */
/*  Test 3: Applies ARIA attributes in scrolling mode                 */
/*  With a 500px container, 7 logos at 1408px overflow → scrolling.   */
/*  The carousel container should have ARIA landmark attributes.      */
/*  Req 6.1                                                            */
/* ================================================================== */

describe('Partners — ARIA attributes in scrolling mode', () => {
  it('has role="region", aria-roledescription="carousel", and aria-label', async () => {
    // 500px container < 1408px total → logos overflow → scrolling mode
    window.ResizeObserver = createMockResizeObserver(500) as unknown as typeof ResizeObserver;
    vi.useFakeTimers();

    render(<PartnersCarousel logos={sevenLogos} />);

    await act(async () => {
      vi.advanceTimersByTime(200);
    });

    /** The carousel container should be identifiable as a region landmark */
    const region = screen.getByRole('region');
    expect(region).toHaveAttribute('aria-roledescription', 'carousel');
    expect(region).toHaveAttribute('aria-label', 'Trusted partner logos');
  });
});

/* ================================================================== */
/*  Test 4: No ARIA carousel attributes in static mode                */
/*  When logos fit the container, no carousel ARIA attributes should   */
/*  be present — the section is just a static flex row.               */
/*  Req 8.3                                                            */
/* ================================================================== */

describe('Partners — No ARIA carousel attributes in static mode', () => {
  it('does not have role="region" or aria-roledescription when logos fit', async () => {
    // Wide container → static mode
    window.ResizeObserver = createMockResizeObserver(2000) as unknown as typeof ResizeObserver;
    vi.useFakeTimers();

    const { container } = render(<PartnersCarousel logos={sevenLogos} />);

    await act(async () => {
      vi.advanceTimersByTime(200);
    });

    /** No element with role="region" should exist in static mode */
    expect(screen.queryByRole('region')).toBeNull();

    /** The outer container div should not carry carousel ARIA attributes */
    const carouselDiv = container.firstElementChild as HTMLElement;
    expect(carouselDiv).not.toHaveAttribute('aria-roledescription');
  });
});

/* ================================================================== */
/*  Test 5: Cursor classes toggle on drag                             */
/*  In scrolling mode, the container should show grab cursor when     */
/*  idle and grabbing cursor during an active pointer drag.           */
/*  Req 1.5, 1.6                                                      */
/* ================================================================== */

describe('Partners — Cursor classes toggle on drag', () => {
  it('has grabCursor when idle and grabbingCursor during pointerdown', async () => {
    // Narrow container → scrolling mode (drag interaction enabled)
    window.ResizeObserver = createMockResizeObserver(500) as unknown as typeof ResizeObserver;
    vi.useFakeTimers();

    const { container } = render(<PartnersCarousel logos={sevenLogos} />);

    await act(async () => {
      vi.advanceTimersByTime(200);
    });

    const carouselDiv = container.firstElementChild as HTMLElement;

    /** Idle state: grab cursor should be present, grabbing should not */
    expect(carouselDiv.className).toMatch(/grabCursor/);
    expect(carouselDiv.className).not.toMatch(/grabbingCursor/);

    /**
     * Mock setPointerCapture — jsdom doesn't support pointer capture,
     * but the hook calls it on pointerdown to track drag outside the element.
     */
    carouselDiv.setPointerCapture = vi.fn();
    carouselDiv.releasePointerCapture = vi.fn();

    /** Simulate pointerdown to initiate a drag */
    await act(async () => {
      fireEvent.pointerDown(carouselDiv, { clientX: 100, pointerId: 1 });
    });

    /** During drag: grabbingCursor should replace grabCursor */
    expect(carouselDiv.className).toMatch(/grabbingCursor/);
  });
});

/* ================================================================== */
/*  Test 6: Tab does not trap focus                                   */
/*  The carousel container should be focusable (tabIndex=0) in        */
/*  scrolling mode, but pressing Tab should NOT be prevented —        */
/*  focus should move naturally to the next element.                  */
/*  Req 6.6                                                            */
/* ================================================================== */

describe('Partners — Tab does not trap focus', () => {
  it('carousel has tabIndex={0} in scrolling mode and Tab key is not prevented', async () => {
    window.ResizeObserver = createMockResizeObserver(500) as unknown as typeof ResizeObserver;
    vi.useFakeTimers();

    const { container } = render(<PartnersCarousel logos={sevenLogos} />);

    await act(async () => {
      vi.advanceTimersByTime(200);
    });

    const carouselDiv = container.firstElementChild as HTMLElement;

    /** Carousel should be keyboard-focusable via tabIndex */
    expect(carouselDiv).toHaveAttribute('tabindex', '0');

    /**
     * Fire a Tab keydown event and verify preventDefault was NOT called.
     * The hook's onKeyDown handler only intercepts ArrowLeft/ArrowRight —
     * Tab should pass through naturally so focus isn't trapped.
     */
    const tabEvent = new KeyboardEvent('keydown', {
      key: 'Tab',
      bubbles: true,
      cancelable: true,
    });
    const preventDefaultSpy = vi.spyOn(tabEvent, 'preventDefault');

    await act(async () => {
      carouselDiv.dispatchEvent(tabEvent);
    });

    /** Tab key should not be intercepted by the carousel */
    expect(preventDefaultSpy).not.toHaveBeenCalled();
  });
});

/* ================================================================== */
/*  Test 7: No-JS fallback has overflow-x: auto                      */
/*  The base .carouselContainer class provides overflow-x: auto for   */
/*  native horizontal scrolling when JavaScript is disabled.          */
/*  Req 5.1, 5.2                                                      */
/* ================================================================== */

describe('Partners — No-JS fallback has overflow-x: auto', () => {
  it('applies the carouselContainer class which provides overflow-x: auto in CSS', async () => {
    window.ResizeObserver = createMockResizeObserver(2000) as unknown as typeof ResizeObserver;
    vi.useFakeTimers();

    const { container } = render(<PartnersCarousel logos={sevenLogos} />);

    await act(async () => {
      vi.advanceTimersByTime(200);
    });

    const carouselDiv = container.firstElementChild as HTMLElement;

    /**
     * The .carouselContainer class is always applied regardless of mode.
     * In CSS, this class sets overflow-x: auto — the no-JS fallback
     * that provides native horizontal scrolling with a visible scrollbar.
     */
    expect(carouselDiv.className).toMatch(/carouselContainer/);
  });
});

/* ================================================================== */
/*  Test 8: jsEnhanced class applied in scrolling mode                */
/*  When logos overflow the container, the hook activates carousel     */
/*  mode and applies .jsEnhanced to hide the native scrollbar and     */
/*  switch to translateX-based scrolling.                             */
/*  Req 4.6                                                            */
/* ================================================================== */

describe('Partners — jsEnhanced class in scrolling mode', () => {
  it('applies jsEnhanced class when carousel mode is active', async () => {
    // Narrow container → scrolling mode → jsEnhanced should be applied
    window.ResizeObserver = createMockResizeObserver(500) as unknown as typeof ResizeObserver;
    vi.useFakeTimers();

    const { container } = render(<PartnersCarousel logos={sevenLogos} />);

    await act(async () => {
      vi.advanceTimersByTime(200);
    });

    const carouselDiv = container.firstElementChild as HTMLElement;

    /** jsEnhanced class indicates JS has taken over from native scroll */
    expect(carouselDiv.className).toMatch(/jsEnhanced/);
  });
});

/* ================================================================== */
/*  Test 9: Section retains visual identity                           */
/*  The Partners section wrapper should have the .partners class,     */
/*  contain the heading, and use the full-width container div.        */
/*  Req 4.1, 4.7                                                      */
/* ================================================================== */

describe('Partners — Section retains visual identity', () => {
  it('has .partners class on section, heading present, and full container width', async () => {
    window.ResizeObserver = createMockResizeObserver(2000) as unknown as typeof ResizeObserver;
    vi.useFakeTimers();

    render(<Partners />);

    await act(async () => {
      vi.advanceTimersByTime(200);
    });

    /** Section element should exist with id="partners" and the .partners CSS class */
    const section = document.getElementById('partners');
    expect(section).not.toBeNull();
    expect(section!.className).toMatch(/partners/);
    expect(section!.tagName).toBe('SECTION');

    /** The "Trusted Partners" heading should be rendered inside the section */
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Trusted Partners');

    /** The .container wrapper div should be present for max-width constraint */
    const containerDiv = section!.querySelector('.container');
    expect(containerDiv).not.toBeNull();
  });
});

/* ================================================================== */
/*  Test 10: min-height on carousel container                         */
/*  The carousel container element should exist with the              */
/*  .carouselContainer class, which in CSS sets min-height: 70px      */
/*  to prevent cumulative layout shift (CLS) before images load.      */
/*  Req 7.5                                                            */
/* ================================================================== */

describe('Partners — min-height on carousel container', () => {
  it('carousel container element exists with the carouselContainer class', async () => {
    window.ResizeObserver = createMockResizeObserver(2000) as unknown as typeof ResizeObserver;
    vi.useFakeTimers();

    const { container } = render(<PartnersCarousel logos={sevenLogos} />);

    await act(async () => {
      vi.advanceTimersByTime(200);
    });

    const carouselDiv = container.firstElementChild as HTMLElement;

    /**
     * Verify the container element exists and has the .carouselContainer class.
     * The CSS rule `.carouselContainer { min-height: 70px }` reserves vertical
     * space matching logo height to prevent CLS before images load.
     * (jsdom doesn't compute CSS, so we verify the class is applied.)
     */
    expect(carouselDiv).not.toBeNull();
    expect(carouselDiv.className).toMatch(/carouselContainer/);
  });
});

/* ================================================================== */
/*  Test 11: Zero logos renders empty                                 */
/*  When an empty array is passed, the component should render        */
/*  nothing (empty React fragment) without throwing errors.           */
/*  Req 8.1                                                            */
/* ================================================================== */

describe('Partners — Zero logos renders empty', () => {
  it('renders no errors and no img elements with an empty array', async () => {
    window.ResizeObserver = createMockResizeObserver(2000) as unknown as typeof ResizeObserver;
    vi.useFakeTimers();

    const { container } = render(<PartnersCarousel logos={[]} />);

    await act(async () => {
      vi.advanceTimersByTime(200);
    });

    /** No images should be rendered for an empty logo array */
    expect(screen.queryAllByRole('img')).toHaveLength(0);

    /** Container should be empty — the component returns an empty fragment */
    expect(container.innerHTML).toBe('');
  });
});

/* ================================================================== */
/*  Test 12: Single logo renders static                               */
/*  A single logo (160px) always fits any reasonable container, so    */
/*  the carousel should stay in static mode with no duplication,      */
/*  no ARIA carousel attributes, and the staticMode class applied.    */
/*  Req 8.1                                                            */
/* ================================================================== */

describe('Partners — Single logo renders static', () => {
  it('renders 1 img with no duplication and static mode classes', async () => {
    // Wide container → 1 logo at 160px → easily fits → static mode
    window.ResizeObserver = createMockResizeObserver(2000) as unknown as typeof ResizeObserver;
    vi.useFakeTimers();

    const { container } = render(<PartnersCarousel logos={singleLogo} />);

    await act(async () => {
      vi.advanceTimersByTime(200);
    });

    /** Exactly 1 image — no duplication in static mode */
    const images = screen.getAllByRole('img');
    expect(images).toHaveLength(1);
    expect(images[0]).toHaveAttribute('alt', 'Allan Grey logo');

    /** No ARIA carousel landmark — static mode doesn't need it */
    expect(screen.queryByRole('region')).toBeNull();

    /** Should have staticMode class (centred flex) and NOT jsEnhanced */
    const carouselDiv = container.firstElementChild as HTMLElement;
    expect(carouselDiv.className).toMatch(/staticMode/);
    expect(carouselDiv.className).not.toMatch(/jsEnhanced/);
  });
});
