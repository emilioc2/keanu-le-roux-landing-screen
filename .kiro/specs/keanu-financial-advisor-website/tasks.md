# Implementation Plan: Keanu Le Roux Financial Advisor Website

## Overview

This plan implements the Keanu Le Roux Financial Advisor website — a responsive Next.js (App Router) landing page with Sanity CMS blog integration, Resend email delivery for the contact form, and CSS Modules styling. Tasks are split between two roles: **[Config]** (Configuration Engineer) for project setup and config files, and **[Dev]** (Developer) for all application code. Each task builds incrementally on previous work, with checkpoints to validate progress.

## Tasks

- [x] 1. [Config] Project scaffolding and configuration
  - [x] 1.1 [Config] Initialise Next.js project with TypeScript
    - Run `npx create-next-app@latest` with App Router and TypeScript options
    - Verify `package.json`, `tsconfig.json`, and `next.config.ts` are created
    - _Requirements: 11.5, 14.4_

  - [x] 1.2 [Config] Install project dependencies
    - Install production deps: `@sanity/client`, `@sanity/image-url`, `@portabletext/react`, `resend`
    - Install dev deps: `vitest`, `@testing-library/react`, `@testing-library/jest-dom`, `fast-check`, `jsdom`
    - Update `package.json` with a `"test"` script for Vitest
    - _Requirements: 15.1, 9.8_

  - [x] 1.3 [Config] Configure environment variables
    - Create `.env.local` with `SANITY_PROJECT_ID`, `SANITY_DATASET`, `SANITY_API_TOKEN`, `RESEND_API_KEY`
    - Create `.env.example` documenting required variables (without real values)
    - _Requirements: 15.1, 9.8_

  - [x] 1.4 [Config] Configure Next.js settings
    - Set up `next.config.ts` with Sanity image domain allowlist (`images.remotePatterns` for `cdn.sanity.io`)
    - _Requirements: 5.7, 14.1_

  - [x] 1.5 [Config] Configure Sanity CMS
    - Create `sanity.config.ts` and `sanity.cli.ts` with project ID, dataset, and schema import
    - _Requirements: 15.1_

  - [x] 1.6 [Config] Configure ESLint and Prettier
    - Set up ESLint config (Next.js defaults) and Prettier config for consistent formatting
    - _Requirements: N/A (developer tooling)_

  - [x] 1.7 [Config] Configure Vitest
    - Create `vitest.config.ts` with jsdom environment, path aliases matching `tsconfig.json`, and setup file
    - _Requirements: N/A (testing infrastructure)_

- [x] 2. [Config] Static assets and Git configuration
  - [x] 2.1 [Config] Set up public assets directory structure
    - Create `public/images/services/` and `public/images/partners/` directories
    - Copy `prototype/favicon.svg`, `prototype/hero_video.mp4`, and `prototype/keanu.jpg` to `public/`
    - Add a `public/hero-fallback.jpg` placeholder (for hero video fallback — BUG-029)
    - _Requirements: 2.2, 2.5, 13.9, 14.3_

  - [x] 2.2 [Config] Update .gitignore
    - Ensure `.env.local`, `node_modules/`, `.next/`, and Sanity build artifacts are ignored
    - _Requirements: N/A (project hygiene)_

- [x] 3. Checkpoint — Verify project scaffolding
  - Ensure the project compiles with `npx tsc --noEmit`, all dependencies are installed, and the dev server starts. Ask the user if questions arise.

- [x] 4. [Dev] Design tokens, global styles, and shared types
  - [x] 4.1 [Dev] Create globals.css with design tokens and reset styles
    - Define all CSS custom properties on `:root` (colours, fonts, max-width, transition) per the design document
    - Add CSS reset/normalize rules and shared utility classes (`.container`, `.btn`, `.section-heading`)
    - Set `font-display: swap` behaviour for Google Fonts
    - _Requirements: 11.5, 11.6, 11.7, 14.2_

  - [x] 4.2 [Dev] Create shared TypeScript types
    - Create `src/lib/types.ts` with `BlogPost`, `ServiceItem`, `SocialLink`, `NavLink`, `PartnerLogo`, `ContactFormData` interfaces
    - _Requirements: 5.7, 6.3, 9.2, 15.2_

  - [x] 4.3 [Dev] Create root layout
    - Create `src/app/layout.tsx` as a Server Component
    - Load Google Fonts (Playfair Display + Inter) with `font-display: swap`
    - Include favicon metadata, `<html lang="en">`, and `<main>` landmark wrapper (BUG-007/033)
    - Import `globals.css`
    - _Requirements: 13.1, 14.2, 14.4_

