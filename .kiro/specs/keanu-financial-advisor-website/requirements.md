# Requirements Document

## Introduction

This document defines the requirements for the Keanu Le Roux Financial Advisor website — a responsive, single-page landing site designed to generate leads, build trust, showcase financial advisory services, and grow a newsletter subscriber base. The website is based on an approved HTML/CSS/JS prototype and a detailed Business Requirements Specification. It uses Sanity CMS for blog post management by the site owner without developer involvement. All other website content (brand logos, social media links, service descriptions, etc.) is static and does not require CMS management.

## Known BRS Document Issues

> **BRS §8.3 Numbering Gap:** The BRS document's CMS-Editable Sections skip from §8.3.1 to §8.3.5 (sections 8.3.2, 8.3.3, and 8.3.4 are missing). This numbering gap is acknowledged but does not affect the requirements defined here. The missing sections are addressed by the simplified CMS scope: only blog posts are managed through Sanity CMS (§8.3.1), while brand logos (§8.3.5) and social media links (§8.3.6) are static content not requiring CMS management.

## Glossary

- **Website**: The Keanu Le Roux Financial Advisor production landing page, consisting of all front-end sections and the CMS back-end
- **Visitor**: Any person viewing the public-facing Website in a browser
- **Admin_User**: Keanu Le Roux, the sole authenticated user of the CMS
- **Navbar**: The fixed top navigation bar containing the logo and section links
- **Hero_Section**: The full-viewport introductory section with video background and CTAs
- **About_Section**: The section presenting Keanu's biography, approach, qualifications, and value proposition
- **Services_Section**: The section listing the seven financial advisory services with accordion details
- **Blog_Section**: The section displaying the featured blog post and blog card grid
- **Social_Feed_Section**: The section displaying clickable preview cards for YouTube, LinkedIn, and Instagram content
- **Newsletter_Section**: The navy-background section with a subscribe CTA linking to an external signup page
- **Partners_Section**: The section displaying trusted partner brand logos
- **Contact_Form**: The lead-capture form with name, email, phone, and message fields
- **Accordion**: A UI component where clicking a header expands its content panel and collapses any other open panel in the same group
- **CMS**: Sanity CMS — the headless Content Management System enabling the Admin_User to manage blog posts. All other site content is static and not CMS-managed.
- **Blog_Post_Page**: The standalone detail page (blog-post.html) displaying a single blog post in full, including header, body content, CTA, author bio, and footer
- **Scroll_Reveal**: An animation triggered by IntersectionObserver that fades in and slides up elements as they enter the viewport

## Requirements

### Requirement 1: Navigation Bar

**User Story:** As a Visitor, I want a fixed navigation bar with section links, so that I can quickly navigate to any part of the Website.

#### Acceptance Criteria

1. THE Navbar SHALL remain fixed to the top of the viewport at all times during scrolling.
2. WHILE the Visitor has not scrolled past 50 pixels, THE Navbar SHALL display a transparent background with white logo text and white navigation link text.
3. WHEN the Visitor scrolls past 50 pixels, THE Navbar SHALL transition to a white background with a subtle box shadow, navy logo text, and navy navigation link text.
4. THE Navbar SHALL display the logo text "KEANU LE ROUX" on the left and navigation links (Home, About, Services, Insights, Contact) on the right.
5. WHEN a Visitor clicks a navigation link, THE Navbar SHALL smooth-scroll the viewport to the corresponding section anchor.
6. WHILE the viewport width is at or below 768 pixels, THE Navbar SHALL replace the navigation links with a hamburger toggle button.
7. WHEN the Visitor clicks the hamburger toggle button, THE Navbar SHALL display a full-width dropdown menu with navigation links on a white background.
8. WHEN the Visitor clicks a navigation link inside the mobile dropdown, THE Navbar SHALL close the dropdown menu and smooth-scroll to the target section.

### Requirement 2: Hero Section

**User Story:** As a Visitor, I want to see a compelling hero section with a video background and clear calls to action, so that I immediately understand Keanu's value proposition and can take action.

#### Acceptance Criteria

