"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Category, Tag } from "@/generated/prisma/client";

interface Props {
  categories: (Category & { children: Category[] })[];
  tags: Tag[];
  baseUrl: string;
}

export function ArticleFilters({ categories, tags, baseUrl }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentCategory = searchParams.get("category") || "";
  const currentTag = searchParams.get("tag") || "";

  function updateFilter(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete("page");
    router.push(`${baseUrl}?${params.toString()}`);
  }

  const difficultyTags = tags.filter((t) => t.type === "DIFFICULTY");
  const topicTags = tags.filter((t) => t.type === "TOPIC");

  return (
    <div className="flex flex-wrap gap-4 mb-6">
      <select
        value={currentCategory}
        onChange={(e) => updateFilter("category", e.target.value)}
        className="text-sm px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md"
      >
        <option value="">全部分类</option>
        {categories.map((cat) => (
          <optgroup key={cat.id} label={cat.name}>
            <option value={cat.slug}>{cat.name}</option>
            {cat.children.map((child) => (
              <option key={child.id} value={child.slug}>
                {child.name}
              </option>
            ))}
          </optgroup>
        ))}
      </select>

      <select
        value={currentTag}
        onChange={(e) => updateFilter("tag", e.target.value)}
        className="text-sm px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md"
      >
        <option value="">全部难度</option>
        {difficultyTags.map((tag) => (
          <option key={tag.id} value={tag.slug}>
            {tag.name}
          </option>
        ))}
      </select>

      {topicTags.length > 0 && (
        <div className="flex gap-2">
          {topicTags.map((tag) => (
            <button
              key={tag.id}
              onClick={() =>
                updateFilter("tag", currentTag === tag.slug ? "" : tag.slug)
              }
              className={`text-xs px-2 py-1 rounded-full border transition-colors ${
                currentTag === tag.slug
                  ? "bg-blue-600 text-white border-blue-600"
                  : "border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-blue-500"
              }`}
            >
              {tag.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
