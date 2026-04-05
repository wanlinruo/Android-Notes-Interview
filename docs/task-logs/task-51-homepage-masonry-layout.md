# Task 51: Homepage Articles Tab + Masonry Layout

**Phase:** Phase 3 Optimizations - Task 1-2
**Date:** 2026-04-05
**Status:** Completed

## What Was Done

- 新建 `HomepageArticles` 客户端组件，实现 Hot / Latest 两个 Tab 切换
- Tab 内容区使用 CSS `column-count` ���现瀑布流布局（桌面 3 列，移动端 2 列）
- 复用现有 `MasonryArticleCard` 组件��新增 `variant` prop 支持三种卡片样式：
  - **featured**: 大封面图 (`aspect-[16/12]`) + 摘要 + 标签 + meta
  - **default**: 标准封面图 (`aspect-[16/10]`) + 摘要 + 标签 + meta
  - **compact**: 窄条封面图 (`aspect-[3/1]`) + 仅标题和分类，无摘要/标签/meta
- 每次页面加载和 Tab 切换时，卡片 variant 随机分配，产生错落视觉效果
- 使用 deterministic 初始值 + `useEffect` 随机化方案，避免 SSR hydration mismatch
- 首页查询从 top 5 改为 top 6，增加 coverImage、category icon、comments count 字段
- 替换原有 Hot / Latest 两列纯文本卡片列表

## Files Created

- `src/components/homepage-articles.tsx`

## Files Modified

- `src/app/page.tsx`
- `src/components/masonry-article-card.tsx`
