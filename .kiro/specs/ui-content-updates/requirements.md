# UI Content Updates — Requirements

## Introduction

This document specifies three content updates to the Keanu Le Roux Financial Advisor website.
These changes align the production site with the approved prototype and incorporate new
client-provided content. All changes are cosmetic/content-level — no structural or
architectural modifications are required.

**Scope:**
1. Expand the partner logos from 5 to 17 (3 partners removed per client direction)
2. Replace placeholder testimonials with a single real client testimonial
3. Add a developer credit line to the footer

**Reference documents:**
- `prototype/index.html` — approved prototype (source of truth for partner logos)
- `src/data/siteConfig.ts` — current production partner logo configuration
- `src/components/Testimonials.tsx` — current testimonial data
- `src/components/Footer.tsx` / `Footer.module.css` — current footer implementation

---

## Requirement 1: Update Partner Logos to Match Prototype

**ID:** UCU-REQ-1
**Priority:** High
**Type:** Content alignment

### Description

The production site currently displays 5 partner logos (Allan Grey, BrightRock, Discovery,
Momentum, Ninety One). The approved prototype displays 20 partner logos, but the client has
directed that Ashburton, Ninety One, and Sygnia be removed, leaving 17 partners. The
`partnerLogos` array in `siteConfig.ts` shall be updated to include all 17 partners, and
the corresponding image files shall be copied from `prototype/` to `public/images/partners/`.
The existing `ninetyone-300x167.png` file shall be removed from `public/images/partners/`.

### EARS Requirement (Ubiquitous)

The Partners section shall display the following 17 partner logos in alphabetical order.
Ashburton, Ninety One, and Sygnia have been removed per client direction:

| #  | Partner Name    | Image Filename (in prototype)   | Alt Text         |
|----|-----------------|----------------------------------|------------------|
| 1  | Allan Gray      | `Allangrey-300x167.png`          | Allan Gray       |
| 2  | Auto & General  | `Auto_and_general.png`           | Auto & General   |
| 3  | Bidvest Life    | `Bidvest_life.png`               | Bidvest Life     |
| 4  | BrightRock      | `Brightrock-300x167.png`         | BrightRock       |
| 5  | Capital Legacy  | `Capital Legacy.png`             | Capital Legacy   |
| 6  | Discovery       | `Discovery-300x167.png`          | Discovery        |
| 7  | King Price      | `King_Price.png`                 | King Price       |
| 8  | Liberty         | `Liberty.png`                    | Liberty          |
| 9  | Marriott        | `Marriot.png`                    | Marriott         |
| 10 | Momentum        | `momentum-300x167.png`           | Momentum         |
| 11 | Old Mutual      | `Old_mutual.png`                 | Old Mutual       |
| 12 | PPS             | `PPS.png`                        | PPS              |
| 13 | Sanlam          | `Sanlam.png`                     | Sanlam           |
| 14 | Santam          | `Santam.png`                     | Santam           |
| 15 | Sasfin          | `Sasfin.png`                     | Sasfin           |
| 16 | Sirago          | `Sirago.png`                     | Sirago           |
| 17 | Stratum         | `Stratum.png`                    | Stratum          |

### Acceptance Criteria

1. **AC 1.1:** The `partnerLogos` array in `src/data/siteConfig.ts` contains exactly 17
   entries, one for each partner listed above, in alphabetical order by name.
2. **AC 1.2:** Each entry in the `partnerLogos` array has a `name`, `src` (path relative to
   `/public`), and `alt` property matching the table above.
3. **AC 1.3:** All 13 new logo image files are present in `public/images/partners/`, copied
   from the `prototype/` directory. The 4 existing images (Allan Gray, BrightRock, Discovery,
   Momentum) remain unchanged.
4. **AC 1.4:** The Partners carousel renders all 17 logos visually in the browser.
5. **AC 1.5:** Each logo `<img>` element has a descriptive `alt` attribute matching the
   partner name for accessibility.
6. **AC 1.6:** The infinite-scroll carousel continues to function correctly with 17 logos
   (auto-scroll, drag, keyboard navigation, seamless loop).
7. **AC 1.7:** The production spelling "Allan Grey" shall be corrected to "Allan Gray"
   to match the prototype and the official brand name.
8. **AC 1.8:** The existing `ninetyone-300x167.png` file shall be removed from
   `public/images/partners/` since Ninety One is no longer a listed partner.

### New image files to copy from `prototype/` to `public/images/partners/`

The following 13 files need to be copied (the other 4 already exist in production):

1. `prototype/Auto_and_general.png` → `public/images/partners/Auto_and_general.png`
2. `prototype/Bidvest_life.png` → `public/images/partners/Bidvest_life.png`
3. `prototype/Capital Legacy.png` → `public/images/partners/Capital Legacy.png`
4. `prototype/King_Price.png` → `public/images/partners/King_Price.png`
5. `prototype/Liberty.png` → `public/images/partners/Liberty.png`
6. `prototype/Marriot.png` → `public/images/partners/Marriot.png`
7. `prototype/Old_mutual.png` → `public/images/partners/Old_mutual.png`
8. `prototype/PPS.png` → `public/images/partners/PPS.png`
9. `prototype/Sanlam.png` → `public/images/partners/Sanlam.png`
10. `prototype/Santam.png` → `public/images/partners/Santam.png`
11. `prototype/Sasfin.png` → `public/images/partners/Sasfin.png`
12. `prototype/Sirago.png` → `public/images/partners/Sirago.png`
13. `prototype/Stratum.png` → `public/images/partners/Stratum.png`

