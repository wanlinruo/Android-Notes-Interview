"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import { Category, Tag, Article } from "@/generated/prisma/client";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface Props {
  article?: Article & { tags: { tagId: string }[] };
  categories: Category[];
  tags: Tag[];
}

export function ArticleForm({ article, categories, tags }: Props) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState(article?.title || "");
  const [content, setContent] = useState(article?.content || "");
  const [summary, setSummary] = useState(article?.summary || "");
  const [type, setType] = useState(article?.type || "NOTE");
  const [status, setStatus] = useState(article?.status || "DRAFT");
  const [categoryId, setCategoryId] = useState(article?.categoryId || "");
  const [coverImage, setCoverImage] = useState(article?.coverImage || "");
  const [coverLoading, setCoverLoading] = useState(false);
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>(
    article?.tags.map((t) => t.tagId) || []
  );

  const fetchRandomCover = useCallback(async () => {
    setCoverLoading(true);
    try {
      const res = await fetch("/api/unsplash");
      if (res.ok) {
        const data = await res.json();
        setCoverImage(data.url);
      }
    } finally {
      setCoverLoading(false);
    }
  }, []);

  // Auto-fetch cover image for new articles
  useEffect(() => {
    if (!article && !coverImage) {
      void fetchRandomCover();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function toggleTag(tagId: string) {
    setSelectedTagIds((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    const body = { title, content, summary, type, status, categoryId, tagIds: selectedTagIds, coverImage: coverImage || null };
    const url = article ? `/api/articles/${article.id}` : "/api/articles";
    const method = article ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    setSaving(false);

    if (res.ok) {
      router.push("/admin/articles");
      router.refresh();
    }
  }

  async function handleDelete() {
    await fetch(`/api/articles/${article!.id}`, { method: "DELETE" });
    router.push("/admin/articles");
    router.refresh();
  }

  const difficultyTags = tags.filter((t) => t.type === "DIFFICULTY");
  const topicTags = tags.filter((t) => t.type === "TOPIC");

  return (
    <Card>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Title */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Title</label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>

          {/* Summary */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Summary</label>
            <Input value={summary} onChange={(e) => setSummary(e.target.value)} />
          </div>

          {/* Cover Image */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Cover Image URL</label>
            <div className="flex gap-2">
              <Input
                type="url"
                placeholder="https://example.com/image.jpg"
                value={coverImage}
                onChange={(e) => setCoverImage(e.target.value)}
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={coverLoading}
                onClick={fetchRandomCover}
                className="shrink-0"
              >
                {coverLoading ? "Loading..." : "Shuffle"}
              </Button>
            </div>
            {coverImage && (
              <div className="mt-2 overflow-hidden rounded-lg border border-border">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={coverImage}
                  alt="Cover preview"
                  className="h-40 w-full object-cover"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                />
              </div>
            )}
          </div>

          {/* Type / Status / Category */}
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <label className="text-sm font-medium">Type</label>
              <Select value={type} onValueChange={(v) => v && setType(v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="NOTE">Note</SelectItem>
                  <SelectItem value="INTERVIEW">Interview</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select value={status} onValueChange={(v) => v && setStatus(v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="DRAFT">Draft</SelectItem>
                  <SelectItem value="PUBLISHED">Published</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Category</label>
              <Select value={categoryId} onValueChange={(v) => v && setCategoryId(v)}>
                <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.parentId ? `└ ${cat.name}` : cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Difficulty Tags */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Difficulty</label>
            <div className="flex flex-wrap gap-2">
              {difficultyTags.map((tag) => (
                <Button
                  key={tag.id}
                  type="button"
                  variant={selectedTagIds.includes(tag.id) ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleTag(tag.id)}
                >
                  {tag.name}
                </Button>
              ))}
            </div>
          </div>

          {/* Topic Tags */}
          {topicTags.length > 0 && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Topics</label>
              <div className="flex flex-wrap gap-2">
                {topicTags.map((tag) => (
                  <Button
                    key={tag.id}
                    type="button"
                    variant={selectedTagIds.includes(tag.id) ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleTag(tag.id)}
                  >
                    {tag.name}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Content */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Content (Markdown)</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              rows={20}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-y"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : article ? "Update" : "Create"}
            </Button>
            <a href="/admin/articles" className={cn(buttonVariants({ variant: "outline" }))}>
              Cancel
            </a>
            {article && (
              <div className="ml-auto">
                <AlertDialog>
                  <AlertDialogTrigger render={<Button type="button" variant="destructive" />}>
                    Delete
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete this article?</AlertDialogTitle>
                      <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
