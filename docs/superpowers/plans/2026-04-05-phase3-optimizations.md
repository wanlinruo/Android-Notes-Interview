# Phase 3 Optimizations Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Three targeted optimizations — homepage masonry layout, Markdown preview in editor, and automated article import (API + bookmarklet + Lark bot).

**Architecture:** Each feature is independent. Feature 1 adds a client component wrapping existing MasonryArticleCard. Feature 2 adds tab switching in the existing article form. Feature 3 builds a new Quick Import API layer with multiple entry points.

**Tech Stack:** Next.js 16, React 19, Prisma, Tailwind CSS, shadcn/ui, react-markdown, Lark Open API

---

## File Structure

### New Files

| File | Responsibility |
|------|---------------|
| `src/components/homepage-articles.tsx` | Client component: Tab (Hot/Latest) + masonry grid |
| `src/app/api/quick-import/route.ts` | POST endpoint for quick article import |
| `src/app/api/quick-import/bookmarklet/route.ts` | GET endpoint returning HTML result page |
| `src/app/api/lark-webhook/route.ts` | Lark event subscription handler |
| `src/lib/lark.ts` | Lark API helper (token + reply) |
| `src/lib/quick-import.ts` | Shared import logic (extract + create article + cover) |

### Modified Files

| File | Change |
|------|--------|
| `src/app/page.tsx` | Replace hot/latest section with HomepageArticles, update queries |
| `src/components/admin/article-form.tsx` | Add Edit/Preview tabs around textarea |
| `.env.example` | Add QUICK_IMPORT_API_KEY, LARK_* variables |
| `docker-compose.dev.yml` | Add QUICK_IMPORT_API_KEY, LARK_* variables |

---

## Task 1: Homepage Articles — Client Component with Tabs + Masonry

**Files:**
- Create: `src/components/homepage-articles.tsx`

- [ ] **Step 1: Create HomepageArticles component**

Create `src/components/homepage-articles.tsx`:

