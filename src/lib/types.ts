/**
 * Shared TypeScript types for the Keanu Le Roux Financial Advisor website.
 *
 * These interfaces define the data shapes used across components, data files,
 * API routes, and CMS integration. They are the single source of truth for
 * type safety throughout the application.
 *
 * Requirements: 5.7, 6.3, 9.2, 15.2
 */

import type { PortableTextBlock } from '@portabletext/react';

/**
 * Blog post sourced from Sanity CMS.
 * Used by the Blog section (landing page) and BlogPostDetail page.
 *
 * The `body` field uses Sanity's Portable Text format, which supports
 * rich content blocks (paragraphs, headings, lists, inline images).
 */
export interface BlogPost {
  /** Sanity document ID */
  _id: string;
  /** Post title displayed as heading */
  title: string;
  /** URL-safe slug for routing to /blog/[slug] */
  slug: { current: string };
  /** ISO 8601 datetime string for display and sorting */
  publishedAt: string;
  /** Short summary shown on blog cards and as lead text on detail page */
  excerpt: string;
  /** Optional hero image — cards show a placeholder when absent */
  mainImage?: {
    asset: { url: string };
    /** Descriptive alt text for accessibility (Req 13.2) */
    alt: string;
  };
  /** Rich text body content in Portable Text format */
  body: PortableTextBlock[];
  /** Controls visibility — only published posts appear on the site */
  published: boolean;
}

/**
 * A single financial advisory service displayed in the Services accordion.
 * Data lives in src/data/services.ts (static, not CMS-managed).
 */
export interface ServiceItem {
  /** Service name shown as the accordion header */
  title: string;
  /** Client-friendly description revealed when the accordion item expands */
  description: string;
}

/**
 * Social media platform link for the Social Feed section.
 * Each entry renders as a clickable card with platform-specific styling.
 */
export interface SocialLink {
  /** Determines card styling (icon colour, preview area) */
  platform: 'youtube' | 'linkedin' | 'instagram';
  /** External URL opened in a new tab on card click */
  url: string;
  /** Card title text */
  title: string;
  /** Card description text */
  description: string;
  /** Platform-specific call-to-action, e.g. "Watch on YouTube →" */
  ctaText: string;
}

/**
 * Navigation link used by the Navbar component.
 * On the landing page, href is an anchor (#section).
 * On the blog detail page, href is a full path (/#section).
 */
export interface NavLink {
  /** Visible link text */
  label: string;
  /** Anchor or path target */
  href: string;
}

/**
 * Partner logo displayed in the Partners section.
 * Logos are static images in public/images/partners/ (not CMS-managed).
 */
export interface PartnerLogo {
  /** Partner company name */
  name: string;
  /** Image path relative to /public, e.g. "/images/partners/logo.png" */
  src: string;
  /** Descriptive alt text for accessibility */
  alt: string;
}

/**
 * Contact form submission payload sent to /api/contact.
 *
 * The honeypot field is a hidden input for bot detection (BUG-025, BUG-039).
 * If a bot fills it in, the server silently rejects the submission.
 */
export interface ContactFormData {
  /** Visitor's first name (required) */
  firstName: string;
  /** Visitor's last name (required) */
  lastName: string;
  /** Visitor's email address (required) */
  email: string;
  /** Visitor's phone number (optional) */
  phone?: string;
  /** Visitor's message (required) */
  message: string;
  /** Hidden honeypot field — filled only by bots, triggers silent rejection */
  honeypot?: string;
}
