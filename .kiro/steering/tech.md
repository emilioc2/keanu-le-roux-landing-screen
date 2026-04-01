# Tech Stack & Build

## Current State: Static Prototype
The `prototype/` folder contains a working static HTML/CSS/JS prototype that serves as the reference implementation.

- HTML5 with semantic markup
- Vanilla CSS (no preprocessor, no framework)
- Vanilla JavaScript (no framework, no bundler)
- No package.json, no build step, no dependencies

## Planned Production Stack
Based on the spec and existing steering, the production site targets:

- **Framework:** Next.js (App Router)
- **Language:** TypeScript
- **CMS:** Sanity CMS (headless, blog posts only)
- **Styling:** CSS (design system with CSS custom properties)
- **Fonts:** Google Fonts — Playfair Display (headings) + Inter (body)
- **Hosting:** TBD (likely Vercel)

## Design System Tokens
```
--navy: #1a2456
--navy-dark: #111b42
--navy-light: #2a3570
--steel-blue: #7a9bb5 (hero primary CTA)
--accent: #5a70a0 (hover states)
--white: #ffffff
--off-white: #f9f9f9
--font-heading: 'Playfair Display', Georgia, serif
--font-body: 'Inter', -apple-system, sans-serif
--max-width: 1100px
```

## Button Conventions
- All general buttons: pill-shaped (border-radius: 40px), outlined navy border, fill navy on hover
- Hero primary CTA: solid steel blue fill, white text
- Hero secondary CTA: white outlined, transparent fill
- Submit button: full-width pill
- Newsletter button: white outlined on navy background

## Form Styling
- Bottom-border-only inputs (no box borders)
- Labels above inputs with required/optional indicators

## Common Commands
No build system exists yet. To preview the prototype:
```bash
# Serve the prototype locally
npx serve prototype
# or
python3 -m http.server 8000 --directory prototype
```

## Key Libraries (Planned)
- `next` — React framework
- `@sanity/client` — Sanity CMS client
- `next-sanity` — Sanity + Next.js integration