```tsx
"use client";

import { useState } from "react";
import { MasonryArticleCard } from "@/components/masonry-article-card";

interface Article {
  slug: string;
  title: string;
  summary?: string | null;
  coverImage?: string | null;
  type: string;
  viewCount: number;
  _count: { favorites: number; comments?: number };
  category: { name: string; icon?: string | null };
  tags: { tag: { name: string; type: string } }[];
}

interface Props {
  hotArticles: Article[];
  latestArticles: Article[];
}

export function HomepageArticles({ hotArticles, latestArticles }: Props) {
  const [tab, setTab] = useState<"hot" | "latest">("hot");
  const articles = tab === "hot" ? hotArticles : latestArticles;

  return (
    <section className="pb-16">
      {/* Tab bar */}
      <div className="mb-6 flex items-center gap-1 border-b border-border">
        <button
          onClick={() => setTab("hot")}
          className={`px-4 py-2 text-sm font-medium transition-colors relative ${
            tab === "hot"
              ? "text-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          🔥 Hot
          {tab === "hot" && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
          )}
        </button>
        <button
          onClick={() => setTab("latest")}
          className={`px-4 py-2 text-sm font-medium transition-colors relative ${
            tab === "latest"
              ? "text-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          📄 Latest
          {tab === "latest" && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
          )}
        </button>
      </div>

      {/* Masonry grid */}
      <div className="columns-2 gap-4 md:columns-3">
        {articles.map((article) => (
          <MasonryArticleCard key={article.slug} article={article} />
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit --pretty 2>&1 | head -20`
Expected: No errors related to homepage-articles.tsx

---

## Task 2: Homepage — Update Queries and Integrate HomepageArticles

**Files:**
- Modify: `src/app/page.tsx:10-37` (queries) and `src/app/page.tsx:97-146` (hot/latest section)

- [ ] **Step 1: Update imports in page.tsx**

In `src/app/page.tsx`, add import at the top (after existing imports):

```tsx
import { HomepageArticles } from "@/components/homepage-articles";
```

- [ ] **Step 2: Update Prisma queries**

In `src/app/page.tsx`, replace the `latestArticles` query (lines 16-25):

```tsx
    prisma.article.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { createdAt: "desc" },
      take: 6,
      include: {
        category: { select: { name: true, icon: true } },
        tags: { include: { tag: { select: { name: true, type: true } } } },
        _count: { select: { favorites: true, comments: true } },
      },
    }),
```

Replace the `hotArticles` query (lines 26-33):

```tsx
    prisma.article.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { favorites: { _count: "desc" } },
      take: 6,
      include: {
        category: { select: { name: true, icon: true } },
        tags: { include: { tag: { select: { name: true, type: true } } } },
        _count: { select: { favorites: true, comments: true } },
      },
    }),
```

- [ ] **Step 3: Replace the Hot/Latest section**

Replace lines 97-146 (the entire `{/* Hot & Latest Articles */}` section) with:

```tsx
      {/* Hot & Latest Articles */}
      <HomepageArticles hotArticles={hotArticles} latestArticles={latestArticles} />
```

- [ ] **Step 4: Clean up unused imports**

Remove `Badge` from imports if no longer used elsewhere in the file. Check if `Card` and `CardContent` are still used by other sections (Stats, Knowledge Modules) — they are, so keep them.

- [ ] **Step 5: Verify TypeScript compiles**

Run: `npx tsc --noEmit --pretty 2>&1 | head -20`
Expected: No errors

- [ ] **Step 6: Commit**

```bash
git add src/components/homepage-articles.tsx src/app/page.tsx
git commit -m "feat: redesign homepage articles with tab masonry layout"
```

**STOP — let user verify in browser, then proceed.**

---

## Task 3: Article Form — Markdown Preview with Edit/Preview Tabs

**Files:**
- Modify: `src/components/admin/article-form.tsx:1-4` (imports) and `src/components/admin/article-form.tsx:233-243` (content section)

- [ ] **Step 1: Add import for MarkdownRenderer**

In `src/components/admin/article-form.tsx`, add import:

```tsx
import { MarkdownRenderer } from "@/components/markdown-renderer";
```

- [ ] **Step 2: Add contentTab state**

After line 45 (`const [coverLoading, setCoverLoading] = useState(false);`), add:

```tsx
  const [contentTab, setContentTab] = useState<"edit" | "preview">("edit");
```

- [ ] **Step 3: Replace the Content section**

Replace lines 233-243 (the Content `<div className="space-y-2">` block) with:

```tsx
          {/* Content */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Content (Markdown)</label>
            <div className="rounded-md border border-input overflow-hidden">
              {/* Tab bar */}
              <div className="flex border-b border-input bg-muted/30">
                <button
                  type="button"
                  onClick={() => setContentTab("edit")}
                  className={`px-4 py-1.5 text-sm font-medium transition-colors ${
                    contentTab === "edit"
                      ? "text-foreground bg-background border-b-2 border-primary -mb-px"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => setContentTab("preview")}
                  className={`px-4 py-1.5 text-sm font-medium transition-colors ${
                    contentTab === "preview"
                      ? "text-foreground bg-background border-b-2 border-primary -mb-px"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Preview
                </button>
              </div>

              {/* Content area */}
              {contentTab === "edit" ? (
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  required
                  rows={20}
                  className="w-full bg-background px-3 py-2 text-sm font-mono placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-y border-0"
                />
              ) : (
                <div className="min-h-[480px] px-4 py-3 bg-background">
                  {content ? (
                    <MarkdownRenderer content={content} />
                  ) : (
                    <p className="text-sm text-muted-foreground italic">No content to preview</p>
                  )}
                </div>
              )}
            </div>
          </div>
```

- [ ] **Step 4: Verify TypeScript compiles**

Run: `npx tsc --noEmit --pretty 2>&1 | head -20`
Expected: No errors

- [ ] **Step 5: Commit**

```bash
git add src/components/admin/article-form.tsx
git commit -m "feat: add markdown preview tab to article editor"
```

**STOP — let user verify in browser, then proceed.**

---

## Task 4: Quick Import — Shared Import Logic

**Files:**
- Create: `src/lib/quick-import.ts`

- [ ] **Step 1: Create shared quick-import helper**

This extracts the common logic used by all import entry points (API, bookmarklet, Lark).

Create `src/lib/quick-import.ts`:

```tsx
import { prisma } from "./prisma";
import { importFromUrl } from "./import";

interface QuickImportResult {
  success: true;
  article: {
    id: string;
    title: string;
    slug: string;
    editUrl: string;
  };
}

interface QuickImportError {
  success: false;
  error: string;
}

export async function quickImportArticle(
  url: string
): Promise<QuickImportResult | QuickImportError> {
  // Validate URL
  try {
    new URL(url);
  } catch {
    return { success: false, error: "Invalid URL format" };
  }

  // Extract content
  let extracted;
  try {
    extracted = await importFromUrl(url);
  } catch (e) {
    return {
      success: false,
      error: e instanceof Error ? e.message : "Failed to extract content from URL",
    };
  }

  // Generate slug
  const base = extracted.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  const slug = (base || "article") + `-${Date.now()}`;

  // Fetch random Unsplash cover image
  let coverImage: string | null = null;
  const accessKey = process.env.UNSPLASH_ACCESS_KEY;
  if (accessKey) {
    try {
      const res = await fetch(
        "https://api.unsplash.com/photos/random?query=technology&orientation=landscape",
        { headers: { Authorization: `Client-ID ${accessKey}` } }
      );
      if (res.ok) {
        const data = await res.json();
        coverImage = data.urls.regular;
      }
    } catch {
      // Ignore — cover image is optional
    }
  }

  // Create DRAFT article
  const article = await prisma.article.create({
    data: {
      title: extracted.title,
      slug,
      content: extracted.content,
      type: "NOTE",
      status: "DRAFT",
      sourceUrl: url,
      coverImage,
      categoryId: extracted.suggestedCategoryId || (await getDefaultCategoryId()),
      tags: extracted.suggestedTagIds.length > 0
        ? { create: extracted.suggestedTagIds.map((tagId) => ({ tagId })) }
        : undefined,
    },
  });

  return {
    success: true,
    article: {
      id: article.id,
      title: article.title,
      slug: article.slug,
      editUrl: `/admin/articles/${article.id}/edit`,
    },
  };
}

async function getDefaultCategoryId(): Promise<string> {
  const first = await prisma.category.findFirst({ orderBy: { sortOrder: "asc" } });
  if (!first) throw new Error("No categories exist in database");
  return first.id;
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit --pretty 2>&1 | head -20`
Expected: No errors

---

## Task 5: Quick Import — POST API Endpoint

**Files:**
- Create: `src/app/api/quick-import/route.ts`

- [ ] **Step 1: Create the POST endpoint**

Create `src/app/api/quick-import/route.ts`:

```tsx
import { NextRequest, NextResponse } from "next/server";
import { quickImportArticle } from "@/lib/quick-import";

export async function POST(request: NextRequest) {
  // API Key auth
  const authHeader = request.headers.get("authorization");
  const expectedKey = process.env.QUICK_IMPORT_API_KEY;

  if (!expectedKey) {
    return NextResponse.json(
      { success: false, error: "QUICK_IMPORT_API_KEY not configured" },
      { status: 500 }
    );
  }

  if (authHeader !== `Bearer ${expectedKey}`) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  const body = await request.json();
  const { url } = body;

  if (!url) {
    return NextResponse.json(
      { success: false, error: "URL is required" },
      { status: 400 }
    );
  }

  const result = await quickImportArticle(url);

  return NextResponse.json(result, {
    status: result.success ? 201 : 400,
  });
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit --pretty 2>&1 | head -20`
Expected: No errors

---

## Task 6: Quick Import — Bookmarklet GET Endpoint

**Files:**
- Create: `src/app/api/quick-import/bookmarklet/route.ts`

- [ ] **Step 1: Create the bookmarklet endpoint**

Create `src/app/api/quick-import/bookmarklet/route.ts`:

```tsx
import { NextRequest } from "next/server";
import { quickImportArticle } from "@/lib/quick-import";

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url");
  const key = request.nextUrl.searchParams.get("key");
  const expectedKey = process.env.QUICK_IMPORT_API_KEY;

  if (!expectedKey || key !== expectedKey) {
    return new Response(resultPage("Unauthorized", false), {
      status: 401,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  }

  if (!url) {
    return new Response(resultPage("No URL provided", false), {
      status: 400,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  }

  const result = await quickImportArticle(url);

  const message = result.success
    ? `Imported: ${result.article.title}`
    : `Error: ${result.error}`;

  return new Response(resultPage(message, result.success), {
    status: result.success ? 200 : 400,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}

function resultPage(message: string, success: boolean): string {
  const escaped = message.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Quick Import</title>
<style>
  body { font-family: -apple-system, system-ui, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; background: #fafafa; }
  .card { background: white; border-radius: 12px; padding: 32px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); text-align: center; max-width: 400px; }
  .icon { font-size: 48px; margin-bottom: 16px; }
  .msg { font-size: 16px; color: #333; line-height: 1.5; }
  .hint { font-size: 13px; color: #888; margin-top: 12px; }
</style>
</head>
<body>
  <div class="card">
    <div class="icon">${success ? "✅" : "❌"}</div>
    <div class="msg">${escaped}</div>
    <div class="hint">${success ? "This window will close in 3 seconds..." : "Please try again."}</div>
  </div>
  ${success ? "<script>setTimeout(()=>window.close(),3000)</script>" : ""}
</body>
</html>`;
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit --pretty 2>&1 | head -20`
Expected: No errors

- [ ] **Step 3: Commit Tasks 4-6**

```bash
git add src/lib/quick-import.ts src/app/api/quick-import/route.ts src/app/api/quick-import/bookmarklet/route.ts
git commit -m "feat: add quick import API with bookmarklet support"
```

**STOP — let user verify API with curl test, then proceed.**

---

## Task 7: Lark Bot — API Helper

**Files:**
- Create: `src/lib/lark.ts`

- [ ] **Step 1: Create Lark API helper**

Create `src/lib/lark.ts`:

```tsx
let cachedToken: { token: string; expiresAt: number } | null = null;

export async function getLarkTenantToken(): Promise<string> {
  // Return cached token if still valid (with 60s buffer)
  if (cachedToken && Date.now() < cachedToken.expiresAt - 60_000) {
    return cachedToken.token;
  }

  const appId = process.env.LARK_APP_ID;
  const appSecret = process.env.LARK_APP_SECRET;

  if (!appId || !appSecret) {
    throw new Error("LARK_APP_ID and LARK_APP_SECRET must be configured");
  }

  const res = await fetch(
    "https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ app_id: appId, app_secret: appSecret }),
    }
  );

  const data = await res.json();

  if (data.code !== 0) {
    throw new Error(`Lark token error: ${data.msg}`);
  }

  cachedToken = {
    token: data.tenant_access_token,
    expiresAt: Date.now() + data.expire * 1000,
  };

  return cachedToken.token;
}

export async function replyLarkMessage(
  messageId: string,
  text: string
): Promise<void> {
  const token = await getLarkTenantToken();

  const res = await fetch(
    `https://open.feishu.cn/open-apis/im/v1/messages/${messageId}/reply`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        content: JSON.stringify({ text }),
        msg_type: "text",
      }),
    }
  );

  const data = await res.json();
  if (data.code !== 0) {
    console.error("Lark reply error:", data);
  }
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit --pretty 2>&1 | head -20`
Expected: No errors

---

## Task 8: Lark Bot — Webhook Endpoint

**Files:**
- Create: `src/app/api/lark-webhook/route.ts`

- [ ] **Step 1: Create the Lark webhook endpoint**

Create `src/app/api/lark-webhook/route.ts`:

```tsx
import { NextRequest, NextResponse } from "next/server";
import { replyLarkMessage } from "@/lib/lark";
import { quickImportArticle } from "@/lib/quick-import";

