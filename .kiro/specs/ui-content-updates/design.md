# UI Content Updates — Design

## Overview

This document specifies the implementation details for three content updates:
partner logos (UCU-REQ-1), testimonials (UCU-REQ-2), and footer credit (UCU-REQ-3).

---

## 1. Partner Logos (UCU-REQ-1)

### 1.1 `partnerLogos` array — `src/data/siteConfig.ts`

Replace the existing 5-entry `partnerLogos` array with the following 17 entries.
Correct "Allan Grey" to "Allan Gray" (AC 1.7):

```ts
export const partnerLogos: PartnerLogo[] = [
  { name: 'Allan Gray', src: '/images/partners/Allangrey-300x167.png', alt: 'Allan Gray' },
  { name: 'Auto & General', src: '/images/partners/Auto_and_general.png', alt: 'Auto & General' },
  { name: 'Bidvest Life', src: '/images/partners/Bidvest_life.png', alt: 'Bidvest Life' },
  { name: 'BrightRock', src: '/images/partners/Brightrock-300x167.png', alt: 'BrightRock' },
  { name: 'Capital Legacy', src: '/images/partners/Capital Legacy.png', alt: 'Capital Legacy' },
  { name: 'Discovery', src: '/images/partners/Discovery-300x167.png', alt: 'Discovery' },
  { name: 'King Price', src: '/images/partners/King_Price.png', alt: 'King Price' },
  { name: 'Liberty', src: '/images/partners/Liberty.png', alt: 'Liberty' },
  { name: 'Marriott', src: '/images/partners/Marriot.png', alt: 'Marriott' },
  { name: 'Momentum', src: '/images/partners/momentum-300x167.png', alt: 'Momentum' },
  { name: 'Old Mutual', src: '/images/partners/Old_mutual.png', alt: 'Old Mutual' },
  { name: 'PPS', src: '/images/partners/PPS.png', alt: 'PPS' },
  { name: 'Sanlam', src: '/images/partners/Sanlam.png', alt: 'Sanlam' },
  { name: 'Santam', src: '/images/partners/Santam.png', alt: 'Santam' },
  { name: 'Sasfin', src: '/images/partners/Sasfin.png', alt: 'Sasfin' },
  { name: 'Sirago', src: '/images/partners/Sirago.png', alt: 'Sirago' },
  { name: 'Stratum', src: '/images/partners/Stratum.png', alt: 'Stratum' },
];
```

### 1.2 Image files — copy from `prototype/` to `public/images/partners/`

13 new files to copy:

| # | Source | Destination |
|---|--------|-------------|
| 1 | `prototype/Auto_and_general.png` | `public/images/partners/Auto_and_general.png` |
| 2 | `prototype/Bidvest_life.png` | `public/images/partners/Bidvest_life.png` |
| 3 | `prototype/Capital Legacy.png` | `public/images/partners/Capital Legacy.png` |
| 4 | `prototype/King_Price.png` | `public/images/partners/King_Price.png` |
| 5 | `prototype/Liberty.png` | `public/images/partners/Liberty.png` |
| 6 | `prototype/Marriot.png` | `public/images/partners/Marriot.png` |
| 7 | `prototype/Old_mutual.png` | `public/images/partners/Old_mutual.png` |
| 8 | `prototype/PPS.png` | `public/images/partners/PPS.png` |
| 9 | `prototype/Sanlam.png` | `public/images/partners/Sanlam.png` |
| 10 | `prototype/Santam.png` | `public/images/partners/Santam.png` |
| 11 | `prototype/Sasfin.png` | `public/images/partners/Sasfin.png` |
| 12 | `prototype/Sirago.png` | `public/images/partners/Sirago.png` |
| 13 | `prototype/Stratum.png` | `public/images/partners/Stratum.png` |

### 1.3 Image file to remove

Delete `public/images/partners/ninetyone-300x167.png` — Ninety One is no longer a listed
partner (AC 1.8).

### 1.4 Existing images (no action needed)

These 4 files already exist in `public/images/partners/` and remain unchanged:
- `Allangrey-300x167.png`
- `Brightrock-300x167.png`
- `Discovery-300x167.png`
- `momentum-300x167.png`

---

## 2. Testimonials (UCU-REQ-2)

### 2.1 Testimonial data — `src/components/Testimonials.tsx`

Replace the 3-item `testimonials` array with a single entry:

```ts
const testimonials: Testimonial[] = [
  {
    quote:
      'If you want a financial advisor who operates with absolute integrity and speed, ' +
      'Keanu is 100% your person. The advice I\u2019ve received has been invaluable and ' +
      'custom fit to my goals. He is patient in answering the plethora of questions I ' +
      'always have, deeply knowledgeable, and remarkably quick with getting things done. ' +
      'I trust his judgment implicitly.',
    name: 'Wikus Venter',
    role: '',
  },
];
```

### 2.2 Conditionally hide empty role — `src/components/Testimonials.tsx`

When `role` is an empty string, the `.clientRole` span should not render:

```tsx
{testimonial.role && (
  <span className={styles.clientRole}>{testimonial.role}</span>
)}
```

### 2.3 Single-card layout — `src/components/Testimonials.module.css`

The current grid uses `repeat(3, 1fr)` which would stretch a single card to full width.
Replace the grid with flex centering and cap the card width:

```css
/* Replace the grid with flex for single-card centering */
.testimonialsGrid {
  display: flex;
  justify-content: center;
  gap: 32px;
}

/* Add max-width to the card for single-card layout */
.testimonialCard {
  /* ...existing card styles... */
  max-width: 650px;
  width: 100%;
}
```

The tablet/mobile `@media` breakpoints that changed `grid-template-columns` can be removed
since flex handles the single-card case naturally at all viewport widths.

---

## 3. Footer Developer Credit (UCU-REQ-3)

### 3.1 JSX — `src/components/Footer.tsx`

Add a credit paragraph below the copyright line inside the `.footerDetails` div:

```tsx
<div className={styles.footerDetails}>
  <p>T {contactInfo.phone}</p>
  <p>An Authorised Financial Services Representative</p>
  <p>&copy; {currentYear} Keanu Le Roux. All Rights Reserved.</p>
  <p>
    Designed and developed by{' '}
    <a
      href="https://www.eternitysoftwaresolutions.com/"
      target="_blank"
      rel="noopener noreferrer"
      className={styles.creditLink}
    >
      Eternity Software Solutions
    </a>
  </p>
</div>
```

### 3.2 CSS — `src/components/Footer.module.css`

Add a `.creditLink` rule. The link inherits the `.footerDetails` colour (`var(--gray-400)`)
and transitions to `var(--accent)` on hover:

```css
/* Developer credit link — same colour as footer details, accent on hover */
.creditLink {
  color: var(--gray-400);
  text-decoration: none;
  transition: color var(--transition);
}

.creditLink:hover {
  color: var(--accent);
}
```

---

## Implementation Notes

- **Priority order:** Partner logos first (file copies + siteConfig), then testimonials,
  then footer credit.
- **Testing impact:**
  - `Partners.unit.test.tsx` — may need updates to reflect 17 logos instead of 5, and
    "Allan Gray" instead of "Allan Grey".
  - `Testimonials.property.test.tsx` — needs updating for single-card content (Wikus Venter
    instead of 3 placeholder names).
  - Footer has no existing tests (`BUG-088` is open), so no test updates needed there.
