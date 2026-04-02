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
