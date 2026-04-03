import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { MarkdownRenderer } from "@/components/markdown-renderer";
import { Toc } from "@/components/toc";
import { CategoryNav } from "@/components/category-nav";
import { FavoriteButton } from "@/components/favorite-button";
import { ProgressButton } from "@/components/progress-button";
import { FloatingActions } from "@/components/floating-actions";
import { CommentSection } from "@/components/comment-section";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function ArticleDetailPage({ params }: Props) {
  const { slug: rawSlug } = await params;
  const slug = decodeURIComponent(rawSlug);

  const article = await prisma.article.findUnique({
    where: { slug },
    include: {
      category: true,
      tags: { include: { tag: true } },
      _count: { select: { favorites: true, comments: true } },
    },
  });

  if (!article || article.status !== "PUBLISHED") notFound();

  // Increment view count
  await prisma.article.update({
    where: { id: article.id },
    data: { viewCount: { increment: 1 } },
  });

  const session = await auth();

  const [categoryArticles, favorite, progress] = await Promise.all([
    prisma.article.findMany({
      where: { categoryId: article.categoryId, status: "PUBLISHED" },
      select: { slug: true, title: true },
      orderBy: { createdAt: "asc" },
    }),
    session?.user
      ? prisma.favorite.findFirst({ where: { userId: session.user.id, articleId: article.id } })
      : null,
    session?.user
      ? prisma.progress.findFirst({ where: { userId: session.user.id, articleId: article.id } })
      : null,
  ]);

  const difficultyTag = article.tags.find((t) => t.tag.type === "DIFFICULTY");

  return (
    <div className="mx-auto max-w-7xl">
      {/* Breadcrumb */}
      <div className="border-b border-border px-4 py-2 text-xs text-muted-foreground md:px-8">
        <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
        {" / "}
        <Link href={`/categories/${article.category.slug}`} className="hover:text-foreground transition-colors">
          {article.category.name}
        </Link>
        {" / "}
        <span className="text-foreground">{article.title}</span>
      </div>

      <div className="flex min-h-[calc(100vh-8rem)]">
        {/* Left: Category Nav */}
        <aside className="hidden w-56 flex-shrink-0 overflow-y-auto border-r border-border p-4 lg:block">
          <CategoryNav articles={categoryArticles} currentSlug={slug} categoryName={article.category.name} />
        </aside>

        {/* Center: Article Content */}
        <article className="min-w-0 flex-1 px-4 py-6 md:px-8">
          <h1 className="text-2xl font-bold">{article.title}</h1>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Badge variant={article.type === "NOTE" ? "default" : "secondary"}>
              {article.type}
            </Badge>
            {difficultyTag && <Badge variant="outline">{difficultyTag.tag.name}</Badge>}
            <span className="text-xs text-muted-foreground">
              👁 {article.viewCount} · ⭐ {article._count.favorites} · {new Date(article.updatedAt).toLocaleDateString()}
            </span>
          </div>

          <Separator className="my-6" />

          <MarkdownRenderer content={article.content} />

          <Separator className="my-8" />

          <CommentSection articleId={article.id} />
        </article>

        {/* Right: TOC + Actions */}
        <aside className="hidden w-48 flex-shrink-0 border-l border-border p-4 xl:block">
          <div className="sticky top-20 space-y-6 max-h-[calc(100vh-6rem)] overflow-y-auto">
            <div className="flex flex-col gap-2">
              <FavoriteButton articleId={article.id} initialFavorited={!!favorite} count={article._count.favorites} />
              <ProgressButton articleId={article.id} initialStatus={progress?.status || "UNREAD"} />
            </div>
            <Separator />
            <Toc content={article.content} />
          </div>
        </aside>
      </div>

      {/* Mobile floating actions */}
      <FloatingActions
        articleId={article.id}
        initialFavorited={!!favorite}
        favoriteCount={article._count.favorites}
        initialStatus={progress?.status || "UNREAD"}
      />
    </div>
  );
}
