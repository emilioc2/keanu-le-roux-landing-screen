# Prototype Enhancements — Design Document

## 1. Introduction

This document specifies the technical implementation for the 7 prototype enhancement requirements defined in `.kiro/specs/prototype-enhancements/requirements.md`. It covers component architecture changes, data model updates, new and modified component specifications, a new API route, and correctness properties.

### Reference Documents

- Requirements: `.kiro/specs/prototype-enhancements/requirements.md`
- Source enhancements: `.kiro/source/prototype-enhancements.md`
- Existing production design: `.kiro/specs/keanu-financial-advisor-website/design.md`
- Visual reference: `prototype/index.html`, `prototype/styles.css`
- Contact API pattern: `src/app/api/contact/route.ts`

### Enhancement Summary

| Req | Enhancement(s) | Summary |
|-----|---------------|---------|
| 1 | ENH-11 | Phone number update in siteConfig |
| 2 | ENH-6 | Hero CTA changed to "Book Appointment" with Calendly URL |
| 3 | ENH-2 + ENH-7 | Nav CTA blue variant + Testimonials nav link |
| 4 | ENH-10 | Newsletter inline email form + API route |
| 5 | ENH-1 | New Testimonials section |
| 6 | ENH-8 + ENH-9 | Budget tracker download button + file |
| 7 | ENH-3 | Prototype partner logos sync (prototype-only) |

---

## 2. Component Architecture

### Updated Component Tree

```
page.tsx (Server Component — async, fetches blog posts)
├── Navbar (Client — scroll state, mobile menu)
│   └── navLinks from siteConfig (6 items, last has isCta: true)
├── Hero (Client — viewport detection for video/fallback)
│   ├── Primary CTA: "Book Appointment" → Calendly (target="_blank")
│   └── Secondary CTA: "Subscribe to Newsletter" → #newsletter
├── About (Server)
├── Services (Server)
├── Blog (Server — receives posts prop)
├── SocialFeed (Server)
│   ├── Feed card grid (3 platform cards)
│   └── Download button: "📥 Download Free Budget Tracker 2026" [NEW]
├── Newsletter (Client — form state management) [REWRITTEN]
│   ├── Heading, description, benefits (unchanged)
│   ├── Email input + Subscribe button (inline form)
│   ├── Hidden honeypot field (spam protection)
│   ├── Success state (green checkmark + message)
│   └── Error state (inline retry message)
├── Testimonials (Server) [NEW]
│   └── 3 testimonial cards wrapped in ScrollReveal
├── Partners (Server — carousel)
├── ContactForm (Client — form state)
└── Footer (Server)
```

### Updated Page Section Order

```
Navbar → Hero → About → Services → Blog → SocialFeed → Newsletter →
Testimonials [NEW] → Partners → ContactForm → Footer
```

---

## 3. Data Model Changes

### NavLink Type Update

**File:** `src/lib/types.ts`

The NavLink interface gains an optional `isCta` boolean property. When true, the Navbar renders the link with `.navCta.navCtaBlue` pill styling instead of the standard `.navLink` class.

```typescript
export interface NavLink {
  label: string;
  href: string;
  isCta?: boolean;
}
```

### Updated navLinks Array

**File:** `src/data/siteConfig.ts`

The array grows from 5 to 6 items. "Contact" becomes "Get In Touch" with `isCta: true`. "Testimonials" is inserted before it.

```typescript
export const navLinks: NavLink[] = [
  { label: 'Home', href: '#hero' },
  { label: 'About', href: '#about' },
  { label: 'Services', href: '#services' },
  { label: 'Insights', href: '#blog' },
  { label: 'Testimonials', href: '#testimonials' },
  { label: 'Get In Touch', href: '#contact', isCta: true },
];
```

### Phone Number Update

**File:** `src/data/siteConfig.ts`

```typescript
export const contactInfo = {
  email: 'keanu@thewealthroom.com',
  phone: '+27 65 572 3909',
} as const;
```

### Newsletter Form State Model

The Newsletter component manages form state via `useState`. Four discrete states control the UI:

| State | Button Text | Button Enabled | Form Visible | Message |
|-------|------------|----------------|-------------|---------|
| `idle` | "Subscribe" | Yes | Yes | None |
| `submitting` | "Subscribing..." | No | Yes | None |
| `success` | — | — | No | Green checkmark + "Thank you for subscribing!" |
| `error` | "Subscribe" | Yes | Yes | "Something went wrong. Please try again." |

### Newsletter API Payload

```typescript
interface NewsletterFormData {
  email: string;
  honeypot?: string;
}
```

