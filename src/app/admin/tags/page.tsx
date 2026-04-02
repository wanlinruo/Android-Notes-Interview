"use client";

import { useEffect, useState } from "react";
import { Tag } from "@/generated/prisma/client";

export default function AdminTagsPage() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [type, setType] = useState<"DIFFICULTY" | "TOPIC">("TOPIC");

  async function loadTags() {
    const res = await fetch("/api/tags");
    setTags(await res.json());
  }

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { void loadTags(); }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/tags", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, slug, type }),
    });
    setName(""); setSlug("");
    loadTags();
  }

  async function handleDelete(id: string) {
    if (!confirm("确定删除？")) return;
    await fetch("/api/tags", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    loadTags();
  }

  const difficultyTags = tags.filter((t) => t.type === "DIFFICULTY");
  const topicTags = tags.filter((t) => t.type === "TOPIC");

  return (
    <div>
      <h1 className="text-xl font-bold mb-6">标签管理</h1>

      <form onSubmit={handleSubmit} className="flex gap-3 mb-6 items-end">
        <div>
          <label className="block text-xs mb-1">名称</label>
          <input value={name} onChange={(e) => setName(e.target.value)} required className="px-3 py-1.5 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md" />
        </div>
        <div>
          <label className="block text-xs mb-1">Slug</label>
          <input value={slug} onChange={(e) => setSlug(e.target.value)} required className="px-3 py-1.5 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md" />
        </div>
        <div>
          <label className="block text-xs mb-1">类型</label>
          <select value={type} onChange={(e) => setType(e.target.value as "DIFFICULTY" | "TOPIC")} className="px-3 py-1.5 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md">
            <option value="DIFFICULTY">难度标签</option>
            <option value="TOPIC">主题标签</option>
          </select>
        </div>
        <button type="submit" className="px-4 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700">添加</button>
      </form>

      <div className="space-y-6">
        <div>
          <h2 className="text-sm font-semibold text-gray-500 mb-2">难度标签</h2>
          <div className="flex flex-wrap gap-2">
            {difficultyTags.map((tag) => (
              <span key={tag.id} className="inline-flex items-center gap-1 text-sm px-3 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-full">
                {tag.name}
                <button onClick={() => handleDelete(tag.id)} className="text-red-500 hover:text-red-700 ml-1">&times;</button>
              </span>
            ))}
          </div>
        </div>
        <div>
          <h2 className="text-sm font-semibold text-gray-500 mb-2">主题标签</h2>
          <div className="flex flex-wrap gap-2">
            {topicTags.map((tag) => (
              <span key={tag.id} className="inline-flex items-center gap-1 text-sm px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full">
                {tag.name}
                <button onClick={() => handleDelete(tag.id)} className="text-red-500 hover:text-red-700 ml-1">&times;</button>
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
