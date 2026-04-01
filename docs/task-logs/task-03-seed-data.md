# Task 3: Seed Data

**Status:** Completed
**Date:** 2026-04-01

## Summary

Created seed script with admin user, tags (difficulty + topic), and categories (with subcategories). Adapted for Prisma 7's driver adapter requirement.

## Completed Steps

1. **Installed tsx** — Used as TypeScript runner for seed script (simpler than ts-node for ESM)
2. **Installed @prisma/adapter-pg + pg** — Prisma 7 requires a driver adapter (no built-in database connection)
3. **Configured seed in prisma.config.ts** — Prisma 7 uses `migrations.seed` in config (not `prisma` key in package.json)
4. **Wrote seed script** — `prisma/seed.ts` with upsert for idempotent seeding
5. **Updated src/lib/prisma.ts** — Added PrismaPg adapter for consistency with Prisma 7
6. **Ran seed** — `npx prisma db seed` executed successfully

## Prisma 7 Adaptations

- **Driver adapter required**: `new PrismaClient()` no longer works alone; must pass `{ adapter: new PrismaPg({ connectionString }) }`
- **Seed config location**: `prisma.config.ts` → `migrations.seed` field (not `package.json` → `prisma.seed`)
- **Import path**: `../src/generated/prisma/client.js` (relative from `prisma/` dir, explicit client.js entry point)

## Seed Data

| Type | Count | Details |
|------|-------|---------|
| User | 1 | admin@androidhub.com (ADMIN role) |
| Tags (DIFFICULTY) | 3 | beginner, intermediate, advanced |
| Tags (TOPIC) | 3 | interview-hot, source-code, best-practice |
| Categories (top-level) | 8 | four-components, jetpack, performance, networking, ui-custom-view, design-patterns, kotlin, java-basics |
| Categories (sub) | 4 | activity, service, broadcast-receiver, content-provider (under four-components) |

## Files Created/Modified

- `prisma/seed.ts` — Seed script (new)
- `prisma.config.ts` — Added `migrations.seed` config
- `src/lib/prisma.ts` — Updated to use PrismaPg adapter
- `package.json` — Added tsx, @prisma/adapter-pg, pg, @types/pg
