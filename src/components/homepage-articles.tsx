"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { MasonryArticleCard } from "@/components/masonry-article-card";

interface Article {
  slug: string;
  title: string;
  summary?: string | null;
  coverImage?: string | null;
  type: string;
  viewCount: number;
  _count: { favorites: number; comments?: number };
  category: { name: string; icon?: string | null };
  tags: { tag: { name: string; type: string } }[];
}

interface Props {
  hotArticles: Article[];
  latestArticles: Article[];
}

const VARIANTS = ["featured", "compact", "default"] as const;
type Variant = (typeof VARIANTS)[number];

function randomizeVariants(articles: Article[]): Record<string, Variant> {
  const map: Record<string, Variant> = {};
  for (const article of articles) {
    map[article.slug] = VARIANTS[Math.floor(Math.random() * VARIANTS.length)];
  }
  return map;
}

// Deterministic initial variants to avoid hydration mismatch
function initialVariants(articles: Article[]): Record<string, Variant> {
  const map: Record<string, Variant> = {};
  for (let i = 0; i < articles.length; i++) {
    map[articles[i].slug] = VARIANTS[i % VARIANTS.length];
  }
  return map;
}

export function HomepageArticles({ hotArticles, latestArticles }: Props) {
  const [tab, setTab] = useState<"hot" | "latest">("hot");
  const [variantMap, setVariantMap] = useState<Record<string, Variant>>(() =>
    initialVariants([...hotArticles, ...latestArticles])
  );
  const articles = tab === "hot" ? hotArticles : latestArticles;
  const gridRef = useRef<HTMLDivElement>(null);

  // Randomize on client mount (after hydration)
  useEffect(() => {
    setVariantMap(randomizeVariants([...hotArticles, ...latestArticles]));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // JS masonry: measure card heights, position into columns row-first
  const layoutMasonry = useCallback(() => {
    const grid = gridRef.current;
    if (!grid) return;

    const items = Array.from(grid.children) as HTMLElement[];
    if (items.length === 0) return;

    const gridWidth = grid.clientWidth;
    const gap = 16;
    const cols = gridWidth >= 768 ? 3 : 2;
    const colWidth = (gridWidth - gap * (cols - 1)) / cols;

    // Track the height of each column
    const colHeights = new Array(cols).fill(0);

    for (const item of items) {
      // Find the shortest column (row-first: left to right, pick leftmost among equal)
      let minCol = 0;
      for (let c = 1; c < cols; c++) {
        if (colHeights[c] < colHeights[minCol]) minCol = c;
      }

      item.style.position = "absolute";
      item.style.width = `${colWidth}px`;
      item.style.left = `${minCol * (colWidth + gap)}px`;
      item.style.top = `${colHeights[minCol]}px`;

      colHeights[minCol] += item.offsetHeight + gap;
    }

    // Set grid height to tallest column
    grid.style.height = `${Math.max(...colHeights)}px`;
  }, []);

  useEffect(() => {
    // Layout after render + images load
    layoutMasonry();

    const grid = gridRef.current;
    if (!grid) return;

    // Re-layout when images load
    const images = grid.querySelectorAll("img");
    const onLoad = () => layoutMasonry();
    images.forEach((img) => img.addEventListener("load", onLoad));

    // Re-layout on resize
    window.addEventListener("resize", layoutMasonry);

    return () => {
      images.forEach((img) => img.removeEventListener("load", onLoad));
      window.removeEventListener("resize", layoutMasonry);
    };
  }, [tab, variantMap, layoutMasonry]);

  function handleTabChange(newTab: "hot" | "latest") {
    setTab(newTab);
    setVariantMap(randomizeVariants(newTab === "hot" ? hotArticles : latestArticles));
  }

  return (
    <section className="pb-16">
      {/* Tab bar */}
      <div className="mb-6 flex items-center gap-1 border-b border-border">
        <button
          onClick={() => handleTabChange("hot")}
          className={`px-4 py-2 text-sm font-medium transition-colors relative ${
            tab === "hot"
              ? "text-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          🔥 Hot
          {tab === "hot" && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
          )}
        </button>
        <button
          onClick={() => handleTabChange("latest")}
          className={`px-4 py-2 text-sm font-medium transition-colors relative ${
            tab === "latest"
              ? "text-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          📄 Latest
          {tab === "latest" && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
          )}
        </button>
      </div>

      {/* Masonry grid — JS positioned, row-first order preserved */}
      <div ref={gridRef} className="relative">
        {articles.map((article) => (
          <MasonryArticleCard key={article.slug} article={article} variant={variantMap[article.slug]} />
        ))}
      </div>
    </section>
  );
}
