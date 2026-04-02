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
