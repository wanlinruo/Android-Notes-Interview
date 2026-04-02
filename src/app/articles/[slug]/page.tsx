import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { MarkdownRenderer } from "@/components/markdown-renderer";
import { Toc } from "@/components/toc";
import { CategoryNav } from "@/components/category-nav";
import { FavoriteButton } from "@/components/favorite-button";
import { ProgressButton } from "@/components/progress-button";
import { CommentSection } from "@/components/comment-section";

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

  // Get articles in same category for left nav
  const categoryArticles = await prisma.article.findMany({
    where: { categoryId: article.categoryId, status: "PUBLISHED" },
    select: { id: true, title: true, slug: true },
    orderBy: { createdAt: "asc" },
  });

  // Get user-specific data
  const session = await auth();
  let favorited = false;
  let progressStatus = "UNREAD";

  if (session?.user) {
    const [fav, progress] = await Promise.all([
      prisma.favorite.findUnique({
        where: {
          userId_articleId: {
            userId: session.user.id,
            articleId: article.id,
          },
        },
      }),
      prisma.progress.findUnique({
        where: {
          userId_articleId: {
            userId: session.user.id,
            articleId: article.id,
          },
        },
      }),
    ]);
    favorited = !!fav;
    progressStatus = progress?.status || "UNREAD";
  }

  const difficultyTag = article.tags.find(
    (t) => t.tag.type === "DIFFICULTY"
  )?.tag;

  return (
    <div className="max-w-7xl mx-auto">
      {/* Breadcrumb */}
      <div className="px-4 py-2 text-xs text-gray-500 border-b border-gray-800">
        <a href="/" className="hover:text-gray-300">
          首页
        </a>{" "}
        /{" "}
        <a
          href={`/categories/${article.category.slug}`}
          className="hover:text-gray-300"
        >
          {article.category.name}
        </a>{" "}
        / {article.title}
      </div>

      <div className="flex min-h-[calc(100vh-8rem)]">
        {/* Left: Category Nav */}
        <aside className="w-52 flex-shrink-0 border-r border-gray-800 p-4 hidden lg:block overflow-y-auto">
          <CategoryNav
            articles={categoryArticles}
            currentSlug={slug}
            categoryName={article.category.name}
          />
        </aside>

        {/* Center: Content */}
        <article className="flex-1 px-8 py-6 min-w-0 overflow-y-auto">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-xl font-bold">{article.title}</h1>
            <div className="flex items-center gap-3 text-xs text-gray-500">
              <span>{article._count.favorites} 收藏</span>
              <span>{article.viewCount} 浏览</span>
            </div>
          </div>

          <div className="flex gap-2 mb-6">
            <span
              className={`text-xs px-2 py-0.5 rounded ${
                article.type === "NOTE"
                  ? "bg-blue-900 text-blue-300"
                  : "bg-purple-900 text-purple-300"
              }`}
            >
              {article.type === "NOTE" ? "笔记" : "面试"}
            </span>
            {difficultyTag && (
              <span className="text-xs px-2 py-0.5 rounded bg-green-900 text-green-300">
                {difficultyTag.name}
              </span>
            )}
            <span className="text-xs px-2 py-0.5 rounded bg-gray-800 text-gray-400">
              {article.category.name}
            </span>
          </div>

          <MarkdownRenderer content={article.content} />

          <CommentSection articleId={article.id} />
        </article>

        {/* Right: TOC + Actions */}
        <aside className="w-44 flex-shrink-0 border-l border-gray-800 p-4 hidden xl:block">
          <Toc content={article.content} />
          <div className="mt-6 space-y-2">
            <FavoriteButton
              articleId={article.id}
              initialFavorited={favorited}
              count={article._count.favorites}
            />
            <ProgressButton
              articleId={article.id}
              initialStatus={progressStatus}
            />
          </div>
        </aside>
      </div>
    </div>
  );
}
