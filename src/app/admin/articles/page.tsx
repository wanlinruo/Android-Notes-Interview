import Link from "next/link";
import { prisma } from "@/lib/prisma";

interface Props {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}

export default async function AdminArticlesPage({ searchParams }: Props) {
  const params = await searchParams;
  const page = parseInt(params.page || "1");
  const status = params.status;
  const type = params.type;
  const pageSize = 20;

  const where: Record<string, unknown> = {};
  if (status) where.status = status;
  if (type) where.type = type;

  const [articles, total] = await Promise.all([
    prisma.article.findMany({
      where,
      include: { category: true },
      orderBy: { updatedAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.article.count({ where }),
  ]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold">文章管理</h1>
        <Link
          href="/admin/articles/new"
          className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          新建文章
        </Link>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-4">
        <a
          href="/admin/articles"
          className={`text-sm px-3 py-1 rounded ${!status && !type ? "bg-blue-600 text-white" : "bg-gray-100 dark:bg-gray-800"}`}
        >
          全部 ({total})
        </a>
        <a
          href="/admin/articles?status=DRAFT"
          className={`text-sm px-3 py-1 rounded ${status === "DRAFT" ? "bg-blue-600 text-white" : "bg-gray-100 dark:bg-gray-800"}`}
        >
          草稿
        </a>
        <a
          href="/admin/articles?status=PUBLISHED"
          className={`text-sm px-3 py-1 rounded ${status === "PUBLISHED" ? "bg-blue-600 text-white" : "bg-gray-100 dark:bg-gray-800"}`}
        >
          已发布
        </a>
      </div>

      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="text-left px-4 py-2 font-medium">标题</th>
              <th className="text-left px-4 py-2 font-medium">类型</th>
              <th className="text-left px-4 py-2 font-medium">分类</th>
              <th className="text-left px-4 py-2 font-medium">状态</th>
              <th className="text-left px-4 py-2 font-medium">更新时间</th>
              <th className="text-right px-4 py-2 font-medium">操作</th>
            </tr>
          </thead>
          <tbody>
            {articles.map((article) => (
              <tr key={article.id} className="border-t border-gray-200 dark:border-gray-800">
                <td className="px-4 py-2">{article.title}</td>
                <td className="px-4 py-2">
                  <span className={`text-xs px-2 py-0.5 rounded ${article.type === "NOTE" ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300" : "bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300"}`}>
                    {article.type === "NOTE" ? "笔记" : "面试"}
                  </span>
                </td>
                <td className="px-4 py-2 text-gray-500">{article.category.name}</td>
                <td className="px-4 py-2">
                  <span className={`text-xs px-2 py-0.5 rounded ${article.status === "PUBLISHED" ? "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300" : "bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300"}`}>
                    {article.status === "PUBLISHED" ? "已发布" : "草稿"}
                  </span>
                </td>
                <td className="px-4 py-2 text-gray-500">
                  {new Date(article.updatedAt).toLocaleDateString("zh-CN")}
                </td>
                <td className="px-4 py-2 text-right">
                  <Link href={`/admin/articles/${article.id}`} className="text-blue-600 hover:underline">
                    编辑
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
