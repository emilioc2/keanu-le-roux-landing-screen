<!-- Implementation Plan for Prototype Enhancements (ENH-1 through ENH-11, excluding ENH-4/5) -->
<!-- Follows priority order from design document Section 8 -->
<!-- Test command: ./node_modules/.bin/vitest --run -->

# Implementation Plan: Prototype Enhancements

## Overview

Implements 7 enhancement requirements (ENH-1 through ENH-11, excluding ENH-4/5) in priority order from the design document. Each task follows the dependency chain: types → config → components → page wiring. The newsletter API route is created before the component rewrite. Prototype-only changes (ENH-3) are handled last.

Test command: `./node_modules/.bin/vitest --run`

## Tasks

<!-- Task 1 completed: phone number updated in siteConfig, all Hero/related tests pass -->
- [x] 1. P1 — Update phone number in siteConfig (@developer)
  - [x] 1.1 Update `contactInfo.phone` in `src/data/siteConfig.ts` from "+27 83 789 8227" to "+27 65 572 3909"
    - Single line change in the `contactInfo` object
    - _Requirements: Req 1 AC 1, AC 2_
  - [x] 1.2 Run test suite to confirm no regressions
    - `./node_modules/.bin/vitest --run`
    - All 95 existing tests must pass
    - _Requirements: Req 1_

<!-- Task 2 completed: Hero CTA changed to "Book Appointment" with Calendly URL, prototype updated, test assertions updated -->
- [x] 2. P2 — Update Hero primary CTA to Book Appointment (@developer)
  - [x] 2.1 Modify the primary CTA in `src/components/Hero.tsx`
    - Change button text from "Get In Touch" to "Book Appointment"
    - Change href from `#contact` to `https://calendly.com/keanu-thewealthroom/meetingrequest`
    - Add `target="_blank"` and `rel="noopener noreferrer"` attributes
    - Remove any smooth-scroll behaviour on the primary CTA
    - _Requirements: Req 2 AC 1, AC 2, AC 3, AC 4_
  - [x] 2.2 Update prototype hero CTA href in `prototype/index.html`
    - Change hero CTA href from `https://booking.example.com` to `https://calendly.com/keanu-thewealthroom/meetingrequest`
    - _Requirements: Req 2 AC 2 (BUG-200)_
  - [x] 2.3 Run test suite to confirm no regressions
    - `./node_modules/.bin/vitest --run`
    - Existing Hero tests must pass (update assertions if they check CTA text/href)
    - _Requirements: Req 2_

- [x] 3. Checkpoint — Verify P1 and P2 changes
  - Ensure all tests pass, ask the user if questions arise.

- [x] 4. P3 — Implement Nav CTA blue variant (@developer)
  - [x] 4.1 Add `isCta` property to NavLink type in `src/lib/types.ts`
    - Add `isCta?: boolean` optional property to the `NavLink` interface
    - _Requirements: Req 3 AC 6_
  - [x] 4.2 Update navLinks array in `src/data/siteConfig.ts`
    - Add `{ label: 'Testimonials', href: '#testimonials' }` before the last link
    - Change last link from `{ label: 'Contact', href: '#contact' }` to `{ label: 'Get In Touch', href: '#contact', isCta: true }`
    - Result: 6 nav items — Home, About, Services, Insights, Testimonials, Get In Touch
    - _Requirements: Req 3 AC 1, AC 2, AC 3, AC 6_
  - [x] 4.3 Add `.navCta` and `.navCtaBlue` styles to `src/components/Navbar.module.css`
    - Base `.navCta` on transparent navbar: padding 8px 24px, border 1.5px solid rgba(255,255,255,0.6), border-radius 40px, white text, font-weight 500, letter-spacing 0.06em, transitions on background/color/border-color
    - `.navCta` hover on transparent: white fill, navy text, white border
    - `.scrolled .navCta`: navy border, navy text
    - `.scrolled .navCta:hover`: navy fill, white text
    - `.navCtaBlue` on transparent: #7a9bb5 background + border, white text
    - `.navCtaBlue:hover` on transparent: #6889a3 background + border, white text
    - `.scrolled .navCtaBlue`: retains #7a9bb5 fill (does NOT switch to navy outline)
    - `.scrolled .navCtaBlue:hover`: #6889a3 background + border, white text
    - Mobile override (≤768px inside `.navLinks.open`): strip all pill styling — border none, padding 0, border-radius 0, background transparent, navy text, font-weight 400, letter-spacing 0.04em
    - _Requirements: Req 3 AC 7–16_
  - [x] 4.4 Apply CTA classes conditionally in `src/components/Navbar.tsx`
    - In the link rendering loop, check `link.isCta` to apply `${styles.navLink} ${styles.navCta} ${styles.navCtaBlue}` instead of just `styles.navLink`
    - Apply to both the `<a>` (landing page) and `<Link>` (blog page) variants
    - _Requirements: Req 3 AC 4_
  - [x] 4.5 Run test suite to confirm no regressions
    - `./node_modules/.bin/vitest --run`
    - Update existing Navbar tests if they assert on nav link count or labels
    - _Requirements: Req 3_