- [x] 5. [Dev] Static data files
  - [x] 5.1 [Dev] Create services data file
    - Create `src/data/services.ts` with 7 service items (title + description) matching the prototype content
    - _Requirements: 4.3, 4.6_

  - [x] 5.2 [Dev] Create social links data file
    - Create `src/data/socialLinks.ts` with YouTube, LinkedIn, Instagram entries (platform, url, title, description, ctaText)
    - _Requirements: 6.3, 6.4, 6.5, 6.6_

  - [x] 5.3 [Dev] Create site config data file
    - Create `src/data/siteConfig.ts` with nav links, contact info (email, phone), partner logo data, external newsletter URL, and social profile URLs for the footer
    - _Requirements: 1.4, 7.6, 8.3, 10.2_

- [x] 6. [Dev] Sanity CMS schema and client
  - [x] 6.1 [Dev] Create blog post schema
    - Create `sanity/schemas/blogPost.ts` with fields: title, slug, publishedAt, excerpt, mainImage (with alt), body (Portable Text with H2, bullet lists, bold, italic, inline images), published boolean
    - Include validation rules (required fields, max excerpt length), orderings, and preview config
    - _Requirements: 15.2, 15.4, 5.7_

  - [x] 6.2 [Dev] Create Sanity client and GROQ queries
    - Create `src/lib/sanity.ts` with Sanity client configuration using environment variables
    - Implement `allPublishedPostsQuery` (all published posts, newest first, for landing page)
    - Implement `postBySlugQuery` (single post by slug for detail page)
    - Implement `allPostSlugsQuery` (all slugs for `generateStaticParams`)
    - _Requirements: 5.8, 15.5, 19.12_

- [x] 7. [Dev] Reusable components
  - [x] 7.1 [Dev] Implement Accordion component
    - Create `src/components/Accordion.tsx` (Client Component) and `Accordion.module.css`
    - Accept `items` array and `defaultOpenIndex` prop; enforce single-item-open mutual exclusion
    - Animate "+" icon rotation (45°) and content panel with `max-height` transition (0.4s ease)
    - Add `aria-expanded` on header buttons reflecting state; add `:focus-visible` outlines (BUG-008)
    - _Requirements: 3.6, 3.7, 4.5, 12.3, 13.4_

  - [x] 7.2 [Dev] Write property test — Accordion mutual exclusion
    - **Property 1: Accordion mutual exclusion**
    - Generate random click sequences on N accordion items; after each click, verify exactly one item is expanded and N-1 are collapsed
    - **Validates: Requirements 3.6, 4.5**

  - [x] 7.3 [Dev] Write property test — Accordion aria-expanded reflects state
    - **Property 9: Accordion aria-expanded reflects state**
    - After random click sequences, verify `aria-expanded="true"` on the open item and `"false"` on all others
    - **Validates: Requirements 13.4**

  - [x] 7.4 [Dev] Implement ScrollReveal component
    - Create `src/components/ScrollReveal.tsx` (Client Component)
    - Use `IntersectionObserver` with `threshold: 0.1` and `rootMargin: '0px 0px -40px 0px'`
    - Apply `opacity: 0 → 1` and `translateY(20px) → 0` with 0.6s ease transition
    - Fix BUG-001 (correct element targeting)
    - _Requirements: 12.1_

