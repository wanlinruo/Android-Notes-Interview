import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { HomepageArticles } from "@/components/homepage-articles";

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
      take: 6,
      include: {
        category: { select: { name: true, icon: true } },
        tags: { include: { tag: { select: { name: true, type: true } } } },
        _count: { select: { favorites: true, comments: true } },
      },
    }),
    prisma.article.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { favorites: { _count: "desc" } },
      take: 6,
      include: {
        category: { select: { name: true, icon: true } },
        tags: { include: { tag: { select: { name: true, type: true } } } },
        _count: { select: { favorites: true, comments: true } },
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
      <HomepageArticles hotArticles={hotArticles} latestArticles={latestArticles} />
    </div>
  );
}
