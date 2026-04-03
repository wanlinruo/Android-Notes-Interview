# Task 33: Redesign Article Detail Page

**Phase:** UI Redesign - Phase 3: Frontend Pages
**Plan Task:** Task 9
**Date:** 2026-04-03
**Status:** Completed

## What Was Done

1. **3 栏布局** — 左侧分类导航（高亮当前文章）、中间文章内容、右侧 TOC + 收藏/进度按钮
2. **CategoryNav** — 品牌色高亮当前文章，hover 效果使用 accent 主题色
3. **TOC** — IntersectionObserver 高亮当前标题，缩进层级，清理 Markdown 转义符（反斜杠、反引号等）
4. **CommentSection** — Card 组件包裹评论，shadcn Button 提交，显示评论数量
5. **MarkdownRenderer** — 更新 prose 主题适配品牌色（headings、links、code、pre）
6. **面包屑** — Home / Category / Article，使用 muted-foreground 主题色
7. **移动端悬浮按钮** — 右侧悬浮，滚动时滑出隐藏，停止滚动 800ms 后滑入显示，300ms 动画过渡
8. **游客体验优化** — 收藏/进度按钮未登录时跳转登录页，而非禁用无响应
9. **Docker 环境修复** — 设置 AUTH_SECRET/AUTH_TRUST_HOST 解决生产模式下 UntrustedHost 和 MissingSecret 错误

## Design Decisions

- TOC sticky 定位：overflow-y-auto 放在内部 sticky div 上而非 aside，避免破坏 sticky
- 保留原有 findUnique + 单独 update 的查询方式（而非计划中的 article.update + catch）
- FloatingActions 独立为客户端组件，封装滚动监听逻辑

## Files Modified

- `src/app/articles/[slug]/page.tsx`
- `src/components/category-nav.tsx`
- `src/components/toc.tsx`
- `src/components/comment-section.tsx`
- `src/components/markdown-renderer.tsx`
- `src/components/floating-actions.tsx` (new)
- `src/components/favorite-button.tsx`
- `src/components/progress-button.tsx`
- `docker-compose.yml`
