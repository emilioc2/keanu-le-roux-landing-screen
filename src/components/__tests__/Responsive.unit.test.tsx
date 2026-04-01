/**
 * Responsive.unit.test.tsx — Structural tests for responsive behaviour.
 *
 * jsdom does not support media queries or computed styles, so these tests
 * verify responsive design at the structural level:
 *   - CSS Module files contain the expected media query breakpoints
 *   - Components render the correct CSS classes that media queries target
 *   - The hamburger toggle button exists in the DOM (visible at ≤768px via CSS)
 *   - Grid containers use the correct CSS classes for column layout changes
 *
 * This approach validates that the responsive infrastructure is in place
 * without relying on layout engine features unavailable in jsdom.
 *
 * Requirements: 11.1–11.4
 * @module Responsive.unit.test
 */

import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import fs from 'fs';
import path from 'path';
import Navbar from '../Navbar';
import Blog from '../Blog';
import type { BlogPost } from '@/lib/types';

/**
 * Mock ScrollReveal — replaces the IntersectionObserver-based wrapper
 * with a simple pass-through div since jsdom lacks IntersectionObserver.
 */
vi.mock('@/components/ScrollReveal', () => ({
  default: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="scroll-reveal" className={className}>
      {children}
    </div>
  ),
}));

afterEach(() => {
  /** Clean up rendered DOM between tests to prevent node leaks */
  cleanup();
});

/**
 * Helper: reads a CSS Module file from the components directory.
 * Returns the raw CSS string for structural assertions about
 * media queries and class definitions.
 *
 * @param filename - CSS Module filename relative to src/components/
 * @returns Raw CSS file content as a string
 */
function readCssModule(filename: string): string {
  const filePath = path.resolve(__dirname, '..', filename);
  return fs.readFileSync(filePath, 'utf-8');
}


/**
 * Creates a minimal mock BlogPost for rendering the Blog component.
 *
 * @param id - Unique identifier for the post
 * @param title - Post title
 * @param slug - URL slug for the post
 * @param date - ISO 8601 date string
 * @returns A BlogPost object with all required fields
 */
function makeBlogPost(id: string, title: string, slug: string, date: string): BlogPost {
  return {
    _id: id,
    title,
    slug: { current: slug },
    publishedAt: date,
    excerpt: `Excerpt for ${title}`,
    body: [],
    published: true,
  };
}

/**
 * Extracts the content of the first @media block matching the given breakpoint.
 *
 * Parses the CSS string to find `@media (max-width: <breakpoint>)` and returns
 * the full content between the opening and closing braces, handling nested
 * braces correctly via depth tracking.
 *
 * @param css - Raw CSS file content
 * @param breakpoint - The breakpoint value to match (e.g. "768px", "900px")
 * @returns The content inside the media query block, or empty string if not found
 */
function extractMediaBlock(css: string, breakpoint: string): string {
  /** Find the start of the @media rule for this breakpoint */
  const mediaStart = css.indexOf(`@media (max-width: ${breakpoint})`);
  if (mediaStart === -1) return '';

  /** Find the opening brace of the media block */
  const braceStart = css.indexOf('{', mediaStart);
  if (braceStart === -1) return '';

  /**
   * Track nested braces to find the matching closing brace.
   * CSS rules inside the media block contain their own { } pairs,
   * so we need to count nesting depth to find the correct end.
   */
  let depth = 1;
  let pos = braceStart + 1;
  while (pos < css.length && depth > 0) {
    if (css[pos] === '{') depth++;
    if (css[pos] === '}') depth--;
    pos++;
  }

  /** Return the content between the opening and closing braces */
  return css.slice(braceStart + 1, pos - 1);
}

/* =====================================================================
 * Hamburger visibility at 768px (Req 1.6, 11.4)
 *
 * The hamburger toggle button must exist in the DOM at all times.
 * At ≤768px, CSS shows it (display: flex); above 768px, CSS hides it
 * (display: none). We verify the button exists and that the CSS Module
 * contains the correct media query and display rules.
 * ===================================================================== */
