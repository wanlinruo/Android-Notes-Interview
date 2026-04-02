# Task 21: Admin Content Import Page

**Status:** Completed
**Date:** 2026-04-02

## Summary

Built admin content import page with URL extraction preview and save-as-draft functionality. Also fixed a critical slug generation bug that caused Chinese-slug articles to 404.

## Completed Steps

1. **Import form component** — `src/components/admin/import-form.tsx` with URL input, preview, title/type/category/tag editing, Markdown content preview, save as draft
2. **Import page** — `src/app/admin/import/page.tsx` server component loading categories and tags
3. **Import API bugfix** — Fixed `request.json()` called twice in save action (body stream already consumed)
4. **Slug generation bugfix** — Removed Chinese character retention from slug generation in both article and import APIs
5. **Article update slug regeneration** — PUT API now regenerates slug when title changes
6. **Article detail decodeURIComponent** — Added URL decoding for slug param in detail page
7. **Database migration** — Fixed existing Chinese-slug articles via one-time script
8. **TypeScript check** — 0 errors in new files
9. **Browser verification** — verified by user

## Key Design Decisions

- Import form is a client component with two-phase workflow: preview (extract + edit) then save as draft
- Preview calls `/api/import` with `action: "preview"`, save calls with `action: "save"`
- Slug generation now only keeps `a-z0-9`, replacing everything else with hyphens — ensures compatibility with Next.js 16 Turbopack routing

## Issues Fixed

- **`request.json()` double-read**: Import API save action called `request.json()` a second time after it was already consumed — fixed by reading body once into a variable
- **Chinese slug 404**: Next.js 16 Turbopack dynamic routes don't match URL-encoded Chinese characters — slug generation now strips all non-ASCII characters, using timestamp suffix for uniqueness
- **Existing data**: Ran one-time fix script to update Chinese slugs in database

## Files Modified

- `src/components/admin/import-form.tsx` — Import form component (new)
- `src/app/admin/import/page.tsx` — Import page (new)
- `src/app/api/import/route.ts` — Fixed double request.json() and slug generation (modified)
- `src/app/api/articles/route.ts` — Fixed slug generation to remove Chinese chars (modified)
- `src/app/api/articles/[id]/route.ts` — Added slug regeneration on title change (modified)
- `src/app/articles/[slug]/page.tsx` — Added decodeURIComponent for slug param (modified)
