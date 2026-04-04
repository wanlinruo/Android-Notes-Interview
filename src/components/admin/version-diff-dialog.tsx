"use client";

import { useEffect, useState, useMemo } from "react";
import { diffLines } from "diff";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface VersionInfo {
  id: string;
  version: number;
  title: string;
  createdAt: string;
}

interface VersionDetail {
  id: string;
  version: number;
  title: string;
  content: string;
  summary: string | null;
  type: string;
  status: string;
  categoryId: string;
  tagIds: string[];
}

interface ArticleDetail {
  title: string;
  content: string;
  summary: string | null;
  type: string;
  status: string;
  categoryId: string;
  tags: { tag: { id: string } }[];
}

/** A row in the side-by-side view */
interface DiffRow {
  type: "added" | "removed" | "modified" | "unchanged";
  oldLine?: string;
  newLine?: string;
  oldNum?: number;
  newNum?: number;
}

/** A section: either a collapsed unchanged block or visible diff rows */
interface DiffSection {
  kind: "collapsed" | "visible";
  rows: DiffRow[];
}

const CONTEXT_LINES = 2; // lines of context around changes

function buildSideBySide(oldText: string, newText: string): DiffRow[] {
  const changes = diffLines(oldText, newText);
  const rows: DiffRow[] = [];
  let oldNum = 1;
  let newNum = 1;

  for (const change of changes) {
    const lines = change.value.replace(/\n$/, "").split("\n");

    if (change.added) {
      for (const line of lines) {
        rows.push({ type: "added", newLine: line, newNum: newNum++ });
      }
    } else if (change.removed) {
      for (const line of lines) {
        rows.push({ type: "removed", oldLine: line, oldNum: oldNum++ });
      }
    } else {
      for (const line of lines) {
        rows.push({ type: "unchanged", oldLine: line, newLine: line, oldNum: oldNum++, newNum: newNum++ });
      }
    }
  }

  return rows;
}

function buildSections(rows: DiffRow[]): DiffSection[] {
  // Mark which rows are "near" a change (within CONTEXT_LINES)
  const nearChange = new Array(rows.length).fill(false);
  for (let i = 0; i < rows.length; i++) {
    if (rows[i].type !== "unchanged") {
      for (let j = Math.max(0, i - CONTEXT_LINES); j <= Math.min(rows.length - 1, i + CONTEXT_LINES); j++) {
        nearChange[j] = true;
      }
    }
  }

  const sections: DiffSection[] = [];
  let i = 0;
  while (i < rows.length) {
    if (nearChange[i]) {
      // Visible section
      const visibleRows: DiffRow[] = [];
      while (i < rows.length && nearChange[i]) {
        visibleRows.push(rows[i]);
        i++;
      }
      sections.push({ kind: "visible", rows: visibleRows });
    } else {
      // Collapsed section
      const collapsedRows: DiffRow[] = [];
      while (i < rows.length && !nearChange[i]) {
        collapsedRows.push(rows[i]);
        i++;
      }
      sections.push({ kind: "collapsed", rows: collapsedRows });
    }
  }

  return sections;
}

function CollapsedBlock({ rows, onExpand }: { rows: DiffRow[]; onExpand: () => void }) {
  return (
    <div className="flex items-center justify-center bg-muted/30 border-y border-border py-1">
      <Button variant="ghost" size="xs" onClick={onExpand} className="text-[11px] text-muted-foreground">
        ··· {rows.length} unchanged lines (click to expand) ···
      </Button>
    </div>
  );
}

function SideBySideRow({ row }: { row: DiffRow }) {
  const leftBg =
    row.type === "removed"
      ? "bg-red-500/10"
      : row.type === "added"
        ? "bg-transparent"
        : "";
  const rightBg =
    row.type === "added"
      ? "bg-green-500/10"
      : row.type === "removed"
        ? "bg-transparent"
        : "";
  const leftText =
    row.type === "removed" ? "text-red-700 dark:text-red-300" : "text-foreground/80";
  const rightText =
    row.type === "added" ? "text-green-700 dark:text-green-300" : "text-foreground/80";

  return (
    <div className="flex font-mono text-xs leading-6 border-b border-border/30 last:border-0">
      {/* Left (old) */}
      <div className={`flex-1 flex min-w-0 ${leftBg}`}>
        <span className="w-8 flex-shrink-0 text-right pr-2 text-muted-foreground/40 select-none border-r border-border/20">
          {row.oldNum ?? ""}
        </span>
        <span className="w-5 flex-shrink-0 text-center text-muted-foreground/50 select-none">
          {row.type === "removed" ? "−" : " "}
        </span>
        <span className={`flex-1 pr-2 truncate ${leftText}`}>
          {row.oldLine ?? ""}
        </span>
      </div>

      {/* Divider */}
      <div className="w-px bg-border flex-shrink-0" />

      {/* Right (new) */}
      <div className={`flex-1 flex min-w-0 ${rightBg}`}>
        <span className="w-8 flex-shrink-0 text-right pr-2 text-muted-foreground/40 select-none border-r border-border/20">
          {row.newNum ?? ""}
        </span>
        <span className="w-5 flex-shrink-0 text-center text-muted-foreground/50 select-none">
          {row.type === "added" ? "+" : " "}
        </span>
        <span className={`flex-1 pr-2 truncate ${rightText}`}>
          {row.newLine ?? ""}
        </span>
      </div>
    </div>
  );
}

