"use client";

import { useEffect, useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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

interface AdminComment {
  id: string;
  content: string;
  createdAt: string;
  user: { nickname: string };
  article: { title: string };
}

interface ArticleGroup {
  title: string;
  comments: AdminComment[];
}

export default function AdminCommentsPage() {
  const [comments, setComments] = useState<AdminComment[]>([]);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  async function loadComments() {
    const res = await fetch("/api/comments?all=true");
    setComments(await res.json());
  }

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { void loadComments(); }, []);

  async function handleDelete(id: string) {
    await fetch(`/api/comments/${id}`, { method: "DELETE" });
    setComments((prev) => prev.filter((c) => c.id !== id));
  }

  function toggleExpand(id: string) {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const todayCount = useMemo(() => {
    const today = new Date().toDateString();
    return comments.filter((c) => new Date(c.createdAt).toDateString() === today).length;
  }, [comments]);

  const activeArticles = useMemo(() => {
    return new Set(comments.map((c) => c.article.title)).size;
  }, [comments]);

  const groups = useMemo(() => {
    const map = new Map<string, AdminComment[]>();
    for (const c of comments) {
      const list = map.get(c.article.title) || [];
      list.push(c);
      map.set(c.article.title, list);
    }
    // Sort groups by most recent comment first
    return Array.from(map.entries())
      .map(([title, items]): ArticleGroup => ({ title, comments: items }))
      .sort((a, b) => {
        const aMax = Math.max(...a.comments.map((c) => new Date(c.createdAt).getTime()));
        const bMax = Math.max(...b.comments.map((c) => new Date(c.createdAt).getTime()));
        return bMax - aMax;
      });
  }, [comments]);

  const avatarColors = ["bg-indigo-500", "bg-violet-500", "bg-emerald-500", "bg-amber-500", "bg-blue-500", "bg-rose-500", "bg-teal-500"];

  function getAvatarColor(name: string) {
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return avatarColors[Math.abs(hash) % avatarColors.length];
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold">Comments</h1>
        <p className="mt-1 text-sm text-muted-foreground">{comments.length} comments total</p>
      </div>

      {/* Stats cards */}
      <div className="mb-6 grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm font-medium text-muted-foreground">Total Comments</p>
            <p className="mt-1 text-2xl font-bold text-violet-600 dark:text-violet-400">{comments.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm font-medium text-muted-foreground">Today</p>
            <p className="mt-1 text-2xl font-bold text-emerald-600 dark:text-emerald-400">{todayCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm font-medium text-muted-foreground">Active Articles</p>
            <p className="mt-1 text-2xl font-bold text-blue-600 dark:text-blue-400">{activeArticles}</p>
          </CardContent>
        </Card>
      </div>

      {/* Grouped list */}
      <Card>
        <CardContent className="p-0">
          <div className="divide-y divide-border">
            {groups.map((group) => (
              <div key={group.title}>
                {/* Article group header */}
                <div className="flex items-center justify-between bg-muted/30 px-4 py-3">
                  <span className="text-sm font-semibold">{group.title}</span>
                  <Badge variant="default" className="text-[10px]">{group.comments.length}</Badge>
                </div>
                {/* Comment rows */}
                {group.comments.map((c) => {
                  const isLong = c.content.length > 100;
                  const isExpanded = expandedIds.has(c.id);
                  return (
                    <div key={c.id} className={`border-t border-border/50 ${isExpanded ? "bg-muted/20" : ""}`}>
                      <div className="flex items-center justify-between px-4 py-2.5 transition-colors hover:bg-accent/50">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold text-white ${getAvatarColor(c.user.nickname)}`}>
                            {c.user.nickname.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium">{c.user.nickname}</span>
                              <span className="text-[11px] text-muted-foreground">{new Date(c.createdAt).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })}</span>
                            </div>
                            {!isExpanded && (
                              <p className="mt-0.5 text-sm text-muted-foreground truncate">
                                {c.content}
                              </p>
                            )}
                            {isExpanded && (
                              <button onClick={() => toggleExpand(c.id)} className="mt-0.5 text-xs text-primary cursor-pointer">
                                ▲ Collapse
                              </button>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0 ml-3">
                          {isLong && !isExpanded && (
                            <button onClick={() => toggleExpand(c.id)} className="text-xs text-muted-foreground hover:text-primary transition-colors">
                              ▼
                            </button>
                          )}
                          <AlertDialog>
                            <AlertDialogTrigger render={<Button variant="ghost" size="sm" className="h-7 text-xs text-muted-foreground hover:text-destructive" />}>Delete</AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete this comment?</AlertDialogTitle>
                                <AlertDialogDescription>Comment by {c.user.nickname} will be permanently removed.</AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(c.id)}>Delete</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                      {isExpanded && (
                        <div className="px-4 pb-3 pl-14">
                          <div className="rounded-lg border border-border/50 bg-muted/30 px-3.5 py-3 text-sm text-foreground/80 leading-relaxed">
                            {c.content}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}

            {comments.length === 0 && (
              <div className="px-4 py-12 text-center text-muted-foreground">
                No comments yet.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
