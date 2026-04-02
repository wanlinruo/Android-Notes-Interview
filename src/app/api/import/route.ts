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
