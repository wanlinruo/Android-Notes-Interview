import { prisma } from "@/lib/prisma";
import { ArticleCard } from "@/components/article-card";
import { ArticleFilters } from "@/components/article-filters";
import { Pagination } from "@/components/pagination";

interface Props {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}

export default async function InterviewsPage({ searchParams }: Props) {
  const params = await searchParams;
  const page = parseInt(params.page || "1");
  const pageSize = 20;
  const categorySlug = params.category;
  const tagSlug = params.tag;
  const q = params.q;

  const where: Record<string, unknown> = {
    type: "INTERVIEW",
    status: "PUBLISHED",
  };

  if (categorySlug) where.category = { slug: categorySlug };
  if (tagSlug) where.tags = { some: { tag: { slug: tagSlug } } };
  if (q) {
    where.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { content: { contains: q, mode: "insensitive" } },
    ];
  }

  const [articles, total, categories, tags] = await Promise.all([
    prisma.article.findMany({
      where,
      include: {
        category: true,
        tags: { include: { tag: true } },
        _count: { select: { favorites: true, comments: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.article.count({ where }),
    prisma.category.findMany({
      where: { parentId: null },
      include: { children: { orderBy: { sortOrder: "asc" } } },
      orderBy: { sortOrder: "asc" },
    }),
    prisma.tag.findMany({ orderBy: { name: "asc" } }),
  ]);

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="max-w-5xl mx-auto px-8 py-8">
      <h1 className="text-2xl font-bold mb-6">面试题</h1>

      <ArticleFilters
        categories={categories}
        tags={tags}
        baseUrl="/interviews"
      />

      {q && (
        <p className="text-sm text-gray-500 mb-4">
          搜索 &quot;{q}&quot; 共 {total} 条结果
        </p>
      )}

      <div className="space-y-3">
        {articles.map((article) => (
          <ArticleCard key={article.id} article={article} />
        ))}
      </div>

      {articles.length === 0 && (
        <p className="text-gray-500 text-center py-12">暂无内容</p>
      )}

      <Pagination
        currentPage={page}
        totalPages={totalPages}
        baseUrl="/interviews"
      />
    </div>
  );
}
