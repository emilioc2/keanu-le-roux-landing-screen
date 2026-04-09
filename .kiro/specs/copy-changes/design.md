# Design Document — Copy Changes (Prototype-to-Production Alignment)

## 1. Introduction

This design document specifies the exact file-level changes required to implement the 14 copy/text
differences identified in `requirements.md`. These changes align the production Next.js application
with the approved prototype (`prototype/index.html` and `prototype/blog-post.html`).

The changes fall into three categories:
- **Text replacements** — updating strings in component files (Changes 1-3, 7-13)
- **Data model refactor** — restructuring `defaultPost.ts` from a single export to a plural array
  export with full article content (Changes 4, 5, 14; Change 6 card posts REVERTED)
- **Import updates** — adjusting consumers of the renamed export (Change 6, plus the blog detail
  route's slug check)

Reference: `.kiro/specs/copy-changes/requirements.md` for full before/after text comparisons.

---

## 2. File Changes

### 2.1 `src/components/About.tsx` (Changes 1, 2, 3, 11)

See requirements.md Changes 1, 2, 3, 11 for full before/after text. Summary:

- Change 1: Bio paragraphs (2 paragraphs to 4 paragraphs, new Independent Wealth Manager positioning)
- Change 2: "My approach" accordion (2 paragraphs to 3, adds behavioural coaching and Advisor's Alpha)
- Change 3: "Qualifications and experience" accordion (1 paragraph to 3, adds specific degrees/certs/career)
- Change 11: Portrait alt text ("Financial Advisor" to "Independent Wealth Manager")

---

### 2.2 `src/data/defaultPost.ts` (Changes 4, 5, 14; Change 6 card posts REVERTED)

This is the most complex change. The file is restructured from exporting a single `defaultPost`
object to exporting a `defaultPosts` array containing a single `BlogPost` object (the featured
"Gold, Oil, and Your Portfolio" post).

**Note (Change 6 REVERTED):** The `defaultPosts` array originally contained 3 posts (1 featured
plus 2 card posts). Per user decision, the two card posts ("Understanding Risk: Why Protection
Matters" and "Retirement Planning in Your 30s") have been removed. The array now contains only
the featured post. The plural array format is preserved for API consistency with consumers. No
card grid renders since the `remaining` slice is empty after the featured post is extracted.

**Export rename:**
- Current: `export const defaultPost: BlogPost = { ... };`
- New: `export const defaultPosts: BlogPost[] = [ ... ];`

**Post 1 (featured, sole element) - Changes 4, 5, 14:**

The sole element in the `defaultPosts` array is the featured "Gold, Oil, and Your Portfolio" post
with full Portable Text body content (19 blocks: 4 h2 subheadings + 15 normal paragraphs).

See requirements.md Changes 4, 5, 14 for full content details.

Keys use the pattern `gold-oil-{n}` for blocks and `gold-oil-span-{n}` for child spans.

---

### 2.3 `src/components/Blog.tsx` (Change 6)

Two changes required to consume the new plural export:

1. Import: `{ defaultPost }` becomes `{ defaultPosts }`
2. Fallback: `[defaultPost]` becomes `defaultPosts`

---

### 2.4 `src/app/blog/[slug]/page.tsx` (Changes 4, 6)

Two changes required to consume the new plural export and match the new featured post slug:

1. Import: `{ defaultPost }` becomes `{ defaultPosts }`
2. Slug check: single equality check becomes `defaultPosts.find((p) => p.slug.current === slug)`

This allows the placeholder post (gold-oil) to render on its detail page when Sanity is not
configured. The `.find()` pattern is retained (rather than a direct index check) so that future
posts added to the `defaultPosts` array will work without further code changes.

---

### 2.5 `src/components/BlogPostDetail.tsx` (Changes 12, 13)

- Change 12: Author title "Financial Advisor" becomes "Independent Wealth Manager"
- Change 13: CTA text becomes article-specific commodity/portfolio CTA

Design note: This CTA text is specific to the Gold/Oil article in the prototype. If future CMS
posts need custom CTA text, a `ctaText` field could be added to the `BlogPost` type.

---

### 2.6 `src/components/Footer.tsx` (Changes 7, 8, 9)

- Change 7: Tagline "Financial Advisor" becomes "Independent Wealth Manager"
- Change 8: Email display text becomes mixed case "Keanu@TheWealthRoom.com" (mailto href stays lowercase)
- Change 9: Copyright "All rights reserved." becomes "All Rights Reserved."

---

### 2.7 `src/app/layout.tsx` (Change 10)

Metadata title: "Keanu Le Roux | Financial Advisor" becomes "Keanu Le Roux | Independent Wealth Manager"

---

## 3. Data Model Changes

### 3.1 `defaultPost` to `defaultPosts` refactor

| Aspect | Before | After |
|--------|--------|-------|
| Export name | `defaultPost` | `defaultPosts` |
| Type | `BlogPost` (single object) | `BlogPost[]` (array of 1) |
| Consumers | `Blog.tsx`, `blog/[slug]/page.tsx` | Same two files (imports updated) |
| Featured post slug | `why-starting-early` | `gold-oil-and-your-portfolio` |
| Card posts | None (only 1 post existed) | None (single featured post only) |
| Featured post body | 1 placeholder paragraph | 19 Portable Text blocks (full article) |
| Featured post mainImage | `undefined` (no property) | Unsplash URL with alt text |

**Note:** The "Card posts" row was originally "2 additional card-only posts" but was reverted per
user decision to remove the "Understanding Risk: Why Protection Matters" and "Retirement Planning
in Your 30s" blog card posts. The `defaultPosts` array contains only the featured Gold/Oil post.

### 3.2 No type changes required

The `BlogPost` interface in `src/lib/types.ts` already supports `mainImage` as optional and `body`
as `PortableTextBlock[]`. No type modifications are needed.

### 3.3 No siteConfig changes required

The `contactInfo.email` value in `siteConfig.ts` remains lowercase. The mixed-case display text
in Change 8 is hardcoded in `Footer.tsx` only.

---

## 4. Implementation Notes

### 4.1 Priority order

Changes should be implemented in dependency order:

1. `defaultPost.ts` (Changes 4, 5, 14) - Must be done first since other files depend on the
   export name. Create the `defaultPosts` array with the featured post and its complete Portable
   Text body. (Change 6 card posts REVERTED - array contains only 1 post.)
2. `Blog.tsx` (Change 6) - Update import and fallback logic immediately after the data file change.
3. `blog/[slug]/page.tsx` (Change 6) - Update import and slug-matching logic. Same commit as 1-2.
4. `About.tsx` (Changes 1, 2, 3, 11) - Independent text changes.
5. `Footer.tsx` (Changes 7, 8, 9) - Independent text changes.
6. `BlogPostDetail.tsx` (Changes 12, 13) - Independent text changes.
7. `layout.tsx` (Change 10) - Independent metadata change.

Steps 4-7 are independent and can be done in any order or in parallel.

### 4.2 Dependency chain

defaultPost.ts (rename export + new content) is depended on by Blog.tsx and blog/[slug]/page.tsx.
About.tsx, Footer.tsx, BlogPostDetail.tsx, and layout.tsx are all independent.

### 4.3 Testing impact

- **Existing tests importing `defaultPost`:** Any test files that import `{ defaultPost }` from
  `@/data/defaultPost` will need their imports updated to `{ defaultPosts }` and adjusted to
  reference `defaultPosts[0]` (or the appropriate array element).

- **Snapshot/text-matching tests:** Tests that assert on specific text strings (e.g. "Financial
  Advisor", "Why Starting Early", the old bio text, the old CTA text) will need their expected
  values updated to match the new copy.

- **Slug-based tests:** Any tests that navigate to `/blog/why-starting-early` will need to use
  `/blog/gold-oil-and-your-portfolio` instead.

### 4.4 Design decisions

- **CTA text (Change 13):** The prototype CTA text is article-specific. Hardcoded for now. A
  future enhancement could add an optional `ctaText` field to the `BlogPost` type.

- **Email display (Change 8):** Mixed-case display text is hardcoded in `Footer.tsx` rather than
  adding a separate `emailDisplay` field to `siteConfig.ts`.

- **Portable Text `_key` values:** Keys use the `gold-oil-` descriptive prefix to aid debugging
  and test identification. They are stable strings (not random UUIDs) since this is static data.

- **Card posts removed (Change 6 REVERTED):** The two card posts ("Understanding Risk: Why
  Protection Matters" and "Retirement Planning in Your 30s") were removed per user decision. The
  `defaultPosts` array contains only the featured Gold/Oil post. Future blog card content will
  come from Sanity CMS when available. The plural array format is preserved for API consistency.
