import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ArticleCard } from "@/components/article-card";

export default async function HomePage() {
  const [categories, latestArticles] = await Promise.all([
    prisma.category.findMany({
      where: { parentId: null },
      orderBy: { sortOrder: "asc" },
    }),
    prisma.article.findMany({
      where: { status: "PUBLISHED" },
      include: {
        category: true,
        tags: { include: { tag: true } },
        _count: { select: { favorites: true, comments: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
  ]);

  return (
    <div className="max-w-7xl mx-auto">
      {/* Hero */}
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 dark:from-gray-950 dark:to-gray-900 px-8 py-16 text-center">
        <h1 className="text-3xl font-bold text-white mb-3">
          Android 知识库
        </h1>
        <p className="text-gray-400 mb-6">
          系统化的 Android 知识笔记与面试题
        </p>
        <form action="/notes" className="max-w-md mx-auto">
          <input
            type="text"
            name="q"
            placeholder="搜索知识点或面试题..."
            className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-sm text-gray-300 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </form>
      </div>

      <div className="px-8 py-8">
        {/* Knowledge Modules */}
        <h2 className="text-lg font-semibold mb-4">知识模块</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-10">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/categories/${cat.slug}`}
              className="flex flex-col items-center p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg hover:border-blue-500 dark:hover:border-blue-500 transition-colors"
            >
              <span className="text-2xl mb-2">{cat.icon}</span>
              <span className="text-sm font-medium">{cat.name}</span>
            </Link>
          ))}
        </div>

        {/* Latest Articles */}
        <h2 className="text-lg font-semibold mb-4">最新文章</h2>
        <div className="space-y-3">
          {latestArticles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
        {latestArticles.length === 0 && (
          <p className="text-gray-500 text-center py-8">
            暂无文章，请在后台添加内容
          </p>
        )}
      </div>
    </div>
  );
}
