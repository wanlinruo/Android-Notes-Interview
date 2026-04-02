# Task 10: Content Import Logic

**Status:** Completed
**Date:** 2026-04-02

## Summary

Created content import system that fetches external URLs, extracts article content using Readability, converts HTML to Markdown, and suggests categories/tags by keyword matching.

## Completed Steps

1. **Install dependencies** — @mozilla/readability, cheerio, turndown, jsdom + type definitions
2. **Import tests** — `__tests__/lib/import.test.ts` with 2 tests (HTML→Markdown, keyword tag matching)
3. **Tests verified** — 2/2 passing
4. **Import logic** — `src/lib/import.ts` with URL fetch, Readability extraction, Turndown conversion, category/tag suggestion
5. **Import API** — `src/app/api/import/route.ts` with preview (extract+suggest) and save (create draft article) actions
6. **TypeScript check** — 0 errors

## Key Design Decisions

- Uses Readability for content extraction (removes navigation, ads, etc.)
- Turndown configured with ATX headings and fenced code blocks
- Category/tag suggestion by simple keyword matching against database entries
- Import saves as DRAFT status with sourceUrl recorded
- Preview action returns suggested metadata without saving

## Verification

- TypeScript: 0 errors
- Tests: 2/2 passing

## Files Created

- `__tests__/lib/import.test.ts` — Import utility tests (new)
- `src/lib/import.ts` — Import logic module (new)
- `src/app/api/import/route.ts` — Import API route (new)