interface VersionDiffDialogProps {
  articleId: string;
  compareVersion: VersionInfo;
  onClose: () => void;
}

export function VersionDiffDialog({
  articleId,
  compareVersion,
  onClose,
}: VersionDiffDialogProps) {
  const [currentArticle, setCurrentArticle] = useState<ArticleDetail | null>(null);
  const [compareDetail, setCompareDetail] = useState<VersionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedSections, setExpandedSections] = useState<Set<number>>(new Set());

  useEffect(() => {
    Promise.all([
      fetch(`/api/articles/${articleId}`).then((r) => r.json()),
      fetch(`/api/articles/${articleId}/versions/${compareVersion.id}`).then((r) => r.json()),
    ]).then(([article, version]) => {
      setCurrentArticle(article);
      setCompareDetail(version);
      setLoading(false);
    });
  }, [articleId, compareVersion.id]);

  const { sections, addedCount, removedCount, metaChanges } = useMemo(() => {
    if (!currentArticle || !compareDetail) {
      return { sections: [], addedCount: 0, removedCount: 0, metaChanges: [] };
    }

    const rows = buildSideBySide(compareDetail.content, currentArticle.content);
    const secs = buildSections(rows);
    const added = rows.filter((r) => r.type === "added").length;
    const removed = rows.filter((r) => r.type === "removed").length;

    const meta: { field: string; old: string; new: string }[] = [];
    if (compareDetail.title !== currentArticle.title) {
      meta.push({ field: "Title", old: compareDetail.title, new: currentArticle.title });
    }
    if (compareDetail.status !== currentArticle.status) {
      meta.push({ field: "Status", old: compareDetail.status, new: currentArticle.status });
    }
    if (compareDetail.type !== currentArticle.type) {
      meta.push({ field: "Type", old: compareDetail.type, new: currentArticle.type });
    }
    if (compareDetail.categoryId !== currentArticle.categoryId) {
      meta.push({ field: "Category", old: compareDetail.categoryId, new: currentArticle.categoryId });
    }
    if (compareDetail.summary !== currentArticle.summary) {
      meta.push({
        field: "Summary",
        old: compareDetail.summary || "(empty)",
        new: currentArticle.summary || "(empty)",
      });
    }
    const oldTags = compareDetail.tagIds.sort().join(",");
    const newTags = currentArticle.tags.map((t) => t.tag.id).sort().join(",");
    if (oldTags !== newTags) {
      meta.push({
        field: "Tags",
        old: `${compareDetail.tagIds.length} tags`,
        new: `${currentArticle.tags.length} tags`,
      });
    }

    return { sections: secs, addedCount: added, removedCount: removed, metaChanges: meta };
  }, [currentArticle, compareDetail]);

  function toggleSection(index: number) {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  }

  if (loading || !currentArticle || !compareDetail) {
    return (
      <Dialog open onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="max-w-7xl sm:max-w-7xl">
          <div className="py-8 text-center text-sm text-muted-foreground">
            Loading diff...
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-7xl sm:max-w-7xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <span>v{compareDetail.version} → Current</span>
          </DialogTitle>
          <DialogDescription>
            <span className="flex items-center gap-4 mt-1">
              <span className="text-green-600 dark:text-green-400 text-xs font-medium">
                +{addedCount} added
              </span>
              <span className="text-red-600 dark:text-red-400 text-xs font-medium">
                −{removedCount} removed
              </span>
            </span>
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4">
          {/* Meta changes */}
          {metaChanges.length > 0 && (
            <div className="rounded-lg border border-border p-3 space-y-2">
              <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Field Changes
              </div>
              {metaChanges.map((change) => (
                <div key={change.field} className="flex items-center gap-2 text-sm">
                  <Badge variant="outline" className="text-[11px]">
                    {change.field}
                  </Badge>
                  <span className="text-red-600 dark:text-red-400 line-through">
                    {change.old}
                  </span>
                  <span className="text-muted-foreground">→</span>
                  <span className="text-green-600 dark:text-green-400">
                    {change.new}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Side-by-side diff */}
          <div className="rounded-lg border border-border overflow-hidden">
            {/* Header */}
            <div className="flex bg-muted/50 border-b border-border text-xs font-medium text-muted-foreground">
              <div className="flex-1 px-3 py-2">v{compareDetail.version}</div>
              <div className="w-px bg-border" />
              <div className="flex-1 px-3 py-2">Current</div>
            </div>

            {/* Diff rows */}
            <div className="overflow-x-auto">
              {sections.map((section, si) => {
                if (section.kind === "collapsed" && !expandedSections.has(si)) {
                  return (
                    <CollapsedBlock
                      key={si}
                      rows={section.rows}
                      onExpand={() => toggleSection(si)}
                    />
                  );
                }
                return (
                  <div key={si}>
                    {section.kind === "collapsed" && expandedSections.has(si) && (
                      <div className="flex items-center justify-center bg-muted/20 border-y border-border/50 py-0.5">
                        <Button
                          variant="ghost"
                          size="xs"
                          onClick={() => toggleSection(si)}
                          className="text-[10px] text-muted-foreground/60"
                        >
                          collapse
                        </Button>
                      </div>
                    )}
                    {section.rows.map((row, ri) => (
                      <SideBySideRow key={`${si}-${ri}`} row={row} />
                    ))}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
