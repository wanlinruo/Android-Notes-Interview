import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const [user, favorites, progress, comments] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { nickname: true, email: true, createdAt: true },
    }),
    prisma.favorite.findMany({
      where: { userId: session.user.id },
      include: {
        article: {
          include: {
            category: true,
            _count: { select: { favorites: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.progress.findMany({
      where: { userId: session.user.id },
      include: { article: { include: { category: true } } },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.comment.findMany({
      where: { userId: session.user.id },
      include: { article: { select: { title: true, slug: true } } },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
  ]);

  // Group progress by category with status breakdown
  const categoryProgress = new Map<
    string,
    { name: string; icon: string | null; total: number; done: number; reading: number; unread: number }
  >();
  progress.forEach((p) => {
    const cat = p.article.category;
    const entry = categoryProgress.get(cat.name) || {
      name: cat.name,
      icon: cat.icon,
      total: 0,
      done: 0,
      reading: 0,
      unread: 0,
    };
    entry.total++;
    if (p.status === "DONE") entry.done++;
    else if (p.status === "READING") entry.reading++;
    else entry.unread++;
    categoryProgress.set(cat.name, entry);
  });

  // Stats
  const totalRead = progress.length;
  const totalDone = progress.filter((p) => p.status === "DONE").length;
  const totalFavorites = favorites.length;

  // Recent activity: merge favorites, progress, comments — take latest 8
  type Activity = { type: "favorite" | "done" | "comment"; title: string; slug: string; time: Date };
  const activities: Activity[] = [];
  favorites.slice(0, 5).forEach((f) =>
    activities.push({ type: "favorite", title: f.article.title, slug: f.article.slug, time: f.createdAt })
  );
  progress
    .filter((p) => p.status === "DONE")
    .slice(0, 5)
    .forEach((p) =>
      activities.push({ type: "done", title: p.article.title, slug: p.article.slug, time: p.updatedAt })
    );
  comments.slice(0, 5).forEach((c) =>
    activities.push({ type: "comment", title: c.article.title, slug: c.article.slug, time: c.createdAt })
  );
  activities.sort((a, b) => b.time.getTime() - a.time.getTime());
  const recentActivities = activities.slice(0, 8);

  function formatTimeAgo(date: Date) {
    const diff = Date.now() - date.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days}d ago`;
    return date.toLocaleDateString();
  }

  const joinDate = user?.createdAt
    ? user.createdAt.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
    : "";

  return (
    <div className="mx-auto max-w-[860px] px-4 py-8 md:px-8">
      {/* Profile Hero */}
      <div className="mb-8 overflow-hidden rounded-2xl border border-border bg-card">
        <div className="h-28 bg-[image:var(--brand-gradient)] relative">
          <div className="absolute inset-0 opacity-10" style={{
            backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
          }} />
        </div>
        <div className="relative px-6 pb-6">
          <div className="-mt-10 flex h-20 w-20 items-center justify-center rounded-2xl bg-[image:var(--brand-gradient)] text-3xl font-bold text-white border-4 border-card shadow-lg shadow-primary/25">
            {session.user.name?.[0] || session.user.email?.[0] || "U"}
          </div>
          <div className="mt-3">
            <h1 className="text-xl font-bold">{session.user.name || "User"}</h1>
            <p className="text-sm text-muted-foreground">{session.user.email}</p>
            {joinDate && (
              <p className="mt-1 text-xs text-muted-foreground">📅 Joined {joinDate}</p>
            )}
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="mb-7 grid grid-cols-3 gap-3">
        {[
          { icon: "📖", value: totalRead, label: "Articles Read", color: "bg-blue-500/10" },
          { icon: "✅", value: totalDone, label: "Completed", color: "bg-green-500/10" },
          { icon: "⭐", value: totalFavorites, label: "Favorites", color: "bg-amber-500/10" },
        ].map((stat) => (
          <Card key={stat.label} className="transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
            <CardContent className="p-4 text-center">
              <div className={`mx-auto mb-2 flex h-9 w-9 items-center justify-center rounded-xl ${stat.color} text-lg`}>
                {stat.icon}
              </div>
              <div className="text-2xl font-bold bg-[image:var(--brand-gradient)] bg-clip-text text-transparent">
                {stat.value}
              </div>
              <div className="text-xs text-muted-foreground">{stat.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Learning Progress */}
      <section className="mb-7">
        <div className="mb-4 flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-green-500/10 text-sm">📊</span>
          <h2 className="text-[17px] font-semibold">Learning Progress</h2>
        </div>

        {categoryProgress.size > 0 ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {Array.from(categoryProgress.values()).map((cat) => {
              const pct = cat.total > 0 ? Math.round((cat.done / cat.total) * 100) : 0;
              return (
                <Card key={cat.name} className="transition-all duration-200 hover:border-primary hover:shadow-md">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2.5">
                      <span className="flex items-center gap-1.5 text-sm font-semibold">
                        {cat.icon || "📁"} {cat.name}
                      </span>
                      <span className="text-sm font-bold text-primary">{pct}%</span>
                    </div>
                    <div className="mb-2 h-2 w-full overflow-hidden rounded-full bg-secondary">
                      <div
                        className="h-full rounded-full bg-[image:var(--brand-gradient)] transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      {cat.done > 0 && (
                        <span className="flex items-center gap-1">
                          <span className="inline-block h-1.5 w-1.5 rounded-full bg-green-500" />
                          {cat.done} done
                        </span>
                      )}
                      {cat.reading > 0 && (
                        <span className="flex items-center gap-1">
                          <span className="inline-block h-1.5 w-1.5 rounded-full bg-amber-500" />
                          {cat.reading} reading
                        </span>
                      )}
                      {cat.unread > 0 && (
                        <span className="flex items-center gap-1">
                          <span className="inline-block h-1.5 w-1.5 rounded-full bg-border" />
                          {cat.unread} unread
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card>
            <CardContent className="py-8 text-center">
              <div className="text-3xl mb-2 opacity-50">📊</div>
              <p className="text-sm text-muted-foreground">No progress tracked yet. Start reading articles!</p>
            </CardContent>
          </Card>
        )}
      </section>

      {/* Favorites */}
      <section className="mb-7">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/10 text-sm">⭐</span>
            <h2 className="text-[17px] font-semibold">Favorites</h2>
          </div>
          {favorites.length > 0 && (
            <Badge variant="secondary" className="text-xs font-semibold text-primary">
              {favorites.length} saved
            </Badge>
          )}
        </div>

        {favorites.length > 0 ? (
          <Card>
            <CardContent className="p-2">
              <div className="flex flex-col gap-1">
                {favorites.map((fav) => (
                  <Link
                    key={fav.id}
                    href={`/articles/${fav.article.slug}`}
                    className="flex items-center gap-3 rounded-xl border border-transparent p-2.5 transition-all duration-150 hover:translate-x-1 hover:border-border hover:bg-primary/5"
                  >
                    <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10 text-base">
                      {fav.article.category.icon || "📄"}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium">{fav.article.title}</div>
                      <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                        <span>👁 {fav.article.viewCount}</span>
                        <span>⭐ {fav.article._count.favorites}</span>
                      </div>
                    </div>
                    <Badge variant="secondary" className="flex-shrink-0 text-[11px] font-medium text-primary">
                      {fav.article.category.name}
                    </Badge>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="py-8 text-center">
              <div className="text-3xl mb-2 opacity-50">⭐</div>
              <p className="text-sm text-muted-foreground">No favorites yet. Star articles you want to revisit!</p>
            </CardContent>
          </Card>
        )}
      </section>

      {/* Recent Activity */}
      {recentActivities.length > 0 && (
        <section className="mb-7">
          <div className="mb-4 flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500/10 text-sm">🕐</span>
            <h2 className="text-[17px] font-semibold">Recent Activity</h2>
          </div>

          <Card>
            <CardContent className="p-0">
              {recentActivities.map((activity, i) => (
                <Link
                  key={`${activity.type}-${activity.slug}-${i}`}
                  href={`/articles/${activity.slug}`}
                  className={`flex items-center gap-3 px-4 py-3 text-sm transition-colors hover:bg-accent ${
                    i < recentActivities.length - 1 ? "border-b border-border" : ""
                  }`}
                >
                  <span
                    className={`inline-block h-2 w-2 flex-shrink-0 rounded-full ${
                      activity.type === "done"
                        ? "bg-green-500"
                        : activity.type === "favorite"
                          ? "bg-amber-500"
                          : "bg-blue-500"
                    }`}
                  />
                  <span className="flex-1 text-muted-foreground">
                    {activity.type === "done" && "Completed "}
                    {activity.type === "favorite" && "Favorited "}
                    {activity.type === "comment" && "Commented on "}
                    <span className="font-medium text-foreground">{activity.title}</span>
                  </span>
                  <span className="flex-shrink-0 text-xs text-muted-foreground">
                    {formatTimeAgo(activity.time)}
                  </span>
                </Link>
              ))}
            </CardContent>
          </Card>
        </section>
      )}
    </div>
  );
}
