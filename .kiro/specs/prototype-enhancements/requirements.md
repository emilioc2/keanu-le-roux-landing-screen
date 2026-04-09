# Prototype Enhancements — Requirements Document

## Introduction

This document defines the requirements for the approved prototype enhancements to the Keanu Le Roux Financial Advisor production website. Each requirement is derived from changes visible in the approved prototype (`prototype/index.html` and `prototype/styles.css`) that are not yet reflected in the production Next.js codebase.

These enhancements represent the next development cycle. They are numbered ENH-1 through ENH-11 (ENH-4 and ENH-5 were excluded by stakeholder decision). Requirements are grouped by functional area and ordered by implementation priority.

### Source of Truth

- Enhancement definitions: `.kiro/source/prototype-enhancements.md`
- Visual reference: `prototype/index.html`, `prototype/styles.css`
- Existing production requirements: `.kiro/specs/keanu-financial-advisor-website/requirements.md`
- Existing production design: `.kiro/specs/keanu-financial-advisor-website/design.md`
- Existing screen requirements: `source/screen-requirements.md`
- Site configuration: `src/data/siteConfig.ts`
- Contact API route (Resend infrastructure): `src/app/api/contact/route.ts`

### QA Fixes Already Incorporated

The following QA bug fixes are already reflected in the acceptance criteria and screen requirements within this document:

