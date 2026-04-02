# Task 1: Project Scaffolding

**Status:** Completed
**Date:** 2026-04-01

## Summary

Initialized the Next.js 15 project with all required tooling and Docker development environment.

## Completed Steps

1. **Created Next.js project** — `create-next-app@latest` with TypeScript, Tailwind CSS, ESLint, App Router, `src/` directory
2. **Installed core dependencies** — prisma, @prisma/client, next-auth@beta, bcryptjs
3. **Installed dev dependencies** — jest, ts-jest, @testing-library/react, @testing-library/jest-dom, jest-environment-jsdom, ts-node, @types/jest, @types/bcryptjs
4. **Created `.env.example`** — Database URL and NextAuth config template
5. **Created `.env`** — Development environment with Docker service name (`db`) as PostgreSQL host
6. **Configured Jest** — `jest.config.ts` using `next/jest.js` (Next.js 16 compatible), jsdom test environment
7. **Created Docker dev environment**:
   - `Dockerfile` — Node 20 Alpine, dev mode
   - `docker-compose.yml` — PostgreSQL 16 + Next.js app with volume mounts for hot reload

## Verification

- `npm test -- --passWithNoTests` — Jest runs successfully (exit code 0)
- `.env` confirmed in `.gitignore`

## Issues Encountered

- **Jest config import path**: Next.js 16 requires `next/jest.js` instead of `next/jest`. Fixed by referencing `node_modules/next/dist/docs/` documentation.
- **Missing ts-node**: Jest config parsing requires `ts-node` as dev dependency. Added to install list.
- **Linter auto-cleanup**: package.json was auto-cleaned by linter removing some dependencies. Re-installed affected packages.

## Files Created/Modified

- `package.json` — project config with test scripts
- `next.config.ts` — Next.js config
- `tsconfig.json` — TypeScript config
- `tailwind.config.ts` — Tailwind config (via postcss.config.mjs)
- `jest.config.ts` — Jest config
- `.env.example` — Environment template
- `.env` — Development environment (gitignored)
- `Dockerfile` — Development Docker image
- `docker-compose.yml` — PostgreSQL + App services
- `src/app/layout.tsx` — Root layout (default)
- `src/app/page.tsx` — Homepage (default)
- `src/app/globals.css` — Global styles (default)
