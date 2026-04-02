"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { CommentWithUser } from "@/types";

export function CommentSection({ articleId }: { articleId: string }) {
  const { data: session } = useSession();
  const [comments, setComments] = useState<CommentWithUser[]>([]);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch(`/api/comments?articleId=${articleId}`)
      .then((r) => r.json())
      .then(setComments);
  }, [articleId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;

    setLoading(true);
    const res = await fetch("/api/comments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ articleId, content }),
    });

    if (res.ok) {
      const comment = await res.json();
      setComments([comment, ...comments]);
      setContent("");
    }
    setLoading(false);
  }

  return (
    <div className="border-t border-gray-800 mt-8 pt-6">
      <h3 className="text-sm font-semibold mb-4">
        评论纠错 ({comments.length})
      </h3>

      {session && (
        <form onSubmit={handleSubmit} className="mb-4">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="写下你的评论或纠错..."
            rows={3}
            className="w-full px-3 py-2 text-sm text-gray-100 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
          />
          <button
            type="submit"
            disabled={loading || !content.trim()}
            className="mt-2 px-4 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "提交中..." : "提交"}
          </button>
        </form>
      )}

      <div className="space-y-3">
        {comments.map((comment) => (
          <div
            key={comment.id}
            className="bg-gray-900 border border-gray-800 rounded-md p-3"
          >
            <div className="text-xs text-blue-400 mb-1">
              @{comment.user.nickname} ·{" "}
              {new Date(comment.createdAt).toLocaleDateString("zh-CN")}
            </div>
            <p className="text-sm text-gray-300">{comment.content}</p>
          </div>
        ))}
      </div>

      {!session && (
        <p className="text-sm text-gray-500 text-center py-4">
          <a href="/login" className="text-blue-500 hover:underline">
            登录
          </a>{" "}
          后参与评论
        </p>
      )}
    </div>
  );
}
