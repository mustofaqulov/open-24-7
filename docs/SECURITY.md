# Security and operations checklist

## Implemented

- Server side Zod validation, parameterized Prisma queries, and database constraints for key fields.
- HTTP-only, same-site session cookie; random token stored only as a SHA-256 digest; server-side expiration and revocation.
- bcrypt password hashing; origin checks on state changing routes; role and verified ownership checks on protected routes.
- Database-backed IP bucket rate limits for login, registration, search, route and address geocoding calls, reports, contact messages, and business submissions.
- Basic CSP, frame protection, MIME sniffing protection, referrer policy, and restricted geolocation permission policy.
- No route cache, no exact position history table, no provider keys in API responses or structured error logs.
- Audit rows for business editing, weekly and date-specific hours changes, category changes, role changes, moderation, and account deletion.

## Required before production

- Run the build, typecheck, unit, integration, and browser suites with a real PostGIS instance. Obtain independent security and accessibility review.
- Configure HTTPS, HSTS at the reverse proxy, secure secret storage, browser key restrictions, server API key restrictions, Google quotas and budget alerts.
- Replace the initial CSP allowances for inline scripts and evaluation with a tested nonce-based policy where compatible with the selected map integration.
- Ensure the trusted ingress overwrites `X-Forwarded-For`, `Host`, and `Origin`; otherwise rate limiting and origin checks may be spoofed.
- Add verified email ownership, password reset, session device management, and an abuse response process. Current email/password registration does **not** verify the email address.
- Review Uzbek privacy and consumer requirements with local counsel, finish the privacy policy and terms, set contact message/report/audit retention, and implement scheduled deletion.
- Back up PostgreSQL at least daily, encrypt backups, test restoration, and keep a rollback image. Review migrations for backward compatibility.
- Configure error monitoring and alerts for route failures, 5xx rates, slow geospatial queries, and database availability. `/api/v1/health` intentionally exposes no operational details.
- Schedule `scripts/maintenance.cjs` daily, alert on failures, verify the documented retention periods, and rotate credentials.
- Review OSM ODbL and Google Maps directory terms before enabling those integrations commercially.
- Use only a trusted self-hosted or contracted Nominatim endpoint for address search; review its privacy notice, limits, and data license.

## Residual risks

The app has not passed an independent penetration test. The simple IP rate limiter can penalize users behind a shared NAT and depends on a trusted proxy. Login has no email verification or reset workflow. Listing and claim approval depend on human review; a moderator can make a mistaken approval. The generic contact form stores email and messages until the retention job is scheduled. `nextTransition` uses minute-level calculation over eight days and can only account for holidays that owners or moderators enter as dated exceptions.
