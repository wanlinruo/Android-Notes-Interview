import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { ArticleCard } from "@/components/article-card";
import { ArticleFilters } from "@/components/article-filters";
import { Pagination } from "@/components/pagination";

export const dynamic = "force-dynamic";

interface Props {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}

export default async function NotesPage({ searchParams }: Props) {
  const params = await searchParams;
  const page = parseInt(params.page || "1");
  const pageSize = 12;
  const categorySlug = params.category;
  const difficultySlug = params.difficulty;
  const topicSlug = params.topic;
  const q = params.q;

  const where: Record<string, unknown> = {
    type: "NOTE",
    status: "PUBLISHED",
  };

  if (categorySlug) where.category = { slug: categorySlug };
  const tagSlugs = [difficultySlug, topicSlug].filter(Boolean);
  if (tagSlugs.length > 0) {
    where.AND = tagSlugs.map((slug) => ({
      tags: { some: { tag: { slug } } },
    }));
  }
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
        _count: { select: { favorites: true } },
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

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Knowledge Notes</h1>
        <p className="mt-1 text-muted-foreground">Structured Android development knowledge</p>
      </div>

      <div className="mb-6">
        <Suspense>
          <ArticleFilters categories={categories} tags={tags} baseUrl="/notes" />
        </Suspense>
      </div>

      {q && (
        <p className="mb-4 text-sm text-muted-foreground">
          Search &quot;{q}&quot; — {total} results
        </p>
      )}

      <div className="space-y-3">
        {articles.map((article) => (
          <ArticleCard key={article.id} article={article} />
        ))}
        {articles.length === 0 && (
          <p className="py-12 text-center text-muted-foreground">No articles found</p>
        )}
      </div>

      <Pagination currentPage={page} totalPages={Math.ceil(total / pageSize)} baseUrl="/notes" />
    </div>
  );
}
