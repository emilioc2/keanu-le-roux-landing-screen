<!-- Post-Implementation Requirements: Captures spec gaps found during Tasks 1-28 for the next spec update cycle. -->
<!-- Last Updated: 2026-04-10 — BUG-131 marked RESOLVED: Ashburton and Sygnia removed, partner count reduced from 7 to 5 matching Req 8 AC 3. -->
# Post-Implementation Requirements

> **Last Updated:** 2026-04-10 — BUG-131 marked ✅ RESOLVED (Ashburton and Sygnia removed; 5 partners now match Req 8 AC 3). Previous cycle: 15 bugs resolved: BUG-049, BUG-055, BUG-063, BUG-067, BUG-071, BUG-079, BUG-083, BUG-090, BUG-091, BUG-092, BUG-097, BUG-099, BUG-105, BUG-119, BUG-121.

## Introduction

This document captures spec changes, design gaps, content dependencies, and implementation fixes identified during the initial build (Tasks 1–28) of the Keanu Le Roux Financial Advisor website. These items were surfaced by the QA audit (`quality-assurance/bugs.csv`) and should be addressed in a follow-up spec session before the next development iteration.

The current spec documents (`requirements.md`, `design.md`, `screen-requirements.md`) remain stable for the initial deployment. This document serves as the backlog for the next spec update cycle.

---

## 1. Requirements Changes

<!-- Changes needed to .kiro/specs/keanu-financial-advisor-website/requirements.md -->

| Bug ID | Summary | Spec Change Needed |
|--------|---------|-------------------|
| BUG-044 / BUG-104 | Root layout `<main>` wraps Navbar and Footer — incorrect landmark nesting | Update Req 13 AC 1 to specify that `<main>` SHALL contain only the dominant page content; `<nav>` and `<footer>` SHALL be siblings of `<main>`, not children. Clarify the semantic HTML structure expectation. |
| BUG-091 | ✅ RESOLVED — Contact API email template does not escape user input | Add a new AC to Req 9 (or Req 18 AC 2): "THE Contact Form API route SHALL HTML-entity-escape all user-supplied input before interpolating it into the email template." |
| BUG-100 | Blog post page has no `generateMetadata` for dynamic SEO title | Add a new AC to Req 19: "THE Blog_Post_Page SHALL generate dynamic metadata (page title, description) from the blog post's title and excerpt for SEO purposes." |
| BUG-131 | ✅ RESOLVED — Req 8 AC 3 specifies 5 partner logos, now matches actual count | No spec change needed. Ashburton and Sygnia have been removed, reducing the partner list from 7 to 5 (Allan Grey, BrightRock, Discovery, Momentum, Ninety One). Req 8 AC 3's original count of 5 is now correct. |

---

## 2. Design Changes

<!-- Changes needed to .kiro/specs/keanu-financial-advisor-website/design.md -->

| Bug ID | Summary | Design Change Needed |
|--------|---------|---------------------|
| BUG-044 / BUG-104 | `<main>` wraps Navbar and Footer | Update Root Layout spec: move `<main>` wrapping from `layout.tsx` to individual page components, or restructure layout so `<nav>` and `<footer>` are siblings of `<main>`. Update the Component Tree diagram accordingly. |
| BUG-092 | ✅ RESOLVED — Rate limiter Map grows unbounded — IP keys never removed | Add a cleanup mechanism to the Contact Form API Route spec: "The rate limiter SHALL periodically purge IP entries older than the rate-limit window to prevent unbounded memory growth." |
| BUG-096 | GROQ queries do not project `published` field but TypeScript type requires it | Align GROQ query projections with the `BlogPost` type — either add `published` to the query projections or remove it from the type interface. Document the chosen approach. |
| BUG-100 / BUG-101 | Blog post and 404 pages lack `generateMetadata` | Add `generateMetadata` export specifications to the Blog Post Detail page and 404 page sections. Blog post: dynamic title/description from post fields. 404: static "Page Not Found" title. |
| BUG-121 | ✅ RESOLVED — Default placeholder post has empty `body: []` | Update the Blog component spec's placeholder/default post to include a non-empty body array so the detail page renders meaningful content when no CMS posts exist. |
| BUG-048 | Sanity client includes `token` field not in design document | Update the Sanity client config spec to document the `token: process.env.SANITY_API_TOKEN` field and clarify when it is required (e.g., authenticated queries, preview mode) vs. when `useCdn: true` suffices. |

