# Task 36: Redesign Admin Layout & Sidebar

**Phase:** UI Redesign - Phase 4 (Task 11)
**Date:** 2026-04-04
**Status:** Completed

## What Was Done

- 侧边栏品牌化："Admin" 改名为 "Console"，顶部品牌渐变 "C" 图标
- 可折叠侧边栏：展开时显示图标+文字（w-52），折叠时仅显示图标（w-60px），底部 Collapse/Expand 按钮切换，300ms 过渡动画
- 折叠状态 Tooltip：hover 图标时显示菜单名称提示
- 菜单项 active 状态：支持子路由匹配（如 /admin/articles/xxx 也高亮 Articles）
- 底部增加 Back to site 返回前台链接
- Layout 固定高度 h-[calc(100vh-3.5rem)]，内容区可滚动
- 导航入口统一：navbar 和 mobile-menu 的管理后台入口从 "Admin" 改为 "Console"

## Files Modified

- `src/components/admin/sidebar.tsx`
- `src/app/admin/layout.tsx`
- `src/components/navbar.tsx`
- `src/components/mobile-menu.tsx`
