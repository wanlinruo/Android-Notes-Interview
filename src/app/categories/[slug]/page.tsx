import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ArticleCard } from "@/components/article-card";
import { Pagination } from "@/components/pagination";

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | undefined }>;
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { page: pageStr } = await searchParams;
  const page = parseInt(pageStr || "1");
  const pageSize = 20;

  const category = await prisma.category.findUnique({
    where: { slug },
    include: { children: true },
  });

  if (!category) notFound();

  // Include articles from child categories too
  const categoryIds = [category.id, ...category.children.map((c) => c.id)];

  const where = {
    categoryId: { in: categoryIds },
    status: "PUBLISHED" as const,
  };

  const [articles, total] = await Promise.all([
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
  ]);

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="max-w-5xl mx-auto px-8 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">
          {category.icon} {category.name}
        </h1>
        {category.description && (
          <p className="text-gray-500 mt-1">{category.description}</p>
        )}
      </div>

      {category.children.length > 0 && (
        <div className="flex gap-2 mb-6">
          {category.children.map((child) => (
            <a
              key={child.id}
              href={`/categories/${child.slug}`}
              className="text-sm px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              {child.name}
            </a>
          ))}
        </div>
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
        baseUrl={`/categories/${slug}`}
      />
    </div>
  );
}
