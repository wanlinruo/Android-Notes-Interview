# Task 45: Create VersionHistory Component

**Phase:** Article Version History - Task 7
**Date:** 2026-04-05
**Status:** Completed

## What Was Done

- 创建 `src/components/admin/version-history.tsx` 右侧边栏版本历史面板
- 显示版本列表：版本号徽章、标题、创建时间
- 每个版本提供 Diff 按钮（打开差异对比弹窗）和 Revert 按钮（回滚确认对话框）
- Revert 使用 AlertDialog 二次确认，提示回滚前会自动保存当前状态
- 回滚成功后通过 `router.push("/admin/articles")` 跳转到文章列表
- 从 `/api/articles/${articleId}/versions` 获取版本数据

## Files Created

- `src/components/admin/version-history.tsx`