1. THE Hero_Section SHALL occupy the full viewport height (100vh).
2. THE Hero_Section SHALL display a looping, muted, autoplaying MP4 video background with the `playsinline` attribute for mobile compatibility.
3. THE Hero_Section SHALL display a navy overlay with rgba(20, 28, 66, 0.55) opacity on top of the video.
4. WHILE the video has not loaded, THE Hero_Section SHALL display a navy-dark (#111b42) fallback background colour.
5. IF the video fails to load or is not supported by the browser, THEN THE Hero_Section SHALL display a placeholder fallback image so that the section remains visually complete and does not show a blank area.
6. THE Hero_Section SHALL display the heading "Your Wealth, Your Legacy." in Playfair Display italic at 3.8rem on desktop and 2rem on mobile.
7. THE Hero_Section SHALL display a subtitle paragraph beneath the heading with light white text (opacity 0.75) and a maximum width of 540 pixels.
8. THE Hero_Section SHALL display two call-to-action buttons side by side on desktop and stacked vertically on mobile.
9. WHEN a Visitor clicks the "Get In Touch" button, THE Hero_Section SHALL smooth-scroll the viewport to the Contact_Form section.
10. WHEN a Visitor clicks the "Subscribe to Newsletter" button, THE Hero_Section SHALL smooth-scroll the viewport to the Newsletter_Section.
11. THE "Get In Touch" button SHALL use a solid steel blue (#7a9bb5) fill with white text and a pill shape (border-radius 40px).
12. THE "Subscribe to Newsletter" button SHALL use a white outlined style with transparent fill, white text, and a pill shape (border-radius 40px).

> **Rationale (BRS Deviation):** The primary CTA text was changed from BRS §4.1 "Schedule Consultation" to "Get In Touch" as an approved change to better align with the prototype's conversational tone and to maintain consistency with the Contact section heading ("Get In Touch" — Req 9 AC 1).

### Requirement 3: About Section

**User Story:** As a Visitor, I want to learn about Keanu's background, qualifications, and approach, so that I can assess his credibility and decide whether to engage his services.

#### Acceptance Criteria

1. THE About_Section SHALL display a two-column layout on desktop with a 320-pixel-wide professional portrait on the left and a text column on the right, separated by a 60-pixel gap.
2. THE About_Section SHALL display the heading "Financial Guidance You Can Trust." in Playfair Display at 2.4rem.
3. THE About_Section SHALL display two paragraphs summarising Keanu's background, qualifications, and philosophy.
4. THE About_Section SHALL display an Accordion below the portrait row with three items: "My approach", "Qualifications & experience", and "Why work with me".
5. WHEN the About_Section loads, THE Accordion SHALL display the "My approach" item in the expanded state.
6. WHEN a Visitor clicks an Accordion header, THE Accordion SHALL expand the clicked item and collapse any other open item in the same group.
7. WHEN an Accordion item is expanded, THE Accordion SHALL rotate the "+" icon 45 degrees to form an "×" and animate the content panel open with a smooth max-height transition (0.4 seconds ease).
8. THE About_Section SHALL display a centred "Get Started" pill button below the Accordion that smooth-scrolls to the Contact_Form section when clicked.
9. WHILE the viewport width is at or below 900 pixels, THE About_Section SHALL stack the portrait above the text in a single column with the portrait centred at a maximum width of 320 pixels.

### Requirement 4: Services Section

**User Story:** As a Visitor, I want to see a clear overview of the financial services offered, so that I can understand how Keanu can help me.

#### Acceptance Criteria

1. THE Services_Section SHALL display the centred heading "What I Offer" in Playfair Display at 3rem with a subtitle paragraph.
2. THE Services_Section SHALL display a three-column image row on desktop (single column on tablet/mobile) with three landscape images at 180 pixels tall using object-fit cover.
3. THE Services_Section SHALL display an Accordion with seven service items: Integrated Wealth Planning, Risk Protection, Healthcare Planning, Investments & Savings, Retirement Planning, Business Planning, and Estate Planning.
4. WHEN the Services_Section loads, THE Accordion SHALL display the "Integrated Wealth Planning" item in the expanded state.
5. WHEN a Visitor clicks a service Accordion header, THE Accordion SHALL expand the clicked item and collapse any other open item in the same group.
6. THE Accordion SHALL display each service description in client-friendly language without financial jargon.

### Requirement 5: Blog / Insights Section

**User Story:** As a Visitor, I want to read Keanu's latest insights and articles, so that I can benefit from his thought leadership and assess his expertise.

#### Acceptance Criteria

1. THE Blog_Section SHALL display the centred heading "Latest Insights" with a subtitle paragraph on an off-white (#f9f9f9) background.
2. THE Blog_Section SHALL display a featured article in a two-column layout (image left, content right) that stacks to single column on tablet/mobile.
3. THE featured article SHALL display a featured image placeholder (340 pixels tall), a date label (uppercase, small, grey), an article title in Playfair Display at 1.8rem, an excerpt paragraph, and a "Read Full Article →" link.
4. THE Blog_Section SHALL display a two-column grid of blog cards below the featured article (single column on mobile).
5. THE blog cards SHALL each display an image placeholder (200 pixels tall), a date label, a title, an excerpt, and a "Read More →" link.
6. WHEN a Visitor hovers over a blog card, THE blog card SHALL lift 3 pixels vertically and display a subtle box shadow.
7. THE Blog_Section SHALL structure blog content with clear date, title, excerpt, image, and body fields sourced from Sanity CMS.
8. THE Blog_Section SHALL automatically display the most recent published blog post as the featured article.
9. IF no blog posts have been published in the CMS, THEN THE Blog_Section SHALL display a placeholder/default blog post so the section is never empty.

> **Rationale (BRS Deviation):** The display of multiple blog posts (featured article plus a card grid) is an approved enhancement over BRS §4.4, which specifies a single most-recent post. This provides richer thought leadership content and better visitor engagement.
> **CMS Integration:** Blog content is sourced from Sanity CMS. The Admin_User manages posts with the fields: Date, Title, Excerpt, Image, Body.

### Requirement 6: Social Media Content Feed

**User Story:** As a Visitor, I want to see Keanu's latest social media content, so that I can engage with his presence across YouTube, LinkedIn, and Instagram.

#### Acceptance Criteria

1. THE Social_Feed_Section SHALL display the centred heading "Latest Content" with a subtitle paragraph on a white background.
2. THE Social_Feed_Section SHALL display a three-column grid of clickable feed cards on desktop (single column on mobile).
3. THE Social_Feed_Section SHALL display one card each for YouTube, LinkedIn, and Instagram.
4. THE YouTube card SHALL display a red (#ff0000) YouTube icon badge, a grey preview area with a centred play button overlay, a title, a description, and a "Watch on YouTube →" CTA.
5. THE LinkedIn card SHALL display a blue (#0077b5) LinkedIn icon badge, an italic serif quote on a grey background (minimum height 200 pixels), a title, a description, and a "Read on LinkedIn →" CTA.
6. THE Instagram card SHALL display a pink (#e4405f) Instagram icon badge, a gradient preview area (gold to pink to purple at 20% opacity), a title, a description, and a "View on Instagram →" CTA.
7. WHEN a Visitor clicks a feed card, THE Social_Feed_Section SHALL open the corresponding social media platform URL in a new browser tab with `rel="noopener noreferrer"`.
8. WHEN a Visitor hovers over a feed card, THE feed card SHALL lift 3 pixels vertically, display a box shadow, and change the external link icon and CTA text colour.
9. THE feed cards SHALL each display a badge row with the platform icon, platform name, and a right-aligned external link icon.

### Requirement 7: Newsletter Subscribe CTA

**User Story:** As a Visitor, I want a clear newsletter subscription call to action, so that I can subscribe to receive Keanu's financial insights.

#### Acceptance Criteria

1. THE Newsletter_Section SHALL display on a navy (#1a2456) background with 80 pixels of vertical padding.
2. THE Newsletter_Section SHALL display the centred heading "Stay Ahead of the Curve" in italic serif white text.
3. THE Newsletter_Section SHALL display a description paragraph explaining subscriber value in light white text (opacity 0.7).
4. THE Newsletter_Section SHALL display three inline benefit items with checkmark prefixes: "Practical wealth-building strategies", "Market updates and economic insights", and "Tips for smarter financial decisions".

> **Rationale (BRS Deviation):** The specific benefit list with checkmark prefixes is an approved design enhancement fulfilling BRS §4.6's requirement for a "short description of what subscribers will receive". The structured list format improves scannability and conversion.
5. THE Newsletter_Section SHALL display a "Subscribe" pill button with a white outlined style.
6. WHEN a Visitor clicks the "Subscribe" button, THE Newsletter_Section SHALL open the external newsletter signup page URL in a new browser tab.
7. THE Newsletter_Section SHALL contain no email input field and no inline form — the button is a direct external link only.

### Requirement 8: Trusted Partners / Brand Logos

**User Story:** As a Visitor, I want to see the brands Keanu partners with, so that I can gauge his credibility and professional associations.

#### Acceptance Criteria

1. THE Partners_Section SHALL display on a white background with 80 pixels of vertical padding and a 1-pixel solid grey top border.
2. THE Partners_Section SHALL display the centred heading "Trusted Partners" with a subtitle paragraph.
3. THE Partners_Section SHALL display a horizontally centred row of 5 partner logo placeholders, each 160 pixels wide by 70 pixels tall.
4. THE Partners_Section SHALL use a flex layout with wrap and a 48-pixel gap on desktop (24 pixels on mobile).
5. WHEN a Visitor hovers over a partner logo, THE partner logo SHALL reduce opacity slightly.
6. THE Partners_Section SHALL display static partner logo images maintained in the codebase. Partner logos are not CMS-managed.

### Requirement 9: Contact Form

**User Story:** As a Visitor, I want to submit a contact form with my details and message, so that I can reach out to Keanu for a consultation.

#### Acceptance Criteria

1. THE Contact_Form SHALL display on an off-white (#f9f9f9) background with the centred heading "Get In Touch" in italic serif at 3rem and a subtitle paragraph.
2. THE Contact_Form SHALL display the following fields with bottom-border-only styling: First Name (required), Last Name (required), Email Address (required), Phone Number (optional, labelled as such), and Message (required, textarea with minimum height 100 pixels).

> **Rationale (BRS Deviation):** The split of the BRS §4.8 "Name" field into separate First Name and Last Name fields is an approved enhancement. This provides better data quality for personalised communications and CRM integration.
3. THE Contact_Form SHALL display First Name and Last Name side by side on desktop with a 40-pixel gap, stacking to single column on mobile.
4. THE Contact_Form SHALL display a full-width "Send Message" pill button.
5. THE Contact_Form SHALL display a privacy note below the submit button: "Your information is safe with me. I will never share your details or send you spam."
6. WHEN a Visitor submits the Contact_Form with all required fields completed, THE Contact_Form SHALL hide the form and display an inline success confirmation with a green checkmark icon (#4ade80), the heading "Thank you for reaching out!", and the message "I've received your message and will get back to you shortly."
7. IF a Visitor submits the Contact_Form with any required field empty, THEN THE Contact_Form SHALL prevent submission and indicate the missing fields using native browser validation.
8. WHEN a Visitor submits the Contact_Form successfully, THE Website SHALL send the form data to a designated email address.

### Requirement 10: Footer

**User Story:** As a Visitor, I want a footer with contact details and social links, so that I can find Keanu's contact information and follow him on social media.

#### Acceptance Criteria

1. THE Footer SHALL display on a white background with a 1-pixel solid grey top border and 60 pixels of top padding.
2. THE Footer SHALL display all content centred: the "KEANU LE ROUX" logo text, the "Financial Advisor" tagline in italic serif grey text, a row of social icons (YouTube, Instagram, LinkedIn), an email link in italic serif with underline offset, and a details block with phone number, authorisation statement, and copyright line.
3. THE social icons SHALL display in navy colour and transition to accent blue on hover.
4. WHEN a Visitor clicks a social icon, THE Footer SHALL navigate to the corresponding social media profile.
5. WHEN a Visitor clicks the email link, THE Footer SHALL open the Visitor's default email client with the pre-filled recipient address.

### Requirement 11: Responsive Design

**User Story:** As a Visitor, I want the Website to display correctly on desktop, tablet, and mobile devices, so that I have a consistent experience regardless of my device.

#### Acceptance Criteria

1. THE Website SHALL use a maximum content width of 1100 pixels, centred horizontally.
2. WHILE the viewport width is above 900 pixels, THE Website SHALL display multi-column layouts for the About_Section, Services_Section image row, Blog_Section, and Social_Feed_Section.
3. WHILE the viewport width is at or below 900 pixels, THE Website SHALL collapse all multi-column grids to single-column layouts and centre the About_Section portrait at a maximum width of 320 pixels.
4. WHILE the viewport width is at or below 768 pixels, THE Website SHALL display a hamburger menu, stack hero CTAs vertically, use single-column form layouts, and stack newsletter benefit items.
5. THE Website SHALL use the design system typography: Playfair Display for headings and italic accents, Inter for body text and UI elements.
6. THE Website SHALL use the design system colour palette: navy (#1a2456) primary, steel blue (#7a9bb5) for the hero primary CTA, muted blue (#5a70a0) for hover states, white (#ffffff) and off-white (#f9f9f9) alternating section backgrounds.
7. THE Website SHALL use pill-shaped buttons (border-radius 40px) with outlined navy borders that fill navy on hover for all general buttons.

### Requirement 12: Interactive Behaviours

**User Story:** As a Visitor, I want smooth animations and interactive feedback, so that the Website feels polished and responsive to my actions.

#### Acceptance Criteria

1. WHEN blog cards and feed cards enter the viewport, THE Website SHALL animate them with a fade-in and slide-up effect using IntersectionObserver with a threshold of 0.1 and a root margin of -40 pixels on the bottom.
2. WHEN a Visitor hovers over a blog card or feed card, THE card SHALL lift 3 pixels vertically and display a subtle box shadow.
3. THE Accordion components SHALL animate content panels with a smooth max-height transition of 0.4 seconds ease.
4. THE Navbar SHALL transition between transparent and white background states with a 0.3-second ease animation.

### Requirement 13: Accessibility

**User Story:** As a Visitor using assistive technology, I want the Website to follow accessibility practices, so that I can navigate and interact with all content.

#### Acceptance Criteria

1. THE Website SHALL use semantic HTML elements (nav, main, section, article, footer, button, form) for all structural content.
2. THE Website SHALL provide descriptive `alt` attributes on all images.
3. THE Website SHALL provide `aria-label` attributes on all icon-only interactive elements (hamburger toggle, social icon links).
4. THE Accordion headers SHALL use `aria-expanded` attributes that reflect the current expanded or collapsed state.
5. THE Website SHALL ensure all interactive elements are reachable and operable via keyboard navigation.
6. THE Website SHALL use colour contrast ratios that meet readable standards for all text against its background.
7. THE Contact_Form SHALL associate each input with a visible `<label>` element using matching `for` and `id` attributes.
8. THE Hero_Section video SHALL include the `muted` attribute and not autoplay audio content.
9. IF the Hero_Section video fails to load or is not supported by the browser, THEN THE Hero_Section SHALL display a placeholder fallback image so that the section remains visually complete.

### Requirement 14: Performance

**User Story:** As a Visitor, I want the Website to load quickly, so that I do not abandon the page due to slow performance.

#### Acceptance Criteria

1. THE Website SHALL optimise all images for web delivery using appropriate compression and modern formats where supported.
2. THE Website SHALL preconnect to external font origins (Google Fonts) to reduce font loading latency.
3. THE Hero_Section SHALL use a fallback background colour (#111b42) that displays immediately while the video loads.
4. THE Website SHALL load CSS and JavaScript assets in a manner that does not block initial content rendering. All external script tags SHALL use the `defer` or `async` attribute.
5. THE Website SHALL use lazy loading (`loading="lazy"`) on all images below the fold.

### Requirement 15: CMS — Blog Management (Sanity CMS)

**User Story:** As the Admin_User, I want to create, edit, publish, and unpublish blog posts through Sanity CMS, so that I can keep the Insights section current without developer assistance.

> **CMS Platform:** Sanity CMS is the approved CMS platform for this project. Blog posts are the only content type managed through the CMS; all other website content is static.

#### Acceptance Criteria

1. THE CMS SHALL use Sanity CMS as the content management platform.
2. THE CMS SHALL allow the Admin_User to create a new blog post with the following fields: Date, Title, Excerpt, Image, and Body.
3. THE CMS SHALL allow the Admin_User to edit existing blog posts.
4. THE CMS SHALL allow the Admin_User to publish or unpublish blog posts.
5. WHEN the Admin_User publishes a blog post, THE Blog_Section SHALL automatically display the most recent published post as the featured article.
6. THE Admin_User SHALL be able to publish a new blog post in under 10 minutes.

### ~~Requirement 16: CMS — Brand Logo Management~~ [OUT OF SCOPE]

> **Out of Scope:** Brand logo management is not CMS-managed. Partner logos are static content maintained in the codebase. This simplification was approved to reduce CMS scope — only blog posts are managed through Sanity CMS.

### ~~Requirement 17: CMS — Social Media Link Management~~ [OUT OF SCOPE]

> **Out of Scope:** Social media link management is not CMS-managed. Social media profile URLs are static content maintained in the codebase. This simplification was approved to reduce CMS scope — only blog posts are managed through Sanity CMS.

### Requirement 18: CMS — Authentication and Security

**User Story:** As the Admin_User, I want the CMS to be secured with authentication, so that only I can modify blog content.

> **Simplified Scope:** Authentication is handled by Sanity CMS's built-in authentication. No custom authentication system is required.

#### Acceptance Criteria

1. THE CMS SHALL use Sanity CMS's built-in authentication to require the Admin_User to log in before accessing blog management functionality.
2. THE CMS SHALL protect all form submissions and CMS endpoints against spam and abuse.
3. IF an unauthenticated user attempts to access the Sanity CMS dashboard, THEN Sanity SHALL redirect the user to the Sanity login page.
4. THE Sanity CMS dashboard SHALL provide a clean, intuitive admin interface for blog post management.

### Requirement 19: Blog Post Detail Page

**User Story:** As a Visitor, I want to read a full blog post on its own page with clear navigation back to the landing page, so that I can consume the complete article and take action afterwards.

#### Acceptance Criteria

1. THE Blog_Post_Page SHALL be a standalone HTML page (blog-post.html) that displays a single blog post in full.
2. THE Blog_Post_Page SHALL display the Navbar in the scrolled state (white background, box shadow, navy text) at all times, with the logo linking to index.html and navigation links pointing to index.html section anchors (Home, About, Services, Insights, Contact).
3. THE Blog_Post_Page SHALL display a "← Back to Insights" text link above the post header that navigates to index.html#blog.
4. THE Blog_Post_Page SHALL display a post header containing a date label (uppercase, small, grey), an `<h1>` title in Playfair Display, and an excerpt paragraph styled as lead text.
5. THE Blog_Post_Page SHALL display a full-width blog post image with a descriptive `alt` attribute matching the post title.
6. THE Blog_Post_Page SHALL display a rich text body content area supporting paragraphs, `<h2>` subheadings, and unordered lists.
7. THE Blog_Post_Page SHALL display a CTA block at the bottom of the body containing a motivational paragraph and a "Get In Touch" pill button (`.btn` class) linking to index.html#contact.
8. THE Blog_Post_Page SHALL display an author bio section below the post body containing a portrait image (with `alt` text), the author name "Keanu Le Roux", and the author title "Financial Advisor".
9. THE Blog_Post_Page SHALL display the same Footer as the landing page.
10. WHILE the viewport width is at or below 768 pixels, THE Blog_Post_Page SHALL display a hamburger toggle for navigation with an inline script that toggles the mobile dropdown and auto-closes it when a link is clicked.
11. THE Blog_Post_Page SHALL follow the same responsive breakpoints and stacking rules as the landing page.
12. THE Blog_Post_Page content (title, excerpt, image, body) SHALL be sourced from Sanity CMS using the same blog post fields defined in Requirement 15.
