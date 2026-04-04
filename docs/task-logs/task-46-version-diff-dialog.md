# Task 46: Create VersionDiffDialog Component

**Phase:** Article Version History - Task 8
**Date:** 2026-04-05
**Status:** Completed

## What Was Done

- 创建 `src/components/admin/version-diff-dialog.tsx` 版本差异对比弹窗
- 实现 side-by-side 双栏对比视图，使用 `diff` 包的 `diffLines` 函数
- 对比历史版本快照与当前 Article 表中的最新内容（非版本间对比）
- 可折叠的未变更区域（CONTEXT_LINES = 2），点击展开/收起
- 顶部显示元数据变更（Title, Status, Type, Category, Summary, Tags）
- 添加/删除行数统计（绿色/红色）
- 弹窗宽度使用 `max-w-7xl sm:max-w-7xl` 覆盖 DialogContent 组件中硬编码的 `sm:max-w-sm`
- 最大高度 85vh，内容区域可滚动

## Files Created

- `src/components/admin/version-diff-dialog.tsx`

## Technical Notes

- DialogContent 组件基础样式包含 `sm:max-w-sm`，需要通过 `sm:max-w-7xl` 覆盖（仅传 `max-w-7xl` 无效）
