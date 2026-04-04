"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { Tag } from "@/generated/prisma/client";

export default function AdminTagsPage() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [type, setType] = useState<"DIFFICULTY" | "TOPIC">("TOPIC");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  async function loadTags() {
    const res = await fetch("/api/tags");
    setTags(await res.json());
  }

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { void loadTags(); }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const body = { name, slug, type, ...(editingId ? { id: editingId } : {}) };
    await fetch("/api/tags", {
      method: editingId ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setName(""); setSlug(""); setType("TOPIC"); setEditingId(null);
    setDialogOpen(false);
    loadTags();
  }

  function startEdit(tag: Tag) {
    setName(tag.name); setSlug(tag.slug); setType(tag.type as "DIFFICULTY" | "TOPIC");
    setEditingId(tag.id); setDialogOpen(true);
  }

  async function handleDelete(id: string) {
    await fetch("/api/tags", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    loadTags();
  }

  const difficultyCount = tags.filter((t) => t.type === "DIFFICULTY").length;
  const topicCount = tags.filter((t) => t.type === "TOPIC").length;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Tags</h1>
          <p className="mt-1 text-sm text-muted-foreground">{tags.length} tags total</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) { setEditingId(null); setName(""); setSlug(""); setType("TOPIC"); } }}>
          <DialogTrigger render={<Button />}>Add Tag</DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingId ? "Edit Tag" : "New Tag"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Name</label>
                <Input value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Slug</label>
                <Input value={slug} onChange={(e) => setSlug(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Type</label>
                <Select value={type} onValueChange={(v) => setType(v as "DIFFICULTY" | "TOPIC")}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DIFFICULTY">Difficulty</SelectItem>
                    <SelectItem value="TOPIC">Topic</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full">{editingId ? "Update" : "Create"}</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats cards */}
      <div className="mb-6 grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm font-medium text-muted-foreground">Difficulty Tags</p>
            <p className="mt-1 text-2xl font-bold text-emerald-600 dark:text-emerald-400">{difficultyCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm font-medium text-muted-foreground">Topic Tags</p>
            <p className="mt-1 text-2xl font-bold text-blue-600 dark:text-blue-400">{topicCount}</p>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead className="border-b border-border">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Name</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden sm:table-cell">Slug</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Type</th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {tags.map((tag) => (
                <tr key={tag.id} className="border-b border-border last:border-0 transition-colors hover:bg-accent/50">
                  <td className="px-4 py-3 font-medium">{tag.name}</td>
                  <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">{tag.slug}</td>
                  <td className="px-4 py-3">
                    <Badge variant={tag.type === "DIFFICULTY" ? "default" : "outline"}>
                      {tag.type === "DIFFICULTY" ? "Difficulty" : "Topic"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="sm" onClick={() => startEdit(tag)}>Edit</Button>
                      <AlertDialog>
                        <AlertDialogTrigger render={<Button variant="ghost" size="sm" className="text-destructive" />}>Delete</AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete &quot;{tag.name}&quot;?</AlertDialogTitle>
                            <AlertDialogDescription>This tag will be removed from all articles that use it.</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(tag.id)}>Delete</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </td>
                </tr>
              ))}
              {tags.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-12 text-center text-muted-foreground">
                    No tags yet. Click &quot;Add Tag&quot; to create one.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
