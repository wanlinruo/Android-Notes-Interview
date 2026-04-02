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
