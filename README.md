# Open24

**Your World, Always Open.** A Next.js application for finding reviewed local businesses near a chosen location. The initial market is Qarshi, Uzbekistan. The site supports English, Uzbek, and Russian interface text for its discovery flow.

## Current release status

This is a working implementation candidate, **not an approved production release**. The source code has been created and the opening-hours engine has passed direct smoke checks. Package installation, full TypeScript checking, database migration, browser testing, and live Google API calls could not be completed in the supplied environment because npm registry access and PostgreSQL were unavailable. See [release status](docs/RELEASE.md) for exact gates and missing features.

An incremental [Go API migration](docs/GO.md) now contains the hours engine and the health, categories, place search, and place detail endpoints. It has not been compiled or run because Go is not installed in this environment. The existing Next.js route handlers remain active unless `GO_API_URL` is configured.

## Architecture

| Layer               | Implementation                                                                                                                                              |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Web and API         | Next.js 16.3.7 App Router, React 19.3.0, TypeScript 5.9.3, Tailwind CSS 4.3.3                                                                               |
| Data                | PostgreSQL 16 with PostGIS and Prisma 5.20.0; SQL migration in `prisma/migrations`                                                                          |
| Auth                | Email and bcrypt password, random server-side session token stored as a SHA-256 digest, HTTP-only cookie, database role and ownership checks                |
| Search              | Parameterized PostGIS `ST_DWithin`/`ST_Distance` over reviewed local records, radius limit 50 km, paginated response; free text also matches category names |
| Hours               | Timezone-aware weekly schedules and date-specific exceptions; unknown for incomplete, stale, or unverified hours                                            |
| Maps and directions | Leaflet with OpenStreetMap raster tiles by default and no key; Google Maps JavaScript API and Google Routes only after keys and terms approval              |
| Business records    | Owner submissions and optional OSM import to a moderation queue; no invented listings                                                                       |

