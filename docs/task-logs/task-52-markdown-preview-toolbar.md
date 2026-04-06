# Task 52: Article Editor Markdown Preview & Toolbar

**Phase:** Phase 3 Optimizations - Task 3
**Date:** 2026-04-06
**Status:** Completed

## What Was Done

- 文章编辑表单 Content 区域增加 Edit / Preview Tab 切换
  - Edit Tab: 保持原有 textarea，全宽编辑
  - Preview Tab: 复用 MarkdownRenderer 组件渲染预览，与文章详情页样式一致
  - 空内容时显示 "No content to preview" 提示
- 增加 Markdown 格式化工具栏（Edit 模式下显示）：
  - 文本格式：Bold、Italic、Strikethrough
  - 标题：H1、H2、H3
  - 链接与图片：Link、Image
  - 代码：Inline Code、Code Block
  - 列表：Unordered、Ordered、Task List
  - 其他：Blockquote、Horizontal Rule、Table
  - 支持选中文字包裹格式，无选中时插入占位文本并自动选中
- 增加 Format 按钮，一键清理 Markdown 内容：
  - 去除行末多余空格
  - 压缩连续多余空行
  - 标题、代码块、引用、列表前自动补空行
- 增加 Markdown 语法帮助浮层（? 图标），分 7 类展示完整语法速查
- 表单整体间距优化，Content 区域上方增加分隔线

## Files Modified

- `src/components/admin/article-form.tsx`
