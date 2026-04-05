# Task 50: Article Cover Image Feature

**Phase:** UI Redesign - Task 16
**Date:** 2026-04-05
**Status:** Completed

## What Was Done

- Article 模型新增 `coverImage String?` 字段（Prisma schema）
- 新增 `/api/unsplash` API：从 Unsplash 获取随机科技类横版图片，需 Admin 权限
- 文章创建 API (`POST /api/articles`) 和更新 API (`PUT /api/articles/[id]`) 支持 coverImage 字段
- Admin 文章表单增加封面图功能：
  - URL 输入框，支持手动粘贴图片链接
  - "Shuffle" 按钮一键从 Unsplash 随机获取封面
  - 新建文章时自动获取一张随机封面
  - 实时图片预览
- 文章列表卡片 (`ArticleCard`) 在桌面端显示封面缩略图
- 分类页瀑布流卡片 (`MasonryArticleCard`) 有封面图时显示真实图片，无封面时保留原有分类图标渐变占位
- 环境变量配置：`.env.example` 和 `docker-compose.dev.yml` 添加 `UNSPLASH_ACCESS_KEY`

## Files Modified

- `prisma/schema.prisma`
- `src/app/api/unsplash/route.ts` (new)
- `src/app/api/articles/route.ts`
- `src/app/api/articles/[id]/route.ts`
- `src/components/admin/article-form.tsx`
- `src/components/article-card.tsx`
- `src/components/masonry-article-card.tsx`
- `.env.example`
- `docker-compose.dev.yml`
