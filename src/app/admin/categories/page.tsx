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
import { EmojiPicker } from "@/components/admin/emoji-picker";
import { Category } from "@/generated/prisma/client";

type CategoryWithChildren = Category & { children: Category[] };

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<CategoryWithChildren[]>([]);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [icon, setIcon] = useState("");
  const [parentId, setParentId] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  async function loadCategories() {
    const res = await fetch("/api/categories");
    setCategories(await res.json());
  }

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { void loadCategories(); }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const body = { name, slug, icon, parentId: parentId || null, ...(editingId ? { id: editingId } : {}) };
    await fetch("/api/categories", {
      method: editingId ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setName(""); setSlug(""); setIcon(""); setParentId(""); setEditingId(null);
    setDialogOpen(false);
    loadCategories();
  }

  function startEdit(cat: Category) {
    setName(cat.name); setSlug(cat.slug); setIcon(cat.icon || ""); setParentId(cat.parentId || "");
    setEditingId(cat.id); setDialogOpen(true);
  }

  async function handleDelete(id: string) {
    await fetch("/api/categories", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    loadCategories();
  }

  const totalChildren = categories.reduce((sum, cat) => sum + cat.children.length, 0);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Categories</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {categories.length} top-level, {totalChildren} sub-categories
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) { setEditingId(null); setName(""); setSlug(""); setIcon(""); setParentId(""); } }}>
          <DialogTrigger render={<Button />}>Add Category</DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingId ? "Edit Category" : "New Category"}</DialogTitle>
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
                <label className="text-sm font-medium">Icon</label>
                <div className="flex items-center gap-2">
                  <Input value={icon} onChange={(e) => setIcon(e.target.value)} className="flex-1" />
                  <EmojiPicker value={icon} onChange={setIcon} />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Parent Category</label>
                <Select value={parentId || "none"} onValueChange={(v) => setParentId(v === "none" ? "" : v)}>
                  <SelectTrigger><SelectValue placeholder="None (top level)" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None (top level)</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>{cat.icon} {cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full">{editingId ? "Update" : "Create"}</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="divide-y divide-border">
            {categories.map((cat) => (
              <div key={cat.id}>
                {/* Parent row */}
                <div className="flex items-center justify-between px-4 py-3 transition-colors hover:bg-accent/50">
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted text-lg">
                      {cat.icon || "📁"}
                    </span>
                    <div>
                      <p className="text-sm font-medium">{cat.name}</p>
                      <p className="text-xs text-muted-foreground">{cat.slug}</p>
                    </div>
                    {cat.children.length > 0 && (
                      <Badge variant="secondary" className="text-[11px]">{cat.children.length} sub</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="sm" onClick={() => startEdit(cat)}>Edit</Button>
                    <AlertDialog>
                      <AlertDialogTrigger render={<Button variant="ghost" size="sm" className="text-destructive" />}>Delete</AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete &quot;{cat.name}&quot;?</AlertDialogTitle>
                          <AlertDialogDescription>
                            {cat.children.length > 0
                              ? `This category has ${cat.children.length} sub-categories that will also be affected.`
                              : "This action cannot be undone."}
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(cat.id)}>Delete</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
                {/* Children rows */}
                {cat.children.map((child) => (
                  <div key={child.id} className="flex items-center justify-between border-t border-border/50 bg-muted/30 px-4 py-2.5 pl-16 transition-colors hover:bg-muted/60">
                    <div className="flex items-center gap-2.5">
                      <span className="text-sm">{child.icon || "📄"}</span>
                      <span className="text-sm">{child.name}</span>
                      <span className="text-xs text-muted-foreground">{child.slug}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => startEdit(child)}>Edit</Button>
                      <AlertDialog>
                        <AlertDialogTrigger render={<Button variant="ghost" size="sm" className="h-7 text-xs text-destructive" />}>Delete</AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete &quot;{child.name}&quot;?</AlertDialogTitle>
                            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(child.id)}>Delete</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                ))}
              </div>
            ))}

            {categories.length === 0 && (
              <div className="px-4 py-12 text-center text-muted-foreground">
                No categories yet. Click &quot;Add Category&quot; to create one.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
