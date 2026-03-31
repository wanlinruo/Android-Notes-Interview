# Android 知识库网站 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a full-stack Android knowledge hub website with knowledge notes, interview questions, user system, content management, and content import from external URLs.

**Architecture:** Next.js 15 App Router monolith with three zones — public SSR pages, admin CSR pages, and API routes. Prisma ORM connects to PostgreSQL. NextAuth.js v5 handles authentication. Docker + Nginx for deployment.

**Tech Stack:** Next.js 15, TypeScript, Prisma, PostgreSQL, NextAuth.js v5, Tailwind CSS, Docker, Cheerio, @mozilla/readability, Turndown

---

## File Structure

```
project-002/
├── prisma/
│   ├── schema.prisma              # Database schema
│   └── seed.ts                    # Seed data (categories, tags, admin user)
├── src/
│   ├── app/
│   │   ├── layout.tsx             # Root layout (navbar, theme provider)
│   │   ├── page.tsx               # Homepage
│   │   ├── globals.css            # Global styles
│   │   ├── login/page.tsx         # Login page
│   │   ├── register/page.tsx      # Register page
│   │   ├── notes/page.tsx         # Notes list
│   │   ├── interviews/page.tsx    # Interview questions list
│   │   ├── articles/[slug]/page.tsx  # Article detail (3-column)
│   │   ├── categories/[slug]/page.tsx # Category page
│   │   ├── profile/page.tsx       # User profile
│   │   ├── admin/
│   │   │   ├── layout.tsx         # Admin layout with sidebar
│   │   │   ├── page.tsx           # Dashboard
│   │   │   ├── articles/
│   │   │   │   ├── page.tsx       # Article list management
│   │   │   │   └── [id]/page.tsx  # Article editor
│   │   │   ├── categories/page.tsx # Category management
│   │   │   ├── tags/page.tsx      # Tag management
│   │   │   ├── users/page.tsx     # User list
│   │   │   ├── comments/page.tsx  # Comment management
│   │   │   └── import/page.tsx    # Content import
│   │   └── api/
│   │       ├── auth/[...nextauth]/route.ts  # NextAuth handler
│   │       ├── articles/route.ts            # Article CRUD
│   │       ├── articles/[id]/route.ts       # Single article ops
│   │       ├── categories/route.ts          # Category CRUD
│   │       ├── tags/route.ts                # Tag CRUD
│   │       ├── favorites/route.ts           # Favorite toggle
│   │       ├── progress/route.ts            # Progress update
│   │       ├── comments/route.ts            # Comment CRUD
│   │       ├── comments/[id]/route.ts       # Delete comment
│   │       ├── users/route.ts               # User list (admin)
│   │       ├── import/route.ts              # Content import
│   │       ├── search/route.ts              # Full-text search
│   │       └── stats/route.ts               # Dashboard stats
│   ├── lib/
│   │   ├── prisma.ts              # Prisma client singleton
│   │   ├── auth.ts                # NextAuth config
│   │   ├── auth-utils.ts          # Session helpers (requireAuth, requireAdmin)
│   │   └── import.ts              # Content import logic (fetch, readability, turndown)
│   ├── components/
│   │   ├── navbar.tsx             # Top navigation bar
│   │   ├── theme-toggle.tsx       # Dark mode toggle
│   │   ├── article-card.tsx       # Article card for lists
│   │   ├── article-filters.tsx    # Category/tag/difficulty filter bar
│   │   ├── pagination.tsx         # Pagination component
│   │   ├── markdown-renderer.tsx  # Markdown → HTML with code highlighting
│   │   ├── toc.tsx                # Table of contents (right sidebar)
│   │   ├── category-nav.tsx       # Category article nav (left sidebar)
│   │   ├── comment-section.tsx    # Comments display + form
│   │   ├── favorite-button.tsx    # Favorite toggle button
│   │   ├── progress-button.tsx    # Learning progress toggle
│   │   ├── search-box.tsx         # Search input component
│   │   └── admin/
│   │       ├── sidebar.tsx        # Admin sidebar navigation
│   │       ├── stats-card.tsx     # Dashboard stat card
│   │       ├── article-form.tsx   # Markdown editor + metadata form
│   │       └── import-form.tsx    # URL import form + preview
│   └── types/
│       └── index.ts               # Shared TypeScript types
├── __tests__/
│   ├── api/
│   │   ├── articles.test.ts       # Article API tests
│   │   ├── auth.test.ts           # Auth API tests
│   │   ├── categories.test.ts     # Category API tests
│   │   ├── favorites.test.ts      # Favorite API tests
│   │   ├── comments.test.ts       # Comment API tests
│   │   ├── import.test.ts         # Import API tests
│   │   └── search.test.ts         # Search API tests
│   ├── lib/
│   │   └── import.test.ts         # Import logic unit tests
│   └── components/
│       ├── markdown-renderer.test.tsx
│       └── toc.test.tsx
├── docker-compose.yml             # PostgreSQL + Next.js
├── Dockerfile                     # Next.js production build
├── nginx.conf                     # Nginx reverse proxy config
├── .env.example                   # Environment variables template
├── next.config.ts                 # Next.js config
├── tailwind.config.ts             # Tailwind config
├── tsconfig.json                  # TypeScript config
├── jest.config.ts                 # Jest config
└── package.json
```

---

## Task 1: Project Scaffolding

**Files:**
- Create: `package.json`, `next.config.ts`, `tailwind.config.ts`, `tsconfig.json`, `jest.config.ts`, `.env.example`, `src/app/layout.tsx`, `src/app/globals.css`, `src/app/page.tsx`

- [ ] **Step 1: Create Next.js project**

```bash
cd /Users/wanlinruo/repository/my-project/project-002
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm
```

When prompted, accept defaults. This creates the base Next.js 15 project with TypeScript, Tailwind CSS, ESLint, App Router, and `src/` directory.

- [ ] **Step 2: Install core dependencies**

```bash
npm install prisma @prisma/client next-auth@beta bcryptjs
npm install -D @types/bcryptjs jest @jest/globals ts-jest @testing-library/react @testing-library/jest-dom jest-environment-jsdom
```

- [ ] **Step 3: Create `.env.example`**

```env
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/android_hub"

# NextAuth
NEXTAUTH_SECRET="your-secret-key-change-in-production"
NEXTAUTH_URL="http://localhost:3000"
```

Copy to `.env`:

```bash
cp .env.example .env
```

- [ ] **Step 4: Configure Jest**

Create `jest.config.ts`:

```typescript
import type { Config } from "jest";
import nextJest from "next/jest";

const createJestConfig = nextJest({
  dir: "./",
});

const config: Config = {
  testEnvironment: "jest-environment-jsdom",
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  testMatch: ["**/__tests__/**/*.test.ts", "**/__tests__/**/*.test.tsx"],
};

export default createJestConfig(config);
```

Add to `package.json` scripts:

```json
"test": "jest",
"test:watch": "jest --watch"
```

- [ ] **Step 5: Verify project runs**

```bash
npm run dev
```

Expected: Next.js dev server starts at `http://localhost:3000` without errors. Stop it with Ctrl+C.

```bash
npm test -- --passWithNoTests
```

Expected: Jest runs with 0 tests, exits 0.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: scaffold Next.js project with TypeScript, Tailwind, Jest"
```

---

## Task 2: Database Schema & Prisma Setup

**Files:**
- Create: `prisma/schema.prisma`, `src/lib/prisma.ts`

- [ ] **Step 1: Initialize Prisma**

```bash
npx prisma init
```

This creates `prisma/schema.prisma` and updates `.env` with `DATABASE_URL`.

- [ ] **Step 2: Write the database schema**

Replace `prisma/schema.prisma` with:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum Role {
  USER
  ADMIN
}

enum ArticleType {
  NOTE
  INTERVIEW
}

enum ArticleStatus {
  DRAFT
  PUBLISHED
}

enum TagType {
  DIFFICULTY
  TOPIC
}

enum ProgressStatus {
  UNREAD
  READING
  DONE
}

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  password  String
  nickname  String
  avatar    String?
  role      Role     @default(USER)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  favorites Favorite[]
  progress  Progress[]
  comments  Comment[]
}

model Category {
  id          String     @id @default(cuid())
  name        String
  slug        String     @unique
  description String?
  icon        String?
  sortOrder   Int        @default(0)
  parentId    String?
  parent      Category?  @relation("CategoryTree", fields: [parentId], references: [id])
  children    Category[] @relation("CategoryTree")
  articles    Article[]
}

model Tag {
  id   String  @id @default(cuid())
  name String
  slug String  @unique
  type TagType

  articles ArticleTag[]
}

model Article {
  id         String        @id @default(cuid())
  title      String
  slug       String        @unique
  content    String
  summary    String?
  type       ArticleType
  status     ArticleStatus @default(DRAFT)
  sourceUrl  String?
  viewCount  Int           @default(0)
  categoryId String
  category   Category      @relation(fields: [categoryId], references: [id])
  createdAt  DateTime      @default(now())
  updatedAt  DateTime      @updatedAt

  tags      ArticleTag[]
  favorites Favorite[]
  progress  Progress[]
  comments  Comment[]
}

model ArticleTag {
  articleId String
  tagId     String
  article   Article @relation(fields: [articleId], references: [id], onDelete: Cascade)
  tag       Tag     @relation(fields: [tagId], references: [id], onDelete: Cascade)

  @@id([articleId, tagId])
}

model Favorite {
  id        String   @id @default(cuid())
  userId    String
  articleId String
  createdAt DateTime @default(now())
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  article   Article  @relation(fields: [articleId], references: [id], onDelete: Cascade)

  @@unique([userId, articleId])
}

model Progress {
  id        String         @id @default(cuid())
  userId    String
  articleId String
  status    ProgressStatus @default(UNREAD)
  updatedAt DateTime       @updatedAt
  user      User           @relation(fields: [userId], references: [id], onDelete: Cascade)
  article   Article        @relation(fields: [articleId], references: [id], onDelete: Cascade)

  @@unique([userId, articleId])
}

model Comment {
  id        String   @id @default(cuid())
  content   String
  userId    String
  articleId String
  createdAt DateTime @default(now())
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  article   Article  @relation(fields: [articleId], references: [id], onDelete: Cascade)
}
```

- [ ] **Step 3: Create Prisma client singleton**

Create `src/lib/prisma.ts`:

```typescript
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
```

- [ ] **Step 4: Generate Prisma client and push schema**

Ensure PostgreSQL is running (via Docker or local install), then:

```bash
npx prisma generate
npx prisma db push
```

Expected: Schema synced to database, Prisma Client generated without errors.

- [ ] **Step 5: Commit**

```bash
git add prisma/ src/lib/prisma.ts
git commit -m "feat: add Prisma schema with all data models"
```

---

## Task 3: Seed Data

**Files:**
- Create: `prisma/seed.ts`

- [ ] **Step 1: Install ts-node for seeding**

```bash
npm install -D ts-node
```

Add to `package.json`:

```json
"prisma": {
  "seed": "ts-node --compiler-options {\"module\":\"CommonJS\"} prisma/seed.ts"
}
```

- [ ] **Step 2: Write seed script**

Create `prisma/seed.ts`:

