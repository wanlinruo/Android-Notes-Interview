# Android Knowledge Hub UI 改版设计文档

## 概述

对 Android Knowledge Hub 网站进行全站 UI 改版，采用现代卡片风格（紫/靛蓝渐变品牌色），引入 shadcn/ui 组件库，优化 Light/Dark 双模式体验和移动端适配。

改版分两期执行：第一期前台页面，第二期后台管理。

## 技术方案

### UI 组件库

引入 **shadcn/ui**（基于 Radix UI + Tailwind CSS）：

- 按需安装组件，源码直接复制到 `src/components/ui/` 目录
- 使用 shadcn/ui 的主题系统管理配色（CSS 变量）
- 现有手写组件逐步替换为 shadcn/ui 组件

### 需要引入的 shadcn/ui 组件

| 组件 | 用途 |
|------|------|
| Button | 全站按钮统一样式 |
| Input | 搜索框、表单输入 |
| Select | 筛选下拉（分类、难度、类型） |
| Card | 文章卡片、分类卡片、统计卡片 |
| Badge | 类型标签（NOTE/INTERVIEW）、难度标签 |
| Table | 管理后台列表 |
| Dialog / AlertDialog | 确认删除、编辑弹窗 |
| DropdownMenu | 用户菜单、主题切换 |
| Tabs | 文章类型切换、筛选标签 |
| Pagination | 分页 |
| Sheet | 移动端侧滑菜单 |
| Separator | 分隔线 |
| Skeleton | 加载占位 |
| Avatar | 用户头像 |
| Tooltip | 按钮提示 |

### 配色方案

品牌色系：紫/靛蓝渐变（Indigo-Violet）

**Light 模式：**
- 背景：淡紫白色 `#faf8ff` → `#f5f3ff` 渐变
- 卡片：纯白 `#ffffff`，微阴影 `shadow-sm` 带紫色调
- 品牌色：`#6366f1`（Indigo-500）→ `#8b5cf6`（Violet-500）渐变
- 文字主色：`#1e1b4b`（Indigo-950）
- 文字次色：`#6b7280`（Gray-500）
- 边框：`#e9e5f5`（淡紫灰）
- NOTE 标签：蓝底 `#dbeafe` / `#1d4ed8`
- INTERVIEW 标签：紫底 `#ede9fe` / `#6d28d9`
- 难度标签 Beginner：绿底 `#dcfce7` / `#15803d`
- 难度标签 Intermediate：蓝底 `#dbeafe` / `#1d4ed8`
- 难度标签 Advanced：橙底 `#fef3c7` / `#b45309`

**Dark 模式：**
- 背景：深紫黑 `#0f0b1e` → `#1a1333` 渐变
- 卡片：`#1e1845`，边框 `#2e2860`
- 品牌色：`#a78bfa`（Violet-400）→ `#c4b5fd`（Violet-300）渐变
- 文字主色：`#ede9fe`（Violet-100）
- 文字次色：`#7c6faa`
- NOTE 标签：深蓝底 `#312e81` / `#a5b4fc`
- INTERVIEW 标签：深紫底 `#4c1d95` / `#c4b5fd`
- 难度标签颜色与 Light 模式对应的暗色版本

### 字体

保持 Inter 字体，调整字重层级：
- 页面大标题：`text-3xl font-bold`（首页 Hero）
- 区域标题：`text-xl font-semibold`
- 卡片标题：`text-base font-medium`
- 正文：`text-sm`
- 辅助文字/标签：`text-xs`

## 前台页面设计

### 导航栏

**桌面端：**
- 左侧：Logo（渐变图标 + 渐变文字 "Android Hub"）
- 中间：知识笔记、面试题 链接
- 右侧：搜索框（集成在导航栏）、主题切换（DropdownMenu：Light/Dark/System）、登录按钮或用户头像下拉菜单
- 底部 1px 边框，背景半透明毛玻璃效果 `backdrop-blur`

**移动端：**
- 顶部：Logo + 汉堡菜单按钮
- 汉堡菜单点击弹出 Sheet（侧滑抽屉），包含导航链接、搜索框、主题切换
- 底部固定导航栏：首页、笔记、面试题、个人中心 四个图标入口

### 首页 `/`

**结构（自上而下）：**

1. **紧凑 Hero 区域**
   - 左对齐标题 "Android Knowledge Hub"
   - 副标题描述
   - 搜索框（大号，带渐变边框 focus 效果）
   - 背景：微妙的渐变色块或网格纹理

2. **数据统计条**
   - 三个统计卡片横排：文章数、分类数、学习者数
   - 数字使用品牌渐变色，hover 微浮起效果

3. **知识模块网格**
   - 区域标题 "Knowledge Modules"
   - 4 列网格（移动端 2 列），每个模块卡片含图标 + 名称 + 文章数
   - 卡片 hover：边框变为品牌色，微上浮 `translateY(-2px)` + 阴影加深

4. **热门文章 & 最新文章 双列**
   - 左列 "Hot Articles"（按收藏数排序 Top 5）
   - 右列 "Latest Articles"（按时间排序最新 5 篇）
   - 移动端堆叠为单列
   - 每条文章：标题 + 分类/难度标签 + 浏览数/收藏数

### 知识笔记列表 `/notes` & 面试题列表 `/interviews`

