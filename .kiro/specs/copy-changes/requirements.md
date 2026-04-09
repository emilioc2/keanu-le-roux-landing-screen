# Copy Changes — Prototype-to-Production Alignment

This document captures every text/copy difference between the approved prototype
(`prototype/index.html`) and the current production components. Each change is
listed by section with the current production text, the new prototype text, and
the file that needs updating.

---

## Change 1 — About: Bio Paragraphs

**Section:** About  
**File:** `src/components/About.tsx`  
**What changed:** The prototype has completely rewritten bio copy (4 paragraphs instead of 2), reflecting Keanu's new positioning as an "Independent Wealth Manager" with FSP licensing details and fiduciary duty language.

**Current production text (paragraph 1):**
> I'm Keanu Le Roux, a qualified financial advisor dedicated to helping individuals, families and business owners take control of their financial futures. My approach is built on trust, transparency and a genuine commitment to understanding your unique goals.

**New prototype text (paragraph 1):**
> I'm Keanu Le Roux, an Independent Wealth Manager focused on helping individuals, families, and business owners build and protect long-term wealth with clarity and confidence.

**Current production text (paragraph 2):**
> With experience across financial planning, wealth management, retirement strategy and risk protection, I work alongside you to build a plan that evolves with your life. Great advice starts with listening — and I'm here to make sure you always feel informed, confident and in control.

**New prototype text (paragraph 2):**
> I provide objective, unbiased financial advice that is free from conflicts of interest, grounded in a holistic approach to financial planning. By considering all aspects of your financial position, I develop integrated strategies tailored to your unique goals and evolving needs.

**New prototype text (paragraph 3 — NEW):**
> I am contracted to a licensed Financial Services Provider (FSP) holding both Category I and Category II licences, enabling the provision of comprehensive advice alongside discretionary investment management solutions.

**New prototype text (paragraph 4 — NEW):**
> My approach is underpinned by a fiduciary duty to act in your best interests at all times—ensuring transparency, ongoing review, and that you remain informed, confident, and in control of your financial future.


---

## Change 2 — About: "My approach" Accordion Content

**Section:** About (Accordion item 1)  
**File:** `src/components/About.tsx`  
**What changed:** The "My approach" accordion content has been substantially rewritten. It now references behavioural coaching, the "Advisor's Alpha" framework, and quantifies the value of guidance (up to 1.5% per year in net returns). Expanded from 2 paragraphs to 3.

**Current production text (paragraph 1):**
> I believe financial planning should feel empowering, not overwhelming. Every conversation starts with your goals — your lifestyle, your family, your ambitions — and from there we build a strategy that's as unique as you are.

**New prototype text (paragraph 1):**
> As the saying goes, 'personal finance is more personal than it is finance.' Every conversation begins with understanding your life—your values, family, and ambitions—before shaping a strategy aligned to what matters most to you.

**Current production text (paragraph 2):**
> I focus on education, clarity and long-term thinking. No jargon, no pressure, just honest guidance you can trust.

**New prototype text (paragraph 2):**
> My approach emphasises behavioural coaching, recognising that long-term success is driven as much by disciplined decision-making as by investment selection. Research, including the 'Advisor's Alpha' framework, shows that effective guidance can add up to 1.5% per year in net returns by helping clients avoid costly, emotionally-driven decisions.

**New prototype text (paragraph 3 — NEW):**
> I focus on clarity, education, and long-term thinking—providing objective guidance without unnecessary complexity or pressure, so you remain confident, informed, and committed through every stage of your financial journey.

---

## Change 3 — About: "Qualifications & experience" Accordion Content

**Section:** About (Accordion item 2)  
**File:** `src/components/About.tsx`  
**What changed:** The qualifications accordion has been completely rewritten with specific degrees, certifications (RE5, Class of Business, CFP in progress), career history (Discovery, The Wealth Room), and the new Independent Wealth Manager title. Expanded from 1 paragraph to 3.

**Current production text (single paragraph):**
> I hold relevant industry qualifications and am an authorised financial services representative. My areas of expertise include wealth planning, risk protection, investment management, retirement planning and estate structuring.

**New prototype text (paragraph 1):**
> I hold a Bachelor of Theology from the South African Theological Seminary and a Postgraduate Diploma in Business Management from Stellenbosch Business School, and I am preparing to complete my CFP certification.

**New prototype text (paragraph 2):**
> As an authorised Financial Services Representative (RE5 and Class of Business certified), I specialise in private wealth management, investment strategy, risk protection, retirement planning, and estate structuring.

