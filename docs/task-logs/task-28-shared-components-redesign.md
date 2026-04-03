# Task 28: Redesign Shared UI Components

**Phase:** UI Redesign - Phase 2: Shared Components
**Plan Task:** Task 5
**Date:** 2026-04-03
**Status:** Completed

## What Was Done

1. **Rewrote `article-card.tsx`** — shadcn Card + Badge, hover lift animation, brand color highlight on hover
2. **Rewrote `article-filters.tsx`** — shadcn Input for search, styled native select for category/difficulty (kept `baseUrl` prop for backward compatibility), Badge for topic tags
3. **Rewrote `pagination.tsx`** — shadcn Button (outline variant), kept `baseUrl` prop as optional for backward compatibility
4. **Rewrote `favorite-button.tsx`** — shadcn Button with SVG star icon, kept original `count` prop name, added `res.ok` check to prevent JSON parse error on auth failure
5. **Rewrote `progress-button.tsx`** — shadcn Button variants for Unread/Reading/Done states, added error handling for API calls

## Design Decisions

- Kept `baseUrl` prop on ArticleFilters and Pagination as optional with default `""` — existing page callers pass it, and it will be cleaned up when those pages are redesigned in Phase 3
- Used native `<select>` instead of shadcn Select for category filter — base-ui Select doesn't support `<optgroup>` which is needed for hierarchical categories
- Fixed a pre-existing bug: FavoriteButton crashed when user was not logged in due to API returning 500 with empty body

## Files Modified

- `src/components/article-card.tsx`
- `src/components/article-filters.tsx`
- `src/components/pagination.tsx`
- `src/components/favorite-button.tsx`
- `src/components/progress-button.tsx`
