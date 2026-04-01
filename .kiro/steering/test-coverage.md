---
inclusion: auto
---

# Test Coverage Requirements

## Minimum Coverage Target: 80%

All production code in `src/` must maintain a minimum of 80% test coverage across:
- **Statements:** 80%
- **Branches:** 80%
- **Functions:** 80%
- **Lines:** 80%

## Coverage Rules

- Every new component must have corresponding unit tests
- Every property-based test must run a minimum of 100 iterations
- The QA engineer should verify coverage after each implementation task
- Coverage reports should be generated using `npx vitest --run --coverage`
- If coverage drops below 80%, the developer must add tests before proceeding to the next task

## Excluded from Coverage

- Configuration files (next.config.ts, tsconfig.json, etc.)
- Sanity Studio config files (sanity.config.ts, sanity.cli.ts)
- Static data files in `src/data/` (simple exports, no logic to test)
- Type definition files (src/lib/types.ts)
