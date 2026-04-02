"use client";

import { useEffect, useState } from "react";

interface AdminComment {
  id: string;
  content: string;
  createdAt: string;
  user: { nickname: string };
  article: { title: string };
}

export default function AdminCommentsPage() {
  const [comments, setComments] = useState<AdminComment[]>([]);

  async function loadComments() {
    const res = await fetch("/api/comments?all=true");
    setComments(await res.json());
  }

  useEffect(() => { loadComments(); }, []);

  async function handleDelete(id: string) {
    if (!confirm("确定删除？")) return;
    await fetch(`/api/comments/${id}`, { method: "DELETE" });
    setComments(comments.filter((c) => c.id !== id));
  }

  return (
    <div>
      <h1 className="text-xl font-bold mb-6">评论管理</h1>

      <div className="space-y-3">
        {comments.map((comment) => (
          <div key={comment.id} className="p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm">
                <span className="text-blue-600">@{comment.user.nickname}</span>
                <span className="text-gray-500 mx-2">评论了</span>
                <span className="font-medium">{comment.article.title}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-500">{new Date(comment.createdAt).toLocaleDateString("zh-CN")}</span>
                <button onClick={() => handleDelete(comment.id)} className="text-xs text-red-600 hover:underline">删除</button>
              </div>
            </div>
            <p className="text-sm text-gray-400">{comment.content}</p>
          </div>
        ))}
      </div>

      {comments.length === 0 && (
        <p className="text-gray-500 text-center py-8">暂无评论</p>
      )}
    </div>
  );
}
