# Task 48: Redesign Admin Category, Tag, User, Comment Pages

**Phase:** UI Redesign - Task 14
**Date:** 2026-04-05
**Status:** Completed

## What Was Done

### Categories Page (`/admin/categories`)
- 改为单 Card 容器内的分组列表，与 articles 页面风格一致
- 父分类行：图标圆角背景 + 名称/slug + 子分类数 Badge，右侧 Edit/Delete
- 子分类行：缩进 + 浅灰底色区分层级，hover 加深
- 删除改用 AlertDialog 确认弹窗
- 新增/编辑使用 Dialog 弹窗（Base UI render prop，非 Radix asChild）

### Tags Page (`/admin/tags`)
- 顶部两个统计卡片：Difficulty（绿色）/ Topic（蓝色）数量突出显示
- 下方单 Card 表格列表展示所有标签
- Type 列用 Badge 区分（Difficulty=default, Topic=outline）
- 新增编辑功能：点击 Edit 弹出 Dialog 预填当前值，提交走 PUT
- 删除改用 AlertDialog 确认弹窗

### Users Page (`/admin/users`)
- 新增头像首字母圆圈（bg-primary/10）
- 行 hover 高亮（hover:bg-muted/50）
- 小屏响应式隐藏次要列（Email sm:, Favorites/Comments md:, Joined lg:）
- 小屏下 email 显示在昵称下方

### Comments Page (`/admin/comments`)
- 顶部 3 个统计卡片：Total（紫）/ Today（绿）/ Active Articles（蓝），客户端计算
- 单 Card 内按文章分组展示，文章标题为分组头 + 评论数 Badge
- 评论行：彩色头像圆圈 + 昵称 + 日期 + 内容截断
- 长评论（>100字符）可展开/收起查看全文
- 删除改用 AlertDialog 确认弹窗

### 技术要点
- 所有 Dialog/AlertDialog 使用 Base UI 的 `render` prop 而非 Radix 的 `asChild`，避免 button 嵌套 hydration 错误

## Files Modified

- `src/app/admin/categories/page.tsx`
- `src/app/admin/tags/page.tsx`
- `src/app/admin/users/page.tsx`
- `src/app/admin/comments/page.tsx`
