# Task 42: Modify PUT API to Create Versions

**Phase:** Article Version History - Task 4
**Date:** 2026-04-05
**Status:** Completed

## What Was Done

- 修改 `PUT /api/articles/[id]` 路由，在执行更新逻辑前调用 `createArticleVersion(id)` 自动创建版本快照
- 每次文章更新都会先保存当前状态，再写入新内容
- 版本创建后自动执行清理策略（数量 + 时间双维度）

## Files Modified

- `src/app/api/articles/[id]/route.ts`
