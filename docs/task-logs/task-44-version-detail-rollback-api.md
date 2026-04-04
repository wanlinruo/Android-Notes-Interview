# Task 44: Create Version Detail & Rollback APIs

**Phase:** Article Version History - Task 6
**Date:** 2026-04-05
**Status:** Completed

## What Was Done

- 创建 `GET /api/articles/[id]/versions/[versionId]` API：返回版本完整快照（含 content），用于 Diff 对比
- 创建 `POST /api/articles/[id]/versions/[versionId]/rollback` API：回滚到指定版本
  - 回滚前自动保存当前状态为新版本（确保回滚可逆）
  - 删除现有 ArticleTag 关联，用快照 tagIds 重建
  - 覆盖 Article 主表所有字段（title, slug, content, summary, type, status, categoryId）
  - 执行版本清理策略
- 两个 API 均需要 admin 权限

## Files Created

- `src/app/api/articles/[id]/versions/[versionId]/route.ts`
- `src/app/api/articles/[id]/versions/[versionId]/rollback/route.ts`
