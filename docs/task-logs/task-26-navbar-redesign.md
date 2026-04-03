# Task 26: Redesign Navbar (Desktop)

**Phase:** UI Redesign - Phase 2: Shared Components
**Plan Task:** Task 3
**Date:** 2026-04-03
**Status:** Completed

## What Was Done

1. **Rewrote `theme-toggle.tsx`** — replaced simple toggle button with shadcn/ui DropdownMenu supporting Light/Dark/System modes with sun/moon icon animation
2. **Rewrote `search-box.tsx`** — replaced plain input with shadcn/ui Input, added `className` prop for flexible layout
3. **Rewrote `navbar.tsx`** — glassmorphism header with:
   - Brand gradient logo (purple/indigo)
   - Desktop nav links with animated underline on hover/active
   - User avatar with dropdown menu (Profile, Admin, Sign out)
   - Responsive: search and login hidden on mobile

## Adaptation Notes

- shadcn/ui v4 (base-ui) doesn't support `asChild` prop — used `buttonVariants()` with `cn()` for Link styling and direct `className` on Trigger components
- Replaced `session.user.nickname` with `session.user.name` to match the actual NextAuth session type

## Files Modified

- `src/components/theme-toggle.tsx`
- `src/components/search-box.tsx`
- `src/components/navbar.tsx`
