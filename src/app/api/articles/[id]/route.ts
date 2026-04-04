import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-utils";
import { createArticleVersion } from "@/lib/article-versions";

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

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await requireAdmin();
  const { id } = await params;

  await prisma.article.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
