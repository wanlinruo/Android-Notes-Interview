# Task 38: Redesign Admin Article Management

**Phase:** UI Redesign - Phase 4 (Task 13)
**Date:** 2026-04-04
**Status:** Completed

## What Was Done

- 文章列表页重设计：shadcn/ui Card 表格 + Badge 标签，Status 和 Type 双筛选组，总数统计，空状态提示
- 筛选按钮抽离为客户端组件 `ArticleFilters`：解决服务端组件无法调用 `buttonVariants()` 的问题
- 编辑页标题英文化：New Article / Edit Article
- 文章表单重设计：shadcn/ui Input + Select（base-ui，用 `onValueChange={(v) => v && set(v)}` 处理 null）+ Card 包裹
- 标签分组保留：Difficulty / Topics 分组展示，用 Button toggle 选中态
- 删除确认弹窗：AlertDialog 替换 `confirm()`，使用 `render` prop（base-ui 不支持 `asChild`）
- 新增 Cancel 按钮：用 `buttonVariants` + `<a>` 标签返回列表
- 响应式表格：Type/Category/Updated 列在小屏隐藏

## Key Learnings

- 项目使用 `@base-ui/react`，不支持 `asChild` prop，需用 `render` prop 或 `buttonVariants` class
- `buttonVariants()` 是客户端函数，不能在服务端组件中直接调用，需抽离到客户端组件
- base-ui Select 的 `onValueChange` 可传 `null`，需要 guard：`(v) => v && setter(v)`

## Files Modified

- `src/app/admin/articles/page.tsx`
- `src/app/admin/articles/[id]/page.tsx`
- `src/components/admin/article-form.tsx`
- `src/components/admin/article-filters-bar.tsx` (new)