### Existing image file to remove

1. `public/images/partners/ninetyone-300x167.png` — Ninety One removed per client direction

### Files to Modify

| File | Change |
|------|--------|
| `src/data/siteConfig.ts` | Update `partnerLogos` array from 5 entries to 17 entries |
| `public/images/partners/` | Add 13 new logo image files copied from `prototype/`; remove `ninetyone-300x167.png` |

---

## Requirement 2: Replace Testimonials with Single Real Testimonial

**ID:** UCU-REQ-2
**Priority:** High
**Type:** Content update

### Description

The production site currently displays 3 placeholder testimonials (Sarah M., James T.,
Priya N.) with generic copy. These shall be replaced with a single real client testimonial
from Wikus Venter. The two placeholder testimonials from Sarah M. and Priya N. shall be
removed entirely. The James T. placeholder shall also be removed.

### EARS Requirement (Ubiquitous)

The Testimonials section shall display exactly one testimonial card with the following content:

- **Quote:** "If you want a financial advisor who operates with absolute integrity and speed,
  Keanu is 100% your person. The advice I've received has been invaluable and custom fit to
  my goals. He is patient in answering the plethora of questions I always have, deeply
  knowledgeable, and remarkably quick with getting things done. I trust his judgment implicitly."
- **Attribution name:** Wikus Venter
- **Attribution role:** *(none — no role or tenure descriptor)*

### Acceptance Criteria

1. **AC 2.1:** The `testimonials` array in `src/components/Testimonials.tsx` contains exactly
   1 entry with the quote text, name, and role specified above.
2. **AC 2.2:** The testimonial quote text matches the specified content verbatim, character
   for character.
3. **AC 2.3:** The attribution displays "Wikus Venter" as the client name.
4. **AC 2.4:** No role or tenure text is displayed beneath the client name (the `role` field
   shall be an empty string or the role element shall be conditionally hidden).
5. **AC 2.5:** The placeholder testimonials from Sarah M., James T., and Priya N. are
   completely removed from the codebase.
6. **AC 2.6:** The section heading "What My Clients Say" and subtitle "Real feedback from
   people I've had the privilege of working with." remain unchanged.
7. **AC 2.7:** The single testimonial card retains the existing card styling (decorative
   open-quote icon, italic blockquote, client attribution block).
8. **AC 2.8:** The testimonials grid layout adapts gracefully to displaying a single card
   (centred, not stretched to full width). The card should have a reasonable max-width
   (e.g. 600–700px) and be horizontally centred.
9. **AC 2.9:** The ScrollReveal fade-up animation continues to work on the single card.

### Files to Modify

| File | Change |
|------|--------|
| `src/components/Testimonials.tsx` | Replace 3-item `testimonials` array with single Wikus Venter entry |
| `src/components/Testimonials.module.css` | *(optional)* Adjust grid layout for single-card display if needed |

---

## Requirement 3: Add Footer Developer Credit

**ID:** UCU-REQ-3
**Priority:** Medium
**Type:** New content

### Description

A developer credit line shall be added to the footer section, attributing the website design
and development to Eternity Software Solutions. The credit shall include a hyperlink to their
website that opens in a new browser tab.

### EARS Requirement (Ubiquitous)

The footer shall display the text "Designed and developed by Eternity Software Solutions"
below the existing footer details block (phone, authorisation statement, copyright). The
text "Eternity Software Solutions" shall be a hyperlink to
`https://www.eternitysoftwaresolutions.com/`.

### Acceptance Criteria

1. **AC 3.1:** The footer displays the text "Designed and developed by " followed by a
   hyperlink with the visible text "Eternity Software Solutions".
2. **AC 3.2:** The hyperlink `href` is set to `https://www.eternitysoftwaresolutions.com/`.
3. **AC 3.3:** The hyperlink opens in a new browser tab using `target="_blank"`.
4. **AC 3.4:** The hyperlink includes `rel="noopener noreferrer"` for security.
5. **AC 3.5:** The developer credit is positioned below the existing copyright line
   ("© 2026 Keanu Le Roux. All Rights Reserved.") within the footer details block.
6. **AC 3.6:** The developer credit text uses the same font size and colour as the
   surrounding footer details text (0.8rem, `var(--gray-400)`).
7. **AC 3.7:** The hyperlink text uses the same base colour as the footer details and
   transitions to `var(--accent)` on hover, consistent with other footer links.
8. **AC 3.8:** The developer credit is visible on all viewport sizes (desktop, tablet, mobile).

### Files to Modify

| File | Change |
|------|--------|
| `src/components/Footer.tsx` | Add developer credit paragraph with hyperlink below copyright |
| `src/components/Footer.module.css` | Add styles for the developer credit link (colour, hover transition) |

---

## Summary Table

| Req ID     | Title                          | Priority | Files Affected |
|------------|--------------------------------|----------|----------------|
| UCU-REQ-1  | Update Partner Logos           | High     | `siteConfig.ts`, `public/images/partners/` |
| UCU-REQ-2  | Replace Testimonials           | High     | `Testimonials.tsx`, `Testimonials.module.css` |
| UCU-REQ-3  | Footer Developer Credit        | Medium   | `Footer.tsx`, `Footer.module.css` |
