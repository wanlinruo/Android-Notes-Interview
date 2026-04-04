# Task 43: Create Versions List API

**Phase:** Article Version History - Task 5
**Date:** 2026-04-05
**Status:** Completed

## What Was Done

- 创建 `GET /api/articles/[id]/versions` API 路由
- 返回指定文章的所有版本列表，按版本号倒序排列
- 响应只包含轻量字段（id, version, title, createdAt），不返回 content 以减少数据量
- 需要 admin 权限

## Files Created

- `src/app/api/articles/[id]/versions/route.ts`