### Testimonial Data Model

Static data defined inline in `Testimonials.tsx`. Not exported to siteConfig since testimonials are section-specific.

```typescript
interface Testimonial {
  quote: string;
  name: string;
  role: string;
}
```

Three testimonial entries with content matching Req 5 AC 6.

---

## 4. Component Specifications

### 4.1 Navbar (Modified)

**File:** `src/components/Navbar.tsx`
**Type:** Client Component (unchanged)
**Requirement:** Req 3

#### Props Interface

No change — `NavbarProps` still has only `alwaysScrolled?: boolean`.

#### Implementation Changes

In the link rendering loop, check `link.isCta` to conditionally apply CTA CSS classes:

```typescript
const linkClassName = link.isCta
  ? `${styles.navLink} ${styles.navCta} ${styles.navCtaBlue}`
  : styles.navLink;
```

Both the `<a>` (landing page) and `<Link>` (blog page) variants use the same className logic.

#### CSS Module Changes

**File:** `src/components/Navbar.module.css`

New classes added after existing `.navLink` styles. The naming uses camelCase per CSS Modules convention (`.navCta`, `.navCtaBlue`) mapping to the prototype's `.nav-cta`, `.nav-cta-blue`.

**Base `.navCta` (transparent navbar):**
- padding: 8px 24px
- border: 1.5px solid rgba(255, 255, 255, 0.6)
- border-radius: 40px
- color: var(--white) !important
- font-weight: 500
- letter-spacing: 0.06em
- transition: background, color, border-color (all var(--transition))

**Base `.navCta` hover (transparent):** white fill, navy text, white border

**`.scrolled .navCta`:** navy border, navy text
**`.scrolled .navCta:hover`:** navy fill, white text

**`.navCtaBlue` (transparent):** #7a9bb5 background + border, white text
**`.navCtaBlue:hover` (transparent):** #6889a3 background + border, white text

**`.scrolled .navCtaBlue`:** retains #7a9bb5 fill (does NOT switch to navy outline)
**`.scrolled .navCtaBlue:hover`:** #6889a3 background + border, white text

**Mobile override (≤768px, inside `.navLinks.open`):**
Both `.navCta` and `.navCtaBlue` stripped: border none, padding 0, border-radius 0, background transparent, navy text, font-weight 400, letter-spacing 0.04em.

---

### 4.2 Hero (Modified)

**File:** `src/components/Hero.tsx`
**Type:** Client Component (unchanged)
**Requirement:** Req 2

#### Changes

Minimal text and attribute changes to the primary CTA anchor element:

| Property | Before | After |
|----------|--------|-------|
| Text | "Get In Touch" | "Book Appointment" |
| href | `#contact` | `https://calendly.com/keanu-thewealthroom/meetingrequest` |
| target | (none) | `_blank` |
| rel | (none) | `noopener noreferrer` |

The secondary CTA ("Subscribe to Newsletter" → `#newsletter`) remains unchanged. No CSS changes — `.btn-hero-primary` in `globals.css` already provides the correct steel-blue styling.

---

### 4.3 Newsletter (Rewritten)

**File:** `src/components/Newsletter.tsx`
**Type:** Client Component (changed from Server Component)
**Requirement:** Req 4

#### Overview

Complete rewrite from a Server Component with an external link to a Client Component with inline email form, state management, and API submission. The `'use client'` directive is added. The `newsletterUrl` import from siteConfig is removed.

#### Props Interface

None — Newsletter takes no props (same as before).

#### State Management

Single state variable controls all UI transitions:

```typescript
const [formState, setFormState] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
```

The error state keeps the form visible for retry. On success, the form is replaced with a confirmation message.

#### Form Submission Flow

1. Prevent default form action
2. Validate email: if the email value is empty or does not match a basic email format regex (e.g. `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`), return early without calling the API. The HTML `required` and `type="email"` attributes provide browser-native validation, but Req 4 AC 12 explicitly requires programmatic validation before the fetch call.
3. Set state to `'submitting'`
4. Extract email and honeypot from FormData
5. POST JSON to `/api/newsletter`
6. On `res.ok` → set `'success'`; otherwise → set `'error'`
7. On network error → set `'error'`

#### Component Structure

The component renders:
- Section wrapper with `id="newsletter"` and navy background (unchanged)
- Container → content wrapper (max-width 560px, unchanged)
- Heading "Stay Ahead of the Curve" (unchanged)
- Description paragraph (unchanged)
- Benefits list with checkmarks (unchanged)
- **NEW:** Inline form with honeypot, email input (`type="email"`, `required`, `aria-label="Email address for newsletter"`), and submit button (replaces external link)
- **NEW:** Success state with green checkmark SVG, heading, and subtitle
- **NEW:** Error state with inline message and `role="alert"`

