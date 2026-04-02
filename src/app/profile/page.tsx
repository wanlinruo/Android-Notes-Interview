import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const [favorites, progress] = await Promise.all([
    prisma.favorite.findMany({
      where: { userId: session.user.id },
      include: {
        article: {
          include: {
            category: true,
            tags: { include: { tag: true } },
            _count: { select: { favorites: true, comments: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.progress.findMany({
      where: { userId: session.user.id },
      include: {
        article: { include: { category: true } },
      },
    }),
  ]);

  // Group progress by category
  const progressByCategory = progress.reduce(
    (acc, p) => {
      const catName = p.article.category.name;
      if (!acc[catName]) acc[catName] = { total: 0, done: 0 };
      acc[catName].total++;
      if (p.status === "DONE") acc[catName].done++;
      return acc;
    },
    {} as Record<string, { total: number; done: number }>
  );

  return (
    <div className="max-w-4xl mx-auto px-8 py-8">
      <h1 className="text-2xl font-bold mb-8">个人中心</h1>

      {/* Progress Summary */}
      <section className="mb-10">
        <h2 className="text-lg font-semibold mb-4">学习进度</h2>
        {Object.keys(progressByCategory).length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {Object.entries(progressByCategory).map(([cat, stats]) => (
              <div
                key={cat}
                className="p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg"
              >
                <p className="text-sm font-medium mb-2">{cat}</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500 rounded-full"
                      style={{
                        width: `${(stats.done / stats.total) * 100}%`,
                      }}
                    />
                  </div>
                  <span className="text-xs text-gray-500">
                    {stats.done}/{stats.total}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-sm">暂无学习记录</p>
        )}
      </section>

      {/* Favorites */}
      <section>
        <h2 className="text-lg font-semibold mb-4">
          我的收藏 ({favorites.length})
        </h2>
        {favorites.length > 0 ? (
          <div className="space-y-2">
            {favorites.map((fav) => (
              <Link
                key={fav.id}
                href={`/articles/${fav.article.slug}`}
                className="block p-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg hover:border-blue-500 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">
                    {fav.article.title}
                  </span>
                  <span className="text-xs text-gray-500">
                    {fav.article.category.name}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-sm">暂无收藏</p>
        )}
      </section>
    </div>
  );
}
