"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Category, Tag } from "@/generated/prisma/client";

interface Props {
  categories: Category[];
  tags: Tag[];
}

interface PreviewData {
  title: string;
  content: string;
  suggestedCategory: Category | null;
  suggestedTags: Tag[];
  suggestedCategoryId: string | null;
  suggestedTagIds: string[];
}

export function ImportForm({ categories, tags }: Props) {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<PreviewData | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [type, setType] = useState("NOTE");
  const [categoryId, setCategoryId] = useState("");
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [error, setError] = useState("");
  const router = useRouter();

  async function handlePreview(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setPreview(null);

    const res = await fetch("/api/import", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url, action: "preview" }),
    });

    setLoading(false);

    if (!res.ok) {
      setError("Import failed. Please check that the URL is correct and accessible.");
      return;
    }

    const data = await res.json();
    setPreview(data);
    setTitle(data.title);
    setContent(data.content);
    setCategoryId(data.suggestedCategoryId || "");
    setSelectedTagIds(data.suggestedTagIds || []);
  }

  async function handleSave() {
    if (!categoryId) {
      setError("Please select a category.");
      return;
    }

    setLoading(true);
    setError("");
    const res = await fetch("/api/import", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        url,
        action: "save",
        title,
        content,
        type,
        categoryId,
        tagIds: selectedTagIds,
      }),
    });

    setLoading(false);

    if (res.ok) {
      router.push("/admin/articles?status=DRAFT");
      router.refresh();
    } else {
      setError("Save failed. Please try again.");
    }
  }

  function toggleTag(tagId: string) {
    setSelectedTagIds((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
    );
  }

  return (
    <div className="space-y-6">
      {/* URL Input */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Extract from URL</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePreview} className="flex gap-3">
            <Input
              type="url"
              placeholder="https://example.com/article"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              required
              className="flex-1"
            />
            <Button type="submit" disabled={loading}>
              {loading && !preview ? "Extracting..." : "Preview"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Error */}
      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Preview & Edit */}
      {preview && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Preview & Edit</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Title</label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Type</label>
                <Select value={type} onValueChange={setType}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NOTE">Note</SelectItem>
                    <SelectItem value="INTERVIEW">Interview</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Category
                  {preview.suggestedCategory && (
                    <Badge variant="secondary" className="ml-2 text-[10px] font-normal">
                      Suggested: {preview.suggestedCategory.name}
                    </Badge>
                  )}
                </label>
                <Select value={categoryId} onValueChange={setCategoryId}>
                  <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                Tags
                {preview.suggestedTags.length > 0 && (
                  <Badge variant="secondary" className="ml-2 text-[10px] font-normal">
                    Auto-selected
                  </Badge>
                )}
              </label>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
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

            <div className="space-y-2">
              <label className="text-sm font-medium">Content (Markdown)</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={15}
                className="w-full rounded-lg border border-input bg-muted/50 px-3 py-2 text-sm font-mono leading-relaxed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-y"
              />
            </div>

            <Button onClick={handleSave} disabled={loading}>
              {loading ? "Saving..." : "Save as Draft"}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
