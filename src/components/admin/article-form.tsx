"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect, useCallback, useRef } from "react";
import { Category, Tag, Article } from "@/generated/prisma/client";
import { MarkdownRenderer } from "@/components/markdown-renderer";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
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

interface Props {
  article?: Article & { tags: { tagId: string }[] };
  categories: Category[];
  tags: Tag[];
}

export function ArticleForm({ article, categories, tags }: Props) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState(article?.title || "");
  const [content, setContent] = useState(article?.content || "");
  const [summary, setSummary] = useState(article?.summary || "");
  const [type, setType] = useState(article?.type || "NOTE");
  const [status, setStatus] = useState(article?.status || "DRAFT");
  const [categoryId, setCategoryId] = useState(article?.categoryId || "");
  const [coverImage, setCoverImage] = useState(article?.coverImage || "");
  const [contentTab, setContentTab] = useState<"edit" | "preview">("edit");
  const [showMdHelp, setShowMdHelp] = useState(false);
  const [coverLoading, setCoverLoading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Insert markdown syntax around selection or at cursor
  function insertMarkdown(prefix: string, suffix: string = "", placeholder: string = "") {
    const ta = textareaRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const selected = content.substring(start, end);
    const insert = selected || placeholder;
    const newContent = content.substring(0, start) + prefix + insert + suffix + content.substring(end);
    setContent(newContent);
    // Restore cursor position after render
    requestAnimationFrame(() => {
      ta.focus();
      const cursorPos = selected
        ? start + prefix.length + selected.length + suffix.length
        : start + prefix.length;
      ta.setSelectionRange(cursorPos, cursorPos + (selected ? 0 : placeholder.length));
    });
  }

  function insertLine(prefix: string, placeholder: string = "") {
    const ta = textareaRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    // Find the beginning of the current line
    const before = content.substring(0, start);
    const needsNewline = before.length > 0 && !before.endsWith("\n");
    const insert = (needsNewline ? "\n" : "") + prefix + placeholder;
    const newContent = content.substring(0, start) + insert + content.substring(start);
    setContent(newContent);
    requestAnimationFrame(() => {
      ta.focus();
      const cursorPos = start + insert.length - placeholder.length;
      ta.setSelectionRange(cursorPos, cursorPos + placeholder.length);
    });
  }

  function formatMarkdown() {
    let text = content;
    // Remove trailing whitespace from each line
    text = text.replace(/[ \t]+$/gm, "");
    // Collapse 3+ consecutive blank lines into 2 (one visual blank line)
    text = text.replace(/\n{3,}/g, "\n\n");
    // Remove blank lines at the start
    text = text.replace(/^\n+/, "");
    // Remove blank lines at the end, keep single trailing newline
    text = text.replace(/\n+$/, "\n");
    // Ensure a blank line before headings (unless at start of file)
    text = text.replace(/([^\n])\n(#{1,6} )/g, "$1\n\n$2");
    // Ensure a blank line before code blocks
    text = text.replace(/([^\n])\n(```)/g, "$1\n\n$2");
    // Ensure a blank line after code blocks
    text = text.replace(/(```)\n([^\n])/g, "$1\n\n$2");
    // Ensure a blank line before blockquotes
    text = text.replace(/([^\n>])\n(> )/g, "$1\n\n$2");
    // Ensure a blank line before lists (- or 1.) if previous line is not a list
    text = text.replace(/([^\n\-\d].*)\n([-*] |\d+\. )/g, "$1\n\n$2");
    setContent(text);
  }

  const [selectedTagIds, setSelectedTagIds] = useState<string[]>(
    article?.tags.map((t) => t.tagId) || []
  );

  const fetchRandomCover = useCallback(async () => {
    setCoverLoading(true);
    try {
      const res = await fetch("/api/unsplash");
      if (res.ok) {
        const data = await res.json();
        setCoverImage(data.url);
      }
    } finally {
      setCoverLoading(false);
    }
  }, []);

  // Auto-fetch cover image for new articles
  useEffect(() => {
    if (!article && !coverImage) {
      void fetchRandomCover();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function toggleTag(tagId: string) {
    setSelectedTagIds((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    const body = { title, content, summary, type, status, categoryId, tagIds: selectedTagIds, coverImage: coverImage || null };
    const url = article ? `/api/articles/${article.id}` : "/api/articles";
    const method = article ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    setSaving(false);

    if (res.ok) {
      router.push("/admin/articles");
      router.refresh();
    }
  }

  async function handleDelete() {
    await fetch(`/api/articles/${article!.id}`, { method: "DELETE" });
    router.push("/admin/articles");
    router.refresh();
  }

  const difficultyTags = tags.filter((t) => t.type === "DIFFICULTY");
  const topicTags = tags.filter((t) => t.type === "TOPIC");

  return (
    <Card>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Title</label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>

          {/* Summary */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Summary</label>
            <Input value={summary} onChange={(e) => setSummary(e.target.value)} />
          </div>

          {/* Cover Image */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Cover Image URL</label>
            <div className="flex gap-2">
              <Input
                type="url"
                placeholder="https://example.com/image.jpg"
                value={coverImage}
                onChange={(e) => setCoverImage(e.target.value)}
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={coverLoading}
                onClick={fetchRandomCover}
                className="shrink-0"
              >
                {coverLoading ? "Loading..." : "Shuffle"}
              </Button>
            </div>
            {coverImage && (
              <div className="mt-2 overflow-hidden rounded-lg border border-border">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={coverImage}
                  alt="Cover preview"
                  className="h-40 w-full object-cover"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                />
              </div>
            )}
          </div>

          {/* Type / Status / Category */}
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <label className="text-sm font-medium">Type</label>
              <Select value={type} onValueChange={(v) => v && setType(v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="NOTE">Note</SelectItem>
                  <SelectItem value="INTERVIEW">Interview</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select value={status} onValueChange={(v) => v && setStatus(v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="DRAFT">Draft</SelectItem>
                  <SelectItem value="PUBLISHED">Published</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Category</label>
              <Select value={categoryId} onValueChange={(v) => v && setCategoryId(v)}>
                <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.parentId ? `└ ${cat.name}` : cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Difficulty Tags */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Difficulty</label>
            <div className="flex flex-wrap gap-2">
              {difficultyTags.map((tag) => (
                <Button
                  key={tag.id}
                  type="button"
                  variant={selectedTagIds.includes(tag.id) ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleTag(tag.id)}
                >
                  {tag.name}
                </Button>
              ))}
            </div>
          </div>

          {/* Topic Tags */}
          {topicTags.length > 0 && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Topics</label>
              <div className="flex flex-wrap gap-2">
                {topicTags.map((tag) => (
                  <Button
                    key={tag.id}
                    type="button"
                    variant={selectedTagIds.includes(tag.id) ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleTag(tag.id)}
                  >
                    {tag.name}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Divider */}
          <div className="border-t border-border pt-2" />

          {/* Content */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Content (Markdown)</label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowMdHelp(!showMdHelp)}
                  className="inline-flex items-center justify-center w-5 h-5 rounded-full border border-muted-foreground/30 text-muted-foreground text-xs hover:bg-muted transition-colors"
                  title="Markdown syntax help"
                >
                  ?
                </button>
                {showMdHelp && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowMdHelp(false)} />
                    <div className="absolute left-0 top-8 z-50 w-[420px] max-h-[70vh] overflow-y-auto rounded-lg border border-border bg-popover p-5 shadow-lg text-sm">
                      <div className="flex items-center justify-between mb-4">
                        <span className="font-semibold text-foreground">Markdown Syntax Guide</span>
                        <button type="button" onClick={() => setShowMdHelp(false)} className="text-muted-foreground hover:text-foreground text-lg leading-none">&times;</button>
                      </div>

                      {/* Headings */}
                      <div className="mb-4">
                        <div className="text-xs font-semibold text-primary uppercase tracking-wider mb-2">Headings</div>
                        <div className="grid grid-cols-[1fr_1fr] gap-x-4 gap-y-1 text-xs font-mono text-muted-foreground">
                          <span># Heading 1</span><span className="text-foreground font-sans text-lg font-bold">Heading 1</span>
                          <span>## Heading 2</span><span className="text-foreground font-sans text-base font-bold">Heading 2</span>
                          <span>### Heading 3</span><span className="text-foreground font-sans text-sm font-bold">Heading 3</span>
                          <span>#### Heading 4</span><span className="text-foreground font-sans text-xs font-bold">Heading 4</span>
                        </div>
                      </div>

                      {/* Text Formatting */}
                      <div className="mb-4">
                        <div className="text-xs font-semibold text-primary uppercase tracking-wider mb-2">Text Formatting</div>
                        <div className="grid grid-cols-[1fr_1fr] gap-x-4 gap-y-1 text-xs font-mono text-muted-foreground">
                          <span>**bold text**</span><span className="text-foreground font-sans font-bold">bold text</span>
                          <span>*italic text*</span><span className="text-foreground font-sans italic">italic text</span>
                          <span>***bold & italic***</span><span className="text-foreground font-sans font-bold italic">bold & italic</span>
                          <span>~~strikethrough~~</span><span className="text-foreground font-sans line-through">strikethrough</span>
                          <span>&gt; blockquote</span><span className="text-foreground font-sans border-l-2 border-primary pl-2">blockquote</span>
                        </div>
                      </div>

                      {/* Links & Images */}
                      <div className="mb-4">
                        <div className="text-xs font-semibold text-primary uppercase tracking-wider mb-2">Links & Images</div>
                        <div className="grid grid-cols-[1fr_1fr] gap-x-4 gap-y-1 text-xs font-mono text-muted-foreground">
                          <span>[text](url)</span><span className="text-foreground font-sans text-primary underline">Link</span>
                          <span>[text](url &quot;title&quot;)</span><span className="text-foreground font-sans">Link with title</span>
                          <span>![alt](image-url)</span><span className="text-foreground font-sans">Image</span>
                        </div>
                      </div>

                      {/* Code */}
                      <div className="mb-4">
                        <div className="text-xs font-semibold text-primary uppercase tracking-wider mb-2">Code</div>
                        <div className="grid grid-cols-[1fr_1fr] gap-x-4 gap-y-1 text-xs font-mono text-muted-foreground">
                          <span>`inline code`</span><span className="text-foreground font-sans"><code className="bg-muted px-1 rounded">code</code></span>
                          <div className="col-span-2 mt-1 bg-muted rounded p-2 text-[11px]">
                            {"```javascript"}<br />
                            {"const x = 1;"}<br />
                            {"```"}
                          </div>
                        </div>
                      </div>

                      {/* Lists */}
                      <div className="mb-4">
                        <div className="text-xs font-semibold text-primary uppercase tracking-wider mb-2">Lists</div>
                        <div className="grid grid-cols-[1fr_1fr] gap-x-4 gap-y-1 text-xs font-mono text-muted-foreground">
                          <span>- item 1</span><span className="text-foreground font-sans">Unordered list</span>
                          <span>1. item 1</span><span className="text-foreground font-sans">Ordered list</span>
                          <span>- [x] done</span><span className="text-foreground font-sans">Task list (checked)</span>
                          <span>- [ ] todo</span><span className="text-foreground font-sans">Task list (unchecked)</span>
                        </div>
                      </div>

                      {/* Table */}
                      <div className="mb-4">
                        <div className="text-xs font-semibold text-primary uppercase tracking-wider mb-2">Table</div>
                        <div className="bg-muted rounded p-2 text-[11px] font-mono text-muted-foreground">
                          | Column A | Column B |<br />
                          | -------- | -------- |<br />
                          | Cell 1 &nbsp;&nbsp;| Cell 2 &nbsp;&nbsp;|<br />
                          | Cell 3 &nbsp;&nbsp;| Cell 4 &nbsp;&nbsp;|
                        </div>
                      </div>

                      {/* Others */}
                      <div>
                        <div className="text-xs font-semibold text-primary uppercase tracking-wider mb-2">Others</div>
                        <div className="grid grid-cols-[1fr_1fr] gap-x-4 gap-y-1 text-xs font-mono text-muted-foreground">
                          <span>---</span><span className="text-foreground font-sans">Horizontal rule</span>
                          <span>footnote[^1]</span><span className="text-foreground font-sans">Footnote reference</span>
                          <span>[^1]: text</span><span className="text-foreground font-sans">Footnote definition</span>
                          <span>\*escaped\*</span><span className="text-foreground font-sans">Escape special chars</span>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
            <div className="rounded-md border border-input overflow-hidden">
              {/* Tab bar */}
              <div className="flex border-b border-input bg-muted/30">
                <button
                  type="button"
                  onClick={() => setContentTab("edit")}
                  className={`px-4 py-1.5 text-sm font-medium transition-colors ${
                    contentTab === "edit"
                      ? "text-foreground bg-background border-b-2 border-primary -mb-px"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => setContentTab("preview")}
                  className={`px-4 py-1.5 text-sm font-medium transition-colors ${
                    contentTab === "preview"
                      ? "text-foreground bg-background border-b-2 border-primary -mb-px"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Preview
                </button>
              </div>

              {/* Content area */}
              {contentTab === "edit" ? (
                <div>
                  {/* Formatting toolbar */}
                  <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 border-b border-input bg-muted/20">
                    <button type="button" onClick={() => insertMarkdown("**", "**", "bold")} className="px-2 py-1 text-xs font-bold rounded hover:bg-muted transition-colors" title="Bold (Ctrl+B)">B</button>
                    <button type="button" onClick={() => insertMarkdown("*", "*", "italic")} className="px-2 py-1 text-xs italic rounded hover:bg-muted transition-colors" title="Italic (Ctrl+I)">I</button>
                    <button type="button" onClick={() => insertMarkdown("~~", "~~", "text")} className="px-2 py-1 text-xs line-through rounded hover:bg-muted transition-colors" title="Strikethrough">S</button>
                    <div className="w-px h-4 bg-border mx-1" />
                    <button type="button" onClick={() => insertLine("# ", "Heading")} className="px-2 py-1 text-xs rounded hover:bg-muted transition-colors" title="Heading 1">H1</button>
                    <button type="button" onClick={() => insertLine("## ", "Heading")} className="px-2 py-1 text-xs rounded hover:bg-muted transition-colors" title="Heading 2">H2</button>
                    <button type="button" onClick={() => insertLine("### ", "Heading")} className="px-2 py-1 text-xs rounded hover:bg-muted transition-colors" title="Heading 3">H3</button>
                    <div className="w-px h-4 bg-border mx-1" />
                    <button type="button" onClick={() => insertMarkdown("[", "](url)", "text")} className="px-2 py-1 text-xs rounded hover:bg-muted transition-colors" title="Link">🔗</button>
                    <button type="button" onClick={() => insertMarkdown("![", "](image-url)", "alt")} className="px-2 py-1 text-xs rounded hover:bg-muted transition-colors" title="Image">🖼</button>
                    <div className="w-px h-4 bg-border mx-1" />
                    <button type="button" onClick={() => insertMarkdown("`", "`", "code")} className="px-2 py-1 text-xs font-mono rounded hover:bg-muted transition-colors" title="Inline Code">{"`<>`"}</button>
                    <button type="button" onClick={() => insertLine("```\n", "\n```")} className="px-2 py-1 text-xs font-mono rounded hover:bg-muted transition-colors" title="Code Block">{"<>"}</button>
                    <div className="w-px h-4 bg-border mx-1" />
                    <button type="button" onClick={() => insertLine("- ", "item")} className="px-2 py-1 text-xs rounded hover:bg-muted transition-colors" title="Unordered List">• List</button>
                    <button type="button" onClick={() => insertLine("1. ", "item")} className="px-2 py-1 text-xs rounded hover:bg-muted transition-colors" title="Ordered List">1. List</button>
                    <button type="button" onClick={() => insertLine("- [ ] ", "task")} className="px-2 py-1 text-xs rounded hover:bg-muted transition-colors" title="Task List">☑ Task</button>
                    <div className="w-px h-4 bg-border mx-1" />
                    <button type="button" onClick={() => insertLine("> ", "quote")} className="px-2 py-1 text-xs rounded hover:bg-muted transition-colors" title="Blockquote">&ldquo; Quote</button>
                    <button type="button" onClick={() => insertLine("---\n")} className="px-2 py-1 text-xs rounded hover:bg-muted transition-colors" title="Horizontal Rule">― Line</button>
                    <button type="button" onClick={() => insertLine("| Column A | Column B |\n| -------- | -------- |\n| Cell 1   | Cell 2   |\n")} className="px-2 py-1 text-xs rounded hover:bg-muted transition-colors" title="Table">⊞ Table</button>
                    <div className="w-px h-4 bg-border mx-1" />
                    <button type="button" onClick={formatMarkdown} className="px-2 py-1 text-xs rounded hover:bg-muted transition-colors text-primary font-medium" title="Format: clean up blank lines and whitespace">Format</button>
                  </div>
                  <textarea
                    ref={textareaRef}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    required
                    rows={20}
                    className="w-full bg-background px-3 py-2 text-sm font-mono placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-y border-0"
                  />
                </div>
              ) : (
                <div className="min-h-[480px] px-4 py-3 bg-background">
                  {content ? (
                    <MarkdownRenderer content={content} />
                  ) : (
                    <p className="text-sm text-muted-foreground italic">No content to preview</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : article ? "Update" : "Create"}
            </Button>
            <a href="/admin/articles" className={cn(buttonVariants({ variant: "outline" }))}>
              Cancel
            </a>
            {article && (
              <div className="ml-auto">
                <AlertDialog>
                  <AlertDialogTrigger render={<Button type="button" variant="destructive" />}>
                    Delete
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete this article?</AlertDialogTitle>
                      <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