**New prototype text (paragraph 3):**
> I began my career at Discovery, completed my supervision at The Wealth Room, and now operate as an Independent Wealth Manager, delivering bespoke, holistic solutions tailored to each client's long-term goals.

---

## Change 4 — Blog: Featured Post Content

**Section:** Blog / Insights  
**File:** `src/data/defaultPost.ts`  
**What changed:** The featured blog post has been replaced entirely. The prototype now shows a "Gold, Oil, & Your Portfolio" article instead of the "Why Starting Early" placeholder. Title, date, excerpt, and image are all different.

**Current production featured post title:**
> Why Starting Early Is the Best Financial Decision You'll Ever Make

**New prototype featured post title:**
> Gold, Oil, & Your Portfolio

**Current production featured post date:**
> 2026-03-25T00:00:00Z (renders as "March 25, 2026")

**New prototype featured post date:**
> April 9, 2026

**Current production featured post excerpt (landing page):**
> Time is the most powerful tool in wealth building. In this post, I break down why the decisions you make in your 20s and 30s have an outsized impact on your financial future — and what you can do today to set yourself up for success.

**New prototype featured post excerpt (landing page — `index.html`):**
> You may have noticed something strange lately: gold prices have fallen sharply even as the Middle East conflict has intensified. Normally, war drives gold up. So, what's going on? The short answer is oil.

**Note (BUG-222):** The blog detail page (`blog-post.html`) uses a slightly shorter excerpt than the landing page featured excerpt. The detail page excerpt reads:
> Gold prices have fallen sharply even as the Middle East conflict has intensified. Normally, war drives gold up. So, what's going on?

The `defaultPost.excerpt` field is used on the landing page. The blog detail page excerpt in `blog-post.html` omits the opening "You may have noticed something strange lately:" and the closing "The short answer is oil." If the production implementation uses the same `excerpt` field on both pages, the landing page version (longer) should be stored in `defaultPost.excerpt`, and the detail page may either use the same text or truncate it. The prototype shows different lengths — implementers should match the prototype for each page.

---

## Change 5 — Blog: Featured Post Image

**Section:** Blog / Insights  
**File:** `src/data/defaultPost.ts` and `src/components/Blog.tsx`  
**What changed:** The prototype uses a specific Unsplash image for the featured blog post showing gold bars and oil barrels. The production default post has no `mainImage` set, so it shows a grey placeholder. The prototype image should be used as the default featured image.

**Prototype featured image URL:**
> `https://images.unsplash.com/photo-1610375461246-83df859d849d?w=700&q=75`

**Prototype featured image alt text:**
> Gold bars and oil barrels representing commodity market dynamics

**Current production:** No `mainImage` property on the default post — shows grey placeholder with "Featured Image" text.

**Required change:** Add a `mainImage` to the `defaultPost` object in `src/data/defaultPost.ts` using the Unsplash URL above, or download the image to `public/images/blog/` and reference it locally.

---

## Change 6 — Blog: Card Post Content — REVERTED

