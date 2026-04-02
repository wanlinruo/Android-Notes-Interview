"use client";

import { useSession } from "next-auth/react";
import { useState } from "react";

const STATUS_MAP = {
  UNREAD: { label: "未读", next: "READING", icon: "\uD83D\uDCD6" },
  READING: { label: "在读", next: "DONE", icon: "\uD83D\uDCDA" },
  DONE: { label: "已完成", next: "UNREAD", icon: "\u2705" },
};

export function ProgressButton({
  articleId,
  initialStatus,
}: {
  articleId: string;
  initialStatus: string;
}) {
  const { data: session } = useSession();
  const [status, setStatus] = useState(initialStatus || "UNREAD");

  const current = STATUS_MAP[status as keyof typeof STATUS_MAP];

  async function cycle() {
    if (!session) return;

    const nextStatus = current.next;
    const res = await fetch("/api/progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ articleId, status: nextStatus }),
    });

    if (res.ok) setStatus(nextStatus);
  }

  return (
    <button
      onClick={cycle}
      disabled={!session}
      className="w-full text-sm py-1.5 rounded border border-gray-700 text-gray-400 hover:border-gray-500 transition-colors disabled:opacity-50"
    >
      {current.icon} {current.label}
    </button>
  );
}