---

## 3. Content Dependencies

<!-- Assets and URLs needed from the client (Keanu) before production deployment. -->
<!-- Not spec bugs — content placeholders that must be replaced with real assets. -->

| Bug ID | Summary | Action Needed |
|--------|---------|--------------|
| BUG-122 | Newsletter subscribe URL is placeholder `example.com` | Obtain the real external newsletter signup page URL from Keanu and update `siteConfig.ts`. |
| BUG-123 | Partner logo images do not exist | Obtain 5 partner logo image files from Keanu and place them in `public/images/partners/`. |
| BUG-124 | Services images load from external Unsplash URLs | Obtain 3 approved service landscape images from Keanu (or source royalty-free alternatives) and place them in `public/images/services/`. Remove external Unsplash dependency. |
| BUG-125 | Prototype blog images depend on external Unsplash CDN | Ensure all blog images are served from Sanity CMS (via `mainImage`) or local fallbacks. Remove external Unsplash dependency for production. |
| BUG-036 | All blog card images use the same Unsplash photo | Ensure each blog post in Sanity CMS has a distinct `mainImage`. For the default placeholder post, use a unique fallback image distinct from any CMS post images. |


---

## 4. Implementation Fixes

### CSS / Visual Fidelity (Prototype Alignment)

| Bug ID | Severity | Summary |
|--------|----------|---------|
| BUG-049 | Minor | ✅ RESOLVED — Accordion.module.css missing nested `p`/`ul`/`li` styles in `.bodyInner` |
| BUG-051 | Cosmetic | Navbar logo font-size `1.1rem`/weight `700` differ from prototype `0.95rem`/`600` |
| BUG-052 | Cosmetic | Navbar logo letter-spacing uses `px` instead of prototype `0.18em` |
| BUG-053 | Cosmetic | Nav link font-weight `500` differs from prototype `400` |
| BUG-054 | Cosmetic | Nav link letter-spacing `0.08em` differs from prototype `0.04em` |
| BUG-055 | Minor | ✅ RESOLVED — Nav links have `text-transform: uppercase` not in prototype |
| BUG-063 | Minor | ✅ RESOLVED (by BUG-049 fix) — About accordion paragraphs lack spacing due to missing `p` rules |
| BUG-067 | Minor | ✅ RESOLVED — Blog subtitle text does not match prototype |
| BUG-071 | Minor | ✅ RESOLVED — Social Feed subtitle does not match prototype |
| BUG-077 | Minor | Newsletter missing `.container` wrapper for horizontal padding |
| BUG-079 | Minor | ✅ RESOLVED — Partners subtitle text does not match prototype |
| BUG-083 | Minor | ✅ RESOLVED — Contact form subtitle does not match prototype |


### Performance

| Bug ID | Severity | Summary |
|--------|----------|---------|
| BUG-062 | Minor | About portrait uses native img instead of Next.js Image |
| BUG-065 | Minor | Services images use native img instead of Next.js Image |
| BUG-070 | Minor | Blog images use native img instead of Next.js Image |
| BUG-095 | Minor | BlogPostDetail uses native img instead of Next.js Image |
| BUG-105 | Major | ✅ RESOLVED — sanityImageUrl() defined but never used for CMS image optimisation |
| BUG-120 | Minor | No explicit preconnect links for Google Fonts in layout.tsx |


### Functionality and Code Quality

| Bug ID | Severity | Summary |
|--------|----------|---------|
| BUG-097 | Cosmetic | ✅ RESOLVED — BlogPostDetail uses anchor for internal nav instead of Next.js Link |
| BUG-099 | Minor | ✅ RESOLVED — Navbar uses anchor for internal links instead of Next.js Link on alwaysScrolled pages |
| BUG-119 | Minor | ✅ RESOLVED — Blog.tsx uses anchor for internal blog slug links instead of Next.js Link |
| BUG-094 | Cosmetic | Resend sender uses default onboarding address, should use verified custom domain |


---

## 5. Test Quality Improvements

### Missing Test Coverage

