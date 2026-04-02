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