// Extract URLs from text
function extractUrls(text: string): string[] {
  const urlRegex = /https?:\/\/[^\s<>"{}|\\^`\[\]]+/g;
  return text.match(urlRegex) || [];
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  // Handle Lark URL Verification challenge
  if (body.type === "url_verification") {
    return NextResponse.json({ challenge: body.challenge });
  }

  // Verify token
  const token = body.header?.token;
  const expectedToken = process.env.LARK_VERIFICATION_TOKEN;

  if (!expectedToken || token !== expectedToken) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  // Only handle message events
  const eventType = body.header?.event_type;
  if (eventType !== "im.message.receive_v1") {
    return NextResponse.json({ ok: true });
  }

  const message = body.event?.message;
  const senderId = body.event?.sender?.sender_id?.open_id;

  // Check allowed users
  const allowedUsers = (process.env.LARK_ALLOWED_USER_IDS || "").split(",").filter(Boolean);
  if (allowedUsers.length > 0 && !allowedUsers.includes(senderId)) {
    return NextResponse.json({ ok: true });
  }

  // Only handle text messages
  if (message?.message_type !== "text") {
    return NextResponse.json({ ok: true });
  }

  const messageId = message.message_id;
  const content = JSON.parse(message.content || "{}");
  const text: string = content.text || "";

  const urls = extractUrls(text);

  if (urls.length === 0) {
    await replyLarkMessage(messageId, "No URLs found in message. Send me an article URL to import.");
    return NextResponse.json({ ok: true });
  }

  // Import each URL
  const results: string[] = [];
  for (const url of urls) {
    const result = await quickImportArticle(url);
    if (result.success) {
      results.push(`✅ ${result.article.title}\n   Edit: ${result.article.editUrl}`);
    } else {
      results.push(`❌ ${url}\n   ${result.error}`);
    }
  }

  await replyLarkMessage(messageId, results.join("\n\n"));

  return NextResponse.json({ ok: true });
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit --pretty 2>&1 | head -20`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add src/lib/lark.ts src/app/api/lark-webhook/route.ts
git commit -m "feat: add Lark bot webhook for article import"
```

---

## Task 9: Environment Variables and Task Log

**Files:**
- Modify: `.env.example`
- Modify: `docker-compose.dev.yml`

- [ ] **Step 1: Update .env.example**

Append to `.env.example`:

```
# Quick Import API
QUICK_IMPORT_API_KEY="your-quick-import-api-key"

# Lark (Feishu) Bot
LARK_APP_ID="your-lark-app-id"
LARK_APP_SECRET="your-lark-app-secret"
LARK_VERIFICATION_TOKEN="your-lark-verification-token"
LARK_ALLOWED_USER_IDS="ou_xxxxx"
```

- [ ] **Step 2: Update docker-compose.dev.yml**

Add to the `environment` section of the `app` service (after `UNSPLASH_ACCESS_KEY`):

```yaml
      QUICK_IMPORT_API_KEY: your-quick-import-api-key-change-me
      LARK_APP_ID: ""
      LARK_APP_SECRET: ""
      LARK_VERIFICATION_TOKEN: ""
      LARK_ALLOWED_USER_IDS: ""
```

- [ ] **Step 3: Verify TypeScript compiles (full project)**

Run: `npx tsc --noEmit --pretty 2>&1 | head -20`
Expected: No errors

- [ ] **Step 4: Commit**

```bash
git add .env.example docker-compose.dev.yml
git commit -m "chore: add quick import and Lark bot environment variables"
```

**STOP — let user do final verification of all features, then proceed to task logs.**