| Bug ID | Severity | Summary |
|--------|----------|---------|
| BUG-061 | Minor | No unit or property tests for About component |
| BUG-066 | Minor | No unit or property tests for Services component |
| BUG-078 | Minor | No unit test for Newsletter component |
| BUG-082 | Minor | No unit or property tests for Partners component |
| BUG-088 | Minor | No unit or property tests for Footer component |
| BUG-093 | Minor | No tests for api contact route (5 response paths) |
| BUG-098 | Minor | No tests for custom 404 page |


### Test Correctness Issues

| Bug ID | Severity | Summary |
|--------|----------|---------|
| BUG-050 | Minor | Property tests use numRuns 50 instead of design minimum 100 |
| BUG-106 | Minor | Property 16 allows duplicate slugs causing false results |
| BUG-107 | Minor | Property 10 uses minRatio 2.5 for grey-400 on white below WCAG AA |
| BUG-108 | Minor | Property 6 generates random strings but never uses them |
| BUG-109 | Minor | Property 12 only checks Blog not all page scripts |
| BUG-110 | Minor | Property 13 only checks Blog not all below-fold images |
| BUG-102 | Minor | Property 7 only covers Blog not all pages |
| BUG-103 | Minor | No test case for Req 13 AC 6 colour contrast validation |
| BUG-116 | Minor | BlogPostDetail test does not test Navbar alwaysScrolled |
| BUG-117 | Minor | Responsive test does not test About 900px breakpoint |


### Test Metadata Errors

| Bug ID | Severity | Summary |
|--------|----------|---------|
| BUG-111 | Minor | Navbar unit test incorrectly references BUG-060 |
| BUG-112 | Minor | Hero unit test incorrectly references BUG-061 should be BUG-060 |
| BUG-113 | Minor | Blog unit test incorrectly references BUG-066 |
| BUG-114 | Minor | ContactForm unit test incorrectly references BUG-078 should be BUG-085 |
| BUG-115 | Minor | BlogPostDetail unit test incorrectly references BUG-082 |


---

## 6. Remaining Low-Priority Items

Cosmetic and prototype-only issues addressable opportunistically.

| Bug ID | Severity | Summary |
|--------|----------|---------|
| BUG-009 | Cosmetic | Unused newsletter-form CSS in prototype |
| BUG-012 | Cosmetic | Submit button missing text-transform uppercase |
| BUG-032 | Cosmetic | Unused service-tags CSS in prototype |
| BUG-038 | Minor | Blog post page has no scroll reveal animations |
| BUG-043 | Minor | No Vitest coverage provider installed |
| BUG-056 | Cosmetic | Navbar scrolled box-shadow differs from prototype |
| BUG-057 | Cosmetic | Hamburger toggle gap and line width differ |
| BUG-058 | Cosmetic | Mobile dropdown padding differs from prototype |
| BUG-059 | Cosmetic | Hero heading missing 900px intermediate breakpoint |
| BUG-064 | Cosmetic | Services heading margin-bottom differs from prototype |
| BUG-068 | Cosmetic | Blog grid uses fixed repeat instead of auto-fit minmax |
| BUG-069 | Cosmetic | Blog card has border-radius not in prototype |
| BUG-072 | Cosmetic | YouTube play button SVG smaller than prototype |
| BUG-073 | Cosmetic | Instagram gradient colours differ from prototype |
| BUG-074 | Cosmetic | YouTube preview uses min-height instead of fixed height |
| BUG-075 | Cosmetic | Instagram preview uses min-height instead of fixed height |
| BUG-076 | Minor | Task 13 description says 7 tests but actual count is 8 |
| BUG-080 | Cosmetic | Partner logo hover opacity differs from prototype |
| BUG-081 | Cosmetic | Partner logo has border-radius not in prototype |
| BUG-084 | Cosmetic | Success checkmark has extra margin-bottom |
| BUG-086 | Cosmetic | Footer logo font-size differs from prototype |
| BUG-087 | Cosmetic | Copyright uses sentence case instead of title case |
| BUG-090 | Cosmetic | ✅ RESOLVED — Orphaned page.module.css from create-next-app |
| BUG-027 | Minor | Prototype script.js without defer/async (prototype-only) |
| BUG-028 | Minor | No lazy loading in prototype (prototype-only) |
| BUG-034 | Minor | Blog post images lack lazy loading in prototype |
