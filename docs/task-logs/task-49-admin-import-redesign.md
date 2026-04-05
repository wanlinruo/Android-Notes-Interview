# Task 49: Redesign Admin Import Page

**Phase:** UI Redesign - Task 15
**Date:** 2026-04-05
**Status:** Completed

## What Was Done

- 重写 `src/app/admin/import/page.tsx`：页面标题和描述改为英文，风格与其他 admin 页面统一
- 重写 `src/components/admin/import-form.tsx`：
  - URL 输入区域改为 Card + shadcn/ui Input + Button
  - 预览编辑区改为 Card，Title 用 Input，Type/Category 用 Select，Tags 用 Button toggle
  - Suggested category/tags 用 Badge 提示（保留原有自动推荐功能）
  - 错误信息用 destructive 品牌色样式
  - Content 预览改为可编辑 textarea，保留 resize 和完整编辑能力
  - 保留原有 error handling 和 category 必选验证逻辑

## Files Modified

- `src/app/admin/import/page.tsx`
- `src/components/admin/import-form.tsx`