```typescript
import { PrismaClient, TagType, Role } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Create admin user
  const adminPassword = await hash("admin123", 12);
  await prisma.user.upsert({
    where: { email: "admin@androidhub.com" },
    update: {},
    create: {
      email: "admin@androidhub.com",
      password: adminPassword,
      nickname: "Admin",
      role: Role.ADMIN,
    },
  });

  // Create difficulty tags
  const difficultyTags = [
    { name: "初级", slug: "beginner", type: TagType.DIFFICULTY },
    { name: "中级", slug: "intermediate", type: TagType.DIFFICULTY },
    { name: "高级", slug: "advanced", type: TagType.DIFFICULTY },
  ];

  for (const tag of difficultyTags) {
    await prisma.tag.upsert({
      where: { slug: tag.slug },
      update: {},
      create: tag,
    });
  }

  // Create categories
  const categories = [
    { name: "四大组件", slug: "four-components", icon: "📦", sortOrder: 1 },
    { name: "Jetpack", slug: "jetpack", icon: "🚀", sortOrder: 2 },
    { name: "性能优化", slug: "performance", icon: "⚡", sortOrder: 3 },
    { name: "网络", slug: "networking", icon: "🌐", sortOrder: 4 },
    { name: "UI/自定义View", slug: "ui-custom-view", icon: "🎨", sortOrder: 5 },
    { name: "设计模式", slug: "design-patterns", icon: "🏗️", sortOrder: 6 },
    { name: "Kotlin", slug: "kotlin", icon: "🟣", sortOrder: 7 },
    { name: "Java 基础", slug: "java-basics", icon: "☕", sortOrder: 8 },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
  }

  // Create subcategories for "四大组件"
  const fourComponents = await prisma.category.findUnique({
    where: { slug: "four-components" },
  });

  if (fourComponents) {
    const subCategories = [
      { name: "Activity", slug: "activity", sortOrder: 1, parentId: fourComponents.id },
      { name: "Service", slug: "service", sortOrder: 2, parentId: fourComponents.id },
      { name: "BroadcastReceiver", slug: "broadcast-receiver", sortOrder: 3, parentId: fourComponents.id },
      { name: "ContentProvider", slug: "content-provider", sortOrder: 4, parentId: fourComponents.id },
    ];

    for (const sub of subCategories) {
      await prisma.category.upsert({
        where: { slug: sub.slug },
        update: {},
        create: sub,
      });
    }
  }

  console.log("Seed completed successfully");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

- [ ] **Step 3: Run seed**

```bash
npx prisma db seed
```

Expected: "Seed completed successfully"

- [ ] **Step 4: Commit**

```bash
git add prisma/seed.ts package.json
git commit -m "feat: add seed data with admin user, categories, and tags"
```

---

## Task 4: Authentication (NextAuth.js v5)

**Files:**
- Create: `src/lib/auth.ts`, `src/lib/auth-utils.ts`, `src/app/api/auth/[...nextauth]/route.ts`, `src/types/index.ts`
- Test: `__tests__/api/auth.test.ts`

- [ ] **Step 1: Write the auth test**

Create `__tests__/api/auth.test.ts`:

```typescript
import { hash, compare } from "bcryptjs";