| Bug ID | Fix Summary |
|--------|-------------|
| BUG-181 | Budget tracker filename uses spaces (`Tracking Budget 2026.xlsx`), not hyphens |
| BUG-183 | Newsletter error text corrected to "Something went wrong. Please try again." |
| BUG-184 | Newsletter error CSS class `.newsletter-error` with `role="alert"` for accessibility |
| BUG-185 | Newsletter success text corrected to heading "Thank you for subscribing!" and subtitle "You'll hear from me soon." |
| BUG-186 | Newsletter loading state: button disabled with text "Subscribing..." during submission |
| BUG-191 | Testimonial cards wrapped in ScrollReveal animation (fade-up on viewport entry) |
| BUG-197 | Nav CTA transition list note: letter-spacing change is instant (mobile override only, no transition needed) |
| BUG-198 | Req 5 AC 10 note: extends scope of main spec Req 12 AC 1 to include testimonial cards |
| BUG-199 | Req 6 AC 3 href uses URL-encoded form (`%20`) consistent with Screen Requirements |
| BUG-200 | Req 2 Files to Change includes `prototype/index.html` for hero CTA href update |
| BUG-201 | Newsletter API AC requires HTML-entity-escaping of subscriber email before interpolation |
| BUG-202 | Cross-reference table includes main spec Req 1 AC 5 (smooth-scroll targets include #testimonials) |
| BUG-203 | Newsletter form includes honeypot spam protection AC, consistent with contact form pattern |
| BUG-204 | Screen Requirements note: newsletter error/loading CSS values are production-only additions |
| BUG-205 | Req 1 AC 3 converted from AC to Note (verification statement, not testable) |

---

## Glossary

All terms from the main requirements glossary apply. The following additions are specific to this enhancement cycle:

- **Testimonials_Section**: The section displaying client social proof cards between the Newsletter and Partners sections
- **Budget_Tracker**: The downloadable Excel spreadsheet (`Tracking Budget 2026.xlsx`) offered as a free resource below the Social Feed section
- **Nav_CTA_Blue**: The steel-blue pill-styled variant of the navigation Contact link, visually matching the hero primary CTA colour

---

## Priority Order

Enhancements are listed in recommended implementation order based on dependency chains and impact:

| Priority | Requirement | Enhancement(s) | Rationale |
|----------|-------------|-----------------|-----------|
| P1 | Req 1 | ENH-11 | Zero-risk config change, immediate correctness fix |
| P2 | Req 2 | ENH-6 | High-visibility CTA change, external booking link |
| P3 | Req 3 | ENH-2 + ENH-7 | Nav changes depend on each other; implement together |
| P4 | Req 4 | ENH-10 | Replaces external link with functional form; requires API route |
| P5 | Req 5 | ENH-1 | New section, no dependencies on other enhancements |
| P6 | Req 6 | ENH-8 + ENH-9 | New asset + download button; implement together |
| P7 | Req 7 | ENH-3 | Prototype-only fix (remove Ashburton and Sygnia from prototype) |

---

## Requirements

### Requirement 1: Phone Number Update

**Enhancement(s):** ENH-11
**Priority:** P1

**User Story:** As a Visitor, I want to see Keanu's correct phone number in the footer, so that I can reach him on his current contact number.

**Affected Existing Requirements:** None directly — Req 10 (Footer) does not specify the exact phone number value. This is a data-level correction in `siteConfig.ts`.

#### Acceptance Criteria

1. THE `contactInfo.phone` value in `siteConfig.ts` SHALL be updated from "+27 83 789 8227" to "+27 65 572 3909".
2. THE Footer SHALL display the phone number "T +27 65 572 3909" in the details block.

> **Note (BUG-205):** The prototype footer already displays the correct number "+27 65 572 3909" (confirmed in `prototype/index.html`). This is a verification statement, not a testable acceptance criterion.

#### Screen Requirements

No visual or CSS changes. The Footer component already reads the phone number from `siteConfig.ts` — only the data value changes.

#### Files to Change

| File | Change |
|------|--------|
| `src/data/siteConfig.ts` | Update `contactInfo.phone` from "+27 83 789 8227" to "+27 65 572 3909" |

---

### Requirement 2: Hero Primary CTA Changed

**Enhancement(s):** ENH-6
**Priority:** P2

**User Story:** As a Visitor, I want to book an appointment directly from the hero section, so that I can schedule a meeting with Keanu without navigating through the site.

**Affected Existing Requirements:**
- **Req 2 AC 9** (main spec): Currently says "Get In Touch" smooth-scrolls to Contact_Form. Must be superseded by this requirement.
- **Req 2 AC 11** (main spec): Button text reference changes from "Get In Touch" to "Book Appointment". Visual styling unchanged.

#### Acceptance Criteria

1. THE Hero_Section primary CTA button SHALL display the text "Book Appointment".
2. WHEN a Visitor clicks the "Book Appointment" button, THE Hero_Section SHALL open the URL `https://calendly.com/keanu-thewealthroom/meetingrequest` in a new browser tab.
3. THE "Book Appointment" button SHALL include the attributes `target="_blank"` and `rel="noopener noreferrer"` for security.
4. THE "Book Appointment" button SHALL NOT smooth-scroll to the Contact_Form section.
5. THE "Book Appointment" button SHALL retain the solid steel-blue (#7a9bb5) fill, white text, and pill shape (border-radius 40px) styling.
6. THE "Book Appointment" button hover state SHALL darken to #6889a3.
7. THE secondary CTA ("Subscribe to Newsletter" linking to #newsletter) SHALL remain unchanged.

> **Note:** The prototype uses `https://booking.example.com` as a placeholder. Production MUST use the real Calendly URL: `https://calendly.com/keanu-thewealthroom/meetingrequest`

#### Screen Requirements

Reference: `prototype/index.html` (hero section) and `prototype/styles.css` (`.btn-hero-primary`)

**Primary CTA Button:**
- Text: "Book Appointment"
- Element: `<a>` tag (not `<button>`)
- href: `https://calendly.com/keanu-thewealthroom/meetingrequest`
- target: `_blank`
- rel: `noopener noreferrer`
- CSS class: `btn btn-hero-primary`
- Background: #7a9bb5 (steel-blue)
- Border colour: #7a9bb5
- Text colour: var(--white)
- Padding: 16px 44px
- Border radius: 40px
- Hover: background #6889a3, border-color #6889a3

#### Files to Change

| File | Change |
|------|--------|
| `src/components/Hero.tsx` | Change CTA text to "Book Appointment", href to Calendly URL, add `target="_blank"` and `rel="noopener noreferrer"` |
| `prototype/index.html` | Update hero CTA href from `https://booking.example.com` to `https://calendly.com/keanu-thewealthroom/meetingrequest` (BUG-200) |

---

### Requirement 3: Nav CTA Blue Variant

**Enhancement(s):** ENH-2 + ENH-7
**Priority:** P3

**User Story:** As a Visitor, I want a visually prominent "Get In Touch" button in the navigation bar, so that I can quickly find and access the contact section from anywhere on the page.

**Affected Existing Requirements:**
- **Req 1 AC 4** (main spec): Nav links must be updated from "Home, About, Services, Insights, Contact" to "Home, About, Services, Insights, Testimonials, Get In Touch".
- **Req 1 AC 5** (main spec): Smooth-scroll targets must include `#testimonials`.

#### Acceptance Criteria

**Navigation Items (ENH-2):**

1. THE Navbar SHALL display 6 navigation items in the following order: Home, About, Services, Insights, Testimonials, Get In Touch.
2. THE "Testimonials" link SHALL use the anchor href `#testimonials` on the landing page and `/#testimonials` on the blog post detail page.
3. THE "Get In Touch" link SHALL use the anchor href `#contact` on the landing page and `/#contact` on the blog post detail page.
4. THE "Get In Touch" link SHALL be styled with the `.nav-cta.nav-cta-blue` CSS classes, rendering as a solid steel-blue (#7a9bb5) pill button with white text.
5. WHILE the viewport width is at or below 768 pixels, THE "Get In Touch" link SHALL be stripped of all CTA styling (no border, no background, no border-radius) and display as plain text matching other nav links (navy colour, normal font weight).
6. THE `navLinks` array in `siteConfig.ts` SHALL include a mechanism to identify which link receives CTA styling (e.g. a `cta` boolean or `className` property on the NavLink type).

**Nav CTA Blue CSS (ENH-7):**

7. THE `.nav-cta` class SHALL render a pill-shaped button with padding 8px 24px, border-radius 40px, 1.5px solid border, and font-weight 500.
8. THE `.nav-cta` class on the transparent navbar SHALL display a white semi-transparent border (`rgba(255, 255, 255, 0.6)`) with white text.
9. WHEN a Visitor hovers over the `.nav-cta` on the transparent navbar, THE button SHALL fill with white background and display navy text.
10. THE `.nav-cta` class on the scrolled navbar SHALL display a navy border with navy text.
11. WHEN a Visitor hovers over the `.nav-cta` on the scrolled navbar, THE button SHALL fill with navy background and display white text.
12. THE `.nav-cta.nav-cta-blue` class SHALL override the base `.nav-cta` with a solid steel-blue (#7a9bb5) background, steel-blue border, and white text on the transparent navbar.
13. WHEN a Visitor hovers over the `.nav-cta.nav-cta-blue` on the transparent navbar, THE button SHALL darken to #6889a3 background and border with white text.
14. THE `.nav-cta.nav-cta-blue` class on the scrolled (white) navbar SHALL retain the steel-blue (#7a9bb5) background, steel-blue border, and white text. It does NOT switch to a navy outline like the regular `.nav-cta`.
15. WHEN a Visitor hovers over the `.nav-cta.nav-cta-blue` on the scrolled navbar, THE button SHALL darken to #6889a3 background and border with white text.
16. WHILE the viewport width is at or below 768 pixels, THE `.nav-cta` and `.nav-cta.nav-cta-blue` in the mobile dropdown SHALL be stripped of all pill styling (border: none, padding: 0, border-radius: 0, background: transparent) and display as plain navy text matching other nav links.

#### Screen Requirements

Reference: `prototype/index.html` (nav section) and `prototype/styles.css` (`.nav-cta`, `.nav-cta-blue`)

**Updated Nav Links List:**

| Label | Href | Styling |
|-------|------|---------|
| Home | #hero | Standard nav link |
| About | #about | Standard nav link |
| Services | #services | Standard nav link |
| Insights | #blog | Standard nav link |
| Testimonials | #testimonials | Standard nav link |
| Get In Touch | #contact | `.nav-cta.nav-cta-blue` (steel-blue pill) |

**Base `.nav-cta` (transparent navbar):**
- padding: 8px 24px
- border: 1.5px solid rgba(255, 255, 255, 0.6)
- border-radius: 40px
- color: var(--white) !important
- font-weight: 500
- letter-spacing: 0.06em
- transition: background var(--transition), color var(--transition), border-color var(--transition)

> **Note (BUG-197):** The `letter-spacing` property changes from `0.06em` (desktop) to `0.04em` (mobile override) but is not included in the transition list. This is intentional — the letter-spacing change only occurs at the mobile breakpoint (≤768px) where all CTA styling is stripped, so no animated transition is needed.

**Base `.nav-cta` hover (transparent navbar):**
- background: var(--white)
- color: var(--navy) !important
- border-color: var(--white)

**Base `.nav-cta` (scrolled navbar):**
- border-color: var(--navy)
- color: var(--navy) !important

**Base `.nav-cta` hover (scrolled navbar):**
- background: var(--navy)
- color: var(--white) !important
- border-color: var(--navy)

**Blue Variant `.nav-cta.nav-cta-blue` (transparent navbar):**
- border-color: #7a9bb5
- background: #7a9bb5
- color: var(--white) !important

**Blue Variant hover (transparent navbar):**
- background: #6889a3
- border-color: #6889a3
- color: var(--white) !important

**Blue Variant (scrolled navbar):**
- border-color: #7a9bb5
- background: #7a9bb5
- color: var(--white) !important

**Blue Variant hover (scrolled navbar):**
- background: #6889a3
- border-color: #6889a3
- color: var(--white) !important

**Mobile Override (at or below 768px, inside active mobile dropdown):**
Both `.nav-cta` and `.nav-cta.nav-cta-blue`:
- border: none
- padding: 0
- border-radius: 0
- background: transparent
- color: var(--navy) !important
- font-weight: 400
- letter-spacing: 0.04em

#### Files to Change

| File | Change |
|------|--------|
| `src/data/siteConfig.ts` | Add Testimonials nav link, change Contact label to "Get In Touch", add CTA styling metadata |
| `src/lib/types.ts` | Update NavLink type to support CTA styling (add optional `cta`/`className` property) |
| `src/components/Navbar.tsx` | Apply `.nav-cta.nav-cta-blue` classes to the CTA nav link |
| `src/components/Navbar.module.css` | Add `.nav-cta` base styles and `.nav-cta-blue` variant with all state combinations |

---

### Requirement 4: Newsletter Inline Email Form

**Enhancement(s):** ENH-10
**Priority:** P4

**User Story:** As a Visitor, I want to subscribe to Keanu's newsletter directly on the website by entering my email address, so that I can sign up without being redirected to an external page.

**Affected Existing Requirements:**
- **Req 7 AC 5** (main spec): Currently says "Subscribe" pill button with white outlined style. Superseded: replaced with email input + "Subscribe" submit button in flex form.
- **Req 7 AC 6** (main spec): Currently says clicking Subscribe opens external newsletter signup page. Superseded: form submission sends email via Resend API.
- **Req 7 AC 7** (main spec): Currently says "no email input field and no inline form". Superseded: section now HAS an inline email form.

> **Note:** The `newsletterUrl` export in `siteConfig.ts` will become unused after this enhancement is implemented.

#### Acceptance Criteria

1. THE Newsletter_Section SHALL display an inline email capture form instead of an external link button.
2. THE Newsletter_Section SHALL display an email input field with the placeholder text "Enter your email address".
3. THE email input field SHALL use bottom-border-only styling (no box borders) with a 1px solid border at `rgba(255, 255, 255, 0.25)` that transitions to white on focus.
4. THE Newsletter_Section SHALL display a "Subscribe" submit button styled with the `.btn-newsletter` class (white outlined pill on navy background).
5. THE email input and submit button SHALL be displayed side by side on desktop viewports within a flex container (max-width 480px, centred).
6. WHILE the viewport width is at or below 768 pixels, THE email input and submit button SHALL stack vertically (flex-direction: column).
7. WHEN a Visitor submits the newsletter form with a valid email address, THE Website SHALL send an email to `keanu@thewealthroom.com` via the Resend API.
8. THE email sent to Keanu SHALL have the subject line "New Newsletter Subscription" to clearly distinguish it from contact form submissions.
9. THE email body SHALL include the subscriber email address and a clear indication that this is a newsletter subscription request.
10. WHEN the newsletter form submission succeeds, THE Newsletter_Section SHALL replace the form with a success confirmation message displaying the heading "Thank you for subscribing!" and the subtitle "You'll hear from me soon." alongside a green checkmark SVG icon (colour: #4ade80). The confirmation SHALL use the `.newsletter-success` CSS class.
11. IF the newsletter form submission fails, THEN THE Newsletter_Section SHALL display an inline error message with the text "Something went wrong. Please try again." so the subscriber can retry. The error message SHALL use the `.newsletter-error` CSS class.
12. THE newsletter form SHALL validate that the email field is non-empty and matches a valid email format before submission.
13. THE Newsletter_Section SHALL retain the existing heading ("Stay Ahead of the Curve"), description paragraph, and benefit list items unchanged.
14. THE email input field SHALL include `aria-label="Email address for newsletter"` for accessibility.
15. WHILE the newsletter form submission is in progress, THE "Subscribe" button SHALL be disabled and its text SHALL change to "Subscribing..." to indicate the loading state. THE button SHALL be re-enabled after the submission succeeds or fails.
16. THE `/api/newsletter` route SHALL HTML-entity-escape the subscriber email address (using the same `escapeHtml()` utility as the contact form API) before interpolating it into the email template, to prevent stored XSS in web-based mail clients.
17. THE newsletter form SHALL include a hidden honeypot field (consistent with the contact form pattern per BUG-025). IF the honeypot field is populated, THEN the `/api/newsletter` route SHALL silently return a success response without sending an email.

#### Screen Requirements

Reference: `prototype/index.html` (newsletter section) and `prototype/styles.css` (`.newsletter-form`, `.btn-newsletter`)

**Newsletter Form Container:**
- CSS class: `.newsletter-form`
- Layout: display: flex, gap: 12px
- max-width: 480px
- margin: 0 auto
- Breakpoint at or below 768px: flex-direction: column

**Email Input:**
- Element: `<input type="email">`
- name: `email`
- placeholder: "Enter your email address"
- required: true
- aria-label: "Email address for newsletter"
- flex: 1
- padding: 14px 0
- font-family: var(--font-body)
- font-size: 0.88rem
- border: none
- border-bottom: 1px solid rgba(255, 255, 255, 0.25)
- background: transparent
- color: var(--white)
- outline: none
- Placeholder colour: rgba(255, 255, 255, 0.4)
- Focus state: border-color: var(--white)

**Submit Button:**
- CSS class: `.btn-newsletter`
- Element: `<button type="submit">`
- Text: "Subscribe"
- padding: 14px 32px
- font-family: var(--font-body)
- font-size: 0.82rem
- font-weight: 500
- letter-spacing: 0.08em
- text-transform: uppercase
- border: 1.5px solid rgba(255, 255, 255, 0.5)
- border-radius: 40px
- background: transparent
- color: var(--white)
- cursor: pointer
- white-space: nowrap
- Hover: background var(--white), color var(--navy), border-color var(--white)

**Success State:**
- CSS class: `.newsletter-success`
- Layout: display: flex, flex-direction: column, align-items: center, gap: 12px
- padding: 20px 0 0
- colour: rgba(255, 255, 255, 0.85)
- Includes a green checkmark SVG icon (colour: #4ade80)
- Heading text: "Thank you for subscribing!" — font-size: 1rem, font-weight: 500, colour: var(--white)
- Subtitle text: "You'll hear from me soon." — font-size: 0.9rem, colour: rgba(255, 255, 255, 0.85)

**Error State:**
- CSS class: `.newsletter-error`
- Layout: display: flex, align-items: center, justify-content: center, gap: 8px
- margin-top: 12px
- colour: rgba(255, 100, 100, 0.9)
- font-size: 0.85rem
- Error text: "Something went wrong. Please try again."
- `role="alert"` attribute for accessibility (announces error to screen readers)

**Loading / Submitting State:**
- The "Subscribe" button SHALL be disabled (`disabled` attribute) during form submission
- Button text changes from "Subscribe" to "Subscribing..."
- cursor: not-allowed on the disabled button
- opacity: 0.6 on the disabled button to visually indicate the inactive state

> **Note (BUG-204):** The error state (`.newsletter-error`) and loading/submitting state CSS values are production-only additions. The prototype uses a simple `mailto:` form action and does not implement client-side form state management, so these styles have no prototype equivalent. They follow the same patterns established by the contact form's error and loading states.

**API Route Specification:**
- Endpoint: `POST /api/newsletter` (new route)
- Request body: `{ email: string }`
- Resend email configuration:
  - from: `"Keanu Le Roux Website <onboarding@resend.dev>"` (same sender as contact form)
  - to: `keanu@thewealthroom.com`
  - subject: "New Newsletter Subscription"
  - html body: Clearly formatted email containing the subscriber email address and a note that this is a newsletter subscription (not a contact form submission)
- Response: `{ success: boolean, error?: string }`
- Security: Apply the same rate limiting, basic validation, honeypot spam protection, and HTML escaping (`escapeHtml()`) as the contact form API route
- The existing Resend API key (`RESEND_API_KEY` in `.env.local`) is reused — no new API keys needed

#### Files to Change

| File | Change |
|------|--------|
| `src/components/Newsletter.tsx` | Rewrite from Server Component to Client Component with inline email form, state management, and API submission |
| `src/components/Newsletter.module.css` | Add form, input, button, success state, error state, and loading state styles |
| `src/app/api/newsletter/route.ts` | New API route for newsletter email submissions via Resend |

---

### Requirement 5: New Testimonials Section

**Enhancement(s):** ENH-1
**Priority:** P5

**User Story:** As a Visitor, I want to read testimonials from Keanu's existing clients, so that I can gain confidence in his services through social proof before reaching out.

**Affected Existing Requirements:**
- **Req 1 AC 4** (main spec): Navigation links list must include "Testimonials" (addressed in Req 3 of this document).
- **Page composition** (`src/app/page.tsx`): New Testimonials component inserted between Newsletter and Partners.

The current production page order is: Navbar, Hero, About, Services, Blog, SocialFeed, Newsletter, Partners, ContactForm, Footer.
The new order becomes: Navbar, Hero, About, Services, Blog, SocialFeed, Newsletter, **Testimonials**, Partners, ContactForm, Footer.

#### Acceptance Criteria

1. THE Testimonials_Section SHALL display on an off-white (#f9f9f9) background with 80 pixels of vertical padding.
2. THE Testimonials_Section SHALL display a centred section header with the heading "What My Clients Say" and the subtitle "Real feedback from people I've had the privilege of working with."
3. THE Testimonials_Section SHALL display a three-column grid of testimonial cards on desktop viewports.
4. WHILE the viewport width is at or below 900 pixels, THE Testimonials_Section SHALL display the testimonial cards in a two-column grid.
5. WHILE the viewport width is at or below 768 pixels, THE Testimonials_Section SHALL display the testimonial cards in a single-column stack.
6. THE Testimonials_Section SHALL display exactly three testimonial cards with the following content:
   - Card 1: Quote from Sarah M. (Client since 2023) — "Keanu took the time to truly understand our family's goals. His advice gave us clarity and confidence in our financial future."
   - Card 2: Quote from James T. (Business Owner) — "Working with Keanu has been a game-changer for my business finances. He simplified what felt overwhelming and built a plan that actually works."
   - Card 3: Quote from Priya N. (Client since 2024) — "I finally feel in control of my retirement planning. Keanu's transparent, no-pressure approach is exactly what I was looking for."
7. EACH testimonial card SHALL display a decorative open-quote icon in steel-blue (#7a9bb5), an italic blockquote containing the testimonial text, the client name in semi-bold navy, and the client role in muted grey.
8. THE Testimonials_Section SHALL render with the `id="testimonials"` attribute on its outermost section element to serve as the anchor target for the Testimonials nav link.
9. THE Testimonials_Section SHALL be positioned between the Newsletter_Section and the Partners_Section in the page flow.
10. THE Testimonials_Section SHALL wrap each testimonial card in a ScrollReveal animation (fade-up on viewport entry), consistent with the Blog and SocialFeed card treatment per Req 12 AC 1 of the main spec.

> **Note (BUG-198):** This AC extends the scope of main spec Req 12 AC 1, which currently only covers Blog and SocialFeed cards. The implementation of this requirement implicitly broadens Req 12 AC 1 to also include testimonial cards.

#### Screen Requirements

Reference: `prototype/index.html` (Testimonials section) and `prototype/styles.css` (`.testimonials`, `.testimonials-grid`, `.testimonial-card`)

**Section Container:**
- Background: var(--off-white) / #f9f9f9
- Vertical padding: 80px 0
- Section id: `testimonials`

**Section Header:**
- Reuses the shared `.section-header` pattern (centred text, same as Content Feed and Partners)
- Heading: "What My Clients Say" — font-family: var(--font-heading), font-size: 3rem, font-weight: 400, color: var(--navy), margin-bottom: 8px
- Subtitle: "Real feedback from people I've had the privilege of working with." — font-size: 0.95rem, color: var(--text-body)
- Bottom margin: 48px (from `.section-header` pattern)

**Testimonials Grid:**
- CSS class: `.testimonials-grid`
- Layout: display: grid
- Desktop: grid-template-columns: repeat(3, 1fr)
- Gap: 32px
- Breakpoint at or below 900px: grid-template-columns: repeat(2, 1fr)
- Breakpoint at or below 768px: grid-template-columns: 1fr

**Testimonial Card:**
- CSS class: `.testimonial-card`
- Background: var(--white) / #ffffff
- Border radius: 12px
- Padding: 36px 32px
- Box shadow: 0 2px 12px rgba(0, 0, 0, 0.06)
- Layout: display: flex, flex-direction: column, gap: 20px

**Decorative Quote Icon:**
- CSS class: `.testimonial-quote-icon`
- Content: left double quotation mark (Unicode U+201C)
- Font size: 2.4rem
- Line height: 1
- Colour: #7a9bb5 (steel-blue)
- Font family: Georgia, serif
- `aria-hidden="true"` (decorative only)

**Blockquote:**
- CSS class: `.testimonial-quote`
- Font size: 0.95rem
- Line height: 1.75
- Colour: var(--text-body) / #444
- Font style: italic
- flex: 1 (pushes client info to bottom, aligns cards at same height)
- Margin: 0 (reset default blockquote margin)

**Client Attribution:**
- Container class: `.testimonial-client` — display: flex, flex-direction: column, gap: 2px
- Name class: `.testimonial-name` — font-family: var(--font-body), font-weight: 600, font-size: 0.9rem, color: var(--navy)
- Role class: `.testimonial-role` — font-size: 0.82rem, color: var(--gray-600) / #666

**Scroll Reveal Animation:**
- Each testimonial card SHALL be wrapped in a ScrollReveal component (fade-up animation on viewport entry)
- Consistent with Blog card and SocialFeed card treatment per Req 12 AC 1 of the main spec
- Animation: fade-up, triggered when the card enters the viewport

#### Files to Change

| File | Change |
|------|--------|
| `src/components/Testimonials.tsx` | New component — Server Component rendering 3 testimonial cards |
| `src/components/Testimonials.module.css` | New CSS Module for Testimonials section |
| `src/app/page.tsx` | Import and render Testimonials component between Newsletter and Partners |

---

### Requirement 6: Budget Tracker Download

**Enhancement(s):** ENH-8 + ENH-9
**Priority:** P6

**User Story:** As a Visitor, I want to download a free budget tracking spreadsheet, so that I can start managing my finances with a practical tool provided by Keanu.

**Affected Existing Requirements:**
- **Req 6** (main spec, Social Feed): New acceptance criteria needed for the download button below the feed grid.

#### Acceptance Criteria

**Download Button (ENH-8):**

1. THE Social_Feed_Section SHALL display a centred download button below the feed card grid.
2. THE download button SHALL display the text "📥 Download Free Budget Tracker 2026" (including the inbox tray emoji prefix).
3. THE download button SHALL link to the file `/Tracking%20Budget%202026.xlsx` (URL-encoded form; actual filename uses spaces: `Tracking Budget 2026.xlsx`) in the public directory.
4. THE download button SHALL include the HTML `download` attribute to trigger a file save dialog instead of navigation.
5. THE download button SHALL use the `.btn` class (pill-shaped, navy outlined border, border-radius 40px, transparent background).
6. WHEN a Visitor hovers over the download button, THE button SHALL fill with navy background and display white text (standard `.btn` hover behaviour).
7. THE download button container SHALL have a top margin of 48 pixels separating it from the feed grid.
8. THE download button SHALL be centred horizontally using `text-align: center` on its container.

**Spreadsheet File (ENH-9):**

9. THE file `Tracking Budget 2026.xlsx` SHALL be placed in the `public/` directory of the production codebase.
10. THE file SHALL be an Excel spreadsheet (.xlsx format) containing a monthly budget tracking template.
11. THE spreadsheet SHALL include budget categories for: Income, Home Expenses, Transportation, Health/Insurance, Charity/Gifts, Daily Living, Entertainment, Savings/Investments, Debts/Financing, Subscriptions, and Miscellaneous.
12. THE spreadsheet SHALL include charts for income trend and monthly expense breakdowns.
13. THE file SHALL be accessible at the URL path `/Tracking Budget 2026.xlsx` when the production site is deployed.
14. THE file SHALL be served with appropriate Content-Type headers for Excel files (`application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`).

> **Note:** The prototype HTML currently uses `Tracking-Budget-2026.xlsx` (hyphens) which does not match the actual file `Tracking Budget 2026.xlsx` (spaces). The prototype href must be corrected to use spaces (or URL-encoded spaces `Tracking%20Budget%202026.xlsx`) to match the real filename. This was identified as BUG-181.

#### Screen Requirements

Reference: `prototype/index.html` (feed-download section) and `prototype/styles.css` (`.feed-download`, `.btn`)

**Download Container:**
- CSS class: `.feed-download`
- text-align: center
- margin-top: 48px

**Download Button:**
- Element: anchor tag with `download` attribute
- href: `/Tracking Budget 2026.xlsx` (spaces in filename; use URL-encoded `Tracking%20Budget%202026.xlsx` in HTML)
- CSS class: `btn`
- display: inline-block
- padding: 16px 48px
- font-family: var(--font-body)
- font-size: 0.85rem
- font-weight: 500
- letter-spacing: 0.12em
- text-transform: uppercase
- border: 1.5px solid var(--navy)
- border-radius: 40px
- background: transparent
- color: var(--navy)
- Hover: background var(--navy), color var(--white)

#### Files to Change

| File | Change |
|------|--------|
| `src/components/SocialFeed.tsx` | Add download button markup below the feed grid |
| `src/components/SocialFeed.module.css` | Add `.feed-download` container styles |
| `public/Tracking Budget 2026.xlsx` | Copy from `prototype/Tracking Budget 2026.xlsx` |

---

### Requirement 7: Partner Logos Sync

**Enhancement(s):** ENH-3
**Priority:** P7

**User Story:** As a stakeholder, I want the prototype to match the production partner logo set, so that the prototype remains an accurate visual reference.

**Affected Existing Requirements:** None. Production already has the correct 5 logos per Req 8 AC 3 of the main spec. This is a prototype-only correction.

> **Important:** This is a prototype-only fix. No production code changes are required.

#### Acceptance Criteria

1. THE prototype `index.html` Partners section SHALL display exactly 5 partner logos: Allan Grey, BrightRock, Discovery, Momentum, and Ninety One.
2. THE prototype Partners section SHALL NOT include Ashburton or Sygnia logos in either the primary or duplicate carousel track sets.
3. THE production Partners_Section SHALL remain unchanged at 5 logos.

#### Files to Change

| File | Change |
|------|--------|
| `prototype/index.html` | Remove Ashburton and Sygnia `<img>` tags from the `.partners-track` div (both primary and `aria-hidden` duplicate sets) |

---

## Cross-Reference: Existing Requirement ACs Affected

The following acceptance criteria in the main spec (`.kiro/specs/keanu-financial-advisor-website/requirements.md`) are superseded or modified by this enhancement cycle:

| Requirement | AC | Current Text (Summary) | Enhancement | Required Change |
|------------|-----|----------------------|-------------|-----------------|
| Req 1 | AC 4 | Nav links: Home, About, Services, Insights, Contact | ENH-2 | Update to: Home, About, Services, Insights, Testimonials, Get In Touch |
| Req 1 | AC 5 | Smooth-scroll targets: #hero, #about, #services, #blog, #contact | ENH-2 | Add #testimonials to smooth-scroll target list |
| Req 2 | AC 9 | "Get In Touch" smooth-scrolls to Contact_Form | ENH-6 | "Book Appointment" opens Calendly URL in new tab |
| Req 2 | AC 11 | "Get In Touch" button uses steel-blue fill | ENH-6 | Change text reference to "Book Appointment"; styling unchanged |
| Req 7 | AC 5 | "Subscribe" pill button with white outlined style | ENH-10 | Replace with: email input + "Subscribe" submit button in flex form |
| Req 7 | AC 6 | Clicking Subscribe opens external newsletter signup page | ENH-10 | Replace with: form submission sends email via Resend API |
| Req 7 | AC 7 | No email input field and no inline form | ENH-10 | Remove or invert: section now HAS an inline email form |

---

## Files to Change — Consolidated Summary

### New Files to Create

| File | Requirement | Enhancement | Description |
|------|-------------|-------------|-------------|
| `src/components/Testimonials.tsx` | Req 5 | ENH-1 | New Testimonials section component (Server Component) |
| `src/components/Testimonials.module.css` | Req 5 | ENH-1 | CSS Module for Testimonials section |
| `src/app/api/newsletter/route.ts` | Req 4 | ENH-10 | New API route for newsletter email submissions via Resend |
| `public/Tracking Budget 2026.xlsx` | Req 6 | ENH-9 | Budget tracker spreadsheet (copy from `prototype/`) |

### Existing Files to Modify

| File | Requirement(s) | Enhancement(s) | Changes |
|------|----------------|----------------|---------|
| `src/data/siteConfig.ts` | Req 1, Req 3 | ENH-11, ENH-2 | Update phone number, add Testimonials nav link, change Contact to "Get In Touch" with CTA metadata |
| `src/lib/types.ts` | Req 3 | ENH-2 | Update NavLink type to support CTA styling (add optional `cta`/`className` property) |
| `src/components/Navbar.tsx` | Req 3 | ENH-2 | Apply `.nav-cta.nav-cta-blue` classes to the CTA nav link |
| `src/components/Navbar.module.css` | Req 3 | ENH-7 | Add `.nav-cta` base styles and `.nav-cta-blue` variant with all state combinations |
| `src/components/Hero.tsx` | Req 2 | ENH-6 | Change CTA text to "Book Appointment", href to Calendly URL, add `target`/`rel` attributes |
| `prototype/index.html` | Req 2, Req 7 | ENH-6, ENH-3 | Update hero CTA href to Calendly URL (BUG-200); remove Ashburton and Sygnia logos |
| `src/components/Newsletter.tsx` | Req 4 | ENH-10 | Rewrite from Server to Client Component with inline email form |
| `src/components/Newsletter.module.css` | Req 4 | ENH-10 | Add form, input, button, and success/error/loading state styles |
| `src/components/SocialFeed.tsx` | Req 6 | ENH-8 | Add download button markup below feed grid |
| `src/components/SocialFeed.module.css` | Req 6 | ENH-8 | Add `.feed-download` container styles |
| `src/app/page.tsx` | Req 5 | ENH-1 | Import and render Testimonials component between Newsletter and Partners |

### Prototype Files to Modify

> **Note:** `prototype/index.html` changes are consolidated in the Existing Files to Modify table above (Req 2 hero CTA href + Req 7 partner logos).

### Spec Documents to Update (after implementation)

| Document | Requirement(s) | Enhancement(s) | Changes Needed |
|----------|----------------|----------------|----------------|
| `requirements.md` (main spec) | Req 2, Req 3, Req 4 | ENH-2, ENH-6, ENH-10 | Update Req 1 AC 4 (nav links), Req 2 AC 9/11 (hero CTA), Req 7 AC 5-7 (newsletter form) |
| `design.md` (main spec) | Req 2–6 | ENH-1, ENH-2, ENH-6, ENH-7, ENH-8, ENH-9, ENH-10 | Component tree, section spacing, file structure, component specs |
| `screen-requirements.md` | Req 2–6 | ENH-1, ENH-2, ENH-6, ENH-7, ENH-8, ENH-10 | Nav bar, Hero, Social Feed, Newsletter, new Testimonials section |

---

## Design System Additions

No new CSS custom properties are required. All new styles use existing design tokens:
- Steel-blue: `var(--steel-blue)` / #7a9bb5 (already defined)
- Steel-blue hover: `var(--steel-blue-hover)` / #6889a3 (already defined)
- Off-white: `var(--off-white)` / #f9f9f9 (already defined)

### New Section Spacing Entry

| Component | Vertical Padding | Background |
|-----------|-----------------|------------|
| Testimonials | 80px | Off-white (#f9f9f9) |

### New Section ID

| Component | Section id |
|-----------|-----------|
| Testimonials | `testimonials` |

---

## Correctness Properties

### Property 17: Testimonial card rendering completeness

For any testimonial card rendered in the Testimonials_Section, the card SHALL contain a decorative quote icon, a blockquote element with non-empty text, a client name element with non-empty text, and a client role element with non-empty text. No required element may be missing.

**Validates:** Req 5 AC 7 (ENH-1)

### Property 18: Hero primary CTA opens external URL

For the hero primary CTA button, the element SHALL have an `href` attribute containing "calendly.com", a `target="_blank"` attribute, and a `rel` attribute containing "noopener" and "noreferrer". The element SHALL NOT have an `href` starting with "#".

**Validates:** Req 2 AC 2, AC 3, AC 4 (ENH-6)

### Property 19: Newsletter form submission sends distinct email

For any successful newsletter form submission, the email sent via Resend SHALL have a subject line containing "Newsletter" and SHALL NOT have a subject line containing "Contact Form". The email body SHALL contain the submitted email address.

**Validates:** Req 4 AC 8, AC 9 (ENH-10)

### Property 20: Nav CTA blue retains fill in scrolled state

For the `.nav-cta.nav-cta-blue` element, when the navbar is in the scrolled state, the element SHALL have a background-color of #7a9bb5 (steel-blue) and white text colour. It SHALL NOT switch to a transparent background with navy border.

**Validates:** Req 3 AC 14 (ENH-7)
