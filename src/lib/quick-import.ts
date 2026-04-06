import { prisma } from "./prisma";
import { importFromUrl } from "./import";

interface QuickImportResult {
  success: true;
  article: {
    id: string;
    title: string;
    slug: string;
    editUrl: string;
  };
}

interface QuickImportError {
  success: false;
  error: string;
}

export async function quickImportArticle(
  url: string
): Promise<QuickImportResult | QuickImportError> {
  // Validate URL
  try {
    new URL(url);
  } catch {
    return { success: false, error: "Invalid URL format" };
  }

  // Extract content
  let extracted;
  try {
    extracted = await importFromUrl(url);
  } catch (e) {
    return {
      success: false,
      error: e instanceof Error ? e.message : "Failed to extract content from URL",
    };
  }

  // Generate slug
  const base = extracted.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  const slug = (base || "article") + `-${Date.now()}`;

  // Fetch random Unsplash cover image
  let coverImage: string | null = null;
  const accessKey = process.env.UNSPLASH_ACCESS_KEY;
  if (accessKey) {
    try {
      const res = await fetch(
        "https://api.unsplash.com/photos/random?query=technology&orientation=landscape",
        { headers: { Authorization: `Client-ID ${accessKey}` } }
      );
      if (res.ok) {
        const data = await res.json();
        coverImage = data.urls.regular;
      }
    } catch {
      // Ignore — cover image is optional
    }
  }

  // Create DRAFT article
  const article = await prisma.article.create({
    data: {
      title: extracted.title,
      slug,
      content: extracted.content,
      type: "NOTE",
      status: "DRAFT",
      sourceUrl: url,
      coverImage,
      categoryId: extracted.suggestedCategoryId || (await getDefaultCategoryId()),
      tags: extracted.suggestedTagIds.length > 0
        ? { create: extracted.suggestedTagIds.map((tagId) => ({ tagId })) }
        : undefined,
    },
  });

  return {
    success: true,
    article: {
      id: article.id,
      title: article.title,
      slug: article.slug,
      editUrl: `/admin/articles/${article.id}/edit`,
    },
  };
}

async function getDefaultCategoryId(): Promise<string> {
  const first = await prisma.category.findFirst({ orderBy: { sortOrder: "asc" } });
  if (!first) throw new Error("No categories exist in database");
  return first.id;
}
