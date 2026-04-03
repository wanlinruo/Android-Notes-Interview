"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface FilterProps {
  categories: { id: string; name: string; slug: string; children?: { id: string; name: string; slug: string }[] }[];
  tags: { id: string; name: string; slug: string; type: string }[];
  baseUrl?: string;
}

export function ArticleFilters({ categories, tags, baseUrl = "" }: FilterProps) {
  const searchParams = useSearchParams();
  const currentCategory = searchParams.get("category") || "";
  const currentDifficulty = searchParams.get("difficulty") || "";
  const currentTopic = searchParams.get("topic") || "";
  const currentQuery = searchParams.get("q") || "";
  const [query, setQuery] = useState(currentQuery);

  function buildHref(key: string, value: string): string {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete("page");
    return `${baseUrl}?${params.toString()}`;
  }

  function searchHref(): string {
    const params = new URLSearchParams(searchParams.toString());
    if (query) {
      params.set("q", query);
    } else {
      params.delete("q");
    }
    params.delete("page");
    return `${baseUrl}?${params.toString()}`;
  }

  const difficultyTags = tags.filter((t) => t.type === "DIFFICULTY");
  const topicTags = tags.filter((t) => t.type === "TOPIC");

  return (
    <Card>
      <CardContent className="space-y-3 p-4">
        {/* Search */}
        <div className="flex gap-2">
          <Input
            type="text"
            placeholder="Search articles..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="h-9 w-full"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                window.location.href = searchHref();
              }
            }}
          />
          <Link href={searchHref()}>
            <Button variant="outline" size="sm" className="h-9 px-3">
              Search
            </Button>
          </Link>
        </div>

        {/* Categories — grouped by parent */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-medium text-muted-foreground mr-1">Category</span>
            <Link
              href={buildHref("category", "")}
              className={cn(
                buttonVariants({ variant: currentCategory === "" ? "default" : "outline", size: "sm" }),
                "h-7 px-2.5 text-xs"
              )}
            >
              All
            </Link>
            {categories.map((cat) => (
              <div key={cat.id} className="flex items-center gap-1.5">
                <div className="mx-1 h-4 w-px bg-border" />
                <Link
                  href={buildHref("category", currentCategory === cat.slug ? "" : cat.slug)}
                  className={cn(
                    buttonVariants({ variant: currentCategory === cat.slug ? "default" : "outline", size: "sm" }),
                    "h-7 px-2.5 text-xs font-semibold"
                  )}
                >
                  {cat.name}
                </Link>
                {cat.children?.map((child) => (
                  <Link
                    key={child.id}
                    href={buildHref("category", currentCategory === child.slug ? "" : child.slug)}
                    className={cn(
                      buttonVariants({ variant: currentCategory === child.slug ? "default" : "outline", size: "sm" }),
                      "h-7 px-2.5 text-xs"
                    )}
                  >
                    {child.name}
                  </Link>
                ))}
              </div>
            ))}
        </div>

        {/* Difficulty */}
        {difficultyTags.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 border-t border-border pt-3">
            <span className="text-xs font-medium text-muted-foreground mr-1">Level</span>
            <Link
              href={buildHref("difficulty", "")}
              className={cn(
                buttonVariants({ variant: currentDifficulty === "" ? "default" : "outline", size: "sm" }),
                "h-7 px-2.5 text-xs"
              )}
            >
              All
            </Link>
            {difficultyTags.map((tag) => (
              <Link
                key={tag.id}
                href={buildHref("difficulty", currentDifficulty === tag.slug ? "" : tag.slug)}
                className={cn(
                  buttonVariants({ variant: currentDifficulty === tag.slug ? "default" : "outline", size: "sm" }),
                  "h-7 px-2.5 text-xs"
                )}
              >
                {tag.name}
              </Link>
            ))}
          </div>
        )}

        {/* Topic Tags */}
        {topicTags.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 border-t border-border pt-3">
            <span className="text-xs font-medium text-muted-foreground mr-1">Topics</span>
            {topicTags.map((tag) => (
              <Link
                key={tag.id}
                href={buildHref("topic", currentTopic === tag.slug ? "" : tag.slug)}
                className={cn(
                  buttonVariants({ variant: currentTopic === tag.slug ? "default" : "outline", size: "sm" }),
                  "h-7 px-2.5 text-xs"
                )}
              >
                {tag.name}
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
