import { JSDOM } from "jsdom";
import { Readability } from "@mozilla/readability";
import TurndownService from "turndown";
import { prisma } from "./prisma";

interface ImportResult {
  title: string;
  content: string;
  suggestedCategoryId: string | null;
  suggestedTagIds: string[];
}

export async function importFromUrl(url: string): Promise<ImportResult> {
  // Fetch page
  const response = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (compatible; AndroidHub/1.0; Content Importer)",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch URL: ${response.status}`);
  }

  const html = await response.text();

  // Extract main content using Readability
  const dom = new JSDOM(html, { url });
  const reader = new Readability(dom.window.document);
  const article = reader.parse();

  if (!article) {
    throw new Error("Could not extract article content from URL");
  }

  // Convert HTML to Markdown
  const turndown = new TurndownService({
    headingStyle: "atx",
    codeBlockStyle: "fenced",
  });

  const markdown = turndown.turndown(article.content || "");
  const title = article.title || "Untitled";

  // Match categories and tags by keyword
  const fullText = `${title} ${markdown}`.toLowerCase();

  const categories = await prisma.category.findMany();
  const tags = await prisma.tag.findMany();

  // Find best matching category
  let suggestedCategoryId: string | null = null;
  for (const cat of categories) {
    if (fullText.includes(cat.name.toLowerCase())) {
      suggestedCategoryId = cat.id;
      break;
    }
  }

  // Find matching tags
  const suggestedTagIds = tags
    .filter((tag) => fullText.includes(tag.name.toLowerCase()))
    .map((tag) => tag.id);

  return {
    title,
    content: markdown,
    suggestedCategoryId,
    suggestedTagIds,
  };
}
