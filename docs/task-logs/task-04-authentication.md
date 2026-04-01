# Task 4: Authentication (NextAuth.js v5)

**Status:** Completed
**Date:** 2026-04-01

## Summary

Configured NextAuth.js v5 (beta.30) with Credentials provider for email/password login. Added shared types, auth utilities, and JWT/session callbacks for role-based access.

## Completed Steps

1. **Auth test** — `__tests__/api/auth.test.ts` with bcryptjs hash/compare tests (2 passing)
2. **Shared types** — `src/types/index.ts` with ArticleWithRelations, CategoryWithChildren, CommentWithUser
3. **NextAuth config** — `src/lib/auth.ts` with Credentials provider, JWT/session callbacks carrying user id and role
4. **Auth utilities** — `src/lib/auth-utils.ts` with getSession, requireAuth, requireAdmin helpers
5. **Route handler** — `src/app/api/auth/[...nextauth]/route.ts` exposing GET/POST handlers
6. **Type augmentation** — `src/types/next-auth.d.ts` extending Session type with id and role

## Prisma 7 Adaptation

- Import path: `@/generated/prisma/client` (not `@/generated/prisma` — no index file in generated output)
- This fix also applied to `src/lib/prisma.ts` from Task 2

## Verification

- TypeScript: `npx tsc --noEmit` — 0 errors
- Tests: 2/2 passing

## Files Created/Modified

- `__tests__/api/auth.test.ts` — Auth test (new)
- `src/lib/auth.ts` — NextAuth configuration (new)
- `src/lib/auth-utils.ts` — Auth utility functions (new)
- `src/app/api/auth/[...nextauth]/route.ts` — NextAuth route handler (new)
- `src/types/index.ts` — Shared TypeScript types (new)
- `src/types/next-auth.d.ts` — NextAuth type augmentation (new)
- `src/lib/prisma.ts` — Fixed import path to `@/generated/prisma/client`