> **Status: REVERTED** — The user decided to remove the two card blog posts ("Understanding Risk:
> Why Protection Matters" and "Retirement Planning in Your 30s"). The `defaultPosts` array now
> contains only the single featured "Gold, Oil, & Your Portfolio" post. `Blog.tsx` still imports
> `defaultPosts` (plural array) but with only 1 element — no card grid renders because the
> `remaining` slice is empty.

**Section:** Blog / Insights (card grid)  
**File:** `src/data/defaultPost.ts`  
**Original change:** The prototype showed 2 blog cards below the featured post. This change originally added those 2 card posts to the `defaultPosts` array.

**Revert rationale:** User decision — the card posts are not needed at this time. The blog section displays only the featured article. Future card posts will come from Sanity CMS when available.

**Current state after revert:**
- `defaultPosts` is a `BlogPost[]` array containing 1 element (the featured Gold/Oil post).
- The export name remains `defaultPosts` (plural) for API consistency with consumers.
- `Blog.tsx` imports `{ defaultPosts }` and uses it directly as the fallback — no card grid renders since there are no remaining posts after the featured post is extracted.
- `blog/[slug]/page.tsx` uses `defaultPosts.find()` to match the single placeholder slug.

---

## Change 7 — Footer: Tagline

**Section:** Footer  
**File:** `src/components/Footer.tsx`  
**What changed:** The footer tagline has been updated from "Financial Advisor" to "Independent Wealth Manager" to match the new branding.

**Current production text:**
> Financial Advisor

**New prototype text:**
> Independent Wealth Manager

---

## Change 8 — Footer: Email Display Casing

**Section:** Footer  
**File:** `src/components/Footer.tsx`  
**What changed:** The footer email link display text uses mixed case in the prototype instead of lowercase.

**Current production display text:**
> keanu@thewealthroom.com (rendered from `contactInfo.email` which is lowercase)

**New prototype display text:**
> Keanu@TheWealthRoom.com

**Note:** The `mailto:` href should remain lowercase for compatibility. Only the visible display text changes.

---

## Change 9 — Footer: Copyright Year and Casing

**Section:** Footer  
**File:** `src/components/Footer.tsx`  
**What changed:** The prototype uses a hardcoded year "2026" and capitalises "Rights Reserved" differently.

**Current production text:**
> (c) {currentYear} Keanu Le Roux. All rights reserved.

**New prototype text:**
> (c) 2026 Keanu Le Roux. All Rights Reserved.

**Note:** The capitalisation change is "All rights reserved." to "All Rights Reserved." (capital R on both words). The year should remain dynamic (`currentYear`) in production — only the capitalisation of "Rights Reserved" needs updating.

---

## Change 10 — Page Title (metadata)

**Section:** HTML `<head>`  
**File:** `src/app/layout.tsx`  
**What changed:** The prototype title tag has been updated to reflect the new branding.

**Current production text:**
> Keanu Le Roux | Financial Advisor

**New prototype text:**
> Keanu Le Roux | Independent Wealth Manager

---

## Change 11 — About: Portrait Alt Text

**Section:** About  
**File:** `src/components/About.tsx`  
**What changed:** The portrait image alt text uses the old "Financial Advisor" title in production. The prototype uses the new "Independent Wealth Manager" branding with a comma separator instead of an em dash.

**Current production text:**
> alt="Keanu Le Roux — Financial Advisor"

**New prototype text:**
> alt="Keanu Le Roux, Independent Wealth Manager"

---

## Change 12 — BlogPostDetail: Author Title

**Section:** Blog Post Detail (author bio)  
**File:** `src/components/BlogPostDetail.tsx`  
**What changed:** The author title below the author name on the blog detail page uses the old "Financial Advisor" title. The prototype blog-post.html uses the new "Independent Wealth Manager" branding.

**Current production text:**
> Financial Advisor

**New prototype text:**
> Independent Wealth Manager

---

## Change 13 — BlogPostDetail: CTA Text

**Section:** Blog Post Detail (CTA block)  
**File:** `src/components/BlogPostDetail.tsx`  
**What changed:** The CTA paragraph text in the blog post detail page differs between production and the prototype. The prototype uses article-specific CTA copy referencing commodity/portfolio discussion, while production uses generic contact copy.

**Current production text:**
> Ready to take the first step? I'd love to help you build a plan that works for your life and goals.

**New prototype text:**
> Want to discuss how commodity movements affect your portfolio? I'd love to help you navigate these markets.

**Note:** The prototype CTA text is specific to the Gold/Oil article. If the CTA text should be dynamic per post (sourced from CMS), this should be noted as a design consideration. For the default/placeholder post, the prototype text above should be used.

---

## Change 14 — Blog: Default Post Body Content

**Section:** Blog / Insights (detail page body)  
**File:** `src/data/defaultPost.ts`  
**What changed:** The prototype blog-post.html contains the full "Gold, Oil, & Your Portfolio" article body — approximately 15 paragraphs with 4 h2 subheadings. The production defaultPost.ts body contains only a single placeholder paragraph. Change 4 covers the title, date, and excerpt; this change covers the full article body content.

**Current production body (single Portable Text block):**
> This blog is coming soon. Stay tuned for insights on wealth building, financial planning, and making smarter decisions with your money. In the meantime, feel free to get in touch if you have any questions about your financial future.

**New prototype body structure (from blog-post.html):**

The body should be converted to Portable Text blocks matching the following structure:

1. Paragraph: "You may have noticed something strange lately: gold prices have fallen sharply even as the Middle East conflict has intensified. Normally, war drives gold up. So, what's going on?"
2. Paragraph: "The short answer is oil."
3. H2: "The Oil-Gold Connection"
4. Paragraph: "The Iran war has disrupted oil flows..."
5. Paragraph: "That leaves them in a tight spot."
6. Paragraph: "To get the dollars they urgently need..."
7. Paragraph: "For example, Turkey reportedly liquidated around 58 tons of gold..."
8. H2: "Russia's Gold Export Restrictions"
9. Paragraph: "And there's another important factor developing in the background."
10. Paragraph: "Russia, the world's second-largest gold producer..."
11. H2: "What Does This Mean for the Gold Price?"
12. Paragraph: "In the short term, it could add further downward pressure..."
13. Paragraph: "So over the next few weeks, we could continue to see volatility..."
14. Paragraph: "But this is where the longer-term picture becomes important."
15. Paragraph: "Once the immediate pressures of the war ease..."
16. Paragraph: "That combination — reduced forced selling and renewed institutional buying..."
17. H2: "What Does This Mean for You?"
18. Paragraph: "If you have exposure to gold..."
19. Paragraph: "In simple terms: gold may be under pressure now, but it could be setting up for its next major move higher."

Required change: Replace the single placeholder body block in defaultPost.ts with the full article body above, encoded as Portable Text blocks.

---

## Sections With NO Copy Differences

The following sections were compared and found to have identical text between the prototype and production.

| Section | Files Compared | Result |
|---------|---------------|--------|
| Hero | Hero.tsx vs prototype #hero | Identical |
| Services heading/subtitle | Services.tsx vs prototype #services | Identical |
| Services accordion (all 7 items) | services.ts vs prototype #servicesAccordion | Identical |
| About: "Why work with me" accordion | About.tsx vs prototype | Identical |
| About: heading | About.tsx vs prototype | Identical |
| About: CTA button | About.tsx vs prototype | Identical |
| Blog heading/subtitle | Blog.tsx vs prototype #blog | Identical |
| Social Feed heading/subtitle | SocialFeed.tsx vs prototype #feed | Identical |
| Social Feed card content | socialLinks.ts vs prototype feed cards | Identical |
| Newsletter heading | Newsletter.tsx vs prototype #newsletter | Identical |
| Newsletter description | Newsletter.tsx vs prototype | Identical |
| Newsletter benefits | Newsletter.tsx vs prototype | Identical |
| Testimonials heading/subtitle | Testimonials.tsx vs prototype #testimonials | Identical |
| Testimonials card content | Testimonials.tsx vs prototype | Identical |
| Partners heading/subtitle | Partners.tsx vs prototype #partners | Identical |
| Contact Form heading/subtitle | ContactForm.tsx vs prototype #contact | Identical |
| Contact Form field labels | ContactForm.tsx vs prototype | Identical |
| Contact Form privacy note | ContactForm.tsx vs prototype | Identical |
| Contact Form success message | ContactForm.tsx vs prototype | Identical |
| Nav links | siteConfig.ts vs prototype nav | Identical |
| Footer: phone, auth statement | Footer.tsx / siteConfig.ts vs prototype | Identical |
| Footer: social links | siteConfig.ts vs prototype | Identical |

---

## Summary of All Required Changes

| # | Section | Change Summary | File(s) |
|---|---------|---------------|---------|
| 1 | About bio | 2 paragraphs to 4 paragraphs, new "Independent Wealth Manager" positioning | About.tsx |
| 2 | About "My approach" | Rewritten with behavioural coaching, Advisor's Alpha framework (2 to 3 paragraphs) | About.tsx |
| 3 | About "Qualifications" | Rewritten with specific degrees, certs, career history (1 to 3 paragraphs) | About.tsx |
| 4 | Blog featured post | New article: "Gold, Oil, & Your Portfolio" replacing "Why Starting Early" | defaultPost.ts |
| 5 | Blog featured image | Add Unsplash commodity image to default post | defaultPost.ts |
| 6 | Blog card posts | REVERTED — Card posts removed per user decision. defaultPosts array contains only 1 post (the featured Gold/Oil article). No card grid renders. | defaultPost.ts |
| 7 | Footer tagline | "Financial Advisor" to "Independent Wealth Manager" | Footer.tsx |
| 8 | Footer email display | Lowercase to mixed case "Keanu@TheWealthRoom.com" | Footer.tsx |
| 9 | Footer copyright | "All rights reserved." to "All Rights Reserved." | Footer.tsx |
| 10 | Page title | "Keanu Le Roux | Financial Advisor" to "Keanu Le Roux | Independent Wealth Manager" | layout.tsx |
| 11 | About portrait alt text | "Keanu Le Roux — Financial Advisor" to "Keanu Le Roux, Independent Wealth Manager" | About.tsx |
| 12 | BlogPostDetail author title | "Financial Advisor" to "Independent Wealth Manager" | BlogPostDetail.tsx |
| 13 | BlogPostDetail CTA text | Generic contact CTA to article-specific commodity/portfolio CTA | BlogPostDetail.tsx |
| 14 | Blog default post body | Single placeholder paragraph to full Gold/Oil article (19 Portable Text blocks) | defaultPost.ts |
