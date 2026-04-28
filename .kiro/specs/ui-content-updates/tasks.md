# Implementation Plan: UI Content Updates

## Overview

Three content updates: expand partner logos from 5 to 17, replace placeholder testimonials with a single real testimonial, and add a footer developer credit. All changes are cosmetic/content-level with corresponding test updates.

## Tasks

- [x] 1. Update partner logos
  - [x] 1.1 Copy 13 new logo images from `prototype/` to `public/images/partners/`
    - Copy: `Auto_and_general.png`, `Bidvest_life.png`, `Capital Legacy.png`, `King_Price.png`, `Liberty.png`, `Marriot.png`, `Old_mutual.png`, `PPS.png`, `Sanlam.png`, `Santam.png`, `Sasfin.png`, `Sirago.png`, `Stratum.png`
    - The 4 existing images (`Allangrey-300x167.png`, `Brightrock-300x167.png`, `Discovery-300x167.png`, `momentum-300x167.png`) remain unchanged
    - _Requirements: UCU-REQ-1 AC 1.3_

  - [x] 1.2 Delete `public/images/partners/ninetyone-300x167.png`
    - Ninety One is no longer a listed partner
    - _Requirements: UCU-REQ-1 AC 1.8_

  - [x] 1.3 Update `partnerLogos` array in `src/data/siteConfig.ts`
    - Replace the existing 5-entry array with 17 entries in alphabetical order
    - Correct "Allan Grey" to "Allan Gray" in the name, and update alt text to match (e.g. `alt: 'Allan Gray'` not `alt: 'Allan Grey logo'`)
    - Each entry: `{ name, src, alt }` per the design document §1.1
    - Remove the Ninety One entry
    - _Requirements: UCU-REQ-1 AC 1.1, AC 1.2, AC 1.7_

- [x] 2. Checkpoint — Verify partner logos
  - Ensure the `partnerLogos` array has exactly 17 entries in alphabetical order, all 13 new images exist in `public/images/partners/`, and `ninetyone-300x167.png` is deleted. Ask the user if questions arise.

- [x] 3. Replace testimonials with single real testimonial
  - [x] 3.1 Replace testimonials array in `src/components/Testimonials.tsx`
    - Replace the 3-item `testimonials` array with a single Wikus Venter entry per design §2.1
    - Quote text must match the requirement verbatim (UCU-REQ-2 AC 2.2)
    - Set `role` to empty string `''`
    - _Requirements: UCU-REQ-2 AC 2.1, AC 2.2, AC 2.3, AC 2.5_

  - [x] 3.2 Conditionally hide empty role in `src/components/Testimonials.tsx`
    - Wrap the `.clientRole` span in a conditional: only render when `testimonial.role` is truthy
    - Per design §2.2: `{testimonial.role && (<span className={styles.clientRole}>{testimonial.role}</span>)}`
    - _Requirements: UCU-REQ-2 AC 2.4_

  - [x] 3.3 Update testimonials grid layout in `src/components/Testimonials.module.css`
    - Change `.testimonialsGrid` from `display: grid` with `grid-template-columns: repeat(3, 1fr)` to `display: flex` with `justify-content: center`
    - Add `max-width: 650px` and `width: 100%` to `.testimonialCard`
    - Remove tablet/mobile `@media` breakpoints that changed `grid-template-columns` (flex handles single-card at all viewports)
    - _Requirements: UCU-REQ-2 AC 2.8_

- [x] 4. Add footer developer credit
  - [x] 4.1 Add credit JSX in `src/components/Footer.tsx`
    - Add a `<p>` below the copyright line inside `.footerDetails` with text "Designed and developed by " followed by an `<a>` linking to `https://www.eternitysoftwaresolutions.com/`
    - Link text: "Eternity Software Solutions"
    - Attributes: `target="_blank"`, `rel="noopener noreferrer"`, `className={styles.creditLink}`
    - Per design §3.1
    - _Requirements: UCU-REQ-3 AC 3.1, AC 3.2, AC 3.3, AC 3.4, AC 3.5_

  - [x] 4.2 Add `.creditLink` styles in `src/components/Footer.module.css`
    - `color: var(--gray-400)`, `text-decoration: none`, `transition: color var(--transition)`
    - Hover state: `color: var(--accent)`
    - Per design §3.2
    - _Requirements: UCU-REQ-3 AC 3.6, AC 3.7_

- [x] 5. Checkpoint — Verify implementation changes
  - Ensure all three content updates are implemented correctly. Run `./node_modules/.bin/vitest --run` to check current test status. Ask the user if questions arise.

- [x] 6. Update tests for content changes
  - [x] 6.1 Update `src/components/__tests__/Partners.unit.test.tsx`
    - Replace the `fiveLogos` test data array with a 17-entry array matching the new `partnerLogos` from siteConfig (use the same `{ name, src, alt }` values from design §1.1)
    - Correct "Allan Grey" to "Allan Gray" in `fiveLogos`, `singleLogo`, and any other test data or assertions
    - Update Test 2 ("Static mode with 7 logos") — change expected image count from 7 to 17 and update the `sevenLogos` reference to use the new 17-logo array
    - Update Test 12 ("Single logo renders static") — fix the alt text assertion from `'Allan Grey logo'` to `'Allan Gray'`
    - Update any comments referencing "5 active partners" or logo counts to reflect 17
    - _Requirements: UCU-REQ-1 AC 1.1, AC 1.7_

  - [x] 6.2 Update `src/components/__tests__/Testimonials.property.test.tsx`
    - Change the card count assertion from `expect(cards.length).toBe(3)` to `expect(cards.length).toBe(1)`
    - Remove or update the assertion that `.clientRole` must exist with non-empty text — the single testimonial has an empty role, so `.clientRole` will not render (conditionally hidden per design §2.2)
    - Update comments referencing "3 testimonial cards" or "3 cards × 4 assertions" to reflect 1 card
    - _Requirements: UCU-REQ-2 AC 2.1, AC 2.4_

- [x] 7. Final checkpoint — Ensure all tests pass
  - Run `./node_modules/.bin/vitest --run` and ensure all tests pass. Ask the user if questions arise.

## Notes

- Tasks 1.1–1.3 are assigned to @developer (file copies, deletion, siteConfig update)
- Tasks 3.1–4.2 are assigned to @developer (component and CSS changes)
- Tasks 6.1–6.2 are assigned to @qa-engineer (test assertion updates)
- The design uses TypeScript — all code follows existing project conventions
- No new property tests are added; this spec has no Correctness Properties section
- Existing property/unit tests are updated to match the new content
