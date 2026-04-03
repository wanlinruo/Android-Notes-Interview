# Task 29: Redesign Homepage

**Phase:** UI Redesign - Phase 3: Frontend Pages
**Plan Task:** Task 6
**Date:** 2026-04-03
**Status:** Completed

## What Was Done

1. **Hero 区域** — 去掉旧的深色渐变背景，简化为纯文本标题 + shadcn Input 搜索框
2. **Stats 统计栏** — 新增 3 列 Card 展示文章数、分类数、用户数，数字使用品牌渐变色
3. **Knowledge Modules** — 使用 shadcn Card 替代手写样式，显示分类图标 + 文章数量，hover 上浮 + 边框高亮
4. **Hot & Latest 双栏** — 新增热门文章列表（按收藏数排序），最新文章列表显示难度 Badge 和类型 Badge

## Design Decisions

- 新增 `hotArticles` 和统计数据查询（`articleCount`、`userCount`），使用 `Promise.all` 并行获取
- 最新文章从 10 条减少到 5 条，与热门文章列表对称
- 分类卡片增加 `cat.icon || "📁"` 兜底，防止未设置图标时显示空白

## Files Modified

- `src/app/page.tsx`