- [x] 8. [Dev] Navbar component
  - [x] 8.1 [Dev] Implement Navbar
    - Create `src/components/Navbar.tsx` (Client Component) and `Navbar.module.css`
    - Accept `alwaysScrolled` prop for blog post page (Req 19 AC 2)
    - Implement scroll listener: transparent state ≤50px, white background with box shadow >50px, 0.3s ease transition
    - Nav link text over hero uses full white (#ffffff), not semi-transparent (BUG-018)
    - Mobile hamburger toggle with `aria-label="Toggle navigation menu"` (BUG-050); dropdown auto-closes on link click
    - Landing page links: `<a href="#section">`; blog page links: `<a href="/#section">`
    - Add `:focus-visible` outlines on all interactive elements (BUG-008/019)
    - _Requirements: 1.1–1.8, 11.4, 12.4, 13.3_

  - [x] 8.2 [Dev] Write property test — Navbar scroll state transition
    - **Property 19: Navbar scroll state transition**
    - Generate random scroll positions; verify white background + navy text when >50px, transparent + white text when ≤50px
    - **Validates: Requirements 1.2, 1.3, 12.4**

- [x] 9. [Dev] Hero component
  - [x] 9.1 [Dev] Implement Hero section
    - Create `src/components/Hero.tsx` (Client Component) and `Hero.module.css`
    - `<video autoPlay muted loop playsInline>` with `poster="/hero-fallback.jpg"` and `aria-label` (BUG-029/035/041)
    - Navy overlay `rgba(20, 28, 66, 0.55)`, fallback background `var(--navy-dark)`
    - Heading "Your Wealth, Your Legacy." (Playfair Display italic, 3.8rem desktop / 2rem mobile)
    - Subtitle paragraph (opacity 0.75, max-width 540px)
    - Two CTAs: "Get In Touch" → `#contact` (solid steel blue), "Subscribe to Newsletter" → `#newsletter` (white outlined)
    - Stack CTAs vertically on mobile (≤768px)
    - Section `id="hero"`, full viewport height (100vh)
    - _Requirements: 2.1–2.12, 13.8, 13.9, 14.3_

- [x] 10. [Dev] About component
  - [x] 10.1 [Dev] Implement About section
    - Create `src/components/About.tsx` (Client Component) and `About.module.css`
    - Two-column layout: 320px portrait left, text column right, 60px gap, vertically centred
    - Heading "Financial Guidance You Can Trust." (Playfair Display, 2.4rem)
    - Two bio paragraphs matching prototype content
    - Accordion with 3 items: "My approach" (default open), "Qualifications & experience", "Why work with me"
    - Centred "Get Started" pill button → `#contact`
    - Tablet/mobile (≤900px): portrait stacks above text, centred at max 320px
    - Section `id="about"`, white background, 100px vertical padding
    - _Requirements: 3.1–3.9_

- [x] 11. [Dev] Services component
  - [x] 11.1 [Dev] Implement Services section
    - Create `src/components/Services.tsx` (Client Component) and `Services.module.css`
    - Centred heading "What I Offer" (Playfair Display, 3rem) + subtitle
    - Three-column image row (180px tall, object-fit cover); single column on tablet/mobile
    - Accordion with 7 service items from `src/data/services.ts`; "Integrated Wealth Planning" default open
    - Section `id="services"`, white background, 100px vertical padding
    - _Requirements: 4.1–4.6_

- [x] 12. [Dev] Blog section (landing page)
  - [x] 12.1 [Dev] Implement Blog section
    - Create `src/components/Blog.tsx` (Server Component) and `Blog.module.css`
    - Accept `posts: BlogPost[]` prop from `page.tsx`
    - Featured article: two-column layout (image left 340px tall, content right with date/title/excerpt/"Read Full Article →" link)
    - Remaining posts in 2-column card grid; each card: image (200px tall), date, title, excerpt, "Read More →" link
    - Cards wrapped in `<ScrollReveal>` for fade-in animation
    - Cards link to `/blog/[slug]`; lift 3px on hover with box shadow
    - If no posts, display placeholder/default post
    - If a post has no mainImage, display a default placeholder image
    - Section `id="blog"`, off-white background, 100px vertical padding
    - _Requirements: 5.1–5.9, 12.1, 12.2_

  - [x] 12.2 [Dev] Write property test — Blog card rendering completeness
    - **Property 2: Blog card rendering completeness**
    - Generate random blog post data; render card; verify image, date, title, excerpt, and "Read More" link are all present
    - **Validates: Requirements 5.5**

  - [x] 12.3 [Dev] Write property test — Most recent published post is featured
    - **Property 3: Most recent published post is featured**
    - Generate N posts with random `publishedAt` dates; verify the featured article is the most recent
    - **Validates: Requirements 5.8, 15.5**

- [x] 13. [Dev] Social Feed component
  - [x] 13.1 [Dev] Implement SocialFeed section
    - Create `src/components/SocialFeed.tsx` (Server Component) and `SocialFeed.module.css`
    - Three-column grid of clickable feed cards (single column on mobile)
    - Each card is a full `<a>` with `target="_blank"` and `rel="noopener noreferrer"`
    - Badge row: platform icon + name + external link icon
    - YouTube: grey preview with play button overlay; LinkedIn: italic serif quote on grey; Instagram: gradient preview (gold→pink→purple via `rgba()` background, NOT element opacity — BUG-010)
    - Cards wrapped in `<ScrollReveal>`; lift 3px on hover with shadow
    - Section on white background, 100px vertical padding
    - _Requirements: 6.1–6.9, 12.1, 12.2_

  - [x] 13.2 [Dev] Write property test — Feed card external link safety
    - **Property 4: Feed card external link safety and structure**
    - For each social feed card, verify `target="_blank"`, `rel="noopener noreferrer"`, badge row with icon, name, and external link icon
    - **Validates: Requirements 6.7, 6.9**

- [x] 14. [Dev] Newsletter component
  - [x] 14.1 [Dev] Implement Newsletter section
    - Create `src/components/Newsletter.tsx` (Server Component) and `Newsletter.module.css`
    - Navy (#1a2456) background, 80px vertical padding, centred content (max 560px)
    - Heading "Stay Ahead of the Curve" (italic serif, white)
    - Description paragraph (light white, opacity 0.7)
    - Three benefit items with checkmark (✓) prefixes in flex-wrap layout
    - "Subscribe" pill button as `<a>` with `target="_blank"`, `rel="noopener noreferrer"`, external newsletter URL
    - No email input field — direct external link only
    - Section `id="newsletter"`
    - _Requirements: 7.1–7.7_

  - [x] 14.2 [Dev] Write property test — Newsletter subscribe button opens in new tab
    - **Property 18: Newsletter subscribe button opens in new tab**
    - Verify the Subscribe element is an `<a>` with `target="_blank"`, `rel="noopener noreferrer"`, and non-empty external `href`
    - **Validates: Requirements 7.6**

- [x] 15. [Dev] Partners component
  - [x] 15.1 [Dev] Implement Partners section
    - Create `src/components/Partners.tsx` (Server Component) and `Partners.module.css`
    - White background, 80px vertical padding, 1px solid grey top border
    - Centred heading "Trusted Partners" + subtitle
    - Flex row of 5 partner logo images (160×70px), flex-wrap, 48px gap desktop / 24px gap mobile (BUG-046)
    - Logos reduce opacity on hover
    - Static images from `public/images/partners/`
    - _Requirements: 8.1–8.6_

- [x] 16. [Dev] Contact Form component
  - [x] 16.1 [Dev] Implement ContactForm section
    - Create `src/components/ContactForm.tsx` (Client Component) and `ContactForm.module.css`
    - Fields: firstName (required), lastName (required), email (required), phone (optional), message (required textarea, min-height 100px)
    - Bottom-border-only input styling; firstName + lastName side by side on desktop (40px gap), stacked on mobile
    - Full-width "Send Message" pill button
    - Privacy note below button
    - Hidden honeypot field for spam protection (BUG-025/039)
    - Native HTML5 validation via `required` attribute
    - On successful submit to `/api/contact`: hide form, show success confirmation (green checkmark #4ade80, heading, message)
    - On server error: display inline error message below submit button; form remains visible for retry
    - Section `id="contact"`, off-white background, 100px vertical padding
    - _Requirements: 9.1–9.8, 13.7, 18.2_

  - [x] 16.2 [Dev] Write property test — Contact form validation rejects incomplete submissions
    - **Property 5: Contact form validation rejects incomplete submissions**
    - Generate form data with random empty required fields; verify form prevents submission and no success message is shown
    - **Validates: Requirements 9.7**

  - [x] 16.3 [Dev] Write property test — Form inputs have associated labels
    - **Property 11: Form inputs have associated labels**
    - Render the contact form; verify every `<input>` and `<textarea>` has a `<label>` with matching `for`/`id`
    - **Validates: Requirements 13.7**

- [x] 17. [Dev] Footer component
  - [x] 17.1 [Dev] Implement Footer
    - Create `src/components/Footer.tsx` (Server Component) and `Footer.module.css`
    - White background, 1px solid grey top border, 60px top padding
    - Centred: "KEANU LE ROUX" logo text, "Financial Advisor" tagline (italic serif, grey)
    - Social icon row (YouTube, Instagram, LinkedIn) — navy, accent blue on hover; each `<a>` with `target="_blank"`, `rel="noopener noreferrer"`, `aria-label`
    - Email `mailto:` link (italic serif, underline with 4px offset)
    - Details block (0.8rem grey): phone, authorisation statement, copyright
    - _Requirements: 10.1–10.5, 13.3_

- [x] 18. Checkpoint — Verify all section components render
  - Ensure all section components compile without errors. Compose them temporarily in `page.tsx` to verify visual output. Ask the user if questions arise.

- [x] 19. [Dev] Landing page composition
  - [x] 19.1 [Dev] Compose landing page
    - Create `src/app/page.tsx` as a Server Component
    - Fetch blog posts from Sanity using `allPublishedPostsQuery`
    - Compose all section components in order: Navbar, Hero, About, Services, Blog (passing posts), SocialFeed, Newsletter, Partners, ContactForm, Footer
    - Set ISR revalidation: `export const revalidate = 60`
    - _Requirements: 5.8, 15.5_

- [x] 20. [Dev] Contact form API route
  - [x] 20.1 [Dev] Implement contact form API route
    - Create `src/app/api/contact/route.ts` with POST handler
    - Honeypot check: if honeypot field is filled, return 200 silently (BUG-025)
    - Server-side validation: all required fields present and non-empty, email format check
    - Rate limiting: basic per-IP in-memory rate limiter, return 429 on excess
    - Send email via Resend API using `RESEND_API_KEY` (BUG-006/051)
    - Return 200 on success, 400 on validation failure, 500 on email service failure
    - _Requirements: 9.8, 18.2_

- [x] 21. [Dev] Blog post detail page
  - [x] 21.1 [Dev] Implement BlogPostDetail component
    - Create `src/components/BlogPostDetail.tsx` (Server Component) and `BlogPostDetail.module.css`
    - Render: "← Back to Insights" link → `/#blog`, date label, `<h1>` title, excerpt as lead text, full-width image (with alt), Portable Text body (paragraphs, `<h2>`, `<ul>`), CTA block ("Get In Touch" pill button → `/#contact`), author bio (circular portrait, name, title)
    - _Requirements: 19.3–19.9_

  - [x] 21.2 [Dev] Implement blog post detail page route
    - Create `src/app/blog/[slug]/page.tsx` as a Server Component
    - Fetch post by slug using `postBySlugQuery`; call `notFound()` if post not found
    - Implement `generateStaticParams` using `allPostSlugsQuery`
    - Set ISR revalidation: `export const revalidate = 60`
    - Compose: Navbar (alwaysScrolled), BlogPostDetail, Footer
    - _Requirements: 19.1, 19.2, 19.9, 19.11, 19.12_

  - [x] 21.3 [Dev] Write property test — Blog post detail page renders all CMS fields
    - **Property 17: Blog post detail page renders all CMS fields**
    - Generate random blog post data; render detail page; verify `<h1>` title, date, excerpt, image (if present), and body content are all rendered
    - **Validates: Requirements 19.4, 19.12**

- [x] 22. [Dev] Custom 404 page
  - [x] 22.1 [Dev] Implement 404 page
    - Create `src/app/not-found.tsx`
    - Navbar in scrolled state (`alwaysScrolled`), centred content: "Page Not Found" heading (Playfair Display), message paragraph, "Back to Home" pill button → `/`, Footer
    - Follows same responsive breakpoints as the rest of the site
    - _Requirements: BUG-045_

- [x] 23. Checkpoint — Verify page routes and navigation
  - Ensure landing page renders all sections with CMS data (or placeholder), blog post detail page loads correctly, 404 page displays for invalid routes, and all anchor navigation works. Ask the user if questions arise.

- [x] 24. [Dev] Accessibility fixes and enhancements
  - [x] 24.1 [Dev] Implement accessibility requirements
    - Verify semantic HTML elements across all components (nav, main, section, article, footer, button, form)
    - Ensure all `<img>` elements have descriptive `alt` attributes
    - Ensure all icon-only interactive elements have `aria-label` attributes (social icons, hamburger toggle, external link icons)
    - Ensure all interactive elements have `:focus-visible` outlines (BUG-008/019)
    - Ensure keyboard navigation works for all interactive elements (accordion headers, nav links, buttons, form fields)
    - Verify colour contrast ratios meet WCAG AA minimums
    - _Requirements: 13.1–13.9_

  - [x] 24.2 [Dev] Write property test — All images have alt attributes
    - **Property 7: All images have alt attributes**
    - Render pages with random blog data; verify every `<img>` element has a non-empty `alt` attribute
    - **Validates: Requirements 13.2**

  - [x] 24.3 [Dev] Write property test — Icon-only interactive elements have aria-label
    - **Property 8: Icon-only interactive elements have aria-label**
    - Query all interactive elements containing only SVG icons; verify each has a non-empty `aria-label`
    - **Validates: Requirements 13.3**

- [x] 25. [Dev] Performance optimizations
  - [x] 25.1 [Dev] Implement performance requirements
    - Add `<link rel="preconnect">` for Google Fonts origins in root layout
    - Ensure `loading="lazy"` on all below-fold images (not in Hero or Navbar)
    - Verify all external scripts use `defer` or `async` (Next.js handles this by default)
    - Verify hero fallback background colour renders immediately
    - Use Sanity image URL builder with width/quality parameters for optimized delivery
    - _Requirements: 14.1–14.5_

  - [x] 25.2 [Dev] Write property test — Below-fold images use lazy loading
    - **Property 13: Below-fold images use lazy loading**
    - Render page; verify all `<img>` elements outside the Hero section have `loading="lazy"`
    - **Validates: Requirements 14.5**

  - [x] 25.3 [Dev] Write property test — Scripts use non-blocking loading
    - **Property 12: Scripts use non-blocking loading**
    - Render page; verify all external `<script>` tags have `defer` or `async`
    - **Validates: Requirements 14.4**

- [x] 26. [Dev] Remaining property-based tests
  - [x] 26.1 [Dev] Write property test — Pill-shaped button styling
    - **Property 6: Pill-shaped button styling**
    - Query all general button elements; verify `border-radius: 40px` and navy border in default state
    - **Validates: Requirements 11.7**

  - [x] 26.2 [Dev] Write property test — Color contrast meets readable standards
    - **Property 10: Color contrast meets readable standards**
    - Extract text/background colour pairs from rendered elements; compute contrast ratios; verify WCAG AA minimums (4.5:1 normal, 3:1 large text)
    - **Validates: Requirements 13.6**

  - [x] 26.3 [Dev] Write property test — Blog post data contains all required fields
    - **Property 14: Blog post data contains all required fields**
    - Generate random blog post documents; validate all required fields (title, slug, publishedAt, excerpt, body) are non-null; verify mainImage has alt when present
    - **Validates: Requirements 5.7, 15.2**

  - [x] 26.4 [Dev] Write property test — Blog post edit round-trip
    - **Property 15: Blog post edit round-trip**
    - Edit a random field (title, excerpt, body) and re-fetch by slug; verify the updated value is returned
    - **Validates: Requirements 15.3**

  - [x] 26.5 [Dev] Write property test — Publish/unpublish toggle affects query visibility
    - **Property 16: Publish/unpublish toggle affects query visibility**
    - Toggle `published` boolean; query published posts; verify inclusion/exclusion matches the toggle state
    - **Validates: Requirements 15.4**

- [x] 27. [Dev] Unit and integration tests
  - [x] 27.1 [Dev] Write unit tests for Navbar
    - Test scroll threshold state change (0px vs 51px), mobile toggle open/close, link click closes dropdown, `alwaysScrolled` prop
    - _Requirements: 1.1–1.8_

  - [x] 27.2 [Dev] Write unit tests for Hero
    - Test video element attributes (autoplay, muted, loop, playsInline), poster fallback, CTA href values, aria-label on video
    - _Requirements: 2.1–2.12_

  - [x] 27.3 [Dev] Write unit tests for Blog section
    - Test placeholder rendering when no posts, featured post is most recent, card hover class, link hrefs
    - _Requirements: 5.1–5.9_

  - [x] 27.4 [Dev] Write unit tests for ContactForm
    - Test success state display after submit, honeypot rejection, error state on server failure, privacy note text, label-input association
    - _Requirements: 9.1–9.8_

  - [x] 27.5 [Dev] Write unit tests for BlogPostDetail
    - Test Navbar always scrolled, back link href, author bio content, CTA button href, Portable Text rendering
    - _Requirements: 19.1–19.12_

  - [x] 27.6 [Dev] Write unit tests for responsive behaviour
    - Test hamburger visibility at 768px, grid column count at 900px breakpoint
    - _Requirements: 11.1–11.4_

- [x] 28. Final checkpoint — Ensure all tests pass
  - Run `npx vitest --run` and ensure all tests pass. Verify the site builds successfully with `npm run build`. Ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP delivery.
- **[Config]** tasks are owned by the Configuration Engineer — they only touch config files, not application code.
- **[Dev]** tasks are owned by the Developer — they write all application code, styles, data files, schemas, and tests.
- Each task references specific requirements for traceability.
- Checkpoints ensure incremental validation at key milestones.
- Property tests validate the 19 correctness properties defined in the design document.
- The prototype in `prototype/` is the visual source of truth — match it exactly unless requirements or design specify otherwise.