#### CSS Module Changes

**File:** `src/components/Newsletter.module.css`

Existing styles retained: `.newsletter`, `.newsletterContent`, `.heading`, `.description`, `.benefits`, `.benefit`, `.checkmark`.

New styles added:

**`.newsletterForm`** — Flex container for email input + button:
- display: flex, gap: 12px, max-width: 480px, margin: 0 auto
- At ≤768px: flex-direction: column

**`.newsletterForm input`** — Bottom-border-only email input:
- flex: 1, padding: 14px 0, font-family: var(--font-body), font-size: 0.88rem
- border: none, border-bottom: 1px solid rgba(255, 255, 255, 0.25)
- background: transparent, color: var(--white), outline: none
- Placeholder: rgba(255, 255, 255, 0.4)
- Focus: border-color var(--white)

**`.btnNewsletter`** — Subscribe button (CSS Module class for the newsletter form submit button):
- padding: 14px 32px, font-family: var(--font-body), font-size: 0.82rem
- font-weight: 500, letter-spacing: 0.08em, text-transform: uppercase
- border: 1.5px solid rgba(255, 255, 255, 0.5), border-radius: 40px
- background: transparent, color: var(--white), cursor: pointer, white-space: nowrap
- Hover: background var(--white), color var(--navy), border-color var(--white)
- Disabled: cursor not-allowed, opacity 0.6

> **Note (BUG-206):** The CSS Module class `.btnNewsletter` uses padding `14px 32px`, matching the prototype's `.newsletter-form button` styling. The global `.btn-newsletter` class in `globals.css` (padding `16px 44px`) was used by the old external-link newsletter button and is no longer used by the Newsletter component after this rewrite. Implementers should use the CSS Module class `.btnNewsletter` exclusively within the rewritten Newsletter component.

**`.newsletterSuccess`** — Success confirmation:
- display: flex, flex-direction: column, align-items: center, gap: 12px
- padding: 20px 0 0, color: rgba(255, 255, 255, 0.85)
- SVG icon colour: #4ade80
- Heading: font-size 1rem, font-weight 500, color var(--white)
- Subtitle: font-size 0.9rem, color rgba(255, 255, 255, 0.85)

**`.newsletterError`** — Inline error message:
- display: flex, align-items: center, justify-content: center, gap: 8px
- margin-top: 12px, color: rgba(255, 100, 100, 0.9), font-size: 0.85rem

**`.honeypot`** — Hidden spam trap (same pattern as ContactForm):
- position: absolute, left: -9999px, height: 0, overflow: hidden

> **Note (BUG-204):** The `.newsletterError` and disabled button styles are production-only additions with no prototype equivalent. They follow the contact form's error/loading patterns.

---

### 4.4 Testimonials (New)

**File:** `src/components/Testimonials.tsx`
**Type:** Server Component
**Requirement:** Req 5

#### Overview

New component rendering 3 static testimonial cards in a responsive grid. Positioned between Newsletter and Partners in `page.tsx`. Each card is wrapped in `ScrollReveal` for fade-up animation on viewport entry.

#### Props Interface

None — all data is static and defined inline.

#### Component Structure

- Section wrapper with `id="testimonials"` and off-white background
- Container → section heading (shared `.section-heading` pattern)
- Testimonials grid (3-column → 2-column → 1-column responsive)
- Each card wrapped in `<ScrollReveal>`:
  - Decorative quote icon (`"` in steel-blue, `aria-hidden="true"`)
  - Blockquote with italic testimonial text
  - Client attribution (name in semi-bold navy, role in muted grey)

#### CSS Module

**File:** `src/components/Testimonials.module.css`

**`.testimonials`** — Section container:
- padding: 80px 0, background: var(--off-white)

**`.testimonialsGrid`** — Card grid:
- display: grid, grid-template-columns: repeat(3, 1fr), gap: 32px
- At ≤900px: repeat(2, 1fr)
- At ≤768px: 1fr

**`.testimonialCard`** — Individual card:
- background: var(--white), border-radius: 12px, padding: 36px 32px
- box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06)
- display: flex, flex-direction: column, gap: 20px

**`.quoteIcon`** — Decorative open-quote:
- font-size: 2.4rem, line-height: 1, color: #7a9bb5, font-family: Georgia, serif

**`.quote`** — Blockquote text:
- font-size: 0.95rem, line-height: 1.75, color: var(--text-body), font-style: italic
- flex: 1 (pushes client info to bottom), margin: 0

