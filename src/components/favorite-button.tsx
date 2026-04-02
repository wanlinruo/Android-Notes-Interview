"use client";

import { useSession } from "next-auth/react";
import { useState } from "react";

export function FavoriteButton({
  articleId,
  initialFavorited,
  count,
}: {
  articleId: string;
  initialFavorited: boolean;
  count: number;
}) {
  const { data: session } = useSession();
  const [favorited, setFavorited] = useState(initialFavorited);
  const [favCount, setFavCount] = useState(count);

  async function toggle() {
    if (!session) return;

    const res = await fetch("/api/favorites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ articleId }),
    });

    const data = await res.json();
    setFavorited(data.favorited);
    setFavCount((c) => (data.favorited ? c + 1 : c - 1));
  }

  return (
    <button
      onClick={toggle}
      disabled={!session}
      className={`w-full text-sm py-1.5 rounded border transition-colors ${
        favorited
          ? "bg-yellow-500/20 border-yellow-500 text-yellow-500"
          : "border-gray-700 text-gray-400 hover:border-gray-500"
      } disabled:opacity-50`}
    >
      {favorited ? "\u2B50" : "\u2606"} 收藏 ({favCount})
    </button>
  );
}
