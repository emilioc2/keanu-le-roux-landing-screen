/**
 * Navbar.unit.test.tsx — Unit tests for the Navbar component.
 *
 * Covers the key behaviours specified in Requirements 1.1–1.8:
 *   - Scroll threshold state change (transparent at 0px, scrolled at 51px)
 *   - Mobile hamburger toggle open/close
 *   - Nav link click closes the mobile dropdown
 *   - `alwaysScrolled` prop forces scrolled state and prefixes hrefs
 *
 * Addresses: BUG-060 (missing unit tests for Navbar)
 *
 * @module Navbar.unit.test
 * @requirements 1.1–1.8
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, act, cleanup } from '@testing-library/react';
import Navbar from '../Navbar';

/**
 * Simulates a browser scroll to a given Y position.
 *
 * jsdom doesn't support real scrolling, so we override window.scrollY
 * via defineProperty and dispatch a native scroll event to trigger
 * the Navbar's scroll listener.
 *
 * @param y - The target scrollY value in pixels
 */
function simulateScroll(y: number): void {
  Object.defineProperty(window, 'scrollY', {
    value: y,
    writable: true,
    configurable: true,
  });
  window.dispatchEvent(new Event('scroll'));
}

beforeEach(() => {
  /** Reset scroll position to 0 before each test for a clean baseline */
  Object.defineProperty(window, 'scrollY', {
    value: 0,
    writable: true,
    configurable: true,
  });
});

afterEach(() => {
  /** Clean up rendered DOM and restore any mocked functions */
  cleanup();
  vi.restoreAllMocks();
});

/* =====================================================================
 * Scroll threshold state change (Req 1.2, 1.3)
 *
 * The Navbar transitions from transparent (no scrolled class) to
 * scrolled (white bg, navy text) when window.scrollY exceeds 50px.
 * ===================================================================== */
describe('Navbar — Scroll threshold state change', () => {
  it('does not have scrolled class at 0px scroll (transparent state)', () => {
    render(<Navbar />);
    const nav = screen.getByTestId('navbar');
    /** At 0px, navbar should be transparent — no scrolled class */
    expect(nav.className).not.toContain('scrolled');
  });

  it('has scrolled class when scrolled past 50px (e.g. 51px)', () => {
    render(<Navbar />);
    /** Scroll past the 50px threshold to trigger scrolled state */
    act(() => simulateScroll(51));
    const nav = screen.getByTestId('navbar');
    expect(nav.className).toContain('scrolled');
  });

  it('removes scrolled class when scrolling back to 50px or below', () => {
    render(<Navbar />);
    /** First scroll past threshold to enter scrolled state */
    act(() => simulateScroll(100));
    expect(screen.getByTestId('navbar').className).toContain('scrolled');
    /** Scroll back to exactly 50px — should revert to transparent */
    act(() => simulateScroll(50));
    expect(screen.getByTestId('navbar').className).not.toContain('scrolled');
  });
});

/* =====================================================================
 * Mobile hamburger toggle (Req 1.6, 1.7)
 *
 * At ≤768px the Navbar shows a hamburger button. Clicking it toggles
 * the "open" class on the nav links list to show/hide the dropdown.
 * ===================================================================== */
describe('Navbar — Mobile toggle open/close', () => {
  it('opens dropdown when hamburger is clicked (adds "open" class)', () => {
    render(<Navbar />);
    const toggle = screen.getByLabelText('Toggle navigation menu');
    fireEvent.click(toggle);
    /** The <ul> nav links container should gain the "open" class */
    const linksList = toggle.parentElement!.querySelector('ul');
    expect(linksList!.className).toContain('open');
  });

  it('closes dropdown on second click (removes "open" class)', () => {
    render(<Navbar />);
    const toggle = screen.getByLabelText('Toggle navigation menu');
    /** Open then close — toggle is a simple boolean flip */
    fireEvent.click(toggle);
    fireEvent.click(toggle);
    const linksList = toggle.parentElement!.querySelector('ul');
    expect(linksList!.className).not.toContain('open');
  });
});

/* =====================================================================
 * Link click closes dropdown (Req 1.8)
 *
 * When a visitor clicks a nav link inside the mobile dropdown,
 * the dropdown should close automatically.
 * ===================================================================== */
/* =====================================================================
 * Link click closes dropdown (Req 1.8)
 *
 * When a visitor clicks a nav link inside the mobile dropdown,
 * the dropdown should close automatically. We use getByText to
 * target a specific nav link that has the onClick handler attached.
 * The className assertion uses a regex pattern to match CSS Module
 * hashed class names (e.g. _open_abc123) rather than plain "open".
 * ===================================================================== */
describe('Navbar — Link click closes dropdown', () => {
  it('closes the mobile dropdown when a nav link is clicked', () => {
    render(<Navbar />);
    const toggle = screen.getByLabelText('Toggle navigation menu');

    /** Open the dropdown first by clicking the hamburger */
    fireEvent.click(toggle);

    /** Verify dropdown is open before clicking a link —
     * CSS Module class names are hashed, so match the "open" pattern */
    const linksList = toggle.parentElement!.querySelector('ul');
    expect(linksList!.className).toMatch(/open/);

    /** Click the "About" nav link — this triggers handleLinkClick
     * which calls setIsMenuOpen(false) to close the dropdown */
    const aboutLink = screen.getByText('About');
    fireEvent.click(aboutLink);

    /** After clicking a link, the dropdown should close.
     * Re-query the <ul> className — the "open" class should be gone. */
    const updatedLinksList = toggle.parentElement!.querySelector('ul');
    expect(updatedLinksList!.className).not.toMatch(/open/);
  });
});

/* =====================================================================
 * alwaysScrolled prop (Req 19.2)
 *
 * On the blog post detail page, the Navbar is always in scrolled state
 * and link hrefs are prefixed with "/" to navigate back to the landing page.
 * ===================================================================== */
describe('Navbar — alwaysScrolled prop', () => {
  it('renders in scrolled state immediately when alwaysScrolled is true', () => {
    render(<Navbar alwaysScrolled />);
    const nav = screen.getByTestId('navbar');
    /** Blog page navbar should always show white bg / navy text */
    expect(nav.className).toContain('scrolled');
  });

  it('keeps scrolled state even at 0px scroll when alwaysScrolled is true', () => {
    render(<Navbar alwaysScrolled />);
    /** Simulate scroll to 0 — should still be scrolled */
    act(() => simulateScroll(0));
    const nav = screen.getByTestId('navbar');
    expect(nav.className).toContain('scrolled');
  });

  it('prefixes link hrefs with "/" when alwaysScrolled is true (blog page)', () => {
    render(<Navbar alwaysScrolled />);
    const aboutLink = screen.getByText('About');
    /** Blog page links should navigate back to landing page sections */
    expect(aboutLink.getAttribute('href')).toBe('/#about');
  });

  it('uses anchor-only hrefs when alwaysScrolled is false (landing page)', () => {
    render(<Navbar />);
    const aboutLink = screen.getByText('About');
    /** Landing page links are simple anchor scrolls */
    expect(aboutLink.getAttribute('href')).toBe('#about');
  });
});