**`.client`** — Attribution container:
- display: flex, flex-direction: column, gap: 2px

**`.clientName`** — font-weight: 600, font-size: 0.9rem, color: var(--navy)

**`.clientRole`** — font-size: 0.82rem, color: var(--gray-600)

---

### 4.5 SocialFeed (Modified)

**File:** `src/components/SocialFeed.tsx`
**Type:** Server Component (unchanged)
**Requirement:** Req 6

#### Changes

Add a download button container below the `.feedGrid` div, inside the `.container`. The anchor uses URL-encoded href (`/Tracking%20Budget%202026.xlsx`) matching the actual filename with spaces. The `download` attribute triggers a file save dialog. The `.btn` class from `globals.css` provides the standard navy-outlined pill styling.

#### CSS Module Changes

**File:** `src/components/SocialFeed.module.css`

New class:

**`.feedDownload`** — Download button container:
- text-align: center, margin-top: 48px

---

### 4.6 page.tsx (Modified)

**File:** `src/app/page.tsx`
**Requirement:** Req 5

Import and render the new Testimonials component between Newsletter and Partners in the JSX return.

---

## 5. API Route: /api/newsletter

**File:** `src/app/api/newsletter/route.ts`
**Requirement:** Req 4
**Pattern:** Mirrors `src/app/api/contact/route.ts`

### Endpoint

`POST /api/newsletter`

### Request Body

```json
{ "email": "subscriber@example.com", "honeypot": "" }
```

### Processing Pipeline

1. **Parse JSON body** — Return 400 on malformed JSON
2. **Honeypot check** — If `honeypot` field is populated, return 200 silently (BUG-203 fix)
3. **Rate limiting** — Per-IP sliding window (5 requests/minute), return 429 if exceeded
4. **Validation** — Email required, non-empty after trim, basic regex format check. Return 400 on failure
5. **API key check** — Verify `RESEND_API_KEY` is configured, return 500 if missing
6. **HTML escape** — Apply `escapeHtml()` to the email before interpolating into the email template (BUG-201 fix)
7. **Send email via Resend** — Return 500 on service failure
8. **Return success** — `{ success: true }`

### Resend Email Configuration

| Field | Value |
|-------|-------|
| from | `"Keanu Le Roux Website <onboarding@resend.dev>"` |
| to | `keanu@thewealthroom.com` |
| subject | `"New Newsletter Subscription"` |
| html | Formatted email with escaped subscriber email and newsletter subscription label |

### Shared Utilities

The following utilities are duplicated from the contact route:

- **`escapeHtml(str)`** — Escapes `&`, `<`, `>`, `"`, `'` to HTML entities
- **`isRateLimited(ip)`** — In-memory sliding-window rate limiter (5 req/min/IP)
- **`EMAIL_REGEX`** — Basic email format validation

### Response Codes

| Code | Condition |
|------|-----------|
| 200 | Success (or silent honeypot rejection) |
| 400 | Missing/invalid email |
| 429 | Rate limit exceeded |
| 500 | Email service failure or missing API key |

---

## 6. File Changes Summary

### New Files

| File | Type | Description |
|------|------|-------------|
| `src/components/Testimonials.tsx` | Server Component | 3 testimonial cards with ScrollReveal |
| `src/components/Testimonials.module.css` | CSS Module | Grid, card, quote, client attribution styles |
| `src/app/api/newsletter/route.ts` | API Route | POST handler for newsletter subscriptions via Resend |
| `public/Tracking Budget 2026.xlsx` | Static Asset | Budget tracker spreadsheet (copied from `prototype/`) |

### Modified Files

| File | Changes |
|------|---------|
| `src/lib/types.ts` | Add `isCta?: boolean` to NavLink interface |
| `src/data/siteConfig.ts` | Update navLinks (6 items, CTA flag), update phone number |
| `src/components/Navbar.tsx` | Conditional CTA className logic based on `link.isCta` |
| `src/components/Navbar.module.css` | Add `.navCta`, `.navCtaBlue` with all state combinations + mobile override |
| `src/components/Hero.tsx` | Change primary CTA text, href, add target/rel attributes |
| `src/components/Newsletter.tsx` | Rewrite: Server → Client Component with form state, fetch, honeypot |
| `src/components/Newsletter.module.css` | Add form, input, button, success, error, loading, honeypot styles |
| `src/components/SocialFeed.tsx` | Add download button markup below feed grid |
| `src/components/SocialFeed.module.css` | Add `.feedDownload` container style |
| `src/app/page.tsx` | Import and render Testimonials between Newsletter and Partners |

