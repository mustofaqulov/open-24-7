# Open24 Go API migration

The Go service is an **incremental backend migration**, not a replacement for the Next.js frontend. It currently serves health, categories, verified place search, verified place detail, and on-demand Google directions. Authentication, favorites, owner/admin operations, and geocoding still use the Next.js route handlers. The Go service reads the same PostgreSQL/PostGIS schema and calculates status in each business's IANA timezone.

## Requirements

- Go 1.25 or newer and access to Go modules. `github.com/jackc/pgx/v5` is pinned in `go.mod`.
- PostgreSQL with PostGIS and the migrations in `prisma/migrations`.
- `DATABASE_URL`, `APP_URL`, and a random `RATE_LIMIT_SECRET` of at least 32 characters in the Go process environment.
- Optional `GO_API_ADDR` (default `127.0.0.1:8080`). Keep the Go service on a private interface behind Next.js or a trusted reverse proxy.
- Directions additionally require `GOOGLE_ROUTES_SERVER_KEY`, `GOOGLE_ROUTES_ENABLED=true`, `GOOGLE_MAPS_TERMS_APPROVED=true`, and `NEXT_PUBLIC_GOOGLE_MAPS_APPROVED=true`; leave them disabled until the provider terms and keys are reviewed.

On a **fresh** database, run `go run ./cmd/open24-migrate` from the repository root. The command applies the SQL migrations transactionally, records checksums, and rejects an existing schema with no Go migration history. For a database already migrated with Prisma, use the existing Prisma migration workflow; the Go API can read the schema without a Go migration baseline. Do not run both migration systems on the same database without an explicit baseline process.

Go does not automatically read Next.js `.env` files. For a local PowerShell session, set process variables before running either command:

```powershell
$env:DATABASE_URL = "postgresql://open24:change-me@localhost:5432/open24?schema=public"
$env:APP_URL = "http://localhost:3000"
$env:RATE_LIMIT_SECRET = "replace-with-a-random-secret-of-at-least-32-characters"
go run ./cmd/open24-migrate
go run ./cmd/open24-api
```

The sample database URL matches the local Compose example only. Change credentials outside local development, and start PostGIS before running migrations.

Run `go mod tidy`, then `go test ./...`, `go vet ./...`, and `go run ./cmd/open24-api`. Set `GO_API_URL=http://127.0.0.1:8080` in the **Next.js** environment before starting development or building a production bundle to route the five migrated endpoints to Go. Leave `GO_API_URL` empty until the Go service and database are healthy. The other API endpoints continue to use Next.js. Search and route origins remain in POST bodies rather than URLs. Google Routes remains disabled until the existing API key and contractual approval flags are configured.

The Go API uses parameterized PostGIS queries, a 50 km radius limit, a 1,000-candidate cap, a database-backed search rate limit, and no-store responses. `RemoteAddr` supplies the rate-limit identity; behind a shared proxy this may group visitors together. Configure a trusted proxy strategy before production traffic. The service logs error types without logging query text, coordinates, or credentials.

## Current verification status

This environment has no `go` executable, PostgreSQL service, or permitted module download. No Go compilation, Go tests, migration, or live HTTP request has succeeded here. `go.sum` must be generated with `go mod tidy` and committed before reproducible deployment. The Go handlers and Next.js rewrites also need integration tests against a migrated PostGIS database before switching production traffic.
