/**
 * Hero.unit.test.tsx — Unit tests for the Hero section component.
 *
 * Verifies the key behaviours specified in Requirements 2.1–2.12:
 *   - Video element has autoplay, muted, loop, playsInline attributes
 *   - Poster fallback image is set to /hero-fallback.jpg (BUG-029/035)
 *   - CTA buttons have correct href values (#contact, #newsletter)
 *   - Video element has an aria-label for screen reader accessibility (BUG-041)
 *   - Section structure includes id="hero" and the main heading
 *
 * Addresses: BUG-061 (missing unit tests for Hero)
 *
 * @module Hero.unit.test
 * @requirements 2.1–2.12, 13.8
 */

import { describe, it, expect, afterEach, vi, beforeEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import Hero from '../Hero';

/**
 * Creates a matchMedia mock simulating a desktop viewport (>768px).
 *
 * WHY: The Hero component now uses a useIsMobile hook that calls
 * window.matchMedia('(max-width: 768px)'). jsdom does not implement
 * matchMedia natively, so we must mock it. Desktop mock (matches: false)
 * ensures the video element renders, preserving the original test expectations.
 *
 * @returns A vi.fn() mock implementing the full MediaQueryList interface
 */
function createDesktopMatchMediaMock(): ReturnType<typeof vi.fn> {
  return vi.fn().mockImplementation((query: string) => ({
    // Desktop viewport — query does not match, so useIsMobile returns false
    matches: false,
    media: query,
    onchange: null,
    // Modern API methods for viewport change listeners
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
    // Deprecated legacy API methods — included for browser compatibility
    addListener: vi.fn(),
    removeListener: vi.fn(),
  }));
}

/**
 * Install desktop matchMedia mock before each test and clean up after.
 * This ensures the Hero component renders the video path (desktop behavior)
 * which is what these existing unit tests were written to verify.
 */
beforeEach(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: createDesktopMatchMediaMock(),
  });
});

afterEach(() => {
  /** Clean up rendered DOM and restore mocks between tests to prevent leaks */
  cleanup();
  vi.restoreAllMocks();
});

/* =====================================================================
 * Video element attributes (Req 2.2)
 *
 * The hero background video must have autoPlay, muted, loop, and
 * playsInline attributes for correct cross-browser autoplay behaviour.
 * Without these, mobile browsers may block autoplay or show controls.
 * ===================================================================== */
describe('Hero — Video element attributes', () => {
  it('renders a video element with autoplay, muted, loop, and playsInline', () => {
    const { container } = render(<Hero />);
    const video = container.querySelector('video');

    /** Video element must exist in the hero section */
    expect(video).not.toBeNull();

    /**
     * Verify boolean HTML attributes via DOM properties.
     * React sets these as properties during hydration; jsdom reflects
     * them correctly on the HTMLVideoElement interface.
     */
    expect(video!.autoplay).toBe(true);
    expect(video!.muted).toBe(true);
    expect(video!.loop).toBe(true);
    /** playsInline prevents fullscreen takeover on iOS Safari */
    expect((video as HTMLVideoElement).playsInline).toBe(true);
  });

  it('contains a <source> element pointing to /hero_video.mp4', () => {
    const { container } = render(<Hero />);
    const source = container.querySelector('video source');

    /** The video source must reference the correct MP4 file path */
    expect(source).not.toBeNull();
    expect(source!.getAttribute('src')).toBe('/hero_video.mp4');
    expect(source!.getAttribute('type')).toBe('video/mp4');
  });
});

/* =====================================================================
 * Poster fallback (Req 2.5, BUG-029/035)
 *
 * The video element must have a poster attribute so the section
 * displays a static image while the video loads or if it fails.
 * ===================================================================== */
describe('Hero — Poster fallback', () => {
  it('has poster attribute set to /hero-fallback.jpg', () => {
    const { container } = render(<Hero />);
    const video = container.querySelector('video');

    /** poster provides a visual fallback — prevents blank hero on slow connections */
    expect(video!.getAttribute('poster')).toBe('/hero-fallback.jpg');
  });
});

/* =====================================================================
 * CTA href values (Req 2.9, 2.10)
 *
 * The two hero CTA buttons must link to the correct section anchors:
 *   - "Get In Touch" → #contact (Req 2.9)
 *   - "Subscribe to Newsletter" → #newsletter (Req 2.10)
 * ===================================================================== */
describe('Hero — CTA href values', () => {
  it('"Get In Touch" button links to #contact', () => {
    render(<Hero />);
    const cta = screen.getByText('Get In Touch');
    /** Primary CTA smooth-scrolls to the contact form section */
    expect(cta.getAttribute('href')).toBe('#contact');
  });

  it('"Subscribe to Newsletter" button links to #newsletter', () => {
    render(<Hero />);
    const cta = screen.getByText('Subscribe to Newsletter');
    /** Secondary CTA smooth-scrolls to the newsletter section */
    expect(cta.getAttribute('href')).toBe('#newsletter');
  });
});

/* =====================================================================
 * Aria-label on video (Req 13.8, BUG-041)
 *
 * The <video> element must have a descriptive aria-label so screen
 * reader users understand the decorative video's purpose.
 * ===================================================================== */
describe('Hero — Aria-label on video', () => {
  it('video element has a descriptive aria-label for screen readers', () => {
    const { container } = render(<Hero />);
    const video = container.querySelector('video');

    /** aria-label provides context for assistive technology users */
    const ariaLabel = video!.getAttribute('aria-label');
    expect(ariaLabel).toBeTruthy();
    expect(ariaLabel).toContain('Background video');
  });
});

/* =====================================================================
 * Section structure (Req 2.1)
 *
 * The hero section must render with id="hero" for anchor navigation
 * and display the main heading text.
 * ===================================================================== */
describe('Hero — Section structure', () => {
  it('renders a <section> with id="hero" for anchor navigation', () => {
    const { container } = render(<Hero />);
    const section = container.querySelector('section#hero');
    /** id="hero" is the anchor target for Navbar's "Home" link */
    expect(section).not.toBeNull();
  });

  it('displays the heading "Your Wealth, Your Legacy."', () => {
    render(<Hero />);
    /** The main heading text must be visible — split across a <br> tag */
    expect(screen.getByText(/Your Wealth/)).toBeTruthy();
    expect(screen.getByText(/Your Legacy/)).toBeTruthy();
  });
});
