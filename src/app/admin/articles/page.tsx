import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Pagination } from "@/components/pagination";
import { ArticleFilters } from "@/components/admin/article-filters-bar";
import { ArticlesTable } from "@/components/admin/articles-table";

export const dynamic = "force-dynamic";

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

  // Serialize and format dates on server to avoid hydration mismatch
  const serializedArticles = articles.map((a) => {
    const d = a.updatedAt;
    const formatted = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
    return {
      id: a.id,
      title: a.title,
      type: a.type,
      status: a.status,
      updatedAtFormatted: formatted,
      category: { name: a.category.name },
    };
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Articles</h1>
          <p className="mt-1 text-sm text-muted-foreground">{total} articles total</p>
        </div>
        <Link
          href="/admin/articles/new"
          className="inline-flex h-8 items-center justify-center rounded-lg bg-primary px-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/80"
        >
          New Article
        </Link>
      </div>

      <ArticleFilters currentStatus={status} currentType={type} />

      <Card>
        <CardContent className="p-0">
          <ArticlesTable articles={serializedArticles} />
        </CardContent>
      </Card>

      <Pagination currentPage={page} totalPages={Math.ceil(total / pageSize)} />
    </div>
  );
}
