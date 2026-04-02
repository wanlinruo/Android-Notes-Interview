"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
      setError("采集失败，请检查 URL 是否正确");
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
      setError("请选择分类");
      return;
    }

    setLoading(true);
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
      setError("保存失败");
    }
  }

  function toggleTag(tagId: string) {
    setSelectedTagIds((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
    );
  }

  return (
    <div>
      {/* URL Input */}
      <form onSubmit={handlePreview} className="flex gap-3 mb-6">
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="输入文章 URL..."
          required
          className="flex-1 px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "采集中..." : "采集预览"}
        </button>
      </form>

      {error && (
        <div className="mb-4 p-3 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 rounded">
          {error}
        </div>
      )}

      {/* Preview */}
      {preview && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">标题</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">类型</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full px-3 py-1.5 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md"
              >
                <option value="NOTE">知识笔记</option>
                <option value="INTERVIEW">面试题</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                分类
                {preview.suggestedCategory && (
                  <span className="text-xs text-green-600 ml-2">
                    (推荐: {preview.suggestedCategory.name})
                  </span>
                )}
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-3 py-1.5 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md"
              >
                <option value="">选择分类</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              标签
              {preview.suggestedTags.length > 0 && (
                <span className="text-xs text-green-600 ml-2">
                  (已自动选中推荐标签)
                </span>
              )}
            </label>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => toggleTag(tag.id)}
                  className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                    selectedTagIds.includes(tag.id)
                      ? "bg-blue-600 text-white border-blue-600"
                      : "border-gray-300 dark:border-gray-600"
                  }`}
                >
                  {tag.name}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              内容预览（Markdown）
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={15}
              className="w-full px-3 py-2 text-sm font-mono bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md resize-y"
            />
          </div>

          <button
            onClick={handleSave}
            disabled={loading}
            className="px-6 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? "保存中..." : "保存为草稿"}
          </button>
        </div>
      )}
    </div>
  );
}
