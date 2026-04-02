# Task 19: Admin Article Management

**Status:** Completed
**Date:** 2026-04-02

## Summary

Built admin article management with list page (filtering by status), article editor form (create/edit/delete), and tag selection.

## Completed Steps

1. **Article list page** — `src/app/admin/articles/page.tsx` with status filters (all/draft/published), pagination, type/status badges, and edit links
2. **Article form component** — `src/components/admin/article-form.tsx` with title, summary, type/status/category selects, difficulty and topic tag toggles, Markdown textarea
3. **Article editor page** — `src/app/admin/articles/[id]/page.tsx` handles both "new" (create) and existing article (edit) via dynamic route
4. **TypeScript check** — 0 errors in new files
5. **Browser verification** — verified by user

## Key Design Decisions

- Dynamic route `[id]` handles both create (`id === "new"`) and edit modes in a single page
- Article form is a client component for controlled inputs; list and editor pages are server components
- Prisma types imported from `@/generated/prisma/client` (custom output path in this project)
- Type and status selects use type assertions (`as "NOTE" | "INTERVIEW"`) to satisfy strict TypeScript enums
- Tags split into difficulty and topic groups for clear UI separation
- Delete requires `confirm()` dialog before executing

## Issues Fixed

- Prisma type import path: changed from `@prisma/client` to `@/generated/prisma/client` to match project's custom generator output
- Select onChange type mismatch: added type assertions for enum state setters

## Files Modified

- `src/app/admin/articles/page.tsx` — Article list management page (new)
- `src/app/admin/articles/[id]/page.tsx` — Article create/edit page (new)
- `src/components/admin/article-form.tsx` — Article form component (new)
