# Task 16: Article Detail Page (Three-Column Layout)

**Status:** Completed
**Date:** 2026-04-02

## Summary

Built article detail page with three-column layout, markdown rendering, TOC navigation, favorite/progress buttons, and comment section.

## Completed Steps

1. **Markdown renderer** — `src/components/markdown-renderer.tsx` with react-markdown + remark-gfm, custom heading IDs
2. **TOC component** — `src/components/toc.tsx` with IntersectionObserver for active heading highlight
3. **Category nav** — `src/components/category-nav.tsx` for left sidebar navigation
4. **Favorite button** — `src/components/favorite-button.tsx` with toggle API
5. **Progress button** — `src/components/progress-button.tsx` with cycle (UNREAD → READING → DONE)
6. **Comment section** — `src/components/comment-section.tsx` with submit and list
7. **Article detail page** — `src/app/articles/[slug]/page.tsx` with three-column layout
8. **Dependencies** — Installed react-markdown, remark-gfm, @tailwindcss/typography
9. **TypeScript check** — 0 errors
10. **Browser verification** — verified by user

## Key Design Decisions

- Custom heading components in react-markdown to generate IDs matching TOC anchors
- @tailwindcss/typography plugin required for `prose` classes in Tailwind v4 (added via `@plugin` in globals.css)
- Three-column layout: left category nav (hidden < lg), center content, right TOC + actions (hidden < xl)
- View count incremented server-side on each page load
- User-specific data (favorite/progress) fetched server-side via `auth()`

## Issues Fixed

- Missing @tailwindcss/typography plugin causing prose styles not to render
- react-markdown not generating heading IDs — added custom heading components with `textToId`
- `node` prop from react-markdown leaking to DOM — excluded via destructuring
- Comment textarea text invisible in dark mode — added `text-gray-100`

## Verification

- TypeScript: 0 errors
- Browser: verified by user (markdown, TOC navigation, comments, favorite/progress)

## Files Modified

- `src/components/markdown-renderer.tsx` — Markdown renderer with heading IDs (new)
- `src/components/toc.tsx` — Table of contents with scroll tracking (new)
- `src/components/category-nav.tsx` — Category sidebar navigation (new)
- `src/components/favorite-button.tsx` — Favorite toggle button (new)
- `src/components/progress-button.tsx` — Reading progress button (new)
- `src/components/comment-section.tsx` — Comment section (new)
- `src/app/articles/[slug]/page.tsx` — Article detail page (new)
- `src/app/globals.css` — Added @tailwindcss/typography plugin (modified)
