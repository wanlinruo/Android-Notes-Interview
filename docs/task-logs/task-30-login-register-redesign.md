# Task 30: Redesign Login & Register Pages

**Phase:** UI Redesign - Phase 3: Frontend Pages
**Plan Task:** Task 7
**Date:** 2026-04-03
**Status:** Completed

## What Was Done

1. **Login 页** — shadcn Card 居中布局，品牌渐变 Logo，Input/Button 组件，destructive 风格错误提示
2. **Register 页** — 同样的 Card 布局，保留原有 errors 数组错误处理（适配 API 返回格式）

## Design Decisions

- Register 页保留 `errors: string[]` 而非计划中的单个 `error: string`，因为 API `/api/register` 返回 `data.errors` 数组
- 两个页面使用相同的品牌渐变 Logo + Card 居中视觉风格，保持一致性

## Files Modified

- `src/app/login/page.tsx`
- `src/app/register/page.tsx`
