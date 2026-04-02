import { prisma } from "@/lib/prisma";
import { ImportForm } from "@/components/admin/import-form";

export const dynamic = "force-dynamic";

export default async function AdminImportPage() {
  const [categories, tags] = await Promise.all([
    prisma.category.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.tag.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div>
      <h1 className="text-xl font-bold mb-2">内容采集</h1>
      <p className="text-sm text-gray-500 mb-6">
        输入外部文章 URL，自动提取内容并转为 Markdown 草稿
      </p>
      <ImportForm categories={categories} tags={tags} />
    </div>
  );
}
