# Task 41: Create Version Helper (Shared Logic)

**Phase:** Article Version History - Task 3
**Date:** 2026-04-05
**Status:** Completed

## What Was Done

- 创建 `src/lib/article-versions.ts` 共享模块
- `createArticleVersion(articleId)`: 读取当前文章完整状态（含 tagIds），写入 ArticleVersion 快照，自动递增版本号
- `cleanupVersions(articleId)`: 双维度清理策略
  - 数量维度：保留最新 10 个版本，超出则删除最早的
  - 时间维度：删除 createdAt 超过 6 个月的版本
- 清理在每次创建版本后自动执行

## Files Created

- `src/lib/article-versions.ts`
