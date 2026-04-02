# Task 14: Login & Register Pages

**Status:** Completed
**Date:** 2026-04-02

## Summary

Built login and register pages with form validation, error handling, and navigation links between them.

## Completed Steps

1. **Login page** — `src/app/login/page.tsx` with NextAuth credentials sign-in
2. **Register page** — `src/app/register/page.tsx` calling `/api/register`
3. **TypeScript check** — 0 errors
4. **Browser verification** — verified by user

## Key Design Decisions

- Login uses `signIn("credentials", { redirect: false })` from next-auth/react
- Register calls `/api/register` endpoint, redirects to login on success
- Error display: single string for login, array for register (multiple validation errors)
- Consistent styling with other pages (dark mode support, same input/button styles)

## Verification

- TypeScript: 0 errors
- Browser: verified by user

## Files Modified

- `src/app/login/page.tsx` — Login page (new)
- `src/app/register/page.tsx` — Register page (new)