The interactive map is served by Leaflet over raster tiles. Without configuration it uses the public OpenStreetMap tile servers, which are rate limited by the [OSM tile usage policy](https://operations.osmfoundation.org/policies/tiles/) and are suitable for development only. Set `NEXT_PUBLIC_MAP_TILE_URL` and `NEXT_PUBLIC_MAP_TILE_ATTRIBUTION` to your own or a contracted tile service before public traffic, and keep the attribution that service requires. Markers, the drawn route, and the tile layer follow the active light or dark theme.

Google Places, Google Geocoding, Google Time Zone, and Google Matrix services are not enabled. Map clicks and manually selected city centres work without geocoding. Street address search can use a separately operated Nominatim endpoint through `NOMINATIM_BASE_URL`; no endpoint is configured by default. Local address coverage remains unverified. See [provider decision](docs/PROVIDERS.md).

Categories cover services and shops: pharmacies, restaurants, cafes, bakeries, fuel, ATMs, medical services, hotels and car repair, plus supermarkets, bazaars, convenience and grocery stores, greengrocers, butchers, clothing, electronics, mobile phone, hardware, furniture, cosmetics and stationery shops. Category translations have a separate database table keyed by locale, so adding a category language does not require a schema migration. The initial interface resources cover Uzbek, English, and Russian; a new interface language still needs translated UI copy.

## Local setup

Prerequisites: Node.js 24, npm, Docker with Compose (or PostgreSQL 16 with PostGIS), and a working npm registry connection.

1. Copy `.env.example` to `.env`. Change the database password in both `.env` and `compose.yaml` for any environment beyond local development. Set a long random `RATE_LIMIT_SECRET` for production; the app refuses rate-limited operations without it. Leave Google settings disabled until their terms have been reviewed.
2. Run `docker compose up -d db` to start PostGIS.
3. Run `npm install` and `npm run db:generate`.
4. Run `npm run db:migrate` to apply both SQL migrations and seed category names.
5. Run `npm run dev` and open `http://localhost:3000`.

The database starts without fabricated businesses. Register, submit a business, then review it with an administrator. To bootstrap the first administrator, create a normal account and, in a restricted DBA session, run `UPDATE users SET role='ADMIN' WHERE email='your-admin-email@example.com';`. Do not expose public admin registration. Review moderator and business claims before approval.

The optional OSM importer requires an operator-controlled or contracted Overpass endpoint in `OVERPASS_URL`. Run `npm run data:import:qarshi` once after applying migrations. It imports only records with a name, recognized category, street, and coordinates. Every imported record is pending moderation with unverified hours. Review ODbL obligations before using this importer commercially.

For address search, set `NOMINATIM_BASE_URL` to a self-hosted or contracted HTTPS Nominatim service after validating its coverage and license. Do not point it at the shared public OSM Nominatim server. The search is optional; city choice and map selection work without it.

Run `npm run maintenance` daily from a trusted scheduler. In a container that receives environment variables directly, run `node scripts/maintenance.cjs`. This removes expired sessions, old rate-limit buckets, contact messages after 90 days, and resolved reports and audit rows after 365 days. Alert on job failure.

## Google configuration

Google is optional. The OpenStreetMap base map already covers markers, manual point selection, and the list without any key; the steps below apply only when the operator chooses Google. After commercial and licensing review, create a Google Cloud project with billing. Enable **Maps JavaScript API** for a browser key restricted to your exact HTTPS domains and **Routes API** for a separate server key restricted to that API and your server IPs or an appropriate Google credential mechanism. Configure quotas, usage alerts, and budgets. Set `NEXT_PUBLIC_GOOGLE_MAPS_BROWSER_KEY`, `GOOGLE_ROUTES_SERVER_KEY`, `NEXT_PUBLIC_GOOGLE_MAPS_APPROVED=true`, `GOOGLE_MAPS_TERMS_APPROVED=true`, and `GOOGLE_ROUTES_ENABLED=true`. Keys must not be committed. The browser key is intentionally public and relies on referrer and API restrictions; the Routes key must remain server side.

The Google map loads only when visible. Routes are requested only when the visitor clicks **Calculate route**. Route responses are not persisted or cached. The list and external Google Maps links remain usable when integration is unavailable.

## Tests and build

```text
npm run typecheck
npm test
TEST_DATABASE_URL=postgresql://... npm test -- search.integration.test.ts
npx playwright install chromium
npm run test:e2e
npm run build
```

On Windows PowerShell, use `npm.cmd` if the PowerShell execution policy blocks `npm.ps1`. The integration suite requires a separate migrated test database. The Playwright suite requires a running application and database. Run `npm run db:migrate` before an integration or end-to-end run.

## Deployment

The included `Dockerfile` and `compose.yaml` support container builds and local PostgreSQL. A production deployment should use a managed PostgreSQL service with PostGIS, HTTPS at the ingress, a private `DATABASE_URL`, automated `npm run db:migrate` before promoting a new app version, and daily encrypted database backups with tested restoration. The health endpoint `/api/v1/health` reports only availability. Deploy the app on a Node.js compatible host; set `APP_URL` to the exact HTTPS origin. Route traffic through a proxy that strips untrusted `X-Forwarded-For` headers and preserves the correct `Host` and `Origin` headers.

The GitHub Actions workflow performs type, unit, and build checks. It does not deploy automatically. Keep the prior application image and a restorable database backup for rollback; database migrations must be reviewed for backward compatibility before deployment. Read the [security checklist](docs/SECURITY.md), [API contracts](docs/API.md), [ownership workflow](docs/OWNERSHIP.md), and [release checklist](docs/RELEASE.md) before launch.

## Repository layout

```text
src/app/                 Public pages, protected pages, versioned API routes
src/components/          Map, localization, site layout, cards and forms
src/components/map/      OpenStreetMap and Google map implementations
src/lib/                 Auth, database, hours, search, providers, validation
prisma/                  Prisma schema and SQL migration
scripts/import-osm.cjs   Optional reviewed OSM data import
tests/                   Unit, database integration and Playwright tests
docs/                    API, provider, security and release documentation
```