describe('Responsive — Hamburger visibility at 768px', () => {
  it('renders the hamburger toggle button in the DOM', () => {
    render(<Navbar />);

    /** The hamburger button must always be in the DOM — CSS controls visibility */
    const toggle = screen.getByLabelText('Toggle navigation menu');
    expect(toggle).toBeTruthy();
    expect(toggle.tagName.toLowerCase()).toBe('button');
  });

  it('Navbar CSS hides the toggle by default (display: none)', () => {
    const css = readCssModule('Navbar.module.css');

    /** The .navToggle class must default to display: none on desktop */
    expect(css).toMatch(/\.navToggle\s*\{[^}]*display:\s*none/);
  });

  it('Navbar CSS shows the toggle at ≤768px (display: flex)', () => {
    const css = readCssModule('Navbar.module.css');

    /** The 768px media query must exist for mobile breakpoint */
    expect(css).toContain('@media (max-width: 768px)');

    /** Within the 768px breakpoint, .navToggle should become display: flex */
    const mediaBlock768 = extractMediaBlock(css, '768px');
    expect(mediaBlock768).toMatch(/\.navToggle\s*\{[^}]*display:\s*flex/);
  });

  it('Navbar CSS hides desktop nav links at ≤768px', () => {
    const css = readCssModule('Navbar.module.css');

    /** Within the 768px breakpoint, .navLinks should be hidden */
    const mediaBlock768 = extractMediaBlock(css, '768px');
    expect(mediaBlock768).toMatch(/\.navLinks\s*\{[^}]*display:\s*none/);
  });
});

/* =====================================================================
 * Grid column count at 900px breakpoint (Req 11.2, 11.3)
 *
 * Multi-column grids (Blog, SocialFeed, Services, About) must collapse
 * to single-column at ≤900px. We verify:
 *   1. The CSS Module files contain @media (max-width: 900px) rules
 *   2. Those rules set grid-template-columns to 1fr (single column)
 *   3. The rendered components use the correct CSS classes
 * ===================================================================== */
describe('Responsive — Grid column count at 900px breakpoint', () => {
  it('Blog CSS collapses featured article to single column at ≤900px', () => {
    const css = readCssModule('Blog.module.css');

    /** Blog must have a 900px breakpoint for responsive layout */
    expect(css).toContain('@media (max-width: 900px)');

    /** Featured article grid should collapse to 1fr at ≤900px */
    const mediaBlock = extractMediaBlock(css, '900px');
    expect(mediaBlock).toMatch(/\.blogFeatured\s*\{[^}]*grid-template-columns:\s*1fr/);
  });

  it('Blog CSS collapses card grid to single column at ≤900px', () => {
    const css = readCssModule('Blog.module.css');

    /** Card grid should also collapse to 1fr at ≤900px */
    const mediaBlock = extractMediaBlock(css, '900px');
    expect(mediaBlock).toMatch(/\.blogGrid\s*\{[^}]*grid-template-columns:\s*1fr/);
  });

  it('Blog component renders the grid container with blogGrid class', () => {
    /** Need at least 2 posts: first is featured, second renders in the grid */
    const posts = [
      makeBlogPost('p1', 'Featured Post', 'featured', '2026-06-01T00:00:00Z'),
      makeBlogPost('p2', 'Grid Post', 'grid-post', '2026-01-01T00:00:00Z'),
    ];

    const { container } = render(<Blog posts={posts} />);

    /** The grid container must have the blogGrid class for the 900px media query to apply */
    const gridDiv = container.querySelector('[class*="blogGrid"]');
    expect(gridDiv).not.toBeNull();
  });

  it('Blog CSS uses 2-column grid by default (above 900px)', () => {
    const css = readCssModule('Blog.module.css');

    /** Default (desktop) grid should be 2 columns: repeat(2, 1fr) */
    expect(css).toMatch(/\.blogGrid\s*\{[^}]*grid-template-columns:\s*repeat\(2,\s*1fr\)/);
  });

  it('SocialFeed CSS collapses to single column at ≤900px', () => {
    const css = readCssModule('SocialFeed.module.css');

    /** SocialFeed must have a 900px breakpoint */
    expect(css).toContain('@media (max-width: 900px)');

    /** Feed grid should collapse to 1fr at ≤900px */
    const mediaBlock = extractMediaBlock(css, '900px');
    expect(mediaBlock).toMatch(/\.feedGrid\s*\{[^}]*grid-template-columns:\s*1fr/);
  });

  it('SocialFeed CSS uses 3-column grid by default (above 900px)', () => {
    const css = readCssModule('SocialFeed.module.css');

    /** Default (desktop) grid should be 3 columns: repeat(3, 1fr) */
    expect(css).toMatch(/\.feedGrid\s*\{[^}]*grid-template-columns:\s*repeat\(3,\s*1fr\)/);
  });

  it('Services CSS collapses image grid to single column at ≤900px', () => {
    const css = readCssModule('Services.module.css');

    /** Services must have a 900px breakpoint for the image grid */
    expect(css).toContain('@media (max-width: 900px)');

    /** Image grid should collapse to 1fr at ≤900px */
    const mediaBlock = extractMediaBlock(css, '900px');
    expect(mediaBlock).toMatch(/\.images\s*\{[^}]*grid-template-columns:\s*1fr/);
  });
});
