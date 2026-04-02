# Task 8: Favorite, Progress & Comment APIs

**Status:** Completed
**Date:** 2026-04-02

## Summary

Created APIs for user favorites (toggle), reading progress (upsert), and comments (list/create/admin-delete).

## Completed Steps

1. **Favorite API** — `src/app/api/favorites/route.ts` with GET (check single or list all) and POST (toggle)
2. **Progress API** — `src/app/api/progress/route.ts` with GET (check single or list all) and POST (upsert)
3. **Comment API** — `src/app/api/comments/route.ts` with GET (by articleId) and POST (create)
4. **Comment Delete API** — `src/app/api/comments/[id]/route.ts` with DELETE (admin-only)
5. **TypeScript check** — 0 errors

## Key Design Decisions

- Favorite POST toggles: if already favorited, removes it; otherwise creates it
- Progress uses upsert to create or update reading status
- Comment GET is public (no auth required), POST requires auth
- Comment DELETE is admin-only
- All user-specific APIs use `session.user.id` from requireAuth()

## Verification

- TypeScript: 0 errors

## Files Created

- `src/app/api/favorites/route.ts` — Favorite toggle API (new)
- `src/app/api/progress/route.ts` — Reading progress API (new)
- `src/app/api/comments/route.ts` — Comment list & create API (new)
- `src/app/api/comments/[id]/route.ts` — Comment delete API (new)
