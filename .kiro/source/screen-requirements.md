# Screen Requirements — Keanu Le Roux Financial Advisor Website

Reference prototype: #[[file:prototype/index.html]] and #[[file:prototype/styles.css]]

---

## Global Requirements

### Design System
- Typography: Playfair Display (headings, italic accents) + Inter (body, UI elements)
- Primary colour: Navy (#1a2456)
- Secondary colour: Steel blue (#7a9bb5) — used for primary hero CTA
- Accent colour: Muted blue (#5a70a0) — used for hover states
- Backgrounds: White (#ffffff) and off-white (#f9f9f9) alternating sections
- All general buttons use pill-shaped (border-radius: 40px) outlined style with navy border; fill navy on hover
- Form inputs use bottom-border-only styling (no box borders)
- Max content width: 1100px, centred
- Accordion pattern used for expandable content (about, services) — only one item open at a time per group
- Favicon: SVG with "KL" initials on navy rounded square background

### Responsive Behaviour
- Desktop: Full multi-column layouts
- Tablet (≤900px): Collapse grids to single column, portrait image centred at max 320px
- Mobile (≤768px): Hamburger menu, stacked CTAs, single-column forms, stacked newsletter input/button

### Navigation Bar
- Fixed to top of viewport
- Transparent background over hero; white background with subtle shadow on scroll (>50px)
- Left: "KEANU LE ROUX" logo text (uppercase, letter-spaced, Inter font)
- Right: Navigation links — Home, About, Services, Insights, Contact
- Nav link text is white over hero, switches to navy when scrolled
- Nav link text over the hero section SHALL use full white (#ffffff or rgba(255,255,255,1)), not semi-transparent white (BUG-018: prototype incorrectly used rgba(255,255,255,0.85))
- Mobile: Hamburger toggle (3 lines) replaces nav links; opens full-width dropdown with white background
- All nav links smooth-scroll to corresponding section anchors
- Mobile dropdown auto-closes when a link is clicked

---

## Section 1: Hero

- Full viewport height (100vh), centred content
- Background: Looping MP4 video (hero_video.mp4), autoplaying, muted, with `playsinline` attribute
  - Video is absolutely positioned, covers full section via `object-fit: cover`
  - Navy overlay on top of video: `rgba(20, 28, 66, 0.55)`
  - Fallback background colour: navy-dark (#111b42) while video loads
- Heading: Large italic serif — "Your Wealth, Your Legacy." (Playfair Display, 3.8rem desktop, 2rem mobile)
- Subtitle: Single paragraph beneath heading, light white text (opacity 0.75), max-width 540px
- Two call-to-action buttons side by side (stack vertically on mobile):
  - Primary: "Get In Touch" — solid steel blue (#7a9bb5) fill, white text, pill shape. Links to #contact. Hover darkens to #6889a3
  - Secondary: "Subscribe to Newsletter" — white outlined, transparent fill, white text, pill shape. Links to #newsletter. Hover fills white with navy text

---

## Section 2: About

- White background, 100px vertical padding
- Top area: Two-column grid (320px portrait + flexible text column, 60px gap, vertically centred)
  - Left column: Professional headshot of Keanu (keanu.jpg), border-radius 4px, full width of column
  - Right column:
    - Heading: "Financial Guidance You Can Trust." (Playfair Display, 2.4rem)
    - Two paragraphs: Professional summary covering background, qualifications, philosophy. Messaging focused on trust, transparency, personal connection
- Below portrait row: Accordion with three expandable items (only one open at a time):
  - "My approach" (open by default)
  - "Qualifications & experience"
  - "Why work with me"
- Each accordion item: Header row with label + "+" icon; icon rotates 45° when active; body reveals paragraph content with smooth max-height transition
- Centred "Get Started" pill button below accordion, links to #contact
- Tablet/mobile: Portrait stacks above text, centred at max 320px width

---

## Section 3: Services

- White background, 100px vertical padding
- Centred heading: "What I Offer" (Playfair Display, 3rem) + subtitle paragraph
- Three-column image row (single column on tablet/mobile):
  - Three landscape images (180px tall, object-fit cover, 16px gap)
  - Images represent financial/business/architectural themes
- Accordion below images with seven expandable service items (one open at a time):
  - Integrated Wealth Planning (open by default)
  - Risk Protection
  - Healthcare Planning
  - Investments & Savings
  - Retirement Planning
  - Business Planning
  - Estate Planning
- Each item expands to show a descriptive paragraph in client-friendly language

---

## Section 4: Blog / Insights

- Off-white (#f9f9f9) background, 100px vertical padding
- Centred heading: "Latest Insights" + subtitle
- Featured article: Two-column layout (stacks on tablet/mobile)
  - Left: Featured image placeholder (340px tall, grey background)
  - Right: Date label (uppercase, small, grey), article title (Playfair Display, 1.8rem), excerpt paragraph, "Read Full Article →" link
- Below featured: Two-column grid of blog cards (single column on mobile)
  - Each card: Image placeholder (200px tall), padded content area with date, title, excerpt, "Read More →" link
  - Cards lift 3px on hover with subtle shadow
- Content must be structured for easy future updates (clear date, title, excerpt, image pattern)

---

## Section 5: Social Media Content Feed

- White background, 100px vertical padding
- Centred heading: "Latest Content" + subtitle
- Three-column grid of clickable feed cards (single column on mobile):
  - Each card is a full `<a>` element linking to the relevant platform (opens in new tab with `rel="noopener noreferrer"`)
  - YouTube card:
    - Badge row: YouTube icon (red #ff0000) + "YouTube" label + external link icon (right-aligned, grey → navy on hover)
    - Preview area: Grey placeholder with centred play button overlay (dark semi-transparent circle)
    - Info: Title + description + "Watch on YouTube →" CTA text
  - LinkedIn card:
    - Badge row: LinkedIn icon (blue #0077b5) + "LinkedIn" label + external link icon
    - Text preview area: Italic serif quote on grey background (min-height 200px)
    - Info: Title + description + "Read on LinkedIn →" CTA text
  - Instagram card:
    - Badge row: Instagram icon (pink #e4405f) + "Instagram" label + external link icon
    - Preview area: Instagram gradient placeholder (gold → pink → purple, 20% opacity)
    - Info: Title + description + "View on Instagram →" CTA text
- Cards lift 3px on hover with shadow; external icon and CTA text change colour on hover

---

## Section 6: Newsletter Subscribe CTA

- Navy (#1a2456) background, 80px vertical padding, full width
- Centred content (max 560px):
  - Heading: Italic serif — "Stay Ahead of the Curve" (white)
  - Description paragraph explaining subscriber value (light white text, opacity 0.7)
  - Benefits list: Three inline items with checkmark prefix, flex-wrap
    - "Practical wealth-building strategies"
    - "Market updates and economic insights"
    - "Tips for smarter financial decisions"
  - "Subscribe" pill button (white outlined) — links to external newsletter signup page (opens in new tab)
  - No email input field or confirmation popup; the button is a direct external link

---

## Section 7: Trusted Partners / Brand Logos

- White background, 80px vertical padding, top border (1px solid grey)
- Centred heading: "Trusted Partners" + subtitle
- Horizontally centred row of 5 partner logo placeholders:
  - Each: 160×70px grey box with "Partner Logo" text
  - Flex layout with wrap, 48px gap (24px on mobile)
  - Slight opacity reduction on hover

---

## Section 8: Contact Form

- Off-white (#f9f9f9) background, 100px vertical padding
- Centred heading: "Get In Touch" (italic serif, 3rem) + subtitle
- Form (max 700px, centred) with bottom-border-only inputs:
  - Row 1: First Name (required) + Last Name (required) — side by side, 40px gap (stack on mobile)
  - Row 2: Email Address (required) — full width
  - Row 3: Phone Number (optional, labelled as such) — full width
  - Row 4: Message (required) — textarea, full width, min-height 100px, resizable
  - Submit button: Full-width pill button — "Send Message"
  - Privacy note below button: "Your information is safe with me. I will never share your details or send you spam." (small grey centred text)
- Success state: On submit, form hides and confirmation appears:
  - Green checkmark icon (#4ade80, 40px)
  - "Thank you for reaching out!" (Playfair Display, 1.8rem)
  - "I've received your message and will get back to you shortly."

---

## Section 9: Footer

- White background with top border (1px solid grey), 60px top padding
- All content centred:
  - Logo: "KEANU LE ROUX" (uppercase, letter-spaced, navy)
  - Tagline: "Financial Advisor" (italic serif, grey)
  - Social icons row: YouTube, Instagram, LinkedIn — navy colour, turn accent blue on hover
  - Email link: Italic serif, underlined with 4px offset — "Keanu@Example.Com"
  - Details block (small grey text, 0.8rem):
    - Phone number
    - "An Authorised Financial Services Representative"
    - Copyright line

---

## Section 10: Blog Post Detail Page

Reference prototype: #[[file:prototype/blog-post.html]]

- Standalone HTML page (blog-post.html) displaying a single blog post in full
- Navbar: Rendered in scrolled state (white background, navy text, box shadow) at all times — no transparent-to-white transition
  - Left: "KEANU LE ROUX" logo linking to index.html
  - Right: Navigation links — Home, About, Services, Insights, Contact — all linking to index.html section anchors (e.g. index.html#hero, index.html#about)
  - Mobile: Hamburger toggle with inline `<script>` toggling the nav link dropdown; links auto-close dropdown on click
- Back link: "← Back to Insights" text link above the post header, linking to index.html#blog
- Blog post header:
  - Date label: Uppercase, small, grey text (same style as blog cards on landing page)
  - Title: `<h1>` in Playfair Display (same sizing conventions as landing page headings)
  - Excerpt paragraph: Summary text displayed below the title, styled as lead text
- Blog post image: Full-width image with descriptive `alt` text matching the post title
- Blog post body: Rich text content area supporting:
  - Paragraphs of body text
  - `<h2>` subheadings
  - Unordered lists (`<ul>` with `<li>` items)
- CTA block at bottom of body:
  - Paragraph of motivational/action text
  - "Get In Touch" pill button (`.btn` class) linking to index.html#contact
- Author bio section below the post body:
  - Portrait image (keanu.jpg) with `alt` text, styled as a small circular or rounded thumbnail
  - Author name: "Keanu Le Roux"
  - Author title: "Financial Advisor"
- Footer: Identical to the landing page footer (Section 9)
- Responsive behaviour: Follows the same breakpoints and stacking rules as the landing page

---

## Interactive Behaviours

- Navbar: Transparent → white background transition on scroll (>50px); logo and links change from white to navy
- Accordions: Click header to expand/collapse; only one item open per accordion group; "+" icon rotates 45° to "×" when active; smooth max-height animation (0.4s ease)
- Scroll reveal: Blog cards and feed cards fade in and slide up when entering viewport (IntersectionObserver, threshold 0.1, rootMargin -40px bottom)
- Mobile nav: Hamburger toggle opens/closes nav link dropdown; links auto-close dropdown on click
- Newsletter: "Subscribe" button links to external newsletter signup page (new tab)
- Contact form: Client-side validation on required fields; on submit, form hides and inline thank-you confirmation with green checkmark appears
- Hero video: Autoplay, muted, looping, inline playback on mobile
