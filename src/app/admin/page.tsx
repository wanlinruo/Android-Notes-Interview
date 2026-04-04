import { prisma } from "@/lib/prisma";
import { StatsCard } from "@/components/admin/stats-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export const dynamic = "force-dynamic";

const quickActions = [
  { href: "/admin/articles", label: "New Article", icon: "✏️", desc: "Write & publish" },
  { href: "/admin/categories", label: "Categories", icon: "📁", desc: "Manage categories" },
  { href: "/admin/import", label: "Import", icon: "📥", desc: "Batch import" },
];

const rankStyle: Record<number, string> = {
  0: "bg-amber-500/15 text-amber-600 dark:text-amber-400 ring-1 ring-amber-500/20",
  1: "bg-gray-400/15 text-gray-500 dark:text-gray-400 ring-1 ring-gray-400/20",
  2: "bg-orange-500/15 text-orange-600 dark:text-orange-400 ring-1 ring-orange-500/20",
};

export default async function AdminDashboard() {
  const [noteCount, interviewCount, userCount, totalViews, totalFavorites, topArticles] =
    await Promise.all([
      prisma.article.count({ where: { type: "NOTE", status: "PUBLISHED" } }),
      prisma.article.count({ where: { type: "INTERVIEW", status: "PUBLISHED" } }),
      prisma.user.count(),
      prisma.article.aggregate({ _sum: { viewCount: true } }),
      prisma.favorite.count(),
      prisma.article.findMany({
        where: { status: "PUBLISHED" },
        orderBy: { favorites: { _count: "desc" } },
        take: 10,
        include: { _count: { select: { favorites: true } }, category: true },
      }),
    ]);

  const maxFav = topArticles[0]?._count.favorites || 1;
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="max-w-6xl">
      {/* Header */}
      <div className="mb-8 flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Welcome back</h1>
          <p className="mt-1 text-sm text-muted-foreground">{today}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="mb-6 grid gap-4 grid-cols-2 lg:grid-cols-5">
        <StatsCard label="Notes" sublabel="published" value={noteCount} icon="📝" color="indigo" />
        <StatsCard label="Interviews" sublabel="published" value={interviewCount} icon="❓" color="violet" />
        <StatsCard label="Users" sublabel="registered" value={userCount} icon="👥" color="blue" />
        <StatsCard label="Views" sublabel="total" value={totalViews._sum.viewCount || 0} icon="👁" color="amber" />
        <StatsCard label="Favorites" sublabel="total" value={totalFavorites} icon="⭐" color="rose" />
      </div>

      {/* Quick Actions */}
      <div className="mb-6 grid gap-4 grid-cols-3">
        {quickActions.map((action) => (
          <Link key={action.href} href={action.href}>
            <Card className="transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:border-primary/30 cursor-pointer">
              <CardContent className="flex items-center gap-3 p-4">
                <span className="text-xl">{action.icon}</span>
                <div>
                  <div className="text-sm font-medium">{action.label}</div>
                  <div className="text-xs text-muted-foreground">{action.desc}</div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Top Favorited Articles */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Top Favorited Articles</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            {topArticles.map((article, i) => (
              <Link key={article.id} href={`/admin/articles/${article.id}`} className="block">
                <div className="flex items-center gap-3 rounded-lg p-2.5 transition-colors hover:bg-accent">
                  {/* Rank */}
                  <span
                    className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg text-xs font-bold ${
                      rankStyle[i] || "bg-muted text-muted-foreground"
                    }`}
                  >
                    {i + 1}
                  </span>

                  {/* Title + Category */}
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <span className="text-sm font-medium truncate">{article.title}</span>
                    <Badge variant="outline" className="flex-shrink-0 text-[11px]">
                      {article.category.name}
                    </Badge>
                  </div>

                  {/* Stats + Bar */}
                  <div className="flex items-center gap-4 flex-shrink-0">
                    <span className="text-xs text-muted-foreground w-16 text-right">
                      👁 {(article.viewCount ?? 0).toLocaleString()}
                    </span>
                    <div className="flex items-center gap-2 w-28">
                      <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full rounded-full bg-primary/50"
                          style={{ width: `${(article._count.favorites / maxFav) * 100}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium text-muted-foreground w-8 text-right">
                        ⭐ {article._count.favorites}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
