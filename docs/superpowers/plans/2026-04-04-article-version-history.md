# Article Version History Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add article version history with diff comparison and rollback, allowing admins to track all edits and revert to any previous version.

**Architecture:** New `ArticleVersion` table stores full snapshots on every article update. Three new API routes handle listing, detail, and rollback. A right-sidebar `VersionHistory` panel on the edit page shows history with Diff and Revert buttons. The `diff` npm package provides text diffing.

**Tech Stack:** Prisma (PostgreSQL), Next.js 16 API routes, React 19, shadcn/ui (base-ui), `diff` npm package

---

## File Structure

```
prisma/
  schema.prisma                                       # Modified: add ArticleVersion model + relation on Article
  migrations/                                         # Generated: new migration for ArticleVersion table
src/
  app/
    api/
      articles/
        [id]/
          route.ts                                    # Modified: PUT creates version snapshot + cleanup
          versions/
            route.ts                                  # Created: GET list versions
            [versionId]/
              route.ts                                # Created: GET version detail
              rollback/
                route.ts                              # Created: POST rollback to version
    admin/
      articles/
        [id]/
          page.tsx                                    # Modified: two-column layout with VersionHistory
  components/
    admin/
      version-history.tsx                             # Created: right sidebar version list panel
      version-diff-dialog.tsx                         # Created: diff comparison dialog
  lib/
    article-versions.ts                               # Created: shared version creation + cleanup logic
```

---

## Task 1: Add ArticleVersion Model & Migration

**Files:**
- Modify: `prisma/schema.prisma`

- [ ] **Step 1: Add ArticleVersion model to schema**

Add the following to `prisma/schema.prisma`. Add the `versions` relation to the existing `Article` model, and add the new `ArticleVersion` model after the `Article` model:

In the `Article` model, add this line after `comments  Comment[]`:
```prisma
  versions  ArticleVersion[]
```

Then add this new model after the `ArticleTag` model:

```prisma
model ArticleVersion {
  id         String        @id @default(cuid())
  articleId  String
  article    Article       @relation(fields: [articleId], references: [id], onDelete: Cascade)
  version    Int
  title      String
  slug       String
  content    String
  summary    String?
  type       ArticleType
  status     ArticleStatus
  categoryId String
  tagIds     String[]
  createdAt  DateTime      @default(now())

  @@index([articleId, version])
}
```

- [ ] **Step 2: Generate and apply migration**

Run inside the Docker container (since PostgreSQL runs in Docker):

```bash
docker compose exec app npx prisma migrate dev --name add-article-version
```

If the app container doesn't have the dev CLI, run from the host with the DATABASE_URL pointing to the Docker PostgreSQL:

```bash
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/postgres" npx prisma migrate dev --name add-article-version
```

- [ ] **Step 3: Regenerate Prisma Client**

```bash
npx prisma generate
```

Verify the `ArticleVersion` type is available in `src/generated/prisma/client`.

- [ ] **Step 4: Commit**

```bash
git add prisma/schema.prisma prisma/migrations/
git commit -m "feat: add ArticleVersion model for edit history tracking"
```

---

## Task 2: Install diff Package

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install the diff package**

```bash
npm install diff
npm install -D @types/diff
```

- [ ] **Step 2: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: add diff package for version comparison"
```

---

## Task 3: Create Version Helper (Shared Logic)

**Files:**
- Create: `src/lib/article-versions.ts`

- [ ] **Step 1: Create article-versions.ts**

Create `src/lib/article-versions.ts`:

```ts
import { prisma } from "@/lib/prisma";

const MAX_VERSIONS = 10;
const MAX_AGE_MONTHS = 6;

/**
 * Snapshot the current article state into ArticleVersion before an update.
 * Returns the created version.
 */
