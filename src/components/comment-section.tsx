"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { CommentWithUser } from "@/types";

export function CommentSection({ articleId }: { articleId: string }) {
  const { data: session } = useSession();
  const [comments, setComments] = useState<CommentWithUser[]>([]);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    void fetch(`/api/comments?articleId=${articleId}`)
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
    <div>
      <h3 className="mb-4 text-lg font-semibold">Comments ({comments.length})</h3>

      {comments.length > 0 ? (
        <div className="space-y-3 mb-6">
          {comments.map((c) => (
            <Card key={c.id}>
              <CardContent className="p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">@{c.user.nickname}</span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(c.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">{c.content}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <p className="mb-6 text-sm text-muted-foreground">No comments yet</p>
      )}

      <Separator className="my-4" />

      {session ? (
        <form onSubmit={handleSubmit} className="space-y-3">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Leave a comment or correction..."
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring min-h-[80px] resize-none"
          />
          <Button type="submit" size="sm" disabled={loading || !content.trim()}>
            {loading ? "Posting..." : "Post Comment"}
          </Button>
        </form>
      ) : (
        <p className="text-sm text-muted-foreground">Sign in to leave a comment</p>
      )}
    </div>
  );
}
