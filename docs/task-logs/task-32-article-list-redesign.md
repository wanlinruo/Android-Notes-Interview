# Task 32: Redesign Article List Pages (Notes & Interviews)

**Phase:** UI Redesign - Phase 3: Frontend Pages
**Plan Task:** Task 8
**Date:** 2026-04-03
**Status:** Completed

## What Was Done

1. **Notes 页和 Interviews 页** — 统一 `max-w-7xl` 布局，新增副标题，每页从 20 条改为 12 条
2. **ArticleFilters 组件重构** — 用 Card 包裹筛选区域，分类/难度/话题标签统一用 Button 组件替代原来的下拉框和 Badge
3. **Bug 修复：难度和话题标签互相覆盖** — 拆分为独立 URL 参数 `difficulty` 和 `topic`，页面用 Prisma AND 条件支持同时过滤
4. **Bug 修复：base-ui Input uncontrolled 警告** — 搜索框改为受控组件（value + onChange）
5. **Bug 修复：Hydration 不匹配** — ArticleFilters 用 Suspense 包裹解决 useSearchParams SSR 问题
6. **Bug 修复：筛选不影响搜索结果** — 从 router.push() 改为 Link 组件导航，确保 Server Component 重新请求数据
7. **Dockerfile 修复** — 移除已废弃的 `node_modules/.prisma` COPY 指令（Prisma 7 改为 src/generated）

## Design Decisions

- 分类/难度/话题使用 Link + buttonVariants 而非 router.push()，对 Server Component 的 searchParams 更新更可靠
- 父分类用 outline + font-semibold 区分层级，子分类用 outline 普通样式，竖线分隔分组
- Tag slug 全局唯一（@unique），Prisma 查询只用 slug 过滤，不需要额外 type 约束

## Files Modified

- `src/app/notes/page.tsx`
- `src/app/interviews/page.tsx`
- `src/components/article-filters.tsx`
- `Dockerfile`
