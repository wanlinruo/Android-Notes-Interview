# Task 53: Quick Import API + Bookmarklet

**Phase:** Phase 3 Optimizations - Task 4-6
**Date:** 2026-04-06
**Status:** Completed

## What Was Done

- 创建 Quick Import 共享逻辑模块 (`src/lib/quick-import.ts`)：
  - URL 格式校验
  - 复用已有 `importFromUrl` 提取文章内容（Readability + Turndown）
  - 自动生成 slug（标题转 kebab-case + 时间戳）
  - 可选 Unsplash 随机封面图获取
  - 创建 DRAFT 状态文章，自动匹配分类和标签
  - 无匹配分类时使用默认分类（sortOrder 最小的）
- 创建 Quick Import POST API (`src/app/api/quick-import/route.ts`)：
  - Bearer token 认证（`QUICK_IMPORT_API_KEY`）
  - 接收 JSON `{ url }` 请求体
  - 返回创建的文章信息（id、title、slug、editUrl）
- 创建 Bookmarklet GET 端点 (`src/app/api/quick-import/bookmarklet/route.ts`)：
  - 通过 URL 参数传递 `url` 和 `key`
  - 返回 HTML 结果页面（卡片式布局）
  - 成功时显示文章标题，3 秒后自动关闭窗口
  - 失败时显示错误信息

## Files Created

- `src/lib/quick-import.ts`
- `src/app/api/quick-import/route.ts`
- `src/app/api/quick-import/bookmarklet/route.ts`

## Notes

- 验证需要先配置 `QUICK_IMPORT_API_KEY` 环境变量（Task 9 统一处理）
- Bookmarklet 使用方式：浏览器书签栏添加 JS 代码，点击后自动将当前页面 URL 发送到 GET 端点
