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
      <div className="mb-6">
        <h1 className="text-xl font-bold">Content Import</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Enter an external article URL to extract content and create a Markdown draft
        </p>
      </div>
      <ImportForm categories={categories} tags={tags} />
    </div>
  );
}
