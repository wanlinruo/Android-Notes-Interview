import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [categories, latestArticles, hotArticles, articleCount, userCount] = await Promise.all([
    prisma.category.findMany({
      where: { parentId: null },
      orderBy: { sortOrder: "asc" },
      include: { _count: { select: { articles: true } } },
    }),
    prisma.article.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        category: true,
        tags: { include: { tag: true } },
        _count: { select: { favorites: true } },
      },
    }),
    prisma.article.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { favorites: { _count: "desc" } },
      take: 5,
      include: {
        category: true,
        _count: { select: { favorites: true } },
      },
    }),
    prisma.article.count({ where: { status: "PUBLISHED" } }),
    prisma.user.count(),
  ]);

  const categoryCount = categories.length;

  return (
    <div className="mx-auto max-w-7xl px-4 md:px-8">
      {/* Hero */}
      <section className="py-12 md:py-16">
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
          Android Knowledge Hub
        </h1>
        <p className="mt-2 text-muted-foreground">
          Structured notes & interview prep for Android developers
        </p>
        <form action="/notes" className="mt-6 max-w-md">
          <Input
            type="text"
            name="q"
            placeholder="Search articles..."
            className="h-11 text-base ring-offset-background focus-visible:ring-2 focus-visible:ring-primary"
          />
        </form>
      </section>

      {/* Stats */}
      <section className="grid grid-cols-3 gap-3 pb-10 md:gap-4">
        {[
          { label: "Articles", value: articleCount },
          { label: "Categories", value: categoryCount },
          { label: "Learners", value: userCount },
        ].map((stat) => (
          <Card key={stat.label} className="transition-all duration-200 hover:-translate-y-0.5">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold bg-[image:var(--brand-gradient)] bg-clip-text text-transparent">
                {stat.value}
              </div>
              <div className="text-xs text-muted-foreground">{stat.label}</div>
            </CardContent>
          </Card>
        ))}
      </section>

      {/* Knowledge Modules */}
      <section className="pb-10">
        <h2 className="mb-4 text-xl font-semibold">Knowledge Modules</h2>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {categories.map((cat) => (
            <Link key={cat.id} href={`/categories/${cat.slug}`}>
              <Card className="group transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-md">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl">{cat.icon || "📁"}</div>
                  <div className="mt-1 text-sm font-medium group-hover:text-primary transition-colors">{cat.name}</div>
                  <div className="text-xs text-muted-foreground">{cat._count.articles} articles</div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* Hot & Latest Articles */}
      <section className="grid gap-8 pb-16 md:grid-cols-2">
        {/* Hot */}
        <div>
          <h2 className="mb-4 text-xl font-semibold">🔥 Hot Articles</h2>
          <div className="space-y-2">
            {hotArticles.map((article) => (
              <Link key={article.id} href={`/articles/${article.slug}`}>
                <Card className="group transition-all duration-200 hover:border-primary/50">
                  <CardContent className="flex items-center justify-between p-3">
                    <div className="min-w-0">
                      <div className="text-sm font-medium truncate group-hover:text-primary transition-colors">{article.title}</div>
                      <div className="text-xs text-muted-foreground">{article.category.name}</div>
                    </div>
                    <span className="ml-2 flex-shrink-0 text-xs text-muted-foreground">⭐ {article._count.favorites}</span>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* Latest */}
        <div>
          <h2 className="mb-4 text-xl font-semibold">📄 Latest Articles</h2>
          <div className="space-y-2">
            {latestArticles.map((article) => {
              const difficulty = article.tags.find((t) => t.tag.type === "DIFFICULTY");
              return (
                <Link key={article.id} href={`/articles/${article.slug}`}>
                  <Card className="group transition-all duration-200 hover:border-primary/50">
                    <CardContent className="flex items-center justify-between p-3">
                      <div className="min-w-0">
                        <div className="text-sm font-medium truncate group-hover:text-primary transition-colors">{article.title}</div>
                        <div className="mt-0.5 flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">{article.category.name}</span>
                          {difficulty && <Badge variant="outline" className="text-[10px] px-1.5 py-0">{difficulty.tag.name}</Badge>}
                        </div>
                      </div>
                      <Badge variant={article.type === "NOTE" ? "default" : "secondary"} className="ml-2 flex-shrink-0 text-xs">
                        {article.type}
                      </Badge>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
