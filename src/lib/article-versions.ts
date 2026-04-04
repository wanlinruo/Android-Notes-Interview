import { prisma } from "@/lib/prisma";

const MAX_VERSIONS = 10;
const MAX_AGE_MONTHS = 6;

/**
 * Snapshot the current article state into ArticleVersion before an update.
 * Returns the created version.
 */
export async function createArticleVersion(articleId: string) {
  const article = await prisma.article.findUnique({
    where: { id: articleId },
    include: { tags: { select: { tagId: true } } },
  });

  if (!article) throw new Error("Article not found");

  // Get next version number
  const latestVersion = await prisma.articleVersion.findFirst({
    where: { articleId },
    orderBy: { version: "desc" },
    select: { version: true },
  });
  const nextVersion = (latestVersion?.version ?? 0) + 1;

  const version = await prisma.articleVersion.create({
    data: {
      articleId,
      version: nextVersion,
      title: article.title,
      slug: article.slug,
      content: article.content,
      summary: article.summary,
      type: article.type,
      status: article.status,
      categoryId: article.categoryId,
      tagIds: article.tags.map((t) => t.tagId),
    },
  });

  await cleanupVersions(articleId);

  return version;
}

/**
 * Delete versions that exceed the quantity limit or time limit.
 */
async function cleanupVersions(articleId: string) {
  const cutoffDate = new Date();
  cutoffDate.setMonth(cutoffDate.getMonth() - MAX_AGE_MONTHS);

  // Delete versions older than 6 months
  await prisma.articleVersion.deleteMany({
    where: {
      articleId,
      createdAt: { lt: cutoffDate },
    },
  });

  // Delete versions exceeding the count limit (keep newest 10)
  const versions = await prisma.articleVersion.findMany({
    where: { articleId },
    orderBy: { version: "desc" },
    select: { id: true },
  });

  if (versions.length > MAX_VERSIONS) {
    const idsToDelete = versions.slice(MAX_VERSIONS).map((v) => v.id);
    await prisma.articleVersion.deleteMany({
      where: { id: { in: idsToDelete } },
    });
  }
}