### Prototype Files

| File | Changes |
|------|---------|
| `prototype/index.html` | (1) Update hero CTA href to Calendly URL (BUG-200); (2) remove Ashburton + Sygnia logos; (3) fix download button href from `Tracking-Budget-2026.xlsx` to `Tracking%20Budget%202026.xlsx` (BUG-209) |

### Unused After Implementation

| Export | File | Reason |
|--------|------|--------|
| `newsletterUrl` | `src/data/siteConfig.ts` | Newsletter section no longer links externally |

---

## 7. Correctness Properties

### Property 17: Testimonial card rendering completeness

For any testimonial card rendered in the Testimonials_Section, the card SHALL contain a decorative quote icon element, a blockquote element with non-empty text, a client name element with non-empty text, and a client role element with non-empty text.

**Validates:** Req 5 AC 7
**Test approach:** Render Testimonials, query all card elements, assert each contains required children with non-empty text.

### Property 18: Hero primary CTA opens external URL

For the hero primary CTA button, the element SHALL have an `href` containing "calendly.com", `target="_blank"`, and `rel` containing "noopener" and "noreferrer". The `href` SHALL NOT start with "#".

**Validates:** Req 2 AC 2, AC 3, AC 4
**Test approach:** Render Hero, query the "Book Appointment" link, assert href/target/rel attributes.

### Property 19: Newsletter form submission sends distinct email

For any successful newsletter form submission, the email sent via Resend SHALL have a subject containing "Newsletter" and SHALL NOT contain "Contact Form". The email body SHALL contain the submitted email address.

**Validates:** Req 4 AC 8, AC 9
**Test approach:** Mock Resend API, submit newsletter form, assert email configuration.

### Property 20: Nav CTA blue retains fill in scrolled state

For the `.navCta.navCtaBlue` element in the scrolled navbar state, the element SHALL have steel-blue (#7a9bb5) background and white text. It SHALL NOT switch to transparent background with navy border.

**Validates:** Req 3 AC 14
**Test approach:** Render Navbar with `alwaysScrolled={true}`, assert CTA link has both `.navCta` and `.navCtaBlue` classes.

---

## 8. Implementation Notes

### Priority Order

1. **P1 — Req 1 (Phone Number):** Single line in `siteConfig.ts`. No dependencies.
2. **P2 — Req 2 (Hero CTA):** Text/attribute changes in `Hero.tsx`. No dependencies.
3. **P3 — Req 3 (Nav CTA Blue):** `types.ts` → `siteConfig.ts` → `Navbar.tsx` + `Navbar.module.css`.
4. **P4 — Req 4 (Newsletter Form):** Create API route first, then rewrite component.
5. **P5 — Req 5 (Testimonials):** New component + CSS + `page.tsx` insertion.
6. **P6 — Req 6 (Budget Tracker):** Copy file, add download button markup + CSS.
7. **P7 — Req 7 (Partner Logos):** Prototype-only HTML edit.

### Dependency Chain

```
types.ts (NavLink.isCta) → siteConfig.ts (navLinks + phone) → Navbar.tsx/css
                                                              → Hero.tsx
Newsletter API route → Newsletter.tsx/css
Testimonials.tsx/css → page.tsx
SocialFeed.tsx/css + public/ asset
prototype/index.html (independent)
```

### Testing Strategy

- Run existing test suite after each requirement: `./node_modules/.bin/vitest --run`
- Add property tests (Properties 17–20) to `src/components/__tests__/`
- Newsletter API: mock Resend, assert request/response patterns
- Navbar CTA: CSS class assertions in existing Navbar tests
- ENH-3 (prototype-only): visual verification only

### Key Technical Decisions

1. **`isCta` boolean vs `className` string:** Boolean is simpler and more type-safe. The Navbar maps it to CSS Module classes internally, keeping styling out of the data layer.

2. **Newsletter state as single enum vs multiple booleans:** Single state variable prevents impossible combinations (e.g. submitting AND error) and simplifies conditional rendering.

3. **Testimonial data inline vs siteConfig:** Section-specific content stays in the component, following the pattern of `BENEFITS` in Newsletter and `LINKEDIN_QUOTE` in SocialFeed.

4. **Separate `/api/newsletter` route vs extending contact route:** Clean separation of concerns. Different field counts and validation rules make a shared route unnecessarily complex.

5. **`escapeHtml` duplication:** Duplicated in newsletter route (same as contact). Extract to `src/lib/escapeHtml.ts` only if a third consumer appears.