describe("Auth utilities", () => {
  test("password hashing and comparison works", async () => {
    const password = "testpassword123";
    const hashed = await hash(password, 12);
    const isValid = await compare(password, hashed);
    expect(isValid).toBe(true);
  });

  test("wrong password fails comparison", async () => {
    const password = "testpassword123";
    const hashed = await hash(password, 12);
    const isValid = await compare("wrongpassword", hashed);
    expect(isValid).toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify it passes**

```bash
npm test -- __tests__/api/auth.test.ts
```

Expected: 2 tests pass.

- [ ] **Step 3: Create shared types**

Create `src/types/index.ts`:

```typescript
import { Article, Category, Tag, User, Comment, Favorite, Progress } from "@prisma/client";

export type ArticleWithRelations = Article & {
  category: Category;
  tags: { tag: Tag }[];
  _count: {
    favorites: number;
    comments: number;
  };
};

export type CategoryWithChildren = Category & {
  children: Category[];
};

export type CommentWithUser = Comment & {
  user: Pick<User, "id" | "nickname" | "avatar">;
};
```

- [ ] **Step 4: Configure NextAuth**

Create `src/lib/auth.ts`:

```typescript
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { prisma } from "./prisma";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        });

        if (!user) return null;

        const isValid = await compare(
          credentials.password as string,
          user.password
        );

        if (!isValid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.nickname,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role: string }).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
});
```

- [ ] **Step 5: Create auth utilities**

Create `src/lib/auth-utils.ts`:

```typescript
import { auth } from "./auth";

export async function getSession() {
  return await auth();
}

export async function requireAuth() {
  const session = await auth();
  if (!session?.user) {
    throw new Error("Unauthorized");
  }
  return session;
}

export async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("Forbidden");
  }
  return session;
}
```

- [ ] **Step 6: Create NextAuth route handler**

Create `src/app/api/auth/[...nextauth]/route.ts`:

```typescript
import { handlers } from "@/lib/auth";

export const { GET, POST } = handlers;
```

- [ ] **Step 7: Add NextAuth type augmentation**

Create `src/types/next-auth.d.ts`:

```typescript
import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
    } & DefaultSession["user"];
  }
}
```

- [ ] **Step 8: Commit**

```bash
git add src/lib/auth.ts src/lib/auth-utils.ts src/app/api/auth/ src/types/ __tests__/api/auth.test.ts
git commit -m "feat: add NextAuth.js v5 authentication with credentials provider"
```

---

## Task 5: User Registration API

**Files:**
- Create: `src/app/api/register/route.ts`
- Test: `__tests__/api/auth.test.ts` (extend)

- [ ] **Step 1: Write the registration test**

Add to `__tests__/api/auth.test.ts`:

```typescript
import { hash, compare } from "bcryptjs";

describe("Auth utilities", () => {
  test("password hashing and comparison works", async () => {
    const password = "testpassword123";
    const hashed = await hash(password, 12);
    const isValid = await compare(password, hashed);
    expect(isValid).toBe(true);
  });

  test("wrong password fails comparison", async () => {
    const password = "testpassword123";
    const hashed = await hash(password, 12);
    const isValid = await compare("wrongpassword", hashed);
    expect(isValid).toBe(false);
  });
});

describe("Registration validation", () => {
  function validateRegistration(data: {
    email?: string;
    password?: string;
    nickname?: string;
  }) {
    const errors: string[] = [];
    if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      errors.push("Invalid email");
    }
    if (!data.password || data.password.length < 6) {
      errors.push("Password must be at least 6 characters");
    }
    if (!data.nickname || data.nickname.trim().length === 0) {
      errors.push("Nickname is required");
    }
    return errors;
  }

  test("valid registration data passes", () => {
    const errors = validateRegistration({
      email: "test@example.com",
      password: "password123",
      nickname: "TestUser",
    });
    expect(errors).toHaveLength(0);
  });

  test("invalid email fails", () => {
    const errors = validateRegistration({
      email: "not-an-email",
      password: "password123",
      nickname: "TestUser",
    });
    expect(errors).toContain("Invalid email");
  });

  test("short password fails", () => {
    const errors = validateRegistration({
      email: "test@example.com",
      password: "12345",
      nickname: "TestUser",
    });
    expect(errors).toContain("Password must be at least 6 characters");
  });

  test("empty nickname fails", () => {
    const errors = validateRegistration({
      email: "test@example.com",
      password: "password123",
      nickname: "",
    });
    expect(errors).toContain("Nickname is required");
  });
});
```

- [ ] **Step 2: Run test to verify it passes**

```bash
npm test -- __tests__/api/auth.test.ts
```

Expected: 6 tests pass.

- [ ] **Step 3: Create registration API route**

Create `src/app/api/register/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const { email, password, nickname } = await request.json();

  // Validation
  const errors: string[] = [];
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push("Invalid email");
  }
  if (!password || password.length < 6) {
    errors.push("Password must be at least 6 characters");
  }
  if (!nickname || nickname.trim().length === 0) {
    errors.push("Nickname is required");
  }

  if (errors.length > 0) {
    return NextResponse.json({ errors }, { status: 400 });
  }

  // Check existing user
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json(
      { errors: ["Email already registered"] },
      { status: 409 }
    );
  }

  // Create user
  const hashedPassword = await hash(password, 12);
  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      nickname: nickname.trim(),
    },
  });

  return NextResponse.json(
    { id: user.id, email: user.email, nickname: user.nickname },
    { status: 201 }
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add src/app/api/register/ __tests__/api/auth.test.ts
git commit -m "feat: add user registration API with validation"
```

---

## Task 6: Article CRUD API

**Files:**
- Create: `src/app/api/articles/route.ts`, `src/app/api/articles/[id]/route.ts`
- Test: `__tests__/api/articles.test.ts`

- [ ] **Step 1: Write article slug generation test**

Create `__tests__/api/articles.test.ts`:

```typescript
describe("Article slug generation", () => {
  function generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\u4e00-\u9fff]+/g, "-")
      .replace(/^-|-$/g, "");
  }

  test("generates slug from English title", () => {
    expect(generateSlug("Activity Lifecycle Guide")).toBe(
      "activity-lifecycle-guide"
    );
  });

  test("generates slug from Chinese title", () => {
    const slug = generateSlug("Activity 生命周期详解");
    expect(slug).toBe("activity-生命周期详解");
  });

  test("handles special characters", () => {
    expect(generateSlug("What is Handler?")).toBe("what-is-handler");
  });
});
```

- [ ] **Step 2: Run test to verify it passes**

```bash
npm test -- __tests__/api/articles.test.ts
```

Expected: 3 tests pass.

- [ ] **Step 3: Create article list/create API**

Create `src/app/api/articles/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-utils";

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fff]+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");
  const categorySlug = searchParams.get("category");
  const tagSlug = searchParams.get("tag");
  const status = searchParams.get("status");
  const page = parseInt(searchParams.get("page") || "1");
  const pageSize = parseInt(searchParams.get("pageSize") || "20");

  const where: Record<string, unknown> = {};

  if (type) where.type = type;
  if (status) {
    where.status = status;
  } else {
    where.status = "PUBLISHED";
  }
  if (categorySlug) {
    where.category = { slug: categorySlug };
  }
  if (tagSlug) {
    where.tags = { some: { tag: { slug: tagSlug } } };
  }

  const [articles, total] = await Promise.all([
    prisma.article.findMany({
      where,
      include: {
        category: true,
        tags: { include: { tag: true } },
        _count: { select: { favorites: true, comments: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.article.count({ where }),
  ]);

  return NextResponse.json({
    articles,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  });
}

export async function POST(request: NextRequest) {
  await requireAdmin();

  const { title, content, summary, type, status, categoryId, tagIds } =
    await request.json();

  if (!title || !content || !type || !categoryId) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  let slug = generateSlug(title);
  const existing = await prisma.article.findUnique({ where: { slug } });
  if (existing) {
    slug = `${slug}-${Date.now()}`;
  }

  const article = await prisma.article.create({
    data: {
      title,
      slug,
      content,
      summary,
      type,
      status: status || "DRAFT",
      categoryId,
      tags: tagIds
        ? {
            create: tagIds.map((tagId: string) => ({ tagId })),
          }
        : undefined,
    },
    include: {
      category: true,
      tags: { include: { tag: true } },
    },
  });

  return NextResponse.json(article, { status: 201 });
}
```

- [ ] **Step 4: Create single article API**

Create `src/app/api/articles/[id]/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-utils";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const article = await prisma.article.findUnique({
    where: { id },
    include: {
      category: true,
      tags: { include: { tag: true } },
      _count: { select: { favorites: true, comments: true } },
    },
  });

  if (!article) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Increment view count
  await prisma.article.update({
    where: { id },
    data: { viewCount: { increment: 1 } },
  });

  return NextResponse.json(article);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await requireAdmin();
  const { id } = await params;

  const { title, content, summary, type, status, categoryId, tagIds } =
    await request.json();

  // Update tags: delete old, create new
  if (tagIds) {
    await prisma.articleTag.deleteMany({ where: { articleId: id } });
  }

  const article = await prisma.article.update({
    where: { id },
    data: {
      title,
      content,
      summary,
      type,
      status,
      categoryId,
      tags: tagIds
        ? {
            create: tagIds.map((tagId: string) => ({ tagId })),
          }
        : undefined,
    },
    include: {
      category: true,
      tags: { include: { tag: true } },
    },
  });

  return NextResponse.json(article);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await requireAdmin();
  const { id } = await params;

  await prisma.article.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
```

- [ ] **Step 5: Commit**

```bash
git add src/app/api/articles/ __tests__/api/articles.test.ts
git commit -m "feat: add article CRUD API with filtering and pagination"
```

---

## Task 7: Category & Tag APIs

**Files:**
- Create: `src/app/api/categories/route.ts`, `src/app/api/tags/route.ts`

- [ ] **Step 1: Create category API**

Create `src/app/api/categories/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-utils";

export async function GET() {
  const categories = await prisma.category.findMany({
    where: { parentId: null },
    include: {
      children: {
        orderBy: { sortOrder: "asc" },
      },
      _count: { select: { articles: true } },
    },
    orderBy: { sortOrder: "asc" },
  });

  return NextResponse.json(categories);
}

export async function POST(request: NextRequest) {
  await requireAdmin();

  const { name, slug, description, icon, sortOrder, parentId } =
    await request.json();

  if (!name || !slug) {
    return NextResponse.json(
      { error: "Name and slug are required" },
      { status: 400 }
    );
  }

  const category = await prisma.category.create({
    data: { name, slug, description, icon, sortOrder: sortOrder || 0, parentId },
  });

  return NextResponse.json(category, { status: 201 });
}

export async function PUT(request: NextRequest) {
  await requireAdmin();

  const { id, name, slug, description, icon, sortOrder, parentId } =
    await request.json();

  const category = await prisma.category.update({
    where: { id },
    data: { name, slug, description, icon, sortOrder, parentId },
  });

  return NextResponse.json(category);
}

export async function DELETE(request: NextRequest) {
  await requireAdmin();

  const { id } = await request.json();

  await prisma.category.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
```

- [ ] **Step 2: Create tag API**

Create `src/app/api/tags/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-utils";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");

  const where = type ? { type: type as "DIFFICULTY" | "TOPIC" } : {};

  const tags = await prisma.tag.findMany({
    where,
    orderBy: { name: "asc" },
  });

  return NextResponse.json(tags);
}

export async function POST(request: NextRequest) {
  await requireAdmin();

  const { name, slug, type } = await request.json();

  if (!name || !slug || !type) {
    return NextResponse.json(
      { error: "Name, slug, and type are required" },
      { status: 400 }
    );
  }

  const tag = await prisma.tag.create({
    data: { name, slug, type },
  });

  return NextResponse.json(tag, { status: 201 });
}

export async function DELETE(request: NextRequest) {
  await requireAdmin();

  const { id } = await request.json();

  await prisma.tag.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
```

- [ ] **Step 3: Commit**

```bash
git add src/app/api/categories/ src/app/api/tags/
git commit -m "feat: add category and tag CRUD APIs"
```

---

## Task 8: Favorite, Progress & Comment APIs

**Files:**
- Create: `src/app/api/favorites/route.ts`, `src/app/api/progress/route.ts`, `src/app/api/comments/route.ts`, `src/app/api/comments/[id]/route.ts`

- [ ] **Step 1: Create favorite toggle API**

Create `src/app/api/favorites/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-utils";

export async function GET(request: NextRequest) {
  const session = await requireAuth();
  const { searchParams } = new URL(request.url);
  const articleId = searchParams.get("articleId");

  if (articleId) {
    const favorite = await prisma.favorite.findUnique({
      where: {
        userId_articleId: {
          userId: session.user.id,
          articleId,
        },
      },
    });
    return NextResponse.json({ favorited: !!favorite });
  }

  const favorites = await prisma.favorite.findMany({
    where: { userId: session.user.id },
    include: {
      article: {
        include: {
          category: true,
          tags: { include: { tag: true } },
          _count: { select: { favorites: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(favorites);
}

export async function POST(request: NextRequest) {
  const session = await requireAuth();
  const { articleId } = await request.json();

  const existing = await prisma.favorite.findUnique({
    where: {
      userId_articleId: {
        userId: session.user.id,
        articleId,
      },
    },
  });

  if (existing) {
    await prisma.favorite.delete({ where: { id: existing.id } });
    return NextResponse.json({ favorited: false });
  }

  await prisma.favorite.create({
    data: { userId: session.user.id, articleId },
  });

  return NextResponse.json({ favorited: true });
}
```

- [ ] **Step 2: Create progress API**

Create `src/app/api/progress/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-utils";

export async function GET(request: NextRequest) {
  const session = await requireAuth();
  const { searchParams } = new URL(request.url);
  const articleId = searchParams.get("articleId");

  if (articleId) {
    const progress = await prisma.progress.findUnique({
      where: {
        userId_articleId: {
          userId: session.user.id,
          articleId,
        },
      },
    });
    return NextResponse.json({ status: progress?.status || "UNREAD" });
  }

  const progress = await prisma.progress.findMany({
    where: { userId: session.user.id },
    include: {
      article: {
        include: { category: true },
      },
    },
  });

  return NextResponse.json(progress);
}

export async function POST(request: NextRequest) {
  const session = await requireAuth();
  const { articleId, status } = await request.json();

  const progress = await prisma.progress.upsert({
    where: {
      userId_articleId: {
        userId: session.user.id,
        articleId,
      },
    },
    update: { status },
    create: {
      userId: session.user.id,
      articleId,
      status,
    },
  });

  return NextResponse.json(progress);
}
```

- [ ] **Step 3: Create comment API**

Create `src/app/api/comments/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-utils";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const articleId = searchParams.get("articleId");

  if (!articleId) {
    return NextResponse.json({ error: "articleId required" }, { status: 400 });
  }

  const comments = await prisma.comment.findMany({
    where: { articleId },
    include: {
      user: { select: { id: true, nickname: true, avatar: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(comments);
}

export async function POST(request: NextRequest) {
  const session = await requireAuth();
  const { articleId, content } = await request.json();

  if (!articleId || !content?.trim()) {
    return NextResponse.json(
      { error: "articleId and content required" },
      { status: 400 }
    );
  }

  const comment = await prisma.comment.create({
    data: {
      content: content.trim(),
      userId: session.user.id,
      articleId,
    },
    include: {
      user: { select: { id: true, nickname: true, avatar: true } },
    },
  });

  return NextResponse.json(comment, { status: 201 });
}
```

Create `src/app/api/comments/[id]/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-utils";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await requireAdmin();
  const { id } = await params;

  await prisma.comment.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
```

- [ ] **Step 4: Commit**

```bash
git add src/app/api/favorites/ src/app/api/progress/ src/app/api/comments/
git commit -m "feat: add favorite, progress, and comment APIs"
```

---

## Task 9: Search & Stats APIs

**Files:**
- Create: `src/app/api/search/route.ts`, `src/app/api/stats/route.ts`, `src/app/api/users/route.ts`

- [ ] **Step 1: Create search API**

Create `src/app/api/search/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q");
  const page = parseInt(searchParams.get("page") || "1");
  const pageSize = parseInt(searchParams.get("pageSize") || "20");

  if (!q || q.trim().length === 0) {
    return NextResponse.json({ articles: [], total: 0 });
  }

  const where = {
    status: "PUBLISHED" as const,
    OR: [
      { title: { contains: q, mode: "insensitive" as const } },
      { content: { contains: q, mode: "insensitive" as const } },
    ],
  };

  const [articles, total] = await Promise.all([
    prisma.article.findMany({
      where,
      include: {
        category: true,
        tags: { include: { tag: true } },
        _count: { select: { favorites: true, comments: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.article.count({ where }),
  ]);

  return NextResponse.json({
    articles,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  });
}
```

- [ ] **Step 2: Create stats API**

Create `src/app/api/stats/route.ts`:

```typescript
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-utils";

export async function GET() {
  await requireAdmin();

  const [
    noteCount,
    interviewCount,
    userCount,
    totalViews,
    totalFavorites,
    topArticles,
  ] = await Promise.all([
    prisma.article.count({ where: { type: "NOTE", status: "PUBLISHED" } }),
    prisma.article.count({ where: { type: "INTERVIEW", status: "PUBLISHED" } }),
    prisma.user.count(),
    prisma.article.aggregate({ _sum: { viewCount: true } }),
    prisma.favorite.count(),
    prisma.article.findMany({
      where: { status: "PUBLISHED" },
      include: {
        _count: { select: { favorites: true } },
        category: true,
      },
      orderBy: { favorites: { _count: "desc" } },
      take: 10,
    }),
  ]);

  return NextResponse.json({
    noteCount,
    interviewCount,
    userCount,
    totalViews: totalViews._sum.viewCount || 0,
    totalFavorites,
    topArticles,
  });
}
```

- [ ] **Step 3: Create users list API**

Create `src/app/api/users/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-utils";

export async function GET(request: NextRequest) {
  await requireAdmin();

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const pageSize = parseInt(searchParams.get("pageSize") || "20");

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      select: {
        id: true,
        email: true,
        nickname: true,
        avatar: true,
        role: true,
        createdAt: true,
        _count: { select: { favorites: true, comments: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.user.count(),
  ]);

  return NextResponse.json({ users, total, page, pageSize });
}
```

- [ ] **Step 4: Commit**

```bash
git add src/app/api/search/ src/app/api/stats/ src/app/api/users/
git commit -m "feat: add search, stats, and user list APIs"
```

---

## Task 10: Content Import Logic

**Files:**
- Create: `src/lib/import.ts`, `src/app/api/import/route.ts`
- Test: `__tests__/lib/import.test.ts`

- [ ] **Step 1: Install import dependencies**

```bash
npm install @mozilla/readability cheerio turndown jsdom
npm install -D @types/turndown @types/jsdom
```

- [ ] **Step 2: Write import logic test**

Create `__tests__/lib/import.test.ts`:

```typescript
import TurndownService from "turndown";

describe("Content import utilities", () => {
  test("HTML to Markdown conversion preserves code blocks", () => {
    const turndown = new TurndownService({
      codeBlockStyle: "fenced",
    });

    const html = `
      <h2>Example</h2>
      <pre><code class="language-kotlin">fun main() {
    println("Hello")
}</code></pre>
    `;

    const markdown = turndown.turndown(html);
    expect(markdown).toContain("## Example");
    expect(markdown).toContain("fun main()");
  });

  test("keyword matching finds relevant tags", () => {
    function matchTags(
      content: string,
      tagNames: string[]
    ): string[] {
      const lowerContent = content.toLowerCase();
      return tagNames.filter((tag) =>
        lowerContent.includes(tag.toLowerCase())
      );
    }

    const content = "Activity 的生命周期包括 onCreate 和 onResume";
    const tags = ["Activity", "Service", "Fragment", "Kotlin"];
    const matched = matchTags(content, tags);

    expect(matched).toContain("Activity");
    expect(matched).not.toContain("Service");
  });
});
```

- [ ] **Step 3: Run test to verify it passes**

```bash
npm test -- __tests__/lib/import.test.ts
```

Expected: 2 tests pass.

- [ ] **Step 4: Create import logic module**

Create `src/lib/import.ts`:

```typescript
import { JSDOM } from "jsdom";
import { Readability } from "@mozilla/readability";
import TurndownService from "turndown";
import * as cheerio from "cheerio";
import { prisma } from "./prisma";

interface ImportResult {
  title: string;
  content: string;
  suggestedCategoryId: string | null;
  suggestedTagIds: string[];
}

export async function importFromUrl(url: string): Promise<ImportResult> {
  // Fetch page
  const response = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (compatible; AndroidHub/1.0; Content Importer)",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch URL: ${response.status}`);
  }

  const html = await response.text();

  // Extract main content using Readability
  const dom = new JSDOM(html, { url });
  const reader = new Readability(dom.window.document);
  const article = reader.parse();

  if (!article) {
    throw new Error("Could not extract article content from URL");
  }

  // Convert HTML to Markdown
  const turndown = new TurndownService({
    headingStyle: "atx",
    codeBlockStyle: "fenced",
  });

  const markdown = turndown.turndown(article.content);
  const title = article.title;

  // Match categories and tags by keyword
  const fullText = `${title} ${markdown}`.toLowerCase();

  const categories = await prisma.category.findMany();
  const tags = await prisma.tag.findMany();

  // Find best matching category
  let suggestedCategoryId: string | null = null;
  for (const cat of categories) {
    if (fullText.includes(cat.name.toLowerCase())) {
      suggestedCategoryId = cat.id;
      break;
    }
  }

  // Find matching tags
  const suggestedTagIds = tags
    .filter((tag) => fullText.includes(tag.name.toLowerCase()))
    .map((tag) => tag.id);

  return {
    title,
    content: markdown,
    suggestedCategoryId,
    suggestedTagIds,
  };
}
```

- [ ] **Step 5: Create import API route**

Create `src/app/api/import/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-utils";
import { importFromUrl } from "@/lib/import";

export async function POST(request: NextRequest) {
  await requireAdmin();

  const { url, action } = await request.json();

  if (!url) {
    return NextResponse.json({ error: "URL is required" }, { status: 400 });
  }

  if (action === "preview") {
    // Preview: extract content and suggest metadata
    const result = await importFromUrl(url);

    // Resolve category and tag names for display
    let suggestedCategory = null;
    if (result.suggestedCategoryId) {
      suggestedCategory = await prisma.category.findUnique({
        where: { id: result.suggestedCategoryId },
      });
    }

    const suggestedTags = await prisma.tag.findMany({
      where: { id: { in: result.suggestedTagIds } },
    });

    return NextResponse.json({
      title: result.title,
      content: result.content,
      suggestedCategory,
      suggestedTags,
      suggestedCategoryId: result.suggestedCategoryId,
      suggestedTagIds: result.suggestedTagIds,
    });
  }

  if (action === "save") {
    // Save as draft article
    const { title, content, categoryId, tagIds, type } = await request.json();

    const slug =
      title
        .toLowerCase()
        .replace(/[^a-z0-9\u4e00-\u9fff]+/g, "-")
        .replace(/^-|-$/g, "") + `-${Date.now()}`;

    const article = await prisma.article.create({
      data: {
        title,
        slug,
        content,
        type: type || "NOTE",
        status: "DRAFT",
        sourceUrl: url,
        categoryId,
        tags: tagIds
          ? { create: tagIds.map((tagId: string) => ({ tagId })) }
          : undefined,
      },
      include: {
        category: true,
        tags: { include: { tag: true } },
      },
    });

    return NextResponse.json(article, { status: 201 });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
```

- [ ] **Step 6: Commit**

```bash
git add src/lib/import.ts src/app/api/import/ __tests__/lib/import.test.ts
git commit -m "feat: add content import from external URLs with readability extraction"
```

---

## Task 11: Shared UI Components

**Files:**
- Create: `src/components/navbar.tsx`, `src/components/theme-toggle.tsx`, `src/components/article-card.tsx`, `src/components/pagination.tsx`, `src/components/search-box.tsx`, `src/components/article-filters.tsx`

- [ ] **Step 1: Install UI dependencies**

```bash
npm install next-themes
```

- [ ] **Step 2: Create theme toggle component**

Create `src/components/theme-toggle.tsx`:

```tsx
"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
      aria-label="Toggle theme"
    >
      {theme === "dark" ? "☀️" : "🌙"}
    </button>
  );
}
```

- [ ] **Step 3: Create navbar component**

Create `src/components/navbar.tsx`:

```tsx
"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { ThemeToggle } from "./theme-toggle";
import { SearchBox } from "./search-box";

export function Navbar() {
  const { data: session } = useSession();

  return (
    <nav className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link
            href="/"
            className="font-bold text-lg text-gray-900 dark:text-white"
          >
            📱 AndroidHub
          </Link>
          <Link
            href="/notes"
            className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          >
            知识笔记
          </Link>
          <Link
            href="/interviews"
            className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          >
            面试题
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <SearchBox />
          <ThemeToggle />
          {session?.user ? (
            <div className="flex items-center gap-3">
              {session.user.role === "ADMIN" && (
                <Link
                  href="/admin"
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                >
                  管理后台
                </Link>
              )}
              <Link
                href="/profile"
                className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              >
                {session.user.name}
              </Link>
              <button
                onClick={() => signOut()}
                className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                退出
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="text-sm px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              登录
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
```

- [ ] **Step 4: Create search box component**

Create `src/components/search-box.tsx`:

```tsx
"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function SearchBox() {
  const [query, setQuery] = useState("");
  const router = useRouter();

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/notes?q=${encodeURIComponent(query.trim())}`);
    }
  }

  return (
    <form onSubmit={handleSearch} className="relative">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="搜索知识点..."
        className="w-48 px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
      />
    </form>
  );
}
```

- [ ] **Step 5: Create article card component**

Create `src/components/article-card.tsx`:

```tsx
import Link from "next/link";
import { ArticleWithRelations } from "@/types";

export function ArticleCard({ article }: { article: ArticleWithRelations }) {
  const difficultyTag = article.tags.find(
    (t) => t.tag.type === "DIFFICULTY"
  )?.tag;

  return (
    <Link
      href={`/articles/${article.slug}`}
      className="block p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg hover:border-blue-500 dark:hover:border-blue-500 transition-colors"
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-medium text-gray-900 dark:text-white">
          {article.title}
        </h3>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <span>⭐ {article._count.favorites}</span>
          <span>👁 {article.viewCount}</span>
        </div>
      </div>
      {article.summary && (
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
          {article.summary}
        </p>
      )}
      <div className="flex items-center gap-2">
        <span
          className={`text-xs px-2 py-0.5 rounded ${
            article.type === "NOTE"
              ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
              : "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300"
          }`}
        >
          {article.type === "NOTE" ? "笔记" : "面试"}
        </span>
        {difficultyTag && (
          <span className="text-xs px-2 py-0.5 rounded bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
            {difficultyTag.name}
          </span>
        )}
        <span className="text-xs text-gray-500">{article.category.name}</span>
      </div>
    </Link>
  );
}
```

- [ ] **Step 6: Create article filters component**

Create `src/components/article-filters.tsx`:

```tsx
"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Category, Tag } from "@prisma/client";

interface Props {
  categories: (Category & { children: Category[] })[];
  tags: Tag[];
  baseUrl: string;
}

export function ArticleFilters({ categories, tags, baseUrl }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentCategory = searchParams.get("category") || "";
  const currentTag = searchParams.get("tag") || "";

  function updateFilter(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete("page");
    router.push(`${baseUrl}?${params.toString()}`);
  }

  const difficultyTags = tags.filter((t) => t.type === "DIFFICULTY");
  const topicTags = tags.filter((t) => t.type === "TOPIC");

  return (
    <div className="flex flex-wrap gap-4 mb-6">
      <select
        value={currentCategory}
        onChange={(e) => updateFilter("category", e.target.value)}
        className="text-sm px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md"
      >
        <option value="">全部分类</option>
        {categories.map((cat) => (
          <optgroup key={cat.id} label={cat.name}>
            <option value={cat.slug}>{cat.name}</option>
            {cat.children.map((child) => (
              <option key={child.id} value={child.slug}>
                {child.name}
              </option>
            ))}
          </optgroup>
        ))}
      </select>

      <select
        value={currentTag}
        onChange={(e) => updateFilter("tag", e.target.value)}
        className="text-sm px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md"
      >
        <option value="">全部难度</option>
        {difficultyTags.map((tag) => (
          <option key={tag.id} value={tag.slug}>
            {tag.name}
          </option>
        ))}
      </select>

      {topicTags.length > 0 && (
        <div className="flex gap-2">
          {topicTags.map((tag) => (
            <button
              key={tag.id}
              onClick={() =>
                updateFilter("tag", currentTag === tag.slug ? "" : tag.slug)
              }
              className={`text-xs px-2 py-1 rounded-full border transition-colors ${
                currentTag === tag.slug
                  ? "bg-blue-600 text-white border-blue-600"
                  : "border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-blue-500"
              }`}
            >
              {tag.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 7: Create pagination component**

Create `src/components/pagination.tsx`:

```tsx
"use client";

import { useRouter, useSearchParams } from "next/navigation";

interface Props {
  currentPage: number;
  totalPages: number;
  baseUrl: string;
}

export function Pagination({ currentPage, totalPages, baseUrl }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  if (totalPages <= 1) return null;

  function goToPage(page: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());
    router.push(`${baseUrl}?${params.toString()}`);
  }

  return (
    <div className="flex items-center justify-center gap-2 mt-8">
      <button
        onClick={() => goToPage(currentPage - 1)}
        disabled={currentPage <= 1}
        className="px-3 py-1 text-sm rounded border border-gray-300 dark:border-gray-600 disabled:opacity-50 hover:bg-gray-100 dark:hover:bg-gray-800"
      >
        上一页
      </button>
      <span className="text-sm text-gray-600 dark:text-gray-400">
        {currentPage} / {totalPages}
      </span>
      <button
        onClick={() => goToPage(currentPage + 1)}
        disabled={currentPage >= totalPages}
        className="px-3 py-1 text-sm rounded border border-gray-300 dark:border-gray-600 disabled:opacity-50 hover:bg-gray-100 dark:hover:bg-gray-800"
      >
        下一页
      </button>
    </div>
  );
}
```

- [ ] **Step 8: Commit**

```bash
git add src/components/
git commit -m "feat: add shared UI components - navbar, search, filters, cards, pagination"
```

---

## Task 12: Root Layout & Theme Provider

**Files:**
- Modify: `src/app/layout.tsx`, `src/app/globals.css`

- [ ] **Step 1: Update root layout**

Replace `src/app/layout.tsx`:

```tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { SessionProvider } from "next-auth/react";
import { Navbar } from "@/components/navbar";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AndroidHub - Android 知识库",
  description: "系统化的 Android 知识笔记与面试题",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className={`${inter.className} bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100`}>
        <SessionProvider>
          <ThemeProvider attribute="class" defaultTheme="dark">
            <Navbar />
            <main>{children}</main>
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
```

- [ ] **Step 2: Update global styles**

Replace the content of `src/app/globals.css` with:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body {
    @apply antialiased;
  }
}
```

- [ ] **Step 3: Update Tailwind config for dark mode**

Ensure `tailwind.config.ts` has:

```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {},
  },
  plugins: [],
};

export default config;
```

- [ ] **Step 4: Verify dev server runs**

```bash
npm run dev
```

Expected: Homepage loads at `http://localhost:3000` with navbar and dark theme. Stop with Ctrl+C.

- [ ] **Step 5: Commit**

```bash
git add src/app/layout.tsx src/app/globals.css tailwind.config.ts
git commit -m "feat: add root layout with theme provider, session provider, and navbar"
```

---

## Task 13: Homepage

**Files:**
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Build the homepage**

Replace `src/app/page.tsx`:

```tsx
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ArticleCard } from "@/components/article-card";

export default async function HomePage() {
  const [categories, latestArticles] = await Promise.all([
    prisma.category.findMany({
      where: { parentId: null },
      orderBy: { sortOrder: "asc" },
    }),
    prisma.article.findMany({
      where: { status: "PUBLISHED" },
      include: {
        category: true,
        tags: { include: { tag: true } },
        _count: { select: { favorites: true, comments: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
  ]);

  return (
    <div className="max-w-7xl mx-auto">
      {/* Hero */}
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 dark:from-gray-950 dark:to-gray-900 px-8 py-16 text-center">
        <h1 className="text-3xl font-bold text-white mb-3">
          Android 知识库
        </h1>
        <p className="text-gray-400 mb-6">
          系统化的 Android 知识笔记与面试题
        </p>
        <form action="/notes" className="max-w-md mx-auto">
          <input
            type="text"
            name="q"
            placeholder="🔍 搜索知识点或面试题..."
            className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-sm text-gray-300 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </form>
      </div>

      <div className="px-8 py-8">
        {/* Knowledge Modules */}
        <h2 className="text-lg font-semibold mb-4">知识模块</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-10">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/categories/${cat.slug}`}
              className="flex flex-col items-center p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg hover:border-blue-500 dark:hover:border-blue-500 transition-colors"
            >
              <span className="text-2xl mb-2">{cat.icon}</span>
              <span className="text-sm font-medium">{cat.name}</span>
            </Link>
          ))}
        </div>

        {/* Latest Articles */}
        <h2 className="text-lg font-semibold mb-4">最新文章</h2>
        <div className="space-y-3">
          {latestArticles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
        {latestArticles.length === 0 && (
          <p className="text-gray-500 text-center py-8">
            暂无文章，请在后台添加内容
          </p>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify homepage renders**

```bash
npm run dev
```

Expected: Homepage shows hero section, category grid, and latest articles section. Stop with Ctrl+C.

- [ ] **Step 3: Commit**

```bash
git add src/app/page.tsx
git commit -m "feat: add homepage with category grid and latest articles"
```

---

## Task 14: Login & Register Pages

**Files:**
- Create: `src/app/login/page.tsx`, `src/app/register/page.tsx`

- [ ] **Step 1: Create login page**

Create `src/app/login/page.tsx`:

```tsx
"use client";

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("邮箱或密码错误");
    } else {
      router.push("/");
      router.refresh();
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="w-full max-w-sm p-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg">
        <h1 className="text-xl font-bold text-center mb-6">登录</h1>

        {error && (
          <div className="mb-4 p-3 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">邮箱</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">密码</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "登录中..." : "登录"}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-500">
          没有账号？{" "}
          <Link href="/register" className="text-blue-600 hover:underline">
            注册
          </Link>
        </p>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create register page**

Create `src/app/register/page.tsx`:

```tsx
"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nickname, setNickname] = useState("");
  const [errors, setErrors] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors([]);
    setLoading(true);

    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, nickname }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setErrors(data.errors || ["注册失败"]);
    } else {
      router.push("/login");
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="w-full max-w-sm p-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg">
        <h1 className="text-xl font-bold text-center mb-6">注册</h1>

        {errors.length > 0 && (
          <div className="mb-4 p-3 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 rounded">
            {errors.map((err, i) => (
              <p key={i}>{err}</p>
            ))}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">昵称</label>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              required
              className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">邮箱</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              密码（至少6位）
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "注册中..." : "注册"}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-500">
          已有账号？{" "}
          <Link href="/login" className="text-blue-600 hover:underline">
            登录
          </Link>
        </p>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/app/login/ src/app/register/
git commit -m "feat: add login and register pages"
```

---

## Task 15: Article List Pages (Notes & Interviews)

**Files:**
- Create: `src/app/notes/page.tsx`, `src/app/interviews/page.tsx`, `src/app/categories/[slug]/page.tsx`

- [ ] **Step 1: Create notes list page**

Create `src/app/notes/page.tsx`:

```tsx
import { prisma } from "@/lib/prisma";
import { ArticleCard } from "@/components/article-card";
import { ArticleFilters } from "@/components/article-filters";
import { Pagination } from "@/components/pagination";

interface Props {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}

export default async function NotesPage({ searchParams }: Props) {
  const params = await searchParams;
  const page = parseInt(params.page || "1");
  const pageSize = 20;
  const categorySlug = params.category;
  const tagSlug = params.tag;
  const q = params.q;

  const where: Record<string, unknown> = {
    type: "NOTE",
    status: "PUBLISHED",
  };

  if (categorySlug) where.category = { slug: categorySlug };
  if (tagSlug) where.tags = { some: { tag: { slug: tagSlug } } };
  if (q) {
    where.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { content: { contains: q, mode: "insensitive" } },
    ];
  }

  const [articles, total, categories, tags] = await Promise.all([
    prisma.article.findMany({
      where,
      include: {
        category: true,
        tags: { include: { tag: true } },
        _count: { select: { favorites: true, comments: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.article.count({ where }),
    prisma.category.findMany({
      where: { parentId: null },
      include: { children: { orderBy: { sortOrder: "asc" } } },
      orderBy: { sortOrder: "asc" },
    }),
    prisma.tag.findMany({ orderBy: { name: "asc" } }),
  ]);

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="max-w-5xl mx-auto px-8 py-8">
      <h1 className="text-2xl font-bold mb-6">知识笔记</h1>

      <ArticleFilters categories={categories} tags={tags} baseUrl="/notes" />

      {q && (
        <p className="text-sm text-gray-500 mb-4">
          搜索 &quot;{q}&quot; 共 {total} 条结果
        </p>
      )}

      <div className="space-y-3">
        {articles.map((article) => (
          <ArticleCard key={article.id} article={article} />
        ))}
      </div>

      {articles.length === 0 && (
        <p className="text-gray-500 text-center py-12">暂无内容</p>
      )}

      <Pagination currentPage={page} totalPages={totalPages} baseUrl="/notes" />
    </div>
  );
}
```

- [ ] **Step 2: Create interviews list page**

Create `src/app/interviews/page.tsx`:

```tsx
import { prisma } from "@/lib/prisma";
import { ArticleCard } from "@/components/article-card";
import { ArticleFilters } from "@/components/article-filters";
import { Pagination } from "@/components/pagination";

interface Props {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}

export default async function InterviewsPage({ searchParams }: Props) {
  const params = await searchParams;
  const page = parseInt(params.page || "1");
  const pageSize = 20;
  const categorySlug = params.category;
  const tagSlug = params.tag;
  const q = params.q;

  const where: Record<string, unknown> = {
    type: "INTERVIEW",
    status: "PUBLISHED",
  };

  if (categorySlug) where.category = { slug: categorySlug };
  if (tagSlug) where.tags = { some: { tag: { slug: tagSlug } } };
  if (q) {
    where.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { content: { contains: q, mode: "insensitive" } },
    ];
  }

  const [articles, total, categories, tags] = await Promise.all([
    prisma.article.findMany({
      where,
      include: {
        category: true,
        tags: { include: { tag: true } },
        _count: { select: { favorites: true, comments: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.article.count({ where }),
    prisma.category.findMany({
      where: { parentId: null },
      include: { children: { orderBy: { sortOrder: "asc" } } },
      orderBy: { sortOrder: "asc" },
    }),
    prisma.tag.findMany({ orderBy: { name: "asc" } }),
  ]);

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="max-w-5xl mx-auto px-8 py-8">
      <h1 className="text-2xl font-bold mb-6">面试题</h1>

      <ArticleFilters
        categories={categories}
        tags={tags}
        baseUrl="/interviews"
      />

      {q && (
        <p className="text-sm text-gray-500 mb-4">
          搜索 &quot;{q}&quot; 共 {total} 条结果
        </p>
      )}

      <div className="space-y-3">
        {articles.map((article) => (
          <ArticleCard key={article.id} article={article} />
        ))}
      </div>

      {articles.length === 0 && (
        <p className="text-gray-500 text-center py-12">暂无内容</p>
      )}

      <Pagination
        currentPage={page}
        totalPages={totalPages}
        baseUrl="/interviews"
      />
    </div>
  );
}
```

- [ ] **Step 3: Create category page**

Create `src/app/categories/[slug]/page.tsx`:

```tsx
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ArticleCard } from "@/components/article-card";
import { Pagination } from "@/components/pagination";

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | undefined }>;
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { page: pageStr } = await searchParams;
  const page = parseInt(pageStr || "1");
  const pageSize = 20;

  const category = await prisma.category.findUnique({
    where: { slug },
    include: { children: true },
  });

  if (!category) notFound();

  // Include articles from child categories too
  const categoryIds = [category.id, ...category.children.map((c) => c.id)];

  const where = {
    categoryId: { in: categoryIds },
    status: "PUBLISHED" as const,
  };

  const [articles, total] = await Promise.all([
    prisma.article.findMany({
      where,
      include: {
        category: true,
        tags: { include: { tag: true } },
        _count: { select: { favorites: true, comments: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.article.count({ where }),
  ]);

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="max-w-5xl mx-auto px-8 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">
          {category.icon} {category.name}
        </h1>
        {category.description && (
          <p className="text-gray-500 mt-1">{category.description}</p>
        )}
      </div>

      {category.children.length > 0 && (
        <div className="flex gap-2 mb-6">
          {category.children.map((child) => (
            <a
              key={child.id}
              href={`/categories/${child.slug}`}
              className="text-sm px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              {child.name}
            </a>
          ))}
        </div>
      )}

      <div className="space-y-3">
        {articles.map((article) => (
          <ArticleCard key={article.id} article={article} />
        ))}
      </div>

      {articles.length === 0 && (
        <p className="text-gray-500 text-center py-12">暂无内容</p>
      )}

      <Pagination
        currentPage={page}
        totalPages={totalPages}
        baseUrl={`/categories/${slug}`}
      />
    </div>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add src/app/notes/ src/app/interviews/ src/app/categories/
git commit -m "feat: add notes, interviews, and category list pages with filtering"
```

---

## Task 16: Article Detail Page (Three-Column Layout)

**Files:**
- Create: `src/components/markdown-renderer.tsx`, `src/components/toc.tsx`, `src/components/category-nav.tsx`, `src/components/favorite-button.tsx`, `src/components/progress-button.tsx`, `src/components/comment-section.tsx`, `src/app/articles/[slug]/page.tsx`

- [ ] **Step 1: Install markdown dependencies**

```bash
npm install react-markdown remark-gfm rehype-pretty-code shiki
```

- [ ] **Step 2: Create markdown renderer**

Create `src/components/markdown-renderer.tsx`:

```tsx
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export function MarkdownRenderer({ content }: { content: string }) {
  return (
    <div className="prose prose-sm dark:prose-invert max-w-none prose-headings:scroll-mt-20 prose-pre:bg-gray-900 prose-pre:border prose-pre:border-gray-800">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </div>
  );
}
```

- [ ] **Step 3: Create TOC component**

Create `src/components/toc.tsx`:

```tsx
"use client";

import { useEffect, useState } from "react";

interface TocItem {
  id: string;
  text: string;
  level: number;
}

export function Toc({ content }: { content: string }) {
  const [activeId, setActiveId] = useState("");

  const headings: TocItem[] = content
    .split("\n")
    .filter((line) => /^#{2,4}\s/.test(line))
    .map((line) => {
      const match = line.match(/^(#{2,4})\s+(.+)/);
      if (!match) return null;
      const text = match[2].trim();
      const id = text
        .toLowerCase()
        .replace(/[^a-z0-9\u4e00-\u9fff]+/g, "-")
        .replace(/^-|-$/g, "");
      return { id, text, level: match[1].length };
    })
    .filter(Boolean) as TocItem[];

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.find((e) => e.isIntersecting);
        if (visible) setActiveId(visible.target.id);
      },
      { rootMargin: "-80px 0px -80% 0px" }
    );

    headings.forEach((h) => {
      const el = document.getElementById(h.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [headings]);

  if (headings.length === 0) return null;

  return (
    <nav className="space-y-1">
      <p className="text-xs font-medium text-gray-500 uppercase mb-2">目录</p>
      {headings.map((h) => (
        <a
          key={h.id}
          href={`#${h.id}`}
          className={`block text-xs py-0.5 transition-colors ${
            h.level === 3 ? "pl-3" : h.level === 4 ? "pl-6" : ""
          } ${
            activeId === h.id
              ? "text-blue-600 dark:text-blue-400"
              : "text-gray-500 hover:text-gray-900 dark:hover:text-gray-300"
          }`}
        >
          {h.text}
        </a>
      ))}
    </nav>
  );
}
```

- [ ] **Step 4: Create category nav component**

Create `src/components/category-nav.tsx`:

```tsx
import Link from "next/link";

interface Article {
  id: string;
  title: string;
  slug: string;
}

interface Props {
  articles: Article[];
  currentSlug: string;
  categoryName: string;
}

export function CategoryNav({ articles, currentSlug, categoryName }: Props) {
  return (
    <nav>
      <p className="text-xs font-medium text-gray-500 uppercase mb-2">
        {categoryName}
      </p>
      <div className="space-y-0.5">
        {articles.map((article) => (
          <Link
            key={article.id}
            href={`/articles/${article.slug}`}
            className={`block text-xs py-1.5 px-2 rounded transition-colors ${
              article.slug === currentSlug
                ? "bg-blue-600 text-white"
                : "text-gray-400 hover:text-white hover:bg-gray-800"
            }`}
          >
            {article.title}
          </Link>
        ))}
      </div>
    </nav>
  );
}
```

- [ ] **Step 5: Create favorite button**

Create `src/components/favorite-button.tsx`:

```tsx
"use client";

import { useSession } from "next-auth/react";
import { useState } from "react";

export function FavoriteButton({
  articleId,
  initialFavorited,
  count,
}: {
  articleId: string;
  initialFavorited: boolean;
  count: number;
}) {
  const { data: session } = useSession();
  const [favorited, setFavorited] = useState(initialFavorited);
  const [favCount, setFavCount] = useState(count);

  async function toggle() {
    if (!session) return;

    const res = await fetch("/api/favorites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ articleId }),
    });

    const data = await res.json();
    setFavorited(data.favorited);
    setFavCount((c) => (data.favorited ? c + 1 : c - 1));
  }

  return (
    <button
      onClick={toggle}
      disabled={!session}
      className={`w-full text-sm py-1.5 rounded border transition-colors ${
        favorited
          ? "bg-yellow-500/20 border-yellow-500 text-yellow-500"
          : "border-gray-700 text-gray-400 hover:border-gray-500"
      } disabled:opacity-50`}
    >
      {favorited ? "⭐" : "☆"} 收藏 ({favCount})
    </button>
  );
}
```

- [ ] **Step 6: Create progress button**

Create `src/components/progress-button.tsx`:

```tsx
"use client";

import { useSession } from "next-auth/react";
import { useState } from "react";

const STATUS_MAP = {
  UNREAD: { label: "未读", next: "READING", icon: "📖" },
  READING: { label: "在读", next: "DONE", icon: "📚" },
  DONE: { label: "已完成", next: "UNREAD", icon: "✅" },
};

export function ProgressButton({
  articleId,
  initialStatus,
}: {
  articleId: string;
  initialStatus: string;
}) {
  const { data: session } = useSession();
  const [status, setStatus] = useState(initialStatus || "UNREAD");

  const current = STATUS_MAP[status as keyof typeof STATUS_MAP];

  async function cycle() {
    if (!session) return;

    const nextStatus = current.next;
    const res = await fetch("/api/progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ articleId, status: nextStatus }),
    });

    if (res.ok) setStatus(nextStatus);
  }

  return (
    <button
      onClick={cycle}
      disabled={!session}
      className="w-full text-sm py-1.5 rounded border border-gray-700 text-gray-400 hover:border-gray-500 transition-colors disabled:opacity-50"
    >
      {current.icon} {current.label}
    </button>
  );
}
```

- [ ] **Step 7: Create comment section**

Create `src/components/comment-section.tsx`:

```tsx
"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { CommentWithUser } from "@/types";

export function CommentSection({ articleId }: { articleId: string }) {
  const { data: session } = useSession();
  const [comments, setComments] = useState<CommentWithUser[]>([]);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch(`/api/comments?articleId=${articleId}`)
      .then((r) => r.json())
      .then(setComments);
  }, [articleId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;

    setLoading(true);
    const res = await fetch("/api/comments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ articleId, content }),
    });

    if (res.ok) {
      const comment = await res.json();
      setComments([comment, ...comments]);
      setContent("");
    }
    setLoading(false);
  }

  return (
    <div className="border-t border-gray-800 mt-8 pt-6">
      <h3 className="text-sm font-semibold mb-4">
        💬 评论纠错 ({comments.length})
      </h3>

      {session && (
        <form onSubmit={handleSubmit} className="mb-4">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="写下你的评论或纠错..."
            rows={3}
            className="w-full px-3 py-2 text-sm bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
          />
          <button
            type="submit"
            disabled={loading || !content.trim()}
            className="mt-2 px-4 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "提交中..." : "提交"}
          </button>
        </form>
      )}

      <div className="space-y-3">
        {comments.map((comment) => (
          <div
            key={comment.id}
            className="bg-gray-900 border border-gray-800 rounded-md p-3"
          >
            <div className="text-xs text-blue-400 mb-1">
              @{comment.user.nickname} ·{" "}
              {new Date(comment.createdAt).toLocaleDateString("zh-CN")}
            </div>
            <p className="text-sm text-gray-300">{comment.content}</p>
          </div>
        ))}
      </div>

      {!session && (
        <p className="text-sm text-gray-500 text-center py-4">
          <a href="/login" className="text-blue-500 hover:underline">
            登录
          </a>{" "}
          后参与评论
        </p>
      )}
    </div>
  );
}
```

- [ ] **Step 8: Create article detail page**

Create `src/app/articles/[slug]/page.tsx`:

```tsx
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { MarkdownRenderer } from "@/components/markdown-renderer";
import { Toc } from "@/components/toc";
import { CategoryNav } from "@/components/category-nav";
import { FavoriteButton } from "@/components/favorite-button";
import { ProgressButton } from "@/components/progress-button";
import { CommentSection } from "@/components/comment-section";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function ArticleDetailPage({ params }: Props) {
  const { slug } = await params;

  const article = await prisma.article.findUnique({
    where: { slug },
    include: {
      category: true,
      tags: { include: { tag: true } },
      _count: { select: { favorites: true, comments: true } },
    },
  });

  if (!article || article.status !== "PUBLISHED") notFound();

  // Increment view count
  await prisma.article.update({
    where: { id: article.id },
    data: { viewCount: { increment: 1 } },
  });

  // Get articles in same category for left nav
  const categoryArticles = await prisma.article.findMany({
    where: { categoryId: article.categoryId, status: "PUBLISHED" },
    select: { id: true, title: true, slug: true },
    orderBy: { createdAt: "asc" },
  });

  // Get user-specific data
  const session = await auth();
  let favorited = false;
  let progressStatus = "UNREAD";

  if (session?.user) {
    const [fav, progress] = await Promise.all([
      prisma.favorite.findUnique({
        where: {
          userId_articleId: {
            userId: session.user.id,
            articleId: article.id,
          },
        },
      }),
      prisma.progress.findUnique({
        where: {
          userId_articleId: {
            userId: session.user.id,
            articleId: article.id,
          },
        },
      }),
    ]);
    favorited = !!fav;
    progressStatus = progress?.status || "UNREAD";
  }

  const difficultyTag = article.tags.find(
    (t) => t.tag.type === "DIFFICULTY"
  )?.tag;

  return (
    <div className="max-w-7xl mx-auto">
      {/* Breadcrumb */}
      <div className="px-4 py-2 text-xs text-gray-500 border-b border-gray-800">
        <a href="/" className="hover:text-gray-300">
          首页
        </a>{" "}
        /{" "}
        <a
          href={`/categories/${article.category.slug}`}
          className="hover:text-gray-300"
        >
          {article.category.name}
        </a>{" "}
        / {article.title}
      </div>

      <div className="flex min-h-[calc(100vh-8rem)]">
        {/* Left: Category Nav */}
        <aside className="w-52 flex-shrink-0 border-r border-gray-800 p-4 hidden lg:block overflow-y-auto">
          <CategoryNav
            articles={categoryArticles}
            currentSlug={slug}
            categoryName={article.category.name}
          />
        </aside>

        {/* Center: Content */}
        <article className="flex-1 px-8 py-6 min-w-0 overflow-y-auto">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-xl font-bold">{article.title}</h1>
            <div className="flex items-center gap-3 text-xs text-gray-500">
              <span>⭐ {article._count.favorites}</span>
              <span>👁 {article.viewCount}</span>
            </div>
          </div>

          <div className="flex gap-2 mb-6">
            <span
              className={`text-xs px-2 py-0.5 rounded ${
                article.type === "NOTE"
                  ? "bg-blue-900 text-blue-300"
                  : "bg-purple-900 text-purple-300"
              }`}
            >
              {article.type === "NOTE" ? "笔记" : "面试"}
            </span>
            {difficultyTag && (
              <span className="text-xs px-2 py-0.5 rounded bg-green-900 text-green-300">
                {difficultyTag.name}
              </span>
            )}
            <span className="text-xs px-2 py-0.5 rounded bg-gray-800 text-gray-400">
              {article.category.name}
            </span>
          </div>

          <MarkdownRenderer content={article.content} />

          <CommentSection articleId={article.id} />
        </article>

        {/* Right: TOC + Actions */}
        <aside className="w-44 flex-shrink-0 border-l border-gray-800 p-4 hidden xl:block">
          <Toc content={article.content} />
          <div className="mt-6 space-y-2">
            <FavoriteButton
              articleId={article.id}
              initialFavorited={favorited}
              count={article._count.favorites}
            />
            <ProgressButton
              articleId={article.id}
              initialStatus={progressStatus}
            />
          </div>
        </aside>
      </div>
    </div>
  );
}
```

- [ ] **Step 9: Commit**

```bash
git add src/components/markdown-renderer.tsx src/components/toc.tsx src/components/category-nav.tsx src/components/favorite-button.tsx src/components/progress-button.tsx src/components/comment-section.tsx src/app/articles/
git commit -m "feat: add article detail page with 3-column layout, TOC, favorites, progress, comments"
```

---

## Task 17: User Profile Page

**Files:**
- Create: `src/app/profile/page.tsx`

- [ ] **Step 1: Create profile page**

Create `src/app/profile/page.tsx`:

```tsx
import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const [favorites, progress] = await Promise.all([
    prisma.favorite.findMany({
      where: { userId: session.user.id },
      include: {
        article: {
          include: {
            category: true,
            tags: { include: { tag: true } },
            _count: { select: { favorites: true, comments: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.progress.findMany({
      where: { userId: session.user.id },
      include: {
        article: { include: { category: true } },
      },
    }),
  ]);

  // Group progress by category
  const progressByCategory = progress.reduce(
    (acc, p) => {
      const catName = p.article.category.name;
      if (!acc[catName]) acc[catName] = { total: 0, done: 0 };
      acc[catName].total++;
      if (p.status === "DONE") acc[catName].done++;
      return acc;
    },
    {} as Record<string, { total: number; done: number }>
  );

  return (
    <div className="max-w-4xl mx-auto px-8 py-8">
      <h1 className="text-2xl font-bold mb-8">个人中心</h1>

      {/* Progress Summary */}
      <section className="mb-10">
        <h2 className="text-lg font-semibold mb-4">学习进度</h2>
        {Object.keys(progressByCategory).length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {Object.entries(progressByCategory).map(([cat, stats]) => (
              <div
                key={cat}
                className="p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg"
              >
                <p className="text-sm font-medium mb-2">{cat}</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500 rounded-full"
                      style={{
                        width: `${(stats.done / stats.total) * 100}%`,
                      }}
                    />
                  </div>
                  <span className="text-xs text-gray-500">
                    {stats.done}/{stats.total}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-sm">暂无学习记录</p>
        )}
      </section>

      {/* Favorites */}
      <section>
        <h2 className="text-lg font-semibold mb-4">
          我的收藏 ({favorites.length})
        </h2>
        {favorites.length > 0 ? (
          <div className="space-y-2">
            {favorites.map((fav) => (
              <Link
                key={fav.id}
                href={`/articles/${fav.article.slug}`}
                className="block p-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg hover:border-blue-500 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">
                    {fav.article.title}
                  </span>
                  <span className="text-xs text-gray-500">
                    {fav.article.category.name}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-sm">暂无收藏</p>
        )}
      </section>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/profile/
git commit -m "feat: add user profile page with learning progress and favorites"
```

---

## Task 18: Admin Layout & Dashboard

**Files:**
- Create: `src/components/admin/sidebar.tsx`, `src/components/admin/stats-card.tsx`, `src/app/admin/layout.tsx`, `src/app/admin/page.tsx`

- [ ] **Step 1: Create admin sidebar**

Create `src/components/admin/sidebar.tsx`:

```tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const menuItems = [
  { href: "/admin", label: "仪表盘", icon: "📊" },
  { href: "/admin/articles", label: "文章管理", icon: "📝" },
  { href: "/admin/categories", label: "分类管理", icon: "📁" },
  { href: "/admin/tags", label: "标签管理", icon: "🏷️" },
  { href: "/admin/comments", label: "评论管理", icon: "💬" },
  { href: "/admin/users", label: "用户管理", icon: "👥" },
  { href: "/admin/import", label: "内容采集", icon: "📥" },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-52 flex-shrink-0 border-r border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 min-h-[calc(100vh-3.5rem)]">
      <div className="p-4">
        <h2 className="text-sm font-semibold text-gray-500 uppercase mb-4">
          管理后台
        </h2>
        <nav className="space-y-1">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors ${
                pathname === item.href
                  ? "bg-blue-600 text-white"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800"
              }`}
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </aside>
  );
}
```

- [ ] **Step 2: Create stats card**

Create `src/components/admin/stats-card.tsx`:

```tsx
export function StatsCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: number | string;
  icon: string;
}) {
  return (
    <div className="p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg">
      <div className="flex items-center justify-between mb-2">
        <span className="text-2xl">{icon}</span>
      </div>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs text-gray-500 mt-1">{label}</p>
    </div>
  );
}
```

- [ ] **Step 3: Create admin layout**

Create `src/app/admin/layout.tsx`:

```tsx
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { AdminSidebar } from "@/components/admin/sidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/login");
  }

  return (
    <div className="flex">
      <AdminSidebar />
      <div className="flex-1 p-6">{children}</div>
    </div>
  );
}
```

- [ ] **Step 4: Create dashboard page**

Create `src/app/admin/page.tsx`:

```tsx
import { prisma } from "@/lib/prisma";
import { StatsCard } from "@/components/admin/stats-card";
import Link from "next/link";

export default async function AdminDashboard() {
  const [noteCount, interviewCount, userCount, totalViews, totalFavorites, topArticles] =
    await Promise.all([
      prisma.article.count({ where: { type: "NOTE", status: "PUBLISHED" } }),
      prisma.article.count({ where: { type: "INTERVIEW", status: "PUBLISHED" } }),
      prisma.user.count(),
      prisma.article.aggregate({ _sum: { viewCount: true } }),
      prisma.favorite.count(),
      prisma.article.findMany({
        where: { status: "PUBLISHED" },
        include: {
          _count: { select: { favorites: true } },
          category: true,
        },
        orderBy: { favorites: { _count: "desc" } },
        take: 10,
      }),
    ]);

  return (
    <div>
      <h1 className="text-xl font-bold mb-6">仪表盘</h1>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <StatsCard label="知识笔记" value={noteCount} icon="📝" />
        <StatsCard label="面试题" value={interviewCount} icon="💬" />
        <StatsCard label="注册用户" value={userCount} icon="👥" />
        <StatsCard label="总浏览量" value={totalViews._sum.viewCount || 0} icon="👁" />
        <StatsCard label="总收藏数" value={totalFavorites} icon="⭐" />
      </div>

      <h2 className="text-lg font-semibold mb-4">收藏排行 Top 10</h2>
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="text-left px-4 py-2 font-medium">排名</th>
              <th className="text-left px-4 py-2 font-medium">文章</th>
              <th className="text-left px-4 py-2 font-medium">分类</th>
              <th className="text-right px-4 py-2 font-medium">收藏数</th>
            </tr>
          </thead>
          <tbody>
            {topArticles.map((article, i) => (
              <tr key={article.id} className="border-t border-gray-200 dark:border-gray-800">
                <td className="px-4 py-2 text-gray-500">{i + 1}</td>
                <td className="px-4 py-2">
                  <Link href={`/admin/articles/${article.id}`} className="text-blue-600 hover:underline">
                    {article.title}
                  </Link>
                </td>
                <td className="px-4 py-2 text-gray-500">{article.category.name}</td>
                <td className="px-4 py-2 text-right">{article._count.favorites}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Commit**

```bash
git add src/components/admin/ src/app/admin/layout.tsx src/app/admin/page.tsx
git commit -m "feat: add admin layout with sidebar and dashboard with stats"
```

---

## Task 19: Admin Article Management

**Files:**
- Create: `src/app/admin/articles/page.tsx`, `src/app/admin/articles/[id]/page.tsx`, `src/components/admin/article-form.tsx`

- [ ] **Step 1: Create article list management page**

Create `src/app/admin/articles/page.tsx`:

```tsx
import Link from "next/link";
import { prisma } from "@/lib/prisma";

interface Props {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}

export default async function AdminArticlesPage({ searchParams }: Props) {
  const params = await searchParams;
  const page = parseInt(params.page || "1");
  const status = params.status;
  const type = params.type;
  const pageSize = 20;

  const where: Record<string, unknown> = {};
  if (status) where.status = status;
  if (type) where.type = type;

  const [articles, total] = await Promise.all([
    prisma.article.findMany({
      where,
      include: { category: true },
      orderBy: { updatedAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.article.count({ where }),
  ]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold">文章管理</h1>
        <Link
          href="/admin/articles/new"
          className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          新建文章
        </Link>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-4">
        <a
          href="/admin/articles"
          className={`text-sm px-3 py-1 rounded ${!status && !type ? "bg-blue-600 text-white" : "bg-gray-100 dark:bg-gray-800"}`}
        >
          全部 ({total})
        </a>
        <a
          href="/admin/articles?status=DRAFT"
          className={`text-sm px-3 py-1 rounded ${status === "DRAFT" ? "bg-blue-600 text-white" : "bg-gray-100 dark:bg-gray-800"}`}
        >
          草稿
        </a>
        <a
          href="/admin/articles?status=PUBLISHED"
          className={`text-sm px-3 py-1 rounded ${status === "PUBLISHED" ? "bg-blue-600 text-white" : "bg-gray-100 dark:bg-gray-800"}`}
        >
          已发布
        </a>
      </div>

      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="text-left px-4 py-2 font-medium">标题</th>
              <th className="text-left px-4 py-2 font-medium">类型</th>
              <th className="text-left px-4 py-2 font-medium">分类</th>
              <th className="text-left px-4 py-2 font-medium">状态</th>
              <th className="text-left px-4 py-2 font-medium">更新时间</th>
              <th className="text-right px-4 py-2 font-medium">操作</th>
            </tr>
          </thead>
          <tbody>
            {articles.map((article) => (
              <tr key={article.id} className="border-t border-gray-200 dark:border-gray-800">
                <td className="px-4 py-2">{article.title}</td>
                <td className="px-4 py-2">
                  <span className={`text-xs px-2 py-0.5 rounded ${article.type === "NOTE" ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300" : "bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300"}`}>
                    {article.type === "NOTE" ? "笔记" : "面试"}
                  </span>
                </td>
                <td className="px-4 py-2 text-gray-500">{article.category.name}</td>
                <td className="px-4 py-2">
                  <span className={`text-xs px-2 py-0.5 rounded ${article.status === "PUBLISHED" ? "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300" : "bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300"}`}>
                    {article.status === "PUBLISHED" ? "已发布" : "草稿"}
                  </span>
                </td>
                <td className="px-4 py-2 text-gray-500">
                  {new Date(article.updatedAt).toLocaleDateString("zh-CN")}
                </td>
                <td className="px-4 py-2 text-right">
                  <Link href={`/admin/articles/${article.id}`} className="text-blue-600 hover:underline">
                    编辑
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create article form component**

Create `src/components/admin/article-form.tsx`:

```tsx
"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Category, Tag, Article } from "@prisma/client";

interface Props {
  article?: Article & { tags: { tagId: string }[] };
  categories: Category[];
  tags: Tag[];
}

export function ArticleForm({ article, categories, tags }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState(article?.title || "");
  const [content, setContent] = useState(article?.content || "");
  const [summary, setSummary] = useState(article?.summary || "");
  const [type, setType] = useState(article?.type || "NOTE");
  const [status, setStatus] = useState(article?.status || "DRAFT");
  const [categoryId, setCategoryId] = useState(article?.categoryId || "");
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>(
    article?.tags.map((t) => t.tagId) || []
  );

  function toggleTag(tagId: string) {
    setSelectedTagIds((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const body = { title, content, summary, type, status, categoryId, tagIds: selectedTagIds };

    const url = article ? `/api/articles/${article.id}` : "/api/articles";
    const method = article ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    setLoading(false);

    if (res.ok) {
      router.push("/admin/articles");
      router.refresh();
    }
  }

  async function handleDelete() {
    if (!article || !confirm("确定删除这篇文章？")) return;

    await fetch(`/api/articles/${article.id}`, { method: "DELETE" });
    router.push("/admin/articles");
    router.refresh();
  }

  const difficultyTags = tags.filter((t) => t.type === "DIFFICULTY");
  const topicTags = tags.filter((t) => t.type === "TOPIC");

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium mb-1">标题</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">摘要</label>
        <input
          type="text"
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">类型</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md"
          >
            <option value="NOTE">知识笔记</option>
            <option value="INTERVIEW">面试题</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">状态</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md"
          >
            <option value="DRAFT">草稿</option>
            <option value="PUBLISHED">发布</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">分类</label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            required
            className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md"
          >
            <option value="">选择分类</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.parentId ? "  └ " : ""}{cat.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">难度标签</label>
        <div className="flex gap-2">
          {difficultyTags.map((tag) => (
            <button
              key={tag.id}
              type="button"
              onClick={() => toggleTag(tag.id)}
              className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                selectedTagIds.includes(tag.id)
                  ? "bg-green-600 text-white border-green-600"
                  : "border-gray-300 dark:border-gray-600"
              }`}
            >
              {tag.name}
            </button>
          ))}
        </div>
      </div>

      {topicTags.length > 0 && (
        <div>
          <label className="block text-sm font-medium mb-2">主题标签</label>
          <div className="flex flex-wrap gap-2">
            {topicTags.map((tag) => (
              <button
                key={tag.id}
                type="button"
                onClick={() => toggleTag(tag.id)}
                className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                  selectedTagIds.includes(tag.id)
                    ? "bg-blue-600 text-white border-blue-600"
                    : "border-gray-300 dark:border-gray-600"
                }`}
              >
                {tag.name}
              </button>
            ))}
          </div>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium mb-1">
          内容（Markdown）
        </label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
          rows={20}
          className="w-full px-3 py-2 text-sm font-mono bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 resize-y"
        />
      </div>

      <div className="flex items-center justify-between">
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "保存中..." : "保存"}
          </button>
        </div>
        {article && (
          <button
            type="button"
            onClick={handleDelete}
            className="px-4 py-2 text-sm text-red-600 hover:text-red-700"
          >
            删除文章
          </button>
        )}
      </div>
    </form>
  );
}
```

- [ ] **Step 3: Create article editor page**

Create `src/app/admin/articles/[id]/page.tsx`:

```tsx
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ArticleForm } from "@/components/admin/article-form";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function AdminArticleEditPage({ params }: Props) {
  const { id } = await params;

  const [categories, tags] = await Promise.all([
    prisma.category.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.tag.findMany({ orderBy: { name: "asc" } }),
  ]);

  if (id === "new") {
    return (
      <div>
        <h1 className="text-xl font-bold mb-6">新建文章</h1>
        <ArticleForm categories={categories} tags={tags} />
      </div>
    );
  }

  const article = await prisma.article.findUnique({
    where: { id },
    include: { tags: true },
  });

  if (!article) notFound();

  return (
    <div>
      <h1 className="text-xl font-bold mb-6">编辑文章</h1>
      <ArticleForm article={article} categories={categories} tags={tags} />
    </div>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add src/app/admin/articles/ src/components/admin/article-form.tsx
git commit -m "feat: add admin article management with list and editor pages"
```

---

## Task 20: Admin Category, Tag, User & Comment Management

**Files:**
- Create: `src/app/admin/categories/page.tsx`, `src/app/admin/tags/page.tsx`, `src/app/admin/users/page.tsx`, `src/app/admin/comments/page.tsx`

- [ ] **Step 1: Create category management page**

Create `src/app/admin/categories/page.tsx`:

```tsx
"use client";

import { useEffect, useState } from "react";
import { Category } from "@prisma/client";

type CategoryWithChildren = Category & { children: Category[] };

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<CategoryWithChildren[]>([]);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [icon, setIcon] = useState("");
  const [parentId, setParentId] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  async function loadCategories() {
    const res = await fetch("/api/categories");
    setCategories(await res.json());
  }

  useEffect(() => { loadCategories(); }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const body = { name, slug, icon, parentId: parentId || null, ...(editingId ? { id: editingId } : {}) };
    await fetch("/api/categories", {
      method: editingId ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setName(""); setSlug(""); setIcon(""); setParentId(""); setEditingId(null);
    loadCategories();
  }

  async function handleDelete(id: string) {
    if (!confirm("确定删除？")) return;
    await fetch("/api/categories", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    loadCategories();
  }

  function startEdit(cat: Category) {
    setEditingId(cat.id);
    setName(cat.name);
    setSlug(cat.slug);
    setIcon(cat.icon || "");
    setParentId(cat.parentId || "");
  }

  return (
    <div>
      <h1 className="text-xl font-bold mb-6">分类管理</h1>

      <form onSubmit={handleSubmit} className="flex gap-3 mb-6 items-end">
        <div>
          <label className="block text-xs mb-1">名称</label>
          <input value={name} onChange={(e) => setName(e.target.value)} required className="px-3 py-1.5 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md" />
        </div>
        <div>
          <label className="block text-xs mb-1">Slug</label>
          <input value={slug} onChange={(e) => setSlug(e.target.value)} required className="px-3 py-1.5 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md" />
        </div>
        <div>
          <label className="block text-xs mb-1">图标</label>
          <input value={icon} onChange={(e) => setIcon(e.target.value)} className="px-3 py-1.5 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md w-16" />
        </div>
        <div>
          <label className="block text-xs mb-1">父分类</label>
          <select value={parentId} onChange={(e) => setParentId(e.target.value)} className="px-3 py-1.5 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md">
            <option value="">无（一级分类）</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>
        <button type="submit" className="px-4 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700">
          {editingId ? "更新" : "添加"}
        </button>
      </form>

      <div className="space-y-2">
        {categories.map((cat) => (
          <div key={cat.id}>
            <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg">
              <span>{cat.icon} {cat.name} <span className="text-xs text-gray-500">({cat.slug})</span></span>
              <div className="flex gap-2">
                <button onClick={() => startEdit(cat)} className="text-xs text-blue-600 hover:underline">编辑</button>
                <button onClick={() => handleDelete(cat.id)} className="text-xs text-red-600 hover:underline">删除</button>
              </div>
            </div>
            {cat.children.length > 0 && (
              <div className="ml-8 mt-1 space-y-1">
                {cat.children.map((child) => (
                  <div key={child.id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded">
                    <span className="text-sm">└ {child.name} <span className="text-xs text-gray-500">({child.slug})</span></span>
                    <div className="flex gap-2">
                      <button onClick={() => startEdit(child)} className="text-xs text-blue-600 hover:underline">编辑</button>
                      <button onClick={() => handleDelete(child.id)} className="text-xs text-red-600 hover:underline">删除</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create tag management page**

Create `src/app/admin/tags/page.tsx`:

```tsx
"use client";

import { useEffect, useState } from "react";
import { Tag } from "@prisma/client";

export default function AdminTagsPage() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [type, setType] = useState<"DIFFICULTY" | "TOPIC">("TOPIC");

  async function loadTags() {
    const res = await fetch("/api/tags");
    setTags(await res.json());
  }

  useEffect(() => { loadTags(); }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/tags", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, slug, type }),
    });
    setName(""); setSlug("");
    loadTags();
  }

  async function handleDelete(id: string) {
    if (!confirm("确定删除？")) return;
    await fetch("/api/tags", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    loadTags();
  }

  const difficultyTags = tags.filter((t) => t.type === "DIFFICULTY");
  const topicTags = tags.filter((t) => t.type === "TOPIC");

  return (
    <div>
      <h1 className="text-xl font-bold mb-6">标签管理</h1>

      <form onSubmit={handleSubmit} className="flex gap-3 mb-6 items-end">
        <div>
          <label className="block text-xs mb-1">名称</label>
          <input value={name} onChange={(e) => setName(e.target.value)} required className="px-3 py-1.5 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md" />
        </div>
        <div>
          <label className="block text-xs mb-1">Slug</label>
          <input value={slug} onChange={(e) => setSlug(e.target.value)} required className="px-3 py-1.5 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md" />
        </div>
        <div>
          <label className="block text-xs mb-1">类型</label>
          <select value={type} onChange={(e) => setType(e.target.value as "DIFFICULTY" | "TOPIC")} className="px-3 py-1.5 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md">
            <option value="DIFFICULTY">难度标签</option>
            <option value="TOPIC">主题标签</option>
          </select>
        </div>
        <button type="submit" className="px-4 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700">添加</button>
      </form>

      <div className="space-y-6">
        <div>
          <h2 className="text-sm font-semibold text-gray-500 mb-2">难度标签</h2>
          <div className="flex flex-wrap gap-2">
            {difficultyTags.map((tag) => (
              <span key={tag.id} className="inline-flex items-center gap-1 text-sm px-3 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-full">
                {tag.name}
                <button onClick={() => handleDelete(tag.id)} className="text-red-500 hover:text-red-700 ml-1">&times;</button>
              </span>
            ))}
          </div>
        </div>
        <div>
          <h2 className="text-sm font-semibold text-gray-500 mb-2">主题标签</h2>
          <div className="flex flex-wrap gap-2">
            {topicTags.map((tag) => (
              <span key={tag.id} className="inline-flex items-center gap-1 text-sm px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full">
                {tag.name}
                <button onClick={() => handleDelete(tag.id)} className="text-red-500 hover:text-red-700 ml-1">&times;</button>
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Create user management page**

Create `src/app/admin/users/page.tsx`:

```tsx
import { prisma } from "@/lib/prisma";

export default async function AdminUsersPage() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      nickname: true,
      role: true,
      createdAt: true,
      _count: { select: { favorites: true, comments: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="text-xl font-bold mb-6">用户管理</h1>

      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="text-left px-4 py-2 font-medium">昵称</th>
              <th className="text-left px-4 py-2 font-medium">邮箱</th>
              <th className="text-left px-4 py-2 font-medium">角色</th>
              <th className="text-left px-4 py-2 font-medium">收藏</th>
              <th className="text-left px-4 py-2 font-medium">评论</th>
              <th className="text-left px-4 py-2 font-medium">注册时间</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-t border-gray-200 dark:border-gray-800">
                <td className="px-4 py-2">{user.nickname}</td>
                <td className="px-4 py-2 text-gray-500">{user.email}</td>
                <td className="px-4 py-2">
                  <span className={`text-xs px-2 py-0.5 rounded ${user.role === "ADMIN" ? "bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300" : "bg-gray-100 dark:bg-gray-800"}`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-4 py-2">{user._count.favorites}</td>
                <td className="px-4 py-2">{user._count.comments}</td>
                <td className="px-4 py-2 text-gray-500">{new Date(user.createdAt).toLocaleDateString("zh-CN")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Create comment management page**

Create `src/app/admin/comments/page.tsx`:

```tsx
"use client";

import { useEffect, useState } from "react";

interface AdminComment {
  id: string;
  content: string;
  createdAt: string;
  user: { nickname: string };
  article: { title: string };
}

export default function AdminCommentsPage() {
  const [comments, setComments] = useState<AdminComment[]>([]);

  async function loadComments() {
    const res = await fetch("/api/comments?all=true");
    setComments(await res.json());
  }

  useEffect(() => { loadComments(); }, []);

  async function handleDelete(id: string) {
    if (!confirm("确定删除？")) return;
    await fetch(`/api/comments/${id}`, { method: "DELETE" });
    setComments(comments.filter((c) => c.id !== id));
  }

  return (
    <div>
      <h1 className="text-xl font-bold mb-6">评论管理</h1>

      <div className="space-y-3">
        {comments.map((comment) => (
          <div key={comment.id} className="p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm">
                <span className="text-blue-600">@{comment.user.nickname}</span>
                <span className="text-gray-500 mx-2">评论了</span>
                <span className="font-medium">{comment.article.title}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-500">{new Date(comment.createdAt).toLocaleDateString("zh-CN")}</span>
                <button onClick={() => handleDelete(comment.id)} className="text-xs text-red-600 hover:underline">删除</button>
              </div>
            </div>
            <p className="text-sm text-gray-400">{comment.content}</p>
          </div>
        ))}
      </div>

      {comments.length === 0 && (
        <p className="text-gray-500 text-center py-8">暂无评论</p>
      )}
    </div>
  );
}
```

- [ ] **Step 5: Update comment API to support admin listing**

In `src/app/api/comments/route.ts`, update the GET handler to support `all=true` for admin:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-utils";
import { auth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const articleId = searchParams.get("articleId");
  const all = searchParams.get("all");

  if (all === "true") {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const comments = await prisma.comment.findMany({
      include: {
        user: { select: { nickname: true } },
        article: { select: { title: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(comments);
  }

  if (!articleId) {
    return NextResponse.json({ error: "articleId required" }, { status: 400 });
  }

  const comments = await prisma.comment.findMany({
    where: { articleId },
    include: {
      user: { select: { id: true, nickname: true, avatar: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(comments);
}

export async function POST(request: NextRequest) {
  const session = await requireAuth();
  const { articleId, content } = await request.json();

  if (!articleId || !content?.trim()) {
    return NextResponse.json(
      { error: "articleId and content required" },
      { status: 400 }
    );
  }

  const comment = await prisma.comment.create({
    data: {
      content: content.trim(),
      userId: session.user.id,
      articleId,
    },
    include: {
      user: { select: { id: true, nickname: true, avatar: true } },
    },
  });

  return NextResponse.json(comment, { status: 201 });
}
```

- [ ] **Step 6: Commit**

```bash
git add src/app/admin/categories/ src/app/admin/tags/ src/app/admin/users/ src/app/admin/comments/ src/app/api/comments/route.ts
git commit -m "feat: add admin category, tag, user, and comment management pages"
```

---

## Task 21: Admin Content Import Page

**Files:**
- Create: `src/components/admin/import-form.tsx`, `src/app/admin/import/page.tsx`

- [ ] **Step 1: Create import form component**

Create `src/components/admin/import-form.tsx`:

```tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Category, Tag } from "@prisma/client";

interface Props {
  categories: Category[];
  tags: Tag[];
}

interface PreviewData {
  title: string;
  content: string;
  suggestedCategory: Category | null;
  suggestedTags: Tag[];
  suggestedCategoryId: string | null;
  suggestedTagIds: string[];
}

export function ImportForm({ categories, tags }: Props) {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<PreviewData | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [type, setType] = useState("NOTE");
  const [categoryId, setCategoryId] = useState("");
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [error, setError] = useState("");
  const router = useRouter();

  async function handlePreview(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setPreview(null);

    const res = await fetch("/api/import", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url, action: "preview" }),
    });

    setLoading(false);

    if (!res.ok) {
      setError("采集失败，请检查 URL 是否正确");
      return;
    }

    const data = await res.json();
    setPreview(data);
    setTitle(data.title);
    setContent(data.content);
    setCategoryId(data.suggestedCategoryId || "");
    setSelectedTagIds(data.suggestedTagIds || []);
  }

  async function handleSave() {
    if (!categoryId) {
      setError("请选择分类");
      return;
    }

    setLoading(true);
    const res = await fetch("/api/import", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        url,
        action: "save",
        title,
        content,
        type,
        categoryId,
        tagIds: selectedTagIds,
      }),
    });

    setLoading(false);

    if (res.ok) {
      router.push("/admin/articles?status=DRAFT");
      router.refresh();
    } else {
      setError("保存失败");
    }
  }

  function toggleTag(tagId: string) {
    setSelectedTagIds((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
    );
  }

  return (
    <div>
      {/* URL Input */}
      <form onSubmit={handlePreview} className="flex gap-3 mb-6">
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="输入文章 URL..."
          required
          className="flex-1 px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "采集中..." : "采集预览"}
        </button>
      </form>

      {error && (
        <div className="mb-4 p-3 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 rounded">
          {error}
        </div>
      )}

      {/* Preview */}
      {preview && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">标题</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">类型</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full px-3 py-1.5 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md"
              >
                <option value="NOTE">知识笔记</option>
                <option value="INTERVIEW">面试题</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                分类
                {preview.suggestedCategory && (
                  <span className="text-xs text-green-600 ml-2">
                    (推荐: {preview.suggestedCategory.name})
                  </span>
                )}
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-3 py-1.5 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md"
              >
                <option value="">选择分类</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              标签
              {preview.suggestedTags.length > 0 && (
                <span className="text-xs text-green-600 ml-2">
                  (已自动选中推荐标签)
                </span>
              )}
            </label>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => toggleTag(tag.id)}
                  className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                    selectedTagIds.includes(tag.id)
                      ? "bg-blue-600 text-white border-blue-600"
                      : "border-gray-300 dark:border-gray-600"
                  }`}
                >
                  {tag.name}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              内容预览（Markdown）
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={15}
              className="w-full px-3 py-2 text-sm font-mono bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md resize-y"
            />
          </div>

          <button
            onClick={handleSave}
            disabled={loading}
            className="px-6 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? "保存中..." : "保存为草稿"}
          </button>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Create import page**

Create `src/app/admin/import/page.tsx`:

```tsx
import { prisma } from "@/lib/prisma";
import { ImportForm } from "@/components/admin/import-form";

export default async function AdminImportPage() {
  const [categories, tags] = await Promise.all([
    prisma.category.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.tag.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div>
      <h1 className="text-xl font-bold mb-2">内容采集</h1>
      <p className="text-sm text-gray-500 mb-6">
        输入外部文章 URL，自动提取内容并转为 Markdown 草稿
      </p>
      <ImportForm categories={categories} tags={tags} />
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/admin/import-form.tsx src/app/admin/import/
git commit -m "feat: add admin content import page with URL extraction and preview"
```

---

## Task 22: Docker & Nginx Deployment

**Files:**
- Create: `Dockerfile`, `docker-compose.yml`, `nginx.conf`, `.dockerignore`

- [ ] **Step 1: Create Dockerfile**

Create `Dockerfile`:

```dockerfile
FROM node:20-alpine AS base

FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
RUN npm run build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
```

- [ ] **Step 2: Create .dockerignore**

Create `.dockerignore`:

```
node_modules
.next
.git
.gitignore
*.md
.env
.superpowers
```

- [ ] **Step 3: Create docker-compose.yml**

Create `docker-compose.yml`:

```yaml
services:
  db:
    image: postgres:16-alpine
    restart: always
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: android_hub
    volumes:
      - pgdata:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  app:
    build: .
    restart: always
    depends_on:
      - db
    environment:
      DATABASE_URL: "postgresql://postgres:postgres@db:5432/android_hub"
      NEXTAUTH_SECRET: "${NEXTAUTH_SECRET}"
      NEXTAUTH_URL: "${NEXTAUTH_URL}"
    ports:
      - "3000:3000"

volumes:
  pgdata:
```

- [ ] **Step 4: Create nginx.conf**

Create `nginx.conf`:

```nginx
server {
    listen 80;
    server_name _;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    location /_next/static {
        proxy_pass http://localhost:3000;
        proxy_cache_valid 200 365d;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }
}
```

- [ ] **Step 5: Update next.config.ts for standalone output**

Ensure `next.config.ts` includes:

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
};

export default nextConfig;
```

- [ ] **Step 6: Commit**

```bash
git add Dockerfile .dockerignore docker-compose.yml nginx.conf next.config.ts
git commit -m "feat: add Docker and Nginx deployment configuration"
```

---

## Task 23: Final Verification

- [ ] **Step 1: Run all tests**

```bash
npm test
```

Expected: All tests pass.

- [ ] **Step 2: Run build**

```bash
npm run build
```

Expected: Build completes without errors.

- [ ] **Step 3: Run lint**

```bash
npm run lint
```

Expected: No lint errors.

- [ ] **Step 4: Fix any issues found in steps 1-3**

Address any test failures, build errors, or lint issues.

- [ ] **Step 5: Commit fixes if any**

```bash
git add -A
git commit -m "fix: resolve build and lint issues"
```
