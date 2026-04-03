"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";

const statusConfig = {
  UNREAD: { label: "Unread", variant: "outline" as const },
  READING: { label: "Reading", variant: "secondary" as const },
  DONE: { label: "Done", variant: "default" as const },
};

const statusCycle = ["UNREAD", "READING", "DONE"] as const;

interface ProgressButtonProps {
  articleId: string;
  initialStatus: string;
}

export function ProgressButton({ articleId, initialStatus }: ProgressButtonProps) {
  const { data: session } = useSession();
  const [status, setStatus] = useState(initialStatus || "UNREAD");

  async function cycle() {
    if (!session) return;
    const currentIndex = statusCycle.indexOf(status as typeof statusCycle[number]);
    const nextStatus = statusCycle[(currentIndex + 1) % statusCycle.length];
    try {
      const res = await fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ articleId, status: nextStatus }),
      });
      if (res.ok) setStatus(nextStatus);
    } catch {
      // ignore network errors
    }
  }

  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.UNREAD;

  return (
    <Button
      variant={config.variant}
      size="sm"
      onClick={cycle}
      disabled={!session}
      className="w-full gap-1.5 active:scale-95 transition-all"
    >
      {config.label}
    </Button>
  );
}
