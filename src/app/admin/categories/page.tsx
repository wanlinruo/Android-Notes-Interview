"use client";

import { useEffect, useState } from "react";
import { Category } from "@/generated/prisma/client";
import { EmojiPicker } from "@/components/admin/emoji-picker";

type CategoryWithChildren = Category & { children: Category[] };

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<CategoryWithChildren[]>([]);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [icon, setIcon] = useState("");
  const [parentId, setParentId] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  async function loadCategories() {
    const res = await fetch("/api/categories");
    setCategories(await res.json());
  }

  useEffect(() => { loadCategories(); }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const body = { name, slug, icon, parentId: parentId || null, ...(editingId ? { id: editingId } : {}) };
    await fetch("/api/categories", {
      method: editingId ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setName(""); setSlug(""); setIcon(""); setParentId(""); setEditingId(null);
    loadCategories();
  }

  async function handleDelete(id: string) {
    if (!confirm("确定删除？")) return;
    await fetch("/api/categories", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    loadCategories();
  }

  function startEdit(cat: Category) {
    setEditingId(cat.id);
    setName(cat.name);
    setSlug(cat.slug);
    setIcon(cat.icon || "");
    setParentId(cat.parentId || "");
  }

  return (
    <div>
      <h1 className="text-xl font-bold mb-6">分类管理</h1>

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
          <label className="block text-xs mb-1">图标</label>
          <EmojiPicker value={icon} onChange={setIcon} />
        </div>
        <div>
          <label className="block text-xs mb-1">父分类</label>
          <select value={parentId} onChange={(e) => setParentId(e.target.value)} className="px-3 py-1.5 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md">
            <option value="">无（一级分类）</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>
        <button type="submit" className="px-4 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700">
          {editingId ? "更新" : "添加"}
        </button>
      </form>

      <div className="space-y-2">
        {categories.map((cat) => (
          <div key={cat.id}>
            <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg">
              <span>{cat.icon} {cat.name} <span className="text-xs text-gray-500">({cat.slug})</span></span>
              <div className="flex gap-2">
                <button onClick={() => startEdit(cat)} className="text-xs text-blue-600 hover:underline">编辑</button>
                <button onClick={() => handleDelete(cat.id)} className="text-xs text-red-600 hover:underline">删除</button>
              </div>
            </div>
            {cat.children.length > 0 && (
              <div className="ml-8 mt-1 space-y-1">
                {cat.children.map((child) => (
                  <div key={child.id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded">
                    <span className="text-sm">└ {child.name} <span className="text-xs text-gray-500">({child.slug})</span></span>
                    <div className="flex gap-2">
                      <button onClick={() => startEdit(child)} className="text-xs text-blue-600 hover:underline">编辑</button>
                      <button onClick={() => handleDelete(child.id)} className="text-xs text-red-600 hover:underline">删除</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
