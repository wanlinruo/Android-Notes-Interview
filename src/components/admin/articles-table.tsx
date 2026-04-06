"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface Article {
  id: string;
  title: string;
  type: string;
  status: string;
  updatedAtFormatted: string;
  category: { name: string };
}

interface ArticlesTableProps {
  articles: Article[];
}

export function ArticlesTable({ articles }: ArticlesTableProps) {
  const router = useRouter();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [deleting, setDeleting] = useState(false);

  const allSelected = articles.length > 0 && selected.size === articles.length;
  const someSelected = selected.size > 0 && selected.size < articles.length;

  function toggleAll() {
    if (allSelected) {
      setSelected(new Set());
    } else {
      setSelected(new Set(articles.map((a) => a.id)));
    }
  }

  function toggleOne(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function handleBatchDelete() {
    if (selected.size === 0) return;
    const confirmed = window.confirm(`Are you sure you want to delete ${selected.size} article(s)?`);
    if (!confirmed) return;

    setDeleting(true);
    try {
      const res = await fetch("/api/articles", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: Array.from(selected) }),
      });

      if (res.ok) {
        setSelected(new Set());
        router.refresh();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to delete articles");
      }
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div>
      {/* Batch action bar */}
      {selected.size > 0 && (
        <div className="mb-3 flex items-center gap-3 rounded-lg border border-border bg-muted/30 px-4 py-2">
          <span className="text-sm text-muted-foreground">
            {selected.size} selected
          </span>
          <Button
            variant="destructive"
            size="sm"
            disabled={deleting}
            onClick={handleBatchDelete}
          >
            {deleting ? "Deleting..." : "Delete Selected"}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelected(new Set())}
          >
            Cancel
          </Button>
        </div>
      )}

      {/* Table */}
      <table className="w-full text-sm">
        <thead className="border-b border-border">
          <tr>
            <th className="w-10 px-4 py-3 text-left">
              <input
                type="checkbox"
                checked={allSelected}
                ref={(el) => { if (el) el.indeterminate = someSelected; }}
                onChange={toggleAll}
                className="h-4 w-4 rounded border-gray-300 cursor-pointer"
              />
            </th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Title</th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden sm:table-cell">Type</th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden md:table-cell">Category</th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden md:table-cell">Updated</th>
          </tr>
        </thead>
        <tbody>
          {articles.map((article) => (
            <tr
              key={article.id}
              className={`border-b border-border last:border-0 transition-colors hover:bg-accent/50 ${selected.has(article.id) ? "bg-accent/30" : ""}`}
            >
              <td className="px-4 py-3">
                <input
                  type="checkbox"
                  checked={selected.has(article.id)}
                  onChange={() => toggleOne(article.id)}
                  className="h-4 w-4 rounded border-gray-300 cursor-pointer"
                />
              </td>
              <td className="px-4 py-3">
                <Link href={`/admin/articles/${article.id}`} className="font-medium hover:text-primary transition-colors">
                  {article.title}
                </Link>
              </td>
              <td className="px-4 py-3 hidden sm:table-cell">
                <Badge variant="outline" className="text-[11px]">
                  {article.type === "NOTE" ? "Note" : "Interview"}
                </Badge>
              </td>
              <td className="px-4 py-3 hidden md:table-cell text-muted-foreground">
                {article.category.name}
              </td>
              <td className="px-4 py-3">
                <Badge variant={article.status === "PUBLISHED" ? "default" : "secondary"}>
                  {article.status === "PUBLISHED" ? "Published" : "Draft"}
                </Badge>
              </td>
              <td className="px-4 py-3 hidden md:table-cell text-muted-foreground">
                {article.updatedAtFormatted}
              </td>
            </tr>
          ))}
          {articles.length === 0 && (
            <tr>
              <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                No articles found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
