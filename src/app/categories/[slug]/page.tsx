import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { MasonryArticleCard } from "@/components/masonry-article-card";
import { Pagination } from "@/components/pagination";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | undefined }>;
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const sp = await searchParams;
  const page = parseInt(sp.page || "1");
  const pageSize = 12;

  const category = await prisma.category.findUnique({
    where: { slug },
    include: {
      parent: true,
      children: {
        orderBy: { sortOrder: "asc" },
        include: { _count: { select: { articles: true } } },
      },
    },
  });

  if (!category) notFound();

  // If this is a child category, load siblings from parent
  let parentCategory = category.parent
    ? await prisma.category.findUnique({
        where: { id: category.parent.id },
        include: {
          children: {
            orderBy: { sortOrder: "asc" },
            include: { _count: { select: { articles: true } } },
          },
        },
      })
    : null;

  // Determine tree display: if has children, show self as parent; if has parent, show parent's tree
  const isParent = category.children.length > 0;
  const treeParent = isParent ? category : parentCategory;
  const treeChildren = isParent ? category.children : (parentCategory?.children || []);

  // Include articles from child categories too
  const categoryIds = isParent
    ? [category.id, ...category.children.map((c) => c.id)]
    : [category.id];

  const where = {
    categoryId: { in: categoryIds },
    status: "PUBLISHED" as const,
  };

  const [articles, total, totalViews] = await Promise.all([
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
    prisma.article.aggregate({ where, _sum: { viewCount: true } }),
  ]);

  const fromIndex = (page - 1) * pageSize + 1;
  const toIndex = Math.min(page * pageSize, total);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-8">
      {/* Hero Header */}
      <div className="relative mb-8 overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-primary/8 via-primary/4 to-transparent p-6 md:p-8">
        <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-[image:var(--brand-gradient)] opacity-[0.06]" />
        <div className="relative">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[image:var(--brand-gradient)] text-3xl shadow-md shadow-primary/25">
            {category.icon || "📁"}
          </div>
          <h1 className="text-2xl font-bold md:text-3xl">{category.name}</h1>
          {category.description && (
            <p className="mt-2 max-w-xl text-muted-foreground">{category.description}</p>
          )}
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <Badge variant="secondary" className="gap-1.5 rounded-full px-3 py-1">
              <span className="text-xs">📄</span> <strong className="text-primary">{total}</strong> articles
            </Badge>
            {treeChildren.length > 0 && (
              <Badge variant="secondary" className="gap-1.5 rounded-full px-3 py-1">
                <span className="text-xs">📂</span> <strong className="text-primary">{treeChildren.length}</strong> subcategories
              </Badge>
            )}
            <Badge variant="secondary" className="gap-1.5 rounded-full px-3 py-1">
              <span className="text-xs">👁</span> <strong className="text-primary">{(totalViews._sum.viewCount || 0).toLocaleString()}</strong> views
            </Badge>
          </div>
        </div>
      </div>

      {/* Category Tree */}
      {treeParent && treeChildren.length > 0 && (
        <div className="mb-8">
          <h2 className="mb-4 text-lg font-semibold">Category Structure</h2>
          <Card>
            <CardContent className="p-5 md:p-6">
              {/* Parent */}
              <div className="flex items-center gap-3 border-b border-dashed border-border pb-4 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[image:var(--brand-gradient)] text-xl shadow-sm shadow-primary/25">
                  {treeParent.icon || "📁"}
                </div>
                <div>
                  <div className="text-sm font-semibold">{treeParent.name}</div>
                  <div className="text-xs text-muted-foreground">Parent Category · {total} articles total</div>
                </div>
              </div>

              {/* Children with connector */}
              <div className="flex items-stretch ml-[19px]">
                {/* Vertical line */}
                <div className="w-0.5 rounded-full bg-gradient-to-b from-primary to-primary/40 flex-shrink-0" />

                {/* Children grid */}
                <div className="grid flex-1 grid-cols-2 gap-2.5 pl-5 md:grid-cols-3 lg:grid-cols-4">
                  {treeChildren.map((child) => {
                    const isActive = child.slug === slug;
                    return (
                      <Link
                        key={child.id}
                        href={`/categories/${child.slug}`}
                        className={`
                          relative flex items-center gap-2.5 rounded-xl border p-2.5 transition-all duration-200
                          before:absolute before:-left-5 before:top-1/2 before:h-0.5 before:w-4 before:bg-primary/30 before:content-['']
                          ${isActive
                            ? "border-primary bg-primary/10 shadow-sm shadow-primary/10"
                            : "border-border bg-muted/50 hover:border-primary/50 hover:bg-primary/5 hover:translate-x-1"
                          }
                        `}
                      >
                        <span className="text-lg flex-shrink-0">{child.icon || "📁"}</span>
                        <div className="min-w-0">
                          <div className={`text-[13px] font-medium truncate ${isActive ? "text-primary" : ""}`}>
                            {child.name}
                          </div>
                          <div className="text-[11px] text-muted-foreground">
                            {child._count.articles} articles
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Articles Section */}
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-lg font-semibold">
          {treeChildren.length > 0 ? "All Articles" : "Articles"}
        </h2>
        {total > 0 && (
          <span className="text-sm text-muted-foreground">
            Showing {fromIndex}-{toIndex} of {total}
          </span>
        )}
      </div>

      {/* Masonry Grid */}
      {articles.length > 0 ? (
        <div className="columns-1 gap-4 sm:columns-2 lg:columns-3">
          {articles.map((article) => (
            <MasonryArticleCard key={article.id} article={article} />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-16 text-center text-muted-foreground">
            No articles in this category yet
          </CardContent>
        </Card>
      )}

      <Pagination currentPage={page} totalPages={Math.ceil(total / pageSize)} />
    </div>
  );
}
