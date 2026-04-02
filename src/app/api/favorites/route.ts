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
