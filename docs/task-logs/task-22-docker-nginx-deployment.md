# Task 22: Docker & Nginx Deployment

**Status:** Completed
**Date:** 2026-04-02

## Summary

Configured Docker and Nginx deployment for both development and production environments. Fixed dev compose to use correct Dockerfile, added standalone output for production builds, and created Nginx reverse proxy configuration.

## Completed Steps

1. **next.config.ts** — Added `output: "standalone"` for Docker production build
2. **docker-compose.dev.yml fix** — Changed `dockerfile: Dockerfile` to `dockerfile: Dockerfile.dev` so dev environment uses the correct development image
3. **Production docker-compose.yml** — Created with three services: `db` (PostgreSQL 16), `app` (Next.js standalone), `nginx` (reverse proxy)
4. **nginx.conf** — Created Nginx reverse proxy config with `proxy_pass http://app:3000` (using Docker service name instead of localhost)
5. **.dockerignore** — Updated to exclude `__tests__`, `docs`, `.env`, `.superpowers`, `*.md`
6. **TypeScript check** — 0 errors
7. **Docker rebuild & verify** — Rebuilt dev containers with updated config, Next.js 16.2.2 started successfully
8. **Browser verification** — Verified by user

## Key Design Decisions

- Production compose includes Nginx as a separate service, proxying to the `app` container via Docker internal network (`http://app:3000`)
- Dev compose uses `Dockerfile.dev` (simple single-stage with `npm run dev`) while production uses multi-stage `Dockerfile` (with standalone output)
- `.dockerignore` excludes test files and docs to keep production image lean

## Files Modified

- `next.config.ts` — Added `output: "standalone"` (modified)
- `docker-compose.dev.yml` — Fixed dockerfile reference to `Dockerfile.dev` (modified)
- `docker-compose.yml` — Production compose with app + db + nginx (new)
- `nginx.conf` — Nginx reverse proxy configuration (new)
- `.dockerignore` — Added exclusions for tests, docs, etc. (modified)
