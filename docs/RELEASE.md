# Implementation and release status

Checked 16 October 2026. `✓` means implemented in source, not that a live deployment has been validated.

| Phase                          | Status                    | Evidence / remaining gate                                                                                                                                                                              |
| ------------------------------ | ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1. Inspect and architecture    | ✓                         | Empty workspace inspected; architecture recorded in README                                                                                                                                             |
| 2. Provider evaluation         | ✓                         | Pricing, coverage and terms reviewed in `PROVIDERS.md`; commercial Google use needs clearance                                                                                                          |
| 3. Project and database        | Code complete; unverified | Prisma schema and SQL migration written; no PostgreSQL service available to apply it                                                                                                                   |
| 4. Authentication and security | Partial                   | Login, registration, revocable sessions, RBAC and rate limits implemented; email verification/reset absent                                                                                             |
| 5. Search and hours            | Partial                   | PostGIS search, timezone weekly hours and dated exceptions written; direct smoke checks passed; database integration remains                                                                           |
| 6. Providers                   | Partial                   | Leaflet/OpenStreetMap base map active with no key; Google Maps and Routes behind flags; optional Nominatim geocoding and OSM import; no contracted tile service or Google account                      |
| 7. Frontend                    | Partial                   | Responsive public pages, interactive OpenStreetMap map with markers and list fallback, city/map and optional address choice, place detail and three discovery translations; other copy remains English |
| 8. Owner/admin workflows       | Partial                   | Submission, claims, profile edits, dated hours, closure, admin-only verification, moderation, categories, roles and audit; formal workflow needs expansion                                             |
| 9. Tests and monitoring        | Partial                   | Vitest/Playwright test source, structured server error logging and health endpoint; suites not run; external monitoring service not connected                                                          |
| 10. Build/deploy               | Blocked                   | npm registry unavailable, no package install, no build, no live database or Google credentials; Docker/CI/docs written but not exercised                                                               |

## Controlled release gates

- [ ] Resolve npm access, install dependencies, create and commit `package-lock.json`, and pass `npm run typecheck`, `npm test`, and `npm run build`.
- [ ] Apply migration to PostGIS and run DB integration and Playwright journeys with real seeded records.
- [ ] Point `NEXT_PUBLIC_MAP_TILE_URL` at a self-hosted or contracted tile service with its required attribution; the public OpenStreetMap tile servers are a development default only.
- [ ] Validate Google contractual permission for directory use and OSM content overlays before enabling the Google flags, or keep the independent tile provider.
- [ ] If Google is enabled: restrict Google keys, configure billing/quotas, and test maps plus driving and walking routes in Qarshi.
- [ ] Establish trusted local business data and operating process for hours freshness and ownership verification.
- [ ] Schedule and monitor the retention maintenance job and confirm deletion periods with counsel.
- [ ] Complete email verification, reset flow, legal copy, retention jobs, and monitoring.
- [ ] Test backup restoration, rollback, mobile accessibility, three-language copy, and independent security review.
- [ ] Install Go 1.25+, generate `go.sum`, compile and test the incremental Go API, apply Go migrations on a disposable fresh PostGIS database, and compare its JSON contracts with the Next.js handlers before setting `GO_API_URL`.

The product must continue showing unavailable or unknown states until these gates are satisfied. No live API or deployment success is claimed.

Go migration progress: `internal/hours` contains a timezone-aware status engine and tests; `cmd/open24-api` contains health, categories, search, detail, and on-demand directions handlers; `cmd/open24-migrate` can apply the existing SQL files on a fresh database; `next.config.ts` can proxy only these migrated endpoints when `GO_API_URL` is set. None of this Go code has been compiled or executed here because the Go toolchain is absent. Authentication, favorites, owner/admin routes, and geocoding remain in Next.js. See `docs/GO.md`.

Local verification completed: 99 TypeScript and TSX files parsed without syntax diagnostics; the OSM import and maintenance scripts passed `node --check`; direct Node smoke checks passed for timezone and overnight hours, dated exceptions, daylight saving changes, stale hours, role decisions, the Google Routes adapter, and the Nominatim adapter with a mocked response. These checks do not replace the full typecheck, database tests, browser tests, or production build.

Additional product gaps: photo uploads, owner performance statistics, reviews, automatic duplicate resolution, route-time sorting, email verification and password reset, complete translations outside discovery, and an independently reviewed emergency-service designation. Address geocoding is implemented but unavailable without a configured operator-controlled service or local coverage validation.
