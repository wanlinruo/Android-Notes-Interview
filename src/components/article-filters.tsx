"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface FilterProps {
  categories: { id: string; name: string; slug: string; children?: { id: string; name: string; slug: string }[] }[];
  tags: { id: string; name: string; slug: string; type: string }[];
  baseUrl?: string;
}

export function ArticleFilters({ categories, tags, baseUrl = "" }: FilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentCategory = searchParams.get("category") || "";
  const currentTag = searchParams.get("tag") || "";
  const currentQuery = searchParams.get("q") || "";

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
    <div className="flex flex-wrap items-center gap-3 mb-6">
      {/* Search */}
      <Input
        type="text"
        placeholder="Search..."
        defaultValue={currentQuery}
        className="h-9 w-full sm:w-48"
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            updateFilter("q", (e.target as HTMLInputElement).value);
          }
        }}
      />

      {/* Category */}
      <select
        value={currentCategory}
        onChange={(e) => updateFilter("category", e.target.value)}
        className="h-9 rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        <option value="">All Categories</option>
        {categories.map((cat) => (
          <optgroup key={cat.id} label={cat.name}>
            <option value={cat.slug}>{cat.name}</option>
            {cat.children?.map((child) => (
              <option key={child.id} value={child.slug}>
                {child.name}
              </option>
            ))}
          </optgroup>
        ))}
      </select>

      {/* Difficulty */}
      <select
        value={currentTag}
        onChange={(e) => updateFilter("tag", e.target.value)}
        className="h-9 rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        <option value="">All Levels</option>
        {difficultyTags.map((tag) => (
          <option key={tag.id} value={tag.slug}>
            {tag.name}
          </option>
        ))}
      </select>

      {/* Topic Tags */}
      {topicTags.length > 0 && (
        <div className="flex gap-2">
          {topicTags.map((tag) => (
            <button
              key={tag.id}
              onClick={() => updateFilter("tag", currentTag === tag.slug ? "" : tag.slug)}
            >
              <Badge
                variant={currentTag === tag.slug ? "default" : "outline"}
                className="cursor-pointer transition-colors"
              >
                {tag.name}
              </Badge>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
