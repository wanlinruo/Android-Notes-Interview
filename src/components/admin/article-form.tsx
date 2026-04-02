"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Category, Tag, Article } from "@/generated/prisma/client";

interface Props {
  article?: Article & { tags: { tagId: string }[] };
  categories: Category[];
  tags: Tag[];
}

export function ArticleForm({ article, categories, tags }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState(article?.title || "");
  const [content, setContent] = useState(article?.content || "");
  const [summary, setSummary] = useState(article?.summary || "");
  const [type, setType] = useState(article?.type || "NOTE");
  const [status, setStatus] = useState(article?.status || "DRAFT");
  const [categoryId, setCategoryId] = useState(article?.categoryId || "");
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>(
    article?.tags.map((t) => t.tagId) || []
  );

  function toggleTag(tagId: string) {
    setSelectedTagIds((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const body = { title, content, summary, type, status, categoryId, tagIds: selectedTagIds };

    const url = article ? `/api/articles/${article.id}` : "/api/articles";
    const method = article ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    setLoading(false);

    if (res.ok) {
      router.push("/admin/articles");
      router.refresh();
    }
  }

  async function handleDelete() {
    if (!article || !confirm("确定删除这篇文章？")) return;

    await fetch(`/api/articles/${article.id}`, { method: "DELETE" });
    router.push("/admin/articles");
    router.refresh();
  }

  const difficultyTags = tags.filter((t) => t.type === "DIFFICULTY");
  const topicTags = tags.filter((t) => t.type === "TOPIC");

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium mb-1">标题</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">摘要</label>
        <input
          type="text"
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">类型</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as "NOTE" | "INTERVIEW")}
            className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md"
          >
            <option value="NOTE">知识笔记</option>
            <option value="INTERVIEW">面试题</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">状态</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as "DRAFT" | "PUBLISHED")}
            className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md"
          >
            <option value="DRAFT">草稿</option>
            <option value="PUBLISHED">发布</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">分类</label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            required
            className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md"
          >
            <option value="">选择分类</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.parentId ? "  └ " : ""}{cat.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">难度标签</label>
        <div className="flex gap-2">
          {difficultyTags.map((tag) => (
            <button
              key={tag.id}
              type="button"
              onClick={() => toggleTag(tag.id)}
              className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                selectedTagIds.includes(tag.id)
                  ? "bg-green-600 text-white border-green-600"
                  : "border-gray-300 dark:border-gray-600"
              }`}
            >
              {tag.name}
            </button>
          ))}
        </div>
      </div>

      {topicTags.length > 0 && (
        <div>
          <label className="block text-sm font-medium mb-2">主题标签</label>
          <div className="flex flex-wrap gap-2">
            {topicTags.map((tag) => (
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
      )}

      <div>
        <label className="block text-sm font-medium mb-1">
          内容（Markdown）
        </label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
          rows={20}
          className="w-full px-3 py-2 text-sm font-mono bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 resize-y"
        />
      </div>

      <div className="flex items-center justify-between">
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "保存中..." : "保存"}
          </button>
        </div>
        {article && (
          <button
            type="button"
            onClick={handleDelete}
            className="px-4 py-2 text-sm text-red-600 hover:text-red-700"
          >
            删除文章
          </button>
        )}
      </div>
    </form>
  );
}
