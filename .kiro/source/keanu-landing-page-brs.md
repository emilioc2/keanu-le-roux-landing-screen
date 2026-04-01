# Business Requirements Specification (BRS)
## Keanu Le Roux — Financial Advisor Landing Screen

- Project: Keanu Le Roux – Financial Advisor Landing Page Website
- Document Version: 1.0
- Date: 31 March 2026

---

## 1. Business Overview

### 1.1 Background

Keanu Le Roux is a professional financial advisor seeking to establish a strong digital presence through a single‑page (or short multi‑section) landing page website. The website will serve as a primary marketing and lead‑generation channel, providing visitors with an overview of his services, credibility, and expertise, while encouraging direct contact and newsletter subscriptions.

### 1.2 Business Objectives

The primary objectives of the website are to:

- Generate qualified leads for financial advisory services
- Build trust and credibility with potential clients
- Promote thought leadership through blog and social content
- Grow a newsletter subscriber base
- Provide a clear and simple way for visitors to contact Keanu

---

## 2. Target Audience

- Individuals seeking personal financial planning or advisory services
- Professionals and business owners interested in long‑term wealth planning
- Existing and prospective clients wanting to follow Keanu's insights and content

---

## 3. Scope of Work

### 3.1 In Scope

- Design and development of a responsive landing page website
- Content sections as defined in the functional requirements
- Integration of social media feeds (YouTube, LinkedIn, Instagram)
- Newsletter subscription functionality
- Contact form with lead capture

---

## 4. Functional Requirements

### 4.1 Hero Section

Description: The hero section must immediately communicate Keanu's value proposition and prompt action.

Requirements:
- Prominent headline introducing Keanu and his financial advisory offering
- Short supporting sub‑headline (value‑driven, trust‑focused)
- Primary Call to Action (CTA): "Schedule Consultation"
  - Scrolls to contact form or opens contact modal
- Secondary CTA: "Subscribe to Newsletter"
  - Links to newsletter sign‑up form

Success Criteria:
- Both CTAs are immediately visible above the fold
- Clear visual hierarchy between primary and secondary CTA

### 4.2 About Section

Description: A section describing Keanu Le Roux, his background, qualifications, and business philosophy.

Requirements:
- Professional summary of Keanu and his advisory approach
- List or short narrative of qualifications, certifications, and experience
- Professional headshot or brand‑aligned imagery
- Messaging focused on trust, credibility, and personal connection

### 4.3 Financial Services Section

Description: An overview of the financial services offered.

Requirements:
- Clearly defined list of services (e.g. financial planning, wealth management, retirement planning, etc.)
- Each service to include a short description
- Optional icons or visual elements for scannability
- Copy written in simple, client‑friendly language

### 4.4 Newsletter / Blog Section

Description: A section showcasing thought leadership through written content.

Requirements:
- Display of the most recent blog or newsletter post
- Blog title, image, short excerpt, and publication date
- Content must be easy to update in future

### 4.5 Social Media Content Feed

Description: A live or semi‑live feed of Keanu's latest social media content.

Requirements:
- Display most recent content from:
  - YouTube
  - LinkedIn
  - Instagram
- Content may be embedded or displayed as clickable previews
- Each item links directly to the relevant platform
- Layout must remain visually consistent and performant

### 4.6 Newsletter Subscription Call to Action

Description: A dedicated section reinforcing newsletter sign‑up.

Requirements:
- Clear headline explaining the value of subscribing
- Short description of what subscribers will receive
- Subscription button will direct customer to another URL where they can enter subscription details

### 4.7 Brand Logos / Social Proof Section

Description: A section highlighting credibility through associations and partnerships.

Requirements:
- Display logos or images of brands Keanu has worked with
- Clean, uniform presentation of logos
- Optional short supporting line (e.g. "Trusted by…" or "Worked with…")

### 4.8 Contact Form Section

Description: A dedicated section allowing users to contact Keanu directly.

Requirements:
- Contact form fields:
  - Name
  - Email address
  - Phone number (optional)
  - Message
- Submission confirmation (thank‑you message)
- Form submissions sent to a designated email address
- Clear privacy reassurance (no spam, data protection note)

---

## 5. Non‑Functional Requirements

### 5.1 Design & UX

- Clean, professional, and trustworthy visual style
- Consistent typography and spacing
- Clear visual hierarchy
- Optimised for conversions and readability

### 5.2 Responsiveness

- Fully responsive design
- Optimised for desktop, tablet, and mobile devices

### 5.3 Performance

- Fast page load times
- Optimised images and embedded media

### 5.4 Accessibility

- Readable contrast ratios
- Legible font sizes
- Clear form labels and focus states

---

## 6. Assumptions & Dependencies

Keanu will supply:
- Final copy (or approve drafted content)
- Professional images/logos
- Social media account links

Additional:
- Newsletter tool (e.g. Mailchimp or similar) will be provided or confirmed
- Hosting and domain details will be finalised separately

---

## 7. Success Metrics

- Number of contact form submissions
- Newsletter subscription growth
- Time spent on page
- Click‑through rates on CTAs
- Engagement with blog and social content

---

## 8. Content Management System (CMS) Requirements

### 8.1 CMS Overview

The website must include a simple, secure Content Management System (CMS) that enables Keanu Le Roux to update selected website content without requiring developer assistance.

The CMS should prioritize ease of use, minimal training, and content safety (preventing accidental layout breakage).

### 8.2 CMS User Roles

Admin User: Keanu Le Roux

Permissions:
- Create, edit, and delete blog posts/newsletter items
- Update selected text sections on the landing page
- Upload and replace images where permitted
- Manage embedded social media links
- View contact form submissions (or receive them via email)

### 8.3 CMS‑Editable Sections

#### 8.3.1 Blog / Newsletter Section (High Priority)

Requirements:
- Ability to:
  - Create new blog/newsletter posts
  - Edit existing posts
  - Publish or unpublish posts
- Each post must support:
  - Title
  - Featured image (optional)
  - Rich text content (WYSIWYG editor)
  - Publication date
  - Short excerpt/summary
- Homepage must automatically display the most recent published post

Success Criteria:
- Keanu can add a new post without affecting site styling
- Blog updates automatically reflect on the landing page

#### 8.3.5 Brand Logos / Social Proof

Requirements:
- Ability to:
  - Upload, replace, or reorder brand logos
  - Image size and format constraints enforced by CMS

#### 8.3.6 Social Media Feed Management

Requirements:
- Ability to:
  - Update or replace social media profile links (YouTube, LinkedIn, Instagram)
- Social feed embeds should refresh automatically based on linked accounts
- No manual post‑by‑post updates required

### 8.4 CMS Non‑Functional Requirements

#### 8.4.1 Usability

- Clean, intuitive admin interface
- Minimal technical terminology
- Inline help text or labels where necessary

#### 8.4.2 Content Safety

- Locked layout elements to prevent design breakage
- Limited formatting options in text editor (no arbitrary font or color changes)

#### 8.4.3 Security

- Secure login with password protection
- CMS and form submissions protected against spam and abuse
- Regular backup capability (manual or automated)

### 8.5 Content Governance

Assumptions:
- Keanu is responsible for:
  - All uploaded content
  - Accuracy and compliance of financial information
- CMS should allow content changes without requiring site redeployment

### 8.6 CMS Success Metrics

- Ability for Keanu to publish a blog post in under 10 minutes
- Zero developer involvement required for routine content changes
- Consistent visual output after content updates