- 顶部：页面标题 + 描述
- 筛选栏：分类 Select + 难度 Select + 搜索 Input（shadcn/ui 组件）
- 文章卡片列表：每张卡片包含标题、摘要（截取前 100 字）、类型 Badge、难度 Badge、分类、浏览数、收藏数
- 卡片 hover：微上浮 + 阴影加深 + 左边框出现品牌色
- 底部分页：shadcn/ui Pagination

### 文章详情 `/articles/[slug]`

**三栏布局（桌面端）：**

- **左栏（w-56）**：同分类文章导航
  - 当前文章高亮，品牌色左边框
  - 可折叠/展开
  - 滚动独立

- **中栏（flex-1）**：
  - 面包屑导航（首页 / 分类名 / 文章标题）
  - 文章元信息：类型 Badge + 难度 Badge + 浏览数 + 收藏数 + 更新时间
  - Markdown 正文：prose 样式 + 代码高亮（Shiki 主题匹配品牌色）
  - 底部评论区：shadcn/ui Card 包裹

- **右栏（w-48）**：
  - 收藏按钮（实心/空心切换，hover 动画）
  - 学习进度按钮（未读/在读/已完成，颜色区分）
  - TOC 目录：当前标题高亮，点击平滑滚动

**移动端：**
- 隐藏左右两栏
- 底部浮动按钮栏：收藏、进度、TOC（点击弹出 Sheet）
- TOC 在 Sheet 中展示，点击跳转后自动关闭

### 分类页 `/categories/[slug]`

- 顶部：分类图标 + 分类名 + 描述 + 文章总数
- 子分类标签栏（如果有子分类）
- 文章列表（复用 notes 页面的卡片样式）
- 分页

### 登录 `/login` & 注册 `/register`

- 居中卡片布局，品牌渐变背景
- shadcn/ui Input + Button
- 表单验证错误提示
- 登录/注册页之间链接切换

### 个人中心 `/profile`

- 用户信息卡片：头像 + 昵称 + 邮箱
- Tabs 切换：我的收藏 / 学习进度 / 个人设置
- 学习进度：按分类统计完成度，进度条使用品牌渐变色
- 收藏列表：复用文章卡片样式

## 后台管理页面设计

### 管理后台布局 `/admin`

- 左侧固定侧边栏：Logo、导航链接（Dashboard / Articles / Categories / Tags / Users / Comments / Import）
- 侧边栏配色与前台一致（品牌紫色系）
- 右侧内容区域

### Dashboard

- 统计卡片网格（文章数、用户数、浏览量、收藏量）使用 shadcn/ui Card
- 热门文章排行 Top 10 使用 shadcn/ui Table

### 文章管理

- 筛选栏：Select（类型、状态、分类）+ 搜索 Input
- 文章列表：shadcn/ui Table + Pagination
- 新建/编辑按钮：shadcn/ui Button
- 删除确认：shadcn/ui AlertDialog

### 分类 / 标签 / 用户 / 评论管理

- 统一使用 shadcn/ui Table + Dialog 交互模式
- 表单使用 shadcn/ui Input / Select

### 内容采集

- 保持现有两阶段工作流（预览 → 保存草稿）
- 使用 shadcn/ui 组件美化表单和预览区域

## 动效规范

所有动效使用 CSS transition，不引入 Framer Motion：

| 交互 | 动效 | 参数 |
|------|------|------|
| 卡片 hover | 微上浮 + 阴影加深 | `translateY(-2px)`, `transition-all duration-200` |
| 按钮 hover | 背景色加深 | `transition-colors duration-150` |
| 按钮点击 | 缩放反馈 | `active:scale-95`, `transition-transform duration-100` |
| 页面内容 | 淡入 | `animate-in fade-in duration-300`（shadcn/ui 内置） |
| 收藏按钮 | 心跳效果 | `scale` keyframe on toggle |
| 导航链接 | 下划线滑入 | `after:transition-all after:duration-200` |

## 移动端适配

### 断点

- `sm`：640px — 手机横屏
- `md`：768px — 平板
- `lg`：1024px — 桌面（显示三栏布局）
- `xl`：1280px — 大屏

### 移动端专属组件

1. **底部导航栏**（< md）
   - 固定在底部，4 个图标入口：首页、笔记、面试题、个人中心
   - 当前页高亮品牌色
   - `safe-area-inset-bottom` 适配 iPhone

2. **侧滑菜单**（< md）
   - shadcn/ui Sheet 组件
   - 从左侧滑出，包含完整导航 + 搜索 + 主题切换

3. **文章详情浮动按钮栏**（< lg）
   - 底部固定栏：收藏、进度、TOC 按钮
   - TOC 点击弹出 Sheet

4. **响应式网格调整**
   - 首页分类网格：4 列 → 2 列
   - 热门/最新双列 → 单列堆叠
   - 统计条：3 列保持，缩小间距

## 不变的部分

以下功能和结构在改版中保持不变：

- 所有 API routes（`/api/*`）— 后端逻辑不动
- 数据模型（Prisma schema）— 不动
- 认证逻辑（NextAuth.js）— 不动
- 内容采集逻辑（`src/lib/import.ts`）— 不动
- Markdown 渲染逻辑 — 仅调整样式主题
- 页面路由结构 — URL 不变
