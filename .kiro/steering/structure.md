# Project Structure

```
/
├── .kiro/
│   ├── agents/          # Custom agent definitions (QA engineer, analyst)
│   ├── specs/           # Feature specs (requirements, design, tasks)
│   │   └── keanu-financial-advisor-website/
│   └── steering/        # Steering rules (this file and others)
│
├── prototype/           # Static HTML/CSS/JS reference prototype
│   ├── index.html       # Main landing page (all sections)
│   ├── blog-post.html   # Blog post detail page
│   ├── styles.css       # All styles (design system + components)
│   ├── script.js        # Vanilla JS (navbar, accordion, form, scroll reveal)
│   ├── favicon.svg      # "KL" initials on navy background
│   ├── keanu.jpg        # Professional headshot
│   └── hero_video.mp4   # Hero background video
│
├── source/              # Business requirements and screen specs
│   ├── keanu-landing-page-brs.md    # Business Requirements Specification
│   ├── screen-requirements.md       # Detailed screen-level requirements
│   └── Keanu Landing Page BRS.docx  # Original BRS document
│
└── quality-assurance/   # QA artifacts
    ├── bugs.csv         # Bug tracker (implementation bugs, spec bugs, gaps)
    └── test-cases.md    # Test case definitions mapped to requirements
```

## Key Conventions

- `prototype/` is the source of truth for visual design and layout. Match it exactly unless requirements say otherwise.
- `source/` documents are reference-only — do not modify them.
- Specs live under `.kiro/specs/{feature-name}/` with `requirements.md`, `design.md`, and `tasks.md`.
- QA bugs reference requirement IDs (e.g., "Req 5 AC 3") and include severity levels.
- Screen requirements reference prototype files using `#[[file:...]]` syntax.

## Open Bugs to Be Aware Of
Several prototype bugs are tracked in `quality-assurance/bugs.csv`. Notable open issues:
- BUG-001: Scroll reveal targets wrong CSS class for feed cards
- BUG-006: Contact form has no backend/email integration
- BUG-007/033: No `<main>` landmark element on either page
- BUG-008/019: No focus styles on buttons, links, or accordion headers
- BUG-025: No CSRF/spam protection on contact form
- BUG-027/028: Missing defer attribute and lazy loading
- BUG-029/035: Hero video has no fallback image or aria-label
