/**
 * Root Layout — Server Component that wraps every page in the application.
 *
 * Responsibilities:
 * - Loads Google Fonts (Playfair Display + Inter) via next/font/google
 *   with font-display: swap so text is visible immediately with system
 *   fonts while web fonts load (Req 14.2).
 * - Sets <html lang="en"> for accessibility (Req 13.1).
 * - Wraps page content in a <main> landmark element (BUG-007/033).
 * - Imports globals.css for design tokens, reset, and shared styles.
 * - Includes favicon metadata pointing to the SVG favicon.
 * - Sets site-wide metadata (title, description) for SEO.
 *
 * Requirements: 13.1, 14.2, 14.4
 */

import type { Metadata } from 'next';
import { Playfair_Display, Inter } from 'next/font/google';
import './globals.css';

/**
 * Playfair Display — used for headings and italic accents.
 * Subsets limited to latin to reduce download size.
 * CSS variable allows referencing in CSS Modules via var(--font-heading).
 */
const playfairDisplay = Playfair_Display({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-heading',
  weight: ['400', '500', '600'],
  style: ['normal', 'italic'],
});

/**
 * Inter — used for body text and UI elements.
 * CSS variable allows referencing in CSS Modules via var(--font-body).
 */
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-body',
  weight: ['300', '400', '500', '600', '700'],
});

/** Site-wide metadata for SEO and browser tab display */
export const metadata: Metadata = {
  title: 'Keanu Le Roux | Financial Advisor',
  description:
    'Trusted financial advice to help you plan with confidence, protect what matters and build lasting wealth.',
  icons: {
    /* SVG favicon — matches prototype/favicon.svg "KL" initials on navy */
    icon: { url: '/favicon.svg', type: 'image/svg+xml' },
  },
};

/**
 * RootLayout wraps all pages with shared HTML structure, fonts, and styles.
 * The <main> landmark ensures assistive tech can identify the primary content area.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${playfairDisplay.variable} ${inter.variable}`}
    >
      <body>
        {/* <main> landmark wraps all page content for accessibility (BUG-007/033) */}
        <main>{children}</main>
      </body>
    </html>
  );
}
