# Task 39: Add ArticleVersion Model

**Phase:** Article Version History - Task 1
**Date:** 2026-04-04
**Status:** Completed

## What Was Done

- 新增 `ArticleVersion` 模型：存储文章编辑的完整快照（title, slug, content, summary, type, status, categoryId, tagIds）
- Article 模型新增 `versions` 关联字段
- tagIds 使用 `String[]` 数组存储，避免为版本快照创建额外关联表
- 添加 `@@index([articleId, version])` 索引优化查询
- `onDelete: Cascade` 确保文章删除时版本记录一并清除
- 使用 `prisma db push` 同步数据库（项目无 migration 历史，避免 drift reset 丢数据）

## Files Modified

- `prisma/schema.prisma`
