# Android 知识库网站设计文档

## 概述

一个面向 Android 开发者的知识库网站，提供系统化的知识笔记和面试题，支持用户注册、收藏、学习进度追踪，以及内容采集导入功能。

## 技术栈

- **框架**：Next.js 15 (App Router)
- **语言**：TypeScript
- **ORM**：Prisma
- **数据库**：PostgreSQL
- **认证**：NextAuth.js v5（邮箱+密码）
- **样式**：Tailwind CSS
- **部署**：Docker + Nginx 反向代理，自有服务器

## 架构

```
┌─────────────────────────────────────────────┐
│                   Nginx                      │
│              (反向代理 + SSL)                 │
├─────────────────────────────────────────────┤
│              Next.js App                     │
│  ┌──────────┐  ┌──────────┐  ┌───────────┐  │
│  │ 前台页面  │  │ 后台管理  │  │ API Routes│  │
│  │ (SSR/SSG)│  │  (CSR)   │  │  (/api/*) │  │
│  └──────────┘  └──────────┘  └───────────┘  │
│                     │                        │
│              ┌──────┴──────┐                 │
│              │  Prisma ORM │                 │
│              └──────┬──────┘                 │
├─────────────────────┼───────────────────────┤
│              PostgreSQL                      │
└─────────────────────────────────────────────┘
```

一个 Next.js 项目包含三个区域：
1. **前台页面**（SSR/SSG）— 访客浏览内容、注册登录、收藏、学习进度
2. **后台管理**（CSR）— `/admin` 路径下，单人管理内容
3. **API Routes** — 统一后端接口

## 数据模型

### User（用户）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | String (cuid) | 主键 |
| email | String | 唯一，登录用 |
| password | String | 哈希存储 |
| nickname | String | 昵称 |
| avatar | String? | 头像 URL |
| role | Enum: USER, ADMIN | 角色 |
| createdAt | DateTime | 创建时间 |
| updatedAt | DateTime | 更新时间 |

### Category（知识模块）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | String (cuid) | 主键 |
| name | String | 分类名称 |
| slug | String | URL 标识，唯一 |
| description | String? | 描述 |
| icon | String? | 图标 |
| sortOrder | Int | 排序顺序 |
| parentId | String? | 父分类 ID，支持二级分类 |

### Tag（标签）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | String (cuid) | 主键 |
| name | String | 标签名称 |
| slug | String | URL 标识，唯一 |
| type | Enum: DIFFICULTY, TOPIC | 难度标签（初级/中级/高级）或主题标签 |

### Article（文章）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | String (cuid) | 主键 |
| title | String | 标题 |
| slug | String | URL 标识，唯一 |
| content | Text | Markdown 内容 |
| summary | String? | 摘要 |
| type | Enum: NOTE, INTERVIEW | 知识笔记 or 面试题 |
| status | Enum: DRAFT, PUBLISHED | 草稿 or 已发布 |
| categoryId | String | 所属分类 |
| sourceUrl | String? | 采集来源 URL |
| viewCount | Int | 浏览次数 |
| createdAt | DateTime | 创建时间 |
| updatedAt | DateTime | 更新时间 |

### ArticleTag（文章-标签关联）

| 字段 | 类型 | 说明 |
|------|------|------|
| articleId | String | 文章 ID |
| tagId | String | 标签 ID |

### Favorite（收藏）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | String (cuid) | 主键 |
| userId | String | 用户 ID |
| articleId | String | 文章 ID |
| createdAt | DateTime | 收藏时间 |

### Progress（学习进度）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | String (cuid) | 主键 |
| userId | String | 用户 ID |
| articleId | String | 文章 ID |
| status | Enum: UNREAD, READING, DONE | 学习状态 |
| updatedAt | DateTime | 更新时间 |

### Comment（评论）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | String (cuid) | 主键 |
| content | String | 评论内容（纯文本） |
| userId | String | 用户 ID |
| articleId | String | 文章 ID |
| createdAt | DateTime | 创建时间 |