export async function createArticleVersion(articleId: string) {
  const article = await prisma.article.findUnique({
    where: { id: articleId },
    include: { tags: { select: { tagId: true } } },
  });

  if (!article) throw new Error("Article not found");

  // Get next version number
  const latestVersion = await prisma.articleVersion.findFirst({
    where: { articleId },
    orderBy: { version: "desc" },
    select: { version: true },
  });
  const nextVersion = (latestVersion?.version ?? 0) + 1;

  const version = await prisma.articleVersion.create({
    data: {
      articleId,
      version: nextVersion,
      title: article.title,
      slug: article.slug,
      content: article.content,
      summary: article.summary,
      type: article.type,
      status: article.status,
      categoryId: article.categoryId,
      tagIds: article.tags.map((t) => t.tagId),
    },
  });

  await cleanupVersions(articleId);

  return version;
}

/**
 * Delete versions that exceed the quantity limit or time limit.
 */
async function cleanupVersions(articleId: string) {
  const cutoffDate = new Date();
  cutoffDate.setMonth(cutoffDate.getMonth() - MAX_AGE_MONTHS);

  // Delete versions older than 6 months
  await prisma.articleVersion.deleteMany({
    where: {
      articleId,
      createdAt: { lt: cutoffDate },
    },
  });

  // Delete versions exceeding the count limit (keep newest 10)
  const versions = await prisma.articleVersion.findMany({
    where: { articleId },
    orderBy: { version: "desc" },
    select: { id: true },
  });

  if (versions.length > MAX_VERSIONS) {
    const idsToDelete = versions.slice(MAX_VERSIONS).map((v) => v.id);
    await prisma.articleVersion.deleteMany({
      where: { id: { in: idsToDelete } },
    });
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/article-versions.ts
git commit -m "feat: add version snapshot creation and cleanup logic"
```

---

## Task 4: Modify PUT /api/articles/[id] to Create Versions

**Files:**
- Modify: `src/app/api/articles/[id]/route.ts`

- [ ] **Step 1: Add version creation to the PUT handler**

In `src/app/api/articles/[id]/route.ts`, add the import at the top:

```ts
import { createArticleVersion } from "@/lib/article-versions";
```

Then in the `PUT` function, add the version creation call **after** `const { id } = await params;` and **before** the `const { title, content, ... }` destructuring:

```ts
  // Snapshot current state before updating
  await createArticleVersion(id);
```

The full PUT function should look like:

```ts
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await requireAdmin();
  const { id } = await params;

  // Snapshot current state before updating
  await createArticleVersion(id);

  const { title, content, summary, type, status, categoryId, tagIds } =
    await request.json();

  // Regenerate slug if title changed
  let slug: string | undefined;
  if (title) {
    const existing = await prisma.article.findUnique({ where: { id }, select: { title: true } });
    if (existing && existing.title !== title) {
      const base = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
      slug = (base || "article") + `-${Date.now()}`;
    }
  }

  // Update tags: delete old, create new
  if (tagIds) {
    await prisma.articleTag.deleteMany({ where: { articleId: id } });
  }

  const article = await prisma.article.update({
    where: { id },
    data: {
      title,
      ...(slug ? { slug } : {}),
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
```

- [ ] **Step 2: Commit**

```bash
git add src/app/api/articles/[id]/route.ts
git commit -m "feat: create version snapshot on article update"
```

---

## Task 5: Create Versions List API

**Files:**
- Create: `src/app/api/articles/[id]/versions/route.ts`

- [ ] **Step 1: Create the versions list route**

Create `src/app/api/articles/[id]/versions/route.ts`:

```ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-utils";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await requireAdmin();
  const { id } = await params;

  const versions = await prisma.articleVersion.findMany({
    where: { articleId: id },
    orderBy: { version: "desc" },
    select: {
      id: true,
      version: true,
      title: true,
      createdAt: true,
    },
  });

  return NextResponse.json(versions);
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/api/articles/[id]/versions/route.ts
git commit -m "feat: add API to list article versions"
```

---

## Task 6: Create Version Detail & Rollback APIs

**Files:**
- Create: `src/app/api/articles/[id]/versions/[versionId]/route.ts`
- Create: `src/app/api/articles/[id]/versions/[versionId]/rollback/route.ts`

- [ ] **Step 1: Create the version detail route**

Create `src/app/api/articles/[id]/versions/[versionId]/route.ts`:

```ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-utils";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; versionId: string }> }
) {
  await requireAdmin();
  const { versionId } = await params;

  const version = await prisma.articleVersion.findUnique({
    where: { id: versionId },
  });

  if (!version) {
    return NextResponse.json({ error: "Version not found" }, { status: 404 });
  }

  return NextResponse.json(version);
}
```

- [ ] **Step 2: Create the rollback route**

Create `src/app/api/articles/[id]/versions/[versionId]/rollback/route.ts`:

```ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-utils";
import { createArticleVersion } from "@/lib/article-versions";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; versionId: string }> }
) {
  await requireAdmin();
  const { id, versionId } = await params;

  const targetVersion = await prisma.articleVersion.findUnique({
    where: { id: versionId },
  });

  if (!targetVersion || targetVersion.articleId !== id) {
    return NextResponse.json({ error: "Version not found" }, { status: 404 });
  }

  // Save current state as a new version before rollback
  await createArticleVersion(id);

  // Delete existing tags and rebuild from snapshot
  await prisma.articleTag.deleteMany({ where: { articleId: id } });

  // Overwrite article with snapshot data
  const article = await prisma.article.update({
    where: { id },
    data: {
      title: targetVersion.title,
      slug: targetVersion.slug,
      content: targetVersion.content,
      summary: targetVersion.summary,
      type: targetVersion.type,
      status: targetVersion.status,
      categoryId: targetVersion.categoryId,
      tags: {
        create: targetVersion.tagIds.map((tagId) => ({ tagId })),
      },
    },
    include: {
      category: true,
      tags: { include: { tag: true } },
    },
  });

  return NextResponse.json(article);
}
```

- [ ] **Step 3: Commit**

```bash
git add src/app/api/articles/[id]/versions/
git commit -m "feat: add version detail and rollback APIs"
```

---

## Task 7: Create VersionHistory Component

**Files:**
- Create: `src/components/admin/version-history.tsx`

- [ ] **Step 1: Create version-history.tsx**

Create `src/components/admin/version-history.tsx`:

```tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { VersionDiffDialog } from "./version-diff-dialog";

interface VersionItem {
  id: string;
  version: number;
  title: string;
  createdAt: string;
}

interface VersionHistoryProps {
  articleId: string;
}

export function VersionHistory({ articleId }: VersionHistoryProps) {
  const router = useRouter();
  const [versions, setVersions] = useState<VersionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [diffVersion, setDiffVersion] = useState<VersionItem | null>(null);
  const [rollingBack, setRollingBack] = useState(false);

  useEffect(() => {
    fetch(`/api/articles/${articleId}/versions`)
      .then((res) => res.json())
      .then((data) => {
        setVersions(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [articleId]);

  async function handleRollback(versionId: string) {
    setRollingBack(true);
    const res = await fetch(
      `/api/articles/${articleId}/versions/${versionId}/rollback`,
      { method: "POST" }
    );
    setRollingBack(false);

    if (res.ok) {
      router.refresh();
      // Refresh version list
      const updated = await fetch(`/api/articles/${articleId}/versions`);
      setVersions(await updated.json());
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-4 text-center text-sm text-muted-foreground">
          Loading versions...
        </CardContent>
      </Card>
    );
  }

  if (versions.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Version History</CardTitle>
        </CardHeader>
        <CardContent className="pt-0 text-sm text-muted-foreground">
          No edit history yet.
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center justify-between">
            <span>Version History</span>
            <Badge variant="secondary" className="text-[10px]">
              {versions.length}
            </Badge>
          </CardTitle>
        </CardHeader>

        <CardContent className="pt-0">
          <div className="space-y-1">
            {versions.map((v, i) => {
              const isCurrent = i === 0;
              return (
                <div
                  key={v.id}
                  className={`rounded-lg p-2 transition-colors ${
                    isCurrent ? "bg-primary/5" : "hover:bg-accent"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded text-[10px] font-bold ${
                        isCurrent
                          ? "bg-primary/15 text-primary ring-1 ring-primary/20"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {v.version}
                    </span>
                    <span className="text-xs font-medium truncate flex-1">
                      {v.title}
                    </span>
                    {isCurrent && (
                      <Badge variant="outline" className="text-[9px] px-1 py-0">
                        now
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center justify-between pl-7">
                    <span className="text-[11px] text-muted-foreground">
                      {new Date(v.createdAt).toLocaleDateString()}{" "}
                      {new Date(v.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>

                    {!isCurrent && (
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="xs"
                          onClick={() => setDiffVersion(v)}
                        >
                          Diff
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger
                            render={<Button variant="ghost" size="xs" />}
                          >
                            Revert
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Rollback to v{v.version}?
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                The current content will be automatically saved
                                as a new version before rolling back. This
                                action is reversible.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleRollback(v.id)}
                                disabled={rollingBack}
                              >
                                {rollingBack ? "Rolling back..." : "Confirm"}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {diffVersion && (
        <VersionDiffDialog
          articleId={articleId}
          currentVersion={versions[0]}
          compareVersion={diffVersion}
          onClose={() => setDiffVersion(null)}
        />
      )}
    </>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/admin/version-history.tsx
git commit -m "feat: add VersionHistory sidebar panel component"
```

---

## Task 8: Create VersionDiffDialog Component

**Files:**
- Create: `src/components/admin/version-diff-dialog.tsx`

- [ ] **Step 1: Create version-diff-dialog.tsx**

Create `src/components/admin/version-diff-dialog.tsx`:

```tsx
"use client";

import { useEffect, useState } from "react";
import { diffLines } from "diff";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface VersionInfo {
  id: string;
  version: number;
  title: string;
  createdAt: string;
}

interface VersionDetail {
  id: string;
  version: number;
  title: string;
  content: string;
  summary: string | null;
  type: string;
  status: string;
  categoryId: string;
  tagIds: string[];
  createdAt: string;
}

interface DiffLine {
  type: "added" | "removed" | "unchanged";
  content: string;
}

function computeDiffLines(oldText: string, newText: string): DiffLine[] {
  const changes = diffLines(oldText, newText);
  const result: DiffLine[] = [];

  for (const change of changes) {
    const lines = change.value.replace(/\n$/, "").split("\n");
    const type = change.added ? "added" : change.removed ? "removed" : "unchanged";
    for (const line of lines) {
      result.push({ type, content: line });
    }
  }

  return result;
}

interface VersionDiffDialogProps {
  articleId: string;
  currentVersion: VersionInfo;
  compareVersion: VersionInfo;
  onClose: () => void;
}

export function VersionDiffDialog({
  articleId,
  currentVersion,
  compareVersion,
  onClose,
}: VersionDiffDialogProps) {
  const [currentDetail, setCurrentDetail] = useState<VersionDetail | null>(null);
  const [compareDetail, setCompareDetail] = useState<VersionDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch(`/api/articles/${articleId}/versions/${currentVersion.id}`).then((r) => r.json()),
      fetch(`/api/articles/${articleId}/versions/${compareVersion.id}`).then((r) => r.json()),
    ]).then(([current, compare]) => {
      setCurrentDetail(current);
      setCompareDetail(compare);
      setLoading(false);
    });
  }, [articleId, currentVersion.id, compareVersion.id]);

  if (loading || !currentDetail || !compareDetail) {
    return (
      <Dialog open onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="max-w-3xl">
          <div className="py-8 text-center text-sm text-muted-foreground">
            Loading diff...
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const lines = computeDiffLines(compareDetail.content, currentDetail.content);
  const addedCount = lines.filter((l) => l.type === "added").length;
  const removedCount = lines.filter((l) => l.type === "removed").length;

  // Compute meta field changes
  const metaChanges: { field: string; old: string; new: string }[] = [];
  if (compareDetail.title !== currentDetail.title) {
    metaChanges.push({ field: "Title", old: compareDetail.title, new: currentDetail.title });
  }
  if (compareDetail.status !== currentDetail.status) {
    metaChanges.push({ field: "Status", old: compareDetail.status, new: currentDetail.status });
  }
  if (compareDetail.type !== currentDetail.type) {
    metaChanges.push({ field: "Type", old: compareDetail.type, new: currentDetail.type });
  }
  if (compareDetail.categoryId !== currentDetail.categoryId) {
    metaChanges.push({ field: "Category", old: compareDetail.categoryId, new: currentDetail.categoryId });
  }
  if (compareDetail.summary !== currentDetail.summary) {
    metaChanges.push({
      field: "Summary",
      old: compareDetail.summary || "(empty)",
      new: currentDetail.summary || "(empty)",
    });
  }
  const oldTags = compareDetail.tagIds.sort().join(",");
  const newTags = currentDetail.tagIds.sort().join(",");
  if (oldTags !== newTags) {
    metaChanges.push({ field: "Tags", old: `${compareDetail.tagIds.length} tags`, new: `${currentDetail.tagIds.length} tags` });
  }

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>
            Compare v{compareVersion.version} → v{currentVersion.version}
          </DialogTitle>
          <DialogDescription>
            <span className="flex items-center gap-3 mt-1">
              <span className="text-green-600 dark:text-green-400 text-xs font-medium">
                +{addedCount} added
              </span>
              <span className="text-red-600 dark:text-red-400 text-xs font-medium">
                -{removedCount} removed
              </span>
            </span>
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4">
          {/* Meta changes */}
          {metaChanges.length > 0 && (
            <div className="rounded-lg border border-border p-3 space-y-2">
              <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Field Changes
              </div>
              {metaChanges.map((change) => (
                <div key={change.field} className="flex items-center gap-2 text-sm">
                  <Badge variant="outline" className="text-[11px]">
                    {change.field}
                  </Badge>
                  <span className="text-red-600 dark:text-red-400 line-through">
                    {change.old}
                  </span>
                  <span className="text-muted-foreground">→</span>
                  <span className="text-green-600 dark:text-green-400">
                    {change.new}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Content diff */}
          <div className="rounded-lg border border-border overflow-hidden">
            <div className="bg-muted/50 px-3 py-2 border-b border-border">
              <span className="text-xs font-medium text-muted-foreground">Content Diff</span>
            </div>
            <div className="font-mono text-xs leading-6 overflow-x-auto">
              {lines.map((line, i) => (
                <div
                  key={i}
                  className={`px-3 border-l-2 ${
                    line.type === "added"
                      ? "bg-green-500/10 border-l-green-500 text-green-700 dark:text-green-300"
                      : line.type === "removed"
                        ? "bg-red-500/10 border-l-red-500 text-red-700 dark:text-red-300"
                        : "border-l-transparent text-foreground/80"
                  }`}
                >
                  <span className="inline-block w-5 text-right mr-3 text-muted-foreground/50 select-none">
                    {line.type === "added" ? "+" : line.type === "removed" ? "-" : " "}
                  </span>
                  {line.content || "\u00A0"}
                </div>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/admin/version-diff-dialog.tsx
git commit -m "feat: add VersionDiffDialog with line-by-line content diff"
```

---

## Task 9: Integrate VersionHistory into Edit Page

**Files:**
- Modify: `src/app/admin/articles/[id]/page.tsx`

- [ ] **Step 1: Update the edit page layout**

Replace the entire content of `src/app/admin/articles/[id]/page.tsx`:

```tsx
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ArticleForm } from "@/components/admin/article-form";
import { VersionHistory } from "@/components/admin/version-history";

export const dynamic = "force-dynamic";

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
        <h1 className="mb-6 text-xl font-bold">New Article</h1>
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
      <h1 className="mb-6 text-xl font-bold">Edit Article</h1>
      <div className="flex gap-6 items-start">
        <div className="flex-1 min-w-0">
          <ArticleForm article={article} categories={categories} tags={tags} />
        </div>
        <div className="hidden lg:block w-72 flex-shrink-0 sticky top-6">
          <VersionHistory articleId={id} />
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify in browser**

Open `http://localhost:3000/admin/articles` → click any article → verify:
- Two-column layout: form on left, version history panel on right
- Version history shows "No edit history yet." initially
- Update the article → refresh → version history shows v1
- Update again → v2 appears, v1 has Diff and Revert buttons
- Click Diff → dialog shows content comparison
- Click Revert → confirmation dialog, confirm → article reverts, v3 is created

- [ ] **Step 3: Commit**

```bash
git add src/app/admin/articles/[id]/page.tsx
git commit -m "feat: integrate version history panel into article edit page"
```
