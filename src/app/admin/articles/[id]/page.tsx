import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ArticleForm } from "@/components/admin/article-form";
import { VersionHistory } from "@/components/admin/version-history";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function AdminArticleEditPage({ params }: Props) {
  const { id } = await params;

  const [categories, tags] = await Promise.all([
    prisma.category.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.tag.findMany({ orderBy: { name: "asc" } }),
  ]);

  if (id === "new") {
    return (
      <div>
        <h1 className="mb-6 text-xl font-bold">New Article</h1>
        <ArticleForm categories={categories} tags={tags} />
      </div>
    );
  }

  const article = await prisma.article.findUnique({
    where: { id },
    include: { tags: true },
  });

  if (!article) notFound();

  return (
    <div>
      <h1 className="mb-6 text-xl font-bold">Edit Article</h1>
      <div className="flex gap-6 items-start">
        <div className="flex-1 min-w-0">
          <ArticleForm article={article} categories={categories} tags={tags} />
        </div>
        <div className="hidden lg:block w-72 flex-shrink-0 sticky top-6">
          <VersionHistory articleId={id} />
        </div>
      </div>
    </div>
  );
}
