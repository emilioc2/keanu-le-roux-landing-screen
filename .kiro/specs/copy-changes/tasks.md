<!-- 
  Implementation Plan for the copy-changes spec.
  
  Dependency order: defaultPost.ts refactor must land first (tasks 1-3) since
  the export rename breaks Blog.tsx and blog/[slug]/page.tsx imports.
  Tasks 5-8 are independent text changes with no cross-dependencies.
  Task 9 updates test assertions to match the new copy.
  
  Agent assignments:
    @developer  — all code changes (tasks 1-8)
    @qa-engineer — test assertion updates (task 9)
  
  Test runner: ./node_modules/.bin/vitest --run
-->

# Implementation Plan: Copy Changes (Prototype-to-Production Alignment)

## Overview

<!-- 
  Apply 14 text/copy changes identified in requirements.md to align the 
  production Next.js site with the approved prototype. The defaultPost.ts 
  refactor (singular → plural export) is the critical path — it must land 
  first since Blog.tsx and blog/[slug]/page.tsx depend on the export name.
-->
Apply 14 text/copy changes to align the production Next.js site with the approved prototype. The `defaultPost.ts` refactor (singular → plural export) must land first since it breaks imports in `Blog.tsx` and `blog/[slug]/page.tsx`. Independent text changes follow in any order. Test assertions are updated last.

## Tasks

<!-- Task 1: Core data refactor — must be completed before tasks 2 and 3 -->
- [x] 1. Refactor `defaultPost.ts` — data model + content (Changes 4, 5, 6, 14)
  - @developer
  - [x] 1.1 Replace the singular `defaultPost` export with a `defaultPosts` array export containing three `BlogPost` objects
    - Post 1 (featured): "Gold, Oil, & Your Portfolio" with `_id: 'placeholder-gold-oil'`, slug `gold-oil-and-your-portfolio`, date `2026-04-09T00:00:00Z`, full excerpt, `mainImage` with Unsplash URL and alt text
    - Post 2 (card): "Understanding Risk: Why Protection Matters" with `_id: 'placeholder-risk-protection'`, slug `understanding-risk-why-protection-matters`, date `2026-03-12T00:00:00Z`, excerpt, `mainImage` with Unsplash URL and alt text, minimal "coming soon" body
    - Post 3 (card): "Retirement Planning in Your 30s" with `_id: 'placeholder-retirement-30s'`, slug `retirement-planning-in-your-30s`, date `2026-02-28T00:00:00Z`, excerpt, `mainImage` with Unsplash URL and alt text, minimal "coming soon" body
    - _Requirements: 4, 5, 6_
  - [x] 1.2 Replace the featured post body with 19 Portable Text blocks (4 `h2` subheadings + 15 `normal` paragraphs) matching the full "Gold, Oil, & Your Portfolio" article from the prototype
    - Use `_key` pattern `gold-oil-{n}` for blocks and `gold-oil-span-{n}` for child spans
    - See design doc Section 2.2 for exact block sequence
    - _Requirements: 14_

<!-- Tasks 2-3: Import updates — must land in the same commit as task 1 -->
- [x] 2. Update `Blog.tsx` import and fallback (Change 6)
  - @developer
  - Change import from `{ defaultPost }` to `{ defaultPosts }` from `@/data/defaultPost`
  - Change fallback logic from `[defaultPost]` to `defaultPosts`
  - _Requirements: 6_

- [x] 3. Update `blog/[slug]/page.tsx` import and slug matching (Change 6)
  - @developer
  - Change import from `{ defaultPost }` to `{ defaultPosts }` from `@/data/defaultPost`
  - Replace single-slug equality check with `defaultPosts.find((p) => p.slug.current === slug)` to support all three placeholder post slugs
  - _Requirements: 6_

- [x] 4. Checkpoint — Verify data refactor
  - Ensure all tests pass (`./node_modules/.bin/vitest --run`), ask the user if questions arise.

<!-- Tasks 5-8: Independent text changes — no cross-dependencies, any order -->
- [x] 5. Update `About.tsx` copy (Changes 1, 2, 3, 11)
  - @developer
  - [x] 5.1 Replace the 2 bio paragraphs with 4 new paragraphs (Independent Wealth Manager positioning, FSP licensing, fiduciary duty language)
    - _Requirements: 1_
  - [x] 5.2 Replace "My approach" accordion content (2 paragraphs → 3 paragraphs with behavioural coaching, Advisor's Alpha framework, 1.5% net returns)
    - _Requirements: 2_
  - [x] 5.3 Replace "Qualifications & experience" accordion content (1 paragraph → 3 paragraphs with specific degrees, RE5/CFP® certs, career history)
    - _Requirements: 3_
  - [x] 5.4 Update portrait alt text from `"Keanu Le Roux — Financial Advisor"` to `"Keanu Le Roux, Independent Wealth Manager"`
    - _Requirements: 11_

- [x] 6. Update `Footer.tsx` copy (Changes 7, 8, 9)
  - @developer
  - [x] 6.1 Change tagline from "Financial Advisor" to "Independent Wealth Manager"
    - _Requirements: 7_
  - [x] 6.2 Change email display text to mixed-case `Keanu@TheWealthRoom.com` (keep `mailto:` href lowercase)
    - _Requirements: 8_
  - [x] 6.3 Change copyright casing from "All rights reserved." to "All Rights Reserved."
    - _Requirements: 9_

- [x] 7. Update `BlogPostDetail.tsx` copy (Changes 12, 13)
  - @developer
  - [x] 7.1 Change author title from "Financial Advisor" to "Independent Wealth Manager"
    - _Requirements: 12_
  - [x] 7.2 Change CTA paragraph text to "Want to discuss how commodity movements affect your portfolio? I'd love to help you navigate these markets."
    - Note: BUG-227 — this CTA is article-specific, acknowledged as tech debt for CMS posts
    - _Requirements: 13_

- [x] 8. Update `layout.tsx` metadata title (Change 10)
  - @developer
  - Change `title` from `'Keanu Le Roux | Financial Advisor'` to `'Keanu Le Roux | Independent Wealth Manager'`
  - _Requirements: 10_

<!-- Task 9: Test assertion updates — after all code changes are in place -->
- [x] 9. Update test assertions for affected test files
  - @qa-engineer
  - [x] 9.1 Update `Blog.unit.test.tsx` — change the placeholder post assertion from `/Why Starting Early Is the Best Financial Decision/` to match the new "Gold, Oil, & Your Portfolio" title
    - _Requirements: 4, 6_
  - [x] 9.2 Update `BlogPostDetail.unit.test.tsx` — change the author title assertion from `'Financial Advisor'` to `'Independent Wealth Manager'`
    - _Requirements: 12_

- [x] 10. Final checkpoint — Ensure all tests pass
  - Ensure all tests pass (`./node_modules/.bin/vitest --run`), ask the user if questions arise.

## Notes

<!-- Key implementation constraints and context for agents executing these tasks -->
- Tasks 1–3 must be implemented together (same commit) to avoid broken imports from the `defaultPost` → `defaultPosts` rename
- Tasks 5–8 are independent of each other and can be done in any order
- The `BlogPost` interface in `src/lib/types.ts` already supports `mainImage` and `body` — no type changes needed
- The `contactInfo.email` value in `siteConfig.ts` stays lowercase — only the Footer display text changes
