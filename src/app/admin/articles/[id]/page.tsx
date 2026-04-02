import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ArticleForm } from "@/components/admin/article-form";

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
        <h1 className="text-xl font-bold mb-6">新建文章</h1>
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
      <h1 className="text-xl font-bold mb-6">编辑文章</h1>
      <ArticleForm article={article} categories={categories} tags={tags} />
    </div>
  );
}