- [x] 5. Checkpoint — Verify Nav CTA changes
  - Ensure all tests pass, ask the user if questions arise.

- [x] 6. P4 — Implement Newsletter inline email form (@developer)
  - [x] 6.1 Create newsletter API route at `src/app/api/newsletter/route.ts`
    - Mirror the contact form API pattern from `src/app/api/contact/route.ts`
    - Implement `escapeHtml()` utility (duplicate from contact route)
    - Implement `isRateLimited()` with 5 req/min/IP sliding window
    - Honeypot check: if `honeypot` field is populated, return 200 silently
    - Validate email: required, non-empty after trim, basic regex format check
    - Check `RESEND_API_KEY` environment variable
    - HTML-escape the subscriber email before interpolating into email template (BUG-201)
    - Send email via Resend: from `"Keanu Le Roux Website <onboarding@resend.dev>"`, to `keanu@thewealthroom.com`, subject `"New Newsletter Subscription"`
    - Return `{ success: true }` on success, appropriate error codes on failure (400, 429, 500)
    - _Requirements: Req 4 AC 7, AC 8, AC 9, AC 16, AC 17_
  - [x] 6.2 Rewrite `src/components/Newsletter.tsx` from Server to Client Component
    - Add `'use client'` directive
    - Remove `newsletterUrl` import from siteConfig
    - Add state management: `formState` as `'idle' | 'submitting' | 'success' | 'error'`
    - Render inline form with hidden honeypot field, email input (`type="email"`, `required`, `aria-label="Email address for newsletter"`, placeholder "Enter your email address"), and "Subscribe" submit button
    - Implement form submission: validate email programmatically (Req 4 AC 12), POST JSON to `/api/newsletter`, handle success/error states
    - Success state: replace form with green checkmark SVG, heading "Thank you for subscribing!", subtitle "You'll hear from me soon." using `.newsletterSuccess` class
    - Error state: display "Something went wrong. Please try again." with `.newsletterError` class and `role="alert"`
    - Loading state: disable button, change text to "Subscribing..."
    - Keep existing heading, description, and benefits list unchanged
    - _Requirements: Req 4 AC 1–6, AC 10–15_
  - [x] 6.3 Add form, input, button, success, error, and loading styles to `src/components/Newsletter.module.css`
    - `.newsletterForm`: flex, gap 12px, max-width 480px, margin 0 auto; at ≤768px flex-direction column
    - Email input: flex 1, bottom-border-only (1px solid rgba(255,255,255,0.25)), transparent bg, white text, focus border-color white
    - `.btnNewsletter`: padding 14px 32px, white outlined pill, hover fills white with navy text; disabled: cursor not-allowed, opacity 0.6
    - `.newsletterSuccess`: flex column, centered, green checkmark SVG (#4ade80), heading + subtitle
    - `.newsletterError`: flex centered, margin-top 12px, rgba(255,100,100,0.9) text, font-size 0.85rem
    - `.honeypot`: position absolute, left -9999px, height 0, overflow hidden
    - _Requirements: Req 4 AC 3, AC 4, AC 5, AC 6, AC 10, AC 11, AC 15_
  - [x] 6.4 Run test suite to confirm no regressions
    - `./node_modules/.bin/vitest --run`
    - Update existing Newsletter tests if they assert on the old external link behaviour
    - _Requirements: Req 4_

- [x] 7. Checkpoint — Verify Newsletter form and API
  - Ensure all tests pass, ask the user if questions arise.

- [x] 8. P5 — Create Testimonials section (@developer)
  - [x] 8.1 Create `src/components/Testimonials.module.css`
    - `.testimonials`: padding 80px 0, background var(--off-white)
    - `.testimonialsGrid`: grid, repeat(3, 1fr), gap 32px; at ≤900px repeat(2, 1fr); at ≤768px 1fr
    - `.testimonialCard`: white bg, border-radius 12px, padding 36px 32px, box-shadow 0 2px 12px rgba(0,0,0,0.06), flex column, gap 20px
    - `.quoteIcon`: font-size 2.4rem, line-height 1, color #7a9bb5, font-family Georgia serif
    - `.quote`: font-size 0.95rem, line-height 1.75, color var(--text-body), italic, flex 1, margin 0
    - `.client`: flex column, gap 2px
    - `.clientName`: font-weight 600, font-size 0.9rem, color var(--navy)
    - `.clientRole`: font-size 0.82rem, color var(--gray-600)
    - _Requirements: Req 5 AC 1, AC 3, AC 4, AC 5, AC 7_
  - [x] 8.2 Create `src/components/Testimonials.tsx` as a Server Component
    - Define inline testimonial data array (3 entries matching Req 5 AC 6)
    - Render section with `id="testimonials"` and off-white background
    - Render centred section header: heading "What My Clients Say", subtitle "Real feedback from people I've had the privilege of working with."
    - Render 3-column responsive grid of testimonial cards
    - Each card: decorative open-quote icon (`\u201C`, `aria-hidden="true"`), italic blockquote, client name (semi-bold navy), client role (muted grey)
    - Wrap each card in `<ScrollReveal>` for fade-up animation on viewport entry
    - _Requirements: Req 5 AC 1–10_
  - [x] 8.3 Add Testimonials to `src/app/page.tsx`
    - Import Testimonials component
    - Insert `<Testimonials />` between `<Newsletter />` and `<Partners />` in the JSX
    - _Requirements: Req 5 AC 9_
  - [x] 8.4 Run test suite to confirm no regressions
    - `./node_modules/.bin/vitest --run`
    - _Requirements: Req 5_

- [x] 9. Checkpoint — Verify Testimonials section
  - Ensure all tests pass, ask the user if questions arise.

- [x] 10. P6 — Add Budget Tracker download (@developer)
  - [x] 10.1 Copy budget tracker spreadsheet to public directory
    - Copy `prototype/Tracking Budget 2026.xlsx` to `public/Tracking Budget 2026.xlsx`
    - _Requirements: Req 6 AC 9, AC 10_
  - [x] 10.2 Add download button markup to `src/components/SocialFeed.tsx`
    - Add a download button container below the `.feedGrid` div, inside the `.container`
    - Anchor element with text "📥 Download Free Budget Tracker 2026"
    - href: `/Tracking%20Budget%202026.xlsx` (URL-encoded)
    - Include `download` attribute for file save dialog
    - Use the global `.btn` class for navy-outlined pill styling
    - _Requirements: Req 6 AC 1–6, AC 8_
  - [x] 10.3 Add `.feedDownload` style to `src/components/SocialFeed.module.css`
    - text-align: center, margin-top: 48px
    - _Requirements: Req 6 AC 7, AC 8_
  - [x] 10.4 Run test suite to confirm no regressions
    - `./node_modules/.bin/vitest --run`
    - _Requirements: Req 6_

- [x] 11. P7 — Sync prototype partner logos (@developer)
  - [x] 11.1 Edit `prototype/index.html` to remove Ashburton and Sygnia logos
    - Remove Ashburton and Sygnia `<img>` tags from the `.partners-track` div (both primary and `aria-hidden` duplicate sets)
    - Ensure exactly 5 logos remain: Allan Grey, BrightRock, Discovery, Momentum, Ninety One
    - _Requirements: Req 7 AC 1, AC 2_
  - [x] 11.2 Fix prototype download button href in `prototype/index.html`
    - Change download button href from `Tracking-Budget-2026.xlsx` to `Tracking%20Budget%202026.xlsx` (BUG-209 from design doc)
    - _Requirements: Req 6 (BUG-181)_

- [x] 12. Checkpoint — Verify all implementation tasks
  - Ensure all tests pass, ask the user if questions arise.

- [x] 13. Write property-based tests for new enhancements (@qa-engineer)
  - [ ]* 13.1 Write property test for testimonial card rendering completeness
    - **Property 17: Testimonial card rendering completeness**
    - Render Testimonials component, query all card elements, assert each contains: decorative quote icon, blockquote with non-empty text, client name with non-empty text, client role with non-empty text
    - Add to `src/components/__tests__/` test directory
    - **Validates: Req 5 AC 7**
  - [ ]* 13.2 Write property test for Hero primary CTA external URL
    - **Property 18: Hero primary CTA opens external URL**
    - Render Hero component, query the "Book Appointment" link, assert href contains "calendly.com", target is "_blank", rel contains "noopener" and "noreferrer", href does NOT start with "#"
    - Add to `src/components/__tests__/` test directory
    - **Validates: Req 2 AC 2, AC 3, AC 4**
  - [ ]* 13.3 Write property test for Newsletter form submission distinct email
    - **Property 19: Newsletter form submission sends distinct email**
    - Mock Resend API, submit newsletter form, assert email subject contains "Newsletter" and does NOT contain "Contact Form", assert email body contains the submitted email address
    - Add to `src/components/__tests__/` test directory
    - **Validates: Req 4 AC 8, AC 9**
  - [ ]* 13.4 Write property test for Nav CTA blue retaining fill in scrolled state
    - **Property 20: Nav CTA blue retains fill in scrolled state**
    - Render Navbar with `alwaysScrolled={true}`, query the "Get In Touch" link, assert it has both `.navCta` and `.navCtaBlue` CSS module classes applied
    - Add to `src/components/__tests__/` test directory
    - **Validates: Req 3 AC 14**

- [x] 14. Update existing test assertions for changed components (@qa-engineer)
  - [ ]* 14.1 Update Hero test assertions
    - Update any tests that assert on CTA text "Get In Touch" to expect "Book Appointment"
    - Update any tests that assert on CTA href `#contact` to expect the Calendly URL
    - Verify Hero preservation and bugcondition property tests still pass
    - _Requirements: Req 2_
  - [ ]* 14.2 Update Navbar test assertions
    - Update tests that assert on 5 nav links to expect 6
    - Update tests that assert on "Contact" label to expect "Get In Touch"
    - Verify Navbar property tests still pass with new nav structure
    - _Requirements: Req 3_
  - [ ]* 14.3 Update Newsletter test assertions
    - Update tests that assert on external link behaviour to expect inline form
    - Verify Newsletter property tests still pass with new form-based component
    - _Requirements: Req 4_

- [x] 15. Final checkpoint — Verify all tests pass and build succeeds
  - Run `./node_modules/.bin/vitest --run` — all tests (existing + new) must pass
  - Ensure no TypeScript compilation errors
  - Ensure all 7 requirements are covered by implementation tasks
  - Ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation after each priority group
- Property tests (Properties 17–20) validate universal correctness properties from the design document
- The `newsletterUrl` export in `siteConfig.ts` becomes unused after task 6 — it can be removed or left for cleanup
- ENH-3 (Req 7) is prototype-only — no production code changes needed
- Dependency chain: `types.ts` → `siteConfig.ts` → `Navbar.tsx` (respect this order in task 4)
