# Open24 redesign / Claude handoff

## Current objective

The user requested a complete frontend redesign based on
https://demo.codeandchill.store/dwella/ and removal of the previous interface.
This supersedes every earlier color-only instruction. The user authorized a
handoff to Claude if Codex could not finish within its limits.

Status: frontend redesign completed and verified by Codex. No transfer to
Claude was needed. This document preserves context for subsequent work.

## Implemented by Codex

- Replaced the entire global stylesheet with one editorial design system.
- Removed `design.css`, `liquid-glass.css`, `motion.css`, `colors.css` and
  `glass-motion.tsx`; no old glass/aurora styles remain imported.
- Rebuilt homepage, header/dropdown navigation, footer, about and business pages.
- Restyled search/maps, all shared forms, auth, contact, place details, account,
  business management and admin surfaces through shared component classes.
- New photo hero, angled category cards, category grid, step-by-step section,
  benefit selector, working radius selector, nearby map/results, business CTA,
  keyboard-accessible FAQ and closing image section.
- Added complete English, Uzbek and Russian copy in `src/lib/redesign-copy.ts`.
- Updated favicon, Apple touch icon and social preview to the new wordmark style.
- Added subtle progressive section entrance motion; reduced-motion and no-JS
  users keep readable content.
- New local generated photographs; provenance/prompts in `docs/ARTWORK.md`.
- `src/lib/search-options.ts` passes bounded radius and 24/7 URL values into
  explore/search/map. No database schemas or API contracts were changed.

## Verification and environment

- TypeScript and production compilation passed; 53 static generation steps.
- Unit tests: 27 passed, 6 skipped by existing environment requirements.
- Production Playwright: 15 passed, 2 skipped because E2E_PLACE_SLUG is not set.
  New tests cover URL filters, invalid radius, keyboard menu/FAQ, benefits,
  three languages and both themes at a narrow viewport.
- PostgreSQL at localhost:5432 is unavailable. Real authenticated CRUD and
  database-dependent place-detail tests require a populated database.
- The pre-existing development server on port 3000 has a stale worker error
  for a business API route. Its process belongs to another execution context;
  stopping it was denied. The same route passes the anonymous authorization
  test in the fresh production server on port 3100.
- Visual audit/screenshots are stored in `.tools/redesign/`.
- Final audit: six public routes in both themes returned HTTP 200, with no
  horizontal overflow or sampled text contrast failures. Minimum sampled
  contrast was 4.7:1 in light mode and 6.9:1 in dark mode. Three routes also
  passed overflow checks at 375px in both themes. This is a targeted visual
  check, not a full accessibility conformance audit.
- The final production browser suite passed again after entrance motion was
  added. Preview is running at http://localhost:3100.
- The generated designs are an independent adaptation, not the purchased
  Dwella template source. Exact upstream fonts/motion internals were not
  available; reference inspection used TinyFish's rendered browser.

## Files to start with

- `src/app/globals.css`: all theme tokens, layout, components and responsive rules.
- `src/app/page.tsx`: redesigned homepage.
- `src/components/site-header.tsx`, `site-footer.tsx`, `page-motion.tsx`.
- `src/lib/redesign-copy.ts`: new localized copy.
- `tests/e2e/redesign.spec.ts`: interaction regressions.

## Commands

- `npm run typecheck`
- `npm test`
- `node node_modules/next/dist/bin/next build`
- `node node_modules/next/dist/bin/next start -p 3100`
- Set REDESIGN_URL=http://localhost:3100, then
  `node node_modules/@playwright/test/cli.js test --config .tools/redesign/playwright.config.cjs`
- `node .tools/redesign/audit.cjs`

The npm build wrapper also runs Prisma generation, which can hit a Windows DLL
lock while another server is running. Direct Next build uses the generated
client already present.

## Recovery / scope

Original src and docs: `.tools/redesign/before-redesign.zip`.
Original artwork: `.tools/redesign/before-images.zip`.
No database or backend source was removed. Do not restore the old color layers
over this design. Do not infer a new task from older COLOR-HANDOFF notes.
