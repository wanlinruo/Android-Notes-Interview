# Task 11: Shared UI Components

**Status:** Completed
**Date:** 2026-04-02

## Summary

Created 6 shared UI components: navbar, theme toggle, search box, article card, article filters, and pagination.

## Completed Steps

1. **Install dependencies** — next-themes
2. **ThemeToggle** — Dark/light mode toggle with hydration safety
3. **Navbar** — Top navigation with links, search, theme toggle, auth state
4. **SearchBox** — Search input that navigates to /notes?q=...
5. **ArticleCard** — Article preview card with type badge, difficulty tag, category
6. **ArticleFilters** — Category select, difficulty select, topic tag buttons
7. **Pagination** — Previous/next page navigation
8. **TypeScript check** — 0 errors

## Key Design Decisions

- All interactive components marked "use client"
- ThemeToggle uses mounted state to avoid hydration mismatch
- ArticleFilters imports from `@/generated/prisma/client` (not `@prisma/client`)
- Navbar shows admin link only for ADMIN role users
- Pagination preserves existing search params when changing page

## Verification

- TypeScript: 0 errors

## Files Created

- `src/components/theme-toggle.tsx` (new)
- `src/components/search-box.tsx` (new)
- `src/components/navbar.tsx` (new)
- `src/components/article-card.tsx` (new)
- `src/components/article-filters.tsx` (new)
- `src/components/pagination.tsx` (new)
