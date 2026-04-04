"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { VersionDiffDialog } from "./version-diff-dialog";

interface VersionItem {
  id: string;
  version: number;
  title: string;
  createdAt: string;
}

interface VersionHistoryProps {
  articleId: string;
}

export function VersionHistory({ articleId }: VersionHistoryProps) {
  const router = useRouter();
  const [versions, setVersions] = useState<VersionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [diffVersion, setDiffVersion] = useState<VersionItem | null>(null);
  const [rollingBack, setRollingBack] = useState(false);

  useEffect(() => {
    fetch(`/api/articles/${articleId}/versions`)
      .then((res) => res.json())
      .then((data) => {
        setVersions(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [articleId]);

  async function handleRollback(versionId: string) {
    setRollingBack(true);
    const res = await fetch(
      `/api/articles/${articleId}/versions/${versionId}/rollback`,
      { method: "POST" }
    );
    setRollingBack(false);

    if (res.ok) {
      router.push("/admin/articles");
      router.refresh();
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-4 text-center text-sm text-muted-foreground">
          Loading versions...
        </CardContent>
      </Card>
    );
  }

  if (versions.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Version History</CardTitle>
        </CardHeader>
        <CardContent className="pt-0 text-sm text-muted-foreground">
          No edit history yet.
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center justify-between">
            <span>Version History</span>
            <Badge variant="secondary" className="text-[10px]">
              {versions.length}
            </Badge>
          </CardTitle>
        </CardHeader>

        <CardContent className="pt-0">
          <div className="space-y-1">
            {versions.map((v) => (
              <div
                key={v.id}
                className="rounded-lg p-2 transition-colors hover:bg-accent"
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded bg-muted text-[10px] font-bold text-muted-foreground">
                    {v.version}
                  </span>
                  <span className="text-xs font-medium truncate flex-1">
                    {v.title}
                  </span>
                </div>

                <div className="flex items-center justify-between pl-7">
                  <span className="text-[11px] text-muted-foreground">
                    {new Date(v.createdAt).toLocaleDateString()}{" "}
                    {new Date(v.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>

                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="xs"
                      onClick={() => setDiffVersion(v)}
                    >
                      Diff
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger
                        render={<Button variant="ghost" size="xs" />}
                      >
                        Revert
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Rollback to v{v.version}?
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            The current content will be automatically saved
                            as a new version before rolling back. This
                            action is reversible.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleRollback(v.id)}
                            disabled={rollingBack}
                          >
                            {rollingBack ? "Rolling back..." : "Confirm"}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {diffVersion && (
        <VersionDiffDialog
          articleId={articleId}
          compareVersion={diffVersion}
          onClose={() => setDiffVersion(null)}
        />
      )}
    </>
  );
}