## 前台页面

### 首页 `/`

经典文档风格布局：
- 顶部导航栏：Logo、知识笔记、面试题、登录/用户头像
- Hero 区域：网站标题、简介、全局搜索框
- 知识模块网格：展示一级分类（图标+名称），点击进入分类页
- 最新文章列表：显示标题、类型标签、难度标签

### 知识笔记列表 `/notes`

- 按分类、标签、难度筛选
- 分页展示
- 支持搜索

### 面试题列表 `/interviews`

- 按分类、标签、难度筛选
- 分页展示
- 支持搜索

### 文章详情 `/articles/[slug]`

三栏布局：
- **左栏**：同分类下的文章导航列表，方便连续阅读
- **中栏**：文章正文（Markdown 渲染 + 代码高亮）、标题、类型/难度/分类标签、浏览数、收藏数、底部评论纠错区
- **右栏**：文章目录（TOC）、收藏按钮、标记学习进度按钮

### 分类页 `/categories/[slug]`

展示某分类下的所有文章，支持筛选和分页。

### 认证页 `/login` `/register`

邮箱+密码注册登录。

### 个人中心 `/profile`

- 我的收藏列表
- 学习进度追踪（按分类统计完成度）
- 修改个人信息

## 后台管理 `/admin`

单人管理，通过 ADMIN 角色控制访问。

### 仪表盘

- 文章总数（笔记/面试题分别统计）
- 注册用户数
- 总浏览量
- 总收藏数
- 文章收藏排行（热门文章 Top 10）

### 文章管理

- 文章列表：筛选（类型、状态、分类）、搜索、分页
- 创建/编辑文章：Markdown 编辑器、选择分类和标签、设置类型和状态
- 删除文章

### 分类管理

- 增删改分类
- 支持二级分类（拖拽排序）

### 标签管理

- 管理难度标签和主题标签

### 用户管理

- 查看注册用户列表

### 评论管理

- 查看所有评论
- 删除不当评论

### 内容采集 `/admin/import`

- 输入目标文章 URL
- 系统抓取页面，提取正文（基于 Readability 算法）
- HTML 转 Markdown（使用 Turndown）
- 自动推荐分类和难度标签（基于关键词匹配）
- 预览提取结果（标题、正文、推荐分类/标签）
- 确认后存为草稿，进入正常文章管理编辑流程

技术依赖：
- `@mozilla/readability` — 正文提取
- `cheerio` — HTML 解析
- `turndown` — HTML → Markdown 转换

## 核心功能

### 全文搜索

基于 PostgreSQL 全文检索（`tsvector`/`tsquery`），支持标题+内容搜索。

### 代码高亮

使用 `rehype-pretty-code`（基于 Shiki），支持多种语言语法高亮，适配暗黑主题。

### 目录导航

文章详情页根据 Markdown 标题层级自动生成右侧目录（TOC），滚动时高亮当前位置。

### 收藏功能

登录用户可收藏/取消收藏文章，文章详情和列表页显示收藏数，个人中心查看收藏列表。

### 学习进度

用户可将文章标记为 未读/在读/已完成，个人中心按分类统计学习完成度。

### 评论纠错

登录用户可在文章下方发表评论，用于内容纠错和反馈。管理员可在后台删除不当评论。不支持嵌套回复。

### 暗黑模式

Tailwind CSS dark mode，支持跟随系统/手动切换。

## 部署方案

- Docker Compose 编排：Next.js App + PostgreSQL
- Nginx 反向代理，处理 SSL 和静态资源缓存
- 自有服务器部署

## 内容组织

文章按两个维度组织：
1. **模块分类**（Category）：如四大组件、Jetpack、性能优化、网络、UI/自定义 View、设计模式等
2. **难度标签**（Tag - DIFFICULTY）：初级、中级、高级

同时支持自由定义的主题标签（Tag - TOPIC）做更细粒度的关联。
