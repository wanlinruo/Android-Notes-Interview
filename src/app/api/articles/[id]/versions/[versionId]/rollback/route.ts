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
